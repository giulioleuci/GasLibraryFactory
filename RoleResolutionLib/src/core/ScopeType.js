/**
 * @file RoleResolutionLib/src/core/ScopeType.js
 * @description Enumeration of scope types for role resolution.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Logical levels/boundaries for role assignment validity.
 */
export const ScopeType = Object.freeze({
  /** Universal validity. */
  GLOBAL: 'GLOBAL',
  /** Division, department, or team boundary. */
  ORG_UNIT: 'ORG_UNIT',
  /** Cross-functional project or initiative boundary. */
  PROJECT: 'PROJECT',
  /** Specific entity (document, folder, record) boundary. */
  RESOURCE: 'RESOURCE',
  /** Domain-specific application boundary. */
  CUSTOM: 'CUSTOM'
});

/**
 * @function isValidScopeType
 * @description Validates if a string is a recognized ScopeType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ScopeType.
 */
export function isValidScopeType(value) {
  return Object.values(ScopeType).includes(value);
}

/**
 * @function getScopeTypes
 * @description Retrieves all supported scope type strings.
 * @returns {string[]} Array of ScopeType values.
 */
export function getScopeTypes() {
  return Object.values(ScopeType);
}
