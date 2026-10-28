import type { RoleMetadata } from '../../types.js';
import type { Actor } from '../../core/Actor.js';
import type { RoleActor, RoutingResultData, Serialized } from '../../types.js';
/**
 * @file RoleResolutionLib/src/routing/RoutingResult.js
 * @description RoutingResult representing the routing decision for communications.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class RoutingResult
 * @description Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).
 */
export class RoutingResult<A extends RoleActor = Actor> {
  declare primary: A[];
  declare readonly cc: A[];
  declare readonly bcc: A[];
  declare readonly metadata: RoleMetadata;

  /**
   * @constructor
   * @param {Object} [data={}] - Routing payload.
   * @param {Actor[]} [data.primary=[]] - Directly addressed recipients (TO).
   * @param {Actor[]} [data.cc=[]] - Carbon copy recipients.
   * @param {Actor[]} [data.bcc=[]] - Blind carbon copy recipients.
   * @param {Object} [data.metadata={}] - Selection context details.
   */
  constructor(data: RoutingResultData<A> = {}) {
    /** @type {Actor[]} @readonly */
    this.primary = Array.isArray(data.primary) ? [...data.primary] : [];

    /** @type {Actor[]} @readonly */
    this.cc = Array.isArray(data.cc) ? [...data.cc] : [];

    /** @type {Actor[]} @readonly */
    this.bcc = Array.isArray(data.bcc) ? [...data.bcc] : [];

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(data.metadata || {});

    // Freeze the instance
    Object.freeze(this);
    Object.freeze(this.primary);
    Object.freeze(this.cc);
    Object.freeze(this.bcc);
    Object.freeze(this.metadata);
  }

  /**
   * @static
   * @description Factory for empty result.
   * @returns {RoutingResult}
   */
  static empty<A extends RoleActor = Actor>() {
    return new RoutingResult<A>({});
  }

  /**
   * @static
   * @description Factory for a single-recipient outcome.
   * @param {Actor} actor - The TO recipient.
   * @returns {RoutingResult}
   */
  static singlePrimary<A extends RoleActor>(actor: A) {
    return new RoutingResult({ primary: [actor] });
  }

  /**
   * @function isEmpty
   * @returns {boolean} True if all buckets (primary, cc, bcc) are empty.
   */
  isEmpty() {
    return this.primary.length === 0 && this.cc.length === 0 && this.bcc.length === 0;
  }

  /**
   * @function toJSON
   * @description Deeply serializes to POJO.
   * @returns {Object} JSON-compatible structure.
   */
  toJSON() {
    return {
      primary: this.primary.map((a) => (a?.toJSON ? a.toJSON() : a) as Serialized<A>),
      cc: this.cc.map((a) => (a?.toJSON ? a.toJSON() : a) as Serialized<A>),
      bcc: this.bcc.map((a) => (a?.toJSON ? a.toJSON() : a) as Serialized<A>),
      metadata: { ...this.metadata }
    };
  }

  /**
   * @function toString
   * @returns {string} Debug string summarizing TO and CC recipient counts/labels.
   */
  toString() {
    const parts = [];

    if (this.primary.length > 0) {
      const names = this.primary.map((a) => a?.displayName || a?.id || 'unknown').join(', ');
      parts.push(`TO: ${names}`);
    }

    if (this.cc.length > 0) {
      const names = this.cc.map((a) => a?.displayName || a?.id || 'unknown').join(', ');
      parts.push(`CC: ${names}`);
    }

    if (this.bcc.length > 0) {
      parts.push(`BCC: [${this.bcc.length} recipient(s)]`);
    }

    return parts.length > 0 ? `RoutingResult[${parts.join(', ')}]` : 'RoutingResult[empty]';
  }
}
