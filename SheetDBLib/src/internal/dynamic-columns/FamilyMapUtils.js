/**
 * @file SheetDBLib/src/internal/dynamic-columns/FamilyMapUtils.js
 * @description Shared lookup helper for the `Map<string, ColumnFamily>` used by both
 * `DynamicColumnAccessor` and `FamilyAggregator` (dedupe of duplicate `_getFamily`).
 */

/**
 * @function getFamilyOrThrow
 * @description Resolves a registered ColumnFamily by id, throwing if unregistered.
 * @param {Map<string, import('./ColumnFamily.js').ColumnFamily>} familyMap - Registered families keyed by id.
 * @param {string} familyId - Target family id.
 * @returns {import('./ColumnFamily.js').ColumnFamily} The resolved family.
 * @throws {Error} If `familyId` is not registered in `familyMap`.
 */
export function getFamilyOrThrow(familyMap, familyId) {
  const family = familyMap.get(familyId);
  if (!family) {
    throw new Error(`Column family not found: ${familyId}`);
  }
  return family;
}
