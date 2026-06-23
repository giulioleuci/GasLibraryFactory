/**
 * Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.
 * @class
 */
export class DynamicFieldMapping {
  /**
   * Initializes mapping configuration with schema providers and transformation logic.
   * @param {Object} config Configuration metadata.
   * @param {string} config.propertyName Entity attribute identifier (target Map).
   * @param {Function} config.schemaProvider Returns array of keys defining the dynamic schema.
   * @param {Function} config.columnPattern Resolves database column names for a given schema key.
   * @param {Function} config.aggregate Consolidates multiple row columns into a single entity value.
   * @param {Function} config.expand Decomposes an aggregated value back into individual column updates.
   * @param {Object} [config.logger] Diagnostic output interface.
   */
  constructor(config) {
    this.propertyName = config.propertyName;
    this.schemaProvider = config.schemaProvider;
    this.columnPattern = config.columnPattern;
    this.aggregate = config.aggregate;
    this.expand = config.expand;
    this.logger = config.logger || console;

    // Validate configuration
    this._validate();
  }

  /**
   * Enforces structural integrity of the mapping configuration.
   * @private
   * @throws {Error} If required configuration properties or transform functions are missing.
   */
  _validate() {
    if (!this.propertyName || typeof this.propertyName !== 'string') {
      throw new Error('DynamicFieldMapping: propertyName must be a non-empty string');
    }
    if (!this.schemaProvider || typeof this.schemaProvider !== 'function') {
      throw new Error('DynamicFieldMapping: schemaProvider must be a function');
    }
    if (!this.columnPattern || typeof this.columnPattern !== 'function') {
      throw new Error('DynamicFieldMapping: columnPattern must be a function');
    }
    if (!this.aggregate || typeof this.aggregate !== 'function') {
      throw new Error('DynamicFieldMapping: aggregate must be a function');
    }
    if (!this.expand || typeof this.expand !== 'function') {
      throw new Error('DynamicFieldMapping: expand must be a function');
    }
  }

  /**
   * Transforms raw database row data into an aggregated entity Map property.
   * @param {Object} row Raw persistence data record.
   * @returns {Map<string, *>} Aggregated domain attribute state.
   */
  hydrate(row) {
    const resultMap = new Map();

    try {
      // Get schema keys (e.g., ['MATH', 'HIST'])
      const schemaKeys = this.schemaProvider();

      if (!Array.isArray(schemaKeys)) {
        this.logger.warn(
          `DynamicFieldMapping: schemaProvider for '${this.propertyName}' did not return an array`
        );
        return resultMap;
      }

      // For each schema key, aggregate the corresponding columns
      for (const key of schemaKeys) {
        const columns = this.columnPattern(key);
        const aggregatedValue = this.aggregate(row, key, columns);

        // Only add to map if the aggregated value is not null/undefined
        if (aggregatedValue !== null && aggregatedValue !== undefined) {
          resultMap.set(key, aggregatedValue);
        }
      }
    } catch (error) {
      this.logger.error(
        `DynamicFieldMapping: Error during hydration of '${this.propertyName}': ${error.message}`
      );
      throw error;
    }

    return resultMap;
  }

  /**
   * Flattens an entity Map property back into individual database column values.
   * @param {Map<string, *>} mapValue Aggregated domain attribute state.
   * @returns {Object.<string, *>} Flattened persistence data record.
   */
  dehydrate(mapValue) {
    const result = {};

    if (!mapValue || !(mapValue instanceof Map)) {
      this.logger.warn(
        `DynamicFieldMapping: Expected Map for '${this.propertyName}', got ${typeof mapValue}`
      );
      return result;
    }

    try {
      // For each entry in the Map, expand back to columns
      for (const [key, value] of mapValue.entries()) {
        const columns = this.columnPattern(key);
        const expandedColumns = this.expand(value, key, columns);

        // Merge expanded columns into result
        Object.assign(result, expandedColumns);
      }
    } catch (error) {
      this.logger.error(
        `DynamicFieldMapping: Error during dehydration of '${this.propertyName}': ${error.message}`
      );
      throw error;
    }

    return result;
  }

  /**
   * Identifies every database column consumed or produced by this dynamic mapping.
   * @returns {string[]} Collection of physical column names.
   */
  getColumnNames() {
    try {
      const schemaKeys = this.schemaProvider();
      const columnNames = [];

      for (const key of schemaKeys) {
        const columns = this.columnPattern(key);
        // columns can be an object like { main: 'MATH', assistant: 'MATH.assistant' }
        // Extract all values from the columns object
        if (typeof columns === 'object') {
          columnNames.push(...Object.values(columns));
        } else {
          columnNames.push(columns);
        }
      }

      return columnNames;
    } catch (error) {
      this.logger.error(
        `DynamicFieldMapping: Error getting column names for '${this.propertyName}': ${error.message}`
      );
      return [];
    }
  }
}
