/**
 * @file GoogleApiWrapper/src/services/MyPropertiesService.js
 * @description Facade for Google Apps Script's PropertiesService.
 * Provides a clean, testable interface for reading and writing script properties.
 * @version 1.0 - Translated from Italian and refactored for standalone use.
 */

// Access native GAS PropertiesService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativePropertiesService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.PropertiesService (the mock).
function _getNativePropertiesService() {
  return global.__nativePropertiesService__ || global.PropertiesService;
}

/**
 * @class PropertiesService
 * @description Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _properties Native GAS Properties instance.
 */
export class PropertiesService {
  /**
   * @description Initializes PropertiesService with targeted storage scope.
   * @param {LoggerService} logger Diagnostic logger.
   */
  constructor(logger) {
    /**
     * Logger instance for operation logging.
     * @private
     * @type {MyLoggerService}
     */
    this._logger = logger;

    /**
     * Google Apps Script PropertiesService instance.
     * @private
     * @type {GoogleAppsScript.Properties.Properties}
     */
    this._properties = _getNativePropertiesService().getScriptProperties();

    /**
     * Google Apps Script User Properties instance.
     * @private
     * @type {GoogleAppsScript.Properties.Properties}
     */
    this._userProperties = _getNativePropertiesService().getUserProperties();

    /**
     * Google Apps Script Document Properties instance.
     * @private
     * @type {GoogleAppsScript.Properties.Properties}
     */
    this._documentProperties = _getNativePropertiesService().getDocumentProperties();
  }

  /**
   * @description Accesses per-user persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure.
   */
  setUserProperty(key, value) {
    try {
      this._userProperties.setProperty(key, String(value));
      this._logger.debug(`User property set: ${key}`);
    } catch (error) {
      this._logger.error(`Error setting user property ${key}: ${error.message}`);
      throw error;
    }
  }

  getUserProperty(key) {
    try {
      const value = this._userProperties.getProperty(key);
      this._logger.debug(`User property read: ${key} = ${value ? 'present' : 'absent'}`);
      return value;
    } catch (error) {
      this._logger.error(`Error reading user property ${key}: ${error.message}`);
      throw error;
    }
  }

  deleteUserProperty(key) {
    try {
      this._userProperties.deleteProperty(key);
      this._logger.debug(`User property deleted: ${key}`);
    } catch (error) {
      this._logger.error(`Error deleting user property ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Accesses document-bound persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or if script is not container-bound.
   */
  setDocumentProperty(key, value) {
    try {
      if (!this._documentProperties) {
        throw new Error('Document properties not available (script is not container-bound)');
      }
      this._documentProperties.setProperty(key, String(value));
      this._logger.debug(`Document property set: ${key}`);
    } catch (error) {
      this._logger.error(`Error setting document property ${key}: ${error.message}`);
      throw error;
    }
  }

  getDocumentProperty(key) {
    try {
      if (!this._documentProperties) {
        return null;
      }
      const value = this._documentProperties.getProperty(key);
      this._logger.debug(`Document property read: ${key} = ${value ? 'present' : 'absent'}`);
      return value;
    } catch (error) {
      this._logger.error(`Error reading document property ${key}: ${error.message}`);
      throw error;
    }
  }

  deleteDocumentProperty(key) {
    try {
      if (!this._documentProperties) {
        return;
      }
      this._documentProperties.deleteProperty(key);
      this._logger.debug(`Document property deleted: ${key}`);
    } catch (error) {
      this._logger.error(`Error deleting document property ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Accesses global script persistent storage. Auto-converts input to string.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or size limit violation (9KB).
   */
  setProperty(key, value) {
    try {
      this._properties.setProperty(key, String(value));
      this._logger.debug(`Property set: ${key}`);
    } catch (error) {
      this._logger.error(`Error setting property ${key}: ${error.message}`);
      throw error;
    }
  }

  getProperty(key) {
    try {
      const value = this._properties.getProperty(key);
      this._logger.debug(`Property read: ${key} = ${value ? 'present' : 'absent'}`);
      return value;
    } catch (error) {
      this._logger.error(`Error reading property ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Writes multiple properties in a single GAS API call. Optimized for performance (3-5x faster than sequential set).
   * @param {Object<string, string|number|boolean>} properties Map of key-value pairs.
   * @throws {Error} If total size or individual property limits are exceeded.
   */
  setProperties(properties) {
    try {
      // Convert all values to strings
      const stringProperties = {};
      for (const [key, value] of Object.entries(properties)) {
        stringProperties[key] = String(value);
      }

      this._properties.setProperties(stringProperties);
      this._logger.debug(`Set ${Object.keys(properties).length} properties`);
    } catch (error) {
      this._logger.error(`Error setting multiple properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Deletes a single script property. Idempotent.
   * @param {string} key Property identifier.
   * @throws {Error} On storage failure.
   */
  deleteProperty(key) {
    try {
      this._properties.deleteProperty(key);
      this._logger.debug(`Property deleted: ${key}`);
    } catch (error) {
      this._logger.error(`Error deleting property ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Deletes all script properties in current scope. Irreversible.
   * @returns {number} Count of deleted properties.
   */
  deleteAllProperties() {
    try {
      const keys = this._properties.getKeys();
      const numberOfKeys = keys.length;

      this._properties.deleteAllProperties();
      this._logger.info(`Deleted all ${numberOfKeys} script properties`);

      return numberOfKeys;
    } catch (error) {
      this._logger.error(`Error deleting all properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns all property keys in current scope.
   * @returns {string[]}
   */
  getKeys() {
    try {
      const keys = this._properties.getKeys();
      this._logger.debug(`Found ${keys.length} property keys`);
      return keys;
    } catch (error) {
      this._logger.error(`Error retrieving property keys: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns all key-value pairs in current scope.
   * @returns {Object<string, string>}
   */
  getProperties() {
    try {
      const properties = this._properties.getProperties();
      this._logger.debug(`Retrieved ${Object.keys(properties).length} properties`);
      return properties;
    } catch (error) {
      this._logger.error(`Error retrieving all properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Managed JSON storage with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @param {Object} object Entity to serialize.
   * @throws {TypeError} On circular references.
   */
  setObjectProperty(key, object) {
    try {
      const json = JSON.stringify(object);
      this.setProperty(key, json);
      this._logger.debug(`Object saved as JSON in property: ${key}`);
    } catch (error) {
      this._logger.error(`Error saving object in property ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves deserialized entity with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @returns {Object|null} Deserialized entity with revived Date objects.
   */
  getObjectProperty(key) {
    try {
      const json = this.getProperty(key);
      if (!json) {
        return null;
      }

      // Use reviver function to automatically convert ISO 8601 date strings back to Date objects
      const object = JSON.parse(json, this._dateReviver);
      this._logger.debug(`Object loaded from property: ${key}`);
      return object;
    } catch (error) {
      this._logger.error(`Error loading object from property ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * @private
   * @description JSON reviver for ISO 8601 string-to-Date conversion.
   * @param {string} key Current property key.
   * @param {*} value Current property value.
   * @returns {Date|*} Revived Date or original value.
   */
  _dateReviver(key, value) {
    // ISO 8601 date format regex: YYYY-MM-DDTHH:mm:ss.sssZ or similar
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

    if (typeof value === 'string' && isoDateRegex.test(value)) {
      const date = new Date(value);
      // Verify the date is valid (not Invalid Date)
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return value;
  }

  /**
   * @description Checks if a property exists in the current scope.
   * @param {string} key Property identifier.
   * @returns {boolean}
   */
  hasProperty(key) {
    try {
      const value = this._properties.getProperty(key);
      return value !== null;
    } catch (error) {
      this._logger.error(`Error checking property existence ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * @description Retrieves property value with a fallback if missing.
   * @param {string} key Property identifier.
   * @param {string} defaultValue Fallback value.
   * @returns {string}
   */
  getPropertyOrDefault(key, defaultValue) {
    const value = this.getProperty(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * @description Updates a property only if it exists.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value New data.
   * @returns {boolean} True if updated.
   */
  updatePropertyIfExists(key, value) {
    if (this.hasProperty(key)) {
      this.setProperty(key, value);
      return true;
    }
    return false;
  }

  /**
   * @description Creates a property only if it does not exist.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value Data to store.
   * @returns {boolean} True if created.
   */
  setPropertyIfNotExists(key, value) {
    if (!this.hasProperty(key)) {
      this.setProperty(key, value);
      return true;
    }
    return false;
  }

  /**
   * @description Retrieves property value as a number.
   * @param {string} key Property identifier.
   * @param {number} [defaultValue=0] Fallback if missing or NaN.
   * @returns {number}
   */
  getNumericProperty(key, defaultValue = 0) {
    const value = this.getProperty(key);
    if (value === null) {
      return defaultValue;
    }

    const numValue = Number(value);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  /**
   * @description Retrieves property value as a boolean. Maps 'true', '1', 'yes' to true.
   * @param {string} key Property identifier.
   * @param {boolean} [defaultValue=false] Fallback if missing.
   * @returns {boolean}
   */
  getBooleanProperty(key, defaultValue = false) {
    const value = this.getProperty(key);
    if (value === null) {
      return defaultValue;
    }

    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }

  /**
   * Static method providing direct access to native GAS script properties.
   * Preserves backward compatibility with code that calls
   * PropertiesService.getScriptProperties() expecting the native GAS API pattern.
   * @returns {Object} Native GAS script properties
   */
  static getScriptProperties() {
    return _getNativePropertiesService().getScriptProperties();
  }

  /**
   * Static method providing direct access to native GAS user properties.
   * @returns {Object} Native GAS user properties
   */
  static getUserProperties() {
    return _getNativePropertiesService().getUserProperties();
  }

  /**
   * Static method providing direct access to native GAS document properties.
   * @returns {Object} Native GAS document properties
   */
  static getDocumentProperties() {
    return _getNativePropertiesService().getDocumentProperties();
  }
}

// Export alias for backwards compatibility
