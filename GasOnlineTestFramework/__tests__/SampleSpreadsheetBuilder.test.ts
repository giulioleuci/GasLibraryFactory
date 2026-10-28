import { SampleSpreadsheetBuilder } from '../src/SampleSpreadsheetBuilder.js';

function makeSheet(name: string, header: unknown[]) {
  const values = [header];
  return {
    name,
    getRange: jest.fn(() => ({
      setValues: jest.fn((rows: unknown[][]) => values.push(...rows)),
      getValues: jest.fn(() => [values[0]])
    })),
    getLastColumn: jest.fn(() => header.length),
    getLastRow: jest.fn(() => values.filter((row) => row.length > 0).length),
    appendRow: jest.fn((row: unknown[]) => values.push(row))
  };
}

function makeSpreadsheet(defaultSheetName = 'Sheet1') {
  const sheets = { [defaultSheetName]: makeSheet(defaultSheetName, []) };
  return {
    getId: () => 'ss-1',
    getName: () => 'Test SS',
    getUrl: () => 'https://sheets/ss-1',
    getSheets: jest.fn(() => Object.values(sheets)),
    insertSheet: jest.fn((name: string) => {
      sheets[name] = makeSheet(name, []);
      return sheets[name];
    }),
    getSheetByName: jest.fn((name: string) => sheets[name] || null),
    deleteSheet: jest.fn((sheet: { name: string }) => {
      delete sheets[sheet.name];
    })
  };
}

test('addSheet creates the sheet, sets the header row, and drops the placeholder default sheet once', () => {
  const ss = makeSpreadsheet();
  const builder = new SampleSpreadsheetBuilder(ss);
  builder.addSheet('ALUNNI', ['ID', 'NOME']);
  expect(ss.insertSheet).toHaveBeenCalledWith('ALUNNI');
  expect(ss.deleteSheet).toHaveBeenCalledTimes(1);
  builder.addSheet('CLASSI', ['ID']);
  expect(ss.deleteSheet).toHaveBeenCalledTimes(1); // not called again
});

test('appendRow maps a keyed row onto the sheet header order', () => {
  const ss = makeSpreadsheet();
  const builder = new SampleSpreadsheetBuilder(ss);
  builder.addSheet('ALUNNI', ['ID', 'NOME']);
  builder.appendRow('ALUNNI', { NOME: 'Rossi', ID: 'a1' });
  const sheet = ss.getSheetByName('ALUNNI');
  expect(sheet.appendRow).toHaveBeenCalledWith(['a1', 'Rossi']);
});

test('appendRow throws for a missing sheet', () => {
  const builder = new SampleSpreadsheetBuilder(makeSpreadsheet());
  expect(() => builder.appendRow('NOPE', {})).toThrow(/NOPE/);
});

test('appendRows scrive un solo blocco e fa un solo flush', () => {
  const ss = makeSpreadsheet();
  const builder = new SampleSpreadsheetBuilder(ss);
  builder.addSheet('T', ['A', 'B']);
  jest.clearAllMocks();

  builder.appendRows('T', [{ A: 1, B: 2 }, { A: 3 }]);

  const sheet = ss.getSheetByName('T');
  expect(sheet.getRange).toHaveBeenCalledTimes(1);
  expect(sheet.getRange).toHaveBeenCalledWith(2, 1, 2, 2);
  expect(sheet.getRange.mock.results[0].value.setValues).toHaveBeenCalledWith([
    [1, 2],
    [3, '']
  ]);
  expect(SpreadsheetApp.flush).toHaveBeenCalledTimes(1);
});

test('appendRows su elenco vuoto non tocca il foglio', () => {
  const ss = makeSpreadsheet();
  const builder = new SampleSpreadsheetBuilder(ss);
  builder.appendRows('T', []);
  expect(ss.getSheetByName).not.toHaveBeenCalled();
});

test('getUrl delegates to the underlying spreadsheet', () => {
  const builder = new SampleSpreadsheetBuilder(makeSpreadsheet());
  expect(builder.getUrl()).toBe('https://sheets/ss-1');
});
