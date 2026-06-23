/**
 * @file RoleResolutionLib/src/delegation/Delegation.js
 * @description Delegation value object representing a responsibility transfer.
 * @version 1.0.0
 */

import { DelegationState } from './DelegationState.js';
import { DelegationRules } from './DelegationRules.js';

/**
 * @class Delegation
 * @description Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.
 */
export class Delegation {
  /**
   * @constructor
   * @param {Object} definition - Delegation specification.
   * @param {string} definition.id - Unique delegation identifier.
   * @param {string} definition.principalId - ID of actor surrendering responsibilities.
   * @param {string} definition.delegateId - ID of actor assuming responsibilities.
   * @param {string[]|'*'} [definition.roleIds='*'] - Specific role IDs or wildcard for all.
   * @param {Scope|Object|null} [definition.scope=null] - Target scope.
   * @param {Scope|Object|null} [definition.scopeRestriction=null] - Optional narrowing of principal scope.
   * @param {Date|string} [definition.validFrom=now] - Start of delegation period.
   * @param {Date|string|null} [definition.validTo=null] - End of delegation period.
   * @param {string} [definition.routingPolicy=RoutingPolicy.DELEGATE_ONLY] - Routing strategy.
   * @param {boolean} [definition.isActive=true] - Soft-enable flag.
   * @param {string} [definition.reason=''] - Audit trail justification.
   * @param {Object} [definition.metadata={}] - Domain attributes.
   * @throws {Error} Via DelegationState if definition is invalid.
   */
  constructor(definition) {
    this._state = new DelegationState(definition);
    this._rules = new DelegationRules(this._state);

    Object.assign(this, this._state);

    const methods = [
      'isValidAt',
      'appliesToRole',
      'appliesToScope',
      'appliesTo',
      'isFullDelegation',
      'isIndefinite',
      'getRemainingDays'
    ];
    methods.forEach(m => {
      this[m] = this._rules[m].bind(this._rules);
    });

    this.getMetadata = this._state.getMetadata.bind(this._state);
    this.toJSON = this._state.toJSON.bind(this._state);

    Object.freeze(this);
    if (Array.isArray(this.roleIds)) {
      Object.freeze(this.roleIds);
    }
    Object.freeze(this.metadata);
  }

  /**
   * @function equals
   * @description Comparison based on unique delegation ID.
   * @param {Delegation} other - Target for comparison.
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Delegation)) {
      return false;
    }
    return this.id === other.id;
  }

  /**
   * @static
   * @description Factory to hydrate a Delegation from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Delegation}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid delegation object');
    }
    return new Delegation(obj);
  }

  /**
   * @function toString
   * @returns {string} Debug string: Delegation[ID] PRINCIPAL -> DELEGATE [Roles] [Period] (Reason).
   */
  toString() {
    const rolesStr = this.roleIds === '*' ? 'ALL ROLES' : this.roleIds.join(', ');
    const validityStr = this.validTo
      ? `${this.validFrom.toISOString()} to ${this.validTo.toISOString()}`
      : `from ${this.validFrom.toISOString()} (indefinite)`;
    const statusStr = this.isActive ? '' : ' [INACTIVE]';
    const reasonStr = this.reason ? ` (${this.reason})` : '';

    return `Delegation[${this.id}] ${this.principalId} -> ${this.delegateId} for [${rolesStr}] ${validityStr}${reasonStr}${statusStr}`;
  }
}
