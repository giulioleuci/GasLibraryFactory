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
export class RoutingResult {
  /**
   * @constructor
   * @param {Object} [data={}] - Routing payload.
   * @param {Actor[]} [data.primary=[]] - Directly addressed recipients (TO).
   * @param {Actor[]} [data.cc=[]] - Carbon copy recipients.
   * @param {Actor[]} [data.bcc=[]] - Blind carbon copy recipients.
   * @param {Object} [data.metadata={}] - Selection context details.
   */
  constructor(data = {}) {
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
  static empty() {
    return new RoutingResult({});
  }

  /**
   * @static
   * @description Factory for a single-recipient outcome.
   * @param {Actor} actor - The TO recipient.
   * @returns {RoutingResult}
   */
  static singlePrimary(actor) {
    return new RoutingResult({ primary: [actor] });
  }

  /**
   * @static
   * @description Factory for multiple-recipient outcome.
   * @param {Actor[]} actors - Array of TO recipients.
   * @returns {RoutingResult}
   */
  static allPrimary(actors) {
    return new RoutingResult({ primary: actors });
  }

  /**
   * @function isEmpty
   * @returns {boolean} True if all buckets (primary, cc, bcc) are empty.
   */
  isEmpty() {
    return this.primary.length === 0 && this.cc.length === 0 && this.bcc.length === 0;
  }

  /**
   * @function getTotalRecipientCount
   * @returns {number} Combined length of all bucket arrays.
   */
  getTotalRecipientCount() {
    return this.primary.length + this.cc.length + this.bcc.length;
  }

  /**
   * @function getAllRecipients
   * @returns {Actor[]} Flat array of all involved entities.
   */
  getAllRecipients() {
    return [...this.primary, ...this.cc, ...this.bcc];
  }

  /**
   * @function getUniqueRecipientIds
   * @returns {string[]} Deduplicated ID set.
   */
  getUniqueRecipientIds() {
    const ids = new Set();
    this.getAllRecipients().forEach((r) => {
      if (r && r.id) {
        ids.add(r.id);
      }
    });
    return Array.from(ids);
  }

  /**
   * @function containsRecipient
   * @param {string} actorId - ID to check.
   * @returns {boolean}
   */
  containsRecipient(actorId) {
    return this.getAllRecipients().some((r) => r && r.id === actorId);
  }

  /**
   * @function getRecipientCategory
   * @param {string} actorId - ID to query.
   * @returns {string|null} 'primary', 'cc', 'bcc', or null.
   */
  getRecipientCategory(actorId) {
    if (this.primary.some((r) => r && r.id === actorId)) {
      return 'primary';
    }
    if (this.cc.some((r) => r && r.id === actorId)) {
      return 'cc';
    }
    if (this.bcc.some((r) => r && r.id === actorId)) {
      return 'bcc';
    }
    return null;
  }

  /**
   * @function withPrimary
   * @description Functional update returning new instance with added primary actor.
   * @param {Actor} actor - Entity to add.
   * @returns {RoutingResult}
   */
  withPrimary(actor) {
    return new RoutingResult({
      primary: [...this.primary, actor],
      cc: this.cc,
      bcc: this.bcc,
      metadata: this.metadata
    });
  }

  /**
   * @function withCC
   * @description Functional update returning new instance with added CC actor.
   * @param {Actor} actor - Entity to add.
   * @returns {RoutingResult}
   */
  withCC(actor) {
    return new RoutingResult({
      primary: this.primary,
      cc: [...this.cc, actor],
      bcc: this.bcc,
      metadata: this.metadata
    });
  }

  /**
   * @function withBCC
   * @description Functional update returning new instance with added BCC actor.
   * @param {Actor} actor - Entity to add.
   * @returns {RoutingResult}
   */
  withBCC(actor) {
    return new RoutingResult({
      primary: this.primary,
      cc: this.cc,
      bcc: [...this.bcc, actor],
      metadata: this.metadata
    });
  }

  /**
   * @function merge
   * @description Functional union of two results. Deduplicates recipients by actor ID.
   * @param {RoutingResult} other - Result to combine.
   * @returns {RoutingResult}
   */
  merge(other) {
    if (!(other instanceof RoutingResult)) {
      return this;
    }

    // Deduplicate by actor ID
    const dedup = (arr1, arr2) => {
      const seen = new Set();
      return [...arr1, ...arr2].filter((actor) => {
        if (!actor || !actor.id || seen.has(actor.id)) {
          return false;
        }
        seen.add(actor.id);
        return true;
      });
    };

    return new RoutingResult({
      primary: dedup(this.primary, other.primary),
      cc: dedup(this.cc, other.cc),
      bcc: dedup(this.bcc, other.bcc),
      metadata: { ...this.metadata, ...other.metadata }
    });
  }

  /**
   * @function toJSON
   * @description Deeply serializes to POJO.
   * @returns {Object} JSON-compatible structure.
   */
  toJSON() {
    return {
      primary: this.primary.map((a) => (a?.toJSON ? a.toJSON() : a)),
      cc: this.cc.map((a) => (a?.toJSON ? a.toJSON() : a)),
      bcc: this.bcc.map((a) => (a?.toJSON ? a.toJSON() : a)),
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
