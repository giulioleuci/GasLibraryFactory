/**
 * @file Immutable condition model for AdvancedQueryBuilder fuzzy predicates.
 */

/**
 * Creates a normalized fuzzy condition after its inputs have been validated.
 *
 * @param {string} field Target field.
 * @param {string} query Search text.
 * @param {Object} [options={}] Supported Fuse options.
 * @param {'AND'|'OR'} type Boolean connector.
 * @returns {Readonly<Object>} Immutable fuzzy condition.
 */
export function createFuzzyCondition(field, query, options = {}, type) {
  return Object.freeze({
    kind: 'FUZZY',
    field,
    query,
    options: Object.freeze({ threshold: 0.4, ...options }),
    type
  });
}
