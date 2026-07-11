/**
 * @file RoleResolutionLib/src/__tests__/internal/routing/RoutingPolicy.test.js
 * @description Unit tests for RoutingPolicy
 */

import {
  RoutingPolicy,
  isValidRoutingPolicy,
  getRoutingPolicies,
  getRoutingPolicyDescription
} from '../../../internal/routing/RoutingPolicy.js';

describe('RoutingPolicy', () => {
  describe('RoutingPolicy enum', () => {
    it('should be defined and frozen', () => {
      expect(RoutingPolicy).toBeDefined();
      expect(Object.isFrozen(RoutingPolicy)).toBe(true);
    });

    it('should contain expected policy constants', () => {
      expect(RoutingPolicy.DELEGATE_ONLY).toBe('DELEGATE_ONLY');
      expect(RoutingPolicy.PRINCIPAL_ONLY).toBe('PRINCIPAL_ONLY');
      expect(RoutingPolicy.BOTH_EQUAL).toBe('BOTH_EQUAL');
      expect(RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC).toBe('DELEGATE_PRIMARY_PRINCIPAL_CC');
      expect(RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC).toBe('PRINCIPAL_PRIMARY_DELEGATE_CC');
      expect(RoutingPolicy.CHAIN_ALL).toBe('CHAIN_ALL');
    });
  });

  describe('isValidRoutingPolicy', () => {
    it('should return true for valid policies', () => {
      expect(isValidRoutingPolicy(RoutingPolicy.DELEGATE_ONLY)).toBe(true);
      expect(isValidRoutingPolicy(RoutingPolicy.PRINCIPAL_ONLY)).toBe(true);
      expect(isValidRoutingPolicy(RoutingPolicy.BOTH_EQUAL)).toBe(true);
      expect(isValidRoutingPolicy('CHAIN_ALL')).toBe(true);
    });

    it('should return false for invalid policies', () => {
      expect(isValidRoutingPolicy('INVALID_POLICY')).toBe(false);
      expect(isValidRoutingPolicy('')).toBe(false);
      expect(isValidRoutingPolicy(null)).toBe(false);
      expect(isValidRoutingPolicy(undefined)).toBe(false);
      expect(isValidRoutingPolicy(123)).toBe(false);
      expect(isValidRoutingPolicy({})).toBe(false);
    });
  });

  describe('getRoutingPolicies', () => {
    it('should return all valid policies as an array', () => {
      const policies = getRoutingPolicies();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies).toHaveLength(7);
      expect(policies).toContain(RoutingPolicy.DELEGATE_ONLY);
      expect(policies).toContain(RoutingPolicy.CHAIN_ALL);
      expect(policies).toContain(RoutingPolicy.DELEGATE_OR_PRINCIPAL);
    });
  });

  describe('getRoutingPolicyDescription', () => {
    it('should return correct description for valid policies', () => {
      expect(getRoutingPolicyDescription(RoutingPolicy.DELEGATE_ONLY)).toBe(
        'Notify only the delegate'
      );
      expect(getRoutingPolicyDescription(RoutingPolicy.PRINCIPAL_ONLY)).toBe(
        'Notify only the principal (ignore delegation)'
      );
      expect(getRoutingPolicyDescription(RoutingPolicy.BOTH_EQUAL)).toBe('Notify both equally');
      expect(getRoutingPolicyDescription(RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC)).toBe(
        'Delegate as primary, principal in CC'
      );
      expect(getRoutingPolicyDescription(RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC)).toBe(
        'Principal as primary, delegate in CC'
      );
      expect(getRoutingPolicyDescription(RoutingPolicy.CHAIN_ALL)).toBe(
        'Notify entire delegation chain'
      );
    });

    it('should return default description for unknown policies', () => {
      expect(getRoutingPolicyDescription('UNKNOWN_POLICY')).toBe('Unknown routing policy');
      expect(getRoutingPolicyDescription(null)).toBe('Unknown routing policy');
      expect(getRoutingPolicyDescription(undefined)).toBe('Unknown routing policy');
    });
  });
});
