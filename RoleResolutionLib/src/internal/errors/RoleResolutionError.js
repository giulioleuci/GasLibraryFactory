/**
 * @file RoleResolutionLib/src/errors/RoleResolutionError.js
 * @description Base error class and specialized errors for role resolution.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class RoleResolutionError
 * @extends BaseError
 * @description Base exception for all role-related lookup and assignment failures.
 */
export class RoleResolutionError extends BaseError {
  /**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (roleId, scope, etc.).
   * @param {Error} [originalError=null] - Wrapped exception.
   */
  constructor(message, context = {}, originalError = null) {
    super(message, context, originalError);
    this.name = 'RoleResolutionError';
  }
}

/**
 * @class RoleNotFoundError
 * @extends RoleResolutionError
 * @description Thrown when a role ID is missing from the registry.
 */
export class RoleNotFoundError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} roleId - The unknown role identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, context = {}) {
    super(`Role not found: ${roleId}`, { ...context, roleId });
    this.name = 'RoleNotFoundError';
    this.roleId = roleId;
  }
}

/**
 * @class NoActorFoundError
 * @extends RoleResolutionError
 * @description Thrown when resolution logic yields an empty set for a role/scope.
 */
export class NoActorFoundError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} roleId - Queried role.
   * @param {Object} [scope=null] - Searched scope instance.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, scope = null, context = {}) {
    const scopeStr = scope ? ` in scope ${scope.toString?.() || JSON.stringify(scope)}` : '';
    super(`No actor found for role ${roleId}${scopeStr}`, { ...context, roleId, scope });
    this.name = 'NoActorFoundError';
    this.roleId = roleId;
    this.scope = scope;
  }
}

/**
 * @class ActorNotFoundError
 * @extends RoleResolutionError
 * @description Thrown when a specific actor ID cannot be resolved.
 */
export class ActorNotFoundError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} actorId - The missing actor identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId, context = {}) {
    super(`Actor not found: ${actorId}`, { ...context, actorId });
    this.name = 'ActorNotFoundError';
    this.actorId = actorId;
  }
}

/**
 * @class CircularDelegationError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected in the delegation graph.
 */
export class CircularDelegationError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} actorId - Actor causing the cycle.
   * @param {string[]} [chain=[]] - Trace of IDs forming the cycle.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId, chain = [], context = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular delegation detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularDelegationError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
 * @class InvalidScopeError
 * @extends RoleResolutionError
 * @description Thrown when a provided scope type is incompatible with role requirements.
 */
export class InvalidScopeError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} roleId - Role under query.
   * @param {string} providedScopeType - Actual scope level.
   * @param {string} expectedScopeType - Required scope level.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId, providedScopeType, expectedScopeType, context = {}) {
    super(
      `Invalid scope for role ${roleId}: expected ${expectedScopeType}, got ${providedScopeType}`,
      { ...context, roleId, providedScopeType, expectedScopeType }
    );
    this.name = 'InvalidScopeError';
    this.roleId = roleId;
    this.providedScopeType = providedScopeType;
    this.expectedScopeType = expectedScopeType;
  }
}

/**
 * @class DelegationDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when a chain exceeds safety limits (default 10).
 */
export class DelegationDepthExceededError extends RoleResolutionError {
  /**
   * @constructor
   * @param {number} actualDepth - Chain length detected.
   * @param {number} maxDepth - Allowed threshold.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actualDepth, maxDepth, context = {}) {
    super(`Delegation chain depth (${actualDepth}) exceeds maximum (${maxDepth})`, {
      ...context,
      actualDepth,
      maxDepth
    });
    this.name = 'DelegationDepthExceededError';
    this.actualDepth = actualDepth;
    this.maxDepth = maxDepth;
  }
}

/**
 * @class RoleValidationError
 * @extends RoleResolutionError
 * @description Thrown when role or actor definition schemas are violated.
 */
export class RoleValidationError extends RoleResolutionError {
  /**
   * @constructor
   * @param {string} message - High-level failure reason.
   * @param {string[]} [errors=[]] - Detailed list of violations.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(message, errors = [], context = {}) {
    super(message, { ...context, validationErrors: errors });
    this.name = 'RoleValidationError';
    this.validationErrors = errors;
  }
}
