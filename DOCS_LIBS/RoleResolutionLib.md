# API Reference: RoleResolutionLib

## CLASS: RoleRegistry
**File Path:** `RoleResolutionLib/src/registry/RoleRegistry.js`
**Constructor Usage:** `const instance = new RoleRegistry();`
**Description:** Registry for role definitions.

/

import { Role } from '../core/Role.js';
import { RoleNotFoundError, RoleValidationError } from '../internal/errors/RoleResolutionError.js';
import { cloneDeep, Registry } from '@CoreUtilsLib';

/**
@class RoleRegistry
Centralized CRUD store for Role definitions. Handles validation and indexing.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/registry/RoleRegistry.js
 * @description Registry for role definitions.
 * @version 1.0.0
 */

import { Role } from '../core/Role.js';
import { RoleNotFoundError, RoleValidationError } from '../internal/errors/RoleResolutionError.js';
import { cloneDeep, Registry } from '@CoreUtilsLib';

/**
 * @class RoleRegistry
 * @description Centralized CRUD store for Role definitions. Handles validation and indexing.
 */
```

### Methods of RoleRegistry

#### METHOD: RoleRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.register(roleOrDefinition);`
- **Pure JSDoc:**
```javascript
/** @type {Object} @private */
    this._logger = options.logger || console;

    /** @type {Map<string, Role>} @private */
    this._roles = new Registry({ entityName: 'role' });

    // Register initial roles
    if (Array.isArray(options.initialRoles)) {
      options.initialRoles.forEach((role) => this.register(role));
    }
  }

  /**
   * @function register
   * @description Validates and persists a role. Overwrites existing IDs with a warning.
   * @param {Role|Object} roleOrDefinition - Role instance or raw definition POJO.
   * @returns {Role} The indexed Role instance.
   * @throws {RoleValidationError} If definition violates Role schema.
   */
```
---
#### METHOD: RoleRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.if(roleOrDefinition instanceof Role);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleRegistry.catch
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: RoleRegistry.registerAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.registerAll(roles);`
- **Pure JSDoc:**
```javascript
/**
   * @function registerAll
   * @param {(Role|Object)[]} roles - Set of definitions.
   * @returns {Role[]} Indexed instances.
   * @throws {Error} If roles is not an array.
   */
```
---
#### METHOD: RoleRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.if(!role);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleRegistry.getOrNull
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.getOrNull(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function getOrNull
   * @param {string} roleId - Unique ID.
   * @returns {Role|null}
   */
```
---
#### METHOD: RoleRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.has(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function has
   * @param {string} roleId - Unique ID.
   * @returns {boolean}
   */
```
---
#### METHOD: RoleRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.unregister(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function unregister
   * @param {string} roleId - ID to purge.
   * @returns {boolean} True if found and deleted.
   */
```
---
#### METHOD: RoleRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.if(removed);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleRegistry.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.getAll();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAll
   * @returns {Role[]} Complete set.
   */
```
---
#### METHOD: RoleRegistry.getAllIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.getAllIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllIds
   * @returns {string[]} Keys only.
   */
```
---
#### METHOD: RoleRegistry.size
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.size();`
- **Pure JSDoc:**
```javascript
/**
   * @function size
   * @returns {number}
   */
```
---
#### METHOD: RoleRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all registrations.
   */
```
---
#### METHOD: RoleRegistry.find
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.find(predicate);`
- **Pure JSDoc:**
```javascript
/**
   * @function find
   * @param {Function} predicate - Boolean filter.
   * @returns {Role[]}
   */
```
---
#### METHOD: RoleRegistry.findByScopeType
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.findByScopeType(scopeType);`
- **Pure JSDoc:**
```javascript
/**
   * @function findByScopeType
   * @param {string} scopeType - Enum filter.
   * @returns {Role[]}
   */
```
---
#### METHOD: RoleRegistry.findDelegatable
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.findDelegatable();`
- **Pure JSDoc:**
```javascript
/**
   * @function findDelegatable
   * @returns {Role[]} Roles with allowsDelegation: true.
   */
```
---
#### METHOD: RoleRegistry.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleRegistry.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes indexed roles to mapped POJO.
   * @returns {Object} {roles: Object.<string, Object>}
   */
```
---
#### METHOD: RoleRegistry.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = RoleRegistry.fromJSON(obj, options);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory to hydrate a RoleRegistry from POJO.
   * @param {Object} obj - Serialized data.
   * @param {Object} [options={}] - New registry options.
   * @returns {RoleRegistry}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: RoleRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.if(obj.roles);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: WideRowAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.js`
**Constructor Usage:** `const instance = new WideRowAssignmentSource();`
**Description:** Maps wide, tabular rows to opaque assignment candidates.

### Raw JSDoc Context:
```javascript
/** Maps wide, tabular rows to opaque assignment candidates. */
```

### Methods of WideRowAssignmentSource

#### METHOD: WideRowAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `wideRowAssignmentSource.getAssignments(context, _asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getAssignments */
```
---
<br>

## CLASS: MappedOverrideSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.js`
**Constructor Usage:** `const instance = new MappedOverrideSource();`
**Description:** Maps generic rows to dated, opaque assignment overrides.

### Raw JSDoc Context:
```javascript
/** Maps generic rows to dated, opaque assignment overrides. */
```

### Methods of MappedOverrideSource

#### METHOD: MappedOverrideSource.getOverrides
- **Scope:** instance
- **LLM Call Syntax:** `mappedOverrideSource.getOverrides(context, _asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getOverrides */
```
---
<br>

## CLASS: MappedDelegationSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.js`
**Constructor Usage:** `const instance = new MappedDelegationSource();`
**Description:** Maps generic rows to context-scoped delegation values.

### Raw JSDoc Context:
```javascript
/** Maps generic rows to context-scoped delegation values. */
```

### Methods of MappedDelegationSource

#### METHOD: MappedDelegationSource.getDelegations
- **Scope:** instance
- **LLM Call Syntax:** `mappedDelegationSource.getDelegations(context, asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getDelegations */
```
---
<br>

## CLASS: CompositeAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.js`
**Constructor Usage:** `const instance = new CompositeAssignmentSource();`
**Description:** Combines independent candidate sources with a deterministic identity.

### Raw JSDoc Context:
```javascript
/** Combines independent candidate sources with a deterministic identity. */
```

### Methods of CompositeAssignmentSource

#### METHOD: CompositeAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `compositeAssignmentSource.getAssignments(context, asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getAssignments */
```
---
#### METHOD: CompositeAssignmentSource.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeAssignmentSource.if(!existing);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: EffectiveAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.js`
**Constructor Usage:** `const instance = new EffectiveAssignmentSource();`
**Description:** Generic persistence contracts for effective-assignment resolution.

### Raw JSDoc Context:
```javascript
/** Generic persistence contracts for effective-assignment resolution. */
```

### Methods of EffectiveAssignmentSource

#### METHOD: EffectiveAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentSource.getAssignments(_context, _asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getAssignments */
```
---
<br>

## CLASS: OverrideSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.js`
**Constructor Usage:** `const instance = new OverrideSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of OverrideSource

#### METHOD: OverrideSource.getOverrides
- **Scope:** instance
- **LLM Call Syntax:** `overrideSource.getOverrides(_context, _asOfDate);`
- **Pure JSDoc:**
```javascript
/** Method getOverrides */
```
---
<br>

## CLASS: ActorSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.js`
**Constructor Usage:** `const instance = new ActorSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ActorSource

#### METHOD: ActorSource.getActor
- **Scope:** instance
- **LLM Call Syntax:** `actorSource.getActor(_actorId);`
- **Pure JSDoc:**
```javascript
/** Method getActor */
```
---
<br>

## CLASS: DelegationSource
**File Path:** `RoleResolutionLib/src/registry/DelegationSource.js`
**Constructor Usage:** `const instance = new DelegationSource();`
**Description:** Interface definition for delegation data sources.

/

/**
@interface DelegationSource
Contract for persistence layers providing active responsibility transfers.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/registry/DelegationSource.js
 * @description Interface definition for delegation data sources.
 * @version 1.0.0
 */

/**
 * @interface DelegationSource
 * @description Contract for persistence layers providing active responsibility transfers.
 */
```

<br>

## CLASS: InMemoryDelegationSource
**File Path:** `RoleResolutionLib/src/registry/DelegationSource.js`
**Constructor Usage:** `const instance = new InMemoryDelegationSource();`
**Description:** @function getActiveDelegationsForPrincipal
Retrieves delegations issued by an actor that are valid at a specific time.
@param {string} principalId - Issuing actor ID.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Delegation[]}
@abstract
/
  getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForPrincipal() must be implemented');
  }

  /**
@function getActiveDelegationsForDelegate
Retrieves delegations received by an actor.
@param {string} delegateId - Receiving actor ID.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Delegation[]}
@abstract
/
  getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForDelegate() must be implemented');
  }

  /**
@function getDelegationChain
Resolves transitive delegation paths (A -> B -> C) for a role/scope context.
@param {string} actorId - Starting principal ID.
@param {string} roleId - Role context for filtering.
@param {Scope} scope - Scope context for filtering.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Delegation[]} Ordered array from nearest to farthest delegate.
@abstract
/
  getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) {
    throw new Error('DelegationSource.getDelegationChain() must be implemented');
  }
}

/**
@class InMemoryDelegationSource
@extends DelegationSource
Non-persistent implementation using arrays for delegation storage.

### Raw JSDoc Context:
```javascript
/**
   * @function getActiveDelegationsForPrincipal
   * @description Retrieves delegations issued by an actor that are valid at a specific time.
   * @param {string} principalId - Issuing actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]}
   * @abstract
   */
  getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForPrincipal() must be implemented');
  }

  /**
   * @function getActiveDelegationsForDelegate
   * @description Retrieves delegations received by an actor.
   * @param {string} delegateId - Receiving actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]}
   * @abstract
   */
  getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForDelegate() must be implemented');
  }

  /**
   * @function getDelegationChain
   * @description Resolves transitive delegation paths (A -> B -> C) for a role/scope context.
   * @param {string} actorId - Starting principal ID.
   * @param {string} roleId - Role context for filtering.
   * @param {Scope} scope - Scope context for filtering.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]} Ordered array from nearest to farthest delegate.
   * @abstract
   */
  getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) {
    throw new Error('DelegationSource.getDelegationChain() must be implemented');
  }
}

/**
 * @class InMemoryDelegationSource
 * @extends DelegationSource
 * @description Non-persistent implementation using arrays for delegation storage.
 */
```

### Methods of InMemoryDelegationSource

#### METHOD: InMemoryDelegationSource.addDelegation
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.addDelegation(delegation);`
- **Pure JSDoc:**
```javascript
/** @type {Delegation[]} @private */
    this._delegations = data.delegations || [];
  }

  /**
   * @function addDelegation
   * @param {Delegation} delegation - Record to append.
   */
```
---
#### METHOD: InMemoryDelegationSource.getAllDelegations
- **Scope:** instance
- **LLM Call Syntax:** `const result = inMemoryDelegationSource.getAllDelegations(principalId, asOfDate, delegateId, asOfDate, actorId, roleId, scope, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function getActiveDelegationsForPrincipal
   * @param {string} principalId - Issuer ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
  getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
    return this._delegations.filter(
      (delegation) => delegation.principalId === principalId && delegation.isValidAt(asOfDate)
    );
  }

  /**
   * @function getActiveDelegationsForDelegate
   * @param {string} delegateId - Receiver ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
  getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) {
    return this._delegations.filter(
      (delegation) => delegation.delegateId === delegateId && delegation.isValidAt(asOfDate)
    );
  }

  /**
   * @function getDelegationChain
   * @description Synchronously crawls the delegation graph to build a linear chain for a specific context.
   * @param {string} actorId - Start ID.
   * @param {string} roleId - Role filter.
   * @param {Scope} scope - Scope filter.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]} Ordered transitive chain.
   */
  getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) {
    const chain = [];
    const visited = new Set();
    let currentActorId = actorId;

    while (currentActorId && !visited.has(currentActorId)) {
      visited.add(currentActorId);

      // Find delegations from this actor
      const delegations = this.getActiveDelegationsForPrincipal(currentActorId, asOfDate);

      // Find a delegation that applies to the role and scope
      const applicableDelegation = delegations.find(
        (delegation) => delegation.appliesToRole(roleId) && delegation.appliesToScope(scope)
      );

      if (applicableDelegation) {
        chain.push(applicableDelegation);
        currentActorId = applicableDelegation.delegateId;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * @function getAllDelegations
   * @returns {Delegation[]} Complete set.
   */
```
---
#### METHOD: InMemoryDelegationSource.clear
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all internal delegations.
   */
```
---
<br>

## CLASS: AssignmentSource
**File Path:** `RoleResolutionLib/src/registry/AssignmentSource.js`
**Constructor Usage:** `const instance = new AssignmentSource();`
**Description:** Interface definition for assignment data sources.

/

/**
@interface AssignmentSource
Contract for persistence layers providing role assignments and actor metadata.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/registry/AssignmentSource.js
 * @description Interface definition for assignment data sources.
 * @version 1.0.0
 */

/**
 * @interface AssignmentSource
 * @description Contract for persistence layers providing role assignments and actor metadata.
 */
```

### Methods of AssignmentSource

#### METHOD: AssignmentSource.getActorById
- **Scope:** instance
- **LLM Call Syntax:** `const result = assignmentSource.getActorById(roleId, scope, asOfDate, actorId, asOfDate, actorId);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAssignmentsForRole
   * @description Fetches active assignments for a role within a scope at a given time.
   * @param {string} roleId - Role to query.
   * @param {Scope} scope - Context boundary.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForRole() must be implemented');
  }

  /**
   * @function getAssignmentsForActor
   * @description Retrieves all roles currently held by a specific actor.
   * @param {string} actorId - Target actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForActor() must be implemented');
  }

  /**
   * @function getActorById
   * @description Resolves actor metadata (type, identifier, displayName) by unique ID.
   * @param {string} actorId - ID to resolve.
   * @returns {Actor|null}
   * @abstract
   */
```
---
<br>

## CLASS: InMemoryAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/AssignmentSource.js`
**Constructor Usage:** `const instance = new InMemoryAssignmentSource();`
**Description:** @function getAssignmentsForRole
Fetches active assignments for a role within a scope at a given time.
@param {string} roleId - Role to query.
@param {Scope} scope - Context boundary.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Assignment[]}
@abstract
/
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForRole() must be implemented');
  }

  /**
@function getAssignmentsForActor
Retrieves all roles currently held by a specific actor.
@param {string} actorId - Target actor ID.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Assignment[]}
@abstract
/
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForActor() must be implemented');
  }

  /**
@function getActorById
Resolves actor metadata (type, identifier, displayName) by unique ID.
@param {string} actorId - ID to resolve.
@returns {Actor|null}
@abstract
/
  getActorById(actorId) {
    throw new Error('AssignmentSource.getActorById() must be implemented');
  }
}

/**
@class InMemoryAssignmentSource
@extends AssignmentSource
Non-persistent implementation using arrays/maps for assignment storage.

### Raw JSDoc Context:
```javascript
/**
   * @function getAssignmentsForRole
   * @description Fetches active assignments for a role within a scope at a given time.
   * @param {string} roleId - Role to query.
   * @param {Scope} scope - Context boundary.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForRole() must be implemented');
  }

  /**
   * @function getAssignmentsForActor
   * @description Retrieves all roles currently held by a specific actor.
   * @param {string} actorId - Target actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForActor() must be implemented');
  }

  /**
   * @function getActorById
   * @description Resolves actor metadata (type, identifier, displayName) by unique ID.
   * @param {string} actorId - ID to resolve.
   * @returns {Actor|null}
   * @abstract
   */
  getActorById(actorId) {
    throw new Error('AssignmentSource.getActorById() must be implemented');
  }
}

/**
 * @class InMemoryAssignmentSource
 * @extends AssignmentSource
 * @description Non-persistent implementation using arrays/maps for assignment storage.
 */
```

### Methods of InMemoryAssignmentSource

#### METHOD: InMemoryAssignmentSource.addAssignment
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.addAssignment(assignment);`
- **Pure JSDoc:**
```javascript
/** @type {Assignment[]} @private */
    this._assignments = data.assignments || [];

    /** @type {Map<string, Actor>} @private */
    this._actors = new Map();

    // Index actors
    if (Array.isArray(data.actors)) {
      data.actors.forEach((actor) => {
        this._actors.set(actor.id, actor);
      });
    }
  }

  /**
   * @function addAssignment
   * @param {Assignment} assignment - Record to append.
   */
```
---
#### METHOD: InMemoryAssignmentSource.addActor
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.addActor(actor);`
- **Pure JSDoc:**
```javascript
/**
   * @function addActor
   * @param {Actor} actor - Entity to register.
   */
```
---
#### METHOD: InMemoryAssignmentSource.getActorById
- **Scope:** instance
- **LLM Call Syntax:** `const result = inMemoryAssignmentSource.getActorById(roleId, scope, asOfDate, actorId, asOfDate, actorId);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAssignmentsForRole
   * @description Performs filter-based lookup on internal array.
   * @param {string} roleId - Role to match.
   * @param {Scope} scope - Scope to match or contain.
   * @param {Date} [asOfDate=new Date()] - Validity check.
   * @returns {Assignment[]}
   */
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    return this._assignments.filter((assignment) => assignment.matches(roleId, scope, asOfDate));
  }

  /**
   * @function getAssignmentsForActor
   * @description Performs ID-based filtering on internal assignments.
   * @param {string} actorId - Actor to match.
   * @param {Date} [asOfDate=new Date()] - Validity check.
   * @returns {Assignment[]}
   */
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    return this._assignments.filter(
      (assignment) => assignment.actorId === actorId && assignment.isValidAt(asOfDate)
    );
  }

  /**
   * @function getActorById
   * @param {string} actorId - Entity ID.
   * @returns {Actor|null}
   */
```
---
#### METHOD: InMemoryAssignmentSource.getAllAssignments
- **Scope:** instance
- **LLM Call Syntax:** `const result = inMemoryAssignmentSource.getAllAssignments();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllAssignments
   * @returns {Assignment[]} Complete set.
   */
```
---
#### METHOD: InMemoryAssignmentSource.getAllActors
- **Scope:** instance
- **LLM Call Syntax:** `const result = inMemoryAssignmentSource.getAllActors();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActors
   * @returns {Actor[]} Complete set.
   */
```
---
#### METHOD: InMemoryAssignmentSource.clear
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all internal state.
   */
```
---
<br>

## CLASS: RoutingResult
**File Path:** `RoleResolutionLib/src/internal/routing/RoutingResult.js`
**Constructor Usage:** `const instance = new RoutingResult();`
**Description:** RoutingResult representing the routing decision for communications.

/

import { cloneDeep } from '@CoreUtilsLib';

/**
@class RoutingResult
Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/routing/RoutingResult.js
 * @description RoutingResult representing the routing decision for communications.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class RoutingResult
 * @description Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).
 */
```

### Methods of RoutingResult

#### METHOD: RoutingResult.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = RoutingResult.empty();`
- **Pure JSDoc:**
```javascript
/** @type {Actor[]} @readonly */
    this.primary = Array.isArray(data.primary) ? [...data.primary] : [];

    /** @type {Actor[]} @readonly */
    this.cc = Array.isArray(data.cc) ? [...data.cc] : [];

    /** @type {Actor[]} @readonly */
    this.bcc = Array.isArray(data.bcc) ? [...data.bcc] : [];

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(data.metadata || {});

    // Freeze the instance
    Object.freeze(this);
    Object.freeze(this.primary);
    Object.freeze(this.cc);
    Object.freeze(this.bcc);
    Object.freeze(this.metadata);
  }

  /**
   * @static
   * @description Factory for empty result.
   * @returns {RoutingResult}
   */
```
---
#### METHOD: RoutingResult.singlePrimary
- **Scope:** static
- **LLM Call Syntax:** `const result = RoutingResult.singlePrimary(actor);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for a single-recipient outcome.
   * @param {Actor} actor - The TO recipient.
   * @returns {RoutingResult}
   */
```
---
#### METHOD: RoutingResult.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResult.isEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @function isEmpty
   * @returns {boolean} True if all buckets (primary, cc, bcc) are empty.
   */
```
---
#### METHOD: RoutingResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResult.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```
---
#### METHOD: RoutingResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResult.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string summarizing TO and CC recipient counts/labels.
   */
```
---
#### METHOD: RoutingResult.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResult.if(this.primary.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResult.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResult.if(this.cc.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResult.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResult.if(this.bcc.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: RoutingResolver
**File Path:** `RoleResolutionLib/src/internal/routing/RoutingResolver.js`
**Constructor Usage:** `const instance = new RoutingResolver();`
**Description:** Resolves routing based on delegation chain and routing policies.

/

import { RoutingPolicy } from './RoutingPolicy.js';
import { RoutingResult } from './RoutingResult.js';
import { DelegationChain } from '../delegation/DelegationChain.js';

/**
@class RoutingResolver
Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/routing/RoutingResolver.js
 * @description Resolves routing based on delegation chain and routing policies.
 * @version 1.0.0
 */

import { RoutingPolicy } from './RoutingPolicy.js';
import { RoutingResult } from './RoutingResult.js';
import { DelegationChain } from '../delegation/DelegationChain.js';

/**
 * @class RoutingResolver
 * @description Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).
 */
```

### Methods of RoutingResolver

#### METHOD: RoutingResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResolver.resolve(params, params.principalActor, params.effectiveActor, params.delegationChain, params.routingPolicy);`
- **Pure JSDoc:**
```javascript
/**
     * Logger instance.
     * @type {Object}
     * @private
     */
    this._logger = options.logger || console;

    /**
     * Default routing policy.
     * @type {string}
     * @private
     */
    this._defaultPolicy = options.defaultPolicy || RoutingPolicy.DELEGATE_ONLY;
  }

  /**
   * @function resolve
   * @description Orchestrates actor bucket assignment based on active policy.
   * @param {Object} params - Input dataset.
   * @param {Actor} params.principalActor - Original role holder.
   * @param {Actor} [params.effectiveActor=null] - Resolved authorized entity.
   * @param {DelegationChain} [params.delegationChain=null] - Transitive hop history.
   * @param {string} [params.routingPolicy=null] - Explicit override.
   * @returns {RoutingResult} Mapped actor buckets.
   */
```
---
#### METHOD: RoutingResolver.switch
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.switch(policy);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: RoutingResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.if(!effectiveActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.if(!principalActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.if(effectiveActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.if(principalActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.if(!chosen);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoutingResolver.resolveChainAllWithActors
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResolver.resolveChainAllWithActors(chainActors);`
- **Pure JSDoc:**
```javascript
/**
   * @function resolveChainAllWithActors
   * @description Specialized resolver for CHAIN_ALL that deduplicates and buckets all unique actors in a path.
   * @param {Actor[]} chainActors - Ordered array of all entities in the delegation trace.
   * @returns {RoutingResult}
   */
```
---
#### METHOD: RoutingResolver.getDefaultPolicy
- **Scope:** instance
- **LLM Call Syntax:** `const result = routingResolver.getDefaultPolicy();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDefaultPolicy
   * @returns {string}
   */
```
---
<br>

## CLASS: RoleResolver
**File Path:** `RoleResolutionLib/src/internal/resolution/RoleResolver.js`
**Constructor Usage:** `const instance = new RoleResolver();`
**Description:** Main role resolution engine.

/

import { ResolutionResult } from '../../core/ResolutionResult.js';
import { ResolutionStrategy } from '../../core/ResolutionStrategy.js';
import { ScopeType } from '../../core/ScopeType.js';
import { DelegationChain } from '../delegation/DelegationChain.js';
import { RoutingResolver } from '../routing/RoutingResolver.js';
import { RoutingPolicy } from '../routing/RoutingPolicy.js';
import {
  RoleNotFoundError,
  NoActorFoundError,
  InvalidScopeError,
  CircularDelegationError,
  DelegationDepthExceededError
} from '../errors/RoleResolutionError.js';

/**
@class RoleResolver
Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/resolution/RoleResolver.js
 * @description Main role resolution engine.
 * @version 1.0.0
 */

import { ResolutionResult } from '../../core/ResolutionResult.js';
import { ResolutionStrategy } from '../../core/ResolutionStrategy.js';
import { ScopeType } from '../../core/ScopeType.js';
import { DelegationChain } from '../delegation/DelegationChain.js';
import { RoutingResolver } from '../routing/RoutingResolver.js';
import { RoutingPolicy } from '../routing/RoutingPolicy.js';
import {
  RoleNotFoundError,
  NoActorFoundError,
  InvalidScopeError,
  CircularDelegationError,
  DelegationDepthExceededError
} from '../errors/RoleResolutionError.js';

/**
 * @class RoleResolver
 * @description Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.
 */
```

### Methods of RoleResolver

#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!roleRegistry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!assignmentSource);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!delegationSource);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleResolver.resolve(roleId, scope, options, options.asOfDate, options.routingPolicy, options.includeFallbacks);`
- **Pure JSDoc:**
```javascript
/** @type {RoleRegistry} @private */
    this._roleRegistry = roleRegistry;

    /** @type {AssignmentSource} @private */
    this._assignmentSource = assignmentSource;

    /** @type {DelegationSource} @private */
    this._delegationSource = delegationSource;

    /** @type {Object} @private */
    this._logger = options.logger || console;

    /** @type {string} @private */
    this._defaultRoutingPolicy = options.defaultRoutingPolicy || RoutingPolicy.DELEGATE_ONLY;

    /** @type {number} @private */
    this._maxDelegationDepth = options.maxDelegationDepth || 10;

    /** @type {boolean} @private */
    this._throwOnNotFound = options.throwOnNotFound === true;

    /** @type {RoutingResolver} @private */
    this._routingResolver = new RoutingResolver({
      logger: this._logger,
      defaultPolicy: this._defaultRoutingPolicy
    });
  }

  /**
   * @function resolve
   * @description Orchestrates the 10-step resolution flow: lookup -> validate scope -> find assignments -> apply strategy -> fallbacks -> resolve actors -> resolve delegation -> resolve routing -> return result.
   * @param {string} roleId - Target role key.
   * @param {Scope} scope - Context boundary.
   * @param {Object} [options={}] - Per-request overrides.
   * @param {Date} [options.asOfDate=new Date()] - Temporal validity point.
   * @param {string} [options.routingPolicy=null] - Strategy override.
   * @param {boolean} [options.includeFallbacks=true] - Toggle recursive fallback lookup.
   * @returns {ResolutionResult} Full resolution payload.
   * @throws {RoleNotFoundError} If roleId is unregistered.
   * @throws {NoActorFoundError} If resolution fails and throwOnNotFound is true.
   * @throws {InvalidScopeError} If scope violates role definition.
   */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!role);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const fallbackId of role.fallbackRoles);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.catch
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(selectedAssignments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(this._throwOnNotFound);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const assignment of selectedAssignments);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!actor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(assignment);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!effectiveActor && principalActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.resolveMultiple
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleResolver.resolveMultiple(roleIds, scope, options);`
- **Pure JSDoc:**
```javascript
/**
   * @function resolveMultiple
   * @description Batch resolution. Fails safe by returning empty results for specific role errors.
   * @param {string[]} roleIds - Role IDs.
   * @param {Scope} scope - Shared scope.
   * @param {Object} [options={}] - Resolution options.
   * @returns {Map<string, ResolutionResult>}
   */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const roleId of roleIds);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.catch
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: RoleResolver.resolveForActor
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleResolver.resolveForActor(actorId, scope, options);`
- **Pure JSDoc:**
```javascript
/**
   * @function resolveForActor
   * @description Reverse lookup: identifies all roles (direct and via delegation) held by an actor.
   * @param {string} actorId - ID to inspect.
   * @param {Scope} scope - Context for filtering.
   * @param {Object} [options={}] - Configuration.
   * @returns {Object} {actor, roles, effectiveRoles, assignmentCount}
   */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const assignment of assignments);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(role);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(includeReceivedDelegations);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const delegation of receivedDelegations);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const roleId of delegatedRoleIds);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.getRoutingFor
- **Scope:** instance
- **LLM Call Syntax:** `const result = roleResolver.getRoutingFor(roleId, scope, options);`
- **Pure JSDoc:**
```javascript
/**
   * @function getRoutingFor
   * @description Convenience method for simple notification routing without full audit data.
   * @param {string} roleId - Role ID.
   * @param {Scope} scope - Context.
   * @param {Object} [options={}] - Options.
   * @returns {Object} {primary, cc, bcc} arrays of actors.
   */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(role.scopeType);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(scope?.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(assignments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.switch
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.switch(strategy);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!delegations || delegations.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(delegations.length > this._maxDelegationDepth);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.catch
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(!effectiveActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RoleResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.for(const delegation of chain.delegations);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: RoleResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.if(actor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ResolutionTrace
**File Path:** `RoleResolutionLib/src/internal/resolution/ResolutionTrace.js`
**Constructor Usage:** `const instance = new ResolutionTrace();`
**Description:** Immutable sequence of explainable effective-assignment decisions.

### Raw JSDoc Context:
```javascript
/** Immutable sequence of explainable effective-assignment decisions. */
```

### Methods of ResolutionTrace

#### METHOD: ResolutionTrace.append
- **Scope:** instance
- **LLM Call Syntax:** `resolutionTrace.append(entry);`
- **Pure JSDoc:**
```javascript
/** Method append */
```
---
#### METHOD: ResolutionTrace.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `resolutionTrace.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: ResolutionPolicy
**File Path:** `RoleResolutionLib/src/internal/resolution/ResolutionPolicy.js`
**Constructor Usage:** `const instance = new ResolutionPolicy();`
**Description:** Immutable policy options for effective-assignment resolution.

### Raw JSDoc Context:
```javascript
/** Immutable policy options for effective-assignment resolution. */
```

### Methods of ResolutionPolicy

#### METHOD: ResolutionPolicy.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `resolutionPolicy.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: EffectiveAssignmentResolver
**File Path:** `RoleResolutionLib/src/internal/resolution/EffectiveAssignmentResolver.js`
**Constructor Usage:** `const instance = new EffectiveAssignmentResolver();`
**Description:** Resolves generic candidates through temporal overrides, delegation, and routing.

### Raw JSDoc Context:
```javascript
/** Resolves generic candidates through temporal overrides, delegation, and routing. */
```

### Methods of EffectiveAssignmentResolver

#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(!actorSource || typeof actorSource.getActor !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(!assignmentSource || typeof assignmentSource.getAssignments !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(!overrideSource || typeof overrideSource.getOverrides !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.resolve({ context, asOfDate, routingPolicy);`
- **Pure JSDoc:**
```javascript
/** Method resolve */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(chainSelection.chain.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.for(;;);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(!selection.override);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(this._policy.maxOverrideChainDepth !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(applicable.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(finalists.length > 1 && this._policy.tieBehavior);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.while
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.while(current);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(outgoing.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(outgoing.length > 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(typeof this._delegationSource.getDelegations);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(actor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EffectiveAssignmentResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.if(this._policy.missingActorBehavior);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: RoleResolutionError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new RoleResolutionError();`
**Description:** Base error class and specialized errors for role resolution.

/

import { BaseError } from '@CoreUtilsLib';

/**
@class RoleResolutionError
@extends BaseError
Base exception for all role-related lookup and assignment failures.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/errors/RoleResolutionError.js
 * @description Base error class and specialized errors for role resolution.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class RoleResolutionError
 * @extends BaseError
 * @description Base exception for all role-related lookup and assignment failures.
 */
```

<br>

## CLASS: RoleNotFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new RoleNotFoundError();`
**Description:** @constructor
@param {string} message - Error details.
@param {Object} [context={}] - Metadata (roleId, scope, etc.).
@param {Error} [originalError=null] - Wrapped exception.
/
  constructor(message, context = {}, originalError = null) {
    super(message, context, originalError);
    this.name = 'RoleResolutionError';
  }
}

/**
@class RoleNotFoundError
@extends RoleResolutionError
Thrown when a role ID is missing from the registry.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (roleId, scope, etc.).
   * @param {Error} [originalError=null] - Wrapped exception.
   */
  constructor(message, context = {}, originalError = null) {
    super(message, context, originalError);
    this.name = 'RoleResolutionError';
  }
}

/**
 * @class RoleNotFoundError
 * @extends RoleResolutionError
 * @description Thrown when a role ID is missing from the registry.
 */
```

<br>

## CLASS: NoActorFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new NoActorFoundError();`
**Description:** @constructor
@param {string} roleId - The unknown role identifier.
@param {Object} [context={}] - Additional metadata.
/
  constructor(roleId, context = {}) {
    super(`Role not found: ${roleId}`, { ...context, roleId });
    this.name = 'RoleNotFoundError';
    this.roleId = roleId;
  }
}

/**
@class NoActorFoundError
@extends RoleResolutionError
Thrown when resolution logic yields an empty set for a role/scope.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} roleId - The unknown role identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, context = {}) {
    super(`Role not found: ${roleId}`, { ...context, roleId });
    this.name = 'RoleNotFoundError';
    this.roleId = roleId;
  }
}

/**
 * @class NoActorFoundError
 * @extends RoleResolutionError
 * @description Thrown when resolution logic yields an empty set for a role/scope.
 */
```

<br>

## CLASS: CircularDelegationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new CircularDelegationError();`
**Description:** @constructor
@param {string} roleId - Queried role.
@param {Object} [scope=null] - Searched scope instance.
@param {Object} [context={}] - Additional metadata.
/
  constructor(roleId, scope = null, context = {}) {
    const scopeStr = scope ? ` in scope ${scope.toString?.() || JSON.stringify(scope)}` : '';
    super(`No actor found for role ${roleId}${scopeStr}`, { ...context, roleId, scope });
    this.name = 'NoActorFoundError';
    this.roleId = roleId;
    this.scope = scope;
  }
}

/**
@class CircularDelegationError
@extends RoleResolutionError
Thrown when a loop is detected in the delegation graph.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} roleId - Queried role.
   * @param {Object} [scope=null] - Searched scope instance.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, scope = null, context = {}) {
    const scopeStr = scope ? ` in scope ${scope.toString?.() || JSON.stringify(scope)}` : '';
    super(`No actor found for role ${roleId}${scopeStr}`, { ...context, roleId, scope });
    this.name = 'NoActorFoundError';
    this.roleId = roleId;
    this.scope = scope;
  }
}

/**
 * @class CircularDelegationError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected in the delegation graph.
 */
```

<br>

## CLASS: InvalidScopeError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new InvalidScopeError();`
**Description:** @constructor
@param {string} actorId - Actor causing the cycle.
@param {string[]} [chain=[]] - Trace of IDs forming the cycle.
@param {Object} [context={}] - Additional metadata.
/
  constructor(actorId, chain = [], context = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular delegation detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularDelegationError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
@class InvalidScopeError
@extends RoleResolutionError
Thrown when a provided scope type is incompatible with role requirements.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} actorId - Actor causing the cycle.
   * @param {string[]} [chain=[]] - Trace of IDs forming the cycle.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId, chain = [], context = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular delegation detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularDelegationError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
 * @class InvalidScopeError
 * @extends RoleResolutionError
 * @description Thrown when a provided scope type is incompatible with role requirements.
 */
```

<br>

## CLASS: DelegationDepthExceededError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new DelegationDepthExceededError();`
**Description:** @constructor
@param {string} roleId - Role under query.
@param {string} providedScopeType - Actual scope level.
@param {string} expectedScopeType - Required scope level.
@param {Object} [context={}] - Additional metadata.
/
  constructor(roleId, providedScopeType, expectedScopeType, context = {}) {
    super(
      `Invalid scope for role ${roleId}: expected ${expectedScopeType}, got ${providedScopeType}`,
      { ...context, roleId, providedScopeType, expectedScopeType }
    );
    this.name = 'InvalidScopeError';
    this.roleId = roleId;
    this.providedScopeType = providedScopeType;
    this.expectedScopeType = expectedScopeType;
  }
}

/**
@class DelegationDepthExceededError
@extends RoleResolutionError
Thrown when a chain exceeds safety limits (default 10).

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} roleId - Role under query.
   * @param {string} providedScopeType - Actual scope level.
   * @param {string} expectedScopeType - Required scope level.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, providedScopeType, expectedScopeType, context = {}) {
    super(
      `Invalid scope for role ${roleId}: expected ${expectedScopeType}, got ${providedScopeType}`,
      { ...context, roleId, providedScopeType, expectedScopeType }
    );
    this.name = 'InvalidScopeError';
    this.roleId = roleId;
    this.providedScopeType = providedScopeType;
    this.expectedScopeType = expectedScopeType;
  }
}

/**
 * @class DelegationDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when a chain exceeds safety limits (default 10).
 */
```

<br>

## CLASS: RoleValidationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new RoleValidationError();`
**Description:** @constructor
@param {number} actualDepth - Chain length detected.
@param {number} maxDepth - Allowed threshold.
@param {Object} [context={}] - Additional metadata.
/
  constructor(actualDepth, maxDepth, context = {}) {
    super(`Delegation chain depth (${actualDepth}) exceeds maximum (${maxDepth})`, {
      ...context,
      actualDepth,
      maxDepth
    });
    this.name = 'DelegationDepthExceededError';
    this.actualDepth = actualDepth;
    this.maxDepth = maxDepth;
  }
}

/**
@class RoleValidationError
@extends RoleResolutionError
Thrown when role or actor definition schemas are violated.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {number} actualDepth - Chain length detected.
   * @param {number} maxDepth - Allowed threshold.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actualDepth, maxDepth, context = {}) {
    super(`Delegation chain depth (${actualDepth}) exceeds maximum (${maxDepth})`, {
      ...context,
      actualDepth,
      maxDepth
    });
    this.name = 'DelegationDepthExceededError';
    this.actualDepth = actualDepth;
    this.maxDepth = maxDepth;
  }
}

/**
 * @class RoleValidationError
 * @extends RoleResolutionError
 * @description Thrown when role or actor definition schemas are violated.
 */
```

<br>

## CLASS: MalformedAssignmentSlotError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new MalformedAssignmentSlotError();`
**Description:** @constructor
@param {string} message - High-level failure reason.
@param {string[]} [errors=[]] - Detailed list of violations.
@param {Object} [context={}] - Additional metadata.
/
  constructor(message, errors = [], context = {}) {
    super(message, { ...context, validationErrors: errors });
    this.name = 'RoleValidationError';
    this.validationErrors = errors;
  }
}

/** @class MalformedAssignmentSlotError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - High-level failure reason.
   * @param {string[]} [errors=[]] - Detailed list of violations.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(message, errors = [], context = {}) {
    super(message, { ...context, validationErrors: errors });
    this.name = 'RoleValidationError';
    this.validationErrors = errors;
  }
}

/** @class MalformedAssignmentSlotError @extends RoleResolutionError */
```

<br>

## CLASS: DuplicateAssignmentSlotError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new DuplicateAssignmentSlotError();`
**Description:** @class DuplicateAssignmentSlotError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class DuplicateAssignmentSlotError @extends RoleResolutionError */
```

<br>

## CLASS: InconsistentAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new InconsistentAssignmentOverrideError();`
**Description:** @class InconsistentAssignmentOverrideError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class InconsistentAssignmentOverrideError @extends RoleResolutionError */
```

<br>

## CLASS: AmbiguousAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new AmbiguousAssignmentOverrideError();`
**Description:** @class AmbiguousAssignmentOverrideError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class AmbiguousAssignmentOverrideError @extends RoleResolutionError */
```

<br>

## CLASS: AssignmentActorNotFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new AssignmentActorNotFoundError();`
**Description:** @class AssignmentActorNotFoundError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class AssignmentActorNotFoundError @extends RoleResolutionError */
```

<br>

## CLASS: OverlappingDelegationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new OverlappingDelegationError();`
**Description:** @class OverlappingDelegationError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class OverlappingDelegationError @extends RoleResolutionError */
```

<br>

## CLASS: CircularAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new CircularAssignmentOverrideError();`
**Description:** @class CircularAssignmentOverrideError
@extends RoleResolutionError
Thrown when a loop is detected while walking an override chain.

### Raw JSDoc Context:
```javascript
/**
 * @class CircularAssignmentOverrideError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected while walking an override chain.
 */
```

<br>

## CLASS: OverrideChainDepthExceededError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new OverrideChainDepthExceededError();`
**Description:** @constructor
@param {string} actorId - Actor causing the cycle.
@param {string[]} [chain=[]] - Visited actor ids forming the cycle.
@param {Object} [context={}] - Additional metadata.
/
  constructor(actorId, chain = [], context = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular assignment override detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularAssignmentOverrideError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
@class OverrideChainDepthExceededError
@extends RoleResolutionError
Thrown when an override chain exceeds the configured maximum depth.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} actorId - Actor causing the cycle.
   * @param {string[]} [chain=[]] - Visited actor ids forming the cycle.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId, chain = [], context = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular assignment override detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularAssignmentOverrideError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
 * @class OverrideChainDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when an override chain exceeds the configured maximum depth.
 */
```

<br>

## CLASS: DelegationValidator
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.js`
**Constructor Usage:** `const instance = new DelegationValidator();`
**Description:** Validator for delegations and delegation chains.

/

import { Delegation } from './Delegation.js';
import { DelegationChain } from './DelegationChain.js';

/**
@class DelegationValidator
Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/delegation/DelegationValidator.js
 * @description Validator for delegations and delegation chains.
 * @version 1.0.0
 */

import { Delegation } from './Delegation.js';
import { DelegationChain } from './DelegationChain.js';

/**
 * @class DelegationValidator
 * @description Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.
 */
```

### Methods of DelegationValidator

#### METHOD: DelegationValidator.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationValidator.validate(delegation, context);`
- **Pure JSDoc:**
```javascript
/** @type {number} @private */
    this._maxDelegationDepth = options.maxDelegationDepth || 10;

    /** @type {Object} @private */
    this._logger = options.logger || console;
  }

  /**
   * @function validate
   * @description Validates structural integrity, temporal constraints, and actor/role existence.
   * @param {Delegation} delegation - Target for validation.
   * @param {Object} [context={}] - External registry checks (actorExists, roleExists).
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(delegation.principalId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(delegation.validTo !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(delegation.validTo !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(delegation.validFrom > now);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(context.actorExists);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(context.roleExists && delegation.roleIds !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.for
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.for(const roleId of delegation.roleIds);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DelegationValidator.validateChain
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationValidator.validateChain(chain, context);`
- **Pure JSDoc:**
```javascript
/**
   * @function validateChain
   * @description Comprehensive chain check including depth limits, cycles, linkage, and scope coherence.
   * @param {DelegationChain} chain - Target for validation.
   * @param {Object} [context={}] - External registry checks.
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(cycleCheck.hasCycle);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(!result.isValid);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(prev.delegateId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.for
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.for(const actorId of actorIds);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(restriction && previousRestriction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.validateExtension
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationValidator.validateExtension(chain, delegation, context);`
- **Pure JSDoc:**
```javascript
/**
   * @function validateExtension
   * @description Speculative validation before extending a chain with a new segment.
   * @param {DelegationChain} chain - Base chain.
   * @param {Delegation} delegation - Proposed new segment.
   * @param {Object} [context={}] - External registry checks.
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
```
---
#### METHOD: DelegationValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.if(last.delegateId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationValidator.getMaxDelegationDepth
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationValidator.getMaxDelegationDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getMaxDelegationDepth
   * @returns {number}
   */
```
---
<br>

## CLASS: DelegationState
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationState.js`
**Constructor Usage:** `const instance = new DelegationState();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DelegationState

#### METHOD: DelegationState.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.if(!definition || typeof definition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationState.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.if(!id || typeof id !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationState.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.if(!principalId || typeof principalId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationState.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.if(!delegateId || typeof delegateId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationState.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.if(principalId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationState.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/** Method getMetadata */
```
---
#### METHOD: DelegationState.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: DelegationRules
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationRules.js`
**Constructor Usage:** `const instance = new DelegationRules();`
**Description:** Business rules and applicability logic for a Delegation.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/delegation/DelegationRules.js
 * @description Business rules and applicability logic for a Delegation.
 */
```

### Methods of DelegationRules

#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(!this.state.isActive);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(asOfDate < this.state.validFrom);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(this.state.validTo !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.appliesToRole
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.appliesToRole(roleId);`
- **Pure JSDoc:**
```javascript
/** Method appliesToRole */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(this.state.roleIds);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.appliesToScope
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.appliesToScope(targetScope);`
- **Pure JSDoc:**
```javascript
/** Method appliesToScope */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(!this.state.scopeRestriction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.isFullDelegation
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.isFullDelegation();`
- **Pure JSDoc:**
```javascript
/** Method isFullDelegation */
```
---
#### METHOD: DelegationRules.isIndefinite
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.isIndefinite();`
- **Pure JSDoc:**
```javascript
/** Method isIndefinite */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(this.state.validTo);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationRules.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.if(asOfDate > this.state.validTo);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DelegationChain
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationChain.js`
**Constructor Usage:** `const instance = new DelegationChain();`
**Description:** DelegationChain representing a chain of delegations.

/

import { Delegation } from './Delegation.js';

/**
@class DelegationChain
Immutable Collection representing a transitive series of Delegations (A -> B -> C).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/delegation/DelegationChain.js
 * @description DelegationChain representing a chain of delegations.
 * @version 1.0.0
 */

import { Delegation } from './Delegation.js';

/**
 * @class DelegationChain
 * @description Immutable Collection representing a transitive series of Delegations (A -> B -> C).
 */
```

### Methods of DelegationChain

#### METHOD: DelegationChain.for
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DelegationChain.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.if(i > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationChain.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.if(prev.delegateId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationChain.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = DelegationChain.empty();`
- **Pure JSDoc:**
```javascript
/** @type {Delegation[]} @readonly */
    this.delegations = [...delegations];

    Object.freeze(this);
    Object.freeze(this.delegations);
  }

  /**
   * @static
   * @description Factory for empty chain.
   * @returns {DelegationChain}
   */
```
---
#### METHOD: DelegationChain.single
- **Scope:** static
- **LLM Call Syntax:** `const result = DelegationChain.single(delegation);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for single-hop chain.
   * @param {Delegation} delegation - Primary delegation.
   * @returns {DelegationChain}
   */
```
---
#### METHOD: DelegationChain.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.isEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @function isEmpty
   * @returns {boolean} True if delegations array is empty.
   */
```
---
#### METHOD: DelegationChain.getDepth
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDepth
   * @returns {number} Count of delegation segments.
   */
```
---
#### METHOD: DelegationChain.getOriginalPrincipalId
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getOriginalPrincipalId();`
- **Pure JSDoc:**
```javascript
/**
   * @function getOriginalPrincipalId
   * @description Retrieves ID of the first actor in the chain.
   * @returns {string|null}
   */
```
---
#### METHOD: DelegationChain.getFinalDelegateId
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getFinalDelegateId();`
- **Pure JSDoc:**
```javascript
/**
   * @function getFinalDelegateId
   * @description Retrieves ID of the last actor in the chain.
   * @returns {string|null}
   */
```
---
#### METHOD: DelegationChain.getAllActorIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getAllActorIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActorIds
   * @description Ordered list of all actors involved (Principal + all Delegates).
   * @returns {string[]}
   */
```
---
#### METHOD: DelegationChain.for
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.for(const delegation of this.delegations);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DelegationChain.getFirst
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getFirst();`
- **Pure JSDoc:**
```javascript
/**
   * @function getFirst
   * @returns {Delegation|null} First delegation segment.
   */
```
---
#### METHOD: DelegationChain.getLast
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getLast();`
- **Pure JSDoc:**
```javascript
/**
   * @function getLast
   * @returns {Delegation|null} Final delegation segment.
   */
```
---
#### METHOD: DelegationChain.getAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.getAt(index);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAt
   * @param {number} index - 0-based position.
   * @returns {Delegation|null} Segment at index or null.
   */
```
---
#### METHOD: DelegationChain.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.if(index < 0 || index >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationChain.containsActor
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.containsActor(actorId);`
- **Pure JSDoc:**
```javascript
/**
   * @function containsActor
   * @param {string} actorId - ID to check.
   * @returns {boolean}
   */
```
---
#### METHOD: DelegationChain.wouldCreateCycle
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.wouldCreateCycle(delegation);`
- **Pure JSDoc:**
```javascript
/**
   * @function wouldCreateCycle
   * @description Cycle detection logic before extending chain.
   * @param {Delegation} delegation - Potential next segment.
   * @returns {boolean} True if delegateId already exists in chain.
   */
```
---
#### METHOD: DelegationChain.extend
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.extend(delegation);`
- **Pure JSDoc:**
```javascript
/**
   * @function extend
   * @description Functional append. Returns new instance with added delegation.
   * @param {Delegation} delegation - Next segment.
   * @returns {DelegationChain}
   * @throws {Error} If linkage fails or cycle is detected.
   */
```
---
#### METHOD: DelegationChain.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.if(last.delegateId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationChain.forEach
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.forEach(callback);`
- **Pure JSDoc:**
```javascript
/**
   * @function forEach
   * @param {Function} callback - (delegation, index).
   */
```
---
#### METHOD: DelegationChain.map
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.map(mapper);`
- **Pure JSDoc:**
```javascript
/**
   * @function map
   * @param {Function} mapper - (delegation, index).
   * @returns {Array}
   */
```
---
#### METHOD: DelegationChain.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.toJSON(asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function isValidAt
   * @description Validates every segment in the chain against timestamp.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean}
   */
  isValidAt(asOfDate = new Date()) {
    return this.delegations.every((d) => d.isValidAt(asOfDate));
  }

  /**
   * @function toJSON
   * @description Deeply serializes chain to POJO.
   * @returns {Object} {delegations, depth, originalPrincipalId, finalDelegateId}
   */
```
---
#### METHOD: DelegationChain.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = DelegationChain.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Hydrates a DelegationChain from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {DelegationChain}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: DelegationChain.if
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DelegationChain.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegationChain.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: DelegationChain[ID1 -> ID2 -> ID3].
   */
```
---
<br>

## CLASS: Delegation
**File Path:** `RoleResolutionLib/src/internal/delegation/Delegation.js`
**Constructor Usage:** `const instance = new Delegation();`
**Description:** Delegation value object representing a responsibility transfer.

/

import { DelegationState } from './DelegationState.js';
import { DelegationRules } from './DelegationRules.js';

/**
@class Delegation
Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/delegation/Delegation.js
 * @description Delegation value object representing a responsibility transfer.
 * @version 1.0.0
 */

import { DelegationState } from './DelegationState.js';
import { DelegationRules } from './DelegationRules.js';

/**
 * @class Delegation
 * @description Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.
 */
```

### Methods of Delegation

#### METHOD: Delegation.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegation.equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function equals
   * @description Comparison based on unique delegation ID.
   * @param {Delegation} other - Target for comparison.
   * @returns {boolean}
   */
```
---
#### METHOD: Delegation.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = Delegation.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory to hydrate a Delegation from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Delegation}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: Delegation.if
- **Scope:** instance
- **LLM Call Syntax:** `delegation.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Delegation.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = delegation.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Delegation[ID] PRINCIPAL -> DELEGATE [Roles] [Period] (Reason).
   */
```
---
<br>

## CLASS: Scope
**File Path:** `RoleResolutionLib/src/core/Scope.js`
**Constructor Usage:** `const instance = new Scope();`
**Description:** Scope value object representing a validity context for roles.

/

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { cloneDeep, isEqual } from '@CoreUtilsLib';

/**
@class Scope
Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/core/Scope.js
 * @description Scope value object representing a validity context for roles.
 * @version 1.0.0
 */

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { cloneDeep, isEqual } from '@CoreUtilsLib';

/**
 * @class Scope
 * @description Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.
 */
```

### Methods of Scope

#### METHOD: Scope.global
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.global();`
- **Pure JSDoc:**
```javascript
/** @type {string} @readonly */
    this.type = type;

    /** @type {string|Object|null} @readonly */
    this.value = value !== null ? cloneDeep(value) : null;

    /** @type {string[]} @readonly */
    this.hierarchy = Array.isArray(hierarchy) ? [...hierarchy] : [];

    // Freeze the instance to ensure immutability
    Object.freeze(this);
    Object.freeze(this.hierarchy);
  }

  /**
   * @static
   * @description Factory for GLOBAL scope.
   * @returns {Scope}
   */
```
---
#### METHOD: Scope.orgUnit
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.orgUnit(value, hierarchy);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for organizational unit scope.
   * @param {string} value - Org ID.
   * @param {string[]} [hierarchy=[]] - Parent path.
   * @returns {Scope}
   */
```
---
#### METHOD: Scope.project
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.project(value);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for project-level scope.
   * @param {string|Object} value - Project ID.
   * @returns {Scope}
   */
```
---
#### METHOD: Scope.resource
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.resource(value);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for specific resource scope.
   * @param {string|Object} value - Resource ID.
   * @returns {Scope}
   */
```
---
#### METHOD: Scope.custom
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.custom(value, hierarchy);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for non-standard scope types.
   * @param {string|Object} value - Custom identifier.
   * @param {string[]} [hierarchy=[]] - Optional path.
   * @returns {Scope}
   */
```
---
#### METHOD: Scope.isGlobal
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.isGlobal();`
- **Pure JSDoc:**
```javascript
/**
   * @function isGlobal
   * @returns {boolean} True if type is GLOBAL.
   */
```
---
#### METHOD: Scope.contains
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.contains(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function contains
   * @description Logical containment check. Returns true if this scope equals other OR is a parent in the hierarchy.
   * @param {Scope} other - Query scope.
   * @returns {boolean}
   */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.hierarchy.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.hierarchy.length > other.hierarchy.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.for
- **Scope:** instance
- **LLM Call Syntax:** `scope.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.hierarchy[i] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.matches
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.matches(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function matches
   * @description Structural equality check (type, value, hierarchy).
   * @param {Scope} other - Target for comparison.
   * @returns {boolean}
   */
```
---
#### METHOD: Scope.getValueString
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.getValueString();`
- **Pure JSDoc:**
```javascript
/**
   * @function getValueString
   * @description Stringifies the scope value.
   * @returns {string}
   */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(typeof this.value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to POJO.
   * @returns {Object} {type, value, hierarchy}
   */
```
---
#### METHOD: Scope.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Hydrates a Scope from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Scope}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = scope.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Scope[TYPE:VALUE] (Path)
   */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.hierarchy.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Scope.for
- **Scope:** instance
- **LLM Call Syntax:** `scope.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Scope.if
- **Scope:** instance
- **LLM Call Syntax:** `scope.if(this.hierarchy[i] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: Role
**File Path:** `RoleResolutionLib/src/core/Role.js`
**Constructor Usage:** `const instance = new Role();`
**Description:** Role value object representing a role definition.

/

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { ResolutionStrategy, isValidResolutionStrategy } from './ResolutionStrategy.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
@class Role
Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/core/Role.js
 * @description Role value object representing a role definition.
 * @version 1.0.0
 */

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { ResolutionStrategy, isValidResolutionStrategy } from './ResolutionStrategy.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class Role
 * @description Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.
 */
```

### Methods of Role

#### METHOD: Role.if
- **Scope:** instance
- **LLM Call Syntax:** `role.if(!definition || typeof definition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Role.if
- **Scope:** instance
- **LLM Call Syntax:** `role.if(!id || typeof id !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Role.if
- **Scope:** instance
- **LLM Call Syntax:** `role.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Role.isGlobal
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.isGlobal();`
- **Pure JSDoc:**
```javascript
/** @type {string} @readonly */
    this.id = id;

    /** @type {string} @readonly */
    this.name = name;

    /** @type {string} @readonly */
    this.description = description;

    /** @type {string} @readonly */
    this.scopeType = scopeType;

    /** @type {string} @readonly */
    this.resolutionStrategy = resolutionStrategy;

    /** @type {boolean} @readonly */
    this.allowsDelegation = allowsDelegation;

    /** @type {string[]} @readonly */
    this.fallbackRoles = [...fallbackRoles];

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    // Freeze the instance
    Object.freeze(this);
    Object.freeze(this.fallbackRoles);
    Object.freeze(this.metadata);
  }

  /**
   * @function isGlobal
   * @returns {boolean} True if scopeType is GLOBAL.
   */
```
---
#### METHOD: Role.resolvesToAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.resolvesToAll();`
- **Pure JSDoc:**
```javascript
/**
   * @function resolvesToAll
   * @returns {boolean} True if strategy is ALL.
   */
```
---
#### METHOD: Role.usesPriority
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.usesPriority();`
- **Pure JSDoc:**
```javascript
/**
   * @function usesPriority
   * @returns {boolean} True if strategy is PRIORITY.
   */
```
---
#### METHOD: Role.hasFallbacks
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.hasFallbacks();`
- **Pure JSDoc:**
```javascript
/**
   * @function hasFallbacks
   * @returns {boolean} True if fallbackRoles array is non-empty.
   */
```
---
#### METHOD: Role.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @function getMetadata
   * @description Safe access to metadata object.
   * @param {string} key - Property name.
   * @param {*} [defaultValue=null] - Fallback value.
   * @returns {*} Value or defaultValue.
   */
```
---
#### METHOD: Role.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function equals
   * @description Comparison based on unique role ID.
   * @param {Role} other - Target for comparison.
   * @returns {boolean}
   */
```
---
#### METHOD: Role.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes role definition to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```
---
#### METHOD: Role.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = Role.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory to hydrate a Role from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Role}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: Role.if
- **Scope:** instance
- **LLM Call Syntax:** `role.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Role.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = role.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Role[ID] Name (Scope, Strategy).
   */
```
---
<br>

## CLASS: ResolutionResult
**File Path:** `RoleResolutionLib/src/core/ResolutionResult.js`
**Constructor Usage:** `const instance = new ResolutionResult();`
**Description:** ResolutionResult representing the complete result of role resolution.

/

import { cloneDeep } from '@CoreUtilsLib';

/**
@class ResolutionResult
Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/core/ResolutionResult.js
 * @description ResolutionResult representing the complete result of role resolution.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class ResolutionResult
 * @description Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).
 */
```

### Methods of ResolutionResult

#### METHOD: ResolutionResult.if
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.if(!data || typeof data !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResolutionResult.isResolved
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.isResolved();`
- **Pure JSDoc:**
```javascript
/**
     * The role that was requested.
     * @type {Object}
     * @readonly
     */
    this.requestedRole = data.requestedRole;

    /**
     * The scope that was queried.
     * @type {Object}
     * @readonly
     */
    this.scope = data.scope;

    /**
     * The actor who should perform the action (may be delegate).
     * @type {Object|null}
     * @readonly
     */
    this.effectiveActor = data.effectiveActor || null;

    /**
     * The original principal actor (before delegation).
     * @type {Object|null}
     * @readonly
     */
    this.principalActor = data.principalActor || null;

    /**
     * All actors resolved (when resolution strategy is ALL).
     * @type {Object[]}
     * @readonly
     */
    this.allActors = Array.isArray(data.allActors) ? [...data.allActors] : [];

    /**
     * Chain of delegations that were applied.
     * @type {Object[]}
     * @readonly
     */
    this.delegationChain = Array.isArray(data.delegationChain) ? [...data.delegationChain] : [];

    /**
     * Routing information for notifications.
     * @type {Object}
     * @readonly
     */
    this.routing = {
      primary: data.routing?.primary ? [...data.routing.primary] : [],
      cc: data.routing?.cc ? [...data.routing.cc] : [],
      bcc: data.routing?.bcc ? [...data.routing.bcc] : []
    };

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = {
      resolvedAt: new Date(),
      ...cloneDeep(data.metadata || {})
    };

    /**
     * Whether a fallback role was used.
     * @type {boolean}
     * @readonly
     */
    this.fallbackUsed = data.fallbackUsed === true;

    /**
     * The fallback role ID that was used.
     * @type {string|null}
     * @readonly
     */
    this.fallbackRoleId = data.fallbackRoleId || null;

    // Freeze to ensure immutability
    Object.freeze(this);
    Object.freeze(this.allActors);
    Object.freeze(this.delegationChain);
    Object.freeze(this.routing);
    Object.freeze(this.routing.primary);
    Object.freeze(this.routing.cc);
    Object.freeze(this.routing.bcc);
    Object.freeze(this.metadata);
  }

  /**
   * @function isResolved
   * @returns {boolean} True if an effectiveActor was found.
   */
```
---
#### METHOD: ResolutionResult.isDelegated
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.isDelegated();`
- **Pure JSDoc:**
```javascript
/**
   * @function isDelegated
   * @returns {boolean} True if delegationChain is non-empty.
   */
```
---
#### METHOD: ResolutionResult.getDelegationDepth
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.getDelegationDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDelegationDepth
   * @returns {number} Count of delegation hops.
   */
```
---
#### METHOD: ResolutionResult.hasEffectiveActorChange
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.hasEffectiveActorChange();`
- **Pure JSDoc:**
```javascript
/**
   * @function hasEffectiveActorChange
   * @description Checks if delegation resulted in a different actor identity.
   * @returns {boolean}
   */
```
---
#### METHOD: ResolutionResult.if
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.if(!this.effectiveActor || !this.principalActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResolutionResult.getAllRoutingRecipients
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.getAllRoutingRecipients();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllRoutingRecipients
   * @description Aggregates primary, cc, and bcc actor arrays.
   * @returns {Object[]} Combined list of all notified actors.
   */
```
---
#### METHOD: ResolutionResult.getAllActorIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.getAllActorIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActorIds
   * @description Extracts unique actor IDs from all resolution facets.
   * @returns {string[]} Set of involved actor IDs.
   */
```
---
#### METHOD: ResolutionResult.if
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.if(this.effectiveActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResolutionResult.if
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.if(this.principalActor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResolutionResult.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = ResolutionResult.empty(requestedRole, scope, metadata);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for unsuccessful resolution.
   * @param {Object} requestedRole - Requested role context.
   * @param {Object} scope - Queried scope context.
   * @param {Object} [metadata={}] - Audit trails.
   * @returns {ResolutionResult} Unresolved result instance.
   */
```
---
#### METHOD: ResolutionResult.simple
- **Scope:** static
- **LLM Call Syntax:** `const result = ResolutionResult.simple(requestedRole, scope, actor);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for single-actor successful resolution without delegation.
   * @param {Object} requestedRole - Requested role context.
   * @param {Object} scope - Queried scope context.
   * @param {Object} actor - Resolved actor instance.
   * @returns {ResolutionResult} Resolved result instance.
   */
```
---
#### METHOD: ResolutionResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes all result facets to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```
---
#### METHOD: ResolutionResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = resolutionResult.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: ResolutionResult[ROLE] -> EFFECTIVE (delegation/fallback).
   */
```
---
<br>

## CLASS: EffectiveAssignmentResult
**File Path:** `RoleResolutionLib/src/core/EffectiveAssignmentResult.js`
**Constructor Usage:** `const instance = new EffectiveAssignmentResult();`
**Description:** Immutable outcome of resolving a base assignment through overrides and delegation.

### Raw JSDoc Context:
```javascript
/** Immutable outcome of resolving a base assignment through overrides and delegation. */
```

### Methods of EffectiveAssignmentResult

#### METHOD: EffectiveAssignmentResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResult.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: AssignmentSlot
**File Path:** `RoleResolutionLib/src/core/AssignmentSlot.js`
**Constructor Usage:** `const instance = new AssignmentSlot();`
**Description:** Immutable, opaque set of dimensions identifying an assignment slot.

### Raw JSDoc Context:
```javascript
/** Immutable, opaque set of dimensions identifying an assignment slot. */
```

### Methods of AssignmentSlot

#### METHOD: AssignmentSlot.if
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.if(entries.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AssignmentSlot.matches
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.matches(scopeDimensions);`
- **Pure JSDoc:**
```javascript
/** Method matches */
```
---
#### METHOD: AssignmentSlot.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: AssignmentOverride
**File Path:** `RoleResolutionLib/src/core/AssignmentOverride.js`
**Constructor Usage:** `const instance = new AssignmentOverride();`
**Description:** Immutable, dated actor replacement scoped by opaque assignment dimensions.

### Raw JSDoc Context:
```javascript
/** Immutable, dated actor replacement scoped by opaque assignment dimensions. */
```

### Methods of AssignmentOverride

#### METHOD: AssignmentOverride.if
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.if(this.previousActorId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AssignmentOverride.if
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.if(this.effectiveFrom);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AssignmentOverride.appliesAtDate
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.appliesAtDate(date);`
- **Pure JSDoc:**
```javascript
/** Method appliesAtDate */
```
---
#### METHOD: AssignmentOverride.matchesActor
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.matchesActor(actorId);`
- **Pure JSDoc:**
```javascript
/** Method matchesActor */
```
---
#### METHOD: AssignmentOverride.matchesSlot
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.matchesSlot(slot);`
- **Pure JSDoc:**
```javascript
/** Method matchesSlot */
```
---
#### METHOD: AssignmentOverride.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: AssignmentCandidate
**File Path:** `RoleResolutionLib/src/core/AssignmentCandidate.js`
**Constructor Usage:** `const instance = new AssignmentCandidate();`
**Description:** Immutable candidate assignment that can become effective at a point in time.

### Raw JSDoc Context:
```javascript
/** Immutable candidate assignment that can become effective at a point in time. */
```

### Methods of AssignmentCandidate

#### METHOD: AssignmentCandidate.if
- **Scope:** instance
- **LLM Call Syntax:** `assignmentCandidate.if(this.validFrom && this.validTo && this.validFrom > this.validTo);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AssignmentCandidate.if
- **Scope:** instance
- **LLM Call Syntax:** `assignmentCandidate.if(asOf);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AssignmentCandidate.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentCandidate.toJSON();`
- **Pure JSDoc:**
```javascript
/** Method toJSON */
```
---
<br>

## CLASS: Assignment
**File Path:** `RoleResolutionLib/src/core/Assignment.js`
**Constructor Usage:** `const instance = new Assignment();`
**Description:** Assignment value object representing a role-actor-scope association.

/

import { Scope } from './Scope.js';
import { cloneDeep } from '@CoreUtilsLib';
import { parseDate } from '@CoreUtilsLib/src/utils/DateUtils.js';

/**
@class Assignment
Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/core/Assignment.js
 * @description Assignment value object representing a role-actor-scope association.
 * @version 1.0.0
 */

import { Scope } from './Scope.js';
import { cloneDeep } from '@CoreUtilsLib';
import { parseDate } from '@CoreUtilsLib/src/utils/DateUtils.js';

/**
 * @class Assignment
 * @description Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).
 */
```

### Methods of Assignment

#### METHOD: Assignment.if
- **Scope:** instance
- **LLM Call Syntax:** `assignment.if(!definition || typeof definition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Assignment.if
- **Scope:** instance
- **LLM Call Syntax:** `assignment.if(!roleId || typeof roleId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Assignment.if
- **Scope:** instance
- **LLM Call Syntax:** `assignment.if(!actorId || typeof actorId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Assignment.if
- **Scope:** instance
- **LLM Call Syntax:** `assignment.if(!scope);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Assignment.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = assignment.equals(asOfDate, roleId, scope, asOfDate, other);`
- **Pure JSDoc:**
```javascript
/**
   * @function isValidAt
   * @description Checks isActive status and temporal boundaries.
   * @param {Date} [asOfDate=new Date()] - Reference point.
   * @returns {boolean} True if within [validFrom, validTo].
   */
  isValidAt(asOfDate = new Date()) {
    // Check active flag
    if (!this.isActive) {
      return false;
    }

    // Check validFrom
    if (this.validFrom !== null && asOfDate < this.validFrom) {
      return false;
    }

    // Check validTo
    if (this.validTo !== null && asOfDate > this.validTo) {
      return false;
    }

    return true;
  }

  /**
   * @function matches
   * @description Validates roleId, temporal eligibility, and scope containment.
   * @param {string} roleId - Query role.
   * @param {Scope} scope - Query scope.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean} True if assignment satisfies query parameters.
   */
  matches(roleId, scope, asOfDate = new Date()) {
    // Check role
    if (this.roleId !== roleId) {
      return false;
    }

    // Check validity
    if (!this.isValidAt(asOfDate)) {
      return false;
    }

    // Check scope - assignment scope must contain the query scope
    // or be exactly equal to it
    return this.scope.contains(scope) || this.scope.matches(scope);
  }

  /**
   * @function equals
   * @description Structural equality check (role, actor, scope).
   * @param {Assignment} other - Target for comparison.
   * @returns {boolean}
   */
```
---
#### METHOD: Assignment.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = assignment.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @function getMetadata
   * @description Safe access to metadata object.
   * @param {string} key - Property name.
   * @param {*} [defaultValue=null] - Fallback value.
   * @returns {*} Value or defaultValue.
   */
```
---
#### METHOD: Assignment.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = assignment.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to plain object for persistence.
   * @returns {Object} JSON-compatible representation.
   */
```
---
#### METHOD: Assignment.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = Assignment.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory to hydrate an Assignment from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Assignment}
   * @throws {Error} If obj is invalid.
   */
```
---
#### METHOD: Assignment.if
- **Scope:** instance
- **LLM Call Syntax:** `assignment.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Assignment.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = assignment.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Assignment[ROLE -> ACTOR] Scope [Validity]
   */
```
---
<br>

## CLASS: Actor
**File Path:** `RoleResolutionLib/src/core/Actor.js`
**Constructor Usage:** `const instance = new Actor();`
**Description:** Actor value object representing an entity that can hold roles.

/

import { ActorType, isValidActorType } from './ActorType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
@class Actor
Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).

### Raw JSDoc Context:
```javascript
/**
 * @file RoleResolutionLib/src/core/Actor.js
 * @description Actor value object representing an entity that can hold roles.
 * @version 1.0.0
 */

import { ActorType, isValidActorType } from './ActorType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class Actor
 * @description Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).
 */
```

### Methods of Actor

#### METHOD: Actor.if
- **Scope:** instance
- **LLM Call Syntax:** `actor.if(!id || typeof id !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Actor.if
- **Scope:** instance
- **LLM Call Syntax:** `actor.if(!identifier || typeof identifier !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Actor.if
- **Scope:** instance
- **LLM Call Syntax:** `actor.if(!displayName || typeof displayName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Actor.person
- **Scope:** static
- **LLM Call Syntax:** `const result = Actor.person(id, email, displayName, metadata);`
- **Pure JSDoc:**
```javascript
/** @type {string} @readonly */
    this.id = id;

    /** @type {string} @readonly */
    this.type = type;

    /** @type {string} @readonly */
    this.identifier = identifier;

    /** @type {string} @readonly */
    this.displayName = displayName;

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    // Freeze the instance to ensure immutability
    Object.freeze(this);
    Object.freeze(this.metadata);
  }

  /**
   * @static
   * @description Factory for PERSON type actors.
   * @param {string} id - Unique ID.
   * @param {string} email - Actor email.
   * @param {string} displayName - Full name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
```
---
#### METHOD: Actor.system
- **Scope:** static
- **LLM Call Syntax:** `const result = Actor.system(id, serviceId, displayName, metadata);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for SYSTEM type actors.
   * @param {string} id - Unique ID.
   * @param {string} serviceId - Service/Bot handle.
   * @param {string} displayName - Display name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
```
---
#### METHOD: Actor.group
- **Scope:** static
- **LLM Call Syntax:** `const result = Actor.group(id, groupId, displayName, metadata);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Factory for GROUP type actors.
   * @param {string} id - Unique ID.
   * @param {string} groupId - Group identifier/email.
   * @param {string} displayName - Team name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
```
---
#### METHOD: Actor.isPerson
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.isPerson();`
- **Pure JSDoc:**
```javascript
/**
   * @function isPerson
   * @returns {boolean} True if type is PERSON.
   */
```
---
#### METHOD: Actor.isSystem
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.isSystem();`
- **Pure JSDoc:**
```javascript
/**
   * @function isSystem
   * @returns {boolean} True if type is SYSTEM.
   */
```
---
#### METHOD: Actor.isGroup
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.isGroup();`
- **Pure JSDoc:**
```javascript
/**
   * @function isGroup
   * @returns {boolean} True if type is GROUP.
   */
```
---
#### METHOD: Actor.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function equals
   * @description Comparison based on unique ID.
   * @param {Actor} other - Target for comparison.
   * @returns {boolean}
   */
```
---
#### METHOD: Actor.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @function getMetadata
   * @description Safe access to metadata object.
   * @param {string} key - Property name.
   * @param {*} [defaultValue=null] - Fallback value.
   * @returns {*} Value or defaultValue.
   */
```
---
#### METHOD: Actor.withMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.withMetadata(additionalMetadata);`
- **Pure JSDoc:**
```javascript
/**
   * @function withMetadata
   * @description Creates a new instance with merged metadata (Functional Update).
   * @param {Object} additionalMetadata - Fields to merge.
   * @returns {Actor} New immutable instance.
   */
```
---
#### METHOD: Actor.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to plain object.
   * @returns {Object} {id, type, identifier, displayName, metadata}
   */
```
---
#### METHOD: Actor.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = Actor.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Hydrates an Actor from a plain object.
   * @param {Object} obj - Serialized actor data.
   * @returns {Actor}
   * @throws {Error} If obj is null or invalid.
   */
```
---
#### METHOD: Actor.if
- **Scope:** instance
- **LLM Call Syntax:** `actor.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Actor.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = actor.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug representation: Actor[TYPE:ID] Name <Identifier>
   */
```
---
<br>

