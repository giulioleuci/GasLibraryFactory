import type { Mock } from 'jest-mock';
interface PropertiesStoreMock {
  getProperty: Mock<(key: string) => unknown>;
  getProperties: Mock<() => Record<string, unknown>>;
  setProperty: Mock<(key: string, value: unknown) => PropertiesStoreMock>;
  setProperties: Mock<
    (properties: Record<string, unknown>, deleteAllOthers?: boolean) => PropertiesStoreMock
  >;
  deleteProperty: Mock<(key: string) => PropertiesStoreMock>;
  deleteAllProperties: Mock<() => PropertiesStoreMock>;
  getKeys: Mock<() => string[]>;
}
import type { HarnessGlobals, HarnessResource, HarnessRequestOptions } from './harnessTypes.js';
declare const global: HarnessGlobals;
import { jest } from '@jest/globals';
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
  sleep: jest.fn((milliseconds: unknown) => {
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
  formatDate: jest.fn((date: Date, timezone: string | undefined, format: string | undefined) => {
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

    return (format.replace as (search: string, replacement: string | number) => string)(
      'yyyy',
      year
    )
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }),

  /**
   * Mock base64 encode
   */
  base64Encode: jest.fn((data: string) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(data).toString('base64');
    }
    return btoa(data);
  }),

  /**
   * Mock base64 decode
   */
  base64Decode: jest.fn((encoded: string) => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(encoded, 'base64').toString();
    }
    return atob(encoded);
  }),

  /**
   * Mock base64 encode web safe (URL-safe)
   */
  base64EncodeWebSafe: jest.fn((data: string) => {
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
  jsonParse: jest.fn((jsonString: string) => {
    return JSON.parse(jsonString);
  }),

  /**
   * Mock JSON stringification
   */
  jsonStringify: jest.fn((obj: unknown) => {
    return JSON.stringify(obj);
  }),

  /**
   * Mock newBlob
   */
  newBlob: jest.fn((data: unknown, contentType: string, name: string) => {
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
  parseCsv: jest.fn((csv: string, delimiter: string | undefined) => {
    delimiter = delimiter || ',';
    return csv.split('\n').map((row) => row.split(delimiter));
  }),

  /**
   * Mock computeDigest - generates deterministic but different hashes for different inputs
   */
  computeDigest: jest.fn((algorithm: string, value: unknown, charset: string | undefined) => {
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
  log: jest.fn((message: unknown) => {
    // Optionally print to console during tests
    // console.log('[GAS Logger]', message);
  }),

  clear: jest.fn()
};

// ===================================================================
// CACHE SERVICE MOCK
// ===================================================================

// In-memory cache store
const cacheStore = new Map<string, unknown>();

const createCacheMock = () => ({
  get: jest.fn((key: string) => cacheStore.get(key) || null),

  getAll: jest.fn((keys: string[]) => {
    const result: Record<string, unknown> = {};
    keys.forEach((key) => {
      const value = cacheStore.get(key);
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }),

  put: jest.fn((key: string, value: unknown, expirationInSeconds: unknown) => {
    cacheStore.set(key, value);
  }),

  putAll: jest.fn((values: Record<string, unknown>, expirationInSeconds: unknown) => {
    Object.entries(values).forEach(([key, value]) => {
      cacheStore.set(key, value);
    });
  }),

  remove: jest.fn((key: string) => {
    cacheStore.delete(key);
  }),

  removeAll: jest.fn((keys: string[]) => {
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
const scriptProperties = new Map<string, unknown>();
const userProperties = new Map<string, unknown>();
const documentProperties = new Map<string, unknown>();

const createPropertiesStoreMock = (store: Map<string, unknown>): PropertiesStoreMock => ({
  getProperty: jest.fn((key: string) => store.get(key) || null),

  getProperties: jest.fn(() => {
    const result: Record<string, unknown> = {};
    store.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }),

  setProperty: jest.fn((key: string, value: unknown) => {
    store.set(key, value);
    return createPropertiesStoreMock(store);
  }),

  setProperties: jest.fn((properties: Record<string, unknown>, deleteAllOthers: unknown) => {
    if (deleteAllOthers) {
      store.clear();
    }
    Object.entries(properties).forEach(([key, value]) => {
      store.set(key, value);
    });
    return createPropertiesStoreMock(store);
  }),

  deleteProperty: jest.fn((key: string) => {
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

  newTrigger: jest.fn((functionName: string) => ({
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
  getFileById: jest.fn((id: string) => ({
    getId: () => id,
    getName: () => `File ${id}`,
    getMimeType: () => 'application/octet-stream',
    getBlob: jest.fn(),
    setName: jest.fn(),
    moveTo: jest.fn(),
    makeCopy: jest.fn()
  })),

  getFolderById: jest.fn((id: string) => ({
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

  createFile: jest.fn((name: string, content: unknown) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  createFolder: jest.fn((name: string) => ({
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
    get: jest.fn((fileId: string) => ({
      id: fileId,
      name: `File ${fileId}`,
      mimeType: 'application/octet-stream'
    })),

    list: jest.fn(() => ({
      items: [],
      nextPageToken: null
    })),

    insert: jest.fn((resource: HarnessResource, mediaData: unknown) => ({
      id: Utilities.getUuid(),
      name: resource.title || resource.name,
      mimeType: resource.mimeType
    })),

    update: jest.fn((resource: HarnessResource, fileId: string, mediaData: unknown) => ({
      id: fileId,
      name: resource.title || resource.name
    })),

    patch: jest.fn((resource: HarnessResource, fileId: string) => ({
      id: fileId,
      ...resource
    })),

    copy: jest.fn((resource: HarnessResource, fileId: string) => ({
      id: Utilities.getUuid(),
      name: resource.title || resource.name
    })),

    remove: jest.fn((fileId: string) => {
      // No return value
    }),

    trash: jest.fn((fileId: string) => ({
      id: fileId,
      labels: { trashed: true }
    }))
  },

  Permissions: {
    insert: jest.fn((resource: HarnessResource, fileId: string) => ({
      id: Utilities.getUuid(),
      role: resource.role,
      type: resource.type
    })),

    list: jest.fn((fileId: string) => ({
      items: []
    })),

    remove: jest.fn((fileId: string, permissionId: string) => {
      // No return value
    })
  }
};

// ===================================================================
// SHEETS (ADVANCED SERVICE) MOCK
// ===================================================================

global.Sheets = {
  Spreadsheets: {
    get: jest.fn((spreadsheetId: string) => ({
      spreadsheetId: spreadsheetId,
      properties: { title: `Spreadsheet ${spreadsheetId}` },
      sheets: []
    })),

    create: jest.fn((resource: HarnessResource) => ({
      spreadsheetId: Utilities.getUuid(),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${Utilities.getUuid()}`,
      properties: resource.properties || {}
    })),

    batchUpdate: jest.fn((spreadsheetId: string, resource: HarnessResource) => ({
      spreadsheetId: spreadsheetId,
      replies: []
    })),

    Values: {
      get: jest.fn((spreadsheetId: string, range: string) => ({
        range: range,
        majorDimension: 'ROWS',
        values: []
      })),

      batchGet: jest.fn((spreadsheetId: string, params: HarnessRequestOptions) => ({
        spreadsheetId: spreadsheetId,
        valueRanges: (params.ranges || []).map((range) => ({
          range: range,
          values: []
        }))
      })),

      update: jest.fn(
        (
          resource: HarnessResource,
          spreadsheetId: string,
          range: string,
          params: HarnessRequestOptions
        ) => ({
          spreadsheetId: spreadsheetId,
          updatedRange: range,
          updatedRows: resource.values ? resource.values.length : 0,
          updatedColumns: resource.values && resource.values[0] ? resource.values[0].length : 0,
          updatedCells: resource.values
            ? resource.values.reduce((sum, row) => sum + row.length, 0)
            : 0
        })
      ),

      batchUpdate: jest.fn((resource: HarnessResource, spreadsheetId: string) => ({
        spreadsheetId: spreadsheetId,
        totalUpdatedRows: 0,
        totalUpdatedColumns: 0,
        totalUpdatedCells: 0,
        responses: []
      })),

      append: jest.fn(
        (
          resource: HarnessResource,
          spreadsheetId: string,
          range: string,
          params: HarnessRequestOptions
        ) => ({
          spreadsheetId: spreadsheetId,
          tableRange: range,
          updates: {
            updatedRange: range,
            updatedRows: resource.values ? resource.values.length : 0
          }
        })
      ),

      clear: jest.fn((resource: HarnessResource, spreadsheetId: string, range: string) => ({
        spreadsheetId: spreadsheetId,
        clearedRange: range
      })),

      batchClear: jest.fn((resource: HarnessResource, spreadsheetId: string) => ({
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
      send: jest.fn((resource: HarnessResource, userId: string) => ({
        id: Utilities.getUuid(),
        threadId: Utilities.getUuid(),
        labelIds: ['SENT']
      })),

      list: jest.fn((userId: string, params: HarnessRequestOptions) => ({
        messages: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId: string, messageId: string, params: HarnessRequestOptions) => ({
        id: messageId,
        threadId: Utilities.getUuid(),
        labelIds: ['INBOX'],
        snippet: 'Test message',
        payload: {
          headers: [],
          body: { data: '' }
        }
      })),

      trash: jest.fn((userId: string, messageId: string) => ({
        id: messageId,
        labelIds: ['TRASH']
      })),

      delete: jest.fn((userId: string, messageId: string) => {
        // No return value
      }),

      modify: jest.fn((resource: HarnessResource, userId: string, messageId: string) => ({
        id: messageId,
        labelIds: resource.addLabelIds || []
      }))
    },

    Drafts: {
      create: jest.fn((resource: HarnessResource, userId: string) => ({
        id: Utilities.getUuid(),
        message: {
          id: Utilities.getUuid(),
          threadId: Utilities.getUuid()
        }
      })),

      list: jest.fn((userId: string, params: HarnessRequestOptions) => ({
        drafts: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId: string, draftId: string) => ({
        id: draftId,
        message: {
          id: Utilities.getUuid(),
          payload: {}
        }
      })),

      update: jest.fn((resource: HarnessResource, userId: string, draftId: string) => ({
        id: draftId,
        message: resource.message
      })),

      send: jest.fn((resource: HarnessResource, userId: string, draftId: string) => ({
        id: Utilities.getUuid(),
        threadId: Utilities.getUuid(),
        labelIds: ['SENT']
      })),

      delete: jest.fn((userId: string, draftId: string) => {
        // No return value
      })
    },

    Labels: {
      list: jest.fn((userId: string) => ({
        labels: [
          { id: 'INBOX', name: 'INBOX', type: 'system' },
          { id: 'SENT', name: 'SENT', type: 'system' },
          { id: 'TRASH', name: 'TRASH', type: 'system' },
          { id: 'DRAFT', name: 'DRAFT', type: 'system' }
        ]
      })),

      create: jest.fn((resource: HarnessResource, userId: string) => ({
        id: Utilities.getUuid(),
        name: resource.name,
        type: 'user'
      })),

      get: jest.fn((userId: string, labelId: string) => ({
        id: labelId,
        name: `Label ${labelId}`,
        type: 'user'
      })),

      update: jest.fn((resource: HarnessResource, userId: string, labelId: string) => ({
        id: labelId,
        name: resource.name
      })),

      delete: jest.fn((userId: string, labelId: string) => {
        // No return value
      })
    },

    Threads: {
      list: jest.fn((userId: string, params: HarnessRequestOptions) => ({
        threads: [],
        resultSizeEstimate: 0
      })),

      get: jest.fn((userId: string, threadId: string, params: HarnessRequestOptions) => ({
        id: threadId,
        messages: []
      })),

      modify: jest.fn((resource: HarnessResource, userId: string, threadId: string) => ({
        id: threadId,
        messages: []
      })),

      trash: jest.fn((userId: string, threadId: string) => ({
        id: threadId
      })),

      delete: jest.fn((userId: string, threadId: string) => {
        // No return value
      })
    }
  }
};

// ===================================================================
// SPREADSHEET APP MOCK
// ===================================================================

global.SpreadsheetApp = {
  openById: jest.fn((id: string) => ({
    getId: () => id,
    getName: () => `Spreadsheet ${id}`,
    getSheets: jest.fn(() => []),
    getSheetByName: jest.fn((name: string) => null),
    insertSheet: jest.fn()
  })),

  getActiveSpreadsheet: jest.fn(() => ({
    getId: () => 'active-spreadsheet-id',
    getName: () => 'Active Spreadsheet',
    getSheets: jest.fn(() => [])
  })),

  create: jest.fn((name: string) => ({
    getId: () => Utilities.getUuid(),
    getName: () => name
  })),

  flush: jest.fn()
};

// ===================================================================
// DOCUMENT APP MOCK
// ===================================================================

global.DocumentApp = {
  openById: jest.fn((id: string) => ({
    getId: () => id,
    getName: () => `Document ${id}`,
    getBody: jest.fn(() => ({
      getText: () => '',
      setText: jest.fn(),
      appendParagraph: jest.fn(),
      getTables: jest.fn(() => [])
    }))
  })),

  create: jest.fn((name: string) => ({
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
  sendEmail: jest.fn(
    (_recipient: unknown, _subject: unknown, _body: unknown, _options: unknown) => {
      // Mock sent
    }
  ),

  createDraft: jest.fn(
    (_recipient: unknown, _subject: unknown, _body: unknown, _options: unknown) => ({
      getId: () => Utilities.getUuid()
    })
  ),

  getInboxThreads: jest.fn(() => []),

  search: jest.fn(() => [])
};

// ===================================================================
// CONTENT SERVICE MOCK
// ===================================================================

global.ContentService = {
  createTextOutput: jest.fn((content: unknown) => ({
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
  createHtmlOutput: jest.fn((html: unknown) => ({
    setTitle: jest.fn(),
    setWidth: jest.fn(),
    setHeight: jest.fn(),
    getContent: () => html
  })),

  createTemplateFromFile: jest.fn((filename: string) => ({
    evaluate: jest.fn(() => ({
      getContent: () => `<html>Mock template from ${filename}</html>`
    }))
  }))
};

// ===================================================================
// URL FETCH APP MOCK
// ===================================================================

global.UrlFetchApp = {
  fetch: jest.fn((url: unknown, params: HarnessRequestOptions) => {
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

  fetchAll: jest.fn((requests: unknown[]) => {
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

  createEvent: jest.fn((_title: unknown, _startTime: unknown, _endTime: unknown) => ({
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
  const logs: { level: string; message: unknown }[] = [];
  return {
    info: jest.fn((msg: unknown) => logs.push({ level: 'INFO', message: msg })),
    warn: jest.fn((msg: unknown) => logs.push({ level: 'WARN', message: msg })),
    error: jest.fn((msg: unknown) => logs.push({ level: 'ERROR', message: msg })),
    debug: jest.fn((msg: unknown) => logs.push({ level: 'DEBUG', message: msg })),
    log: jest.fn((msg: unknown) => logs.push({ level: 'LOG', message: msg })),
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
  const cache = new Map<string, unknown>();

  return {
    get: jest.fn((key: string) => cache.get(key) || null),
    put: jest.fn((key: string, value: unknown, _expirationInSeconds: unknown) => {
      cache.set(key, value);
      return true;
    }),
    remove: jest.fn((key: string) => {
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
    removeAll: jest.fn((keys: string[]) => {
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
  const mockData = new Map<string, unknown[]>();

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
    _seedData: (spreadsheetId: string, sheetName: string, rows: unknown[]) => {
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
