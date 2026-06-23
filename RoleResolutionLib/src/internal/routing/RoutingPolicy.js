/**
 * @file RoleResolutionLib/src/routing/RoutingPolicy.js
 * @description Enumeration of routing policies for delegation communications.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Logic for determining notification targets during active delegations.
 */
export const RoutingPolicy = Object.freeze({
  /** Delegate only (mute principal). */
  DELEGATE_ONLY: 'DELEGATE_ONLY',
  /** Principal only (ignore delegation). */
  PRINCIPAL_ONLY: 'PRINCIPAL_ONLY',
  /** Both entities receive identical primary notification. */
  BOTH_EQUAL: 'BOTH_EQUAL',
  /** Delegate as primary (TO), principal as informational (CC). */
  DELEGATE_PRIMARY_PRINCIPAL_CC: 'DELEGATE_PRIMARY_PRINCIPAL_CC',
  /** Principal as primary (TO), delegate as informational (CC). */
  PRINCIPAL_PRIMARY_DELEGATE_CC: 'PRINCIPAL_PRIMARY_DELEGATE_CC',
  /** Broadcast to all actors in transitive chain (A -> B -> C). */
  CHAIN_ALL: 'CHAIN_ALL'
});

/**
 * @function isValidRoutingPolicy
 * @description Validates if a string is a recognized RoutingPolicy.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in RoutingPolicy.
 */
export function isValidRoutingPolicy(value) {
  return Object.values(RoutingPolicy).includes(value);
}

/**
 * @function getRoutingPolicies
 * @description Retrieves all supported policy strings.
 * @returns {string[]} Array of RoutingPolicy values.
 */
export function getRoutingPolicies() {
  return Object.values(RoutingPolicy);
}

/**
 * @function getRoutingPolicyDescription
 * @description Maps enum key to functional human-readable label.
 * @param {string} policy - Enum value.
 * @returns {string} Narrative description.
 */
export function getRoutingPolicyDescription(policy) {
  const descriptions = {
    [RoutingPolicy.DELEGATE_ONLY]: 'Notify only the delegate',
    [RoutingPolicy.PRINCIPAL_ONLY]: 'Notify only the principal (ignore delegation)',
    [RoutingPolicy.BOTH_EQUAL]: 'Notify both equally',
    [RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC]: 'Delegate as primary, principal in CC',
    [RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC]: 'Principal as primary, delegate in CC',
    [RoutingPolicy.CHAIN_ALL]: 'Notify entire delegation chain'
  };
  return descriptions[policy] || 'Unknown routing policy';
}
