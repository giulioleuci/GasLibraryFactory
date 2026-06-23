/**
 * @file SheetDBLib/src/multi/RoutingStrategy.js
 * @description Routing strategies for multi-database partition selection.
 * @version 1.0.0
 */

/**
 * RoutingStrategy enumeration - Defines how queries are routed to partitions.
 *
 * @readonly
 * @enum {string}
 */
export const RoutingStrategy = Object.freeze({
  /** Caller always explicitly specifies the partition */
  EXPLICIT: 'EXPLICIT',

  /** Routing based on tag matching */
  TAG_BASED: 'TAG_BASED',

  /** Cyclic distribution for read load balancing */
  ROUND_ROBIN: 'ROUND_ROBIN',

  /** Use partition with highest priority */
  PRIORITY: 'PRIORITY',

  /** Custom routing function provided by caller */
  CUSTOM: 'CUSTOM'
});

/**
 * @description Validates if a string value corresponds to a member of RoutingStrategy.
 * @param {string} value - The strategy identifier to verify.
 * @returns {boolean} True if the value is a recognized routing strategy.
 */
export function isValidRoutingStrategy(value) {
  return Object.values(RoutingStrategy).includes(value);
}

/**
 * @description Returns a collection of all registered routing strategy identifiers.
 * @returns {string[]} Collection of valid strategy names.
 */
export function getRoutingStrategies() {
  return Object.values(RoutingStrategy);
}
