/**
 * Configuration for JSON-expanded property mapping.
 * Enables expanding a single JSON column into multiple first-class entity properties.
 *
 * @class
 */
export class JsonExpansionMapping {
  /**
   * Initializes expansion mapping with target column and constituent property keys.
   * @param {Object} config Configuration metadata.
   * @param {string} config.column physical database column containing JSON.
   * @param {Array<string>} config.properties Collection of keys to extract from or collapse into the JSON string.
   * @param {Object} [config.logger] Diagnostic output interface.
   */
  constructor(config) {
    this.column = config.column;
    this.properties = config.properties;
    this.logger = config.logger || console;

    // Validate configuration
    this._validate();
  }

  /**
   * Enforces structural integrity of the expansion mapping configuration.
   * @private
   * @throws {Error} If column identifier is missing or properties list is invalid.
   */
  _validate() {
    if (!this.column || typeof this.column !== 'string') {
      throw new Error('JsonExpansionMapping: column must be a non-empty string');
    }
    if (!Array.isArray(this.properties) || this.properties.length === 0) {
      throw new Error('JsonExpansionMapping: properties must be a non-empty array');
    }
    for (const prop of this.properties) {
      if (typeof prop !== 'string') {
        throw new Error('JsonExpansionMapping: all properties must be strings');
      }
    }
  }

  /**
   * Parses JSON from the target column and expands constituent keys into individual object properties.
   * @param {Object} row Raw persistence data record.
   * @returns {Object} Extracted properties map.
   */
  hydrate(row) {
    const result = {};

    try {
      const jsonValue = row[this.column];

      // Handle null/undefined/empty
      if (!jsonValue) {
        // Initialize all properties to null
        for (const prop of this.properties) {
          result[prop] = null;
        }
        return result;
      }

      // Parse JSON if it's a string
      let parsedData;
      if (typeof jsonValue === 'string') {
        try {
          parsedData = JSON.parse(jsonValue);
        } catch (parseError) {
          this.logger.warn(
            `JsonExpansionMapping: Failed to parse JSON from column '${this.column}': ${parseError.message}`
          );
          // Initialize all properties to null on parse error
          for (const prop of this.properties) {
            result[prop] = null;
          }
          return result;
        }
      } else if (typeof jsonValue === 'object') {
        // Already an object (might happen in some contexts)
        parsedData = jsonValue;
      } else {
        this.logger.warn(
          `JsonExpansionMapping: Unexpected type for column '${this.column}': ${typeof jsonValue}`
        );
        // Initialize all properties to null
        for (const prop of this.properties) {
          result[prop] = null;
        }
        return result;
      }

      // Extract each configured property
      for (const prop of this.properties) {
        result[prop] = parsedData[prop] !== undefined ? parsedData[prop] : null;
      }
    } catch (error) {
      this.logger.error(
        `JsonExpansionMapping: Error during hydration of column '${this.column}': ${error.message}`
      );
      throw error;
    }

    return result;
  }

  /**
   * Collapses individual entity properties back into a single JSON-serialized string for the target column.
   * @param {Object} entityData Attributes containing expanded properties.
   * @returns {Object} Object containing the serialized JSON column.
   */
  dehydrate(entityData) {
    const result = {};

    try {
      const jsonObject = {};

      // Collect all configured properties into a JSON object
      for (const prop of this.properties) {
        if (prop in entityData) {
          const value = entityData[prop];
          // Only include non-null/non-undefined values
          if (value !== null && value !== undefined) {
            jsonObject[prop] = value;
          }
        }
      }

      // Convert to JSON string
      // If all properties are null/undefined, store empty object as JSON
      result[this.column] =
        Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject) : JSON.stringify({});
    } catch (error) {
      this.logger.error(
        `JsonExpansionMapping: Error during dehydration of column '${this.column}': ${error.message}`
      );
      throw error;
    }

    return result;
  }

  /**
   * Returns the physical database column identifier managed by this mapping.
   * @returns {string} Column name.
   */
  getColumnName() {
    return this.column;
  }

  /**
   * Retrieves the list of entity attribute keys participating in this expansion strategy.
   * @returns {Array<string>} Collection of property names.
   */
  getProperties() {
    return [...this.properties];
  }

  /**
   * Determines if a specific entity property is part of this expansion strategy.
   * @param {string} propertyName Attribute key to verify.
   * @returns {boolean} True if the property is in the constituent list.
   */
  managesProperty(propertyName) {
    return this.properties.includes(propertyName);
  }
}
