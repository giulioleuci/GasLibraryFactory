/**
 * @fileoverview Tests for ImportCheckpoint
 * @author GasLibraryFactory
 */

import { ImportCheckpoint } from '../ImportCheckpoint.js';

test('creates an initial checkpoint at EXTRACT stage with zeroed counters', () => {
  const cp = ImportCheckpoint.initial('IMPORT_ALUNNI');
  expect(cp.stage).toBe('EXTRACT');
  expect(cp.recipeName).toBe('IMPORT_ALUNNI');
  expect(cp.rowOffset).toBe(0);
  expect(cp.done).toBe(false);
  expect(cp.counters).toEqual({
    extracted: 0,
    transformed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    deleted: 0
  });
});

test('serializes and restores via plain JSON (JobRunnerLib ScriptProperties contract)', () => {
  const cp = ImportCheckpoint.initial('IMPORT_ALUNNI');
  const restored = ImportCheckpoint.fromJSON(JSON.parse(JSON.stringify(cp)));
  expect(restored).toEqual(cp);
});

test('rejects a checkpoint whose recipeName does not match the recipe being resumed', () => {
  const cp = ImportCheckpoint.initial('IMPORT_ALUNNI');
  expect(() => ImportCheckpoint.assertMatches(cp, 'IMPORT_DOCENTI')).toThrow(/recipeName/);
});
