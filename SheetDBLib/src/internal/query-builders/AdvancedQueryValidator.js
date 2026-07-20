/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryValidator.js
 * @description Validation logic for query building operations.
 */

/**
 * @class AdvancedQueryValidator
 * @description Static structural validation for Query Builder operations.
 * Verifies table existence, relational integrity for JOINs, and type correctness for query operands.
 */
export class AdvancedQueryValidator {
  /**
   * @description Verifies that the target table identifier is registered in the database service.
   * @param {DatabaseService} dbService - Active database service.
   * @param {string} tableName - Target table identifier.
   * @throws {Error} If the table name is not found in the service registry.
   */
  validateTable(dbService, tableName) {
    if (!dbService.tables[tableName]) {
      throw new Error(`Table ${tableName} not found in database.`);
    }
  }

  /**
   * @description Validates relational integrity for JOIN operations.
   * @param {DatabaseService} dbService - Active database service.
   * @param {string} table - Target foreign table identifier.
   * @param {string} [type='JOIN'] - Join operation type for error context.
   * @throws {Error} If the foreign table is not registered.
   */
  validateJoin(dbService, table, type = 'JOIN') {
    if (!dbService.tables[table]) {
      throw new Error(`${type} target table ${table} not found in database.`);
    }
  }

  /**
   * @description Ensures the operand for an 'IN' condition is a valid collection.
   * @param {string} field - Target column identifier.
   * @param {*} values - Operand to verify.
   * @throws {Error} If values is not an Array.
   */
  validateWhereIn(field, values) {
    if (!Array.isArray(values)) {
      throw new Error(`whereIn requires an array of values for field ${field}`);
    }
  }

  /**
   * Validates the opt-in fuzzy predicate API before Fuse receives configuration.
   * Only threshold is exposed deliberately so query callers cannot override
   * compiler-owned options such as keys, includeScore, or sorting.
   *
   * @param {*} field Target field identifier.
   * @param {*} query Fuzzy search text.
   * @param {*} options Fuzzy configuration.
   * @throws {Error} If the predicate cannot be evaluated safely.
   */
  validateFuzzyCondition(field, query, options = {}) {
    if (typeof field !== 'string' || field.trim().length === 0) {
      throw new Error('Fuzzy field must be a non-empty string');
    }
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Fuzzy query must be a non-empty string');
    }
    if (
      options === null ||
      typeof options !== 'object' ||
      Array.isArray(options)
    ) {
      throw new Error('Fuzzy options must be an object');
    }
    for (const optionName of Object.keys(options)) {
      if (optionName !== 'threshold') {
        throw new Error(`Unknown fuzzy option: ${optionName}`);
      }
    }
    if (
      Object.prototype.hasOwnProperty.call(options, 'threshold') &&
      (!Number.isFinite(options.threshold) || options.threshold < 0 || options.threshold > 1)
    ) {
      throw new Error('Fuzzy threshold must be a finite number between 0 and 1');
    }
  }

  /**
   * @description Verifies sort direction identifiers.
   * @param {string} direction - The sort direction string.
   * @throws {Error} If direction is neither 'ASC' nor 'DESC' (case-insensitive).
   */
  validateOrderDirection(direction) {
    const dir = direction.toUpperCase();
    if (dir !== 'ASC' && dir !== 'DESC') {
      throw new Error("Sort direction must be 'ASC' or 'DESC'");
    }
  }
}
