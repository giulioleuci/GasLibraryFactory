/**
 * @file RoleResolutionLib/src/core/ResolutionStrategy.js
 * @description Enumeration of resolution strategies for role resolution.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Logic for selecting actors when multiple matches exist for a role/scope.
 */
export const ResolutionStrategy = Object.freeze({
  /** Returns the first encountered match. */
  FIRST: 'FIRST',
  /** Returns all matches as an array. */
  ALL: 'ALL',
  /** Returns matches sorted by priority weight. */
  PRIORITY: 'PRIORITY'
});

/**
 * @function isValidResolutionStrategy
 * @description Validates if a string is a recognized ResolutionStrategy.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ResolutionStrategy.
 */
export function isValidResolutionStrategy(value) {
  return Object.values(ResolutionStrategy).includes(value);
}

/**
 * @function getResolutionStrategies
 * @description Retrieves all supported strategy strings.
 * @returns {string[]} Array of ResolutionStrategy values.
 */
export function getResolutionStrategies() {
  return Object.values(ResolutionStrategy);
}
