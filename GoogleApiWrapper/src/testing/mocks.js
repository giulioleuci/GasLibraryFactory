/**
 * @file GoogleApiWrapper/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GoogleApiWrapper services.
 * @version 1.0.0
 */

/**
 * @class MenuBuilderMock
 * @description High-fidelity mock for MenuBuilder. Supports fluent chaining and Jest tracking.
 */
export class MenuBuilderMock {
  constructor() {
    this.addItem = jest.fn().mockReturnThis();
    this.addSeparator = jest.fn().mockReturnThis();
    this.addSubMenu = jest.fn().mockReturnThis();
    this.addToUi = jest.fn();
  }
}

/**
 * @class SidebarBuilderMock
 * @description High-fidelity mock for SidebarBuilder. Supports fluent chaining and Jest tracking.
 */
export class SidebarBuilderMock {
  constructor() {
    this.setTitle = jest.fn().mockReturnThis();
    this.setTemplate = jest.fn().mockReturnThis();
    this.show = jest.fn();
  }
}

/**
 * @class DialogBuilderMock
 * @description High-fidelity mock for DialogBuilder. Supports fluent chaining and Jest tracking.
 */
export class DialogBuilderMock {
  constructor() {
    this.setTitle = jest.fn().mockReturnThis();
    this.setTemplate = jest.fn().mockReturnThis();
    this.setWidth = jest.fn().mockReturnThis();
    this.setHeight = jest.fn().mockReturnThis();
    this.showModal = jest.fn();
    this.showModeless = jest.fn();
  }
}

/**
 * @class SpreadsheetServiceMock
 * @description High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.
 */
export class SpreadsheetServiceMock {
  constructor() {
    this.openById = jest.fn((id) => ({
      getId: () => id,
      getName: () => `Mock Spreadsheet ${id}`,
      getSheets: () => [],
      getSheetByName: jest.fn(() => null)
    }));

    this.createSpreadsheet = jest.fn((name) => ({
      getId: () => 'new-sheet-id',
      getName: () => name,
      getUrl: () => 'https://docs.google.com/spreadsheets/d/new-sheet-id'
    }));

    this.getSheetData = jest.fn(() => []);
    this.setSheetData = jest.fn().mockReturnThis();
    this.appendRow = jest.fn().mockReturnThis();
    this.deleteRows = jest.fn().mockReturnThis();

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
  constructor() {
    this._store = new Map();

    this.getProperty = jest.fn((key) => this._store.get(key) || null);
    this.setProperty = jest.fn((key, value) => {
      this._store.set(key, String(value));
      return this;
    });
    this.getProperties = jest.fn(() => Object.fromEntries(this._store));
    this.setProperties = jest.fn((props, deleteAll = false) => {
      if (deleteAll) this._store.clear();
      Object.entries(props).forEach(([k, v]) => this._store.set(k, String(v)));
      return this;
    });
    this.deleteProperty = jest.fn((key) => {
      this._store.delete(key);
      return this;
    });
    this.deleteAllProperties = jest.fn(() => {
      this._store.clear();
      return this;
    });

    // Aliases for GAS compatibility
    this.getScriptProperties = () => this;
    this.getUserProperties = () => this;
    this.getDocumentProperties = () => this;

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
    this.setObjectProperty = jest.fn((key, value) => {
      this._store.set(key, JSON.stringify(value));
      return this;
    });
    this.getObjectProperty = jest.fn((key) => {
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
 * @class DocumentBuilderMock
 * @description High-fidelity mock for DocumentBuilder. Supports fluent API chaining and operation queue tracking.
 */
export class DocumentBuilderMock {
  constructor(documentId, service) {
    this.documentId = documentId;
    this.service = service;
    this.operations = [];
  }

  appendParagraph = jest.fn((text, options) => {
    this.operations.push({ type: 'appendParagraph', text, options });
    return this;
  });

  setText = jest.fn((text) => {
    this.operations.push({ type: 'setText', text });
    return this;
  });

  createTable = jest.fn((data, options) => {
    this.operations.push({ type: 'createTable', data, options });
    return this;
  });

  addHeader = jest.fn((text) => {
    this.operations.push({ type: 'addHeader', text });
    return this;
  });

  addFooter = jest.fn((text) => {
    this.operations.push({ type: 'addFooter', text });
    return this;
  });

  replaceText = jest.fn((searchPattern, replacement) => {
    this.operations.push({ type: 'replaceText', searchPattern, replacement });
    return this;
  });

  exportPDF = jest.fn((fileName, destinationFolderId) => {
    this.operations.push({ type: 'exportPDF', fileName, destinationFolderId });
    return this;
  });

  execute = jest.fn(() => {
    const standardResults = [];
    const nonBatchResults = [];

    // Track what would have happened
    this.operations.forEach((op) => {
      if (op.type === 'createTable') {
        standardResults.push({
          operation: 'createTable',
          result: {
            success: true,
            rows: (op.data || []).length,
            columns: ((op.data && op.data[0]) || []).length
          }
        });
      } else if (op.type === 'exportPDF') {
        nonBatchResults.push({
          operation: 'exportPDF',
          result: { id: 'pdf123', name: op.fileName }
        });
      } else if (op.type === 'addHeader' || op.type === 'addFooter') {
        standardResults.push({ operation: op.type, result: { success: true } });
      }
    });

    const result = {
      success: true,
      batchResult: { replies: [] },
      standardResults: standardResults,
      tableResults: standardResults.filter((r) => r.operation === 'createTable'),
      nonBatchResults: nonBatchResults
    };
    this.operations = [];
    return result;
  });
}

/**
 * @class DocumentServiceMock
 * @description High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.
 */
export class DocumentServiceMock {
  constructor() {
    this.document = jest.fn((id) => new DocumentBuilderMock(id, this));

    this.createDocument = jest.fn((name) => ({
      documentId: 'new-doc-id',
      getId: () => 'new-doc-id',
      builder: new DocumentBuilderMock('new-doc-id', this)
    }));

    this.getDocument = jest.fn((ids) => {
      const isArray = Array.isArray(ids);
      const idList = isArray ? ids : [ids];
      const results = idList.map((id) => ({
        documentId: id,
        title: `Mock Document ${id}`,
        body: { content: [] }
      }));
      return isArray ? results : results[0];
    });

    this.openStandard = jest.fn((id) => ({
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

    this.getRawDocumentStructure = jest.fn((id) => ({
      documentId: id,
      title: `Mock Document ${id}`,
      body: { content: [] }
    }));

    this.scanDocumentStructure = jest.fn((_id, _textPatterns) => ({
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

    this.setHeaderText = jest.fn().mockReturnThis();
    this.updateDocument = jest.fn().mockReturnThis();
    this.replaceAllText = jest.fn().mockReturnThis();

    this._executeBatchUpdate = jest.fn(() => ({ replies: [] }));
    this._executeExportPDF = jest.fn(() => ({ id: 'new-pdf-id' }));
  }
}

/**
 * @class TriggerServiceMock
 * @description High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.
 */
export class TriggerServiceMock {
  constructor(logger = null) {
    this._logger = logger;
    this._triggers = [];
    this._triggerIdCounter = 0;

    this.createTimeTrigger = jest.fn((functionName, delayMinutes) => {
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

    this.createTimedTrigger = jest.fn((functionName, delayMs) => {
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

    this.createAtTimeTrigger = jest.fn((functionName, time) => {
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

    this.createRecurringTrigger = jest.fn((functionName, frequency, interval = 1) => {
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
    });

    this.deleteTrigger = jest.fn((triggerId) => {
      const initialLength = this._triggers.length;
      this._triggers = this._triggers.filter((t) => t.id !== triggerId);
      return this._triggers.length < initialLength;
    });

    this.deleteTriggerById = this.deleteTrigger;

    this.deleteTriggersByFunction = jest.fn((functionName) => {
      const initialLength = this._triggers.length;
      this._triggers = this._triggers.filter((t) => t.functionName !== functionName);
      return initialLength - this._triggers.length;
    });

    this.getTriggers = jest.fn(() => [...this._triggers]);
    this.getAllTriggers = this.getTriggers;

    this.getTriggersByFunction = jest.fn((functionName) =>
      this._triggers.filter((t) => t.functionName === functionName)
    );

    this.getTriggerById = jest.fn(
      (triggerId) => this._triggers.find((t) => t.id === triggerId) || null
    );

    this.deleteAllTriggers = jest.fn(() => {
      this._triggers = [];
    });

    this.getTriggerCount = jest.fn(() => this._triggers.length);
    this.hasTriggerForFunction = jest.fn((functionName) =>
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
  constructor() {
    this.getFile = jest.fn((id) => ({
      getId: () => id,
      getName: () => `Mock File ${id}`,
      getBlob: () => ({
        getAs: jest.fn(() => ({}))
      })
    }));
    this.createFile = jest.fn((name, content) => ({
      getId: () => 'new-file-id',
      getName: () => name
    }));
    this.copyFile = jest.fn((id, name) => ({
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
