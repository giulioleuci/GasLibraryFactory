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
      validator.validateTable(dbService, 'Users');
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
      validator.validateJoin(dbService, 'Books');
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
      validator.validateWhereIn('status', ['a', 'b']);
    });

    it('should not throw for an empty array', () => {
      validator.validateWhereIn('status', []);
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
      validator.validateOrderDirection('ASC');
    });

    it('should accept DESC', () => {
      validator.validateOrderDirection('DESC');
    });

    it('should be case-insensitive', () => {
      validator.validateOrderDirection('asc');
      validator.validateOrderDirection('desc');
    });

    it('should throw for an invalid direction', () => {
      expect(() => validator.validateOrderDirection('SIDEWAYS')).toThrow(
        "Sort direction must be 'ASC' or 'DESC'"
      );
    });
  });
});
