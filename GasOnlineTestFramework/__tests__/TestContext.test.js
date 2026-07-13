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
