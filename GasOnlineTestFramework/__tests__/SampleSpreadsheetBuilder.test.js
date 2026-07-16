import { SampleSpreadsheetBuilder } from '../src/SampleSpreadsheetBuilder.js';

function makeSheet(name, header) {
  const values = [header];
  return {
    name,
    getRange: jest.fn(() => ({
      setValues: jest.fn((rows) => values.push(...rows)),
      getValues: jest.fn(() => [values[0]])
    })),
    getLastColumn: jest.fn(() => header.length),
    appendRow: jest.fn((row) => values.push(row))
  };
}

function makeSpreadsheet(defaultSheetName = 'Sheet1') {
  const sheets = { [defaultSheetName]: makeSheet(defaultSheetName, []) };
  return {
    getId: () => 'ss-1',
    getName: () => 'Test SS',
    getUrl: () => 'https://sheets/ss-1',
    getSheets: jest.fn(() => Object.values(sheets)),
    insertSheet: jest.fn((name) => {
      sheets[name] = makeSheet(name, []);
      return sheets[name];
    }),
    getSheetByName: jest.fn((name) => sheets[name] || null),
    deleteSheet: jest.fn((sheet) => {
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

test('getUrl delegates to the underlying spreadsheet', () => {
  const builder = new SampleSpreadsheetBuilder(makeSpreadsheet());
  expect(builder.getUrl()).toBe('https://sheets/ss-1');
});
