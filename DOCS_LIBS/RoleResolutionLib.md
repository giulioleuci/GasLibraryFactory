# API Reference: RoleResolutionLib

## CLASS: RoleRegistry
**File Path:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
**Constructor Usage:** `const instance = new RoleRegistry();`
**Description:** Centralized CRUD store for Role definitions. Handles validation and indexing.

### Raw JSDoc Context:
```javascript
/**
 * @class RoleRegistry
 * @description Centralized CRUD store for Role definitions. Handles validation and indexing.
 */
```

### Methods and properties of RoleRegistry

#### METHOD: RoleRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.register();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.registerAll
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.registerAll();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.get();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.getOrNull
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.getOrNull();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.has();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.unregister();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.getAll
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.getAll();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.getAllIds
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.getAllIds();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.size
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.size();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.clear();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.find
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.find();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.findByScopeType
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.findByScopeType();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.findDelegatable
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.findDelegatable();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleRegistry.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `roleRegistry.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
<br>

## CLASS: WideRowAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`
**Constructor Usage:** `const instance = new WideRowAssignmentSource();`
**Description:** Maps wide, tabular rows to opaque assignment candidates.

### Raw JSDoc Context:
```javascript
/** Maps wide, tabular rows to opaque assignment candidates. */
```

### Methods and properties of WideRowAssignmentSource

#### METHOD: WideRowAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `wideRowAssignmentSource.getAssignments();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MappedOverrideSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`
**Constructor Usage:** `const instance = new MappedOverrideSource();`
**Description:** Maps generic rows to dated, opaque assignment overrides.

### Raw JSDoc Context:
```javascript
/** Maps generic rows to dated, opaque assignment overrides. */
```

### Methods and properties of MappedOverrideSource

#### METHOD: MappedOverrideSource.getOverrides
- **Scope:** instance
- **LLM Call Syntax:** `mappedOverrideSource.getOverrides();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MappedDelegationSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`
**Constructor Usage:** `const instance = new MappedDelegationSource();`
**Description:** Maps generic rows to context-scoped delegation values.

### Raw JSDoc Context:
```javascript
/** Maps generic rows to context-scoped delegation values. */
```

### Methods and properties of MappedDelegationSource

#### METHOD: MappedDelegationSource.getDelegations
- **Scope:** instance
- **LLM Call Syntax:** `mappedDelegationSource.getDelegations();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: CompositeAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`
**Constructor Usage:** `const instance = new CompositeAssignmentSource();`
**Description:** Combines independent candidate sources with a deterministic identity.

### Raw JSDoc Context:
```javascript
/** Combines independent candidate sources with a deterministic identity. */
```

### Methods and properties of CompositeAssignmentSource

#### METHOD: CompositeAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `compositeAssignmentSource.getAssignments();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: EffectiveAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`
**Constructor Usage:** `const instance = new EffectiveAssignmentSource();`
**Description:** Generic persistence contracts for effective-assignment resolution.

### Raw JSDoc Context:
```javascript
/** Generic persistence contracts for effective-assignment resolution. */
```

### Methods and properties of EffectiveAssignmentSource

#### METHOD: EffectiveAssignmentSource.getAssignments
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentSource.getAssignments();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: OverrideSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`
**Constructor Usage:** `const instance = new OverrideSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of OverrideSource

#### METHOD: OverrideSource.getOverrides
- **Scope:** instance
- **LLM Call Syntax:** `overrideSource.getOverrides();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ActorSource
**File Path:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`
**Constructor Usage:** `const instance = new ActorSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ActorSource

#### METHOD: ActorSource.getActor
- **Scope:** instance
- **LLM Call Syntax:** `actorSource.getActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DelegationSource
**File Path:** `RoleResolutionLib/src/registry/DelegationSource.ts`
**Constructor Usage:** `const instance = new DelegationSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DelegationSource

#### METHOD: DelegationSource.getActiveDelegationsForPrincipal
- **Scope:** instance
- **LLM Call Syntax:** `delegationSource.getActiveDelegationsForPrincipal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationSource.getActiveDelegationsForDelegate
- **Scope:** instance
- **LLM Call Syntax:** `delegationSource.getActiveDelegationsForDelegate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationSource.getDelegationChain
- **Scope:** instance
- **LLM Call Syntax:** `delegationSource.getDelegationChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: InMemoryDelegationSource
**File Path:** `RoleResolutionLib/src/registry/DelegationSource.ts`
**Constructor Usage:** `const instance = new InMemoryDelegationSource();`
**Description:** Non-persistent implementation using arrays for delegation storage.

### Raw JSDoc Context:
```javascript
/**
 * @class InMemoryDelegationSource
 * @extends DelegationSource
 * @description Non-persistent implementation using arrays for delegation storage.
 */
```

### Methods and properties of InMemoryDelegationSource

#### METHOD: InMemoryDelegationSource.addDelegation
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.addDelegation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryDelegationSource.getActiveDelegationsForPrincipal
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.getActiveDelegationsForPrincipal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryDelegationSource.getActiveDelegationsForDelegate
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.getActiveDelegationsForDelegate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryDelegationSource.getDelegationChain
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.getDelegationChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryDelegationSource.getAllDelegations
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.getAllDelegations();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryDelegationSource.clear
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryDelegationSource.clear();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: AssignmentSource
**File Path:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
**Constructor Usage:** `const instance = new AssignmentSource();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of AssignmentSource

#### METHOD: AssignmentSource.getAssignmentsForRole
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSource.getAssignmentsForRole();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentSource.getAssignmentsForActor
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSource.getAssignmentsForActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentSource.getActorById
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSource.getActorById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: InMemoryAssignmentSource
**File Path:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
**Constructor Usage:** `const instance = new InMemoryAssignmentSource();`
**Description:** Non-persistent implementation using arrays/maps for assignment storage.

### Raw JSDoc Context:
```javascript
/**
 * @class InMemoryAssignmentSource
 * @extends AssignmentSource
 * @description Non-persistent implementation using arrays/maps for assignment storage.
 */
```

### Methods and properties of InMemoryAssignmentSource

#### METHOD: InMemoryAssignmentSource.addAssignment
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.addAssignment();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.addActor
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.addActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.getAssignmentsForRole
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.getAssignmentsForRole();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.getAssignmentsForActor
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.getAssignmentsForActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.getActorById
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.getActorById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.getAllAssignments
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.getAllAssignments();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.getAllActors
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.getAllActors();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: InMemoryAssignmentSource.clear
- **Scope:** instance
- **LLM Call Syntax:** `inMemoryAssignmentSource.clear();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: RoutingResult
**File Path:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`
**Constructor Usage:** `const instance = new RoutingResult();`
**Description:** Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).

### Raw JSDoc Context:
```javascript
/**
 * @class RoutingResult
 * @description Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).
 */
```

### Methods and properties of RoutingResult

#### METHOD: RoutingResult.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = RoutingResult.empty();`
- **Pure JSDoc:**
```javascript
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
- **LLM Call Syntax:** `routingResult.isEmpty();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `routingResult.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `routingResult.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: RoutingResolver
**File Path:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
**Constructor Usage:** `const instance = new RoutingResolver();`
**Description:** Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).

### Raw JSDoc Context:
```javascript
/**
 * @class RoutingResolver
 * @description Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).
 */
```

### Methods and properties of RoutingResolver

#### METHOD: RoutingResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.resolve();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._determinePolicy
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._determinePolicy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveByPolicy
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveByPolicy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveDelegateOnly
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveDelegateOnly();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolvePrincipalOnly
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolvePrincipalOnly();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveBothEqual
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveBothEqual();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveDelegatePrimaryPrincipalCC
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveDelegatePrimaryPrincipalCC();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolvePrincipalPrimaryDelegateCC
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolvePrincipalPrimaryDelegateCC();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveChainAll
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveChainAll();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver._resolveDelegateOrPrincipal
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver._resolveDelegateOrPrincipal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver.resolveChainAllWithActors
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.resolveChainAllWithActors();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoutingResolver.getDefaultPolicy
- **Scope:** instance
- **LLM Call Syntax:** `routingResolver.getDefaultPolicy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: RoleResolver
**File Path:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
**Constructor Usage:** `const instance = new RoleResolver();`
**Description:** Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.

### Raw JSDoc Context:
```javascript
/**
 * @class RoleResolver
 * @description Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.
 */
```

### Methods and properties of RoleResolver

#### METHOD: RoleResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.resolve();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver.resolveMultiple
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.resolveMultiple();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver.resolveForActor
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.resolveForActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver.getRoutingFor
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver.getRoutingFor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver._validateScope
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver._validateScope();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver._applyResolutionStrategy
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver._applyResolutionStrategy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver._resolveDelegationChain
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver._resolveDelegationChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver._getEffectiveRoutingPolicy
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver._getEffectiveRoutingPolicy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RoleResolver._getActorsFromChain
- **Scope:** instance
- **LLM Call Syntax:** `roleResolver._getActorsFromChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ResolutionTrace
**File Path:** `RoleResolutionLib/src/internal/resolution/ResolutionTrace.ts`
**Constructor Usage:** `const instance = new ResolutionTrace();`
**Description:** Immutable sequence of explainable effective-assignment decisions.

### Raw JSDoc Context:
```javascript
/** Immutable sequence of explainable effective-assignment decisions. */
```

### Methods and properties of ResolutionTrace

#### METHOD: ResolutionTrace.append
- **Scope:** instance
- **LLM Call Syntax:** `resolutionTrace.append();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionTrace.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `resolutionTrace.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ResolutionPolicy
**File Path:** `RoleResolutionLib/src/internal/resolution/ResolutionPolicy.ts`
**Constructor Usage:** `const instance = new ResolutionPolicy();`
**Description:** Immutable policy options for effective-assignment resolution.

### Raw JSDoc Context:
```javascript
/** Immutable policy options for effective-assignment resolution. */
```

### Methods and properties of ResolutionPolicy

#### METHOD: ResolutionPolicy.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `resolutionPolicy.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: EffectiveAssignmentResolver
**File Path:** `RoleResolutionLib/src/internal/resolution/EffectiveAssignmentResolver.ts`
**Constructor Usage:** `const instance = new EffectiveAssignmentResolver();`
**Description:** Resolves generic candidates through temporal overrides, delegation, and routing.

### Raw JSDoc Context:
```javascript
/** Resolves generic candidates through temporal overrides, delegation, and routing. */
```

### Methods and properties of EffectiveAssignmentResolver

#### METHOD: EffectiveAssignmentResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver.resolve();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._resolveCandidate
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._resolveCandidate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._validateOverrides
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._validateOverrides();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._selectOverrideChain
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._selectOverrideChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._selectOverrideForActor
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._selectOverrideForActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._resolveDelegations
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._resolveDelegations();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._getOutgoingDelegations
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._getOutgoingDelegations();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EffectiveAssignmentResolver._getActor
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResolver._getActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: RoleResolutionError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new RoleResolutionError(message, context, originalError);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (roleId, scope, etc.).
   * @param {Error} [originalError=null] - Wrapped exception.
   */
```

<br>

## CLASS: RoleNotFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new RoleNotFoundError();`
**Description:** Thrown when a role ID is missing from the registry.

### Raw JSDoc Context:
```javascript
/**
 * @class RoleNotFoundError
 * @extends RoleResolutionError
 * @description Thrown when a role ID is missing from the registry.
 */
```

<br>

## CLASS: NoActorFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new NoActorFoundError();`
**Description:** Thrown when resolution logic yields an empty set for a role/scope.

### Raw JSDoc Context:
```javascript
/**
 * @class NoActorFoundError
 * @extends RoleResolutionError
 * @description Thrown when resolution logic yields an empty set for a role/scope.
 */
```

<br>

## CLASS: CircularDelegationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new CircularDelegationError();`
**Description:** Thrown when a loop is detected in the delegation graph.

### Raw JSDoc Context:
```javascript
/**
 * @class CircularDelegationError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected in the delegation graph.
 */
```

<br>

## CLASS: InvalidScopeError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new InvalidScopeError();`
**Description:** Thrown when a provided scope type is incompatible with role requirements.

### Raw JSDoc Context:
```javascript
/**
 * @class InvalidScopeError
 * @extends RoleResolutionError
 * @description Thrown when a provided scope type is incompatible with role requirements.
 */
```

<br>

## CLASS: DelegationDepthExceededError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new DelegationDepthExceededError();`
**Description:** Thrown when a chain exceeds safety limits (default 10).

### Raw JSDoc Context:
```javascript
/**
 * @class DelegationDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when a chain exceeds safety limits (default 10).
 */
```

<br>

## CLASS: RoleValidationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new RoleValidationError();`
**Description:** Thrown when role or actor definition schemas are violated.

### Raw JSDoc Context:
```javascript
/**
 * @class RoleValidationError
 * @extends RoleResolutionError
 * @description Thrown when role or actor definition schemas are violated.
 */
```

<br>

## CLASS: MalformedAssignmentSlotError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new MalformedAssignmentSlotError();`
**Description:** MalformedAssignmentSlotError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class MalformedAssignmentSlotError @extends RoleResolutionError */
```

<br>

## CLASS: DuplicateAssignmentSlotError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new DuplicateAssignmentSlotError();`
**Description:** DuplicateAssignmentSlotError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class DuplicateAssignmentSlotError @extends RoleResolutionError */
```

<br>

## CLASS: InconsistentAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new InconsistentAssignmentOverrideError();`
**Description:** InconsistentAssignmentOverrideError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class InconsistentAssignmentOverrideError @extends RoleResolutionError */
```

<br>

## CLASS: AmbiguousAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new AmbiguousAssignmentOverrideError();`
**Description:** AmbiguousAssignmentOverrideError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class AmbiguousAssignmentOverrideError @extends RoleResolutionError */
```

<br>

## CLASS: AssignmentActorNotFoundError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new AssignmentActorNotFoundError();`
**Description:** AssignmentActorNotFoundError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class AssignmentActorNotFoundError @extends RoleResolutionError */
```

<br>

## CLASS: OverlappingDelegationError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new OverlappingDelegationError();`
**Description:** OverlappingDelegationError @extends RoleResolutionError

### Raw JSDoc Context:
```javascript
/** @class OverlappingDelegationError @extends RoleResolutionError */
```

<br>

## CLASS: CircularAssignmentOverrideError
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new CircularAssignmentOverrideError();`
**Description:** Thrown when a loop is detected while walking an override chain.

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
**File Path:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`
**Constructor Usage:** `const instance = new OverrideChainDepthExceededError();`
**Description:** Thrown when an override chain exceeds the configured maximum depth.

### Raw JSDoc Context:
```javascript
/**
 * @class OverrideChainDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when an override chain exceeds the configured maximum depth.
 */
```

<br>

## CLASS: DelegationValidator
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
**Constructor Usage:** `const instance = new DelegationValidator();`
**Description:** Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.

### Raw JSDoc Context:
```javascript
/**
 * @class DelegationValidator
 * @description Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.
 */
```

### Methods and properties of DelegationValidator

#### METHOD: DelegationValidator.validate
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.validate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationValidator.validateChain
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.validateChain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationValidator._detectCycle
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator._detectCycle();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationValidator._checkScopeCoherence
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator._checkScopeCoherence();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationValidator.validateExtension
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.validateExtension();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationValidator.getMaxDelegationDepth
- **Scope:** instance
- **LLM Call Syntax:** `delegationValidator.getMaxDelegationDepth();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DelegationState
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationState.ts`
**Constructor Usage:** `const instance = new DelegationState();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DelegationState

#### METHOD: DelegationState._parseDate
- **Scope:** instance
- **LLM Call Syntax:** `delegationState._parseDate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationState.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.getMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationState.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `delegationState.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DelegationRules
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationRules.ts`
**Constructor Usage:** `const instance = new DelegationRules();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DelegationRules

#### METHOD: DelegationRules.isValidAt
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.isValidAt();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.appliesToRole
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.appliesToRole();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.appliesToScope
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.appliesToScope();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.appliesTo
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.appliesTo();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.isFullDelegation
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.isFullDelegation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.isIndefinite
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.isIndefinite();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationRules.getRemainingDays
- **Scope:** instance
- **LLM Call Syntax:** `delegationRules.getRemainingDays();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DelegationChain
**File Path:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
**Constructor Usage:** `const instance = new DelegationChain();`
**Description:** Immutable Collection representing a transitive series of Delegations (A -> B -> C).

### Raw JSDoc Context:
```javascript
/**
 * @class DelegationChain
 * @description Immutable Collection representing a transitive series of Delegations (A -> B -> C).
 */
```

### Methods and properties of DelegationChain

#### METHOD: DelegationChain.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = DelegationChain.empty();`
- **Pure JSDoc:**
```javascript
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
- **LLM Call Syntax:** `delegationChain.isEmpty();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getDepth
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getDepth();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getOriginalPrincipalId
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getOriginalPrincipalId();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getFinalDelegateId
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getFinalDelegateId();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getAllActorIds
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getAllActorIds();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getFirst
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getFirst();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getLast
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getLast();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.getAt
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.getAt();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.containsActor
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.containsActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.wouldCreateCycle
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.wouldCreateCycle();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.extend
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.extend();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.forEach
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.forEach();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.map
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.map();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.isValidAt
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.isValidAt();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DelegationChain.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: DelegationChain.toString
- **Scope:** instance
- **LLM Call Syntax:** `delegationChain.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Delegation
**File Path:** `RoleResolutionLib/src/internal/delegation/Delegation.ts`
**Constructor Usage:** `const instance = new Delegation();`
**Description:** Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.

### Raw JSDoc Context:
```javascript
/**
 * @class Delegation
 * @description Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.
 */
```

### Methods and properties of Delegation

#### METHOD: Delegation.equals
- **Scope:** instance
- **LLM Call Syntax:** `delegation.equals();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: Delegation.toString
- **Scope:** instance
- **LLM Call Syntax:** `delegation.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Scope
**File Path:** `RoleResolutionLib/src/core/Scope.ts`
**Constructor Usage:** `const instance = new Scope();`
**Description:** Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.

### Raw JSDoc Context:
```javascript
/**
 * @class Scope
 * @description Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.
 */
```

### Methods and properties of Scope

#### METHOD: Scope.global
- **Scope:** static
- **LLM Call Syntax:** `const result = Scope.global();`
- **Pure JSDoc:**
```javascript
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
- **LLM Call Syntax:** `scope.isGlobal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope.contains
- **Scope:** instance
- **LLM Call Syntax:** `scope.contains();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope.matches
- **Scope:** instance
- **LLM Call Syntax:** `scope.matches();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope.getValueString
- **Scope:** instance
- **LLM Call Syntax:** `scope.getValueString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `scope.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: Scope.toString
- **Scope:** instance
- **LLM Call Syntax:** `scope.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope._valuesEqual
- **Scope:** instance
- **LLM Call Syntax:** `scope._valuesEqual();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Scope._hierarchiesEqual
- **Scope:** instance
- **LLM Call Syntax:** `scope._hierarchiesEqual();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Role
**File Path:** `RoleResolutionLib/src/core/Role.ts`
**Constructor Usage:** `const instance = new Role();`
**Description:** Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.

### Raw JSDoc Context:
```javascript
/**
 * @class Role
 * @description Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.
 */
```

### Methods and properties of Role

#### METHOD: Role.isGlobal
- **Scope:** instance
- **LLM Call Syntax:** `role.isGlobal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.resolvesToAll
- **Scope:** instance
- **LLM Call Syntax:** `role.resolvesToAll();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.usesPriority
- **Scope:** instance
- **LLM Call Syntax:** `role.usesPriority();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.hasFallbacks
- **Scope:** instance
- **LLM Call Syntax:** `role.hasFallbacks();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `role.getMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.equals
- **Scope:** instance
- **LLM Call Syntax:** `role.equals();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Role.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `role.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: Role.toString
- **Scope:** instance
- **LLM Call Syntax:** `role.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ResolutionResult
**File Path:** `RoleResolutionLib/src/core/ResolutionResult.ts`
**Constructor Usage:** `const instance = new ResolutionResult();`
**Description:** Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).

### Raw JSDoc Context:
```javascript
/**
 * @class ResolutionResult
 * @description Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).
 */
```

### Methods and properties of ResolutionResult

#### METHOD: ResolutionResult.isResolved
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.isResolved();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.isDelegated
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.isDelegated();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.getDelegationDepth
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.getDelegationDepth();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.hasEffectiveActorChange
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.hasEffectiveActorChange();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.getAllRoutingRecipients
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.getAllRoutingRecipients();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.getAllActorIds
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.getAllActorIds();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
- **LLM Call Syntax:** `resolutionResult.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ResolutionResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `resolutionResult.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: EffectiveAssignmentResult
**File Path:** `RoleResolutionLib/src/core/EffectiveAssignmentResult.ts`
**Constructor Usage:** `const instance = new EffectiveAssignmentResult();`
**Description:** Immutable outcome of resolving a base assignment through overrides and delegation.

### Raw JSDoc Context:
```javascript
/** Immutable outcome of resolving a base assignment through overrides and delegation. */
```

### Methods and properties of EffectiveAssignmentResult

#### METHOD: EffectiveAssignmentResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `effectiveAssignmentResult.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: AssignmentSlot
**File Path:** `RoleResolutionLib/src/core/AssignmentSlot.ts`
**Constructor Usage:** `const instance = new AssignmentSlot();`
**Description:** Immutable, opaque set of dimensions identifying an assignment slot.

### Raw JSDoc Context:
```javascript
/** Immutable, opaque set of dimensions identifying an assignment slot. */
```

### Methods and properties of AssignmentSlot

#### METHOD: AssignmentSlot.get
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.get();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentSlot.matches
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.matches();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentSlot.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentSlot.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: AssignmentOverride
**File Path:** `RoleResolutionLib/src/core/AssignmentOverride.ts`
**Constructor Usage:** `const instance = new AssignmentOverride();`
**Description:** Immutable, dated actor replacement scoped by opaque assignment dimensions.

### Raw JSDoc Context:
```javascript
/** Immutable, dated actor replacement scoped by opaque assignment dimensions. */
```

### Methods and properties of AssignmentOverride

#### METHOD: AssignmentOverride.appliesAtDate
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.appliesAtDate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentOverride.matchesActor
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.matchesActor();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentOverride.matchesSlot
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.matchesSlot();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentOverride.matches
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.matches();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentOverride.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentOverride.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: AssignmentCandidate
**File Path:** `RoleResolutionLib/src/core/AssignmentCandidate.ts`
**Constructor Usage:** `const instance = new AssignmentCandidate();`
**Description:** Immutable candidate assignment that can become effective at a point in time.

### Raw JSDoc Context:
```javascript
/** Immutable candidate assignment that can become effective at a point in time. */
```

### Methods and properties of AssignmentCandidate

#### METHOD: AssignmentCandidate.isValidAt
- **Scope:** instance
- **LLM Call Syntax:** `assignmentCandidate.isValidAt();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AssignmentCandidate.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignmentCandidate.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Assignment
**File Path:** `RoleResolutionLib/src/core/Assignment.ts`
**Constructor Usage:** `const instance = new Assignment();`
**Description:** Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).

### Raw JSDoc Context:
```javascript
/**
 * @class Assignment
 * @description Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).
 */
```

### Methods and properties of Assignment

#### METHOD: Assignment._parseDate
- **Scope:** instance
- **LLM Call Syntax:** `assignment._parseDate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Assignment.isValidAt
- **Scope:** instance
- **LLM Call Syntax:** `assignment.isValidAt();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Assignment.matches
- **Scope:** instance
- **LLM Call Syntax:** `assignment.matches();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Assignment.equals
- **Scope:** instance
- **LLM Call Syntax:** `assignment.equals();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Assignment.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `assignment.getMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Assignment.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `assignment.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: Assignment.toString
- **Scope:** instance
- **LLM Call Syntax:** `assignment.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Actor
**File Path:** `RoleResolutionLib/src/core/Actor.ts`
**Constructor Usage:** `const instance = new Actor();`
**Description:** Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).

### Raw JSDoc Context:
```javascript
/**
 * @class Actor
 * @description Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).
 */
```

### Methods and properties of Actor

#### METHOD: Actor.person
- **Scope:** static
- **LLM Call Syntax:** `const result = Actor.person(id, email, displayName, metadata);`
- **Pure JSDoc:**
```javascript
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
- **LLM Call Syntax:** `actor.isPerson();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.isSystem
- **Scope:** instance
- **LLM Call Syntax:** `actor.isSystem();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.isGroup
- **Scope:** instance
- **LLM Call Syntax:** `actor.isGroup();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.equals
- **Scope:** instance
- **LLM Call Syntax:** `actor.equals();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `actor.getMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.withMetadata
- **Scope:** instance
- **LLM Call Syntax:** `actor.withMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Actor.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `actor.toJSON();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: Actor.toString
- **Scope:** instance
- **LLM Call Syntax:** `actor.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: splitCsvList
- **Source:** `RoleResolutionLib/src/utils/MateriaSlotParsing.ts`
- **LLM Call Syntax:** `const result = splitCsvList(raw);`
- **Pure JSDoc:**
```javascript
/**
 * @function splitCsvList
 * @description Splits a comma-separated string into trimmed, non-empty entries.
 * @param {string} raw - Raw CSV string (entries may have surrounding whitespace;
 *   empty entries, e.g. from a trailing/doubled comma, are dropped).
 * @returns {string[]} Trimmed, non-empty entries in original order.
 */
```

---
### FUNCTION: groupMateriaEntriesBySlot
- **Source:** `RoleResolutionLib/src/utils/MateriaSlotParsing.ts`
- **LLM Call Syntax:** `const result = groupMateriaEntriesBySlot(materieRaw);`
- **Pure JSDoc:**
```javascript
/**
 * @function groupMateriaEntriesBySlot
 * @description Groups a materia CSV's entries by slot qualifier, per-entry (a
 * single CSV can legitimately mix a bare materia with a slot-qualified one from
 * a different materia). `MATERIA` -> any slot (kind `'*'`); `MATERIA.itp` -> ITP;
 * `MATERIA.<anything else>` -> SPECIFICA (with that suffix as the specifica id).
 * @param {string} materieRaw - Raw CSV of materia entries, each optionally
 *   suffixed with `.itp` or `.<specifica id>`.
 * @returns {Array<{kind: string, specifica: string, materie: string[]}>} One
 *   group per distinct (kind, specifica) pair found, each collecting the base
 *   materia ids that share it, in first-seen order.
 */
```

---
### FUNCTION: slotCompatible
- **Source:** `RoleResolutionLib/src/utils/MateriaSlotParsing.ts`
- **LLM Call Syntax:** `const result = slotCompatible(a, b);`
- **Pure JSDoc:**
```javascript
/**
 * @function slotCompatible
 * @description Whether two slot qualifiers can refer to the same physical
 * teaching post (ANY matches any kind/specifica).
 * @param {{kind: string, specifica: string}} a
 * @param {{kind: string, specifica: string}} b
 * @returns {boolean}
 */
```

---
### FUNCTION: pairsOverlap
- **Source:** `RoleResolutionLib/src/utils/MateriaSlotParsing.ts`
- **LLM Call Syntax:** `const result = pairsOverlap(a, b);`
- **Pure JSDoc:**
```javascript
/**
 * @function pairsOverlap
 * @description True if any pair in `a` shares a (classe, materia) with a
 * slot-compatible pair in `b`.
 * @param {ReadonlyArray<{classeId: string, materia: string, kind: string, specifica: string}>} a
 * @param {ReadonlyArray<{classeId: string, materia: string, kind: string, specifica: string}>} b
 * @returns {boolean}
 */
```

---
### FUNCTION: register
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = register(roleOrDefinition);`
- **Pure JSDoc:**
```javascript
/**
   * @function register
   * @description Validates and persists a role. Overwrites existing IDs with a warning.
   * @param {Role|Object} roleOrDefinition - Role instance or raw definition POJO.
   * @returns {Role} The indexed Role instance.
   * @throws {RoleValidationError} If definition violates Role schema.
   */
```

---
### FUNCTION: registerAll
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = registerAll(roles);`
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
### FUNCTION: get
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = get(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function get
   * @param {string} roleId - Unique ID.
   * @returns {Role}
   * @throws {RoleNotFoundError} If ID is missing.
   */
```

---
### FUNCTION: getOrNull
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = getOrNull(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function getOrNull
   * @param {string} roleId - Unique ID.
   * @returns {Role|null}
   */
```

---
### FUNCTION: has
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = has(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function has
   * @param {string} roleId - Unique ID.
   * @returns {boolean}
   */
```

---
### FUNCTION: unregister
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = unregister(roleId);`
- **Pure JSDoc:**
```javascript
/**
   * @function unregister
   * @param {string} roleId - ID to purge.
   * @returns {boolean} True if found and deleted.
   */
```

---
### FUNCTION: getAll
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = getAll();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAll
   * @returns {Role[]} Complete set.
   */
```

---
### FUNCTION: getAllIds
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = getAllIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllIds
   * @returns {string[]} Keys only.
   */
```

---
### FUNCTION: size
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = size();`
- **Pure JSDoc:**
```javascript
/**
   * @function size
   * @returns {number}
   */
```

---
### FUNCTION: clear
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all registrations.
   */
```

---
### FUNCTION: find
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = find(predicate);`
- **Pure JSDoc:**
```javascript
/**
   * @function find
   * @param {Function} predicate - Boolean filter.
   * @returns {Role[]}
   */
```

---
### FUNCTION: findByScopeType
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = findByScopeType(scopeType);`
- **Pure JSDoc:**
```javascript
/**
   * @function findByScopeType
   * @param {string} scopeType - Enum filter.
   * @returns {Role[]}
   */
```

---
### FUNCTION: findDelegatable
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = findDelegatable();`
- **Pure JSDoc:**
```javascript
/**
   * @function findDelegatable
   * @returns {Role[]} Roles with allowsDelegation: true.
   */
```

---
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes indexed roles to mapped POJO.
   * @returns {Object} {roles: Object.<string, Object>}
   */
```

---
### FUNCTION: matchesContextDimensions
- **Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`
- **LLM Call Syntax:** `matchesContextDimensions();`
- **Pure JSDoc:**
```javascript
/** Matches opaque dimensions against literal, CSV, and wildcard values. */
```

---
### FUNCTION: getActiveDelegationsForPrincipal
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `const result = getActiveDelegationsForPrincipal(principalId, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function getActiveDelegationsForPrincipal
   * @param {string} principalId - Issuer ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
```

---
### FUNCTION: getActiveDelegationsForDelegate
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `const result = getActiveDelegationsForDelegate(delegateId, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function getActiveDelegationsForDelegate
   * @param {string} delegateId - Receiver ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
```

---
### FUNCTION: getDelegationChain
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `const result = getDelegationChain(actorId, roleId, scope, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function getDelegationChain
   * @description Synchronously crawls the delegation graph to build a linear chain for a specific context.
   * @param {string} actorId - Start ID.
   * @param {string} roleId - Role filter.
   * @param {Scope} scope - Scope filter.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]} Ordered transitive chain.
   */
```

---
### FUNCTION: addDelegation
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `addDelegation(delegation);`
- **Pure JSDoc:**
```javascript
/**
   * @function addDelegation
   * @param {Delegation} delegation - Record to append.
   */
```

---
### FUNCTION: getAllDelegations
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `const result = getAllDelegations();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllDelegations
   * @returns {Delegation[]} Complete set.
   */
```

---
### FUNCTION: clear
- **Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`
- **LLM Call Syntax:** `clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all internal delegations.
   */
```

---
### FUNCTION: getAssignmentsForRole
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `const result = getAssignmentsForRole(roleId, scope, asOfDate);`
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
```

---
### FUNCTION: getAssignmentsForActor
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `const result = getAssignmentsForActor(actorId, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAssignmentsForActor
   * @description Performs ID-based filtering on internal assignments.
   * @param {string} actorId - Actor to match.
   * @param {Date} [asOfDate=new Date()] - Validity check.
   * @returns {Assignment[]}
   */
```

---
### FUNCTION: getActorById
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `const result = getActorById(actorId);`
- **Pure JSDoc:**
```javascript
/**
   * @function getActorById
   * @param {string} actorId - Entity ID.
   * @returns {Actor|null}
   */
```

---
### FUNCTION: addAssignment
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `addAssignment(assignment);`
- **Pure JSDoc:**
```javascript
/**
   * @function addAssignment
   * @param {Assignment} assignment - Record to append.
   */
```

---
### FUNCTION: addActor
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `addActor(actor);`
- **Pure JSDoc:**
```javascript
/**
   * @function addActor
   * @param {Actor} actor - Entity to register.
   */
```

---
### FUNCTION: getAllAssignments
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `const result = getAllAssignments();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllAssignments
   * @returns {Assignment[]} Complete set.
   */
```

---
### FUNCTION: getAllActors
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `const result = getAllActors();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActors
   * @returns {Actor[]} Complete set.
   */
```

---
### FUNCTION: clear
- **Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`
- **LLM Call Syntax:** `clear();`
- **Pure JSDoc:**
```javascript
/**
   * @function clear
   * @description Purges all internal state.
   */
```

---
### FUNCTION: cloneAndFreeze
- **Source:** `RoleResolutionLib/src/internal/ImmutableValue.ts`
- **LLM Call Syntax:** `cloneAndFreeze();`
- **Pure JSDoc:**
```javascript
/** Creates a defensive deep clone with immutable, serialization-safe metadata values. */
```

---
### FUNCTION: isEmpty
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`
- **LLM Call Syntax:** `const result = isEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @function isEmpty
   * @returns {boolean} True if all buckets (primary, cc, bcc) are empty.
   */
```

---
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string summarizing TO and CC recipient counts/labels.
   */
```

---
### FUNCTION: resolve
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `const result = resolve(params, params.principalActor, params.effectiveActor, params.delegationChain, params.routingPolicy);`
- **Pure JSDoc:**
```javascript
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
### FUNCTION: _determinePolicy
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `const result = _determinePolicy(delegationChain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _determinePolicy
   * @description Extracts policy from the final link in the delegation chain.
   * @param {DelegationChain} delegationChain - Candidate links.
   * @returns {string} RoutingPolicy enum value.
   * @private
   */
```

---
### FUNCTION: _resolveByPolicy
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `const result = _resolveByPolicy(policy, principalActor, effectiveActor, delegationChain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveByPolicy
   * @description Strategy selector for specific RoutingPolicy implementations.
   * @param {string} policy - Strategy key.
   * @param {Actor} principalActor - Origin.
   * @param {Actor} effectiveActor - Target.
   * @param {DelegationChain} delegationChain - Hops.
   * @returns {RoutingResult}
   * @private
   */
```

---
### FUNCTION: _resolveDelegateOnly
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolveDelegateOnly();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveDelegateOnly
   * @private
   */
```

---
### FUNCTION: _resolvePrincipalOnly
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolvePrincipalOnly();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolvePrincipalOnly
   * @private
   */
```

---
### FUNCTION: _resolveBothEqual
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolveBothEqual();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveBothEqual
   * @private
   */
```

---
### FUNCTION: _resolveDelegatePrimaryPrincipalCC
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolveDelegatePrimaryPrincipalCC();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveDelegatePrimaryPrincipalCC
   * @private
   */
```

---
### FUNCTION: _resolvePrincipalPrimaryDelegateCC
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolvePrincipalPrimaryDelegateCC();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolvePrincipalPrimaryDelegateCC
   * @private
   */
```

---
### FUNCTION: _resolveChainAll
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolveChainAll();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveChainAll
   * @private
   */
```

---
### FUNCTION: _resolveDelegateOrPrincipal
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `_resolveDelegateOrPrincipal();`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveDelegateOrPrincipal
   * @description Delegate if resolved, otherwise the principal — a single
   * primary recipient, never both (ref REPORT_GLF.md B4: distinct from
   * DELEGATE_ONLY, which yields no recipient at all when no delegate is
   * resolved).
   * @private
   */
```

---
### FUNCTION: resolveChainAllWithActors
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `const result = resolveChainAllWithActors(chainActors);`
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
### FUNCTION: getDefaultPolicy
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`
- **LLM Call Syntax:** `const result = getDefaultPolicy();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDefaultPolicy
   * @returns {string}
   */
```

---
### FUNCTION: isValidRoutingPolicy
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingPolicy.ts`
- **LLM Call Syntax:** `const result = isValidRoutingPolicy(value);`
- **Pure JSDoc:**
```javascript
/**
 * @function isValidRoutingPolicy
 * @description Validates if a string is a recognized RoutingPolicy.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in RoutingPolicy.
 */
```

---
### FUNCTION: getRoutingPolicies
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingPolicy.ts`
- **LLM Call Syntax:** `const result = getRoutingPolicies();`
- **Pure JSDoc:**
```javascript
/**
 * @function getRoutingPolicies
 * @description Retrieves all supported policy strings.
 * @returns {string[]} Array of RoutingPolicy values.
 */
```

---
### FUNCTION: getRoutingPolicyDescription
- **Source:** `RoleResolutionLib/src/internal/routing/RoutingPolicy.ts`
- **LLM Call Syntax:** `const result = getRoutingPolicyDescription(policy);`
- **Pure JSDoc:**
```javascript
/**
 * @function getRoutingPolicyDescription
 * @description Maps enum key to functional human-readable label.
 * @param {string} policy - Enum value.
 * @returns {string} Narrative description.
 */
```

---
### FUNCTION: resolve
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = resolve(roleId, scope, options, options.asOfDate, options.routingPolicy, options.includeFallbacks);`
- **Pure JSDoc:**
```javascript
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
### FUNCTION: resolveMultiple
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = resolveMultiple(roleIds, scope, options);`
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
### FUNCTION: resolveForActor
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = resolveForActor(actorId, scope, options);`
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
### FUNCTION: getRoutingFor
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = getRoutingFor(roleId, scope, options);`
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
### FUNCTION: _validateScope
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `_validateScope(role, scope);`
- **Pure JSDoc:**
```javascript
/**
   * @function _validateScope
   * @description Internal scope constraint enforcement.
   * @param {Role} role - Definition.
   * @param {Scope} scope - Input.
   * @throws {InvalidScopeError} On mismatch.
   * @private
   */
```

---
### FUNCTION: _applyResolutionStrategy
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = _applyResolutionStrategy(assignments, strategy);`
- **Pure JSDoc:**
```javascript
/**
   * @function _applyResolutionStrategy
   * @description Internal filtering based on Role strategy.
   * @param {Assignment[]} assignments - Candidates.
   * @param {string} strategy - Algorithm key.
   * @returns {Assignment[]} Filtered/sorted subset.
   * @private
   */
```

---
### FUNCTION: _resolveDelegationChain
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = _resolveDelegationChain(actor, roleId, scope, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function _resolveDelegationChain
   * @description Transitive delegate lookup with depth protection.
   * @param {Actor} actor - Principal.
   * @param {string} roleId - Filter.
   * @param {Scope} scope - Filter.
   * @param {Date} asOfDate - Validity.
   * @returns {Object} {effectiveActor, chain}
   * @throws {DelegationDepthExceededError} If limit reached.
   * @private
   */
```

---
### FUNCTION: _getEffectiveRoutingPolicy
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = _getEffectiveRoutingPolicy(chain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _getEffectiveRoutingPolicy
   * @description Extracts policy from chain (last segment preferred).
   * @param {DelegationChain} chain - Resolved path.
   * @returns {string}
   * @private
   */
```

---
### FUNCTION: _getActorsFromChain
- **Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`
- **LLM Call Syntax:** `const result = _getActorsFromChain(principalActor, chain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _getActorsFromChain
   * @description Deduplicated traversal of chain to retrieve Actor instances.
   * @param {Actor} principalActor - Initial entity.
   * @param {DelegationChain} chain - Resolved path.
   * @returns {Actor[]}
   * @private
   */
```

---
### FUNCTION: validate
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = validate(delegation, context);`
- **Pure JSDoc:**
```javascript
/**
   * @function validate
   * @description Validates structural integrity, temporal constraints, and actor/role existence.
   * @param {Delegation} delegation - Target for validation.
   * @param {Object} [context={}] - External registry checks (actorExists, roleExists).
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
```

---
### FUNCTION: validateChain
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = validateChain(chain, context);`
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
### FUNCTION: _detectCycle
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = _detectCycle(chain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _detectCycle
   * @description Scans actor IDs for duplicates indicating a loop.
   * @param {DelegationChain} chain - Target for inspection.
   * @returns {Object} {hasCycle: boolean, cycleDescription: string|null}
   * @private
   */
```

---
### FUNCTION: _checkScopeCoherence
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = _checkScopeCoherence(chain);`
- **Pure JSDoc:**
```javascript
/**
   * @function _checkScopeCoherence
   * @description Warns if scope restrictions are not progressively narrower or equal.
   * @param {DelegationChain} chain - Target for inspection.
   * @returns {string[]} Warning messages.
   * @private
   */
```

---
### FUNCTION: validateExtension
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = validateExtension(chain, delegation, context);`
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
### FUNCTION: getMaxDelegationDepth
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`
- **LLM Call Syntax:** `const result = getMaxDelegationDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getMaxDelegationDepth
   * @returns {number}
   */
```

---
### FUNCTION: isEmpty
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = isEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @function isEmpty
   * @returns {boolean} True if delegations array is empty.
   */
```

---
### FUNCTION: getDepth
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDepth
   * @returns {number} Count of delegation segments.
   */
```

---
### FUNCTION: getOriginalPrincipalId
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getOriginalPrincipalId();`
- **Pure JSDoc:**
```javascript
/**
   * @function getOriginalPrincipalId
   * @description Retrieves ID of the first actor in the chain.
   * @returns {string|null}
   */
```

---
### FUNCTION: getFinalDelegateId
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getFinalDelegateId();`
- **Pure JSDoc:**
```javascript
/**
   * @function getFinalDelegateId
   * @description Retrieves ID of the last actor in the chain.
   * @returns {string|null}
   */
```

---
### FUNCTION: getAllActorIds
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getAllActorIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActorIds
   * @description Ordered list of all actors involved (Principal + all Delegates).
   * @returns {string[]}
   */
```

---
### FUNCTION: getFirst
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getFirst();`
- **Pure JSDoc:**
```javascript
/**
   * @function getFirst
   * @returns {Delegation|null} First delegation segment.
   */
```

---
### FUNCTION: getLast
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getLast();`
- **Pure JSDoc:**
```javascript
/**
   * @function getLast
   * @returns {Delegation|null} Final delegation segment.
   */
```

---
### FUNCTION: getAt
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = getAt(index);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAt
   * @param {number} index - 0-based position.
   * @returns {Delegation|null} Segment at index or null.
   */
```

---
### FUNCTION: containsActor
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = containsActor(actorId);`
- **Pure JSDoc:**
```javascript
/**
   * @function containsActor
   * @param {string} actorId - ID to check.
   * @returns {boolean}
   */
```

---
### FUNCTION: wouldCreateCycle
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = wouldCreateCycle(delegation);`
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
### FUNCTION: extend
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = extend(delegation);`
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
### FUNCTION: forEach
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `forEach(callback);`
- **Pure JSDoc:**
```javascript
/**
   * @function forEach
   * @param {Function} callback - (delegation, index).
   */
```

---
### FUNCTION: map
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = map(mapper);`
- **Pure JSDoc:**
```javascript
/**
   * @function map
   * @param {Function} mapper - (delegation, index).
   * @returns {Array}
   */
```

---
### FUNCTION: isValidAt
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = isValidAt(asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function isValidAt
   * @description Validates every segment in the chain against timestamp.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean}
   */
```

---
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes chain to POJO.
   * @returns {Object} {delegations, depth, originalPrincipalId, finalDelegateId}
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: DelegationChain[ID1 -> ID2 -> ID3].
   */
```

---
### FUNCTION: equals
- **Source:** `RoleResolutionLib/src/internal/delegation/Delegation.ts`
- **LLM Call Syntax:** `const result = equals(other);`
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
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/internal/delegation/Delegation.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Delegation[ID] PRINCIPAL -> DELEGATE [Roles] [Period] (Reason).
   */
```

---
### FUNCTION: isValidScopeType
- **Source:** `RoleResolutionLib/src/core/ScopeType.ts`
- **LLM Call Syntax:** `const result = isValidScopeType(value);`
- **Pure JSDoc:**
```javascript
/**
 * @function isValidScopeType
 * @description Validates if a string is a recognized ScopeType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ScopeType.
 */
```

---
### FUNCTION: getScopeTypes
- **Source:** `RoleResolutionLib/src/core/ScopeType.ts`
- **LLM Call Syntax:** `const result = getScopeTypes();`
- **Pure JSDoc:**
```javascript
/**
 * @function getScopeTypes
 * @description Retrieves all supported scope type strings.
 * @returns {string[]} Array of ScopeType values.
 */
```

---
### FUNCTION: isGlobal
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = isGlobal();`
- **Pure JSDoc:**
```javascript
/**
   * @function isGlobal
   * @returns {boolean} True if type is GLOBAL.
   */
```

---
### FUNCTION: contains
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = contains(other);`
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
### FUNCTION: matches
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = matches(other);`
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
### FUNCTION: getValueString
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = getValueString();`
- **Pure JSDoc:**
```javascript
/**
   * @function getValueString
   * @description Stringifies the scope value.
   * @returns {string}
   */
```

---
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to POJO.
   * @returns {Object} {type, value, hierarchy}
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Scope[TYPE:VALUE] (Path)
   */
```

---
### FUNCTION: _valuesEqual
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = _valuesEqual(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function _valuesEqual
   * @private
   * @description Checks if the value of this scope equals another scope's value.
   * @param {Scope} other - The other scope.
   * @returns {boolean}
   */
```

---
### FUNCTION: _hierarchiesEqual
- **Source:** `RoleResolutionLib/src/core/Scope.ts`
- **LLM Call Syntax:** `const result = _hierarchiesEqual(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function _hierarchiesEqual
   * @private
   * @description Checks if the hierarchy of this scope equals another scope's hierarchy.
   * @param {Scope} other - The other scope.
   * @returns {boolean}
   */
```

---
### FUNCTION: isGlobal
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = isGlobal();`
- **Pure JSDoc:**
```javascript
/**
   * @function isGlobal
   * @returns {boolean} True if scopeType is GLOBAL.
   */
```

---
### FUNCTION: resolvesToAll
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = resolvesToAll();`
- **Pure JSDoc:**
```javascript
/**
   * @function resolvesToAll
   * @returns {boolean} True if strategy is ALL.
   */
```

---
### FUNCTION: usesPriority
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = usesPriority();`
- **Pure JSDoc:**
```javascript
/**
   * @function usesPriority
   * @returns {boolean} True if strategy is PRIORITY.
   */
```

---
### FUNCTION: hasFallbacks
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = hasFallbacks();`
- **Pure JSDoc:**
```javascript
/**
   * @function hasFallbacks
   * @returns {boolean} True if fallbackRoles array is non-empty.
   */
```

---
### FUNCTION: getMetadata
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = getMetadata(key, defaultValue);`
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
### FUNCTION: equals
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = equals(other);`
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
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes role definition to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/core/Role.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Role[ID] Name (Scope, Strategy).
   */
```

---
### FUNCTION: isValidResolutionStrategy
- **Source:** `RoleResolutionLib/src/core/ResolutionStrategy.ts`
- **LLM Call Syntax:** `const result = isValidResolutionStrategy(value);`
- **Pure JSDoc:**
```javascript
/**
 * @function isValidResolutionStrategy
 * @description Validates if a string is a recognized ResolutionStrategy.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ResolutionStrategy.
 */
```

---
### FUNCTION: getResolutionStrategies
- **Source:** `RoleResolutionLib/src/core/ResolutionStrategy.ts`
- **LLM Call Syntax:** `const result = getResolutionStrategies();`
- **Pure JSDoc:**
```javascript
/**
 * @function getResolutionStrategies
 * @description Retrieves all supported strategy strings.
 * @returns {string[]} Array of ResolutionStrategy values.
 */
```

---
### FUNCTION: isResolved
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = isResolved();`
- **Pure JSDoc:**
```javascript
/**
   * @function isResolved
   * @returns {boolean} True if an effectiveActor was found.
   */
```

---
### FUNCTION: isDelegated
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = isDelegated();`
- **Pure JSDoc:**
```javascript
/**
   * @function isDelegated
   * @returns {boolean} True if delegationChain is non-empty.
   */
```

---
### FUNCTION: getDelegationDepth
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = getDelegationDepth();`
- **Pure JSDoc:**
```javascript
/**
   * @function getDelegationDepth
   * @returns {number} Count of delegation hops.
   */
```

---
### FUNCTION: hasEffectiveActorChange
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = hasEffectiveActorChange();`
- **Pure JSDoc:**
```javascript
/**
   * @function hasEffectiveActorChange
   * @description Checks if delegation resulted in a different actor identity.
   * @returns {boolean}
   */
```

---
### FUNCTION: getAllRoutingRecipients
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = getAllRoutingRecipients();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllRoutingRecipients
   * @description Aggregates primary, cc, and bcc actor arrays.
   * @returns {Object[]} Combined list of all notified actors.
   */
```

---
### FUNCTION: getAllActorIds
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = getAllActorIds();`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllActorIds
   * @description Extracts unique actor IDs from all resolution facets.
   * @returns {string[]} Set of involved actor IDs.
   */
```

---
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Deeply serializes all result facets to POJO.
   * @returns {Object} JSON-compatible structure.
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: ResolutionResult[ROLE] -> EFFECTIVE (delegation/fallback).
   */
```

---
### FUNCTION: _parseDate
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = _parseDate(value);`
- **Pure JSDoc:**
```javascript
/**
   * @function _parseDate
   * @description Normalizes Date objects or ISO strings. Delegates to the
   * shared CoreUtilsLib date parser.
   * @param {Date|string|null} value - Raw input.
   * @returns {Date|null} Valid Date or null if unparseable.
   * @private
   */
```

---
### FUNCTION: isValidAt
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = isValidAt(asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function isValidAt
   * @description Checks isActive status and temporal boundaries.
   * @param {Date} [asOfDate=new Date()] - Reference point.
   * @returns {boolean} True if within [validFrom, validTo].
   */
```

---
### FUNCTION: matches
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = matches(roleId, scope, asOfDate);`
- **Pure JSDoc:**
```javascript
/**
   * @function matches
   * @description Validates roleId, temporal eligibility, and scope containment.
   * @param {string} roleId - Query role.
   * @param {Scope} scope - Query scope.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean} True if assignment satisfies query parameters.
   */
```

---
### FUNCTION: equals
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * @function equals
   * @description Structural equality check (role, actor, scope).
   * @param {Assignment} other - Target for comparison.
   * @returns {boolean}
   */
```

---
### FUNCTION: getMetadata
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = getMetadata(key, defaultValue);`
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
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to plain object for persistence.
   * @returns {Object} JSON-compatible representation.
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/core/Assignment.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug string: Assignment[ROLE -> ACTOR] Scope [Validity]
   */
```

---
### FUNCTION: isValidActorType
- **Source:** `RoleResolutionLib/src/core/ActorType.ts`
- **LLM Call Syntax:** `const result = isValidActorType(value);`
- **Pure JSDoc:**
```javascript
/**
 * @function isValidActorType
 * @description Validates if a string is a recognized ActorType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ActorType.
 */
```

---
### FUNCTION: getActorTypes
- **Source:** `RoleResolutionLib/src/core/ActorType.ts`
- **LLM Call Syntax:** `const result = getActorTypes();`
- **Pure JSDoc:**
```javascript
/**
 * @function getActorTypes
 * @description Retrieves all supported actor type strings.
 * @returns {string[]} Array of ActorType values.
 */
```

---
### FUNCTION: isPerson
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = isPerson();`
- **Pure JSDoc:**
```javascript
/**
   * @function isPerson
   * @returns {boolean} True if type is PERSON.
   */
```

---
### FUNCTION: isSystem
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = isSystem();`
- **Pure JSDoc:**
```javascript
/**
   * @function isSystem
   * @returns {boolean} True if type is SYSTEM.
   */
```

---
### FUNCTION: isGroup
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = isGroup();`
- **Pure JSDoc:**
```javascript
/**
   * @function isGroup
   * @returns {boolean} True if type is GROUP.
   */
```

---
### FUNCTION: equals
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = equals(other);`
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
### FUNCTION: getMetadata
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = getMetadata(key, defaultValue);`
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
### FUNCTION: withMetadata
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = withMetadata(additionalMetadata);`
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
### FUNCTION: toJSON
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @function toJSON
   * @description Serializes to plain object.
   * @returns {Object} {id, type, identifier, displayName, metadata}
   */
```

---
### FUNCTION: toString
- **Source:** `RoleResolutionLib/src/core/Actor.ts`
- **LLM Call Syntax:** `const result = toString();`
- **Pure JSDoc:**
```javascript
/**
   * @function toString
   * @returns {string} Debug representation: Actor[TYPE:ID] Name <Identifier>
   */
```

---
