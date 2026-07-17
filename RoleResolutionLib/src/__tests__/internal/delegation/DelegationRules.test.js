/**
 * @file RoleResolutionLib/src/__tests__/internal/delegation/DelegationRules.test.js
 * @description Unit tests for DelegationRules
 */

import { DelegationRules } from '../../../internal/delegation/DelegationRules.js';

describe('DelegationRules', () => {
  const MOCK_DATE = new Date('2024-01-15T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with provided state', () => {
      const mockState = { id: 'state1' };
      const rules = new DelegationRules(mockState);
      expect(rules.state).toBe(mockState);
    });
  });

  describe('isValidAt', () => {
    it('should return false if state is not active', () => {
      const rules = new DelegationRules({ isActive: false });
      expect(rules.isValidAt()).toBe(false);
    });

    it('should return false if asOfDate is before validFrom', () => {
      const validFrom = new Date('2024-01-20T00:00:00Z');
      const rules = new DelegationRules({ isActive: true, validFrom, validTo: null });
      expect(rules.isValidAt(MOCK_DATE)).toBe(false);
    });

    it('should return false if validTo is set and asOfDate is after validTo', () => {
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validTo = new Date('2024-01-10T00:00:00Z');
      const rules = new DelegationRules({ isActive: true, validFrom, validTo });
      expect(rules.isValidAt(MOCK_DATE)).toBe(false);
    });

    it('should return true if active and within validity period', () => {
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validTo = new Date('2024-01-31T00:00:00Z');
      const rules = new DelegationRules({ isActive: true, validFrom, validTo });
      expect(rules.isValidAt(MOCK_DATE)).toBe(true);
    });

    it('should return true if active and after validFrom with no validTo', () => {
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const rules = new DelegationRules({ isActive: true, validFrom, validTo: null });
      expect(rules.isValidAt(MOCK_DATE)).toBe(true);
    });

    it('should use current date if asOfDate is not provided', () => {
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const validTo = new Date('2024-01-31T00:00:00Z');
      const rules = new DelegationRules({ isActive: true, validFrom, validTo });
      expect(rules.isValidAt()).toBe(true);
    });
  });

  describe('appliesToRole', () => {
    it('should return true if roleIds is "*"', () => {
      const rules = new DelegationRules({ roleIds: '*' });
      expect(rules.appliesToRole('any-role')).toBe(true);
    });

    it('should return true if roleId is in roleIds array', () => {
      const rules = new DelegationRules({ roleIds: ['role1', 'role2'] });
      expect(rules.appliesToRole('role1')).toBe(true);
    });

    it('should return false if roleId is not in roleIds array', () => {
      const rules = new DelegationRules({ roleIds: ['role1', 'role2'] });
      expect(rules.appliesToRole('role3')).toBe(false);
    });
  });

  describe('appliesToScope', () => {
    it('should return true if scopeRestriction is null', () => {
      const rules = new DelegationRules({ scopeRestriction: null });
      expect(rules.appliesToScope({})).toBe(true);
    });

    it('should return true if scopeRestriction contains targetScope', () => {
      const mockScopeRestriction = {
        contains: jest.fn().mockReturnValue(true),
        matches: jest.fn().mockReturnValue(false)
      };
      const rules = new DelegationRules({ scopeRestriction: mockScopeRestriction });
      const targetScope = { type: 'PROJECT', value: '123' };

      expect(rules.appliesToScope(targetScope)).toBe(true);
      expect(mockScopeRestriction.contains).toHaveBeenCalledWith(targetScope);
    });

    it('should return true if scopeRestriction matches targetScope', () => {
      const mockScopeRestriction = {
        contains: jest.fn().mockReturnValue(false),
        matches: jest.fn().mockReturnValue(true)
      };
      const rules = new DelegationRules({ scopeRestriction: mockScopeRestriction });
      const targetScope = { type: 'PROJECT', value: '123' };

      expect(rules.appliesToScope(targetScope)).toBe(true);
      expect(mockScopeRestriction.matches).toHaveBeenCalledWith(targetScope);
    });

    it('should return false if scopeRestriction neither contains nor matches targetScope', () => {
      const mockScopeRestriction = {
        contains: jest.fn().mockReturnValue(false),
        matches: jest.fn().mockReturnValue(false)
      };
      const rules = new DelegationRules({ scopeRestriction: mockScopeRestriction });
      const targetScope = { type: 'PROJECT', value: '123' };

      expect(rules.appliesToScope(targetScope)).toBe(false);
    });
  });

  describe('appliesTo', () => {
    it('should return true if all conditions are met', () => {
      const mockScopeRestriction = {
        contains: jest.fn().mockReturnValue(true),
        matches: jest.fn().mockReturnValue(false)
      };
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const rules = new DelegationRules({
        isActive: true,
        validFrom,
        validTo: null,
        roleIds: ['role1'],
        scopeRestriction: mockScopeRestriction
      });

      expect(rules.appliesTo('role1', {}, MOCK_DATE)).toBe(true);
    });

    it('should return false if isValidAt is false', () => {
      const rules = new DelegationRules({ isActive: false });
      expect(rules.appliesTo('role1', {})).toBe(false);
    });

    it('should return false if appliesToRole is false', () => {
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const rules = new DelegationRules({
        isActive: true,
        validFrom,
        validTo: null,
        roleIds: ['role1']
      });
      expect(rules.appliesTo('role2', {})).toBe(false);
    });

    it('should return false if appliesToScope is false', () => {
      const mockScopeRestriction = {
        contains: jest.fn().mockReturnValue(false),
        matches: jest.fn().mockReturnValue(false)
      };
      const validFrom = new Date('2024-01-01T00:00:00Z');
      const rules = new DelegationRules({
        isActive: true,
        validFrom,
        validTo: null,
        roleIds: '*',
        scopeRestriction: mockScopeRestriction
      });
      expect(rules.appliesTo('role1', {})).toBe(false);
    });
  });

  describe('isFullDelegation', () => {
    it('should return true if roleIds is "*"', () => {
      const rules = new DelegationRules({ roleIds: '*' });
      expect(rules.isFullDelegation()).toBe(true);
    });

    it('should return false if roleIds is an array', () => {
      const rules = new DelegationRules({ roleIds: ['role1'] });
      expect(rules.isFullDelegation()).toBe(false);
    });
  });

  describe('isIndefinite', () => {
    it('should return true if validTo is null', () => {
      const rules = new DelegationRules({ validTo: null });
      expect(rules.isIndefinite()).toBe(true);
    });

    it('should return false if validTo is a Date', () => {
      const rules = new DelegationRules({ validTo: new Date() });
      expect(rules.isIndefinite()).toBe(false);
    });
  });

  describe('getRemainingDays', () => {
    it('should return null if validTo is null', () => {
      const rules = new DelegationRules({ validTo: null });
      expect(rules.getRemainingDays()).toBeNull();
    });

    it('should return 0 if asOfDate is after validTo', () => {
      const validTo = new Date('2024-01-10T00:00:00Z');
      const rules = new DelegationRules({ validTo });
      expect(rules.getRemainingDays(MOCK_DATE)).toBe(0);
    });

    it('should return the correct number of days remaining (ceiling)', () => {
      // MOCK_DATE is '2024-01-15T12:00:00Z'
      // validTo is '2024-01-17T18:00:00Z'
      // Difference is 2 days and 6 hours = 2.25 days -> ceil -> 3 days
      const validTo = new Date('2024-01-17T18:00:00Z');
      const rules = new DelegationRules({ validTo });
      expect(rules.getRemainingDays(MOCK_DATE)).toBe(3);
    });

    it('should return the correct number of days remaining (exact)', () => {
      // MOCK_DATE is '2024-01-15T12:00:00Z'
      // validTo is '2024-01-17T12:00:00Z'
      // Difference is 2 days exactly -> ceil -> 2 days
      const validTo = new Date('2024-01-17T12:00:00Z');
      const rules = new DelegationRules({ validTo });
      expect(rules.getRemainingDays(MOCK_DATE)).toBe(2);
    });

    it('should use current date if asOfDate is not provided', () => {
      // Current date is mocked to '2024-01-15T12:00:00Z'
      const validTo = new Date('2024-01-16T12:00:00Z');
      const rules = new DelegationRules({ validTo });
      expect(rules.getRemainingDays()).toBe(1);
    });
  });
});
