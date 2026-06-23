/**
 * @file RoleResolutionLib/src/delegation/DelegationState.js
 * @description State object for a Delegation, handling data validation and storage.
 */

import { Scope } from '../../core/Scope.js';
import { RoutingPolicy, isValidRoutingPolicy } from '../routing/RoutingPolicy.js';
import { cloneDeep } from '@CoreUtilsLib';

export class DelegationState {
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('Delegation definition is required');
    }

    const {
      id,
      principalId,
      delegateId,
      roleIds = '*',
      scope = null,
      scopeRestriction = null,
      validFrom = new Date(),
      validTo = null,
      routingPolicy = RoutingPolicy.DELEGATE_ONLY,
      isActive = true,
      reason = '',
      metadata = {}
    } = definition;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('Delegation id is required and must be a string');
    }
    if (!principalId || typeof principalId !== 'string') {
      throw new Error('Delegation principalId is required and must be a string');
    }
    if (!delegateId || typeof delegateId !== 'string') {
      throw new Error('Delegation delegateId is required and must be a string');
    }
    if (principalId === delegateId) {
      throw new Error('Principal and delegate cannot be the same actor');
    }
    if (!isValidRoutingPolicy(routingPolicy)) {
      throw new Error(`Invalid routing policy: ${routingPolicy}`);
    }

    // Validate roleIds
    if (roleIds !== '*' && !Array.isArray(roleIds)) {
      throw new Error('roleIds must be "*" or an array of role IDs');
    }

    this.id = id;
    this.principalId = principalId;
    this.delegateId = delegateId;
    this.roleIds = roleIds === '*' ? '*' : [...roleIds];
    this.scope = scope ? (scope instanceof Scope ? scope : Scope.fromJSON(scope)) : null;
    this.scopeRestriction = scopeRestriction
      ? scopeRestriction instanceof Scope
        ? scopeRestriction
        : Scope.fromJSON(scopeRestriction)
      : null;
    this.validFrom = this._parseDate(validFrom) || new Date();
    this.validTo = this._parseDate(validTo);
    this.routingPolicy = routingPolicy;
    this.isActive = isActive === true;
    this.reason = String(reason);
    this.metadata = cloneDeep(metadata);
  }

  _parseDate(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  getMetadata(key, defaultValue = null) {
    return this.metadata.hasOwnProperty(key) ? this.metadata[key] : defaultValue;
  }

  toJSON() {
    return {
      id: this.id,
      principalId: this.principalId,
      delegateId: this.delegateId,
      roleIds: this.roleIds === '*' ? '*' : [...this.roleIds],
      scope: this.scope ? this.scope.toJSON() : null,
      scopeRestriction: this.scopeRestriction ? this.scopeRestriction.toJSON() : null,
      validFrom: this.validFrom.toISOString(),
      validTo: this.validTo ? this.validTo.toISOString() : null,
      routingPolicy: this.routingPolicy,
      isActive: this.isActive,
      reason: this.reason,
      metadata: { ...this.metadata }
    };
  }
}
