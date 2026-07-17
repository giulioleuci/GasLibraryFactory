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
   * Saves an object as JSON in a script property.
   *
   * ## Behavior
   *
   * 1. Serializes the object to JSON using `JSON.stringify()`
   * 2. Stores the JSON string via `setProperty()`
   * 3. Logs the operation at DEBUG level
   * 4. Date objects are automatically converted to ISO 8601 strings
   *
   * ## Date Handling
   *
   * Date objects are automatically serialized to ISO 8601 format:
   * ```javascript
   * const state = {
   *   createdAt: new Date('2024-12-13T10:00:00Z')
   * };
   * // Stored as: { "createdAt": "2024-12-13T10:00:00.000Z" }
   * ```
   *
   * When loaded via `getObjectProperty()`, the date string is automatically
   * converted back to a Date object thanks to the `_dateReviver()` function.
   *
   * ## JSON Serialization Limitations
   *
   * Be aware of JSON.stringify() limitations:
   * - **Functions**: Not serialized (silently omitted)
   * - **undefined values**: Omitted from objects, converted to `null` in arrays
   * - **Symbol keys**: Ignored
   * - **Circular references**: Throws TypeError
   * - **Special objects**: RegExp, Map, Set, etc. serialized as `{}` or `null`
   *
   * ## Size Limitations
   *
   * - **Maximum property size**: 9 KB (9,216 bytes)
   * - If JSON exceeds this, consider:
   *   - Splitting data across multiple properties
   *   - Using CacheService for temporary large data
   *   - Storing only essential state
   *
   * ## Typical Use Cases (JobRunnerLib Integration)
   *
   * 1. **Job State Persistence**:
   *    - Job progress checkpoints
   *    - Resume data for long-running operations
   *    - Error tracking
   *
   * 2. **Configuration Objects**:
   *    - Complex application settings
   *    - User preferences
   *    - Feature flags with metadata
   *
   * 3. **Metadata Storage**:
   *    - Circuit breaker state (GasResilienceLib)
   *    - Cache invalidation timestamps
   *    - Quota tracking details
   *
   * @param {string} key - The property key. Convention: Use colons for namespacing.
   * @param {Object} object - The object to serialize and save. Must be JSON-serializable.
   *   Date objects are automatically handled.
   *
   * @throws {TypeError} If object contains circular references
   * @throws {Error} If JSON exceeds 9 KB limit
   * @throws {Error} If JSON.stringify() fails for any reason
   * @throws {Error} If GAS PropertiesService operation fails
   *
   * @see {@link getObjectProperty} to load and deserialize the object
   * @see {@link setProperty} for storing simple string values
   *
   * @example
   * // Store configuration object
   * const properties = new PropertiesService(logger);
   * properties.setObjectProperty('app:config', {
   *   theme: 'dark',
   *   language: 'en',
   *   notifications: true,
   *   maxRetries: 3
   * });
   *
   * @example
   * // JobRunnerLib state persistence pattern
   * const jobState = {
   *   jobId: 'import-2024-12',
   *   status: 'RUNNING',
   *   currentIndex: 1500,
   *   totalItems: 10000,
   *   startedAt: new Date(),              // Automatically converted to ISO 8601
   *   lastUpdate: new Date(),              // Automatically converted to ISO 8601
   *   errors: []
   * };
   * properties.setObjectProperty('job:importTask', jobState);
   *
   * @example
   * // Store array of objects
   * const recentErrors = [
   *   { timestamp: new Date(), message: 'Timeout', code: 'ETIMEDOUT' },
   *   { timestamp: new Date(), message: 'Rate limit', code: 'RATE_LIMIT' }
   * ];
   * properties.setObjectProperty('errors:recent', recentErrors);
   *
   * @example
   * // ❌ WRONG: Circular references throw error
   * const circular = { name: 'test' };
   * circular.self = circular;
   * properties.setObjectProperty('bad', circular);  // TypeError: Converting circular structure to JSON
   *
   * @example
   * // ❌ WRONG: Functions are silently omitted
   * const withFunction = {
   *   name: 'test',
   *   handler: function() { return 42; }
   * };
   * properties.setObjectProperty('config', withFunction);
   * const loaded = properties.getObjectProperty('config');
   * console.log(loaded.handler);  // undefined - function not serialized!
   *
   * @example
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
   * Loads and deserializes an object from a JSON property.
   *
   * ## Behavior
   *
   * 1. Retrieves the JSON string via `getProperty()`
   * 2. Returns `null` immediately if property doesn't exist
   * 3. Deserializes JSON using `JSON.parse()` with `_dateReviver()`
   * 4. **Automatic Date Revival**: ISO 8601 date strings converted to Date objects
   * 5. Returns `null` (not throws) if JSON parsing fails
   * 6. Logs the operation at DEBUG level
   *
   * ## Date Revival (Critical for JobRunnerLib)
   *
   * This method automatically converts ISO 8601 date strings back to Date objects:
   *
   * ```javascript
   * // Stored JSON: { "startedAt": "2024-12-13T10:00:00.000Z" }
   * const state = properties.getObjectProperty('job:state');
   * console.log(state.startedAt instanceof Date);  // true ✅
   * console.log(state.startedAt.getFullYear());    // 2024 ✅
   * ```
   *
   * **Why This Matters**: JobRunnerLib stores Date objects in job state. Without
   * automatic date revival, resumed jobs would crash when trying to call Date methods
   * on string values.
   *
   * ## Error Handling (Graceful Degradation)
   *
   * Unlike `setObjectProperty()`, this method does NOT throw on errors:
   * - **Property doesn't exist**: Returns `null`
   * - **Invalid JSON**: Logs error and returns `null`
   * - **Corrupt data**: Logs error and returns `null`
   *
   * This graceful degradation prevents job crashes when property data is corrupt.
   *
   * ## Return Value
   *
   * - **Success**: Returns the deserialized object (with dates revived)
   * - **Property missing**: Returns `null`
   * - **JSON invalid**: Returns `null` (logs error)
   * - **Parse error**: Returns `null` (logs error)
   *
   * ## Performance
   *
   * - **Read + parse**: ~30-70ms depending on JSON size
   * - **Date revival**: Adds ~1-5ms per date string
   *
   * @param {string} key - The property key to retrieve.
   *
   * @returns {Object|null} The deserialized object with automatic date revival,
   *   or `null` if the property doesn't exist or JSON parsing fails.
   *   Date strings in ISO 8601 format are automatically converted to Date objects.
   *
   * @see {@link setObjectProperty} to serialize and store objects
   * @see {@link _dateReviver} for date conversion implementation details
   * @see {@link getScriptPropertyJSON} for backward compatibility alias
   *
   * @example
   * // Load configuration object
   * const properties = new PropertiesService(logger);
   * const config = properties.getObjectProperty('app:config');
   * if (config) {
   *   console.log(`Theme: ${config.theme}`);
   *   console.log(`Language: ${config.language}`);
   * } else {
   *   console.log('Configuration not found or invalid');
   * }
   *
   * @example
   * // JobRunnerLib resume pattern (with automatic date revival)
   * const jobState = properties.getObjectProperty('job:importTask');
   * if (jobState && jobState.status === 'RUNNING') {
   *   // Dates are automatically revived - safe to call Date methods!
   *   const elapsedMs = Date.now() - jobState.startedAt.getTime();  // ✅ Works!
   *   console.log(`Resuming job after ${elapsedMs}ms`);
   *   console.log(`Progress: ${jobState.currentIndex}/${jobState.totalItems}`);
   * }
   *
   * @example
   * // Graceful degradation on missing property
   * const state = properties.getObjectProperty('job:nonExistent');
   * console.log(state);  // null - no error thrown
   *
   * @example
   * // Graceful degradation on corrupt JSON
   * properties.setProperty('corrupt', '{invalid json}');
   * const corrupt = properties.getObjectProperty('corrupt');
   * console.log(corrupt);  // null - error logged but not thrown
   *
   * @example
   * // Date revival demonstration
   * const saved = {
   *   createdAt: new Date('2024-12-13T10:00:00Z'),
   *   updatedAt: new Date('2024-12-13T11:00:00Z'),
   *   name: 'test'
   * };
   * properties.setObjectProperty('demo', saved);
   *
   * const loaded = properties.getObjectProperty('demo');
   * console.log(loaded.createdAt instanceof Date);    // true ✅
   * console.log(loaded.createdAt.getFullYear());      // 2024 ✅
   * console.log(loaded.createdAt.toISOString());      // "2024-12-13T10:00:00.000Z" ✅
   *
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
   * JSON reviver function that automatically detects and converts ISO 8601 date strings
   * back to native Date objects during deserialization.
   *
   * ## Purpose
   *
   * When objects containing Date instances are serialized with `JSON.stringify()`,
   * dates are converted to ISO 8601 strings. Without automatic revival, loading
   * these objects would return strings instead of Date objects, causing crashes
   * when code tries to call Date methods.
   *
   * ## Algorithm
   *
   * 1. Check if value is a string
   * 2. Test against ISO 8601 regex: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/`
   * 3. Attempt to create Date object
   * 4. Validate the Date is not Invalid Date
   * 5. Return Date object or original value
   *
   * ## Supported Date Formats
   *
   * Detects and converts these ISO 8601 variants:
   * - `"2024-12-13T10:00:00.000Z"` (with milliseconds + Z)
   * - `"2024-12-13T10:00:00Z"` (without milliseconds + Z)
   * - `"2024-12-13T10:00:00.000"` (with milliseconds, no Z)
   * - `"2024-12-13T10:00:00"` (without milliseconds or Z)
   *
   * ## Non-Date Strings
   *
   * Regular strings are not affected:
   * - `"hello"` → `"hello"` (unchanged)
   * - `"2024-12-13"` → `"2024-12-13"` (no 'T', not converted)
   * - `"invalid date"` → `"invalid date"` (doesn't match pattern)
   *
   * ## Integration
   *
   * This method is used automatically by `getObjectProperty()`:
   * ```javascript
   * JSON.parse(jsonString, this._dateReviver)
   * ```
   *
   * ## Why JobRunnerLib Needs This
   *
   * JobRunnerLib stores execution timestamps in job state:
   * ```javascript
   * const state = {
   *   startedAt: new Date(),
   *   lastUpdate: new Date()
   * };
   * ```
   *
   * Without date revival, resumed jobs would crash:
   * ```javascript
   * // ❌ WITHOUT date revival:
   * const resumed = properties.getObjectProperty('job:state');
   * resumed.startedAt.getTime();  // TypeError: resumed.startedAt.getTime is not a function
   *
   * // ✅ WITH date revival:
   * const resumed = properties.getObjectProperty('job:state');
   * resumed.startedAt.getTime();  // Works! Returns timestamp
   * ```
   *
   * @private
   *
   * @param {string} key - The property key being parsed (unused, required by JSON.parse signature)
   * @param {*} value - The value being parsed
   *
   * @returns {*} The value, converted to a Date object if it's a valid ISO 8601 string,
   *   otherwise the original value unchanged.
   *
   * @example
   * // Automatic date revival during getObjectProperty()
   * const saved = { timestamp: new Date('2024-12-13T10:00:00Z') };
   * properties.setObjectProperty('test', saved);
   * // Stored as: { "timestamp": "2024-12-13T10:00:00.000Z" }
   *
   * const loaded = properties.getObjectProperty('test');
   * console.log(typeof loaded.timestamp);              // "object"
   * console.log(loaded.timestamp instanceof Date);     // true ✅
   * console.log(loaded.timestamp.toISOString());       // "2024-12-13T10:00:00.000Z"
   *
   * @example
   * // Regular strings are not affected
   * const saved = {
   *   isoString: '2024-12-13T10:00:00.000Z',  // Looks like ISO 8601
   *   regularString: 'hello',                  // Regular string
   *   dateString: '2024-12-13'                 // Date but no time (not converted)
   * };
   * properties.setObjectProperty('test', saved);
   *
   * const loaded = properties.getObjectProperty('test');
   * console.log(loaded.isoString instanceof Date);      // true (converted)
   * console.log(typeof loaded.regularString);           // "string" (unchanged)
   * console.log(typeof loaded.dateString);              // "string" (unchanged - no 'T')
   *
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
   * Loads an object from a JSON property (alias for getObjectProperty).
   * This method provides compatibility with test helpers.
   * @param {string} key - The property key
   * @returns {Object|null} The deserialized object or null if it doesn't exist or is invalid
   * @example
   * const state = properties.getScriptPropertyJSON('job:myJob');
   */
  getScriptPropertyJSON(key) {
    return this.getObjectProperty(key);
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
