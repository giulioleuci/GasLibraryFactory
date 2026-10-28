import type { RoleMetadata } from '../../types.js';
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
  declare resolutionTrace?: import('../resolution/ResolutionTrace.js').ResolutionTrace;
  /**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (roleId, scope, etc.).
   * @param {Error} [originalError=null] - Wrapped exception.
   */
  constructor(message: string, context: RoleMetadata = {}, originalError: Error | null = null) {
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
  declare roleId: string;

  /**
   * @constructor
   * @param {string} roleId - The unknown role identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId: string, context: RoleMetadata = {}) {
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
  declare roleId: string;
  declare scope: object | null;

  /**
   * @constructor
   * @param {string} roleId - Queried role.
   * @param {Object} [scope=null] - Searched scope instance.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(roleId: string, scope: object | null = null, context: RoleMetadata = {}) {
    const scopeStr = scope ? ` in scope ${scope.toString?.() || JSON.stringify(scope)}` : '';
    super(`No actor found for role ${roleId}${scopeStr}`, { ...context, roleId, scope });
    this.name = 'NoActorFoundError';
    this.roleId = roleId;
    this.scope = scope;
  }
}

/**
 * @class CircularDelegationError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected in the delegation graph.
 */
export class CircularDelegationError extends RoleResolutionError {
  declare actorId: string;
  declare chain: string[];

  /**
   * @constructor
   * @param {string} actorId - Actor causing the cycle.
   * @param {string[]} [chain=[]] - Trace of IDs forming the cycle.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId: string, chain: string[] = [], context: RoleMetadata = {}) {
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
  declare roleId: string;
  declare providedScopeType: string | undefined;
  declare expectedScopeType: string;

  /**
   * @constructor
   * @param {string} roleId - Role under query.
   * @param {string} providedScopeType - Actual scope level.
   * @param {string} expectedScopeType - Required scope level.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(
    roleId: string,
    providedScopeType: string | undefined,
    expectedScopeType: string,
    context: RoleMetadata = {}
  ) {
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
  declare actualDepth: number;
  declare maxDepth: number;

  /**
   * @constructor
   * @param {number} actualDepth - Chain length detected.
   * @param {number} maxDepth - Allowed threshold.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actualDepth: number, maxDepth: number, context: RoleMetadata = {}) {
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
  declare validationErrors: string[];

  /**
   * @constructor
   * @param {string} message - High-level failure reason.
   * @param {string[]} [errors=[]] - Detailed list of violations.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(message: string, errors: string[] = [], context: RoleMetadata = {}) {
    super(message, { ...context, validationErrors: errors });
    this.name = 'RoleValidationError';
    this.validationErrors = errors;
  }
}

/** @class MalformedAssignmentSlotError @extends RoleResolutionError */
export class MalformedAssignmentSlotError extends RoleResolutionError {
  constructor(message: string, context: RoleMetadata = {}) {
    super(message, context);
    this.name = 'MalformedAssignmentSlotError';
  }
}

/** @class DuplicateAssignmentSlotError @extends RoleResolutionError */
export class DuplicateAssignmentSlotError extends RoleResolutionError {
  declare slotKey: string;

  constructor(slotKey: string, context: RoleMetadata = {}) {
    super(`Duplicate assignment slot: ${slotKey}`, { ...context, slotKey });
    this.name = 'DuplicateAssignmentSlotError';
    this.slotKey = slotKey;
  }
}

/** @class InconsistentAssignmentOverrideError @extends RoleResolutionError */
export class InconsistentAssignmentOverrideError extends RoleResolutionError {
  constructor(message: string, context: RoleMetadata = {}) {
    super(message, context);
    this.name = 'InconsistentAssignmentOverrideError';
  }
}

/** @class AmbiguousAssignmentOverrideError @extends RoleResolutionError */
export class AmbiguousAssignmentOverrideError extends RoleResolutionError {
  declare candidateId: string;
  declare overrideIds: readonly string[];

  constructor(candidateId: string, overrideIds: string[] = [], context: RoleMetadata = {}) {
    super(`Ambiguous assignment overrides for candidate: ${candidateId}`, {
      ...context,
      candidateId,
      overrideIds: [...overrideIds]
    });
    this.name = 'AmbiguousAssignmentOverrideError';
    this.candidateId = candidateId;
    this.overrideIds = Object.freeze([...overrideIds]);
  }
}

/** @class AssignmentActorNotFoundError @extends RoleResolutionError */
export class AssignmentActorNotFoundError extends RoleResolutionError {
  declare actorId: string;

  constructor(actorId: string, context: RoleMetadata = {}) {
    super(`Assignment actor not found: ${actorId}`, { ...context, actorId });
    this.name = 'AssignmentActorNotFoundError';
    this.actorId = actorId;
  }
}

/** @class OverlappingDelegationError @extends RoleResolutionError */
export class OverlappingDelegationError extends RoleResolutionError {
  declare actorId: string;

  constructor(actorId: string, context: RoleMetadata = {}) {
    super(`Overlapping delegation for actor: ${actorId}`, { ...context, actorId });
    this.name = 'OverlappingDelegationError';
    this.actorId = actorId;
  }
}

/**
 * @class CircularAssignmentOverrideError
 * @extends RoleResolutionError
 * @description Thrown when a loop is detected while walking an override chain.
 */
export class CircularAssignmentOverrideError extends RoleResolutionError {
  declare actorId: string;
  declare chain: string[];

  /**
   * @constructor
   * @param {string} actorId - Actor causing the cycle.
   * @param {string[]} [chain=[]] - Visited actor ids forming the cycle.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actorId: string, chain: string[] = [], context: RoleMetadata = {}) {
    const chainStr = chain.length > 0 ? ` (chain: ${chain.join(' -> ')})` : '';
    super(`Circular assignment override detected for actor: ${actorId}${chainStr}`, {
      ...context,
      actorId,
      chain
    });
    this.name = 'CircularAssignmentOverrideError';
    this.actorId = actorId;
    this.chain = chain;
  }
}

/**
 * @class OverrideChainDepthExceededError
 * @extends RoleResolutionError
 * @description Thrown when an override chain exceeds the configured maximum depth.
 */
export class OverrideChainDepthExceededError extends RoleResolutionError {
  declare actualDepth: number;
  declare maxDepth: number;

  /**
   * @constructor
   * @param {number} actualDepth - Chain length detected.
   * @param {number} maxDepth - Allowed threshold.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(actualDepth: number, maxDepth: number, context: RoleMetadata = {}) {
    super(`Override chain depth (${actualDepth}) exceeds maximum (${maxDepth})`, {
      ...context,
      actualDepth,
      maxDepth
    });
    this.name = 'OverrideChainDepthExceededError';
    this.actualDepth = actualDepth;
    this.maxDepth = maxDepth;
  }
}
