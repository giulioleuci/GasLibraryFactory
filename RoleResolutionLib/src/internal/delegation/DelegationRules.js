/**
 * @file RoleResolutionLib/src/delegation/DelegationRules.js
 * @description Business rules and applicability logic for a Delegation.
 */

export class DelegationRules {
  constructor(state) {
    this.state = state;
  }

  isValidAt(asOfDate = new Date()) {
    if (!this.state.isActive) {
      return false;
    }

    if (asOfDate < this.state.validFrom) {
      return false;
    }

    if (this.state.validTo !== null && asOfDate > this.state.validTo) {
      return false;
    }

    return true;
  }

  appliesToRole(roleId) {
    if (this.state.roleIds === '*') {
      return true;
    }
    return this.state.roleIds.includes(roleId);
  }

  appliesToScope(targetScope) {
    if (!this.state.scopeRestriction) {
      return true;
    }

    return (
      this.state.scopeRestriction.contains(targetScope) ||
      this.state.scopeRestriction.matches(targetScope)
    );
  }

  appliesTo(roleId, scope, asOfDate = new Date()) {
    return this.isValidAt(asOfDate) && this.appliesToRole(roleId) && this.appliesToScope(scope);
  }

  isFullDelegation() {
    return this.state.roleIds === '*';
  }

  isIndefinite() {
    return this.state.validTo === null;
  }

  getRemainingDays(asOfDate = new Date()) {
    if (this.state.validTo === null) {
      return null;
    }

    if (asOfDate > this.state.validTo) {
      return 0;
    }

    const diffMs = this.state.validTo.getTime() - asOfDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
