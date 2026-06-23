// ===================================================================
// FILE: test/integration-setup.js
// ===================================================================
// Setup file for integration tests
// Provides common mocks and utilities for cross-layer testing
// ===================================================================

// Mock Google Apps Script globals
let uuidCounter = 0;

// Mock Logger
global.Logger = {
  log: jest.fn((..._args) => {
    // console.log('[Logger.log]', ..._args);
  }),
  clear: jest.fn()
};

global.Utilities = {
  sleep: jest.fn((_milliseconds) => {
    // Do nothing - we don't want tests to actually sleep
    return;
  }),

  getUuid: jest.fn(() => {
    uuidCounter++;
    return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
  }),

  computeDigest: jest.fn((algorithm, value, charset) => {
    // Simple hash function that generates different byte arrays for different inputs
    const str = typeof value === 'string' ? value : String(value);

    // Use FNV-1a hash variant for better distribution
    let hash = 2166136261; // FNV offset basis

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      hash = hash >>> 0; // Convert to unsigned 32-bit
    }

    // Determine output size based on algorithm
    // SHA-256: 32 bytes, SHA-512: 64 bytes, MD5/SHA-1: 16/20 bytes
    let byteCount = 16;
    if (algorithm === 'SHA_256' || algorithm === global.Utilities.DigestAlgorithm.SHA_256) {
      byteCount = 32;
    } else if (
      algorithm === 'SHA_512' ||
      algorithm === global.Utilities.DigestAlgorithm.SHA_512
    ) {
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

  DigestAlgorithm: {
    MD5: 'MD5',
    SHA_1: 'SHA_1',
    SHA_256: 'SHA_256',
    SHA_384: 'SHA_384',
    SHA_512: 'SHA_512'
  },

  Charset: {
    UTF_8: 'UTF_8',
    US_ASCII: 'US_ASCII'
  },

  newBlob: jest.fn((data, contentType, name) => {
    return {
      getDataAsString: () => data,
      getContentType: () => contentType,
      getName: () => name,
      setContentType: jest.fn(),
      setName: jest.fn()
    };
  })
};

// Common mock implementations for Google Apps Script services
global.mockSpreadsheetService = () => {
  const mockData = new Map();

  return {
    getSheetData: jest.fn((spreadsheetId, sheetName) => {
      const key = `${spreadsheetId}:${sheetName}`;
      return mockData.get(key) || [];
    }),
    appendRow: jest.fn((spreadsheetId, sheetName, row) => {
      const key = `${spreadsheetId}:${sheetName}`;
      const data = mockData.get(key) || [];
      data.push(row);
      mockData.set(key, data);
      return true;
    }),
    updateRow: jest.fn((spreadsheetId, sheetName, rowIndex, row) => {
      const key = `${spreadsheetId}:${sheetName}`;
      const data = mockData.get(key) || [];
      if (rowIndex < data.length) {
        data[rowIndex] = row;
        mockData.set(key, data);
        return true;
      }
      return false;
    }),
    deleteRow: jest.fn((spreadsheetId, sheetName, rowIndex) => {
      const key = `${spreadsheetId}:${sheetName}`;
      const data = mockData.get(key) || [];
      if (rowIndex < data.length) {
        data.splice(rowIndex, 1);
        mockData.set(key, data);
        return true;
      }
      return false;
    }),
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

global.mockPropertiesService = () => {
  const properties = new Map();

  return {
    getProperty: jest.fn((key) => properties.get(key) || null),
    setProperty: jest.fn((key, value) => {
      properties.set(key, value);
    }),
    deleteProperty: jest.fn((key) => {
      properties.delete(key);
    }),
    deleteAllProperties: jest.fn(() => {
      properties.clear();
    }),
    getProperties: jest.fn(() => {
      return Object.fromEntries(properties);
    }),
    setProperties: jest.fn((props) => {
      Object.entries(props).forEach(([key, value]) => {
        properties.set(key, value);
      });
    }),
    // Helper to clear properties
    _clear: () => {
      properties.clear();
    }
  };
};

global.mockLoggerService = () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  };
};

global.mockDriveService = () => {
  const files = new Map();
  const folders = new Map();

  return {
    getFileById: jest.fn((id) => {
      return files.get(id) || null;
    }),
    getFolderById: jest.fn((id) => {
      return folders.get(id) || null;
    }),
    createFile: jest.fn((name, content, mimeType) => {
      const id = `file_${Math.random().toString(36).substr(2, 9)}`;
      const file = { id, name, content, mimeType };
      files.set(id, file);
      return file;
    }),
    createFolder: jest.fn((name) => {
      const id = `folder_${Math.random().toString(36).substr(2, 9)}`;
      const folder = { id, name };
      folders.set(id, folder);
      return folder;
    }),
    deleteFile: jest.fn((id) => {
      files.delete(id);
    }),
    deleteFolder: jest.fn((id) => {
      folders.delete(id);
    }),
    // Helper to clear all resources
    _clearAll: () => {
      files.clear();
      folders.clear();
    }
  };
};

// Test utilities
global.testUtils = {
  // Generate unique test ID
  generateId: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

  // Generate test entity
  generateEntity: (overrides = {}) => ({
    id: global.testUtils.generateId(),
    name: 'Test Entity',
    value: 42,
    createdAt: new Date(),
    ...overrides
  }),

  // Generate array of test entities
  generateEntities: (count, generator = null) => {
    const entities = [];
    for (let i = 0; i < count; i++) {
      const entity = generator
        ? generator(i)
        : global.testUtils.generateEntity({ name: `Entity ${i}` });
      entities.push(entity);
    }
    return entities;
  },

  // Wait for a condition to be true (polling)
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('Condition not met within timeout');
  }
};

// Console output for integration test start
console.log('🔗 Integration Test Setup Complete');
console.log('   - Mock services initialized');
console.log('   - Test utilities loaded');
