import { TestContext } from '../src/TestContext.js';

function makeFolder(id, name) {
  return {
    getId: () => id,
    getName: () => name,
    getFoldersByName: jest.fn(() => ({ hasNext: () => false, next: () => null })),
    getFilesByName: jest.fn(() => ({ hasNext: () => false, next: () => null })),
    createFolder: jest.fn((n) => makeFolder(`${id}/${n}`, n))
  };
}

function makeSpreadsheet(id, sheetNames) {
  const sheets = sheetNames.map((name) => ({
    name,
    getName: () => name,
    setName: jest.fn((nextName) => {
      name = nextName;
    }),
    clear: jest.fn(function clear() {
      return this;
    }),
    clearContents: jest.fn(function clearContents() {
      return this;
    }),
    clearFormats: jest.fn(function clearFormats() {
      return this;
    }),
    clearNotes: jest.fn(function clearNotes() {
      return this;
    }),
    getProtections: jest.fn(() => [])
  }));
  return {
    getId: () => id,
    getSheets: jest.fn(() => sheets),
    getProtections: jest.fn(() => []),
    getNamedRanges: jest.fn(() => []),
    deleteSheet: jest.fn((sheet) => {
      sheets.splice(sheets.indexOf(sheet), 1);
    })
  };
}

describe('TestContext.getOrCreateNamedFolder', () => {
  let ctx;

  beforeEach(() => {
    ctx = new TestContext();
    global.DriveApp = {
      getFoldersByName: jest.fn(() => ({ hasNext: () => false, next: () => null })),
      createFolder: jest.fn((name) => makeFolder('root-created-id', name))
    };
  });

  test('creates a new folder at Drive root when none exists', () => {
    const folder = ctx.getOrCreateNamedFolder('MY_FOLDER');
    expect(global.DriveApp.createFolder).toHaveBeenCalledWith('MY_FOLDER');
    expect(folder.getId()).toBe('root-created-id');
  });

  test('reuses an existing folder at Drive root instead of creating a new one', () => {
    const existing = makeFolder('existing-id', 'MY_FOLDER');
    global.DriveApp.getFoldersByName = jest.fn(() => {
      let done = false;
      return {
        hasNext: () => !done,
        next: () => {
          done = true;
          return existing;
        }
      };
    });
    const folder = ctx.getOrCreateNamedFolder('MY_FOLDER');
    expect(global.DriveApp.createFolder).not.toHaveBeenCalled();
    expect(folder.getId()).toBe('existing-id');
  });

  test('scopes lookup/creation to a parent folder when given', () => {
    const parent = makeFolder('parent-id', 'PARENT');
    const folder = ctx.getOrCreateNamedFolder('CHILD', parent);
    expect(parent.getFoldersByName).toHaveBeenCalledWith('CHILD');
    expect(parent.createFolder).toHaveBeenCalledWith('CHILD');
    expect(folder.getId()).toBe('parent-id/CHILD');
  });

  test('tracks an API call for both the lookup and (when needed) the creation', () => {
    ctx.getOrCreateNamedFolder('MY_FOLDER');
    expect(ctx.apiCallCount).toBe(2);
  });
});

describe('TestContext.getOrCreateNamedSpreadsheet', () => {
  let ctx;
  let createdSpreadsheet;

  beforeEach(() => {
    ctx = new TestContext();
    createdSpreadsheet = { getId: () => 'new-ss-id' };
    global.DriveApp = {
      getFilesByName: jest.fn(() => ({ hasNext: () => false, next: () => null })),
      getFileById: jest.fn((id) => ({ getId: () => id, moveTo: jest.fn() }))
    };
    global.SpreadsheetApp = {
      create: jest.fn(() => createdSpreadsheet),
      openById: jest.fn((id) => ({ getId: () => id }))
    };
  });

  test('creates a new spreadsheet by name when none exists', () => {
    const ss = ctx.getOrCreateNamedSpreadsheet('MY_SHEET');
    expect(global.SpreadsheetApp.create).toHaveBeenCalledWith('MY_SHEET');
    expect(ss.getId()).toBe('new-ss-id');
  });

  test('reuses an existing spreadsheet by name instead of creating a new one', () => {
    global.DriveApp.getFilesByName = jest.fn(() => {
      let done = false;
      return {
        hasNext: () => !done,
        next: () => {
          done = true;
          return { getId: () => 'existing-ss-id' };
        }
      };
    });
    const ss = ctx.getOrCreateNamedSpreadsheet('MY_SHEET');
    expect(global.SpreadsheetApp.create).not.toHaveBeenCalled();
    expect(global.SpreadsheetApp.openById).toHaveBeenCalledWith('existing-ss-id');
    expect(ss.getId()).toBe('existing-ss-id');
  });

  test('moves a newly-created spreadsheet into the given parent folder', () => {
    const parent = { getFilesByName: jest.fn(() => ({ hasNext: () => false, next: () => null })) };
    const file = { getId: () => 'new-ss-id', moveTo: jest.fn() };
    global.DriveApp.getFileById = jest.fn(() => file);
    ctx.getOrCreateNamedSpreadsheet('MY_SHEET', parent);
    expect(file.moveTo).toHaveBeenCalledWith(parent);
  });

  test('scopes the lookup to a parent folder when given, without moving on a hit', () => {
    const existing = { getId: () => 'existing-ss-id' };
    const parent = {
      getFilesByName: jest.fn(() => {
        let done = false;
        return {
          hasNext: () => !done,
          next: () => {
            done = true;
            return existing;
          }
        };
      })
    };
    ctx.getOrCreateNamedSpreadsheet('MY_SHEET', parent);
    expect(parent.getFilesByName).toHaveBeenCalledWith('MY_SHEET');
    expect(global.SpreadsheetApp.create).not.toHaveBeenCalled();
  });
});

describe('TestContext.resetDocument', () => {
  test('clears the body directly when clear() succeeds', () => {
    const ctx = new TestContext();
    const body = { clear: jest.fn(), appendParagraph: jest.fn() };
    const doc = { getId: () => 'doc-1', getBody: () => body };
    jest.spyOn(ctx, 'getDocument').mockReturnValue(doc);

    ctx.resetDocument();

    expect(body.clear).toHaveBeenCalledTimes(1);
    expect(body.appendParagraph).not.toHaveBeenCalled();
  });

  test("appends a fresh paragraph and retries when clear() fails because the body's last child is not a Paragraph (online-test regression: a ListItem left by a prior list-loop expansion)", () => {
    const ctx = new TestContext();
    const body = {
      clear: jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("Can't remove the last paragraph in a document section.");
        })
        .mockImplementationOnce(() => {}),
      appendParagraph: jest.fn()
    };
    const doc = { getId: () => 'doc-1', getBody: () => body };
    jest.spyOn(ctx, 'getDocument').mockReturnValue(doc);

    ctx.resetDocument();

    expect(body.appendParagraph).toHaveBeenCalledWith('');
    expect(body.clear).toHaveBeenCalledTimes(2);
  });

  test('reopens the document and retries when the initial getBody()/clear() call fails for an unrelated reason (e.g. document closed)', () => {
    const ctx = new TestContext();
    const staleBody = {
      clear: jest.fn(() => {
        throw new Error('Document is closed');
      }),
      appendParagraph: jest.fn()
    };
    const freshBody = { clear: jest.fn(), appendParagraph: jest.fn() };
    const staleDoc = { getId: () => 'doc-1', getBody: () => staleBody };
    const freshDoc = { getId: () => 'doc-1', getBody: () => freshBody };
    jest.spyOn(ctx, 'getDocument').mockReturnValue(staleDoc);
    global.DocumentApp = { openById: jest.fn(() => freshDoc) };

    ctx.resetDocument();

    expect(global.DocumentApp.openById).toHaveBeenCalledWith('doc-1');
    expect(freshBody.clear).toHaveBeenCalledTimes(1);
  });
});

describe('TestContext.buildSampleSpreadsheet', () => {
  beforeEach(() => {
    global.SpreadsheetApp.ProtectionType = { RANGE: 'RANGE', SHEET: 'SHEET' };
  });

  test('returns a SampleSpreadsheetBuilder wrapping the reused-or-created spreadsheet', () => {
    const ctx = new TestContext();
    const fakeSheets = [{ getName: () => 'Sheet1' }];
    const fakeSs = {
      getId: () => 'ss-1',
      getUrl: () => 'https://sheets/ss-1',
      getSheets: () => fakeSheets,
      getProtections: () => [],
      getNamedRanges: () => []
    };
    jest.spyOn(ctx, 'getOrCreateNamedSpreadsheet').mockReturnValue(fakeSs);
    jest.spyOn(ctx, 'resetSpreadsheet').mockImplementation(() => {});
    const builder = ctx.buildSampleSpreadsheet('SAMPLE_DB');
    expect(ctx.getOrCreateNamedSpreadsheet).toHaveBeenCalledWith('SAMPLE_DB', null);
    expect(ctx.resetSpreadsheet).toHaveBeenCalledWith(fakeSs);
    expect(builder.getUrl()).toBe('https://sheets/ss-1');
  });

  it('opens, resets, and wraps spreadsheet by ID', () => {
    const spreadsheet = makeSpreadsheet('bound-master-id', ['MASTER', 'stale']);
    global.SpreadsheetApp.openById = jest.fn(() => spreadsheet);

    const builder = new TestContext().buildSampleSpreadsheetById('bound-master-id');

    expect(global.SpreadsheetApp.openById).toHaveBeenCalledWith('bound-master-id');
    expect(builder.id).toBe('bound-master-id');
    expect(spreadsheet.getSheets()).toHaveLength(1);
    expect(spreadsheet.getSheets()[0].getName()).toBe('Sheet1');
  });
});
