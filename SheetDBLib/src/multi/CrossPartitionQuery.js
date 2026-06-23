/**
 * @file SheetDBLib/src/multi/CrossPartitionQuery.js
 * @description Query builder for executing queries across multiple partitions.
 * @version 1.0.0
 */

/**
 * AggregatedResult - Result of a cross-partition query.
 *
 * @typedef {Object} AggregatedResult
 * @property {Object[]} records - All records from all partitions
 * @property {Map<string, Object[]>} partitionResults - Results by partition ID
 * @property {number} totalRecords - Total record count
 * @property {string[]} partitionsQueried - IDs of queried partitions
 * @property {Map<string, Error>} errors - Errors by partition ID (if any)
 * @property {number} executionTime - Total execution time in ms
 */

/**
 * @class CrossPartitionQuery
 * @description Fluent query builder for distributed data retrieval across multiple DatabasePartition instances.
 * Aggregates records into a unified structure, injecting `_partitionId` for data provenance.
 *
 * @example
 * const results = manager.query('INVENTORY')
 *   .fromTag('active')
 *   .select(['sku', 'quantity'])
 *   .where('quantity', '<', 10)
 *   .execute();
 */
export class CrossPartitionQuery {
  /**
   * @param {MultiDatabaseManager} manager - The parent manager coordinating partitions.
   * @param {string} tableName - Target table identifier present across partitions.
   * @throws {Error} If manager is missing or tableName is not a non-empty string.
   */
  constructor(manager, tableName) {
    if (!manager) {
      throw new Error('MultiDatabaseManager is required');
    }
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Table name is required');
    }

    /**
     * Multi-database manager.
     * @type {MultiDatabaseManager}
     * @private
     */
    this._manager = manager;

    /**
     * Table name to query.
     * @type {string}
     * @private
     */
    this._tableName = tableName;

    /**
     * Selected partition IDs.
     * @type {string[]|null}
     * @private
     */
    this._partitionIds = null;

    /**
     * Tag filter.
     * @type {string|null}
     * @private
     */
    this._tag = null;

    /**
     * Multiple tags filter.
     * @type {string[]|null}
     * @private
     */
    this._tags = null;

    /**
     * Tag match mode.
     * @type {'ALL'|'ANY'}
     * @private
     */
    this._tagMatchMode = 'ALL';

    /**
     * Query all partitions flag.
     * @type {boolean}
     * @private
     */
    this._queryAll = false;

    /**
     * Columns to select.
     * @type {string[]|null}
     * @private
     */
    this._columns = null;

    /**
     * Where conditions.
     * @type {Array<{column: string, operator: string, value: *}>}
     * @private
     */
    this._whereConditions = [];

    /**
     * Order by specification.
     * @type {{column: string, direction: 'ASC'|'DESC'}|null}
     * @private
     */
    this._orderBy = null;

    /**
     * Limit count.
     * @type {number|null}
     * @private
     */
    this._limit = null;

    /**
     * Continue on partition errors.
     * @type {boolean}
     * @private
     */
    this._continueOnError = true;
  }

  /**
   * @description Restricts the query to specific partition IDs.
   * @param {string[]} partitionIds - Collection of target partition identifiers.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   * @throws {Error} If partitionIds is not a non-empty array.
   */
  fromPartitions(partitionIds) {
    if (!Array.isArray(partitionIds) || partitionIds.length === 0) {
      throw new Error('Partition IDs must be a non-empty array');
    }
    this._partitionIds = [...partitionIds];
    this._queryAll = false;
    this._tag = null;
    this._tags = null;
    return this;
  }

  /**
   * @description Filters partitions by a single metadata tag.
   * @param {string} tag - Tag identifier.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   * @throws {Error} If tag is not a non-empty string.
   */
  fromTag(tag) {
    if (!tag || typeof tag !== 'string') {
      throw new Error('Tag must be a non-empty string');
    }
    this._tag = tag;
    this._tags = null;
    this._partitionIds = null;
    this._queryAll = false;
    return this;
  }

  /**
   * @description Filters partitions using multiple metadata tags.
   * @param {string[]} tags - Collection of tag identifiers.
   * @param {'ALL'|'ANY'} [matchMode='ALL'] - Logic for matching multiple tags.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   * @throws {Error} If tags is not a non-empty array.
   */
  fromTags(tags, matchMode = 'ALL') {
    if (!Array.isArray(tags) || tags.length === 0) {
      throw new Error('Tags must be a non-empty array');
    }
    this._tags = [...tags];
    this._tagMatchMode = matchMode;
    this._tag = null;
    this._partitionIds = null;
    this._queryAll = false;
    return this;
  }

  /**
   * @description Directs the query to all registered partitions in the configuration.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  fromAll() {
    this._queryAll = true;
    this._partitionIds = null;
    this._tag = null;
    this._tags = null;
    return this;
  }

  /**
   * @description Specifies the collection of columns to retrieve from each partition.
   * @param {string[]} columns - Collection of column identifiers.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  select(columns) {
    this._columns = Array.isArray(columns) ? [...columns] : null;
    return this;
  }

  /**
   * @description Appends a filtering condition to the distributed query.
   * @param {string} column - Target column name.
   * @param {string} operator - Comparison operator (=, !=, >, <, >=, <=, LIKE, IN).
   * @param {*} value - The value to compare against.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  where(column, operator, value) {
    this._whereConditions.push({ column, operator, value });
    return this;
  }

  /**
   * @description Configures global ordering for the final aggregated result set.
   * @param {string} column - Column name to sort by.
   * @param {'ASC'|'DESC'} [direction='ASC'] - Sort direction.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  orderBy(column, direction = 'ASC') {
    this._orderBy = { column, direction };
    return this;
  }

  /**
   * @description Limits the maximum number of records retrieved per partition.
   * @param {number} count - Maximum record count.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  limit(count) {
    this._limit = count;
    return this;
  }

  /**
   * @description Controls execution strategy when a single partition query fails.
   * @param {boolean} continueOnError - If false, the first error terminates the entire query.
   * @returns {CrossPartitionQuery} Current instance for method chaining.
   */
  setContinueOnError(continueOnError) {
    this._continueOnError = Boolean(continueOnError);
    return this;
  }

  /**
   * @description Executes the query across all selected partitions and aggregates results.
   * Records are tagged with `_partitionId` to indicate their source.
   * @returns {AggregatedResult} Combined results, partition map, and execution metadata.
   * @throws {Error} If no partitions match filters or a partition query fails (and continueOnError is false).
   */
  execute() {
    const startTime = Date.now();

    // Determine which partitions to query
    const partitions = this._resolvePartitions();

    if (partitions.length === 0) {
      throw new Error('No partitions selected for cross-partition query');
    }

    /** @type {Object[]} */
    const allRecords = [];
    /** @type {Map<string, Object[]>} */
    const partitionResults = new Map();
    /** @type {Map<string, Error>} */
    const errors = new Map();
    /** @type {string[]} */
    const partitionsQueried = [];

    // Execute query on each partition
    for (const partition of partitions) {
      try {
        const db = this._manager.getPartition(partition.id);
        const records = this._executeOnPartition(db, partition.id);

        partitionResults.set(partition.id, records);
        partitionsQueried.push(partition.id);

        // Add partition ID to each record
        for (const record of records) {
          record._partitionId = partition.id;
          allRecords.push(record);
        }
      } catch (error) {
        errors.set(partition.id, error);
        partitionsQueried.push(partition.id);

        if (!this._continueOnError) {
          throw new Error(
            `Cross-partition query failed on partition ${partition.id}: ${error.message}`
          );
        }
      }
    }

    // Apply global ordering if specified
    if (this._orderBy) {
      const { column, direction } = this._orderBy;
      const multiplier = direction === 'DESC' ? -1 : 1;

      allRecords.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];

        if (aVal === bVal) {
          return 0;
        }
        if (aVal === null || aVal === undefined) {
          return 1;
        }
        if (bVal === null || bVal === undefined) {
          return -1;
        }

        return (aVal < bVal ? -1 : 1) * multiplier;
      });
    }

    return {
      records: allRecords,
      partitionResults,
      totalRecords: allRecords.length,
      partitionsQueried,
      errors,
      executionTime: Date.now() - startTime
    };
  }

  /**
   * @description Alias for execute() to maintain API compatibility for concurrent-style operations.
   * @returns {AggregatedResult} Aggregated query results.
   */
  executeParallel() {
    // GAS is synchronous, so this is the same as execute()
    return this.execute();
  }

  /**
   * @description Resolves active database partitions for cross-partition execution.
   * Evaluates selection criteria in priority: explicit IDs, single tag, multiple tags, or global fallback.
   * @returns {DatabasePartition[]} Array of valid partition instances matching criteria.
   * @private
   */
  _resolvePartitions() {
    const config = this._manager.getConfiguration();

    if (this._partitionIds) {
      return this._partitionIds.reduce((acc, id) => {
        const partition = config.getPartition(id);
        if (partition) {
          acc.push(partition);
        }
        return acc;
      }, []);
    }

    if (this._tag) {
      return config.getPartitionsByTag(this._tag);
    }

    if (this._tags) {
      return config.getPartitionsByTags(this._tags, this._tagMatchMode);
    }

    if (this._queryAll) {
      return config.getAllPartitions();
    }

    // Default to all partitions
    return config.getAllPartitions();
  }

  /**
   * @description Proxy execution for a single partition-level query.
   * Reconstructs and executes a TableService query using the partition's database service.
   * @param {DatabaseService} db Database service instance for the target partition.
   * @param {string} partitionId Unique identifier for the partition.
   * @returns {Object[]} Array of result row objects.
   * @throws {Error} Propagates query execution errors from the underlying partition.
   * @private
   */
  _executeOnPartition(db, partitionId) {
    // Build query using DatabaseService's query builder
    let query = db.select(this._columns).from(this._tableName);

    // Apply where conditions
    for (const condition of this._whereConditions) {
      query = query.where(condition.column, condition.operator, condition.value);
    }

    // Apply order by
    if (this._orderBy) {
      query = query.orderBy(this._orderBy.column, this._orderBy.direction);
    }

    // Apply limit
    if (this._limit) {
      query = query.limit(this._limit);
    }

    return query.execute();
  }

  /**
   * @description Returns a technical summary of the query table and partition targets.
   * @returns {string} Debug string representation.
   */
  toString() {
    let partitionStr = 'all';
    if (this._partitionIds) {
      partitionStr = `[${this._partitionIds.join(', ')}]`;
    } else if (this._tag) {
      partitionStr = `tag:${this._tag}`;
    } else if (this._tags) {
      partitionStr = `tags:${this._tags.join(',')}`;
    }

    return `CrossPartitionQuery[${this._tableName}] from ${partitionStr}`;
  }
}
