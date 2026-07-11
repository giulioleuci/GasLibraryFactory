/**
 * @file RoleResolutionLib/src/internal/resolution/PriorityChainResolver.js
 * @description Priority-ordered resolution across heterogeneous sources.
 * @version 1.0.0
 */

/**
 * @class PriorityChainResolver
 * @description Tries an ordered list of resolver functions in turn, returning
 * the first non-null/non-undefined result. Unlike `RoleResolver`'s transitive
 * delegation crawl over one homogeneous `RoleRegistry` (Alice -> Bob -> Charlie
 * within a single data model), this targets the different shape of "consult
 * source A, then B, then C, using whichever produces a hit first" over
 * independently-shaped sources (e.g. a Sheet-backed override table, a
 * secondary table, and a nominal fallback table) — the SGSA-style
 * SUPPLENZE -> VARIAZIONI_CATTEDRA -> CLASSI role-resolution hierarchy.
 * Each resolver decides for itself what counts as "no match" (returning
 * `null`/`undefined`); any other value — including an empty array — is
 * treated as a match that stops the chain, so a source can distinguish
 * "I apply here, and the answer is empty" from "I don't apply here, try the
 * next source".
 */
export class PriorityChainResolver {
  /**
   * @constructor
   * @param {Array<Function>} resolvers Ordered resolver functions, highest priority first.
   *   Each is called with the same arguments passed to `resolve()` and must
   *   return `null`/`undefined` to defer to the next resolver, or any other
   *   value (including `[]`) to short-circuit the chain.
   */
  constructor(resolvers) {
    if (!Array.isArray(resolvers) || resolvers.length === 0) {
      throw new TypeError('PriorityChainResolver requires a non-empty array of resolver functions');
    }
    this._resolvers = resolvers;
  }

  /**
   * @function resolve
   * @description Invokes each resolver in priority order until one returns a non-null/non-undefined result.
   * @param {...*} args Forwarded to every resolver function.
   * @returns {*} The first match found, or `null` if every resolver deferred.
   */
  resolve(...args) {
    for (const resolver of this._resolvers) {
      const result = resolver(...args);
      if (result !== null && result !== undefined) {
        return result;
      }
    }
    return null;
  }
}
