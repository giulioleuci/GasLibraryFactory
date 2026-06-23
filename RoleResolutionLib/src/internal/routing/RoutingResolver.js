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
export class RoutingResolver {
  /**
   * @constructor
   * @param {Object} [options={}] - Resolver configuration.
   * @param {Object} [options.logger=console] - Telemetry target.
   * @param {string} [options.defaultPolicy=RoutingPolicy.DELEGATE_ONLY] - Fallback strategy if none defined in chain.
   */
  constructor(options = {}) {
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
  resolve(params) {
    const {
      principalActor,
      effectiveActor = null,
      delegationChain = null,
      routingPolicy = null
    } = params;

    // Determine the policy to use
    const policy = routingPolicy || this._determinePolicy(delegationChain);

    // If no delegation, just use principal
    if (!delegationChain || delegationChain.isEmpty()) {
      return RoutingResult.singlePrimary(principalActor);
    }

    // Resolve based on policy
    return this._resolveByPolicy(policy, principalActor, effectiveActor, delegationChain);
  }

  /**
   * @function _determinePolicy
   * @description Extracts policy from the final link in the delegation chain.
   * @param {DelegationChain} delegationChain - Candidate links.
   * @returns {string} RoutingPolicy enum value.
   * @private
   */
  _determinePolicy(delegationChain) {
    if (!delegationChain || delegationChain.isEmpty()) {
      return this._defaultPolicy;
    }

    // Use the routing policy from the last delegation in the chain
    const lastDelegation = delegationChain.getLast();
    return lastDelegation?.routingPolicy || this._defaultPolicy;
  }

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
  _resolveByPolicy(policy, principalActor, effectiveActor, delegationChain) {
    switch (policy) {
      case RoutingPolicy.DELEGATE_ONLY:
        return this._resolveDelegateOnly(effectiveActor);

      case RoutingPolicy.PRINCIPAL_ONLY:
        return this._resolvePrincipalOnly(principalActor);

      case RoutingPolicy.BOTH_EQUAL:
        return this._resolveBothEqual(principalActor, effectiveActor);

      case RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC:
        return this._resolveDelegatePrimaryPrincipalCC(principalActor, effectiveActor);

      case RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC:
        return this._resolvePrincipalPrimaryDelegateCC(principalActor, effectiveActor);

      case RoutingPolicy.CHAIN_ALL:
        return this._resolveChainAll(principalActor, delegationChain);

      default:
        this._logger.warn(`Unknown routing policy: ${policy}, using DELEGATE_ONLY`);
        return this._resolveDelegateOnly(effectiveActor);
    }
  }

  /**
   * @function _resolveDelegateOnly
   * @private
   */
  _resolveDelegateOnly(effectiveActor) {
    if (!effectiveActor) {
      return RoutingResult.empty();
    }
    return new RoutingResult({
      primary: [effectiveActor],
      cc: [],
      bcc: [],
      metadata: { policy: RoutingPolicy.DELEGATE_ONLY }
    });
  }

  /**
   * @function _resolvePrincipalOnly
   * @private
   */
  _resolvePrincipalOnly(principalActor) {
    if (!principalActor) {
      return RoutingResult.empty();
    }
    return new RoutingResult({
      primary: [principalActor],
      cc: [],
      bcc: [],
      metadata: { policy: RoutingPolicy.PRINCIPAL_ONLY }
    });
  }

  /**
   * @function _resolveBothEqual
   * @private
   */
  _resolveBothEqual(principalActor, effectiveActor) {
    const primary = [];

    if (effectiveActor) {
      primary.push(effectiveActor);
    }

    // Add principal if different from effective
    if (principalActor && (!effectiveActor || principalActor.id !== effectiveActor.id)) {
      primary.push(principalActor);
    }

    return new RoutingResult({
      primary,
      cc: [],
      bcc: [],
      metadata: { policy: RoutingPolicy.BOTH_EQUAL }
    });
  }

  /**
   * @function _resolveDelegatePrimaryPrincipalCC
   * @private
   */
  _resolveDelegatePrimaryPrincipalCC(principalActor, effectiveActor) {
    const primary = effectiveActor ? [effectiveActor] : [];
    const cc = [];

    // Add principal to CC if different from effective
    if (principalActor && (!effectiveActor || principalActor.id !== effectiveActor.id)) {
      cc.push(principalActor);
    }

    return new RoutingResult({
      primary,
      cc,
      bcc: [],
      metadata: { policy: RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC }
    });
  }

  /**
   * @function _resolvePrincipalPrimaryDelegateCC
   * @private
   */
  _resolvePrincipalPrimaryDelegateCC(principalActor, effectiveActor) {
    const primary = principalActor ? [principalActor] : [];
    const cc = [];

    // Add effective to CC if different from principal
    if (effectiveActor && (!principalActor || effectiveActor.id !== principalActor.id)) {
      cc.push(effectiveActor);
    }

    return new RoutingResult({
      primary,
      cc,
      bcc: [],
      metadata: { policy: RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC }
    });
  }

  /**
   * @function _resolveChainAll
   * @private
   */
  _resolveChainAll(principalActor, delegationChain) {
    const primary = [];
    const seen = new Set();

    // Add all actors in the chain
    if (delegationChain && !delegationChain.isEmpty()) {
      // Add the original principal
      delegationChain.forEach((delegation) => {
        // Principal of first delegation is the original principal
        // This is handled by the chain itself
      });

      // Get all actors in the chain
      const actorIds = delegationChain.getAllActorIds();

      // We need to add actors - but we only have IDs from the chain
      // The actual actor objects need to come from the resolution context
      // For now, we'll add the principal
      if (principalActor && !seen.has(principalActor.id)) {
        primary.push(principalActor);
        seen.add(principalActor.id);
      }
    } else if (principalActor) {
      primary.push(principalActor);
    }

    return new RoutingResult({
      primary,
      cc: [],
      bcc: [],
      metadata: {
        policy: RoutingPolicy.CHAIN_ALL,
        chainActorIds: delegationChain ? delegationChain.getAllActorIds() : []
      }
    });
  }

  /**
   * @function resolveChainAllWithActors
   * @description Specialized resolver for CHAIN_ALL that deduplicates and buckets all unique actors in a path.
   * @param {Actor[]} chainActors - Ordered array of all entities in the delegation trace.
   * @returns {RoutingResult}
   */
  resolveChainAllWithActors(chainActors) {
    if (!Array.isArray(chainActors) || chainActors.length === 0) {
      return RoutingResult.empty();
    }

    // Deduplicate by ID
    const seen = new Set();
    const primary = chainActors.filter((actor) => {
      if (!actor || !actor.id || seen.has(actor.id)) {
        return false;
      }
      seen.add(actor.id);
      return true;
    });

    return new RoutingResult({
      primary,
      cc: [],
      bcc: [],
      metadata: { policy: RoutingPolicy.CHAIN_ALL }
    });
  }

  /**
   * @function getDefaultPolicy
   * @returns {string}
   */
  getDefaultPolicy() {
    return this._defaultPolicy;
  }
}
