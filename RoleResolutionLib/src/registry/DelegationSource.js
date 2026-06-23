/**
 * @file RoleResolutionLib/src/registry/DelegationSource.js
 * @description Interface definition for delegation data sources.
 * @version 1.0.0
 */

/**
 * @interface DelegationSource
 * @description Contract for persistence layers providing active responsibility transfers.
 */
export class DelegationSource {
  /**
   * @function getActiveDelegationsForPrincipal
   * @description Retrieves delegations issued by an actor that are valid at a specific time.
   * @param {string} principalId - Issuing actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]}
   * @abstract
   */
  getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForPrincipal() must be implemented');
  }

  /**
   * @function getActiveDelegationsForDelegate
   * @description Retrieves delegations received by an actor.
   * @param {string} delegateId - Receiving actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]}
   * @abstract
   */
  getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) {
    throw new Error('DelegationSource.getActiveDelegationsForDelegate() must be implemented');
  }

  /**
   * @function getDelegationChain
   * @description Resolves transitive delegation paths (A -> B -> C) for a role/scope context.
   * @param {string} actorId - Starting principal ID.
   * @param {string} roleId - Role context for filtering.
   * @param {Scope} scope - Scope context for filtering.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Delegation[]} Ordered array from nearest to farthest delegate.
   * @abstract
   */
  getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) {
    throw new Error('DelegationSource.getDelegationChain() must be implemented');
  }
}

/**
 * @class InMemoryDelegationSource
 * @extends DelegationSource
 * @description Non-persistent implementation using arrays for delegation storage.
 */
export class InMemoryDelegationSource extends DelegationSource {
  /**
   * @constructor
   * @param {Object} [data={}] - Initial state.
   * @param {Delegation[]} [data.delegations=[]] - Seed delegations.
   */
  constructor(data = {}) {
    super();

    /** @type {Delegation[]} @private */
    this._delegations = data.delegations || [];
  }

  /**
   * @function addDelegation
   * @param {Delegation} delegation - Record to append.
   */
  addDelegation(delegation) {
    this._delegations.push(delegation);
  }

  /**
   * @function _isValidDelegation
   * @description Internal validity checker (isActive, validFrom, validTo).
   * @param {Delegation} delegation - Target for check.
   * @param {Date} asOfDate - Reference time.
   * @returns {boolean}
   * @private
   */
  _isValidDelegation(delegation, asOfDate) {
    if (typeof delegation.isValidAt === 'function') {
      return delegation.isValidAt(asOfDate);
    }

    // Manual validity check
    if (delegation.isActive === false) {
      return false;
    }
    if (delegation.validFrom && asOfDate < new Date(delegation.validFrom)) {
      return false;
    }
    if (delegation.validTo && asOfDate > new Date(delegation.validTo)) {
      return false;
    }

    return true;
  }

  /**
   * @function getActiveDelegationsForPrincipal
   * @param {string} principalId - Issuer ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
  getActiveDelegationsForPrincipal(principalId, asOfDate = new Date()) {
    return this._delegations.filter((delegation) => {
      if (delegation.principalId !== principalId) {
        return false;
      }
      return this._isValidDelegation(delegation, asOfDate);
    });
  }

  /**
   * @function getActiveDelegationsForDelegate
   * @param {string} delegateId - Receiver ID.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]}
   */
  getActiveDelegationsForDelegate(delegateId, asOfDate = new Date()) {
    return this._delegations.filter((delegation) => {
      if (delegation.delegateId !== delegateId) {
        return false;
      }
      return this._isValidDelegation(delegation, asOfDate);
    });
  }

  /**
   * @function getDelegationChain
   * @description Synchronously crawls the delegation graph to build a linear chain for a specific context.
   * @param {string} actorId - Start ID.
   * @param {string} roleId - Role filter.
   * @param {Scope} scope - Scope filter.
   * @param {Date} [asOfDate=new Date()] - Reference time.
   * @returns {Delegation[]} Ordered transitive chain.
   */
  getDelegationChain(actorId, roleId, scope, asOfDate = new Date()) {
    const chain = [];
    const visited = new Set();
    let currentActorId = actorId;

    while (currentActorId && !visited.has(currentActorId)) {
      visited.add(currentActorId);

      // Find delegations from this actor
      const delegations = this.getActiveDelegationsForPrincipal(currentActorId, asOfDate);

      // Find a delegation that applies to the role and scope
      const applicableDelegation = delegations.find((delegation) => {
        // Check if delegation applies to this role
        if (typeof delegation.appliesToRole === 'function') {
          if (!delegation.appliesToRole(roleId)) {
            return false;
          }
        } else {
          // Manual check
          if (delegation.roleIds !== '*' && !delegation.roleIds?.includes(roleId)) {
            return false;
          }
        }

        // Check if delegation applies to this scope
        if (typeof delegation.appliesToScope === 'function') {
          return delegation.appliesToScope(scope);
        }

        return true;
      });

      if (applicableDelegation) {
        chain.push(applicableDelegation);
        currentActorId = applicableDelegation.delegateId;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * @function getAllDelegations
   * @returns {Delegation[]} Complete set.
   */
  getAllDelegations() {
    return [...this._delegations];
  }

  /**
   * @function clear
   * @description Purges all internal delegations.
   */
  clear() {
    this._delegations = [];
  }
}
