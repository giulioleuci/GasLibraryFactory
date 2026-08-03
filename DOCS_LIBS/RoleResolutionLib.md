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
import { DelegationValidator } from '../delegation/DelegationValidator.js';
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
import { DelegationValidator } from '../delegation/DelegationValidator.js';
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

## CLASS: ActorNotFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new ActorNotFoundError();`
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
@class ActorNotFoundError
@extends RoleResolutionError
Thrown when a specific actor ID cannot be resolved.

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
 * @class ActorNotFoundError
 * @extends RoleResolutionError
 * @description Thrown when a specific actor ID cannot be resolved.
 */
```

<br>

## CLASS: CircularDelegationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.js`
**Constructor Usage:** `const instance = new CircularDelegationError();`
**Description:** @constructor
@param {string} actorId - The missing actor identifier.
@param {Object} [context={}] - Additional metadata.
/
  constructor(actorId, context = {}) {
    super(`Actor not found: ${actorId}`, { ...context, actorId });
    this.name = 'ActorNotFoundError';
    this.actorId = actorId;
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
   * @param {string} actorId - The missing actor identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId, context = {}) {
    super(`Actor not found: ${actorId}`, { ...context, actorId });
    this.name = 'ActorNotFoundError';
    this.actorId = actorId;
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
import { parseDate } from '../internal/DateParsing.js';

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
import { parseDate } from '../internal/DateParsing.js';

/**
 * @class Assignment
 * @description Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).
 */
```

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

<br>

