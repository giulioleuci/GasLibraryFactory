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
export class RoleResolver {
  /**
   * @constructor
   * @param {RoleRegistry} roleRegistry - CRUD store for role definitions.
   * @param {AssignmentSource} assignmentSource - Persistence layer for role-actor bindings.
   * @param {DelegationSource} delegationSource - Persistence layer for responsibility transfers.
   * @param {Object} [options={}] - Engine configuration.
   * @param {Object} [options.logger=console] - Telemetry target.
   * @param {string} [options.defaultRoutingPolicy=RoutingPolicy.DELEGATE_ONLY] - Fallback routing strategy.
   * @param {number} [options.maxDelegationDepth=10] - Safety threshold for transitive hops.
   * @param {boolean} [options.throwOnNotFound=false] - If true, failed resolution triggers NoActorFoundError.
   * @throws {Error} If registries/sources are missing.
   */
  constructor(roleRegistry, assignmentSource, delegationSource, options = {}) {
    if (!roleRegistry) {
      throw new Error('RoleRegistry is required');
    }
    if (!assignmentSource) {
      throw new Error('AssignmentSource is required');
    }
    if (!delegationSource) {
      throw new Error('DelegationSource is required');
    }

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

    /** @type {DelegationValidator} @private */
    this._delegationValidator = new DelegationValidator({
      maxDelegationDepth: this._maxDelegationDepth,
      logger: this._logger
    });

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
  resolve(roleId, scope, options = {}) {
    const { asOfDate = new Date(), routingPolicy = null, includeFallbacks = true } = options;

    this._logger.debug?.(
      `Resolving role: ${roleId} in scope: ${scope?.toString?.() || JSON.stringify(scope)}`
    );

    // Step 1: Get role from registry
    const role = this._roleRegistry.get(roleId);
    if (!role) {
      throw new RoleNotFoundError(roleId);
    }

    // Step 2: Validate scope type (if role has specific scope type)
    this._validateScope(role, scope);

    // Step 3: Get assignments for role in scope
    const assignments = this._assignmentSource.getAssignmentsForRole(roleId, scope, asOfDate);

    // Step 4: Apply resolution strategy to get actors
    const selectedAssignments = this._applyResolutionStrategy(assignments, role.resolutionStrategy);

    // Step 5: If no assignments found, try fallback roles
    let fallbackUsed = false;
    let fallbackRoleId = null;

    if (selectedAssignments.length === 0 && includeFallbacks && role.hasFallbacks()) {
      for (const fallbackId of role.fallbackRoles) {
        this._logger.debug?.(`Trying fallback role: ${fallbackId}`);
        try {
          const fallbackResult = this.resolve(fallbackId, scope, {
            ...options,
            includeFallbacks: false // Prevent infinite recursion
          });

          if (fallbackResult.isResolved()) {
            fallbackUsed = true;
            fallbackRoleId = fallbackId;

            // Return result with fallback info
            return new ResolutionResult({
              requestedRole: role,
              scope,
              effectiveActor: fallbackResult.effectiveActor,
              principalActor: fallbackResult.principalActor,
              allActors: fallbackResult.allActors,
              delegationChain: fallbackResult.delegationChain,
              routing: fallbackResult.routing,
              fallbackUsed: true,
              fallbackRoleId,
              metadata: {
                originalRoleId: roleId,
                resolvedViaFallback: true
              }
            });
          }
        } catch (error) {
          // Continue to next fallback
          this._logger.debug?.(`Fallback ${fallbackId} failed: ${error.message}`);
        }
      }
    }

    // Step 6: If still no assignments, return empty or throw
    if (selectedAssignments.length === 0) {
      if (this._throwOnNotFound) {
        throw new NoActorFoundError(roleId, scope);
      }
      return ResolutionResult.empty(role, scope);
    }

    // Step 7: Resolve actors and delegations for each assignment
    const resolvedActors = [];
    const primaryAssignment = selectedAssignments[0];
    let principalActor = null;
    let effectiveActor = null;
    let delegationChain = DelegationChain.empty();

    for (const assignment of selectedAssignments) {
      const actor = this._assignmentSource.getActorById(assignment.actorId);
      if (!actor) {
        this._logger.warn?.(`Actor not found: ${assignment.actorId}`);
        continue;
      }

      resolvedActors.push(actor);

      // For the primary assignment, resolve delegation
      if (assignment === primaryAssignment) {
        principalActor = actor;

        // Step 8: Resolve delegation chain
        const delegationResult = this._resolveDelegationChain(actor, roleId, scope, asOfDate);

        effectiveActor = delegationResult.effectiveActor;
        delegationChain = delegationResult.chain;
      }
    }

    // If still no effective actor, use principal
    if (!effectiveActor && principalActor) {
      effectiveActor = principalActor;
    }

    // Step 9: Resolve routing
    const policy = routingPolicy || this._getEffectiveRoutingPolicy(delegationChain);
    const routing = this._routingResolver.resolve({
      principalActor,
      effectiveActor,
      delegationChain,
      routingPolicy: policy
    });

    // If CHAIN_ALL and we have the chain, enrich routing with all actors
    if (policy === RoutingPolicy.CHAIN_ALL && !delegationChain.isEmpty()) {
      const chainActors = this._getActorsFromChain(principalActor, delegationChain);
      const enrichedRouting = this._routingResolver.resolveChainAllWithActors(chainActors);
      routing.primary = enrichedRouting.primary;
    }

    // Step 10: Build and return result
    return new ResolutionResult({
      requestedRole: role,
      scope,
      effectiveActor,
      principalActor,
      allActors: resolvedActors,
      delegationChain: delegationChain.delegations,
      routing: routing.toJSON(),
      fallbackUsed,
      fallbackRoleId,
      metadata: {
        assignmentsFound: assignments.length,
        resolutionStrategy: role.resolutionStrategy
      }
    });
  }

  /**
   * @function resolveMultiple
   * @description Batch resolution. Fails safe by returning empty results for specific role errors.
   * @param {string[]} roleIds - Role IDs.
   * @param {Scope} scope - Shared scope.
   * @param {Object} [options={}] - Resolution options.
   * @returns {Map<string, ResolutionResult>}
   */
  resolveMultiple(roleIds, scope, options = {}) {
    const results = new Map();

    for (const roleId of roleIds) {
      try {
        results.set(roleId, this.resolve(roleId, scope, options));
      } catch (error) {
        this._logger.warn?.(`Failed to resolve role ${roleId}: ${error.message}`);
        // Store empty result for failed resolution
        const role = this._roleRegistry.getOrNull(roleId);
        results.set(
          roleId,
          ResolutionResult.empty(role || { id: roleId }, scope, {
            error: error.message
          })
        );
      }
    }

    return results;
  }

  /**
   * @function resolveForActor
   * @description Reverse lookup: identifies all roles (direct and via delegation) held by an actor.
   * @param {string} actorId - ID to inspect.
   * @param {Scope} scope - Context for filtering.
   * @param {Object} [options={}] - Configuration.
   * @returns {Object} {actor, roles, effectiveRoles, assignmentCount}
   */
  resolveForActor(actorId, scope, options = {}) {
    const { asOfDate = new Date(), includeReceivedDelegations = true } = options;

    // Get the actor
    const actor = this._assignmentSource.getActorById(actorId);

    // Get direct assignments
    const assignments = this._assignmentSource.getAssignmentsForActor(actorId, asOfDate);

    // Get direct roles
    const directRoles = [];
    for (const assignment of assignments) {
      const role = this._roleRegistry.getOrNull(assignment.roleId);
      if (role) {
        directRoles.push(role);
      }
    }

    // Get effective roles (including delegated)
    const effectiveRoles = [...directRoles];

    if (includeReceivedDelegations) {
      // Get delegations where this actor is the delegate
      const receivedDelegations = this._delegationSource.getActiveDelegationsForDelegate(
        actorId,
        asOfDate
      );

      for (const delegation of receivedDelegations) {
        // Get roles from delegation
        const delegatedRoleIds =
          delegation.roleIds === '*' ? this._roleRegistry.getAllIds() : delegation.roleIds;

        for (const roleId of delegatedRoleIds) {
          const role = this._roleRegistry.getOrNull(roleId);
          if (role && !effectiveRoles.some((r) => r.id === role.id)) {
            effectiveRoles.push(role);
          }
        }
      }
    }

    return {
      actor,
      roles: directRoles,
      effectiveRoles,
      assignmentCount: assignments.length
    };
  }

  /**
   * @function getRoutingFor
   * @description Convenience method for simple notification routing without full audit data.
   * @param {string} roleId - Role ID.
   * @param {Scope} scope - Context.
   * @param {Object} [options={}] - Options.
   * @returns {Object} {primary, cc, bcc} arrays of actors.
   */
  getRoutingFor(roleId, scope, options = {}) {
    const result = this.resolve(roleId, scope, options);
    return result.routing;
  }

  /**
   * @function _validateScope
   * @description Internal scope constraint enforcement.
   * @param {Role} role - Definition.
   * @param {Scope} scope - Input.
   * @throws {InvalidScopeError} On mismatch.
   * @private
   */
  _validateScope(role, scope) {
    // Global roles accept any scope
    if (role.scopeType === ScopeType.GLOBAL) {
      return;
    }

    // Check scope type matches (unless scope is global)
    if (scope?.type !== ScopeType.GLOBAL && scope?.type !== role.scopeType) {
      throw new InvalidScopeError(role.id, scope?.type, role.scopeType);
    }
  }

  /**
   * @function _applyResolutionStrategy
   * @description Internal filtering based on Role strategy.
   * @param {Assignment[]} assignments - Candidates.
   * @param {string} strategy - Algorithm key.
   * @returns {Assignment[]} Filtered/sorted subset.
   * @private
   */
  _applyResolutionStrategy(assignments, strategy) {
    if (assignments.length === 0) {
      return [];
    }

    switch (strategy) {
      case ResolutionStrategy.FIRST:
        return [assignments[0]];

      case ResolutionStrategy.ALL:
        return assignments;

      case ResolutionStrategy.PRIORITY:
        // Sort by priority (higher first)
        const sorted = [...assignments].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        return sorted;

      default:
        return [assignments[0]];
    }
  }

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
  _resolveDelegationChain(actor, roleId, scope, asOfDate) {
    // Get delegation chain from source
    const delegations = this._delegationSource.getDelegationChain(
      actor.id,
      roleId,
      scope,
      asOfDate
    );

    if (!delegations || delegations.length === 0) {
      return {
        effectiveActor: actor,
        chain: DelegationChain.empty()
      };
    }

    // Check depth limit
    if (delegations.length > this._maxDelegationDepth) {
      throw new DelegationDepthExceededError(delegations.length, this._maxDelegationDepth);
    }

    // Build delegation chain
    let chain;
    try {
      chain = new DelegationChain(delegations);
    } catch (error) {
      this._logger.warn?.(`Invalid delegation chain: ${error.message}`);
      return {
        effectiveActor: actor,
        chain: DelegationChain.empty()
      };
    }

    // Get the final delegate
    const finalDelegateId = chain.getFinalDelegateId();
    const effectiveActor = this._assignmentSource.getActorById(finalDelegateId);

    if (!effectiveActor) {
      this._logger.warn?.(`Final delegate not found: ${finalDelegateId}`);
      return {
        effectiveActor: actor,
        chain: DelegationChain.empty()
      };
    }

    return {
      effectiveActor,
      chain
    };
  }

  /**
   * @function _getEffectiveRoutingPolicy
   * @description Extracts policy from chain (last segment preferred).
   * @param {DelegationChain} chain - Resolved path.
   * @returns {string}
   * @private
   */
  _getEffectiveRoutingPolicy(chain) {
    if (chain.isEmpty()) {
      return this._defaultRoutingPolicy;
    }

    // Use the policy from the last delegation
    const lastDelegation = chain.getLast();
    return lastDelegation?.routingPolicy || this._defaultRoutingPolicy;
  }

  /**
   * @function _getActorsFromChain
   * @description Deduplicated traversal of chain to retrieve Actor instances.
   * @param {Actor} principalActor - Initial entity.
   * @param {DelegationChain} chain - Resolved path.
   * @returns {Actor[]}
   * @private
   */
  _getActorsFromChain(principalActor, chain) {
    const actors = [principalActor];
    const seen = new Set([principalActor.id]);

    for (const delegation of chain.delegations) {
      const delegateId = delegation.delegateId;
      if (!seen.has(delegateId)) {
        const actor = this._assignmentSource.getActorById(delegateId);
        if (actor) {
          actors.push(actor);
          seen.add(delegateId);
        }
      }
    }

    return actors;
  }
}
