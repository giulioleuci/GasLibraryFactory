/**
 * @file RoleResolutionLib/index.js
 * @description Role Resolution Library - Layer 2 service for resolving abstract roles to concrete actors.
 * @version 1.0.0
 *
 * **RoleResolutionLib** is a domain-agnostic library for resolving abstract roles
 * to concrete actors, with full support for delegation chains and communication routing.
 *
 * ## Key Features
 *
 * **Role Resolution:**
 * - Resolve abstract roles (e.g., "MANAGER", "APPROVER") to concrete actors
 * - Support for multiple resolution strategies (FIRST, ALL, PRIORITY)
 * - Fallback role chains when primary role has no assignments
 * - Scope-aware resolution (GLOBAL, ORG_UNIT, PROJECT, RESOURCE, CUSTOM)
 *
 * **Delegation Management:**
 * - Full and partial role delegation
 * - Temporal delegation validity (validFrom, validTo)
 * - Scope restriction for delegations
 * - Transitive delegation chains (A → B → C)
 * - Cycle detection and depth limiting
 *
 * **Communication Routing:**
 * - Six routing policies for delegation scenarios
 * - DELEGATE_ONLY: Only the delegate receives notifications
 * - PRINCIPAL_ONLY: Only the principal receives notifications
 * - BOTH_EQUAL: Both receive notifications equally
 * - DELEGATE_PRIMARY_PRINCIPAL_CC: Delegate in TO, principal in CC
 * - PRINCIPAL_PRIMARY_DELEGATE_CC: Principal in TO, delegate in CC
 * - CHAIN_ALL: All actors in delegation chain receive notifications
 *
 * ## Architecture
 *
 * **Layer 2** library depending only on CoreUtilsLib.
 *
 * **Components:**
 * - Core: Role, Actor, Scope, Assignment, ResolutionResult
 * - Delegation: Delegation, DelegationChain, DelegationValidator
 * - Routing: RoutingPolicy, RoutingResolver, RoutingResult
 * - Resolution: RoleResolver (main engine)
 * - Registry: RoleRegistry, AssignmentSource, DelegationSource
 * - Errors: Specialized error classes
 *
 * **Data Source Abstraction:**
 * - AssignmentSource and DelegationSource are interfaces
 * - In-memory implementations provided for testing
 * - Implement with SheetDBLib or other persistence for production
 *
 * ## Dependencies
 *
 * - **CoreUtilsLib**: BaseError, cloneDeep, isEqual
 *
 * @module RoleResolutionLib
 * @version 1.0.0
 *
 * @example
 * // Basic role resolution
 * import {
 *   RoleResolver,
 *   RoleRegistry,
 *   Role,
 *   Actor,
 *   Scope,
 *   Assignment,
 *   ScopeType,
 *   InMemoryAssignmentSource,
 *   InMemoryDelegationSource
 * } from '@RoleResolutionLib';
 *
 * // Setup registry and sources
 * const registry = new RoleRegistry();
 * registry.register(new Role({
 *   id: 'DEPT_MANAGER',
 *   name: 'Department Manager',
 *   scopeType: ScopeType.ORG_UNIT,
 *   allowsDelegation: true
 * }));
 *
 * const assignmentSource = new InMemoryAssignmentSource({
 *   actors: [Actor.person('user-123', 'john@example.com', 'John Doe')],
 *   assignments: [new Assignment({
 *     roleId: 'DEPT_MANAGER',
 *     actorId: 'user-123',
 *     scope: Scope.orgUnit('Sales')
 *   })]
 * });
 *
 * const delegationSource = new InMemoryDelegationSource();
 *
 * // Create resolver and resolve
 * const resolver = new RoleResolver(registry, assignmentSource, delegationSource);
 * const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Sales'));
 *
 * if (result.isResolved()) {
 *   console.log('Manager:', result.effectiveActor.displayName);
 *   console.log('Notify:', result.routing.primary.map(a => a.identifier));
 * }
 *
 * @example
 * // Resolution with delegation
 * import { Delegation, RoutingPolicy } from '@RoleResolutionLib';
 *
 * // Add delegation
 * delegationSource.addDelegation(new Delegation({
 *   id: 'del-001',
 *   principalId: 'user-123',
 *   delegateId: 'user-456',
 *   roleIds: '*',
 *   validFrom: new Date('2025-01-01'),
 *   validTo: new Date('2025-01-31'),
 *   routingPolicy: RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC,
 *   reason: 'Vacation'
 * }));
 *
 * // Resolve - will find delegate
 * const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Sales'));
 * console.log('Principal:', result.principalActor.displayName); // John Doe
 * console.log('Effective:', result.effectiveActor.displayName); // Delegate's name
 * console.log('Delegated:', result.isDelegated()); // true
 *
 * @see RoleResolver For the main resolution engine
 * @see RoleRegistry For role definition management
 * @see Delegation For delegation model
 * @see RoutingPolicy For routing options
 */

// Core value objects and enums
export { ScopeType, isValidScopeType, getScopeTypes } from './src/core/ScopeType.js';
export { ActorType, isValidActorType, getActorTypes } from './src/core/ActorType.js';
export {
  ResolutionStrategy,
  isValidResolutionStrategy,
  getResolutionStrategies
} from './src/core/ResolutionStrategy.js';
export { Scope } from './src/core/Scope.js';
export { Actor } from './src/core/Actor.js';
export { Role } from './src/core/Role.js';
export { Assignment } from './src/core/Assignment.js';
export { ResolutionResult } from './src/core/ResolutionResult.js';

// Delegation classes
export { Delegation } from './src/internal/delegation/Delegation.js';
export { DelegationChain } from './src/internal/delegation/DelegationChain.js';
export { DelegationValidator } from './src/internal/delegation/DelegationValidator.js';

// Routing classes
export {
  RoutingPolicy,
  isValidRoutingPolicy,
  getRoutingPolicies,
  getRoutingPolicyDescription
} from './src/internal/routing/RoutingPolicy.js';
export { RoutingResult } from './src/internal/routing/RoutingResult.js';
export { RoutingResolver } from './src/internal/routing/RoutingResolver.js';

// Registry and data sources
export { RoleRegistry } from './src/registry/RoleRegistry.js';
export { AssignmentSource, InMemoryAssignmentSource } from './src/registry/AssignmentSource.js';
export { DelegationSource, InMemoryDelegationSource } from './src/registry/DelegationSource.js';

// Resolution engine
export { RoleResolver } from './src/internal/resolution/RoleResolver.js';

// Error classes
export {
  RoleResolutionError,
  RoleNotFoundError,
  NoActorFoundError,
  ActorNotFoundError,
  CircularDelegationError,
  InvalidScopeError,
  DelegationDepthExceededError,
  RoleValidationError
} from './src/internal/errors/RoleResolutionError.js';
