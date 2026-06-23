/**
 * @file RoleResolutionLib/src/core/ActorType.js
 * @description Enumeration of actor types for role resolution.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Categories of entities eligible for role assignment and delegation.
 */
export const ActorType = Object.freeze({
  /** Human user entity. */
  PERSON: 'PERSON',
  /** Automated system, bot, or service account. */
  SYSTEM: 'SYSTEM',
  /** Organizational group, team, or mailing list. */
  GROUP: 'GROUP'
});

/**
 * @function isValidActorType
 * @description Validates if a string is a recognized ActorType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ActorType.
 */
export function isValidActorType(value) {
  return Object.values(ActorType).includes(value);
}

/**
 * @function getActorTypes
 * @description Retrieves all supported actor type strings.
 * @returns {string[]} Array of ActorType values.
 */
export function getActorTypes() {
  return Object.values(ActorType);
}
