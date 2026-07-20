/**
 * @file RoleResolutionLib/src/internal/DateParsing.js
 * @description Shared date-parsing helper for domain value objects that need a
 * strict Date-or-ISO-string normalizer with defensive cloning (immutable VOs
 * freeze themselves but must not leak a mutable reference to a caller-owned
 * Date). Dedupe of the duplicate `_parseDate` in `core/Assignment.js` and
 * `internal/delegation/DelegationState.js`.
 *
 * Deliberately NOT delegated to CoreUtilsLib's `DateUtils#parseDate`: that
 * method (1) returns the same Date instance it was given rather than a clone,
 * which would let external mutation of the input Date silently corrupt an
 * already-frozen VO, and (2) also accepts numeric timestamps/Sheets serials,
 * which is out of scope here (validFrom/validTo are only ever Date or ISO
 * string in this domain). This helper intentionally keeps the narrower,
 * clone-safe contract.
 * @param {Date|string|null|undefined} value - Raw input.
 * @returns {Date|null} A cloned, valid Date, or null if unparseable.
 */
export function parseDate(value) {
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
