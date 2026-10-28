# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [RoleResolutionLib](#roleresolutionlib)

---

## RoleResolutionLib

Role Resolution Library - Layer 2 service for resolving abstract roles to concrete actors.

### Actor

**Source:** `RoleResolutionLib/src/core/Actor.ts`

Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).

**Initialization:**
```javascript
new Actor()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `person` | `person(id: string, email: string, displayName: string, metadata={}: Object): Actor` |
| `system` | `system(id: string, serviceId: string, displayName: string, metadata={}: Object): Actor` |
| `group` | `group(id: string, groupId: string, displayName: string, metadata={}: Object): Actor` |
| `fromJSON` | `fromJSON(obj: Object): Actor` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isPerson` | `isPerson(): void` |
| `isSystem` | `isSystem(): void` |
| `isGroup` | `isGroup(): void` |
| `equals` | `equals(): void` |
| `getMetadata` | `getMetadata(): void` |
| `withMetadata` | `withMetadata(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Assignment

**Source:** `RoleResolutionLib/src/core/Assignment.ts`

Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).

**Initialization:**
```javascript
new Assignment()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Assignment` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_parseDate` | `_parseDate(): void` |
| `isValidAt` | `isValidAt(): void` |
| `matches` | `matches(): void` |
| `equals` | `equals(): void` |
| `getMetadata` | `getMetadata(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### AssignmentCandidate

**Source:** `RoleResolutionLib/src/core/AssignmentCandidate.ts`

Immutable candidate assignment that can become effective at a point in time.

**Initialization:**
```javascript
new AssignmentCandidate()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isValidAt` | `isValidAt(): void` |
| `toJSON` | `toJSON(): void` |


### AssignmentOverride

**Source:** `RoleResolutionLib/src/core/AssignmentOverride.ts`

Immutable, dated actor replacement scoped by opaque assignment dimensions.

**Initialization:**
```javascript
new AssignmentOverride()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `appliesAtDate` | `appliesAtDate(): void` |
| `matchesActor` | `matchesActor(): void` |
| `matchesSlot` | `matchesSlot(): void` |
| `matches` | `matches(): void` |
| `toJSON` | `toJSON(): void` |


### AssignmentSlot

**Source:** `RoleResolutionLib/src/core/AssignmentSlot.ts`

Immutable, opaque set of dimensions identifying an assignment slot.

**Initialization:**
```javascript
new AssignmentSlot()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(): void` |
| `matches` | `matches(): void` |
| `toJSON` | `toJSON(): void` |


### EffectiveAssignmentResult

**Source:** `RoleResolutionLib/src/core/EffectiveAssignmentResult.ts`

Immutable outcome of resolving a base assignment through overrides and delegation.

**Initialization:**
```javascript
new EffectiveAssignmentResult()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): void` |


### ResolutionResult

**Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`

Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).

**Initialization:**
```javascript
new ResolutionResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(requestedRole: Object, scope: Object, metadata={}: Object): ResolutionResult` |
| `simple` | `simple(requestedRole: Object, scope: Object, actor: Object): ResolutionResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isResolved` | `isResolved(): void` |
| `isDelegated` | `isDelegated(): void` |
| `getDelegationDepth` | `getDelegationDepth(): void` |
| `hasEffectiveActorChange` | `hasEffectiveActorChange(): void` |
| `getAllRoutingRecipients` | `getAllRoutingRecipients(): void` |
| `getAllActorIds` | `getAllActorIds(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Role

**Source:** `RoleResolutionLib/src/core/Role.ts`

Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.

**Initialization:**
```javascript
new Role()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Role` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isGlobal` | `isGlobal(): void` |
| `resolvesToAll` | `resolvesToAll(): void` |
| `usesPriority` | `usesPriority(): void` |
| `hasFallbacks` | `hasFallbacks(): void` |
| `getMetadata` | `getMetadata(): void` |
| `equals` | `equals(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Scope

**Source:** `RoleResolutionLib/src/core/Scope.ts`

Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.

**Initialization:**
```javascript
new Scope()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `global` | `global(): Scope` |
| `orgUnit` | `orgUnit(value: string, hierarchy=[: string[]): Scope` |
| `project` | `project(value: string|Object): Scope` |
| `resource` | `resource(value: string|Object): Scope` |
| `custom` | `custom(value: string|Object, hierarchy=[: string[]): Scope` |
| `fromJSON` | `fromJSON(obj: Object): Scope` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isGlobal` | `isGlobal(): void` |
| `contains` | `contains(): void` |
| `matches` | `matches(): void` |
| `getValueString` | `getValueString(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |
| `_valuesEqual` | `_valuesEqual(): void` |
| `_hierarchiesEqual` | `_hierarchiesEqual(): void` |


### Delegation

**Source:** `RoleResolutionLib/src/internal/delegation/Delegation.ts`

Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.

**Initialization:**
```javascript
new Delegation()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Delegation` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `equals` | `equals(): void` |
| `toString` | `toString(): void` |


### DelegationChain

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`

Immutable Collection representing a transitive series of Delegations (A -> B -> C).

**Initialization:**
```javascript
new DelegationChain()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(): DelegationChain` |
| `single` | `single(delegation: Delegation): DelegationChain` |
| `fromJSON` | `fromJSON(obj: Object): DelegationChain` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isEmpty` | `isEmpty(): void` |
| `getDepth` | `getDepth(): void` |
| `getOriginalPrincipalId` | `getOriginalPrincipalId(): void` |
| `getFinalDelegateId` | `getFinalDelegateId(): void` |
| `getAllActorIds` | `getAllActorIds(): void` |
| `getFirst` | `getFirst(): void` |
| `getLast` | `getLast(): void` |
| `getAt` | `getAt(): void` |
| `containsActor` | `containsActor(): void` |
| `wouldCreateCycle` | `wouldCreateCycle(): void` |
| `extend` | `extend(): void` |
| `forEach` | `forEach(): void` |
| `map` | `map(): void` |
| `isValidAt` | `isValidAt(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### DelegationRules

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationRules.ts`

**Initialization:**
```javascript
new DelegationRules()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isValidAt` | `isValidAt(): void` |
| `appliesToRole` | `appliesToRole(): void` |
| `appliesToScope` | `appliesToScope(): void` |
| `appliesTo` | `appliesTo(): void` |
| `isFullDelegation` | `isFullDelegation(): void` |
| `isIndefinite` | `isIndefinite(): void` |
| `getRemainingDays` | `getRemainingDays(): void` |


### DelegationState

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationState.ts`

**Initialization:**
```javascript
new DelegationState()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_parseDate` | `_parseDate(): void` |
| `getMetadata` | `getMetadata(): void` |
| `toJSON` | `toJSON(): void` |


### DelegationValidator

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`

Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.

**Initialization:**
```javascript
new DelegationValidator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validate` | `validate(): void` |
| `validateChain` | `validateChain(): void` |
| `_detectCycle` | `_detectCycle(): void` |
| `_checkScopeCoherence` | `_checkScopeCoherence(): void` |
| `validateExtension` | `validateExtension(): void` |
| `getMaxDelegationDepth` | `getMaxDelegationDepth(): void` |


### RoleResolutionError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

**Initialization:**
```javascript
new RoleResolutionError(message: string, context={}: Object, originalError=null: Error)
```


### RoleNotFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a role ID is missing from the registry.

**Initialization:**
```javascript
new RoleNotFoundError()
```


### NoActorFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when resolution logic yields an empty set for a role/scope.

**Initialization:**
```javascript
new NoActorFoundError()
```


### CircularDelegationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a loop is detected in the delegation graph.

**Initialization:**
```javascript
new CircularDelegationError()
```


### InvalidScopeError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a provided scope type is incompatible with role requirements.

**Initialization:**
```javascript
new InvalidScopeError()
```


### DelegationDepthExceededError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a chain exceeds safety limits (default 10).

**Initialization:**
```javascript
new DelegationDepthExceededError()
```


### RoleValidationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when role or actor definition schemas are violated.

**Initialization:**
```javascript
new RoleValidationError()
```


### MalformedAssignmentSlotError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

MalformedAssignmentSlotError @extends RoleResolutionError

**Initialization:**
```javascript
new MalformedAssignmentSlotError()
```


### DuplicateAssignmentSlotError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

DuplicateAssignmentSlotError @extends RoleResolutionError

**Initialization:**
```javascript
new DuplicateAssignmentSlotError()
```


### InconsistentAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

InconsistentAssignmentOverrideError @extends RoleResolutionError

**Initialization:**
```javascript
new InconsistentAssignmentOverrideError()
```


### AmbiguousAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

AmbiguousAssignmentOverrideError @extends RoleResolutionError

**Initialization:**
```javascript
new AmbiguousAssignmentOverrideError()
```


### AssignmentActorNotFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

AssignmentActorNotFoundError @extends RoleResolutionError

**Initialization:**
```javascript
new AssignmentActorNotFoundError()
```


### OverlappingDelegationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

OverlappingDelegationError @extends RoleResolutionError

**Initialization:**
```javascript
new OverlappingDelegationError()
```


### CircularAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a loop is detected while walking an override chain.

**Initialization:**
```javascript
new CircularAssignmentOverrideError()
```


### OverrideChainDepthExceededError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when an override chain exceeds the configured maximum depth.

**Initialization:**
```javascript
new OverrideChainDepthExceededError()
```


### EffectiveAssignmentResolver

**Source:** `RoleResolutionLib/src/internal/resolution/EffectiveAssignmentResolver.ts`

Resolves generic candidates through temporal overrides, delegation, and routing.

**Initialization:**
```javascript
new EffectiveAssignmentResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `_resolveCandidate` | `_resolveCandidate(): void` |
| `_validateOverrides` | `_validateOverrides(): void` |
| `_selectOverrideChain` | `_selectOverrideChain(): void` |
| `_selectOverrideForActor` | `_selectOverrideForActor(): void` |
| `_resolveDelegations` | `_resolveDelegations(): void` |
| `_getOutgoingDelegations` | `_getOutgoingDelegations(): void` |
| `_getActor` | `_getActor(): void` |


### ResolutionPolicy

**Source:** `RoleResolutionLib/src/internal/resolution/ResolutionPolicy.ts`

Immutable policy options for effective-assignment resolution.

**Initialization:**
```javascript
new ResolutionPolicy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): void` |


### ResolutionTrace

**Source:** `RoleResolutionLib/src/internal/resolution/ResolutionTrace.ts`

Immutable sequence of explainable effective-assignment decisions.

**Initialization:**
```javascript
new ResolutionTrace()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `append` | `append(): void` |
| `toJSON` | `toJSON(): void` |


### RoleResolver

**Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`

Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.

**Initialization:**
```javascript
new RoleResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `resolveMultiple` | `resolveMultiple(): void` |
| `resolveForActor` | `resolveForActor(): void` |
| `getRoutingFor` | `getRoutingFor(): void` |
| `_validateScope` | `_validateScope(): void` |
| `_applyResolutionStrategy` | `_applyResolutionStrategy(): void` |
| `_resolveDelegationChain` | `_resolveDelegationChain(): void` |
| `_getEffectiveRoutingPolicy` | `_getEffectiveRoutingPolicy(): void` |
| `_getActorsFromChain` | `_getActorsFromChain(): void` |


### RoutingResolver

**Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`

Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).

**Initialization:**
```javascript
new RoutingResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `_determinePolicy` | `_determinePolicy(): void` |
| `_resolveByPolicy` | `_resolveByPolicy(): void` |
| `_resolveDelegateOnly` | `_resolveDelegateOnly(): void` |
| `_resolvePrincipalOnly` | `_resolvePrincipalOnly(): void` |
| `_resolveBothEqual` | `_resolveBothEqual(): void` |
| `_resolveDelegatePrimaryPrincipalCC` | `_resolveDelegatePrimaryPrincipalCC(): void` |
| `_resolvePrincipalPrimaryDelegateCC` | `_resolvePrincipalPrimaryDelegateCC(): void` |
| `_resolveChainAll` | `_resolveChainAll(): void` |
| `_resolveDelegateOrPrincipal` | `_resolveDelegateOrPrincipal(): void` |
| `resolveChainAllWithActors` | `resolveChainAllWithActors(): void` |
| `getDefaultPolicy` | `getDefaultPolicy(): void` |


### RoutingResult

**Source:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`

Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).

**Initialization:**
```javascript
new RoutingResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(): RoutingResult` |
| `singlePrimary` | `singlePrimary(actor: Actor): RoutingResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isEmpty` | `isEmpty(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### AssignmentSource

**Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`

**Initialization:**
```javascript
new AssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignmentsForRole` | `getAssignmentsForRole(): void` |
| `getAssignmentsForActor` | `getAssignmentsForActor(): void` |
| `getActorById` | `getActorById(): void` |


### InMemoryAssignmentSource

**Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`

Non-persistent implementation using arrays/maps for assignment storage.

**Initialization:**
```javascript
new InMemoryAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addAssignment` | `addAssignment(): void` |
| `addActor` | `addActor(): void` |
| `getAssignmentsForRole` | `getAssignmentsForRole(): void` |
| `getAssignmentsForActor` | `getAssignmentsForActor(): void` |
| `getActorById` | `getActorById(): void` |
| `getAllAssignments` | `getAllAssignments(): void` |
| `getAllActors` | `getAllActors(): void` |
| `clear` | `clear(): void` |


### DelegationSource

**Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`

**Initialization:**
```javascript
new DelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActiveDelegationsForPrincipal` | `getActiveDelegationsForPrincipal(): void` |
| `getActiveDelegationsForDelegate` | `getActiveDelegationsForDelegate(): void` |
| `getDelegationChain` | `getDelegationChain(): void` |


### InMemoryDelegationSource

**Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`

Non-persistent implementation using arrays for delegation storage.

**Initialization:**
```javascript
new InMemoryDelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addDelegation` | `addDelegation(): void` |
| `getActiveDelegationsForPrincipal` | `getActiveDelegationsForPrincipal(): void` |
| `getActiveDelegationsForDelegate` | `getActiveDelegationsForDelegate(): void` |
| `getDelegationChain` | `getDelegationChain(): void` |
| `getAllDelegations` | `getAllDelegations(): void` |
| `clear` | `clear(): void` |


### EffectiveAssignmentSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

Generic persistence contracts for effective-assignment resolution.

**Initialization:**
```javascript
new EffectiveAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### OverrideSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

**Initialization:**
```javascript
new OverrideSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOverrides` | `getOverrides(): void` |


### ActorSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

**Initialization:**
```javascript
new ActorSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActor` | `getActor(): void` |


### WideRowAssignmentSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps wide, tabular rows to opaque assignment candidates.

**Initialization:**
```javascript
new WideRowAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### MappedOverrideSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps generic rows to dated, opaque assignment overrides.

**Initialization:**
```javascript
new MappedOverrideSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOverrides` | `getOverrides(): void` |


### MappedDelegationSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps generic rows to context-scoped delegation values.

**Initialization:**
```javascript
new MappedDelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDelegations` | `getDelegations(): void` |


### CompositeAssignmentSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Combines independent candidate sources with a deterministic identity.

**Initialization:**
```javascript
new CompositeAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### RoleRegistry

**Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`

Centralized CRUD store for Role definitions. Handles validation and indexing.

**Initialization:**
```javascript
new RoleRegistry()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object, options={}: Object): RoleRegistry` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `registerAll` | `registerAll(): void` |
| `get` | `get(): void` |
| `getOrNull` | `getOrNull(): void` |
| `has` | `has(): void` |
| `unregister` | `unregister(): void` |
| `getAll` | `getAll(): void` |
| `getAllIds` | `getAllIds(): void` |
| `size` | `size(): void` |
| `clear` | `clear(): void` |
| `find` | `find(): void` |
| `findByScopeType` | `findByScopeType(): void` |
| `findDelegatable` | `findDelegatable(): void` |
| `toJSON` | `toJSON(): void` |


---

