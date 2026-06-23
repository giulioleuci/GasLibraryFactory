/**
 * @file RoleResolutionLib/src/delegation/DelegationValidator.js
 * @description Validator for delegations and delegation chains.
 * @version 1.0.0
 */

import { Delegation } from './Delegation.js';
import { DelegationChain } from './DelegationChain.js';

/**
 * @class DelegationValidator
 * @description Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.
 */
export class DelegationValidator {
  /**
   * @constructor
   * @param {Object} [options={}] - Validator configuration.
   * @param {number} [options.maxDelegationDepth=10] - Threshold for transitive delegation chain length.
   * @param {Object} [options.logger=console] - Output channel for validation telemetry.
   */
  constructor(options = {}) {
    /** @type {number} @private */
    this._maxDelegationDepth = options.maxDelegationDepth || 10;

    /** @type {Object} @private */
    this._logger = options.logger || console;
  }

  /**
   * @function validate
   * @description Validates structural integrity, temporal constraints, and actor/role existence.
   * @param {Delegation} delegation - Target for validation.
   * @param {Object} [context={}] - External registry checks (actorExists, roleExists).
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
  validate(delegation, context = {}) {
    const errors = [];
    const warnings = [];

    // Check if delegation is a Delegation instance
    if (!(delegation instanceof Delegation)) {
      errors.push('Input is not a Delegation instance');
      return { isValid: false, errors, warnings };
    }

    // Validate principal != delegate
    if (delegation.principalId === delegation.delegateId) {
      errors.push('Principal and delegate cannot be the same actor');
    }

    // Validate dates
    if (delegation.validTo !== null && delegation.validTo < delegation.validFrom) {
      errors.push('validTo must be after validFrom');
    }

    // Check if delegation is expired
    const now = new Date();
    if (delegation.validTo !== null && delegation.validTo < now) {
      warnings.push('Delegation is expired');
    }

    // Check if delegation has not started yet
    if (delegation.validFrom > now) {
      warnings.push('Delegation has not started yet');
    }

    // Validate actors exist (if context provides the function)
    if (context.actorExists) {
      if (!context.actorExists(delegation.principalId)) {
        errors.push(`Principal actor not found: ${delegation.principalId}`);
      }
      if (!context.actorExists(delegation.delegateId)) {
        errors.push(`Delegate actor not found: ${delegation.delegateId}`);
      }
    }

    // Validate roles exist (if context provides the function)
    if (context.roleExists && delegation.roleIds !== '*') {
      for (const roleId of delegation.roleIds) {
        if (!context.roleExists(roleId)) {
          errors.push(`Role not found: ${roleId}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * @function validateChain
   * @description Comprehensive chain check including depth limits, cycles, linkage, and scope coherence.
   * @param {DelegationChain} chain - Target for validation.
   * @param {Object} [context={}] - External registry checks.
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
  validateChain(chain, context = {}) {
    const errors = [];
    const warnings = [];

    // Check if chain is a DelegationChain instance
    if (!(chain instanceof DelegationChain)) {
      errors.push('Input is not a DelegationChain instance');
      return { isValid: false, errors, warnings };
    }

    // Empty chain is valid
    if (chain.isEmpty()) {
      return { isValid: true, errors, warnings };
    }

    // Check maximum depth
    if (chain.getDepth() > this._maxDelegationDepth) {
      errors.push(
        `Delegation chain depth (${chain.getDepth()}) exceeds maximum (${this._maxDelegationDepth})`
      );
    }

    // Check for cycles
    const cycleCheck = this._detectCycle(chain);
    if (cycleCheck.hasCycle) {
      errors.push(`Circular delegation detected: ${cycleCheck.cycleDescription}`);
    }

    // Validate each delegation
    chain.forEach((delegation, index) => {
      const result = this.validate(delegation, context);
      if (!result.isValid) {
        result.errors.forEach((err) => {
          errors.push(`Delegation ${index} (${delegation.id}): ${err}`);
        });
      }
      result.warnings.forEach((warn) => {
        warnings.push(`Delegation ${index} (${delegation.id}): ${warn}`);
      });
    });

    // Check chain linkage
    for (let i = 1; i < chain.getDepth(); i++) {
      const prev = chain.getAt(i - 1);
      const curr = chain.getAt(i);

      if (prev.delegateId !== curr.principalId) {
        errors.push(
          `Chain broken between delegation ${i - 1} and ${i}: ` +
            `${prev.delegateId} != ${curr.principalId}`
        );
      }
    }

    // Check scope coherence along the chain
    const scopeWarnings = this._checkScopeCoherence(chain);
    warnings.push(...scopeWarnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * @function _detectCycle
   * @description Scans actor IDs for duplicates indicating a loop.
   * @param {DelegationChain} chain - Target for inspection.
   * @returns {Object} {hasCycle: boolean, cycleDescription: string|null}
   * @private
   */
  _detectCycle(chain) {
    const seen = new Set();
    const actorIds = chain.getAllActorIds();

    for (const actorId of actorIds) {
      if (seen.has(actorId)) {
        return {
          hasCycle: true,
          cycleDescription: `Actor ${actorId} appears multiple times in chain`
        };
      }
      seen.add(actorId);
    }

    return { hasCycle: false, cycleDescription: null };
  }

  /**
   * @function _checkScopeCoherence
   * @description Warns if scope restrictions are not progressively narrower or equal.
   * @param {DelegationChain} chain - Target for inspection.
   * @returns {string[]} Warning messages.
   * @private
   */
  _checkScopeCoherence(chain) {
    const warnings = [];

    // Check if scope restrictions are progressively narrower
    let previousRestriction = null;

    chain.forEach((delegation, index) => {
      const restriction = delegation.scopeRestriction;

      if (restriction && previousRestriction) {
        // Check if current restriction is compatible with previous
        if (!previousRestriction.contains(restriction)) {
          warnings.push(
            `Delegation ${index}: scope restriction may be inconsistent with previous delegation`
          );
        }
      }

      previousRestriction = restriction || previousRestriction;
    });

    return warnings;
  }

  /**
   * @function validateExtension
   * @description Speculative validation before extending a chain with a new segment.
   * @param {DelegationChain} chain - Base chain.
   * @param {Delegation} delegation - Proposed new segment.
   * @param {Object} [context={}] - External registry checks.
   * @returns {Object} {isValid: boolean, errors: string[], warnings: string[]}
   */
  validateExtension(chain, delegation, context = {}) {
    const errors = [];
    const warnings = [];

    // Validate the delegation itself
    const delegationResult = this.validate(delegation, context);
    errors.push(...delegationResult.errors);
    warnings.push(...delegationResult.warnings);

    if (!chain.isEmpty()) {
      // Check linkage
      const last = chain.getLast();
      if (last.delegateId !== delegation.principalId) {
        errors.push(
          `Cannot extend chain: last delegate is ${last.delegateId}, ` +
            `but new delegation is from ${delegation.principalId}`
        );
      }
    }

    // Check for cycles
    if (chain.wouldCreateCycle(delegation)) {
      errors.push(`Would create cycle: ${delegation.delegateId} already in chain`);
    }

    // Check depth limit
    if (chain.getDepth() + 1 > this._maxDelegationDepth) {
      errors.push(
        `Would exceed maximum depth: ${chain.getDepth() + 1} > ${this._maxDelegationDepth}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * @function getMaxDelegationDepth
   * @returns {number}
   */
  getMaxDelegationDepth() {
    return this._maxDelegationDepth;
  }
}
