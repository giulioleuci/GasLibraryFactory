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

test('preserves buffered falsy values and the existing JSON representation across resume', () => {
  const cp = ImportCheckpoint.initial('VALUES');
  cp.stage = 'LOAD';
  cp.buffer = [
    {
      blank: '',
      zero: 0,
      active: false,
      date: new Date('2026-01-01T00:00:00.000Z'),
      empty: null,
      absent: undefined
    }
  ];
  const serialized = JSON.stringify(cp);
  expect(serialized).toBe(
    '{"recipeName":"VALUES","stage":"LOAD","sourceCursor":null,"rowOffset":0,"loadOffset":0,"counters":{"extracted":0,"transformed":0,"inserted":0,"updated":0,"skipped":0,"deleted":0},"buffer":[{"blank":"","zero":0,"active":false,"date":"2026-01-01T00:00:00.000Z","empty":null}],"done":false}'
  );
  const restored = ImportCheckpoint.fromJSON(JSON.parse(serialized));
  expect(restored.buffer).toEqual([
    { blank: '', zero: 0, active: false, date: '2026-01-01T00:00:00.000Z', empty: null }
  ]);
  expect(Object.prototype.hasOwnProperty.call(restored.buffer![0], 'absent')).toBe(false);
  expect(JSON.stringify(restored)).toBe(serialized);
});
