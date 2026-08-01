import {
  splitCsvList,
  groupMateriaEntriesBySlot,
  slotCompatible,
  pairsOverlap
} from '../MateriaSlotParsing.js';

test('splitCsvList trims and drops empty entries', () => {
  expect(splitCsvList('A, B ,,C')).toEqual(['A', 'B', 'C']);
});

test('groupMateriaEntriesBySlot separates bare/ITP/SPECIFICA-qualified entries', () => {
  const groups = groupMateriaEntriesBySlot('MAT1,MAT2.itp,MAT3.spec1');
  expect(groups).toEqual([
    { kind: '*', specifica: '*', materie: ['MAT1'] },
    { kind: 'ITP', specifica: '*', materie: ['MAT2'] },
    { kind: 'SPECIFICA', specifica: 'spec1', materie: ['MAT3'] }
  ]);
});

test('groupMateriaEntriesBySlot groups multiple bare materie sharing a slot qualifier', () => {
  const groups = groupMateriaEntriesBySlot('MAT1,MAT2,MAT3.itp,MAT4.itp');
  expect(groups).toEqual([
    { kind: '*', specifica: '*', materie: ['MAT1', 'MAT2'] },
    { kind: 'ITP', specifica: '*', materie: ['MAT3', 'MAT4'] }
  ]);
});

// slotCompatible/pairsOverlap test cases: ported by hand from reading
// RowScopeExpansion.ts lines 190-210 directly (ALDO has no existing unit test
// file for RowScopeExpansion.ts/these functions to mirror — verified via
// `grep -rln "slotCompatible\|pairsOverlap" test/` in the ALDO repo, zero
// hits — see task-7-report.md for this deviation from the brief).

describe('slotCompatible', () => {
  test('ANY on either side is always compatible', () => {
    expect(slotCompatible({ kind: '*', specifica: '*' }, { kind: 'ITP', specifica: '*' })).toBe(
      true
    );
    expect(
      slotCompatible({ kind: 'SPECIFICA', specifica: 'X' }, { kind: '*', specifica: '*' })
    ).toBe(true);
  });

  test('different non-ANY kinds are never compatible', () => {
    expect(
      slotCompatible({ kind: 'ITP', specifica: '*' }, { kind: 'SPECIFICA', specifica: 'X' })
    ).toBe(false);
  });

  test('same non-SPECIFICA kind (e.g. ITP/ITP) is compatible regardless of specifica', () => {
    expect(slotCompatible({ kind: 'ITP', specifica: '*' }, { kind: 'ITP', specifica: '*' })).toBe(
      true
    );
  });

  test('same SPECIFICA kind requires equal specifica, unless either specifica is ANY', () => {
    expect(
      slotCompatible({ kind: 'SPECIFICA', specifica: 'X' }, { kind: 'SPECIFICA', specifica: 'X' })
    ).toBe(true);
    expect(
      slotCompatible({ kind: 'SPECIFICA', specifica: 'X' }, { kind: 'SPECIFICA', specifica: 'Y' })
    ).toBe(false);
    expect(
      slotCompatible({ kind: 'SPECIFICA', specifica: '*' }, { kind: 'SPECIFICA', specifica: 'Y' })
    ).toBe(true);
    expect(
      slotCompatible({ kind: 'SPECIFICA', specifica: 'X' }, { kind: 'SPECIFICA', specifica: '*' })
    ).toBe(true);
  });
});

describe('pairsOverlap', () => {
  test('false for two empty arrays', () => {
    expect(pairsOverlap([], [])).toBe(false);
  });

  test('true when a (classe, materia) pair repeats with slot-compatible qualifiers', () => {
    const a = [{ classeId: 'C1', materia: 'MAT1', kind: '*', specifica: '*' }];
    const b = [{ classeId: 'C1', materia: 'MAT1', kind: 'ITP', specifica: '*' }];
    expect(pairsOverlap(a, b)).toBe(true);
  });

  test('false when the same (classe, materia) pair has incompatible slot qualifiers', () => {
    const a = [{ classeId: 'C1', materia: 'MAT1', kind: 'ITP', specifica: '*' }];
    const b = [{ classeId: 'C1', materia: 'MAT1', kind: 'SPECIFICA', specifica: 'X' }];
    expect(pairsOverlap(a, b)).toBe(false);
  });

  test('false when classe differs even if materia and slot match', () => {
    const a = [{ classeId: 'C1', materia: 'MAT1', kind: '*', specifica: '*' }];
    const b = [{ classeId: 'C2', materia: 'MAT1', kind: '*', specifica: '*' }];
    expect(pairsOverlap(a, b)).toBe(false);
  });
});
