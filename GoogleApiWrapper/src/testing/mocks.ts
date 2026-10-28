import type { Mock } from 'jest-mock';

declare const jest: Pick<typeof import('jest-mock'), 'fn'>;

type Stub<R = unknown, A extends unknown[] = unknown[]> = Mock<(...args: A) => R>;
type FluentStub<T> = Stub<T>;
type DocumentStructure = Pick<
  GoogleAppsScript.Docs.Schema.Document,
  'documentId' | 'title' | 'body'
>;
type SectionStub = { clear: Stub; appendParagraph: Stub };
interface StandardDocumentStub {
  getId(): string;
  getName(): string;
  getBody(): { getText(): string; replaceText: Stub; appendParagraph: Stub; appendTable: Stub };
  getHeader: Stub<null, []>;
  addHeader: Stub<SectionStub, []>;
  getFooter: Stub<null, []>;
  addFooter: Stub<SectionStub, []>;
}
interface TriggerRecord {
  id: string;
  functionName: string;
  type: string;
  createdAt: Date;
  scheduledFor?: Date;
  delayMinutes?: number;
  delayMs?: number;
  frequency?: string;
  interval?: number;
}

/**
 * @file GoogleApiWrapper/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GoogleApiWrapper services.
 * @version 1.0.0
 */

import { DocumentBuilder } from '../services/DocumentBuilder.js';

/**
 * @class SpreadsheetServiceMock
 * @description High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.
 */
export class SpreadsheetServiceMock {
  declare openById: Stub<
    Pick<GoogleAppsScript.Spreadsheet.Spreadsheet, 'getId' | 'getName'> & {
      getSheets(): never[];
      getSheetByName: Stub<null, []>;
    },
    [id: string]
  >;
  declare createSpreadsheet: Stub<
    Pick<GoogleAppsScript.Spreadsheet.Spreadsheet, 'getId' | 'getName' | 'getUrl'>,
    [name: string]
  >;
  declare getSheetData: Stub<unknown[][]>;
  declare setSheetData: FluentStub<this>;
  declare appendRow: FluentStub<this>;
  declare deleteRows: FluentStub<this>;
  declare getValues: Stub;
  declare getSheetInfo: Stub;
  declare getRanges: Stub;
  declare updateRanges: Stub;
  declare flushBatch: Stub;

  constructor() {
    this.openById = jest.fn((id: string) => ({
      getId: () => id,
      getName: () => `Mock Spreadsheet ${id}`,
      getSheets: () => [],
      getSheetByName: jest.fn(() => null)
    }));

    this.createSpreadsheet = jest.fn((name: string) => ({
      getId: () => 'new-sheet-id',
      getName: () => name,
      getUrl: () => 'https://docs.google.com/spreadsheets/d/new-sheet-id'
    }));

    this.getSheetData = jest.fn(() => []);
    this.setSheetData = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.appendRow = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.deleteRows = jest.fn<(...args: unknown[]) => this>().mockReturnThis();

    // Add missing methods required by SheetDBLib tests
    this.getValues = jest.fn();
    this.getSheetInfo = jest.fn();
    this.getRanges = jest.fn();
    this.updateRanges = jest.fn();
    this.flushBatch = jest.fn();
  }
}

/**
 * @class PropertiesServiceMock
 * @description High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.
 */
export class PropertiesServiceMock {
  declare _store: Map<string, string>;
  declare getProperty: Stub<string | null, [key: string]>;
  declare setProperty: Stub<this, [key: string, value: unknown]>;
  declare getProperties: Stub<Record<string, string>, []>;
  declare setProperties: Stub<this, [props: Record<string, unknown>, deleteAll?: boolean]>;
  declare deleteProperty: Stub<this, [key: string]>;
  declare deleteAllProperties: Stub<this, []>;
  declare getObjectProperty: Stub<unknown, [key: string]>;
  declare setObjectProperty: Stub<this, [key: string, value: unknown]>;
  declare getScriptProperty: PropertiesServiceMock['getProperty'];
  declare setScriptProperty: PropertiesServiceMock['setProperty'];
  declare getScriptProperties: PropertiesServiceMock['getProperties'];
  declare setScriptProperties: PropertiesServiceMock['setProperties'];
  declare deleteScriptProperty: PropertiesServiceMock['deleteProperty'];
  declare deleteAllScriptProperties: PropertiesServiceMock['deleteAllProperties'];
  declare getUserProperty: PropertiesServiceMock['getProperty'];
  declare setUserProperty: PropertiesServiceMock['setProperty'];
  declare getUserProperties: PropertiesServiceMock['getProperties'];
  declare setUserProperties: PropertiesServiceMock['setProperties'];
  declare deleteUserProperty: PropertiesServiceMock['deleteProperty'];
  declare deleteAllUserProperties: PropertiesServiceMock['deleteAllProperties'];
  declare getDocumentProperty: PropertiesServiceMock['getProperty'];
  declare setDocumentProperty: PropertiesServiceMock['setProperty'];
  declare getDocumentProperties: PropertiesServiceMock['getProperties'];
  declare setDocumentProperties: PropertiesServiceMock['setProperties'];
  declare deleteDocumentProperty: PropertiesServiceMock['deleteProperty'];
  declare deleteAllDocumentProperties: PropertiesServiceMock['deleteAllProperties'];
  declare getScriptPropertyJSON: PropertiesServiceMock['getObjectProperty'];
  declare setScriptPropertyJSON: PropertiesServiceMock['setObjectProperty'];
  declare clearAll: PropertiesServiceMock['deleteAllProperties'];

  constructor() {
    this._store = new Map();

    this.getProperty = jest.fn((key: string) => this._store.get(key) || null);
    this.setProperty = jest.fn((key: string, value: unknown) => {
      this._store.set(key, String(value));
      return this;
    });
    this.getProperties = jest.fn(() => Object.fromEntries(this._store));
    this.setProperties = jest.fn((props: Record<string, unknown>, deleteAll = false) => {
      if (deleteAll) {
        this._store.clear();
      }
      Object.entries(props).forEach(([k, v]) => this._store.set(k, String(v)));
      return this;
    });
    this.deleteProperty = jest.fn((key: string) => {
      this._store.delete(key);
      return this;
    });
    this.deleteAllProperties = jest.fn(() => {
      this._store.clear();
      return this;
    });

    // Aliases for GAS compatibility
    Object.assign(this, {
      getScriptProperties: () => this,
      getUserProperties: () => this,
      getDocumentProperties: () => this
    });

    this.getScriptProperty = this.getProperty;
    this.getUserProperty = this.getProperty;
    this.getDocumentProperty = this.getProperty;
    this.setScriptProperty = this.setProperty;
    this.setUserProperty = this.setProperty;
    this.setDocumentProperty = this.setProperty;
    this.getScriptProperties = this.getProperties;
    this.getUserProperties = this.getProperties;
    this.getDocumentProperties = this.getProperties;
    this.setScriptProperties = this.setProperties;
    this.setUserProperties = this.setProperties;
    this.setDocumentProperties = this.setProperties;
    this.deleteScriptProperty = this.deleteProperty;
    this.deleteUserProperty = this.deleteProperty;
    this.deleteDocumentProperty = this.deleteProperty;
    this.deleteAllScriptProperties = this.deleteAllProperties;
    this.deleteAllUserProperties = this.deleteAllProperties;
    this.deleteAllDocumentProperties = this.deleteAllProperties;

    // GoogleApiWrapper specific extensions (JSON support)
    this.setObjectProperty = jest.fn((key: string, value: unknown) => {
      this._store.set(key, JSON.stringify(value));
      return this;
    });
    this.getObjectProperty = jest.fn((key: string) => {
      const val = this._store.get(key);
      return val ? JSON.parse(val) : null;
    });

    // Additional helper methods from legacy fakes
    this.getScriptPropertyJSON = this.getObjectProperty;
    this.setScriptPropertyJSON = this.setObjectProperty;
    this.clearAll = this.deleteAllProperties;
  }
}

/**
 * @class DocumentServiceMock
 * @description High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.
 */
export class DocumentServiceMock {
  declare _logger: { debug: Stub; warn: Stub; error: Stub };
  declare document: Stub<DocumentBuilder, [id: string]>;
  declare createDocument: Stub<
    { documentId: string; getId(): string; builder: DocumentBuilder },
    [name: string]
  >;
  declare getDocument: Stub<DocumentStructure | DocumentStructure[], [ids: string | string[]]>;
  declare openStandard: Stub<StandardDocumentStub, [id: string]>;
  declare getRawDocumentStructure: Stub<DocumentStructure, [id: string]>;
  declare scanDocumentStructure: Stub<
    { tables: never[]; textMatches: never[] },
    [id: string, textPatterns?: unknown]
  >;
  declare getDocumentTables: Stub<never[]>;
  declare getTableStructure: Stub<{ startIndex: number; endIndex: number; rows: never[] }>;
  declare getDocumentBody: Stub<{ startIndex: number; endIndex: number; content: never[] }>;
  declare getOrCreateHeader: Stub<SectionStub>;
  declare getOrCreateFooter: Stub<SectionStub>;
  declare setHeaderText: FluentStub<this>;
  declare updateDocument: FluentStub<this>;
  declare replaceAllText: FluentStub<this>;
  declare _executeBatchUpdate: Stub<GoogleAppsScript.Docs.Schema.BatchUpdateDocumentResponse>;
  declare _executeExportPDF: Stub<{ id: string }>;
  declare _createTableWithStandardAPI: Stub<
    { success: boolean; rows: number; columns: number },
    [documentId: string, op: { data: unknown[][] }]
  >;
  declare _addHeaderWithStandardAPI: Stub<{ success: boolean }>;
  declare _addFooterWithStandardAPI: Stub<{ success: boolean }>;

  constructor() {
    this._logger = {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    this.document = jest.fn((id: string) => new DocumentBuilder(id, this));

    this.createDocument = jest.fn((_name: string) => ({
      documentId: 'new-doc-id',
      getId: () => 'new-doc-id',
      builder: new DocumentBuilder('new-doc-id', this)
    }));

    this.getDocument = jest.fn((ids: string | string[]) => {
      const isArray = Array.isArray(ids);
      const idList = isArray ? ids : [ids];
      const results = idList.map((id) => ({
        documentId: id,
        title: `Mock Document ${id}`,
        body: { content: [] }
      }));
      return isArray ? results : results[0];
    });

    this.openStandard = jest.fn((id: string) => ({
      getId: () => id,
      getName: () => `Mock Document ${id}`,
      getBody: () => ({
        getText: () => 'Mock Content',
        replaceText: jest.fn(),
        appendParagraph: jest.fn().mockReturnThis(),
        appendTable: jest.fn().mockReturnThis()
      }),
      getHeader: jest.fn(() => null),
      addHeader: jest.fn(() => ({
        clear: jest.fn().mockReturnThis(),
        appendParagraph: jest.fn().mockReturnThis()
      })),
      getFooter: jest.fn(() => null),
      addFooter: jest.fn(() => ({
        clear: jest.fn().mockReturnThis(),
        appendParagraph: jest.fn().mockReturnThis()
      }))
    }));

    this.getRawDocumentStructure = jest.fn((id: string) => ({
      documentId: id,
      title: `Mock Document ${id}`,
      body: { content: [] }
    }));

    this.scanDocumentStructure = jest.fn((_id: string, _textPatterns?: unknown) => ({
      tables: [],
      textMatches: []
    }));

    this.getDocumentTables = jest.fn(() => []);
    this.getTableStructure = jest.fn(() => ({
      startIndex: 1,
      endIndex: 100,
      rows: []
    }));
    this.getDocumentBody = jest.fn(() => ({
      startIndex: 1,
      endIndex: 100,
      content: []
    }));

    this.getOrCreateHeader = jest.fn(() => ({
      clear: jest.fn().mockReturnThis(),
      appendParagraph: jest.fn().mockReturnThis()
    }));
    this.getOrCreateFooter = jest.fn(() => ({
      clear: jest.fn().mockReturnThis(),
      appendParagraph: jest.fn().mockReturnThis()
    }));

    this.setHeaderText = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.updateDocument = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.replaceAllText = jest.fn<(...args: unknown[]) => this>().mockReturnThis();

    this._executeBatchUpdate = jest.fn(() => ({ replies: [] }));
    this._executeExportPDF = jest.fn(() => ({ id: 'new-pdf-id' }));
    this._createTableWithStandardAPI = jest.fn(
      (_documentId: string, op: { data: unknown[][] }) => ({
        success: true,
        rows: op.data.length,
        columns: op.data[0] ? op.data[0].length : 0
      })
    );
    this._addHeaderWithStandardAPI = jest.fn(() => ({ success: true }));
    this._addFooterWithStandardAPI = jest.fn(() => ({ success: true }));
  }
}

/**
 * @class TriggerServiceMock
 * @description High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.
 */
export class TriggerServiceMock {
  declare _logger: unknown;
  declare _triggers: TriggerRecord[];
  declare _triggerIdCounter: number;
  declare createTimeTrigger: Stub<TriggerRecord, [functionName: string, delayMinutes: number]>;
  declare createTimedTrigger: Stub<string, [functionName: string, delayMs: number]>;
  declare createAtTimeTrigger: Stub<TriggerRecord, [functionName: string, time: Date]>;
  declare createRecurringTrigger: Stub<
    TriggerRecord,
    [functionName: string, frequency: string, interval?: number]
  >;
  declare deleteTrigger: Stub<boolean, [triggerId: string]>;
  declare deleteTriggersByFunction: Stub<number, [functionName: string]>;
  declare getTriggers: Stub<TriggerRecord[], []>;
  declare getTriggersByFunction: Stub<TriggerRecord[], [functionName: string]>;
  declare getTriggerById: Stub<TriggerRecord | null, [triggerId: string]>;
  declare deleteAllTriggers: Stub<void, []>;
  declare getTriggerCount: Stub<number, []>;
  declare hasTriggerForFunction: Stub<boolean, [functionName: string]>;
  declare deleteTriggerById: TriggerServiceMock['deleteTrigger'];
  declare getAllTriggers: TriggerServiceMock['getTriggers'];
  declare clear: TriggerServiceMock['deleteAllTriggers'];

  constructor(logger: unknown = null) {
    this._logger = logger;
    this._triggers = [];
    this._triggerIdCounter = 0;

    this.createTimeTrigger = jest.fn((functionName: string, delayMinutes: number) => {
      const trigger = {
        id: `trigger-${++this._triggerIdCounter}`,
        functionName,
        type: 'TIME_BASED',
        delayMinutes,
        createdAt: new Date(),
        scheduledFor: new Date(Date.now() + delayMinutes * 60 * 1000)
      };
      this._triggers.push(trigger);
      return trigger;
    });

    this.createTimedTrigger = jest.fn((functionName: string, delayMs: number) => {
      const trigger = {
        id: `trigger-${++this._triggerIdCounter}`,
        functionName,
        type: 'TIME_BASED',
        delayMs,
        createdAt: new Date(),
        scheduledFor: new Date(Date.now() + delayMs)
      };
      this._triggers.push(trigger);
      return trigger.id;
    });

    this.createAtTimeTrigger = jest.fn((functionName: string, time: Date) => {
      const trigger = {
        id: `trigger-${++this._triggerIdCounter}`,
        functionName,
        type: 'TIME_BASED_AT',
        scheduledFor: time,
        createdAt: new Date()
      };
      this._triggers.push(trigger);
      return trigger;
    });

    this.createRecurringTrigger = jest.fn(
      (functionName: string, frequency: string, interval = 1) => {
        const trigger = {
          id: `trigger-${++this._triggerIdCounter}`,
          functionName,
          type: 'TIME_BASED_RECURRING',
          frequency,
          interval,
          createdAt: new Date()
        };
        this._triggers.push(trigger);
        return trigger;
      }
    );

    this.deleteTrigger = jest.fn((triggerId: string) => {
      const initialLength = this._triggers.length;
      this._triggers = this._triggers.filter((t) => t.id !== triggerId);
      return this._triggers.length < initialLength;
    });

    this.deleteTriggerById = this.deleteTrigger;

    this.deleteTriggersByFunction = jest.fn((functionName: string) => {
      const initialLength = this._triggers.length;
      this._triggers = this._triggers.filter((t) => t.functionName !== functionName);
      return initialLength - this._triggers.length;
    });

    this.getTriggers = jest.fn(() => [...this._triggers]);
    this.getAllTriggers = this.getTriggers;

    this.getTriggersByFunction = jest.fn((functionName: string) =>
      this._triggers.filter((t) => t.functionName === functionName)
    );

    this.getTriggerById = jest.fn(
      (triggerId) => this._triggers.find((t) => t.id === triggerId) || null
    );

    this.deleteAllTriggers = jest.fn(() => {
      this._triggers = [];
    });

    this.getTriggerCount = jest.fn(() => this._triggers.length);
    this.hasTriggerForFunction = jest.fn((functionName: string) =>
      this._triggers.some((t) => t.functionName === functionName)
    );

    this.clear = this.deleteAllTriggers;
  }
}

/**
 * @class MailServiceMock
 * @description High-fidelity mock for MailService.
 */
export class MailServiceMock {
  declare send: Stub<{ success: boolean; messageId: string }>;
  declare sendBatch: Stub<{ successful: never[]; failed: never[]; sent: number }>;
  declare sendBulk: Stub<{
    sent: number;
    failed: number;
    details: { successful: never[]; failed: never[] };
  }>;
  declare createDraft: Stub<{ success: boolean; id: string }>;
  declare createDraftsBatch: Stub<{ successful: never[]; failed: never[] }>;
  declare sendNotification: Stub<{ success: boolean }>;
  declare getQuotaUsage: Stub<number>;

  constructor() {
    this.send = jest.fn(() => ({ success: true, messageId: 'mock-mail-id' }));
    this.sendBatch = jest.fn(() => ({
      successful: [],
      failed: [],
      sent: 0
    }));
    this.sendBulk = jest.fn(() => ({
      sent: 0,
      failed: 0,
      details: { successful: [], failed: [] }
    }));
    this.createDraft = jest.fn(() => ({
      success: true,
      id: 'draft-id'
    }));
    this.createDraftsBatch = jest.fn(() => ({ successful: [], failed: [] }));
    this.sendNotification = jest.fn(() => ({ success: true }));
    this.getQuotaUsage = jest.fn(() => 1500);
  }
}

/**
 * @class LockServiceMock
 * @description High-fidelity mock for LockService.
 */
export class LockServiceMock {
  declare _lock: {
    hasLock: Stub<boolean, []>;
    releaseLock: Stub;
    tryLock: Stub<boolean, []>;
    waitLock: Stub;
  };
  declare getScriptLock: Stub<LockServiceMock['_lock'], []>;
  declare getUserLock: Stub<LockServiceMock['_lock'], []>;
  declare getDocumentLock: Stub<LockServiceMock['_lock'], []>;

  constructor() {
    this._lock = {
      hasLock: jest.fn(() => true),
      releaseLock: jest.fn(),
      tryLock: jest.fn(() => true),
      waitLock: jest.fn()
    };
    this.getScriptLock = jest.fn(() => this._lock);
    this.getUserLock = jest.fn(() => this._lock);
    this.getDocumentLock = jest.fn(() => this._lock);
  }
}

/**
 * @class DriveServiceMock
 * @description High-fidelity mock for DriveService.
 */
export class DriveServiceMock {
  declare getFile: Stub<
    Pick<GoogleAppsScript.Drive.File, 'getId' | 'getName'> & {
      getBlob(): { getAs: Stub<object, []> };
    },
    [id: string]
  >;
  declare createFile: Stub<
    Pick<GoogleAppsScript.Drive.File, 'getId' | 'getName'>,
    [name: string, content: unknown]
  >;
  declare copyFile: Stub<
    Pick<GoogleAppsScript.Drive.File, 'getId' | 'getName'>,
    [id: string, name: string]
  >;
  declare moveFile: Stub;
  declare deleteFile: Stub;
  declare listFiles: Stub<never[]>;
  declare getStandardApp: Stub<GoogleAppsScript.Drive.DriveApp | undefined, []>;

  constructor() {
    this.getFile = jest.fn((id: string) => ({
      getId: () => id,
      getName: () => `Mock File ${id}`,
      getBlob: () => ({
        getAs: jest.fn(() => ({}))
      })
    }));
    this.createFile = jest.fn((name: string, _content: unknown) => ({
      getId: () => 'new-file-id',
      getName: () => name
    }));
    this.copyFile = jest.fn((_id: string, name: string) => ({
      getId: () => 'copy-file-id',
      getName: () => name
    }));
    this.moveFile = jest.fn();
    this.deleteFile = jest.fn();
    this.listFiles = jest.fn(() => []);

    // Standard-API accessor used by consumers that route native Drive operations
    // through the wrapper (e.g. JobRunnerLib persistence/log-capture). Falls back
    // to the global DriveApp when present so existing DriveApp mocks keep working.
    this.getStandardApp = jest.fn(() => (typeof DriveApp !== 'undefined' ? DriveApp : undefined));
  }
}
