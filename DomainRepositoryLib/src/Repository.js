import { EntityNotFoundException } from './internal/errors/EntityNotFoundException.js';
import { DomainException } from './internal/errors/DomainException.js';
import { EntityMapper } from './internal/mapping/EntityMapper.js';
import { HydrationService } from './internal/mapping/HydrationService.js';
import { QueryTranslator } from './internal/query/QueryTranslator.js';
import { LoggerService } from '@CoreUtilsLib';

/**
 * Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.
 * @abstract
 * @class
 */
export class Repository {
  /**
   * Initializes repository with database dependencies and service facades.
   * @param {Object} database SheetDBLib database instance.
   * @param {string} tableName target table identifier.
   * @param {Function} EntityClass Constructor for domain entities.
   * @param {Object|null} [logger] Optional diagnostic logger.
   * @param {Object|null} [cache] Optional hydration cache.
   * @param {Object|null} [exceptionService] Optional resilience engine.
   * @param {Object} [options={}] Configuration overrides.
   * @param {boolean} [options.dryRun=false] Enable simulation mode.
   * @throws {TypeError} If attempting to instantiate the abstract class directly.
   */
  constructor(
    database,
    tableName,
    EntityClass,
    logger = null,
    cache = null,
    exceptionService = null,
    options = {}
  ) {
    if (new.target === Repository) {
      throw new TypeError('Cannot construct Repository instances directly - must use a subclass');
    }

    this.database = database;
    this.tableName = tableName;
    this.EntityClass = EntityClass;
    this.logger = logger || new LoggerService();
    this.cache = cache;
    this.exceptionService = exceptionService;

    /**
     * Global dry-run mode flag.
     * When true, save/delete operations simulate actions without persisting.
     * @private
     * @type {boolean}
     */
    this._dryRun = options.dryRun || false;

    if (this._dryRun) {
      this.logger.info(
        `[DRY-RUN] Repository for ${tableName} initialized in dry-run mode. Changes will not be persisted.`
      );
    }

    // Initialize services
    this.entityMapper = new EntityMapper(this.logger);
    this.hydrationService = new HydrationService(this.entityMapper, this.logger);
    this.queryTranslator = new QueryTranslator(this.logger);

    // Get table reference
    this._table = this._getTable();
  }

  /**
   * Evaluates if operations should be simulated based on instance state or method overrides.
   * @private
   * @param {Object} [options={}] Call-specific options.
   * @returns {boolean} True if simulation mode is active.
   */
  _isDryRun(options = {}) {
    if (typeof options.dryRun === 'boolean') {
      return options.dryRun;
    }
    return this._dryRun;
  }

  /**
   * Resolves the primary table service from the database container.
   * @private
   * @returns {Object} Table interface for persistence operations.
   * @throws {DomainException} If database is invalid or table does not exist.
   */
  _getTable() {
    if (!this.database || !this.database.tables) {
      throw new DomainException(
        'Invalid database instance - must be a SheetDBLib DatabaseService',
        { tableName: this.tableName }
      );
    }

    const table = this.database.tables[this.tableName];
    if (!table) {
      throw new DomainException(`Table "${this.tableName}" not found in database`, {
        tableName: this.tableName
      });
    }

    return table;
  }

  /**
   * Wraps an operation in transient error handling logic if ExceptionService is available.
   * @private
   * @param {Function} operation Logical block to execute.
   * @param {number} [maxRetries=3] Maximum attempt limit.
   * @returns {*} Result of the logical block execution.
   */
  _executeWithRetry(operation, maxRetries = 3) {
    if (this.exceptionService && typeof this.exceptionService.executeWithRetry === 'function') {
      return this.exceptionService.executeWithRetry(operation, {}, maxRetries);
    }
    return operation();
  }

  /**
   * Retrieves all entities satisfying the provided domain specification.
   * @param {Object} specification Criteria for filtering entities.
   * @returns {Array<Object>} Collection of hydrated domain entities.
   * @throws {DomainException} If specification is invalid.
   */
  find(specification) {
    return this._executeWithRetry(() => {
      if (!specification) {
        throw new DomainException('Specification cannot be null or undefined');
      }

      let rows;

      // Validate if specification can be translated to query
      const validation = this.queryTranslator.validate(specification);

      if (validation.valid) {
        // Use database filtering
        const query = this.database.select(['*']).from(this.tableName);
        this.queryTranslator.translate(specification, query);
        rows = query.execute();
      } else {
        // Load all and filter in-memory
        rows = this._table.getAllRows();
        const entities = this.hydrationService.hydrateMany(rows, this.EntityClass);
        return entities.filter((entity) => specification.isSatisfiedBy(entity));
      }

      return this.hydrationService.hydrateMany(rows, this.EntityClass);
    });
  }

  /**
   * Retrieves the first entity satisfying the domain specification.
   * @param {Object} specification Criteria for filtering.
   * @returns {Object|null} First matching entity instance or null.
   */
  findOne(specification) {
    const results = this.find(specification);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Retrieves a single entity by its primary unique identifier with cache-first lookup.
   * @param {string} id Unique entity identifier.
   * @returns {Object|null} Hydrated entity or null if not found.
   */
  findById(id) {
    return this._executeWithRetry(() => {
      // Check cache first
      if (this.cache) {
        const cacheKey = `${this.tableName}:${id}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          const entity = this.hydrationService.hydrate(data, this.EntityClass);
          this.hydrationService.storeOriginalData(entity, data);
          return entity;
        }
      }

      const row = this._table.getByPK(id);
      if (!row) {
        return null;
      }

      // Store in cache
      if (this.cache) {
        const cacheKey = `${this.tableName}:${id}`;
        this.cache.put(cacheKey, JSON.stringify(row), 300); // 5 minutes
      }

      const entity = this.hydrationService.hydrate(row, this.EntityClass);
      this.hydrationService.storeOriginalData(entity, row);
      return entity;
    });
  }

  /**
   * Retrieves entity by ID or throws if non-existent.
   * @param {string} id Unique entity identifier.
   * @returns {Object} Hydrated entity instance.
   * @throws {EntityNotFoundException} If no record matches the identifier.
   */
  findByIdOrFail(id) {
    const entity = this.findById(id);
    if (!entity) {
      throw new EntityNotFoundException(this.EntityClass.name, id);
    }
    return entity;
  }

  /**
   * Retrieves every record from the target table as hydrated entities.
   * @returns {Array<Object>} Collection of all entities in the repository.
   */
  findAll() {
    return this._executeWithRetry(() => {
      const rows = this._table.getAllRows();
      return this.hydrationService.hydrateMany(rows, this.EntityClass);
    });
  }

  /**
   * Verifies if at least one entity satisfies the specified criteria.
   * @param {Object} specification Criteria to test.
   * @returns {boolean} True if any matches are found.
   */
  exists(specification) {
    return this.findOne(specification) !== null;
  }

  /**
   * Returns the total number of entities satisfying the specification.
   * @param {Object} specification Criteria for counting.
   * @returns {number} Count of matching records.
   */
  count(specification) {
    const results = this.find(specification);
    return results.length;
  }

  /**
   * Persists entity state via insertion or update, managing timestamps and dirty tracking.
   * @param {Object} entity Domain entity to persist.
   * @param {Object} [options={}] Operation configuration.
   * @returns {Object} The persisted entity with updated metadata.
   * @throws {ValidationException} If entity fails domain rules.
   */
  save(entity, options = {}) {
    return this._executeWithRetry(() => {
      // Validate entity
      entity.validateOrThrow();

      const data = this.hydrationService.dehydrate(entity);

      // Check for dry-run mode
      if (this._isDryRun(options)) {
        const operation = entity.id ? 'update' : 'insert';
        const simulatedId = entity.id || `dry-run-${Date.now()}`;
        this.logger.info(
          `[DRY-RUN] Would ${operation} ${this.EntityClass.name}${entity.id ? ` with ID: ${entity.id}` : ''}`
        );

        return {
          ...entity,
          id: simulatedId,
          dryRun: true
        };
      }

      if (entity.id) {
        // Update existing entity (TableService will perform dirty checking to skip unnecessary API calls)
        this._table.updateRowById(entity.id, data);
        this.logger.info(`Updated ${this.EntityClass.name} with ID: ${entity.id}`);
      } else {
        // Insert new entity
        const newRow = this._table.insertRow(data);
        entity.id = newRow.id;
        this.logger.info(`Inserted new ${this.EntityClass.name} with ID: ${entity.id}`);
      }

      // Save to database
      this.database.save();

      // Clear dirty fields and store new original data
      this.hydrationService.clearDirtyFields(entity);
      this.hydrationService.storeOriginalData(entity, data);

      // Clear cache if available
      if (this.cache) {
        this._clearCache(entity.id);
      }

      return entity;
    });
  }

  /**
   * Executes batch persistence for multiple entities with bulk-insert optimization for new records.
   * @param {Array<Object>} entities Collection of entities to save.
   * @returns {Array<Object>} Collection of successfully persisted entities.
   */
  saveMany(entities) {
    return this._executeWithRetry(() => {
      // Return early if empty array
      if (!entities || entities.length === 0) {
        return [];
      }

      // Validate all entities first before saving any
      for (const entity of entities) {
        entity.validateOrThrow();
      }

      // OPTIMIZATION: Separate new entities from existing ones
      const newEntities = entities.filter((e) => !e.id);
      const existingEntities = entities.filter((e) => e.id);

      const savedEntities = [];

      // OPTIMIZATION: Use bulk insert for new entities
      if (newEntities.length > 0) {
        const newData = newEntities.map((entity) => this.hydrationService.dehydrate(entity));

        // Use insertRows for bulk insert (single I/O operation)
        const insertedRows = this._table.insertRows(newData);

        // Update entity IDs with generated IDs from insertedRows
        for (let i = 0; i < newEntities.length; i++) {
          const entity = newEntities[i];
          entity.id = insertedRows[i].id;

          // Clear dirty fields and store new original data
          this.hydrationService.clearDirtyFields(entity);
          this.hydrationService.storeOriginalData(entity, insertedRows[i]);

          savedEntities.push(entity);
        }

        this.logger.info(
          `Bulk inserted ${newEntities.length} new ${this.EntityClass.name} entities`
        );
      }

      // Update existing entities individually (can't be easily batched due to different IDs)
      for (const entity of existingEntities) {
        const data = this.hydrationService.dehydrate(entity);
        this._table.updateRowById(entity.id, data);

        // Clear dirty fields and store new original data
        this.hydrationService.clearDirtyFields(entity);
        this.hydrationService.storeOriginalData(entity, data);

        savedEntities.push(entity);
      }

      if (existingEntities.length > 0) {
        this.logger.info(
          `Updated ${existingEntities.length} existing ${this.EntityClass.name} entities`
        );
      }

      // Save to database once
      this.database.save();

      // Clear cache if available
      if (this.cache) {
        for (const entity of savedEntities) {
          this._clearCache(entity.id);
        }
      }

      return savedEntities;
    });
  }

  /**
   * Performs a partial update on specific entity fields, minimizing I/O and API calls.
   * @param {Object} entity Target entity instance (must have ID).
   * @param {Object} changes Set of attributes to modify.
   * @returns {Object} The patched and re-validated entity.
   * @throws {DomainException} If entity lacks a valid identifier.
   */
  patch(entity, changes) {
    return this._executeWithRetry(() => {
      if (!entity.id) {
        throw new DomainException('Cannot patch entity without ID - save it first');
      }

      // Apply changes to entity
      for (const [key, value] of Object.entries(changes)) {
        if (Object.prototype.hasOwnProperty.call(entity, key)) {
          entity[key] = value;
        }
      }

      // Validate entity after applying changes
      entity.validateOrThrow();

      // Use patchRow for efficient sparse update
      const updatedRow = this._table.patchRow(entity.id, changes);

      // Clear dirty fields and store new original data
      this.hydrationService.clearDirtyFields(entity);
      this.hydrationService.storeOriginalData(entity, updatedRow);

      this.logger.info(`Patched ${this.EntityClass.name} with ID: ${entity.id}`);

      // Save to database
      this.database.save();

      // Clear cache if available
      if (this.cache) {
        this._clearCache(entity.id);
      }

      return entity;
    });
  }

  /**
   * Performs partial update on a record identified by its unique ID.
   * @param {string} id Unique entity identifier.
   * @param {Object} changes Set of attributes to modify.
   * @returns {Object} The updated domain entity.
   */
  patchById(id, changes) {
    const entity = this.findByIdOrFail(id);
    return this.patch(entity, changes);
  }

  /**
   * Removes an entity instance from the persistent store.
   * @param {Object} entity Target entity to remove.
   * @throws {DomainException} If entity lacks a valid identifier.
   */
  delete(entity) {
    if (!entity.id) {
      throw new DomainException('Cannot delete entity without ID');
    }
    this.deleteById(entity.id);
  }

  /**
   * Removes a record from the persistent store using its unique identifier.
   * @param {string} id Unique entity identifier.
   */
  deleteById(id) {
    this._executeWithRetry(() => {
      this._table.deleteRowById(id);
      this.database.save();
      this.logger.info(`Deleted ${this.EntityClass.name} with ID: ${id}`);

      // Clear cache if available
      if (this.cache) {
        this._clearCache(id);
      }
    });
  }

  /**
   * Removes multiple entities from the persistent store in a batch operation.
   * @param {Array<Object>} entities Collection of entities to remove.
   */
  deleteMany(entities) {
    this._executeWithRetry(() => {
      // Return early if empty array
      if (!entities || entities.length === 0) {
        return;
      }

      for (const entity of entities) {
        if (!entity.id) {
          throw new DomainException('Cannot delete entity without ID');
        }
        this._table.deleteRowById(entity.id);
      }

      // Save to database once
      this.database.save();
      this.logger.info(`Deleted ${entities.length} ${this.EntityClass.name} entities`);

      // Clear cache if available
      if (this.cache) {
        for (const entity of entities) {
          this._clearCache(entity.id);
        }
      }
    });
  }

  /**
   * Synchronizes entity state with the current data in the persistent store.
   * @param {Object} entity Entity instance to refresh.
   * @returns {Object} The synchronized entity instance.
   * @throws {EntityNotFoundException} If the record no longer exists in the store.
   */
  refresh(entity) {
    if (!entity.id) {
      throw new DomainException('Cannot refresh entity without ID');
    }

    const freshData = this._table.getByPK(entity.id);
    if (!freshData) {
      throw new EntityNotFoundException(this.EntityClass.name, entity.id);
    }

    this.hydrationService.refresh(entity, freshData);
    return entity;
  }

  /**
   * Clears the cache for this repository.
   * @private
   */
  _clearCache(entityId) {
    if (this.cache && typeof this.cache.remove === 'function') {
      if (entityId) {
        const cacheKey = `${this.tableName}:${entityId}`;
        this.cache.remove(cacheKey);
      }
    }
  }

  /**
   * Returns the low-level TableService instance managed by the repository.
   * @returns {Object} Active table service.
   */
  getTable() {
    return this._table;
  }

  /**
   * Returns the entity constructor used by this repository.
   * @returns {Function} Entity class constructor.
   */
  getEntityClass() {
    return this.EntityClass;
  }

  /**
   * Returns the name of the target table in the database.
   * @returns {string} Table identifier.
   */
  getTableName() {
    return this.tableName;
  }
}
