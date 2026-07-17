# RoleResolutionLib

A Layer 2 library for resolving abstract roles to concrete actors with full delegation chain support and communication routing.

**Layer:** Domain Logic (Layer 2)  
**Dependencies:** GoogleApiWrapper (for caching), CoreUtilsLib

## 🏗️ File and Folder Structure

Organized into specialized domains for actors, roles, and delegations:

```text
RoleResolutionLib/
├── src/
│   ├── core/               # Core Value Objects (Actor, Role, Scope, Assignment)
│   ├── resolution/         # The resolution engine (RoleResolver)
│   ├── delegation/         # Transitive delegation logic and chain validation
│   ├── routing/            # Communication routing based on policies
│   ├── registry/           # Registry for definitions and assignment/delegation sources
│   ├── errors/             # Custom exceptions for circular chains, missing roles, etc.
│   └── __tests__/          # Domain-logic unit tests
```

## 🧩 Programming Patterns

1.  **Chain of Responsibility Pattern**: `DelegationChain` manages the sequence of actors where a role is passed from one to another. It ensures correct traversal and detects cycles.
2.  **Strategy Pattern**: `RoutingPolicy` and `ResolutionStrategy` define interchangeable algorithms for how communications should be routed and how results are selected (First vs. All).
3.  **Registry Pattern**: `RoleRegistry` and its corresponding sources (AssignmentSource, DelegationSource) centralize definitions and allow for dynamic, data-driven lookups.
4.  **Value Object Pattern**: Actors, Scopes, and Roles are implemented as immutable value objects with specific equality and validation rules.
5.  **Data Source Interface (Dependency Inversion)**: The library defines interfaces for `AssignmentSource` and `DelegationSource`, allowing it to resolve roles from memory, SheetDB, or any other source without knowing the implementation.

## Overview

RoleResolutionLib provides a flexible, data-source-agnostic system for mapping abstract roles (like "Project Manager" or "Department Head") to concrete actors (people, systems, groups) with support for:

- **Scoped Assignments**: Roles can be assigned at different scopes (global, org-unit, project, resource)
- **Delegation Chains**: Support for A→B→C transitive delegations with cycle detection
- **Routing Policies**: 6 different routing strategies for communications when delegations are active
- **Resolution Strategies**: Find first match, all matches, or priority-ordered matches

## Installation

The library is part of the GasLibraryFactory monorepo and is bundled via Webpack:

```javascript
import { RoleResolver, Role, Actor, Scope, Delegation, RoutingPolicy } from '@RoleResolutionLib';
```

## Dependencies

- **GoogleApiWrapper** (Layer 2) - For cache, properties, and utilities

## Core Concepts

### Roles

A Role is an abstract concept that can be assigned to actors:

```javascript
const projectManager = new Role({
  id: 'project_manager',
  name: 'Project Manager',
  description: 'Manages project activities',
  fallbackRoles: ['department_head'] // Fallback if no PM assigned
});
```

### Actors

An Actor is a concrete entity that can fulfill a role:

```javascript
// Person actor
const john = Actor.person('john@example.com', { displayName: 'John Doe' });

// System actor
const automationBot = Actor.system('automation_bot', { description: 'CI/CD System' });

// Group actor
const reviewTeam = Actor.group('review_team', { members: ['alice', 'bob'] });
```

### Scopes

A Scope defines the context for role assignments:

```javascript
// Global scope
const global = Scope.global();

// Organization unit
const engineering = Scope.orgUnit('engineering');

// Project scope
const projectAlpha = Scope.project('project_alpha');

// Resource scope
const doc123 = Scope.resource('documents', 'doc_123');

// Custom scope
const customScope = Scope.custom('region', 'north_america');
```

### Assignments

An Assignment links a role to an actor within a scope:

```javascript
const assignment = new Assignment({
  roleId: 'project_manager',
  actorId: 'john@example.com',
  scope: Scope.project('project_alpha'),
  priority: 10,
  validFrom: new Date('2024-01-01'),
  validUntil: new Date('2024-12-31')
});
```

### Delegations

A Delegation allows one actor to delegate their roles to another:

```javascript
const delegation = new Delegation({
  principalId: 'john@example.com', // Delegating from
  delegateId: 'jane@example.com', // Delegating to
  roleIds: '*', // All roles (or ['project_manager'])
  scope: Scope.project('project_alpha'),
  validFrom: new Date('2024-06-01'),
  validUntil: new Date('2024-06-30'),
  routingPolicy: RoutingPolicy.BOTH_EQUAL
});
```

## Routing Policies

When a role has been delegated, how should communications be routed?

| Policy                 | Primary      | CC           | Description                      |
| ---------------------- | ------------ | ------------ | -------------------------------- |
| `DELEGATE_ONLY`        | Delegate     | -            | Only delegate receives           |
| `PRINCIPAL_ONLY`       | Principal    | -            | Only original holder receives    |
| `BOTH_EQUAL`           | Both         | -            | Both receive as primary          |
| `DELEGATE_PRIMARY_CC`  | Delegate     | Principal    | Delegate primary, principal CC'd |
| `PRINCIPAL_PRIMARY_CC` | Principal    | Delegate     | Principal primary, delegate CC'd |
| `CHAIN_ALL`            | End of chain | All in chain | All actors in delegation chain   |

## Resolution Strategies

- `FIRST` - Return only the first matching assignment
- `ALL` - Return all matching assignments
- `PRIORITY` - Return assignments ordered by priority

## Usage

### Basic Resolution

```javascript
import {
  RoleResolver,
  Role,
  Actor,
  Scope,
  Assignment,
  RoleRegistry,
  InMemoryAssignmentSource,
  InMemoryDelegationSource
} from '@RoleResolutionLib';

// Setup role registry
const roleRegistry = new RoleRegistry();
roleRegistry.register(
  new Role({
    id: 'project_manager',
    name: 'Project Manager'
  })
);

// Setup assignment source
const assignmentSource = new InMemoryAssignmentSource();
assignmentSource.add(
  new Assignment({
    roleId: 'project_manager',
    actorId: 'john@example.com',
    scope: Scope.project('alpha')
  })
);

// Create resolver
const resolver = new RoleResolver({
  roleRegistry,
  assignmentSource,
  delegationSource: new InMemoryDelegationSource()
});

// Resolve role
const result = resolver.resolve('project_manager', Scope.project('alpha'));

console.log(result.actors); // [Actor { id: 'john@example.com' }]
console.log(result.routing.primary); // ['john@example.com']
```

### Resolution with Delegations

```javascript
// John delegates to Jane for June
delegationSource.add(
  new Delegation({
    principalId: 'john@example.com',
    delegateId: 'jane@example.com',
    roleIds: '*',
    scope: Scope.project('alpha'),
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-06-30'),
    routingPolicy: RoutingPolicy.DELEGATE_PRIMARY_CC
  })
);

// Resolve in June
const juneResult = resolver.resolve('project_manager', Scope.project('alpha'), {
  asOfDate: new Date('2024-06-15')
});

console.log(juneResult.routing.primary); // ['jane@example.com']
console.log(juneResult.routing.cc); // ['john@example.com']
```

### Fallback Roles

```javascript
// Role with fallback
roleRegistry.register(
  new Role({
    id: 'tech_lead',
    name: 'Tech Lead',
    fallbackRoles: ['engineering_manager', 'cto']
  })
);

// No tech lead assigned
const result = resolver.resolve('tech_lead', Scope.project('alpha'), {
  useFallbacks: true
});

// Falls back to engineering_manager if tech_lead not assigned
```

### Chained Delegations

```javascript
// A → B → C delegation chain
delegationSource.add(
  new Delegation({
    principalId: 'alice@example.com',
    delegateId: 'bob@example.com',
    roleIds: '*',
    routingPolicy: RoutingPolicy.CHAIN_ALL
  })
);

delegationSource.add(
  new Delegation({
    principalId: 'bob@example.com',
    delegateId: 'charlie@example.com',
    roleIds: '*',
    routingPolicy: RoutingPolicy.CHAIN_ALL
  })
);

// Result with CHAIN_ALL routes to entire chain
const result = resolver.resolve('approver', Scope.global());
// routing.primary: ['charlie@example.com']
// routing.cc: ['alice@example.com', 'bob@example.com']
```

## Custom Data Sources

Implement the `AssignmentSource` and `DelegationSource` interfaces to connect to your data:

```javascript
class SheetDBAssignmentSource {
  constructor(db) {
    this._db = db;
  }

  findAssignments(roleId, scope, options = {}) {
    const { asOfDate = new Date() } = options;

    return this._db
      .select()
      .from('RoleAssignments')
      .where('role_id', '=', roleId)
      .where('scope_type', '=', scope.type)
      .where('scope_value', '=', scope.value)
      .execute()
      .filter((row) => {
        const validFrom = row.valid_from ? new Date(row.valid_from) : null;
        const validUntil = row.valid_until ? new Date(row.valid_until) : null;
        return (!validFrom || validFrom <= asOfDate) && (!validUntil || validUntil >= asOfDate);
      })
      .map(
        (row) =>
          new Assignment({
            roleId: row.role_id,
            actorId: row.actor_id,
            scope: new Scope(row.scope_type, row.scope_value),
            priority: row.priority
          })
      );
  }
}
```

## Error Handling

```javascript
import {
  RoleNotFoundError,
  NoActorFoundError,
  CircularDelegationError,
  InvalidScopeError
} from '@RoleResolutionLib';

try {
  const result = resolver.resolve('unknown_role', Scope.global());
} catch (error) {
  if (error instanceof RoleNotFoundError) {
    console.log(`Role not found: ${error.roleId}`);
  } else if (error instanceof NoActorFoundError) {
    console.log(`No actor assigned for role ${error.roleId}`);
  } else if (error instanceof CircularDelegationError) {
    console.log(`Circular delegation detected: ${error.chain.join(' → ')}`);
  }
}
```

## API Reference

### Classes

| Class                 | Description                                |
| --------------------- | ------------------------------------------ |
| `RoleResolver`        | Main resolution engine                     |
| `Role`                | Role definition value object               |
| `Actor`               | Actor value object (person, system, group) |
| `Scope`               | Scope value object                         |
| `Assignment`          | Role-to-actor assignment                   |
| `Delegation`          | Delegation configuration                   |
| `DelegationChain`     | Chain of delegations                       |
| `DelegationValidator` | Validates delegations                      |
| `RoleRegistry`        | Registry of role definitions               |
| `RoutingResolver`     | Resolves routing based on delegation chain |

### Enums

| Enum                 | Values                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `ScopeType`          | GLOBAL, ORG_UNIT, PROJECT, RESOURCE, CUSTOM                                                     |
| `ActorType`          | PERSON, SYSTEM, GROUP                                                                           |
| `RoutingPolicy`      | DELEGATE_ONLY, PRINCIPAL_ONLY, BOTH_EQUAL, DELEGATE_PRIMARY_CC, PRINCIPAL_PRIMARY_CC, CHAIN_ALL |
| `ResolutionStrategy` | FIRST, ALL, PRIORITY                                                                            |

### Interfaces

| Interface          | Methods                                            |
| ------------------ | -------------------------------------------------- |
| `AssignmentSource` | `findAssignments(roleId, scope, options)`          |
| `DelegationSource` | `findDelegations(actorId, roleId, scope, options)` |

## Version

1.0.0

## License

MIT
