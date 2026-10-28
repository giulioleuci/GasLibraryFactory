import { DatasetValidator } from '../DatasetValidator.js';
import type { DatasetRule } from '../types.js';

const datasets = {
  ALUNNI: [
    { EMAIL: 'a@x.it', CLASSE: '1A', CURRICULUM: '{"a":1}' },
    { EMAIL: '', CLASSE: '99X', CURRICULUM: '{broken' }
  ],
  CLASSI: [{ ID: '1A', MAT: 'p@x.it', ALT: 'q@x.it' }],
  DOCENTI: [{ EMAIL: 'p@x.it' }],
  MATERIE: [{ ID: 'MAT' }]
};

function run(rules: DatasetRule[]) {
  return new DatasetValidator().validate(datasets, rules).violations;
}

test('required flags empty cells only', () => {
  const v = run([{ id: 'R1', type: 'required', table: 'ALUNNI', columns: ['EMAIL'] }]);
  expect(v).toEqual([
    {
      ruleId: 'R1',
      type: 'required',
      table: 'ALUNNI',
      rowIndex: 1,
      column: 'EMAIL',
      value: '',
      details: {}
    }
  ]);
});

test('foreignKey resolves against the target column set', () => {
  const v = run([
    {
      id: 'FK1',
      type: 'foreignKey',
      table: 'ALUNNI',
      column: 'CLASSE',
      targetTable: 'CLASSI',
      targetColumn: 'ID'
    }
  ]);
  expect(v).toHaveLength(1);
  expect(v[0].rowIndex).toBe(1);
  expect(v[0].value).toBe('99X');
  expect(v[0].details).toEqual({ targetTable: 'CLASSI', targetColumn: 'ID' });
});

test('foreignKey csv checks every token and reports the offending one', () => {
  const withCsv = { ...datasets, CLASSI: [{ ID: '1A', COORD: 'p@x.it, ghost@x.it' }] };
  const v = new DatasetValidator().validate(withCsv, [
    {
      id: 'FK2',
      type: 'foreignKey',
      table: 'CLASSI',
      column: 'COORD',
      targetTable: 'DOCENTI',
      targetColumn: 'EMAIL',
      csv: true
    }
  ]).violations;
  expect(v).toHaveLength(1);
  expect(v[0].value).toBe('ghost@x.it');
});

test('foreignKey allowWildcard accepts *', () => {
  const withStar = { ...datasets, SUPPLENZE: [{ CLASSI: '*' }] };
  const v = new DatasetValidator().validate(withStar, [
    {
      id: 'FK3',
      type: 'foreignKey',
      table: 'SUPPLENZE',
      column: 'CLASSI',
      targetTable: 'CLASSI',
      targetColumn: 'ID',
      csv: true,
      allowWildcard: true
    }
  ]).violations;
  expect(v).toEqual([]);
});

test('json reports unparsable non-empty cells', () => {
  const v = run([{ id: 'J1', type: 'json', table: 'ALUNNI', column: 'CURRICULUM' }]);
  expect(v).toHaveLength(1);
  expect(v[0].rowIndex).toBe(1);
});

test('enum reports values outside the set, empty allowed by default', () => {
  const v = new DatasetValidator().validate({ T: [{ S: 'OK' }, { S: 'NOPE' }, { S: '' }] }, [
    { id: 'E1', type: 'enum', table: 'T', column: 'S', values: ['OK'] }
  ]).violations;
  expect(v).toHaveLength(1);
  expect(v[0].value).toBe('NOPE');
  expect(v[0].details.values).toEqual(['OK']);
});

test('columnName validates dynamic columns against a target set', () => {
  const v = run([
    {
      id: 'C1',
      type: 'columnName',
      table: 'CLASSI',
      knownColumns: ['ID'],
      ignore: ['ALT'],
      targetTable: 'MATERIE',
      targetColumn: 'ID',
      normalize: (name) => name.split('.')[0]
    }
  ]);
  expect(v).toEqual([]);
});

test('columnName reports an unknown dynamic column once, not once per row', () => {
  const withGhost = {
    ...datasets,
    CLASSI: [
      { ID: '1A', GHOST: 'x' },
      { ID: '2A', GHOST: 'y' }
    ]
  };
  const v = new DatasetValidator().validate(withGhost, [
    {
      id: 'C2',
      type: 'columnName',
      table: 'CLASSI',
      knownColumns: ['ID'],
      targetTable: 'MATERIE',
      targetColumn: 'ID'
    }
  ]).violations;
  expect(v).toHaveLength(1);
  expect(v[0].column).toBe('GHOST');
  expect(v[0].rowIndex).toBe(0);
});

test('rowPredicate receives datasets and an index helper', () => {
  const v = run([
    {
      id: 'P1',
      type: 'rowPredicate',
      table: 'CLASSI',
      check: (row, ctx) =>
        ctx.index('DOCENTI', 'EMAIL').has(String(row.ALT))
          ? null
          : { column: 'ALT', value: String(row.ALT) }
    }
  ]);
  expect(v).toHaveLength(1);
  expect(v[0].value).toBe('q@x.it');
});

test('missing table yields no violations and does not throw', () => {
  expect(run([{ id: 'X', type: 'required', table: 'ASSENTE', columns: ['A'] }])).toEqual([]);
});

test('an unknown rule type throws (caller typo, not data error)', () => {
  // @ts-expect-error Deliberately invalid rule exercises the existing unknown-type guard.
  expect(() => run([{ id: 'Z', type: 'nope', table: 'ALUNNI' }])).toThrow(/nope/);
});

test('validate ignores completely empty and whitespace-only rows before applying rules', () => {
  const localDatasets = {
    ALUNNI: [
      { EMAIL: 'a@x.it', CLASSE: '1A' },
      { EMAIL: '', CLASSE: '' },
      { EMAIL: ' ', CLASSE: '\t' }
    ]
  };
  const violations = new DatasetValidator().validate(localDatasets, [
    { id: 'R1', type: 'required', table: 'ALUNNI', columns: ['EMAIL'] }
  ]).violations;
  expect(violations).toEqual([]);
});

test('validate reports the original rowIndex even when an earlier row was filtered as empty', () => {
  const localDatasets = {
    ALUNNI: [
      { EMAIL: '', CLASSE: '' }, // filtered as empty — index 0
      { EMAIL: '', CLASSE: '1A' } // violates required EMAIL — original index 1
    ]
  };
  const violations = new DatasetValidator().validate(localDatasets, [
    { id: 'R1', type: 'required', table: 'ALUNNI', columns: ['EMAIL'] }
  ]).violations;
  expect(violations).toEqual([expect.objectContaining({ rowIndex: 1, column: 'EMAIL' })]);
});
