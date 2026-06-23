/**
 * @file RoleResolutionLib/src/__tests__/core/Assignment.test.js
 * @description Unit tests for Assignment value object
 */

import { Assignment } from '../../core/Assignment.js';
import { Scope } from '../../core/Scope.js';
import { ScopeType } from '../../core/ScopeType.js';

describe('Assignment', () => {
  const defaultScope = new Scope(ScopeType.GLOBAL);

  describe('Constructor', () => {
    it('should create a valid assignment with required fields', () => {
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope
      });

      expect(assignment.roleId).toBe('role-123');
      expect(assignment.actorId).toBe('user-456');
      expect(assignment.scope).toEqual(defaultScope);
      expect(assignment.priority).toBe(0);
      expect(assignment.validFrom).toBeNull();
      expect(assignment.validTo).toBeNull();
      expect(assignment.isActive).toBe(true);
      expect(assignment.metadata).toEqual({});
    });

    it('should create a valid assignment with all fields', () => {
      const dateFrom = new Date('2023-01-01');
      const dateTo = new Date('2023-12-31');

      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        priority: 10,
        validFrom: dateFrom,
        validTo: dateTo,
        isActive: false,
        metadata: { key: 'value' }
      });

      expect(assignment.priority).toBe(10);
      expect(assignment.validFrom).toEqual(dateFrom);
      expect(assignment.validTo).toEqual(dateTo);
      expect(assignment.isActive).toBe(false);
      expect(assignment.metadata).toEqual({ key: 'value' });
    });

    it('should throw error if definition is not provided', () => {
      expect(() => new Assignment()).toThrow('Assignment definition is required');
      expect(() => new Assignment(null)).toThrow('Assignment definition is required');
    });

    it('should throw error if roleId is missing or not a string', () => {
      expect(() => new Assignment({ actorId: 'user-456', scope: defaultScope })).toThrow('Assignment roleId is required and must be a string');
      expect(() => new Assignment({ roleId: 123, actorId: 'user-456', scope: defaultScope })).toThrow('Assignment roleId is required and must be a string');
    });

    it('should throw error if actorId is missing or not a string', () => {
      expect(() => new Assignment({ roleId: 'role-123', scope: defaultScope })).toThrow('Assignment actorId is required and must be a string');
      expect(() => new Assignment({ roleId: 'role-123', actorId: 456, scope: defaultScope })).toThrow('Assignment actorId is required and must be a string');
    });

    it('should throw error if scope is missing', () => {
      expect(() => new Assignment({ roleId: 'role-123', actorId: 'user-456' })).toThrow('Assignment scope is required');
    });

    it('should instantiate Scope if a plain object is provided', () => {
      const jsonScope = { type: ScopeType.ORG_UNIT, value: 'Engineering', hierarchy: [] };
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: jsonScope
      });

      expect(assignment.scope).toBeInstanceOf(Scope);
      expect(assignment.scope.type).toBe(ScopeType.ORG_UNIT);
      expect(assignment.scope.value).toBe('Engineering');
    });

    it('should be immutable', () => {
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        metadata: { key: 'value' }
      });

      expect(() => { assignment.roleId = 'new-role'; }).toThrow();
      expect(() => { assignment.metadata.key = 'new-value'; }).toThrow();
    });
  });

  describe('_parseDate', () => {
    // We can indirectly test _parseDate via validFrom and validTo
    it('should parse Date instances correctly', () => {
      const date = new Date('2023-01-01');
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        validFrom: date
      });

      expect(assignment.validFrom).toEqual(date);
      // Verify it's a clone, not the same reference
      expect(assignment.validFrom).not.toBe(date);
    });

    it('should parse ISO strings correctly', () => {
      const dateStr = '2023-01-01T00:00:00.000Z';
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        validFrom: dateStr
      });

      expect(assignment.validFrom).toEqual(new Date(dateStr));
    });

    it('should return null for invalid strings', () => {
      const assignment = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        validFrom: 'invalid-date'
      });

      expect(assignment.validFrom).toBeNull();
    });

    it('should return null for null or undefined', () => {
      const assignment1 = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        validFrom: null
      });
      const assignment2 = new Assignment({
        roleId: 'role-123',
        actorId: 'user-456',
        scope: defaultScope,
        validFrom: undefined
      });

      expect(assignment1.validFrom).toBeNull();
      expect(assignment2.validFrom).toBeNull();
    });
  });

  describe('isValidAt', () => {
    const validFrom = new Date('2023-01-01T00:00:00.000Z');
    const validTo = new Date('2023-12-31T23:59:59.999Z');

    it('should return true if active and dates are not set', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope });
      expect(assignment.isValidAt()).toBe(true);
    });

    it('should return false if inactive', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, isActive: false });
      expect(assignment.isValidAt()).toBe(false);
    });

    it('should return false if current date is before validFrom', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validFrom });
      const beforeDate = new Date('2022-12-31T23:59:59.999Z');
      expect(assignment.isValidAt(beforeDate)).toBe(false);
    });

    it('should return true if current date is exactly validFrom', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validFrom });
      expect(assignment.isValidAt(validFrom)).toBe(true);
    });

    it('should return true if current date is after validFrom', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validFrom });
      const afterDate = new Date('2023-01-02T00:00:00.000Z');
      expect(assignment.isValidAt(afterDate)).toBe(true);
    });

    it('should return false if current date is after validTo', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validTo });
      const afterDate = new Date('2024-01-01T00:00:00.000Z');
      expect(assignment.isValidAt(afterDate)).toBe(false);
    });

    it('should return true if current date is exactly validTo', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validTo });
      expect(assignment.isValidAt(validTo)).toBe(true);
    });

    it('should return true if current date is before validTo', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validTo });
      const beforeDate = new Date('2023-12-30T23:59:59.999Z');
      expect(assignment.isValidAt(beforeDate)).toBe(true);
    });

    it('should evaluate both validFrom and validTo correctly', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, validFrom, validTo });
      const middleDate = new Date('2023-06-15T00:00:00.000Z');

      expect(assignment.isValidAt(new Date('2022-12-31'))).toBe(false); // Before
      expect(assignment.isValidAt(middleDate)).toBe(true); // Within
      expect(assignment.isValidAt(new Date('2024-01-01'))).toBe(false); // After
    });
  });

  describe('matches', () => {
    const validFrom = new Date('2023-01-01T00:00:00.000Z');
    const validTo = new Date('2023-12-31T23:59:59.999Z');
    const globalScope = Scope.global();
    const projectScope1 = Scope.project('PRJ-1');
    const projectScope2 = Scope.project('PRJ-2');

    it('should return true for matching roleId, matching scope, and valid date', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: projectScope1 });
      expect(assignment.matches('admin', projectScope1)).toBe(true);
    });

    it('should return false for different roleId', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: projectScope1 });
      expect(assignment.matches('editor', projectScope1)).toBe(false);
    });

    it('should return false if not valid at given date', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: projectScope1, validFrom, validTo });
      const outOfBoundsDate = new Date('2024-01-01');
      expect(assignment.matches('admin', projectScope1, outOfBoundsDate)).toBe(false);
    });

    it('should return true if assignment scope contains queried scope', () => {
      // Global scope contains any other scope
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: globalScope });
      expect(assignment.matches('admin', projectScope1)).toBe(true);
    });

    it('should return false if assignment scope does not contain/match queried scope', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: projectScope1 });
      expect(assignment.matches('admin', projectScope2)).toBe(false);
    });

    it('should return false if assignment scope is narrower than queried scope', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: projectScope1 });
      expect(assignment.matches('admin', globalScope)).toBe(false);
    });
  });

  describe('equals', () => {
    const scope1 = Scope.project('PRJ-1');
    const scope2 = Scope.project('PRJ-2');

    it('should return true for identically structured assignments', () => {
      const assignment1 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      const assignment2 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      expect(assignment1.equals(assignment2)).toBe(true);
    });

    it('should return false if roleId differs', () => {
      const assignment1 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      const assignment2 = new Assignment({ roleId: 'r2', actorId: 'a1', scope: scope1 });
      expect(assignment1.equals(assignment2)).toBe(false);
    });

    it('should return false if actorId differs', () => {
      const assignment1 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      const assignment2 = new Assignment({ roleId: 'r1', actorId: 'a2', scope: scope1 });
      expect(assignment1.equals(assignment2)).toBe(false);
    });

    it('should return false if scope differs', () => {
      const assignment1 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      const assignment2 = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope2 });
      expect(assignment1.equals(assignment2)).toBe(false);
    });

    it('should return false when comparing against non-Assignment objects', () => {
      const assignment = new Assignment({ roleId: 'r1', actorId: 'a1', scope: scope1 });
      expect(assignment.equals(null)).toBe(false);
      expect(assignment.equals(undefined)).toBe(false);
      expect(assignment.equals({ roleId: 'r1', actorId: 'a1', scope: scope1 })).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return value for existing key', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope, metadata: { role: 'admin' } });
      expect(assignment.getMetadata('role')).toBe('admin');
    });

    it('should return default value for missing key', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope });
      expect(assignment.getMetadata('missing', 'fallback')).toBe('fallback');
    });

    it('should return null for missing key if no default provided', () => {
      const assignment = new Assignment({ roleId: 'r', actorId: 'a', scope: defaultScope });
      expect(assignment.getMetadata('missing')).toBeNull();
    });
  });

  describe('Serialization', () => {
    const validFromStr = '2023-01-01T00:00:00.000Z';
    const validToStr = '2023-12-31T23:59:59.999Z';

    it('should serialize to JSON properly', () => {
      const assignment = new Assignment({
        roleId: 'admin',
        actorId: 'user-1',
        scope: Scope.project('PRJ-1'),
        priority: 5,
        validFrom: validFromStr,
        validTo: validToStr,
        isActive: false,
        metadata: { foo: 'bar' }
      });

      const json = assignment.toJSON();

      expect(json).toEqual({
        roleId: 'admin',
        actorId: 'user-1',
        scope: {
          type: 'PROJECT',
          value: 'PRJ-1',
          hierarchy: []
        },
        priority: 5,
        validFrom: validFromStr,
        validTo: validToStr,
        isActive: false,
        metadata: { foo: 'bar' }
      });
    });

    it('should serialize dates to null if they are not set', () => {
      const assignment = new Assignment({ roleId: 'admin', actorId: 'user-1', scope: defaultScope });
      const json = assignment.toJSON();

      expect(json.validFrom).toBeNull();
      expect(json.validTo).toBeNull();
    });

    it('should deserialize from JSON properly (fromJSON)', () => {
      const json = {
        roleId: 'admin',
        actorId: 'user-1',
        scope: { type: 'PROJECT', value: 'PRJ-1', hierarchy: [] },
        priority: 5,
        validFrom: validFromStr,
        validTo: validToStr,
        isActive: false,
        metadata: { foo: 'bar' }
      };

      const assignment = Assignment.fromJSON(json);

      expect(assignment).toBeInstanceOf(Assignment);
      expect(assignment.roleId).toBe('admin');
      expect(assignment.actorId).toBe('user-1');
      expect(assignment.scope).toBeInstanceOf(Scope);
      expect(assignment.scope.type).toBe('PROJECT');
      expect(assignment.priority).toBe(5);
      expect(assignment.validFrom.toISOString()).toBe(validFromStr);
      expect(assignment.validTo.toISOString()).toBe(validToStr);
      expect(assignment.isActive).toBe(false);
      expect(assignment.metadata).toEqual({ foo: 'bar' });
    });

    it('should round-trip through JSON successfully', () => {
      const original = new Assignment({
        roleId: 'admin',
        actorId: 'user-1',
        scope: Scope.project('PRJ-1'),
        priority: 5,
        validFrom: new Date(validFromStr),
        validTo: new Date(validToStr),
        isActive: true,
        metadata: { key: 'val' }
      });

      const json = original.toJSON();
      const restored = Assignment.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
      expect(restored.priority).toBe(original.priority);
      expect(restored.validFrom).toEqual(original.validFrom);
      expect(restored.validTo).toEqual(original.validTo);
      expect(restored.isActive).toBe(original.isActive);
      expect(restored.metadata).toEqual(original.metadata);
    });

    it('should throw error when fromJSON is given invalid object', () => {
      expect(() => Assignment.fromJSON(null)).toThrow('Invalid assignment object');
      expect(() => Assignment.fromJSON(undefined)).toThrow('Invalid assignment object');
      expect(() => Assignment.fromJSON('string')).toThrow('Invalid assignment object');
    });
  });

  describe('toString', () => {
    it('should format string correctly for active assignment with no dates', () => {
      const assignment = new Assignment({ roleId: 'ADMIN', actorId: 'USER', scope: Scope.project('PRJ') });
      expect(assignment.toString()).toBe('Assignment[ADMIN -> USER] Scope[PROJECT:PRJ]');
    });

    it('should format string correctly for inactive assignment', () => {
      const assignment = new Assignment({ roleId: 'ADMIN', actorId: 'USER', scope: Scope.project('PRJ'), isActive: false });
      expect(assignment.toString()).toBe('Assignment[ADMIN -> USER] Scope[PROJECT:PRJ] [INACTIVE]');
    });

    it('should format string correctly for assignment with validFrom only', () => {
      const validFromStr = '2023-01-01T00:00:00.000Z';
      const assignment = new Assignment({ roleId: 'ADMIN', actorId: 'USER', scope: Scope.project('PRJ'), validFrom: validFromStr });
      expect(assignment.toString()).toBe(`Assignment[ADMIN -> USER] Scope[PROJECT:PRJ] [${validFromStr} to ...]`);
    });

    it('should format string correctly for assignment with validTo only', () => {
      const validToStr = '2023-12-31T23:59:59.999Z';
      const assignment = new Assignment({ roleId: 'ADMIN', actorId: 'USER', scope: Scope.project('PRJ'), validTo: validToStr });
      expect(assignment.toString()).toBe(`Assignment[ADMIN -> USER] Scope[PROJECT:PRJ] [... to ${validToStr}]`);
    });

    it('should format string correctly for assignment with both dates', () => {
      const validFromStr = '2023-01-01T00:00:00.000Z';
      const validToStr = '2023-12-31T23:59:59.999Z';
      const assignment = new Assignment({ roleId: 'ADMIN', actorId: 'USER', scope: Scope.project('PRJ'), validFrom: validFromStr, validTo: validToStr });
      expect(assignment.toString()).toBe(`Assignment[ADMIN -> USER] Scope[PROJECT:PRJ] [${validFromStr} to ${validToStr}]`);
    });
  });
});
