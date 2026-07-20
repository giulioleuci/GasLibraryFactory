// ===================================================================
// FILE: SheetDBLib/src/internal/query-builders/__tests__/AdvancedQueryValidator.test.js
// ===================================================================
// Direct unit tests for AdvancedQueryValidator, exercised in isolation
// from AdvancedQueryBuilder (which already covers these paths indirectly
// via from()/join()/whereIn()/orderBy()).
// ===================================================================

import { AdvancedQueryValidator } from '../AdvancedQueryValidator.js';

describe('AdvancedQueryValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new AdvancedQueryValidator();
  });

  describe('validateTable()', () => {
    it('should not throw when table exists', () => {
      const dbService = { tables: { Users: {} } };
      expect(() => validator.validateTable(dbService, 'Users')).not.toThrow();
    });

    it('should throw when table is missing', () => {
      const dbService = { tables: {} };
      expect(() => validator.validateTable(dbService, 'Ghost')).toThrow(
        'Table Ghost not found in database.'
      );
    });
  });

  describe('validateJoin()', () => {
    it('should not throw when join target exists', () => {
      const dbService = { tables: { Books: {} } };
      expect(() => validator.validateJoin(dbService, 'Books')).not.toThrow();
    });

    it('should throw with default JOIN type in message', () => {
      const dbService = { tables: {} };
      expect(() => validator.validateJoin(dbService, 'Ghost')).toThrow(
        'JOIN target table Ghost not found in database.'
      );
    });

    it('should include custom type in error message', () => {
      const dbService = { tables: {} };
      expect(() => validator.validateJoin(dbService, 'Ghost', 'LEFT JOIN')).toThrow(
        'LEFT JOIN target table Ghost not found in database.'
      );
    });
  });

  describe('validateWhereIn()', () => {
    it('should not throw for arrays', () => {
      expect(() => validator.validateWhereIn('status', ['a', 'b'])).not.toThrow();
    });

    it('should not throw for an empty array', () => {
      expect(() => validator.validateWhereIn('status', [])).not.toThrow();
    });

    it('should throw for a non-array value', () => {
      expect(() => validator.validateWhereIn('status', 'active')).toThrow(
        'whereIn requires an array of values for field status'
      );
    });

    it('should throw for null', () => {
      expect(() => validator.validateWhereIn('status', null)).toThrow(
        'whereIn requires an array of values for field status'
      );
    });
  });

  describe('validateOrderDirection()', () => {
    it('should accept ASC', () => {
      expect(() => validator.validateOrderDirection('ASC')).not.toThrow();
    });

    it('should accept DESC', () => {
      expect(() => validator.validateOrderDirection('DESC')).not.toThrow();
    });

    it('should be case-insensitive', () => {
      expect(() => validator.validateOrderDirection('asc')).not.toThrow();
      expect(() => validator.validateOrderDirection('desc')).not.toThrow();
    });

    it('should throw for an invalid direction', () => {
      expect(() => validator.validateOrderDirection('SIDEWAYS')).toThrow(
        "Sort direction must be 'ASC' or 'DESC'"
      );
    });
  });
});
