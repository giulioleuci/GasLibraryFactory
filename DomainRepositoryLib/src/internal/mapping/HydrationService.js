import { EntityMapper } from './EntityMapper.js';
import { LoggerService } from '@CoreUtilsLib';

/**
 * Orchestrator for transforming persistence data records into domain Entity instances and vice versa.
 * @class
 */
export class HydrationService {
  /**
   * Initializes hydration service with specialized mapper and diagnostic dependencies.
   * @param {Object|null} [entityMapper=null] Transformation engine instance.
   * @param {Object|null} [logger=null] Optional diagnostic logger.
   */
  constructor(entityMapper = null, logger = null) {
    this.logger = logger || new LoggerService();
    this.entityMapper = entityMapper || new EntityMapper(this.logger);
  }

  /**
   * Reconstitutes a single domain Entity from a raw data record.
   * @param {Object} data Raw persistence data record.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object} Hydrated domain entity instance.
   */
  hydrate(data, EntityClass) {
    return this.entityMapper.fromData(data, EntityClass);
  }

  /**
   * Reconstitutes a collection of domain Entities from a list of data records.
   * @param {Array<Object>} dataArray Collection of raw records.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Array<Object>} Collection of hydrated domain entities.
   */
  hydrateMany(dataArray, EntityClass) {
    return this.entityMapper.fromDataArray(dataArray, EntityClass);
  }

  /**
   * Reduces a domain Entity instance into a plain data record for persistence.
   * @param {Object} entity Domain entity instance.
   * @returns {Object} Persistence-ready data record.
   */
  dehydrate(entity) {
    return this.entityMapper.toData(entity);
  }

  /**
   * Reduces a collection of domain Entities into persistence-ready data records.
   * @param {Array<Object>} entities Collection of domain entities.
   * @returns {Array<Object>} Collection of plain data records.
   */
  dehydrateMany(entities) {
    return this.entityMapper.toDataArray(entities);
  }

  /**
   * Records the baseline state on an entity instance to enable change detection.
   * @param {Object} entity Target domain entity.
   * @param {Object} data Baseline state record.
   */
  storeOriginalData(entity, data) {
    if (entity && typeof entity.storeOriginalData === 'function') {
      entity.storeOriginalData(data);
    }
  }

  /**
   * Resets the modification tracking registry on the specified entity.
   * @param {Object} entity Target domain entity.
   */
  clearDirtyFields(entity) {
    if (entity && typeof entity.clearDirtyFields === 'function') {
      entity.clearDirtyFields();
    }
  }

  /**
   * Synchronizes an existing entity instance with new data while maintaining object identity.
   * @param {Object} entity Target domain entity instance.
   * @param {Object} data Fresh state data for synchronization.
   */
  refresh(entity, data) {
    if (!entity || !data) {
      return;
    }

    // Copy properties from data to entity
    const keys = Object.keys(data);
    for (const key of keys) {
      if (key in entity) {
        entity[key] = data[key];
      }
    }

    // Store new original data and clear dirty fields
    this.storeOriginalData(entity, data);
    this.clearDirtyFields(entity);
  }
}
