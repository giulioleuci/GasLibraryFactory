// ===================================================================
// FILE: test/setup.js
// ===================================================================
// Jest setup file for Google Apps Script global mocks
// Runs after the test framework is installed but before tests run
// ===================================================================

/**
 * Mock Google Apps Script Global Objects
 *
 * This setup file creates minimal mocks for GAS global objects like:
 * - Utilities
 * - Session
 * - Logger
 * - CacheService
 * - PropertiesService
 * - ScriptApp
 * - DriveApp
 * - SpreadsheetApp
 * - DocumentApp
 * - Drive (Advanced Service)
 *
 * These mocks provide the global namespace that GAS code expects.
 * For actual testing logic, we use Smart Fakes injected via DI.
 */

// ===================================================================
// UTILITIES SERVICE MOCK
// ===================================================================

let uuidCounter = 0;

global.Utilities = {
  /**
   * Mock sleep function - does nothing (skips actual waiting)
   */
  sleep: jest.fn((milliseconds) => {
    // Do nothing - we don't want tests to actually sleep
    return;
  }),

  /**
   * Mock UUID generator - returns deterministic UUIDs for testing
   */
  getUuid: jest.fn(() => {
    uuidCounter++;
    return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
  }),

  /**
   * Mock formatDate - implements basic date formatting
   */
  formatDate: jest.fn((date, timezone, format) => {
    if (!(date instanceof Date)) {
      throw new Error('Invalid date');
    }

    // Simple format implementation for testing
    if (!format) {
      format = 'yyyy-MM-dd';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', year)
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }),

  /**
   * Mock base64 encode
   */
  base64Encode: jest.fn((data) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(data).toString('base64');
    }
    return btoa(data);
  }),

  /**
   * Mock base64 decode
   */
  base64Decode: jest.fn((encoded) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(encoded, 'base64').toString();
    }
    return atob(encoded);
  }),

  /**
   * Mock base64 encode web safe (URL-safe)
   */
  base64EncodeWebSafe: jest.fn((data) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(data)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }),

  /**
   * Mock JSON parsing with error handling
   */
  jsonParse: jest.fn((jsonString) => {
    return JSON.parse(jsonString);
  }),

  /**
   * Mock JSON stringification
   */
  jsonStringify: jest.fn((obj) => {
    return JSON.stringify(obj);
  }),

  /**
   * Mock newBlob
   */
  newBlob: jest.fn((data, contentType, name) => {
    return {
      getDataAsString: () => data,
      getContentType: () => contentType,
      getName: () => name,
      setContentType: jest.fn(),
      setName: jest.fn()
    };
  }),

  /**
   * Mock parseCsv
   */
  parseCsv: jest.fn((csv, delimiter) => {
    delimiter = delimiter || ',';
    return csv.split('\n').map((row) => row.split(delimiter));
  }),

  /**
   * Mock computeDigest - generates deterministic but different hashes for different inputs
   */
  computeDigest: jest.fn((algorithm, value, charset) => {
    // Simple hash function that generates different byte arrays for different inputs
    // This simulates hashing behavior for testing purposes
    const str = typeof value === 'string' ? value : String(value);

    // Use a better hash function (FNV-1a variant) for better distribution
    let hash = 2166136261; // FNV offset basis

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash = hash >>> 0; // Convert to unsigned 32-bit
    }

    // Determine output size based on algorithm
    // SHA-256: 32 bytes, SHA-512: 64 bytes, MD5/SHA-1: 16/20 bytes
    // We default to 32 bytes for SHA_256 and 16 bytes for others to support our tests
    let byteCount = 16;
    if (algorithm === 'SHA_256' || algorithm === global.Utilities.DigestAlgorithm.SHA_256) {
      byteCount = 32;
    } else if (algorithm === 'SHA_512' || algorithm === global.Utilities.DigestAlgorithm.SHA_512) {
      byteCount = 64;
    }

    // Generate bytes using multiple rounds
    const bytes = [];
    for (let i = 0; i < byteCount; i++) {
      // Mix the hash with the position using different constants
      let h = hash;
      h ^= (i * 2654435761) >>> 0;
      h ^= h >>> 16;
      h = Math.imul(h, 2246822507);
      h ^= h >>> 13;
      h = Math.imul(h, 3266489909);
      h ^= h >>> 16;

      const byte = h & 0xff;
      // Convert to signed byte range (-128 to 127) to match GAS behavior
      bytes.push(byte > 127 ? byte - 256 : byte);

      // Update hash for next byte
      hash = (hash * 16777619) >>> 0;
    }

    return bytes;
  }),

  // Digest algorithms enum
  DigestAlgorithm: {
    MD5: 'MD5',
    SHA_1: 'SHA_1',
    SHA_256: 'SHA_256',
    SHA_384: 'SHA_384',
    SHA_512: 'SHA_512'
  },

  // Charset enum
  Charset: {
    US_ASCII: 'US_ASCII',
    UTF_8: 'UTF_8'
  }
};

// ===================================================================
// SESSION MOCK
// ===================================================================

global.Session = {
  getActiveUser: jest.fn(() => ({
    getEmail: () => 'test@example.com',
    getUserLoginId: () => 'test-user-id'
  })),

  getEffectiveUser: jest.fn(() => ({
    getEmail: () => 'test@example.com',
    getUserLoginId: () => 'test-user-id'
  })),

  getScriptTimeZone: jest.fn(() => 'America/New_York'),

  getTemporaryActiveUserKey: jest.fn(() => 'temp-user-key-123')
};

// ===================================================================
// LOGGER MOCK
// ===================================================================

global.Logger = {
  log: jest.fn((message) => {
    // Optionally print to console during tests
    // console.log('[GAS Logger]', message);
  }),

  clear: jest.fn()
};

// ===================================================================
// CACHE SERVICE MOCK
// ===================================================================

// In-memory cache store
const cacheStore = new Map();

const createCacheMock = () => ({
  get: jest.fn((key) => cacheStore.get(key) || null),

  getAll: jest.fn((keys) => {
    const result = {};
    keys.forEach((key) => {
      const value = cacheStore.get(key);
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }),

  put: jest.fn((key, value, expirationInSeconds) => {
    cacheStore.set(key, value);
  }),

  putAll: jest.fn((values, expirationInSeconds) => {
    Object.entries(values).forEach(([key, value]) => {
      cacheStore.set(key, value);
    });
  }),

  remove: jest.fn((key) => {
    cacheStore.delete(key);
  }),

  removeAll: jest.fn((keys) => {
    keys.forEach((key) => cacheStore.delete(key));
  })
});

global.CacheService = {
  getScriptCache: jest.fn(() => createCacheMock()),
  getUserCache: jest.fn(() => createCacheMock()),
  getDocumentCache: jest.fn(() => createCacheMock())
};

// ===================================================================
// PROPERTIES SERVICE MOCK
// ===================================================================

// In-memory properties stores
const scriptProperties = new Map();
const userProperties = new Map();
const documentProperties = new Map();

const createPropertiesStoreMock = (store) => ({
  getProperty: jest.fn((key) => store.get(key) || null),

  getProperties: jest.fn(() => {
    const result = {};
    store.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }),

  setProperty: jest.fn((key, value) => {
    store.set(key, value);
    return createPropertiesStoreMock(store);
  }),

  setProperties: jest.fn((properties, deleteAllOthers) => {
    if (deleteAllOthers) {
      store.clear();
    }
    Object.entries(properties).forEach(([key, value]) => {
      store.set(key, value);
    });
    return createPropertiesStoreMock(store);
  }),

  deleteProperty: jest.fn((key) => {
    store.delete(key);
    return createPropertiesStoreMock(store);
  }),

  deleteAllProperties: jest.fn(() => {
    store.clear();
    return createPropertiesStoreMock(store);
  }),

  getKeys: jest.fn(() => Array.from(store.keys()))
});

global.PropertiesService = {
  getScriptProperties: jest.fn(() => createPropertiesStoreMock(scriptProperties)),
  getUserProperties: jest.fn(() => createPropertiesStoreMock(userProperties)),
  getDocumentProperties: jest.fn(() => createPropertiesStoreMock(documentProperties))
};

// ===================================================================
// SCRIPT APP MOCK
// ===================================================================

global.ScriptApp = {
  getProjectTriggers: jest.fn(() => []),

  newTrigger: jest.fn((functionName) => ({
    timeBased: jest.fn(() => ({
      after: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      })),
      at: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      })),
      everyMinutes: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      })),
      everyHours: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      }))
    })),
    forSpreadsheet: jest.fn(() => ({
      onEdit: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      })),
      onOpen: jest.fn(() => ({
        create: jest.fn(() => ({
          getUniqueId: () => `trigger-${Utilities.getUuid()}`,
          getHandlerFunction: () => functionName
        }))
      }))
    }))
  })),

  deleteTrigger: jest.fn(),

  getScriptId: jest.fn(() => 'test-script-id'),

  getOAuthToken: jest.fn(() => 'test-oauth-token'),

  getProjectKey: jest.fn(() => 'test-project-key'),

  // Event types for triggers
  EventType: {
    CLOCK: 'CLOCK',
    ON_OPEN: 'ON_OPEN',
    ON_EDIT: 'ON_EDIT',
    ON_FORM_SUBMIT: 'ON_FORM_SUBMIT',
    ON_CHANGE: 'ON_CHANGE',
    ON_EVENT_UPDATED: 'ON_EVENT_UPDATED'
  },

  // Week days for weekly triggers
  WeekDay: {
    SUNDAY: 'SUNDAY',
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY'
  }
};

// ===================================================================
// DRIVE APP MOCK (Legacy DriveApp)
// ===================================================================

global.DriveApp = {
  getFileById: jest.fn((id) => ({
    getId: () => id,
    getName: () => `File ${id}`,
    getMimeType: () => 'application/octet-stream',
    getBlob: jest.fn(),
    setName: jest.fn(),
    moveTo: jest.fn(),
    makeCopy: jest.fn()
  })),

  getFolderById: jest.fn((id) => ({
    getId: () => id,
    getName: () => `Folder ${id}`,
    getFiles: jest.fn(() => ({
      hasNext: () => false,
      next: () => null
    })),
    getFolders: jest.fn(() => ({
      hasNext: () => false,
      next: () => null
    })),
    createFile: jest.fn(),
    createFolder: jest.fn()
  })),

  createFile: jest.fn((name, content) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  createFolder: jest.fn((name) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  Access: {
    ANYONE: 'ANYONE',
    ANYONE_WITH_LINK: 'ANYONE_WITH_LINK',
    DOMAIN: 'DOMAIN',
    DOMAIN_WITH_LINK: 'DOMAIN_WITH_LINK',
    PRIVATE: 'PRIVATE'
  },

  Permission: {
    VIEW: 'VIEW',
    EDIT: 'EDIT',
    COMMENT: 'COMMENT',
    OWNER: 'OWNER'
  }
};

// ===================================================================
// DRIVE (ADVANCED SERVICE) MOCK
// ===================================================================

global.Drive = {
  Files: {
    get: jest.fn((fileId) => ({
      id: fileId,
      name: `File ${fileId}`,
      mimeType: 'application/octet-stream'
    })),

    list: jest.fn(() => ({
      items: [],
      nextPageToken: null
    })),

    insert: jest.fn((resource, mediaData) => ({
      id: Utilities.getUuid(),
      name: resource.title || resource.name,
      mimeType: resource.mimeType
    })),

    update: jest.fn((resource, fileId, mediaData) => ({
      id: fileId,
      name: resource.title || resource.name
    })),

    patch: jest.fn((resource, fileId) => ({
      id: fileId,
      ...resource
    })),

    copy: jest.fn((resource, fileId) => ({
      id: Utilities.getUuid(),
      name: resource.title || resource.name
    })),

    remove: jest.fn((fileId) => {
      // No return value
    }),

    trash: jest.fn((fileId) => ({
      id: fileId,
      labels: { trashed: true }
    }))
  },

  Permissions: {
    insert: jest.fn((resource, fileId) => ({
      id: Utilities.getUuid(),
      role: resource.role,
      type: resource.type
    })),

    list: jest.fn((fileId) => ({
      items: []
    })),

    remove: jest.fn((fileId, permissionId) => {
      // No return value
    })
  }
};

// ===================================================================
// SHEETS (ADVANCED SERVICE) MOCK
// ===================================================================

global.Sheets = {
  Spreadsheets: {
    get: jest.fn((spreadsheetId) => ({
      spreadsheetId: spreadsheetId,
      properties: { title: `Spreadsheet ${spreadsheetId}` },
      sheets: []
    })),

    create: jest.fn((resource) => ({
      spreadsheetId: Utilities.getUuid(),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${Utilities.getUuid()}`,
      properties: resource.properties || {}
    })),

    batchUpdate: jest.fn((spreadsheetId, resource) => ({
      spreadsheetId: spreadsheetId,
      replies: []
    })),

    Values: {
      get: jest.fn((spreadsheetId, range) => ({
        range: range,
        majorDimension: 'ROWS',
        values: []
      })),

      batchGet: jest.fn((spreadsheetId, params) => ({
        spreadsheetId: spreadsheetId,
        valueRanges: (params.ranges || []).map((range) => ({
          range: range,
          values: []
        }))
      })),

      update: jest.fn((resource, spreadsheetId, range, params) => ({
        spreadsheetId: spreadsheetId,
        updatedRange: range,
        updatedRows: resource.values ? resource.values.length : 0,
        updatedColumns: resource.values && resource.values[0] ? resource.values[0].length : 0,
        updatedCells: resource.values
          ? resource.values.reduce((sum, row) => sum + row.length, 0)
          : 0
      })),

      batchUpdate: jest.fn((resource, spreadsheetId) => ({
        spreadsheetId: spreadsheetId,
        totalUpdatedRows: 0,
        totalUpdatedColumns: 0,
        totalUpdatedCells: 0,
        responses: []
      })),

      append: jest.fn((resource, spreadsheetId, range, params) => ({
        spreadsheetId: spreadsheetId,
        tableRange: range,
        updates: {
          updatedRange: range,
          updatedRows: resource.values ? resource.values.length : 0
        }
      })),

      clear: jest.fn((resource, spreadsheetId, range) => ({
        spreadsheetId: spreadsheetId,
        clearedRange: range
      })),

      batchClear: jest.fn((resource, spreadsheetId) => ({
        spreadsheetId: spreadsheetId,
        clearedRanges: resource.ranges || []
      }))
    }
  }
};

// ===================================================================
// GMAIL (ADVANCED SERVICE) MOCK
// ===================================================================

global.Gmail = {
  Users: {
    Messages: {
      send: jest.fn((resource, userId) => ({
        id: Utilities.getUuid(),
        threadId: Utilities.getUuid(),
        labelIds: ['SENT']
      })),

      list: jest.fn((userId, params) => ({
        messages: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId, messageId, params) => ({
        id: messageId,
        threadId: Utilities.getUuid(),
        labelIds: ['INBOX'],
        snippet: 'Test message',
        payload: {
          headers: [],
          body: { data: '' }
        }
      })),

      trash: jest.fn((userId, messageId) => ({
        id: messageId,
        labelIds: ['TRASH']
      })),

      delete: jest.fn((userId, messageId) => {
        // No return value
      }),

      modify: jest.fn((resource, userId, messageId) => ({
        id: messageId,
        labelIds: resource.addLabelIds || []
      }))
    },

    Drafts: {
      create: jest.fn((resource, userId) => ({
        id: Utilities.getUuid(),
        message: {
          id: Utilities.getUuid(),
          threadId: Utilities.getUuid()
        }
      })),

      list: jest.fn((userId, params) => ({
        drafts: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId, draftId) => ({
        id: draftId,
        message: {
          id: Utilities.getUuid(),
          payload: {}
        }
      })),

      update: jest.fn((resource, userId, draftId) => ({
        id: draftId,
        message: resource.message
      })),

      send: jest.fn((resource, userId, draftId) => ({
        id: Utilities.getUuid(),
        threadId: Utilities.getUuid(),
        labelIds: ['SENT']
      })),

      delete: jest.fn((userId, draftId) => {
        // No return value
      })
    },

    Labels: {
      list: jest.fn((userId) => ({
        labels: [
          { id: 'INBOX', name: 'INBOX', type: 'system' },
          { id: 'SENT', name: 'SENT', type: 'system' },
          { id: 'TRASH', name: 'TRASH', type: 'system' },
          { id: 'DRAFT', name: 'DRAFT', type: 'system' }
        ]
      })),

      create: jest.fn((resource, userId) => ({
        id: Utilities.getUuid(),
        name: resource.name,
        type: 'user'
      })),

      get: jest.fn((userId, labelId) => ({
        id: labelId,
        name: `Label ${labelId}`,
        type: 'user'
      })),

      update: jest.fn((resource, userId, labelId) => ({
        id: labelId,
        name: resource.name
      })),

      delete: jest.fn((userId, labelId) => {
        // No return value
      })
    },

    Threads: {
      list: jest.fn((userId, params) => ({
        threads: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId, threadId, params) => ({
        id: threadId,
        messages: []
      })),

      modify: jest.fn((resource, userId, threadId) => ({
        id: threadId,
        messages: []
      })),

      trash: jest.fn((userId, threadId) => ({
        id: threadId
      })),

      delete: jest.fn((userId, threadId) => {
        // No return value
      })
    }
  }
};

// ===================================================================
// SPREADSHEET APP MOCK
// ===================================================================

global.SpreadsheetApp = {
  openById: jest.fn((id) => ({
    getId: () => id,
    getName: () => `Spreadsheet ${id}`,
    getSheets: jest.fn(() => []),
    getSheetByName: jest.fn((name) => null),
    insertSheet: jest.fn()
  })),

  getActiveSpreadsheet: jest.fn(() => ({
    getId: () => 'active-spreadsheet-id',
    getName: () => 'Active Spreadsheet',
    getSheets: jest.fn(() => [])
  })),

  create: jest.fn((name) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  flush: jest.fn()
};

// ===================================================================
// DOCUMENT APP MOCK
// ===================================================================

global.DocumentApp = {
  openById: jest.fn((id) => ({
    getId: () => id,
    getName: () => `Document ${id}`,
    getBody: jest.fn(() => ({
      getText: () => '',
      setText: jest.fn(),
      appendParagraph: jest.fn(),
      getTables: jest.fn(() => [])
    }))
  })),

  create: jest.fn((name) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  ElementType: {
    BODY_SECTION: 'BODY_SECTION',
    PARAGRAPH: 'PARAGRAPH',
    TEXT: 'TEXT',
    TABLE: 'TABLE',
    TABLE_ROW: 'TABLE_ROW',
    TABLE_CELL: 'TABLE_CELL',
    LIST_ITEM: 'LIST_ITEM'
  },

  GlyphType: {
    BULLET: 'BULLET',
    NUMBER: 'NUMBER'
  }
};

// ===================================================================
// GMAIL APP MOCK
// ===================================================================

global.GmailApp = {
  sendEmail: jest.fn((_recipient, _subject, _body, _options) => {
    // Mock sent
  }),

  createDraft: jest.fn((_recipient, _subject, _body, _options) => ({
    getId: () => Utilities.getUuid()
  })),

  getInboxThreads: jest.fn(() => []),

  search: jest.fn(() => [])
};

// ===================================================================
// CONTENT SERVICE MOCK
// ===================================================================

global.ContentService = {
  createTextOutput: jest.fn((content) => ({
    setMimeType: jest.fn(),
    getContent: () => content
  })),

  MimeType: {
    TEXT: 'text/plain',
    JSON: 'application/json',
    JAVASCRIPT: 'application/javascript',
    XML: 'application/xml'
  }
};

// ===================================================================
// HTML SERVICE MOCK
// ===================================================================

global.HtmlService = {
  createHtmlOutput: jest.fn((html) => ({
    setTitle: jest.fn(),
    setWidth: jest.fn(),
    setHeight: jest.fn(),
    getContent: () => html
  })),

  createTemplateFromFile: jest.fn((filename) => ({
    evaluate: jest.fn(() => ({
      getContent: () => `<html>Mock template from ${filename}</html>`
    }))
  }))
};

// ===================================================================
// URL FETCH APP MOCK
// ===================================================================

global.UrlFetchApp = {
  fetch: jest.fn((url, params) => {
    // Check if this is a batch request (multipart/mixed)
    if (params && params.contentType && params.contentType.includes('multipart/mixed')) {
      // Return a proper batch response with boundaries
      const boundary = 'batch_boundary_123';
      const batchResponse = `Content-Type: multipart/mixed; boundary=${boundary}

--${boundary}
Content-Type: application/http

HTTP/1.1 200 OK
Content-Type: application/json

{
  "updates": {
    "updatedCells": 10,
    "updatedRows": 2,
    "updatedColumns": 5
  }
}

--${boundary}--`;

      return {
        getResponseCode: () => 200,
        getContentText: () => batchResponse,
        getBlob: jest.fn(),
        getHeaders: () => ({ 'Content-Type': `multipart/mixed; boundary=${boundary}` })
      };
    }

    // Regular fetch response
    return {
      getResponseCode: () => 200,
      getContentText: () => '{}',
      getBlob: jest.fn(),
      getHeaders: () => ({ 'Content-Type': 'application/json' })
    };
  }),

  fetchAll: jest.fn((requests) => {
    return requests.map(() => ({
      getResponseCode: () => 200,
      getContentText: () => '{}',
      getHeaders: () => ({ 'Content-Type': 'application/json' })
    }));
  })
};

// ===================================================================
// CALENDAR APP MOCK
// ===================================================================

global.CalendarApp = {
  getDefaultCalendar: jest.fn(() => ({
    getId: () => 'default-calendar-id',
    getName: () => 'Default Calendar'
  })),

  createEvent: jest.fn((_title, _startTime, _endTime) => ({
    getId: () => Utilities.getUuid()
  }))
};

// ===================================================================
// HELPER: Reset all global mocks between tests
// ===================================================================

/**
 * Reset all GAS global mocks to clean state
 * Call this in beforeEach() if you need fresh mocks
 */
global.resetGasMocks = () => {
  // Reset UUID counter
  uuidCounter = 0;

  // Clear cache and properties stores
  cacheStore.clear();
  scriptProperties.clear();
  userProperties.clear();
  documentProperties.clear();

  // Clear all Jest mock call histories
  jest.clearAllMocks();
};

// ===================================================================
// MOCK HELPER FUNCTIONS
// ===================================================================

/**
 * Creates a mock LoggerService instance for testing
 * @returns {Object} Mock logger with common logging methods
 */
global.mockLoggerService = () => {
  const logs = [];
  return {
    info: jest.fn((msg) => logs.push({ level: 'INFO', message: msg })),
    warn: jest.fn((msg) => logs.push({ level: 'WARN', message: msg })),
    error: jest.fn((msg) => logs.push({ level: 'ERROR', message: msg })),
    debug: jest.fn((msg) => logs.push({ level: 'DEBUG', message: msg })),
    log: jest.fn((msg) => logs.push({ level: 'LOG', message: msg })),
    getLogs: jest.fn(() => logs),
    clearLogs: jest.fn(() => {
      logs.length = 0;
    })
  };
};

/**
 * Creates a mock CacheService instance for testing
 * @returns {Object} Mock cache service with common methods
 */
global.mockCacheService = () => {
  const cache = new Map();

  return {
    get: jest.fn((key) => cache.get(key) || null),
    put: jest.fn((key, value, _expirationInSeconds) => {
      cache.set(key, value);
      return true;
    }),
    remove: jest.fn((key) => {
      // Handle wildcard patterns (e.g., "Users_*" should match "Users:id", "Users_id", etc.)
      if (key && key.endsWith('*')) {
        const pattern = key.slice(0, -1); // Remove the *
        // Extract table name by removing trailing separator (_)
        const tableName = pattern.replace(/[_:]$/, '');
        let removed = 0;
        for (const [cacheKey] of cache) {
          // Match if key starts with tableName followed by : or _
          if (cacheKey.startsWith(tableName + ':') || cacheKey.startsWith(tableName + '_')) {
            cache.delete(cacheKey);
            removed++;
          }
        }
        return removed > 0;
      }
      // Exact key match
      cache.delete(key);
      return true;
    }),
    removeAll: jest.fn((keys) => {
      if (keys && Array.isArray(keys)) {
        keys.forEach((key) => cache.delete(key));
      } else {
        // Clear all if no keys specified (GAS CacheService behavior)
        cache.clear();
      }
      return true;
    }),
    // Helper to clear cache
    _clear: () => {
      cache.clear();
    }
  };
};

/**
 * Creates a mock SpreadsheetService instance for testing
 * @returns {Object} Mock spreadsheet service with common methods
 */
global.mockSpreadsheetService = () => {
  const mockData = new Map();

  return {
    updateRanges: jest.fn(() => ({
      totalUpdatedRows: 0,
      totalUpdatedColumns: 0,
      totalUpdatedCells: 0
    })),
    getRanges: jest.fn(() => ({})),
    appendRows: jest.fn(() => ({ totalUpdatedRows: 0 })),
    clearRanges: jest.fn(() => ({ clearedRanges: [] })),
    formatRanges: jest.fn(() => ({ formattedRanges: [] })),
    setColumnWidths: jest.fn(() => ({ updatedColumns: [] })),
    createSheets: jest.fn(() => ({ createdSheets: [] })),
    deleteSheets: jest.fn(() => ({ deletedSheets: [] })),
    getSpreadsheetMetadata: jest.fn(() => ({
      spreadsheetId: 'test-id',
      title: 'Test Spreadsheet'
    })),
    getSheetInfo: jest.fn(() => []),
    createSpreadsheet: jest.fn(() => ({ spreadsheetId: 'new-test-id' })),
    getProtectedRanges: jest.fn(() => []),
    deleteProtectedRanges: jest.fn(() => ({ deletedRanges: [] })),
    protectRanges: jest.fn(() => ({ protectedRanges: [] })),
    // Helper to seed test data
    _seedData: (spreadsheetId, sheetName, rows) => {
      const key = `${spreadsheetId}:${sheetName}`;
      mockData.set(key, rows);
    },
    // Helper to clear all data
    _clearAll: () => {
      mockData.clear();
    }
  };
};

// ===================================================================
// CONSOLE LOGGING FOR TESTS (Optional)
// ===================================================================

// Uncomment to see all console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(console.log),
//   error: jest.fn(console.error),
//   warn: jest.fn(console.warn),
//   info: jest.fn(console.info),
//   debug: jest.fn(console.debug)
// };

// ===================================================================
// SETUP COMPLETE
// ===================================================================

console.log('✅ GAS Global Mocks initialized for Jest');
