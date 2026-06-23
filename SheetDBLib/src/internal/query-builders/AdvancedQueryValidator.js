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
