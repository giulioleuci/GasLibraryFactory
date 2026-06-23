import { LoggerService } from '@CoreUtilsLib';
import { DynamicFieldMapping } from './DynamicFieldMapping.js';
import { JsonExpansionMapping } from './JsonExpansionMapping.js';

/**
 * Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.
 * @class
 */
export class MappingConfiguration {
  /**
   * Initializes configuration container with isolated registries for different mapping types.
   * @param {Object|null} [logger] Optional diagnostic logger.
   */
  constructor(logger = null) {
    this.logger = logger || new LoggerService();

    // Map of property name → DynamicFieldMapping
    this._dynamicFieldMappings = new Map();

    // Map of column name → JsonExpansionMapping
    this._jsonExpansionMappings = new Map();
  }

  /**
   * Registers a new dynamic field aggregation strategy.
   * @param {Object|DynamicFieldMapping} config mapping configuration or instance.
   * @returns {this} Chainable configuration instance.
   */
  addDynamicFieldMapping(config) {
    const mapping =
      config instanceof DynamicFieldMapping
        ? config
        : new DynamicFieldMapping({ ...config, logger: this.logger });

    this._dynamicFieldMappings.set(mapping.propertyName, mapping);
    this.logger.debug(
      `MappingConfiguration: Added dynamic field mapping for property '${mapping.propertyName}'`
    );

    return this;
  }

  /**
   * Registers a new JSON property expansion strategy.
   * @param {Object|JsonExpansionMapping} config mapping configuration or instance.
   * @returns {this} Chainable configuration instance.
   */
  addJsonExpansionMapping(config) {
    const mapping =
      config instanceof JsonExpansionMapping
        ? config
        : new JsonExpansionMapping({ ...config, logger: this.logger });

    this._jsonExpansionMappings.set(mapping.column, mapping);
    this.logger.debug(
      `MappingConfiguration: Added JSON expansion mapping for column '${mapping.column}'`
    );

    return this;
  }

  /**
   * Retrieves an aggregation strategy by its target entity property identifier.
   * @param {string} propertyName Entity attribute key.
   * @returns {Object|null} Registered mapping or null.
   */
  getDynamicFieldMapping(propertyName) {
    return this._dynamicFieldMappings.get(propertyName) || null;
  }

  /**
   * Retrieves an expansion strategy by its source database column identifier.
   * @param {string} columnName physical database column.
   * @returns {Object|null} Registered mapping or null.
   */
  getJsonExpansionMapping(columnName) {
    return this._jsonExpansionMappings.get(columnName) || null;
  }

  /**
   * Returns a collection of all active dynamic field aggregation strategies.
   * @returns {Array<Object>} Collection of registered mappings.
   */
  getAllDynamicFieldMappings() {
    return Array.from(this._dynamicFieldMappings.values());
  }

  /**
   * Returns a collection of all active JSON expansion strategies.
   * @returns {Array<Object>} Collection of registered mappings.
   */
  getAllJsonExpansionMappings() {
    return Array.from(this._jsonExpansionMappings.values());
  }

  /**
   * Verifies if any dynamic field strategies are currently registered.
   * @returns {boolean} True if aggregation registry is non-empty.
   */
  hasDynamicFieldMappings() {
    return this._dynamicFieldMappings.size > 0;
  }

  /**
   * Verifies if any JSON expansion strategies are currently registered.
   * @returns {boolean} True if expansion registry is non-empty.
   */
  hasJsonExpansionMappings() {
    return this._jsonExpansionMappings.size > 0;
  }

  /**
   * Purges all mapping strategies from the configuration container.
   */
  clear() {
    this._dynamicFieldMappings.clear();
    this._jsonExpansionMappings.clear();
    this.logger.debug('MappingConfiguration: Cleared all mappings');
  }

  /**
   * Locates the JSON expansion strategy that manages a specific entity property.
   * @param {string} propertyName Entity attribute key.
   * @returns {Object|null} Participating mapping or null.
   */
  findJsonExpansionMappingForProperty(propertyName) {
    for (const mapping of this._jsonExpansionMappings.values()) {
      if (mapping.managesProperty(propertyName)) {
        return mapping;
      }
    }
    return null;
  }
}
