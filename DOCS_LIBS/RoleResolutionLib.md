# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [RoleResolutionLib](#roleresolutionlib)

---

## RoleResolutionLib

Role Resolution Library - Layer 2 service for resolving abstract roles to concrete actors.

### Actor

Actor value object representing an entity that can hold roles.

**Initialization:**

```javascript
new Actor();
```

**Static Methods:**

- `person(id: string, email: string, displayName: string, metadata={}: Object): Actor`

  > this.id = id; /** this.type = type; /** this.identifier = identifier; /** this.displayName = displayName; /** this.metadata = cloneDeep(metadata); // Freeze the instance to ensure immutability Object.freeze(this); Object.freeze(this.metadata); } /**

- `system(id: string, serviceId: string, displayName: string, metadata={}: Object): Actor`

- `group(id: string, groupId: string, displayName: string, metadata={}: Object): Actor`

- `fromJSON(obj: Object): Actor`

**Methods:**

- `isPerson(): boolean`

- `isSystem(): boolean`

- `isGroup(): boolean`

- `equals(other: Actor): boolean`

- `getMetadata(key: string, defaultValue=null: *): *`

- `withMetadata(additionalMetadata: Object): Actor`

- `toJSON(): Object`

- `toString(): string`

### Assignment

Assignment value object representing a role-actor-scope association.

**Initialization:**

```javascript
new Assignment();
```

**Static Methods:**

- `fromJSON(obj: Object): Assignment`

**Methods:**

- `equals(asOfDate=new Date(): Date, roleId: string, scope: Scope, asOfDate=new Date(): Date, other: Assignment): boolean`

  > / isValidAt(asOfDate = new Date()) { // Check active flag if (!this.isActive) { return false; } // Check validFrom if (this.validFrom !== null && asOfDate < this.validFrom) { return false; } // Check validTo if (this.validTo !== null && asOfDate > this.validTo) { return false; } return true; } /** / matches(roleId, scope, asOfDate = new Date()) { // Check role if (this.roleId !== roleId) { return false; } // Check validity if (!this.isValidAt(asOfDate)) { return false; } // Check scope - assignment scope must contain the query scope // or be exactly equal to it return this.scope.contains(scope) || this.scope.matches(scope); } /**

- `getMetadata(key: string, defaultValue=null: *): *`

- `toJSON(): Object`

- `toString(): string`

### ResolutionResult

ResolutionResult representing the complete result of role resolution.

**Initialization:**

```javascript
new ResolutionResult();
```

**Static Methods:**

- `empty(requestedRole: Object, scope: Object, metadata={}: Object): ResolutionResult`

- `simple(requestedRole: Object, scope: Object, actor: Object): ResolutionResult`

**Methods:**

- `isResolved(): boolean`

  > The role that was requested.

- `isDelegated(): boolean`

- `getDelegationDepth(): number`

- `hasEffectiveActorChange(): boolean`

- `getAllRoutingRecipients(): Object[]`

- `getAllActorIds(): string[]`

- `toJSON(): Object`

- `toString(): string`

### Role

Role value object representing a role definition.

**Initialization:**

```javascript
new Role();
```

**Static Methods:**

- `fromJSON(obj: Object): Role`

**Methods:**

- `isGlobal(): boolean`

  > this.id = id; /** this.name = name; /** this.description = description; /** this.scopeType = scopeType; /** this.resolutionStrategy = resolutionStrategy; /** this.allowsDelegation = allowsDelegation; /** this.fallbackRoles = [...fallbackRoles]; /** this.metadata = cloneDeep(metadata); // Freeze the instance Object.freeze(this); Object.freeze(this.fallbackRoles); Object.freeze(this.metadata); } /**

- `resolvesToAll(): boolean`

- `usesPriority(): boolean`

- `hasFallbacks(): boolean`

- `getMetadata(key: string, defaultValue=null: *): *`

- `equals(other: Role): boolean`

- `toJSON(): Object`

- `toString(): string`

### Scope

Scope value object representing a validity context for roles.

**Initialization:**

```javascript
new Scope();
```

**Static Methods:**

- `global(): Scope`

  > this.type = type; /** this.value = value !== null ? cloneDeep(value) : null; /** this.hierarchy = Array.isArray(hierarchy) ? [...hierarchy] : []; // Freeze the instance to ensure immutability Object.freeze(this); Object.freeze(this.hierarchy); } /**

- `orgUnit(value: string, hierarchy=[: string[]): Scope`

- `project(value: string|Object): Scope`

- `resource(value: string|Object): Scope`

- `custom(value: string|Object, hierarchy=[: string[]): Scope`

- `fromJSON(obj: Object): Scope`

**Methods:**

- `isGlobal(): boolean`

- `contains(other: Scope): boolean`

- `matches(other: Scope): boolean`

- `getValueString(): string`

- `toJSON(): Object`

- `toString(): string`

### Delegation

Delegation value object representing a responsibility transfer.

**Initialization:**

```javascript
new Delegation();
```

**Static Methods:**

- `fromJSON(obj: Object): Delegation`

**Methods:**

- `equals(other: Delegation): boolean`

- `toString(): string`

### DelegationChain

DelegationChain representing a chain of delegations.

**Initialization:**

```javascript
new DelegationChain();
```

**Static Methods:**

- `empty(): DelegationChain`

  > this.delegations = [...delegations]; Object.freeze(this); Object.freeze(this.delegations); } /**

- `single(delegation: Delegation): DelegationChain`

- `fromJSON(obj: Object): DelegationChain`

**Methods:**

- `isEmpty(): boolean`

- `getDepth(): number`

- `getOriginalPrincipalId(): string|null`

- `getFinalDelegateId(): string|null`

- `getAllActorIds(): string[]`

- `getFirst(): Delegation|null`

- `getLast(): Delegation|null`

- `getAt(index: number): Delegation|null`

- `containsActor(actorId: string): boolean`

- `wouldCreateCycle(delegation: Delegation): boolean`

- `extend(delegation: Delegation): DelegationChain`

- `forEach(callback: Function): void`

- `map(mapper: Function): Array`

- `toJSON(asOfDate=new Date(): Date): boolean`

  > / isValidAt(asOfDate = new Date()) { return this.delegations.every((d) => d.isValidAt(asOfDate)); } /**

- `toString(): string`

### DelegationRules

Business rules and applicability logic for a Delegation.

**Initialization:**

```javascript
new DelegationRules();
```

### DelegationValidator

Validator for delegations and delegation chains.

**Initialization:**

```javascript
new DelegationValidator();
```

**Methods:**

- `validate(delegation: Delegation, context={}: Object): Object`

  > this._maxDelegationDepth = options.maxDelegationDepth || 10; /** this._logger = options.logger || console; } /**

- `validateChain(chain: DelegationChain, context={}: Object): Object`

- `validateExtension(chain: DelegationChain, delegation: Delegation, context={}: Object): Object`

- `getMaxDelegationDepth(): number`

### RoleResolutionError

Base error class and specialized errors for role resolution.

**Initialization:**

```javascript
new RoleResolutionError();
```

### RoleNotFoundError

@constructor
@param {string} message - Error details.
@param {Object} [context={}] - Metadata (roleId, scope, etc.).
@param {Error} [originalError=null] - Wrapped exception.
/
constructor(message, context = {}, originalError = null) {
super(message, context, originalError);
this.name = 'RoleResolutionError';
}
}

**Initialization:**

```javascript
new RoleNotFoundError();
```

### NoActorFoundError

@constructor
@param {string} roleId - The unknown role identifier.
@param {Object} [context={}] - Additional metadata.
/
constructor(roleId, context = {}) {
super(`Role not found: ${roleId}`, { ...context, roleId });
this.name = 'RoleNotFoundError';
this.roleId = roleId;
}
}

**Initialization:**

```javascript
new NoActorFoundError();
```

### ActorNotFoundError

@constructor
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

**Initialization:**

```javascript
new ActorNotFoundError();
```

### CircularDelegationError

@constructor
@param {string} actorId - The missing actor identifier.
@param {Object} [context={}] - Additional metadata.
/
constructor(actorId, context = {}) {
super(`Actor not found: ${actorId}`, { ...context, actorId });
this.name = 'ActorNotFoundError';
this.actorId = actorId;
}
}

**Initialization:**

```javascript
new CircularDelegationError();
```

### InvalidScopeError

@constructor
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

**Initialization:**

```javascript
new InvalidScopeError();
```

### DelegationDepthExceededError

@constructor
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

**Initialization:**

```javascript
new DelegationDepthExceededError();
```

### RoleValidationError

@constructor
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

**Initialization:**

```javascript
new RoleValidationError();
```

### Effective assignment API

`AssignmentSlot` is an immutable, opaque set of application-defined dimensions.
The resolver only uses those dimensions for stable identity and wildcard-aware matching;
it imposes no school- or organization-specific slot schema.

### AssignmentSlot

`new AssignmentSlot({ dimensions: Record<string, string | number | boolean | null> })`

- `get(name: string): string | number | boolean | null`
- `matches(scopeDimensions: Record<string, string | number | boolean | null>): boolean`
- `toJSON(): { dimensions: Record<string, string | number | boolean | null> }`

### AssignmentCandidate

`new AssignmentCandidate({ id, actorId, slot, validFrom, validTo, source, priority, metadata })`

- `isValidAt(date: Date): boolean`
- `toJSON(): Object`

### AssignmentOverride

`new AssignmentOverride({ id, previousActorId, nextActorId, slotScope, effectiveFrom, source, metadata })`

- `matches(candidate: AssignmentCandidate, date: Date): boolean`
- `toJSON(): Object`

### EffectiveAssignmentResolver

`new EffectiveAssignmentResolver({ actorSource, assignmentSource, overrideSource, delegationSource, policy, routingResolver })`

- `resolve({ context, asOfDate, routingPolicy }): EffectiveAssignmentResult[]`

### Source adapters

- `WideRowAssignmentSource` maps arrays or synchronous `rows(context)` callbacks into candidates.
- `MappedOverrideSource` maps generic dated override rows.
- `MappedDelegationSource` maps generic context-scoped delegation rows.
- `CompositeAssignmentSource` merges and deduplicates source results.

`ActorSource`, `AssignmentSource`, and `OverrideSource` are the public persistence
contracts used by the resolver. `AssignmentSource` exposes
`getAssignments(context, asOfDate)`; the previous role-oriented source contract is
not part of this breaking public API.

### RoleResolver

Main role resolution engine.

**Initialization:**

```javascript
new RoleResolver();
```

**Methods:**

- `resolve(roleId: string, scope: Scope, options={}: Object, options.asOfDate=new Date(): Date, options.routingPolicy=null: string, options.includeFallbacks=true: boolean): ResolutionResult`

  > this._roleRegistry = roleRegistry; /** this._assignmentSource = assignmentSource; /** this._delegationSource = delegationSource; /** this._logger = options.logger || console; /** this._defaultRoutingPolicy = options.defaultRoutingPolicy || RoutingPolicy.DELEGATE_ONLY; /** this._maxDelegationDepth = options.maxDelegationDepth || 10; /** this._throwOnNotFound = options.throwOnNotFound === true; /** this._delegationValidator = new DelegationValidator({ maxDelegationDepth: this._maxDelegationDepth, logger: this._logger }); /** this._routingResolver = new RoutingResolver({ logger: this._logger, defaultPolicy: this._defaultRoutingPolicy }); } /**

- `resolveMultiple(roleIds: string[], scope: Scope, options={}: Object): Map<string, ResolutionResult>`

- `resolveForActor(actorId: string, scope: Scope, options={}: Object): Object`

- `getRoutingFor(roleId: string, scope: Scope, options={}: Object): Object`

### RoutingResolver

Resolves routing based on delegation chain and routing policies.

**Initialization:**

```javascript
new RoutingResolver();
```

**Methods:**

- `resolve(params: Object, params.principalActor: Actor, params.effectiveActor=null: Actor, params.delegationChain=null: DelegationChain, params.routingPolicy=null: string): RoutingResult`

  > Logger instance.

- `resolveChainAllWithActors(chainActors: Actor[]): RoutingResult`

- `getDefaultPolicy(): string`

### RoutingResult

RoutingResult representing the routing decision for communications.

**Initialization:**

```javascript
new RoutingResult();
```

**Static Methods:**

- `empty(): RoutingResult`

  > this.primary = Array.isArray(data.primary) ? [...data.primary] : []; /** this.cc = Array.isArray(data.cc) ? [...data.cc] : []; /** this.bcc = Array.isArray(data.bcc) ? [...data.bcc] : []; /** this.metadata = cloneDeep(data.metadata || {}); // Freeze the instance Object.freeze(this); Object.freeze(this.primary); Object.freeze(this.cc); Object.freeze(this.bcc); Object.freeze(this.metadata); } /**

- `singlePrimary(actor: Actor): RoutingResult`

- `allPrimary(actors: Actor[]): RoutingResult`

**Methods:**

- `isEmpty(): boolean`

- `getTotalRecipientCount(): number`

- `getAllRecipients(): Actor[]`

- `getUniqueRecipientIds(): string[]`

- `containsRecipient(actorId: string): boolean`

- `getRecipientCategory(actorId: string): string|null`

- `withPrimary(actor: Actor): RoutingResult`

- `withCC(actor: Actor): RoutingResult`

- `withBCC(actor: Actor): RoutingResult`

- `merge(other: RoutingResult): RoutingResult`

- `toJSON(): Object`

- `toString(): string`

### AssignmentSource

Interface definition for assignment data sources.

**Initialization:**

```javascript
new AssignmentSource(roleId: string, scope: Scope, asOfDate=new Date(): Date)
```

**Methods:**

- `getActorById(roleId: string, scope: Scope, asOfDate=new Date(): Date, actorId: string, asOfDate=new Date(): Date, actorId: string): Assignment[]`
  > / getAssignmentsForRole(roleId, scope, asOfDate = new Date()) { throw new Error('AssignmentSource.getAssignmentsForRole() must be implemented'); } /** / getAssignmentsForActor(actorId, asOfDate = new Date()) { throw new Error('AssignmentSource.getAssignmentsForActor() must be implemented'); } /**

### InMemoryAssignmentSource

@function getAssignmentsForRole
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

**Initialization:**

```javascript
new InMemoryAssignmentSource(actorId: string, asOfDate=new Date(): Date)
```

**Methods:**

- `addAssignment(assignment: Assignment): void`

  > this._assignments = data.assignments || []; /** this._actors = new Map(); // Index actors if (Array.isArray(data.actors)) { data.actors.forEach((actor) => { this._actors.set(actor.id, actor); }); } } /**

- `addActor(actor: Actor): void`

- `getActorById(roleId: string, scope: Scope, asOfDate=new Date(): Date, actorId: string, asOfDate=new Date(): Date, actorId: string): Assignment[]`

  > / getAssignmentsForRole(roleId, scope, asOfDate = new Date()) { return this._assignments.filter((assignment) => { // Check role match if (assignment.roleId !== roleId) { return false; } // Check validity if assignment has isValidAt method if (typeof assignment.isValidAt === 'function') { if (!assignment.isValidAt(asOfDate)) { return false; } } else { // Manual validity check if (assignment.isActive === false) { return false; } if (assignment.validFrom && asOfDate < new Date(assignment.validFrom)) { return false; } if (assignment.validTo && asOfDate > new Date(assignment.validTo)) { return false; } } // Check scope match if assignment has scope matching method if (typeof assignment.scope?.contains === 'function') { return assignment.scope.contains(scope) || assignment.scope.matches(scope); } // Simple scope match - check type and value if (assignment.scope) { const assignmentScope = assignment.scope; const queryScope = scope; // Global scope matches everything if (assignmentScope.type === 'GLOBAL') { return true; } // Same type and value match if (assignmentScope.type === queryScope.type) { return assignmentScope.value === queryScope.value; } } return true; }); } /** / getAssignmentsForActor(actorId, asOfDate = new Date()) { return this._assignments.filter((assignment) => { if (assignment.actorId !== actorId) { return false; } // Check validity if (typeof assignment.isValidAt === 'function') { return assignment.isValidAt(asOfDate); } // Manual validity check if (assignment.isActive === false) { return false; } if (assignment.validFrom && asOfDate < new Date(assignment.validFrom)) { return false; } if (assignment.validTo && asOfDate > new Date(assignment.validTo)) { return false; } return true; }); } /**

- `getAllAssignments(): Assignment[]`

- `getAllActors(): Actor[]`

- `clear(): void`

### DelegationSource

Interface definition for delegation data sources.

**Initialization:**

```javascript
new DelegationSource(principalId: string, asOfDate=new Date(): Date)
```

### InMemoryDelegationSource

@function getActiveDelegationsForPrincipal
Retrieves delegations issued by an actor that are valid at a specific time.
@param {string} principalId - Issuing actor ID.
@param {Date} [asOfDate=new Date()] - Temporal validity point.
@returns {Delegation[]}
@abstract
/
getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
throw new Error('DelegationSource.getActiveDelegationsForPrincipal() must be implemented');
}

**Initialization:**

```javascript
new InMemoryDelegationSource(delegateId: string, asOfDate=new Date(): Date)
```

**Methods:**

- `addDelegation(delegation: Delegation): void`

  > this._delegations = data.delegations || []; } /**

- `getAllDelegations(principalId: string, asOfDate=new Date(): Date, delegateId: string, asOfDate=new Date(): Date, actorId: string, roleId: string, scope: Scope, asOfDate=new Date(): Date): Delegation[]`

  > / getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) { return this._delegations.filter((delegation) => { if (delegation.principalId !== principalId) { return false; } return this._isValidDelegation(delegation, asOfDate); }); } /** / getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) { return this._delegations.filter((delegation) => { if (delegation.delegateId !== delegateId) { return false; } return this._isValidDelegation(delegation, asOfDate); }); } /** / getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) { const chain = []; const visited = new Set(); let currentActorId = actorId; while (currentActorId && !visited.has(currentActorId)) { visited.add(currentActorId); // Find delegations from this actor const delegations = this.getActiveDelegationsForPrincipal(currentActorId, asOfDate); // Find a delegation that applies to the role and scope const applicableDelegation = delegations.find((delegation) => { // Check if delegation applies to this role if (typeof delegation.appliesToRole === 'function') { if (!delegation.appliesToRole(roleId)) { return false; } } else { // Manual check if (delegation.roleIds !== '*' && !delegation.roleIds?.includes(roleId)) { return false; } } // Check if delegation applies to this scope if (typeof delegation.appliesToScope === 'function') { return delegation.appliesToScope(scope); } return true; }); if (applicableDelegation) { chain.push(applicableDelegation); currentActorId = applicableDelegation.delegateId; } else { break; } } return chain; } /**

- `clear(): void`

### RoleRegistry

Registry for role definitions.

**Initialization:**

```javascript
new RoleRegistry();
```

**Static Methods:**

- `fromJSON(obj: Object, options={}: Object): RoleRegistry`

**Methods:**

- `register(roleOrDefinition: Role|Object): Role`

  > this._logger = options.logger || console; /** this._roles = new Registry({ entityName: 'role' }); // Register initial roles if (Array.isArray(options.initialRoles)) { options.initialRoles.forEach((role) => this.register(role)); } } /**

- `registerAll(roles: (Role|Object)[]): Role[]`

- `getOrNull(roleId: string): Role|null`

- `has(roleId: string): boolean`

- `unregister(roleId: string): boolean`

- `getAll(): Role[]`

- `getAllIds(): string[]`

- `size(): number`

- `clear(): void`

- `find(predicate: Function): Role[]`

- `findByScopeType(scopeType: string): Role[]`

- `findDelegatable(): Role[]`

- `toJSON(): Object`

---
