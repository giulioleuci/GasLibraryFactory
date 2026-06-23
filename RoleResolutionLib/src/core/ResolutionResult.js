/**
 * @file RoleResolutionLib/src/core/ResolutionResult.js
 * @description ResolutionResult representing the complete result of role resolution.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class ResolutionResult
 * @description Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).
 */
export class ResolutionResult {
  /**
   * @constructor
   * @param {Object} data - Result payload.
   * @param {Object} data.requestedRole - Queried Role instance/POJO.
   * @param {Object} data.scope - Queried Scope instance/POJO.
   * @param {Object|null} [data.effectiveActor=null] - Resolved actor authorized to act.
   * @param {Object|null} [data.principalActor=null] - Original non-delegated actor.
   * @param {Object[]} [data.allActors=[]] - Complete set of resolved actors (for MULTI strategy).
   * @param {Object[]} [data.delegationChain=[]] - History of delegation objects applied.
   * @param {Object} [data.routing={}] - Notification targets (primary, cc, bcc arrays).
   * @param {Object} [data.metadata={}] - Resolution audit data.
   * @param {boolean} [data.fallbackUsed=false] - True if resolved via fallback.
   * @param {string|null} [data.fallbackRoleId=null] - ID of fallback role used.
   * @throws {Error} If data is missing or non-object.
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('ResolutionResult data is required');
    }

    /**
     * The role that was requested.
     * @type {Object}
     * @readonly
     */
    this.requestedRole = data.requestedRole;

    /**
     * The scope that was queried.
     * @type {Object}
     * @readonly
     */
    this.scope = data.scope;

    /**
     * The actor who should perform the action (may be delegate).
     * @type {Object|null}
     * @readonly
     */
    this.effectiveActor = data.effectiveActor || null;

    /**
     * The original principal actor (before delegation).
     * @type {Object|null}
     * @readonly
     */
    this.principalActor = data.principalActor || null;

    /**
     * All actors resolved (when resolution strategy is ALL).
     * @type {Object[]}
     * @readonly
     */
    this.allActors = Array.isArray(data.allActors) ? [...data.allActors] : [];

    /**
     * Chain of delegations that were applied.
     * @type {Object[]}
     * @readonly
     */
    this.delegationChain = Array.isArray(data.delegationChain) ? [...data.delegationChain] : [];

    /**
     * Routing information for notifications.
     * @type {Object}
     * @readonly
     */
    this.routing = {
      primary: data.routing?.primary ? [...data.routing.primary] : [],
      cc: data.routing?.cc ? [...data.routing.cc] : [],
      bcc: data.routing?.bcc ? [...data.routing.bcc] : []
    };

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = {
      resolvedAt: new Date(),
      ...cloneDeep(data.metadata || {})
    };

    /**
     * Whether a fallback role was used.
     * @type {boolean}
     * @readonly
     */
    this.fallbackUsed = data.fallbackUsed === true;

    /**
     * The fallback role ID that was used.
     * @type {string|null}
     * @readonly
     */
    this.fallbackRoleId = data.fallbackRoleId || null;

    // Freeze to ensure immutability
    Object.freeze(this);
    Object.freeze(this.allActors);
    Object.freeze(this.delegationChain);
    Object.freeze(this.routing);
    Object.freeze(this.routing.primary);
    Object.freeze(this.routing.cc);
    Object.freeze(this.routing.bcc);
    Object.freeze(this.metadata);
  }

  /**
   * @function isResolved
   * @returns {boolean} True if an effectiveActor was found.
   */
  isResolved() {
    return this.effectiveActor !== null;
  }

  /**
   * @function isDelegated
   * @returns {boolean} True if delegationChain is non-empty.
   */
  isDelegated() {
    return this.delegationChain.length > 0;
  }

  /**
   * @function getDelegationDepth
   * @returns {number} Count of delegation hops.
   */
  getDelegationDepth() {
    return this.delegationChain.length;
  }

  /**
   * @function hasEffectiveActorChange
   * @description Checks if delegation resulted in a different actor identity.
   * @returns {boolean}
   */
  hasEffectiveActorChange() {
    if (!this.effectiveActor || !this.principalActor) {
      return false;
    }
    return this.effectiveActor.id !== this.principalActor.id;
  }

  /**
   * @function getAllRoutingRecipients
   * @description Aggregates primary, cc, and bcc actor arrays.
   * @returns {Object[]} Combined list of all notified actors.
   */
  getAllRoutingRecipients() {
    return [...this.routing.primary, ...this.routing.cc, ...this.routing.bcc];
  }

  /**
   * @function getAllActorIds
   * @description Extracts unique actor IDs from all resolution facets.
   * @returns {string[]} Set of involved actor IDs.
   */
  getAllActorIds() {
    const ids = new Set();
    if (this.effectiveActor) {
      ids.add(this.effectiveActor.id);
    }
    if (this.principalActor) {
      ids.add(this.principalActor.id);
    }
    this.allActors.forEach((a) => ids.add(a.id));
    this.getAllRoutingRecipients().forEach((a) => ids.add(a.id));
    return Array.from(ids);
  }

  /**
   * @static
   * @description Factory for unsuccessful resolution.
   * @param {Object} requestedRole - Requested role context.
   * @param {Object} scope - Queried scope context.
   * @param {Object} [metadata={}] - Audit trails.
   * @returns {ResolutionResult} Unresolved result instance.
   */
  static empty(requestedRole, scope, metadata = {}) {
    return new ResolutionResult({
      requestedRole,
      scope,
      effectiveActor: null,
      principalActor: null,
      delegationChain: [],
      routing: { primary: [], cc: [], bcc: [] },
      metadata: { ...metadata, isEmpty: true }
    });
  }

  /**
   * @static
   * @description Factory for single-actor successful resolution without delegation.
   * @param {Object} requestedRole - Requested role context.
   * @param {Object} scope - Queried scope context.
   * @param {Object} actor - Resolved actor instance.
   * @returns {ResolutionResult} Resolved result instance.
   */
  static simple(requestedRole, scope, actor) {
    return new ResolutionResult({
      requestedRole,
      scope,
      effectiveActor: actor,
      principalActor: actor,
      delegationChain: [],
      routing: { primary: [actor], cc: [], bcc: [] }
    });
  }

  /**
   * @function toJSON
   * @description Deeply serializes all result facets to POJO.
   * @returns {Object} JSON-compatible structure.
   */
  toJSON() {
    return {
      requestedRole: this.requestedRole?.toJSON ? this.requestedRole.toJSON() : this.requestedRole,
      scope: this.scope?.toJSON ? this.scope.toJSON() : this.scope,
      effectiveActor: this.effectiveActor?.toJSON
        ? this.effectiveActor.toJSON()
        : this.effectiveActor,
      principalActor: this.principalActor?.toJSON
        ? this.principalActor.toJSON()
        : this.principalActor,
      allActors: this.allActors.map((a) => (a?.toJSON ? a.toJSON() : a)),
      delegationChain: this.delegationChain.map((d) => (d?.toJSON ? d.toJSON() : d)),
      routing: {
        primary: this.routing.primary.map((a) => (a?.toJSON ? a.toJSON() : a)),
        cc: this.routing.cc.map((a) => (a?.toJSON ? a.toJSON() : a)),
        bcc: this.routing.bcc.map((a) => (a?.toJSON ? a.toJSON() : a))
      },
      metadata: { ...this.metadata },
      fallbackUsed: this.fallbackUsed,
      fallbackRoleId: this.fallbackRoleId
    };
  }

  /**
   * @function toString
   * @returns {string} Debug string: ResolutionResult[ROLE] -> EFFECTIVE (delegation/fallback).
   */
  toString() {
    if (!this.isResolved()) {
      return `ResolutionResult[${this.requestedRole?.id || 'unknown'}] NOT RESOLVED`;
    }

    const delegationInfo = this.isDelegated()
      ? ` (delegated from ${this.principalActor?.displayName || this.principalActor?.id})`
      : '';

    const fallbackInfo = this.fallbackUsed ? ` [fallback: ${this.fallbackRoleId}]` : '';

    return `ResolutionResult[${this.requestedRole?.id || 'unknown'}] -> ${this.effectiveActor?.displayName || this.effectiveActor?.id}${delegationInfo}${fallbackInfo}`;
  }
}
