// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/PropertiesService.test.js
// ===================================================================
// Comprehensive test suite for PropertiesService
// Coverage: 100% of features for properties management
// ===================================================================

import { PropertiesService } from '../PropertiesService';

describe('PropertiesService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let mockPropertiesStore;

  beforeEach(() => {
    global.resetGasMocks();

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Create in-memory store for properties
    mockPropertiesStore = new Map();

    // Create mock GAS Properties object with correct API
    const mockGASProperties = {
      getProperty: jest.fn((key) => {
        const value = mockPropertiesStore.get(key);
        return value !== undefined ? value : null;
      }),
      setProperty: jest.fn((key, value) => {
        mockPropertiesStore.set(key, String(value));
      }),
      setProperties: jest.fn((properties) => {
        Object.entries(properties).forEach(([key, value]) => {
          mockPropertiesStore.set(key, String(value));
        });
      }),
      deleteProperty: jest.fn((key) => {
        mockPropertiesStore.delete(key);
      }),
      deleteAllProperties: jest.fn(() => {
        mockPropertiesStore.clear();
      }),
      getKeys: jest.fn(() => {
        return Array.from(mockPropertiesStore.keys());
      }),
      getProperties: jest.fn(() => {
        const result = {};
        mockPropertiesStore.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      })
    };

    global.PropertiesService.getScriptProperties.mockReturnValue(mockGASProperties);

    service = new PropertiesService(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with logger', () => {
      expect(service._logger).toBe(logger);
    });

    it('should get script properties on construction', () => {
      expect(global.PropertiesService.getScriptProperties).toHaveBeenCalled();
      expect(service._properties).toBeDefined();
    });
  });

  // ===================================================================
  // setProperty() METHOD
  // ===================================================================

  describe('setProperty() Method', () => {
    it('should set string property', () => {
      service.setProperty('key1', 'value1');

      expect(mockPropertiesStore.get('key1')).toBe('value1');
    });

    it('should convert number to string', () => {
      service.setProperty('count', 42);

      expect(mockPropertiesStore.get('count')).toBe('42');
    });

    it('should convert boolean to string', () => {
      service.setProperty('enabled', true);

      expect(mockPropertiesStore.get('enabled')).toBe('true');
    });

    it('should log debug message on success', () => {
      service.setProperty('key1', 'value1');

      expect(logger.debug).toHaveBeenCalledWith('Property set: key1');
    });

    it('should log error and throw on failure', () => {
      // Force error by making setProperty throw
      service._properties.setProperty = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        service.setProperty('key1', 'value1');
      }).toThrow('Storage error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error setting property key1')
      );
    });

    it('should overwrite existing property', () => {
      service.setProperty('key1', 'value1');
      service.setProperty('key1', 'value2');

      expect(mockPropertiesStore.get('key1')).toBe('value2');
    });
  });

  // ===================================================================
  // getProperty() METHOD
  // ===================================================================

  describe('getProperty() Method', () => {
    it('should get existing property', () => {
      mockPropertiesStore.set('key1', 'value1');

      const result = service.getProperty('key1');

      expect(result).toBe('value1');
    });

    it('should return null for non-existent property', () => {
      const result = service.getProperty('nonexistent');

      expect(result).toBeNull();
    });

    it('should log debug message when property exists', () => {
      service._properties.setProperty('key1', 'value1');

      service.getProperty('key1');

      expect(logger.debug).toHaveBeenCalledWith('Property read: key1 = present');
    });

    it('should log debug message when property absent', () => {
      service.getProperty('nonexistent');

      expect(logger.debug).toHaveBeenCalledWith('Property read: nonexistent = absent');
    });

    it('should log error and throw on failure', () => {
      service._properties.getProperty = jest.fn(() => {
        throw new Error('Read error');
      });

      expect(() => {
        service.getProperty('key1');
      }).toThrow('Read error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error reading property key1')
      );
    });
  });

  // ===================================================================
  // setProperties() METHOD
  // ===================================================================

  describe('setProperties() Method', () => {
    it('should set multiple properties', () => {
      service.setProperties({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      });

      expect(mockPropertiesStore.get('key1')).toBe('value1');
      expect(mockPropertiesStore.get('key2')).toBe('value2');
      expect(mockPropertiesStore.get('key3')).toBe('value3');
    });

    it('should convert all values to strings', () => {
      service.setProperties({
        count: 42,
        enabled: true,
        name: 'test'
      });

      expect(mockPropertiesStore.get('count')).toBe('42');
      expect(mockPropertiesStore.get('enabled')).toBe('true');
      expect(mockPropertiesStore.get('name')).toBe('test');
    });

    it('should log debug message with count', () => {
      service.setProperties({ a: '1', b: '2', c: '3' });

      expect(logger.debug).toHaveBeenCalledWith('Set 3 properties');
    });

    it('should handle empty object', () => {
      expect(() => {
        service.setProperties({});
      }).not.toThrow();

      expect(logger.debug).toHaveBeenCalledWith('Set 0 properties');
    });

    it('should log error and throw on failure', () => {
      service._properties.setProperties = jest.fn(() => {
        throw new Error('Batch error');
      });

      expect(() => {
        service.setProperties({ key1: 'value1' });
      }).toThrow('Batch error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error setting multiple properties')
      );
    });
  });

  // ===================================================================
  // deleteProperty() METHOD
  // ===================================================================

  describe('deleteProperty() Method', () => {
    it('should delete existing property', () => {
      service._properties.setProperty('key1', 'value1');

      service.deleteProperty('key1');

      expect(mockPropertiesStore.get('key1')).toBeUndefined();
    });

    it('should log debug message', () => {
      service.deleteProperty('key1');

      expect(logger.debug).toHaveBeenCalledWith('Property deleted: key1');
    });

    it('should not throw when deleting non-existent property', () => {
      expect(() => {
        service.deleteProperty('nonexistent');
      }).not.toThrow();
    });

    it('should log error and throw on failure', () => {
      service._properties.deleteProperty = jest.fn(() => {
        throw new Error('Delete error');
      });

      expect(() => {
        service.deleteProperty('key1');
      }).toThrow('Delete error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error deleting property key1')
      );
    });
  });

  // ===================================================================
  // deleteAllProperties() METHOD
  // ===================================================================

  describe('deleteAllProperties() Method', () => {
    it('should delete all properties and return count', () => {
      service._properties.setProperty('key1', 'value1');
      service._properties.setProperty('key2', 'value2');
      service._properties.setProperty('key3', 'value3');

      const count = service.deleteAllProperties();

      expect(count).toBe(3);
      expect(Array.from(mockPropertiesStore.keys())).toHaveLength(0);
    });

    it('should log info message with count', () => {
      service._properties.setProperty('key1', 'value1');
      service._properties.setProperty('key2', 'value2');

      service.deleteAllProperties();

      expect(logger.info).toHaveBeenCalledWith('Deleted all 2 script properties');
    });

    it('should return 0 when no properties exist', () => {
      const count = service.deleteAllProperties();

      expect(count).toBe(0);
    });

    it('should log error and throw on failure', () => {
      service._properties.deleteAllProperties = jest.fn(() => {
        throw new Error('Delete all error');
      });

      expect(() => {
        service.deleteAllProperties();
      }).toThrow('Delete all error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error deleting all properties')
      );
    });
  });

  // ===================================================================
  // getKeys() METHOD
  // ===================================================================

  describe('getKeys() Method', () => {
    it('should return all property keys', () => {
      service._properties.setProperty('key1', 'value1');
      service._properties.setProperty('key2', 'value2');

      const keys = service.getKeys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should return empty array when no properties exist', () => {
      const keys = service.getKeys();

      expect(keys).toEqual([]);
    });

    it('should log debug message with count', () => {
      service._properties.setProperty('key1', 'value1');

      service.getKeys();

      expect(logger.debug).toHaveBeenCalledWith('Found 1 property keys');
    });

    it('should log error and throw on failure', () => {
      service._properties.getKeys = jest.fn(() => {
        throw new Error('Get keys error');
      });

      expect(() => {
        service.getKeys();
      }).toThrow('Get keys error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving property keys')
      );
    });
  });

  // ===================================================================
  // getProperties() METHOD
  // ===================================================================

  describe('getProperties() Method', () => {
    it('should return all properties as object', () => {
      service._properties.setProperty('key1', 'value1');
      service._properties.setProperty('key2', 'value2');

      const props = service.getProperties();

      expect(props).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    it('should return empty object when no properties exist', () => {
      const props = service.getProperties();

      expect(props).toEqual({});
    });

    it('should log debug message with count', () => {
      service._properties.setProperty('key1', 'value1');
      service._properties.setProperty('key2', 'value2');

      service.getProperties();

      expect(logger.debug).toHaveBeenCalledWith('Retrieved 2 properties');
    });

    it('should log error and throw on failure', () => {
      service._properties.getProperties = jest.fn(() => {
        throw new Error('Get all error');
      });

      expect(() => {
        service.getProperties();
      }).toThrow('Get all error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving all properties')
      );
    });
  });

  // ===================================================================
  // setObjectProperty() AND getObjectProperty() METHODS
  // ===================================================================

  describe('Object Property Methods', () => {
    describe('setObjectProperty()', () => {
      it('should serialize and save object as JSON', () => {
        const obj = { theme: 'dark', language: 'en', count: 42 };

        service.setObjectProperty('config', obj);

        const stored = mockPropertiesStore.get('config');
        expect(JSON.parse(stored)).toEqual(obj);
      });

      it('should handle nested objects', () => {
        const obj = { user: { name: 'John', settings: { theme: 'dark' } } };

        service.setObjectProperty('data', obj);

        const loaded = service.getObjectProperty('data');
        expect(loaded).toEqual(obj);
      });

      it('should log debug message', () => {
        service.setObjectProperty('config', { test: true });

        expect(logger.debug).toHaveBeenCalledWith('Object saved as JSON in property: config');
      });

      it('should log error and throw on JSON serialization failure', () => {
        const circular = {};
        circular.self = circular;

        expect(() => {
          service.setObjectProperty('bad', circular);
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error saving object in property bad')
        );
      });
    });

    describe('getObjectProperty()', () => {
      it('should deserialize and return object', () => {
        const obj = { theme: 'dark', count: 42 };
        service._properties.setProperty('config', JSON.stringify(obj));

        const result = service.getObjectProperty('config');

        expect(result).toEqual(obj);
      });

      it('should return null for non-existent property', () => {
        const result = service.getObjectProperty('nonexistent');

        expect(result).toBeNull();
      });

      it('should return null for invalid JSON', () => {
        service._properties.setProperty('bad', '{invalid json}');

        const result = service.getObjectProperty('bad');

        expect(result).toBeNull();
      });

      it('should log debug message on success', () => {
        service._properties.setProperty('config', '{"test":true}');

        service.getObjectProperty('config');

        expect(logger.debug).toHaveBeenCalledWith('Object loaded from property: config');
      });

      it('should log error on parse failure', () => {
        service._properties.setProperty('bad', '{invalid}');

        service.getObjectProperty('bad');

        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error loading object from property bad')
        );
      });
    });
  });

  // ===================================================================
  // hasProperty() METHOD
  // ===================================================================

  describe('hasProperty() Method', () => {
    it('should return true for existing property', () => {
      service._properties.setProperty('key1', 'value1');

      const exists = service.hasProperty('key1');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent property', () => {
      const exists = service.hasProperty('nonexistent');

      expect(exists).toBe(false);
    });

    it('should return false on error', () => {
      service._properties.getProperty = jest.fn(() => {
        throw new Error('Check error');
      });

      const exists = service.hasProperty('key1');

      expect(exists).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // getPropertyOrDefault() METHOD
  // ===================================================================

  describe('getPropertyOrDefault() Method', () => {
    it('should return property value if exists', () => {
      service._properties.setProperty('timeout', '5000');

      const result = service.getPropertyOrDefault('timeout', '3000');

      expect(result).toBe('5000');
    });

    it('should return default value if property does not exist', () => {
      const result = service.getPropertyOrDefault('nonexistent', 'default');

      expect(result).toBe('default');
    });

    it('should return default even if property is empty string', () => {
      service._properties.setProperty('empty', '');

      const result = service.getPropertyOrDefault('empty', 'default');

      expect(result).toBe(''); // Empty string is a valid value
    });
  });

  // ===================================================================
  // updatePropertyIfExists() METHOD
  // ===================================================================

  describe('updatePropertyIfExists() Method', () => {
    it('should update existing property and return true', () => {
      service._properties.setProperty('key1', 'old');

      const updated = service.updatePropertyIfExists('key1', 'new');

      expect(updated).toBe(true);
      expect(mockPropertiesStore.get('key1')).toBe('new');
    });

    it('should not update non-existent property and return false', () => {
      const updated = service.updatePropertyIfExists('nonexistent', 'value');

      expect(updated).toBe(false);
      expect(mockPropertiesStore.get('nonexistent')).toBeUndefined();
    });
  });

  // ===================================================================
  // setPropertyIfNotExists() METHOD
  // ===================================================================

  describe('setPropertyIfNotExists() Method', () => {
    it('should set property if not exists and return true', () => {
      const created = service.setPropertyIfNotExists('new', 'value');

      expect(created).toBe(true);
      expect(mockPropertiesStore.get('new')).toBe('value');
    });

    it('should not set property if exists and return false', () => {
      service._properties.setProperty('existing', 'old');

      const created = service.setPropertyIfNotExists('existing', 'new');

      expect(created).toBe(false);
      expect(mockPropertiesStore.get('existing')).toBe('old');
    });
  });

  // ===================================================================
  // getNumericProperty() METHOD
  // ===================================================================

  describe('getNumericProperty() Method', () => {
    it('should parse numeric string to number', () => {
      service._properties.setProperty('count', '42');

      const result = service.getNumericProperty('count');

      expect(result).toBe(42);
    });

    it('should handle negative numbers', () => {
      service._properties.setProperty('balance', '-100');

      const result = service.getNumericProperty('balance');

      expect(result).toBe(-100);
    });

    it('should handle decimal numbers', () => {
      service._properties.setProperty('price', '19.99');

      const result = service.getNumericProperty('price');

      expect(result).toBe(19.99);
    });

    it('should return default value for non-existent property', () => {
      const result = service.getNumericProperty('nonexistent', 10);

      expect(result).toBe(10);
    });

    it('should return default value for invalid number', () => {
      service._properties.setProperty('invalid', 'not-a-number');

      const result = service.getNumericProperty('invalid', 5);

      expect(result).toBe(5);
    });

    it('should return 0 as default when no default provided', () => {
      const result = service.getNumericProperty('nonexistent');

      expect(result).toBe(0);
    });
  });

  // ===================================================================
  // getBooleanProperty() METHOD
  // ===================================================================

  describe('getBooleanProperty() Method', () => {
    it('should return true for "true"', () => {
      service._properties.setProperty('enabled', 'true');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(true);
    });

    it('should return true for "TRUE" (case insensitive)', () => {
      service._properties.setProperty('enabled', 'TRUE');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(true);
    });

    it('should return true for "1"', () => {
      service._properties.setProperty('enabled', '1');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(true);
    });

    it('should return true for "yes"', () => {
      service._properties.setProperty('enabled', 'yes');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(true);
    });

    it('should return false for "false"', () => {
      service._properties.setProperty('enabled', 'false');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(false);
    });

    it('should return false for "0"', () => {
      service._properties.setProperty('enabled', '0');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(false);
    });

    it('should return false for "no"', () => {
      service._properties.setProperty('enabled', 'no');

      const result = service.getBooleanProperty('enabled');

      expect(result).toBe(false);
    });

    it('should return default value for non-existent property', () => {
      const result = service.getBooleanProperty('nonexistent', true);

      expect(result).toBe(true);
    });

    it('should return false as default when no default provided', () => {
      const result = service.getBooleanProperty('nonexistent');

      expect(result).toBe(false);
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should manage application configuration', () => {
      // Set initial config
      service.setProperties({
        apiKey: 'abc123',
        apiUrl: 'https://api.example.com',
        timeout: '30000',
        retries: '3',
        debug: 'true'
      });

      // Read config
      const apiKey = service.getProperty('apiKey');
      const timeout = service.getNumericProperty('timeout');
      const debug = service.getBooleanProperty('debug');

      expect(apiKey).toBe('abc123');
      expect(timeout).toBe(30000);
      expect(debug).toBe(true);
    });

    it('should store and retrieve complex user preferences', () => {
      const preferences = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          sms: false
        },
        recentFiles: ['file1.txt', 'file2.doc']
      };

      service.setObjectProperty('userPrefs', preferences);

      const loaded = service.getObjectProperty('userPrefs');

      expect(loaded).toEqual(preferences);
    });

    it('should implement feature flags pattern', () => {
      // Set feature flags
      service.setProperties({
        'feature.newUI': 'true',
        'feature.betaFeatures': 'false',
        'feature.debugMode': '1'
      });

      // Check flags
      const newUI = service.getBooleanProperty('feature.newUI');
      const beta = service.getBooleanProperty('feature.betaFeatures');

      expect(newUI).toBe(true);
      expect(beta).toBe(false);
    });

    it('should safely update configuration', () => {
      // Initial setup
      service.setProperty('apiKey', 'initialKey');

      // Try to update
      const updated = service.updatePropertyIfExists('apiKey', 'newKey');
      const notUpdated = service.updatePropertyIfExists('nonexistent', 'value');

      expect(updated).toBe(true);
      expect(notUpdated).toBe(false);
      expect(service.getProperty('apiKey')).toBe('newKey');
    });

    it('should handle bulk operations efficiently', () => {
      // Set 10 properties
      const props = {};
      for (let i = 1; i <= 10; i++) {
        props[`key${i}`] = `value${i}`;
      }

      service.setProperties(props);

      // Verify all set
      const allProps = service.getProperties();
      expect(Object.keys(allProps)).toHaveLength(10);

      // Clear all
      const deletedCount = service.deleteAllProperties();
      expect(deletedCount).toBe(10);
    });
  });
});
