/**
 * @file RoleResolutionLib/src/utils/MateriaSlotParsing.js
 * @description Reusable helpers for parsing "MATERIA.itp"/"MATERIA.specifica"-style
 * CSV cattedra columns (e.g. a `MATERIE` cell listing several teaching subjects,
 * optionally slot-qualified) into structured, slot-grouped data, plus the
 * wildcard-aware slot-compatibility check used to compare two such qualifiers.
 * Domain-agnostic: any GAS app that stores a CSV of subject/qualifier pairs in
 * a spreadsheet cell can reuse these instead of re-deriving the same parsing.
 * @version 1.0.0
 */

/**
 * Sentinel meaning "unrestricted"/"unqualified" for a slot dimension (kind or
 * specifica). Callers that need a named constant for this value (rather than
 * inlining `'*'`) should keep their own local constant equal to this literal
 * (ref ALDO's `RowScopeExpansion.ANY`, which must stay `'*'`).
 * @type {string}
 */
const ANY = '*';

/**
 * @function splitCsvList
 * @description Splits a comma-separated string into trimmed, non-empty entries.
 * @param {string} raw - Raw CSV string (entries may have surrounding whitespace;
 *   empty entries, e.g. from a trailing/doubled comma, are dropped).
 * @returns {string[]} Trimmed, non-empty entries in original order.
 */
export function splitCsvList(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * @function groupMateriaEntriesBySlot
 * @description Groups a materia CSV's entries by slot qualifier, per-entry (a
 * single CSV can legitimately mix a bare materia with a slot-qualified one from
 * a different materia). `MATERIA` -> any slot (kind `'*'`); `MATERIA.itp` -> ITP;
 * `MATERIA.<anything else>` -> SPECIFICA (with that suffix as the specifica id).
 * @param {string} materieRaw - Raw CSV of materia entries, each optionally
 *   suffixed with `.itp` or `.<specifica id>`.
 * @returns {Array<{kind: string, specifica: string, materie: string[]}>} One
 *   group per distinct (kind, specifica) pair found, each collecting the base
 *   materia ids that share it, in first-seen order.
 */
export function groupMateriaEntriesBySlot(materieRaw) {
  const groups = new Map();
  for (const entry of splitCsvList(materieRaw)) {
    const dot = entry.indexOf('.');
    const base = dot === -1 ? entry : entry.slice(0, dot);
    const suffix = dot === -1 ? null : entry.slice(dot + 1);
    const kind = suffix === null ? ANY : suffix.toUpperCase() === 'ITP' ? 'ITP' : 'SPECIFICA';
    const specifica = kind === 'SPECIFICA' && suffix !== null ? suffix : ANY;
    const key = `${kind} ${specifica}`;
    const existing = groups.get(key);
    if (existing) {
      existing.materie.push(base);
    } else {
      groups.set(key, { kind, specifica, materie: [base] });
    }
  }
  return [...groups.values()];
}

/**
 * @function slotCompatible
 * @description Whether two slot qualifiers can refer to the same physical
 * teaching post (ANY matches any kind/specifica).
 * @param {{kind: string, specifica: string}} a
 * @param {{kind: string, specifica: string}} b
 * @returns {boolean}
 */
export function slotCompatible(a, b) {
  if (a.kind === ANY || b.kind === ANY) {
    return true;
  }
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind !== 'SPECIFICA') {
    return true;
  }
  return a.specifica === ANY || b.specifica === ANY || a.specifica === b.specifica;
}

/**
 * @function pairsOverlap
 * @description True if any pair in `a` shares a (classe, materia) with a
 * slot-compatible pair in `b`.
 * @param {ReadonlyArray<{classeId: string, materia: string, kind: string, specifica: string}>} a
 * @param {ReadonlyArray<{classeId: string, materia: string, kind: string, specifica: string}>} b
 * @returns {boolean}
 */
export function pairsOverlap(a, b) {
  for (const pa of a) {
    for (const pb of b) {
      if (pa.classeId === pb.classeId && pa.materia === pb.materia && slotCompatible(pa, pb)) {
        return true;
      }
    }
  }
  return false;
}
