import { cloneDeep, LoggerService } from '@CoreUtilsLib';
import { DomainException } from '../errors/DomainException.js';
import { ValueObject } from '../../ValueObject.js';
import { MappingConfiguration } from './MappingConfiguration.js';

/**
 * Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.
 * @class
 */
export class EntityMapper {
  /**
   * Initializes mapper with internal transformation registries and configuration containers.
   * @param {Object|null} [logger=null] Optional diagnostic logger.
   */
  constructor(logger = null) {
    this.logger = logger || new LoggerService();
    this._customTransformers = new Map();
    this._mappingConfig = new MappingConfiguration(this.logger);
  }

  /**
   * Defines custom conversion logic for a specific entity attribute.
   * @param {string} fieldName target domain attribute identifier.
   * @param {Function} toData Transformation logic for persistence (entity -> data).
   * @param {Function} fromData Transformation logic for hydration (data -> entity).
   */
  registerTransformer(fieldName, toData, fromData) {
    this._customTransformers.set(fieldName, { toData, fromData });
  }

  /**
   * Registers a schema-driven strategy for aggregating multiple database columns into an entity Map property.
   * @param {Object} config Dynamic mapping configuration.
   * @returns {this} Chainable mapper instance.
   */
  configureDynamicField(config) {
    this._mappingConfig.addDynamicFieldMapping(config);
    return this;
  }

  /**
   * Registers a strategy for expanding or collapsing individual database properties into a JSON-serialized column.
   * @param {Object} config JSON expansion configuration.
   * @returns {this} Chainable mapper instance.
   */
  configureJsonExpansion(config) {
    this._mappingConfig.addJsonExpansionMapping(config);
    return this;
  }

  /**
   * Retrieves the active mapping configuration container.
   * @returns {MappingConfiguration} current configuration state.
   */
  getMappingConfiguration() {
    return this._mappingConfig;
  }

  /**
   * Converts a domain Entity into a plain data record suitable for persistence, applying all registered transformers and expansions.
   * @param {Object} entity Domain entity to dehydrate.
   * @returns {Object|null} Persistence data record or null if entity is missing.
   */
  toData(entity) {
    if (!entity) {
      return null;
    }

    // If the entity has a toData method, use it; otherwise serialize manually
    const data =
      typeof entity.toData === 'function' ? entity.toData() : this._serializeEntityFields(entity);

    // Apply custom transformers
    for (const [fieldName, transformer] of this._customTransformers) {
      if (fieldName in data) {
        data[fieldName] = transformer.toData(data[fieldName]);
      }
    }

    // Apply dynamic field dehydration (Map → multiple columns)
    this._applyDynamicFieldDehydration(data, entity);

    // Apply JSON expansion dehydration (properties → JSON column)
    this._applyJsonExpansionDehydration(data);

    // Merge back schema-unknown-at-compile-time columns captured at hydration
    // time (see Entity.captureDynamicColumns), for any key the entity's own
    // dehydration steps above did not already produce.
    this._applyDynamicColumnPassthrough(data, entity);

    return data;
  }

  /**
   * Serializes an entity with no `toData()` method by copying its own
   * non-underscore-prefixed properties.
   * @private
   * @param {Object} entity Domain entity to serialize.
   * @returns {Object} Plain data record.
   */
  _serializeEntityFields(entity) {
    const data = {};
    const keys = Object.keys(entity).filter((k) => !k.startsWith('_'));
    for (const key of keys) {
      data[key] = this._serializeValue(entity[key]);
    }
    return data;
  }

  /**
   * Fills in any column captured by `Entity.captureDynamicColumns` that is not
   * already present in `data`, so wide/dynamic-column tables round-trip through
   * `Repository.save()` without the caller hand-building the merged row.
   * @private
   * @param {Object} data target data record (mutated in place).
   * @param {Object} entity source domain entity.
   */
  _applyDynamicColumnPassthrough(data, entity) {
    if (typeof entity.getDynamicColumns !== 'function') {
      return;
    }
    const dynamicColumns = entity.getDynamicColumns();
    for (const [key, value] of Object.entries(dynamicColumns)) {
      if (!(key in data)) {
        data[key] = value;
      }
    }
  }

  /**
   * Recursively reduces complex domain values (ValueObjects, Dates, nested Entities) into serializable primitives.
   * @private
   * @param {*} value domain-layer value to serialize.
   * @returns {*} Persistence-ready value.
   */
  _serializeValue(value) {
    if (value === null || value === undefined) {
      return value;
    }

    // ValueObject
    if (value instanceof ValueObject) {
      return value.getValue();
    }

    // Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Array
    if (Array.isArray(value)) {
      return value.map((item) => this._serializeValue(item));
    }

    // Nested entity
    if (value && typeof value.toData === 'function') {
      return value.toData();
    }

    // Primitive or plain object
    return value;
  }

  /**
   * Reconstitutes a domain Entity from a persistent data record using specified class and registered mappings.
   * @param {Object} data Raw persistence data record.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object|null} Hydrated domain entity or null if data is missing.
   * @throws {DomainException} If EntityClass is not provided.
   */
  fromData(data, EntityClass) {
    if (!data) {
      return null;
    }

    if (!EntityClass) {
      throw new DomainException('EntityClass is required for hydration');
    }

    // Apply custom transformers
    const transformedData = { ...data };
    for (const [fieldName, transformer] of this._customTransformers) {
      if (fieldName in transformedData) {
        transformedData[fieldName] = transformer.fromData(transformedData[fieldName]);
      }
    }

    // Apply JSON expansion hydration (JSON column → properties)
    this._applyJsonExpansionHydration(transformedData);

    // Apply dynamic field hydration (multiple columns → Map)
    this._applyDynamicFieldHydration(transformedData);

    // If the class has a static fromData method, use it; otherwise the constructor
    const entity =
      typeof EntityClass.fromData === 'function'
        ? EntityClass.fromData(transformedData)
        : new EntityClass(transformedData);

    // Opt-in capture of schema-unknown-at-compile-time columns (see
    // Entity.captureDynamicColumns) so save() can round-trip them later.
    if (entity && typeof entity.captureDynamicColumns === 'function') {
      entity.captureDynamicColumns(transformedData);
    }

    return entity;
  }

  /**
   * Batch transforms multiple persistence records into hydrated domain entities.
   * @param {Object[]} dataArray Collection of raw records.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object[]} Collection of hydrated domain entities.
   */
  fromDataArray(dataArray, EntityClass) {
    if (!Array.isArray(dataArray)) {
      return [];
    }
    return dataArray.map((data) => this.fromData(data, EntityClass));
  }

  /**
   * Batch transforms multiple domain entities into persistence records.
   * @param {Object[]} entities Collection of domain entities.
   * @returns {Object[]} Collection of raw persistence records.
   */
  toDataArray(entities) {
    if (!Array.isArray(entities)) {
      return [];
    }
    return entities.map((entity) => this.toData(entity));
  }

  /**
   * Creates a deep structural copy of a persistence data object.
   * @param {Object} data Record to clone.
   * @returns {Object} cloned data record.
   */
  cloneData(data) {
    if (!data) {
      return data;
    }
    return cloneDeep(data);
  }

  /**
   * Executes JSON-to-property expansion mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
  _applyJsonExpansionHydration(data) {
    if (!this._mappingConfig.hasJsonExpansionMappings()) {
      return;
    }

    const mappings = this._mappingConfig.getAllJsonExpansionMappings();

    for (const mapping of mappings) {
      // Hydrate: JSON column → individual properties
      const expandedProperties = mapping.hydrate(data);

      // Add expanded properties to data
      Object.assign(data, expandedProperties);
    }
  }

  /**
   * Executes property-to-JSON collapse mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
  _applyJsonExpansionDehydration(data) {
    if (!this._mappingConfig.hasJsonExpansionMappings()) {
      return;
    }

    const mappings = this._mappingConfig.getAllJsonExpansionMappings();

    for (const mapping of mappings) {
      // Dehydrate: individual properties → JSON column
      const jsonColumn = mapping.dehydrate(data);

      // Add JSON column to data
      Object.assign(data, jsonColumn);

      // Remove the individual properties from data (they're now in JSON)
      for (const prop of mapping.getProperties()) {
        delete data[prop];
      }
    }
  }

  /**
   * Executes multi-column-to-Map aggregation mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
  _applyDynamicFieldHydration(data) {
    if (!this._mappingConfig.hasDynamicFieldMappings()) {
      return;
    }

    const mappings = this._mappingConfig.getAllDynamicFieldMappings();

    for (const mapping of mappings) {
      // Hydrate: multiple columns → Map
      const mapValue = mapping.hydrate(data);

      // Add Map property to data
      data[mapping.propertyName] = mapValue;
    }
  }

  /**
   * Executes Map-to-multi-column decomposition mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   * @param {Object} entity source domain entity for Map extraction.
   */
  _applyDynamicFieldDehydration(data, entity) {
    if (!this._mappingConfig.hasDynamicFieldMappings()) {
      return;
    }

    const mappings = this._mappingConfig.getAllDynamicFieldMappings();

    for (const mapping of mappings) {
      // Get the Map value from the entity
      const mapValue = entity[mapping.propertyName];

      if (mapValue) {
        // Dehydrate: Map → multiple columns
        const expandedColumns = mapping.dehydrate(mapValue);

        // Add expanded columns to data
        Object.assign(data, expandedColumns);

        // Remove the Map property from data (it's now expanded to columns)
        delete data[mapping.propertyName];
      }
    }
  }
}
