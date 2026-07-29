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
3.  **Registry Pattern**: `RoleRegistry` and effective-assignment sources centralize definitions and allow for dynamic, data-driven lookups.
4.  **Value Object Pattern**: Actors, Scopes, and Roles are implemented as immutable value objects with specific equality and validation rules.
5.  **Data Source Interface (Dependency Inversion)**: `AssignmentSource` is the legacy `RoleResolver` contract; the effective-assignment API defines the distinct `EffectiveAssignmentSource`, `OverrideSource`, and `ActorSource` contracts for SheetDB or any other persistence.

## Overview

RoleResolutionLib provides a flexible, data-source-agnostic system for mapping abstract roles (like "Project Manager" or "Department Head") to concrete actors (people, systems, groups) with support for:

- **Scoped Assignments**: Roles can be assigned at different scopes (global, org-unit, project, resource)
- **Delegation Chains**: Support for A→B→C transitive delegations with cycle detection
- **Routing Policies**: 7 routing strategies for communications when delegations are active
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

| Policy                          | Primary                       | CC           | Description                      |
| ------------------------------- | ----------------------------- | ------------ | -------------------------------- |
| `DELEGATE_ONLY`                 | Delegate                      | -            | Only delegate receives           |
| `PRINCIPAL_ONLY`                | Principal                     | -            | Only original holder receives    |
| `BOTH_EQUAL`                    | Both                          | -            | Both receive as primary          |
| `DELEGATE_PRIMARY_PRINCIPAL_CC` | Delegate                      | Principal    | Delegate primary, principal CC'd |
| `PRINCIPAL_PRIMARY_DELEGATE_CC` | Principal                     | Delegate     | Principal primary, delegate CC'd |
| `CHAIN_ALL`                     | End of chain                  | All in chain | All actors in delegation chain   |
| `DELEGATE_OR_PRINCIPAL`         | Delegate, otherwise principal | -            | Single resolved recipient        |

## Resolution Strategies

- `FIRST` - Return only the first matching assignment
- `ALL` - Return all matching assignments
- `PRIORITY` - Return assignments ordered by priority

## Usage

### Basic Resolution

```javascript
import { Actor, WideRowAssignmentSource, EffectiveAssignmentResolver } from '@RoleResolutionLib';

const actors = {
  'john@example.com': Actor.person('john', 'john@example.com', 'John Doe')
};

// Map a domain-specific row into an opaque effective-assignment candidate.
const assignmentSource = new WideRowAssignmentSource({
  rows: [{ id: 'alpha', manager: 'john@example.com' }],
  rowIdentityPath: 'id',
  columns: [
    {
      name: 'manager',
      slotDimensions: { role: 'project_manager' },
      contextDimensions: { project: { from: 'id' } }
    }
  ]
});

const resolver = new EffectiveAssignmentResolver({
  actorSource: { getActor: (id) => actors[id] || null },
  assignmentSource,
  overrideSource: { getOverrides: () => [] },
  delegationSource: { getDelegations: () => [] }
});

const [result] = resolver.resolve({
  context: { project: 'alpha' },
  asOfDate: new Date('2026-01-10')
});

console.log(result.effectiveActor.displayName); // John Doe
console.log(result.slot.get('role')); // project_manager
```

## Custom Effective-Assignment Sources

Implement the breaking public contracts used by `EffectiveAssignmentResolver`:
`EffectiveAssignmentSource.getAssignments(context, asOfDate)`,
`OverrideSource.getOverrides(context, asOfDate)`, and
`ActorSource.getActor(actorId)`. The generic row adapters avoid a custom source
for most SheetDB-shaped data.

```javascript
import { AssignmentCandidate, AssignmentSlot } from '@RoleResolutionLib';

class SheetDBAssignmentSource {
  constructor(db) {
    this._db = db;
  }

  getAssignments(context, asOfDate) {
    return this._db
      .select()
      .from('RoleAssignments')
      .where('project_id', '=', context.project)
      .execute()
      .map(
        (row) =>
          new AssignmentCandidate({
            id: row.id,
            actorId: row.actor_id,
            slot: new AssignmentSlot({ dimensions: { role: row.role_id } }),
            validFrom: row.valid_from || null,
            validTo: row.valid_until || null,
            metadata: { project: context.project, requestedAt: asOfDate.toISOString() }
          })
      );
  }
}
```

## Error Handling

```javascript
import {
  AssignmentActorNotFoundError,
  CircularDelegationError,
  AmbiguousAssignmentOverrideError
} from '@RoleResolutionLib';

try {
  const results = resolver.resolve({
    context: { project: 'alpha' },
    asOfDate: new Date('2026-01-10')
  });
} catch (error) {
  if (error instanceof AssignmentActorNotFoundError) {
    console.log(`Assignment actor not found: ${error.actorId}`);
  } else if (error instanceof CircularDelegationError) {
    console.log('Circular delegation detected');
  } else if (error instanceof AmbiguousAssignmentOverrideError) {
    console.log('Tied latest overrides are ambiguous');
  }
}
```

## API Reference

### Classes

| Class                         | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `RoleResolver`                | Main resolution engine                                         |
| `Role`                        | Role definition value object                                   |
| `Actor`                       | Actor value object (person, system, group)                     |
| `Scope`                       | Scope value object                                             |
| `Assignment`                  | Role-to-actor assignment                                       |
| `Delegation`                  | Delegation configuration                                       |
| `DelegationChain`             | Chain of delegations                                           |
| `DelegationValidator`         | Validates delegations                                          |
| `RoleRegistry`                | Registry of role definitions                                   |
| `RoutingResolver`             | Resolves routing based on delegation chain                     |
| `AssignmentSlot`              | Immutable opaque dimensions identifying a slot                 |
| `AssignmentCandidate`         | Dated base assignment candidate                                |
| `AssignmentOverride`          | Dated actor replacement scoped by opaque dimensions            |
| `EffectiveAssignmentResolver` | Resolves candidates through overrides, delegation, and routing |
| `EffectiveAssignmentResult`   | Immutable resolved assignment outcome                          |
| `WideRowAssignmentSource`     | Maps wide rows to opaque assignment candidates                 |

### Enums

| Enum                 | Values                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ScopeType`          | GLOBAL, ORG_UNIT, PROJECT, RESOURCE, CUSTOM                                                                                               |
| `ActorType`          | PERSON, SYSTEM, GROUP                                                                                                                     |
| `RoutingPolicy`      | DELEGATE_ONLY, PRINCIPAL_ONLY, BOTH_EQUAL, DELEGATE_PRIMARY_PRINCIPAL_CC, PRINCIPAL_PRIMARY_DELEGATE_CC, CHAIN_ALL, DELEGATE_OR_PRINCIPAL |
| `ResolutionStrategy` | FIRST, ALL, PRIORITY                                                                                                                      |

### Interfaces

| Interface                   | Methods                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `AssignmentSource`          | `getAssignmentsForRole(roleId, scope, asOfDate)`, `getAssignmentsForActor(actorId, asOfDate)`, `getActorById(actorId)` |
| `EffectiveAssignmentSource` | `getAssignments(context, asOfDate)`                                                                                    |
| `OverrideSource`            | `getOverrides(context, asOfDate)`                                                                                      |
| `ActorSource`               | `getActor(actorId)`                                                                                                    |

### Effective assignment API

`EffectiveAssignmentResolver` resolves generic `AssignmentCandidate` values through
dated overrides, delegations, and routing. `AssignmentSlot` dimensions are opaque:
the library only preserves and matches their key/value identity, so applications may
use any domain-specific dimensions without introducing a new resolver type.

`WideRowAssignmentSource` maps tabular rows into those candidates; applications pass
an `ActorSource`, `OverrideSource`, and delegation source to the resolver rather than
depending on a fixed school or organization schema.

`ResolutionPolicy` controls resolver edge cases. `tieBehavior: 'THROW'` rejects
tied latest overrides while `'FIRST'` selects the first source-ordered finalist.
`missingActorBehavior: 'NULL'` retains the result with null actor fields and empty
routing buckets. `resultIdentity` deduplicates the deterministic resolved result
stream; the aliases `slot` and `principalActor` mean the slot key and permanent
actor id, and dotted result paths are also supported.

## Version

1.0.0

## License

MIT
