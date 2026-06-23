/**
 * @file RoleResolutionLib/src/delegation/DelegationChain.js
 * @description DelegationChain representing a chain of delegations.
 * @version 1.0.0
 */

import { Delegation } from './Delegation.js';

/**
 * @class DelegationChain
 * @description Immutable Collection representing a transitive series of Delegations (A -> B -> C).
 */
export class DelegationChain {
  /**
   * @constructor
   * @param {Delegation[]} [delegations=[]] - Linked array of Delegation instances.
   * @throws {Error} If any element is not a Delegation, if linkage is broken, or if cycles exist.
   */
  constructor(delegations = []) {
    if (!Array.isArray(delegations)) {
      throw new Error('Delegations must be an array');
    }

    // Validate chain integrity
    for (let i = 0; i < delegations.length; i++) {
      if (!(delegations[i] instanceof Delegation)) {
        throw new Error(`Element at index ${i} is not a Delegation`);
      }

      // Check chain linkage (except for first element)
      if (i > 0) {
        const prev = delegations[i - 1];
        const curr = delegations[i];

        if (prev.delegateId !== curr.principalId) {
          throw new Error(
            `Chain is broken at index ${i}: ` +
              `delegation ${prev.id} delegates to ${prev.delegateId}, ` +
              `but delegation ${curr.id} is from ${curr.principalId}`
          );
        }
      }
    }

    /** @type {Delegation[]} @readonly */
    this.delegations = [...delegations];

    Object.freeze(this);
    Object.freeze(this.delegations);
  }

  /**
   * @static
   * @description Factory for empty chain.
   * @returns {DelegationChain}
   */
  static empty() {
    return new DelegationChain([]);
  }

  /**
   * @static
   * @description Factory for single-hop chain.
   * @param {Delegation} delegation - Primary delegation.
   * @returns {DelegationChain}
   */
  static single(delegation) {
    return new DelegationChain([delegation]);
  }

  /**
   * @function isEmpty
   * @returns {boolean} True if delegations array is empty.
   */
  isEmpty() {
    return this.delegations.length === 0;
  }

  /**
   * @function getDepth
   * @returns {number} Count of delegation segments.
   */
  getDepth() {
    return this.delegations.length;
  }

  /**
   * @function getOriginalPrincipalId
   * @description Retrieves ID of the first actor in the chain.
   * @returns {string|null}
   */
  getOriginalPrincipalId() {
    if (this.isEmpty()) {
      return null;
    }
    return this.delegations[0].principalId;
  }

  /**
   * @function getFinalDelegateId
   * @description Retrieves ID of the last actor in the chain.
   * @returns {string|null}
   */
  getFinalDelegateId() {
    if (this.isEmpty()) {
      return null;
    }
    return this.delegations[this.delegations.length - 1].delegateId;
  }

  /**
   * @function getAllActorIds
   * @description Ordered list of all actors involved (Principal + all Delegates).
   * @returns {string[]}
   */
  getAllActorIds() {
    if (this.isEmpty()) {
      return [];
    }

    const ids = [this.delegations[0].principalId];
    for (const delegation of this.delegations) {
      ids.push(delegation.delegateId);
    }
    return ids;
  }

  /**
   * @function getFirst
   * @returns {Delegation|null} First delegation segment.
   */
  getFirst() {
    return this.isEmpty() ? null : this.delegations[0];
  }

  /**
   * @function getLast
   * @returns {Delegation|null} Final delegation segment.
   */
  getLast() {
    return this.isEmpty() ? null : this.delegations[this.delegations.length - 1];
  }

  /**
   * @function getAt
   * @param {number} index - 0-based position.
   * @returns {Delegation|null} Segment at index or null.
   */
  getAt(index) {
    if (index < 0 || index >= this.delegations.length) {
      return null;
    }
    return this.delegations[index];
  }

  /**
   * @function containsActor
   * @param {string} actorId - ID to check.
   * @returns {boolean}
   */
  containsActor(actorId) {
    return this.getAllActorIds().includes(actorId);
  }

  /**
   * @function wouldCreateCycle
   * @description Cycle detection logic before extending chain.
   * @param {Delegation} delegation - Potential next segment.
   * @returns {boolean} True if delegateId already exists in chain.
   */
  wouldCreateCycle(delegation) {
    // Check if the new delegate is already in the chain
    return this.containsActor(delegation.delegateId);
  }

  /**
   * @function extend
   * @description Functional append. Returns new instance with added delegation.
   * @param {Delegation} delegation - Next segment.
   * @returns {DelegationChain}
   * @throws {Error} If linkage fails or cycle is detected.
   */
  extend(delegation) {
    if (!(delegation instanceof Delegation)) {
      throw new Error('Must provide a Delegation instance');
    }

    // Check linkage
    if (!this.isEmpty()) {
      const last = this.getLast();
      if (last.delegateId !== delegation.principalId) {
        throw new Error(
          `Cannot extend chain: last delegate is ${last.delegateId}, ` +
            `but new delegation is from ${delegation.principalId}`
        );
      }
    }

    // Check for cycles
    if (this.wouldCreateCycle(delegation)) {
      throw new Error(
        `Cannot extend chain: would create a cycle with delegate ${delegation.delegateId}`
      );
    }

    return new DelegationChain([...this.delegations, delegation]);
  }

  /**
   * @function forEach
   * @param {Function} callback - (delegation, index).
   */
  forEach(callback) {
    this.delegations.forEach(callback);
  }

  /**
   * @function map
   * @param {Function} mapper - (delegation, index).
   * @returns {Array}
   */
  map(mapper) {
    return this.delegations.map(mapper);
  }

  /**
   * @function isValidAt
   * @description Validates every segment in the chain against timestamp.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean}
   */
  isValidAt(asOfDate = new Date()) {
    return this.delegations.every((d) => d.isValidAt(asOfDate));
  }

  /**
   * @function toJSON
   * @description Deeply serializes chain to POJO.
   * @returns {Object} {delegations, depth, originalPrincipalId, finalDelegateId}
   */
  toJSON() {
    return {
      delegations: this.delegations.map((d) => d.toJSON()),
      depth: this.getDepth(),
      originalPrincipalId: this.getOriginalPrincipalId(),
      finalDelegateId: this.getFinalDelegateId()
    };
  }

  /**
   * @static
   * @description Hydrates a DelegationChain from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {DelegationChain}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid chain object');
    }
    const delegations = (obj.delegations || []).map((d) => Delegation.fromJSON(d));
    return new DelegationChain(delegations);
  }

  /**
   * @function toString
   * @returns {string} Debug string: DelegationChain[ID1 -> ID2 -> ID3].
   */
  toString() {
    if (this.isEmpty()) {
      return 'DelegationChain[empty]';
    }

    const actorIds = this.getAllActorIds();
    return `DelegationChain[${actorIds.join(' -> ')}]`;
  }
}
