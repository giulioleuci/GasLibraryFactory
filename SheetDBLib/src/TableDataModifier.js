import { isEqual, OperationError } from '@CoreUtilsLib';

/**
 * @class TableDataModifier
 * @description Internal logic engine for mutating SheetDB table data. Handles validation, UUID generation, and write-through cache management.
 */
export class TableDataModifier {
  /**
   * @constructor
   * @param {TableService} facade - Parent service for state synchronization.
   */
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * @function insertRow
   * @description Single row insertion with schema validation.
   * @param {Object} rowObj - Data to insert.
   * @returns {Object|null} The inserted row with generated ID and virtual columns.
   * @throws {Error} On schema violation.
   */
  insertRow(rowObj) {
    const results = this.insertRows([rowObj]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * @function insertRows
   * @description Batch insertion with UUID generation and write-through cache update.
   * @param {Object[]} rowsArray - Multiple data objects.
   * @returns {Object[]} Processed rows added to the queue.
   * @throws {Error} If validation fails for any row.
   */
  insertRows(rowsArray) {
    if (!Array.isArray(rowsArray) || rowsArray.length === 0) {
      this.facade._logger.warn('insertRows called with empty or invalid array');
      return [];
    }

    this.facade._ensureDataLoaded();

    const completeRows = [];
    const physicalColumns = this.facade.columns.filter((col) => !this.facade._virtualColumns[col]);

    // OPTIMIZATION: Process all rows in memory first
    for (const rowObj of rowsArray) {
      // Validate row against schema
      const validatedRow = this.facade.schemaValidator.validateRow(rowObj, false);
      const completeRow = { ...validatedRow };

      // Generate primary key if not present
      if (this.facade._keyField && !completeRow[this.facade._keyField]) {
        completeRow[this.facade._keyField] = this.facade.utils.generateUuid();
      }

      // Apply virtual columns
      this.facade._applyVirtualColumns(completeRow);

      completeRows.push(completeRow);
    }

    try {
      this.facade._logger.debug(
        `Queuing batch insert of ${rowsArray.length} rows for '${this.facade.sheetName}'`
      );

      // BATCH QUEUE: Add rows to queue instead of writing immediately
      this.facade._insertQueue.push(...completeRows);

      this.facade._logger.debug(
        `Successfully queued ${completeRows.length} rows for '${this.facade.sheetName}'`
      );

      // WRITE-THROUGH CACHE: Add all rows to cache instead of invalidating
      this.facade._rowsCache.push(...completeRows);
      // Invalidate processed cache to recompute virtual columns
      this.facade._processedRowsCache = null;
      // Invalidate indices as data changed
      this.facade.searchEngine.invalidateIndex();

      // OPTIMIZATION: Store original row data for dirty checking
      for (const row of completeRows) {
        this.facade._storeOriginalRowData(row);
      }

      return completeRows;
    } catch (e) {
      this.facade._logger.error(
        `Failed to queue batch insert rows in '${this.facade.sheetName}': ${e.message}`
      );
      throw e;
    }
  }

  /**
   * @function updateRowById
   * @description Performs full row update with dirty checking. Skips if data is identical.
   * @param {string|number} id - PK of target row.
   * @param {Object} rowObj - New data state.
   * @returns {Object} The updated row.
   * @throws {OperationError} If ID not found.
   * @throws {Error} On schema violation.
   */
  updateRowById(id, rowObj) {
    this.facade._logger.debug(
      `Starting update of row with ${this.facade._keyField}=${id} in '${this.facade.sheetName}'`
    );

    this.facade._ensureDataLoaded();

    // SDL-M010: Validate row against schema (allow partial updates)
    const validatedRow = this.facade.schemaValidator.validateRow(rowObj, true);

    const targetRowIndex = this.facade._findRowIndexById(id);

    if (targetRowIndex === -1) {
      this.facade._logger.error(
        `No row found with ${this.facade._keyField}=${id} in ${this.facade.sheetName}`
      );
      throw new OperationError(
        `No row found with ${this.facade._keyField}=${id} in ${this.facade.sheetName}`,
        'updateRowById',
        false,
        { keyField: this.facade._keyField, id, sheetName: this.facade.sheetName }
      );
    }

    const originalRow = this.facade._rowsCache[targetRowIndex];
    const rowToUpdate = { ...originalRow, ...validatedRow };

    this.facade._applyVirtualColumns(rowToUpdate);

    const physicalColumns = this.facade.columns.filter((col) => !this.facade._virtualColumns[col]);

    // OPTIMIZATION: Dirty checking - extract physical data for comparison
    const newPhysicalData = {};
    for (const col of physicalColumns) {
      newPhysicalData[col] = rowToUpdate[col] ?? '';
    }

    // OPTIMIZATION: Check if data has actually changed
    const originalData = this.facade._originalRowData.get(id);
    if (originalData && isEqual(originalData, newPhysicalData)) {
      this.facade._logger.debug(`No changes detected for row ${id}, skipping API call`);
      return rowToUpdate;
    }

    // Queue the update instead of writing immediately
    try {
      this.facade._logger.debug(`Queuing update for row ${id} in '${this.facade.sheetName}'`);

      this.facade._updateQueue.set(id, rowToUpdate);
      this.facade._logger.debug(`Row update queued successfully in '${this.facade.sheetName}'`);

      // WRITE-THROUGH CACHE: Update row in cache instead of invalidating
      this.facade._rowsCache[targetRowIndex] = rowToUpdate;
      // Invalidate processed cache to recompute virtual columns
      this.facade._processedRowsCache = null;
      // Invalidate indices as data changed
      this.facade.searchEngine.invalidateIndex();

      return rowToUpdate;
    } catch (e) {
      this.facade._logger.error(
        `Error queuing row update in '${this.facade.sheetName}': ${e.message}`
      );
      throw e;
    }
  }

  /**
   * @function patchRow
   * @description Partial update focusing only on changed physical columns.
   * @param {string|number} id - PK of target row.
   * @param {Object} partialObj - Subset of row data.
   * @returns {Object} The merged updated row.
   * @throws {OperationError} If ID not found.
   */
  patchRow(id, partialObj) {
    this.facade._logger.debug(
      `Starting patch of row with ${this.facade._keyField}=${id} in '${this.facade.sheetName}'`
    );

    this.facade._ensureDataLoaded();

    // Validate partial row against schema (allow partial updates)
    const validatedPartial = this.facade.schemaValidator.validateRow(partialObj, true);

    const targetRowIndex = this.facade._findRowIndexById(id);

    if (targetRowIndex === -1) {
      this.facade._logger.error(
        `No row found with ${this.facade._keyField}=${id} in ${this.facade.sheetName}`
      );
      throw new OperationError(
        `No row found with ${this.facade._keyField}=${id} in ${this.facade.sheetName}`,
        'patchRow',
        false,
        { keyField: this.facade._keyField, id, sheetName: this.facade.sheetName }
      );
    }

    const originalRow = this.facade._rowsCache[targetRowIndex];
    const physicalColumns = this.facade.columns.filter((col) => !this.facade._virtualColumns[col]);

    // OPTIMIZATION: Identify which columns are actually changing
    const changedColumns = [];
    const changedValues = [];

    for (const [key, newValue] of Object.entries(validatedPartial)) {
      // Skip virtual columns (they're computed, not stored)
      if (this.facade._virtualColumns[key]) {
        continue;
      }

      // Skip if column doesn't exist in table schema
      if (!physicalColumns.includes(key)) {
        this.facade._logger.warn(`Column '${key}' not found in table schema, skipping`);
        continue;
      }

      // Check if value actually changed
      const oldValue = originalRow[key];
      if (oldValue !== newValue) {
        changedColumns.push(key);
        changedValues.push(newValue);
      }
    }

    // If nothing changed, return early
    if (changedColumns.length === 0) {
      this.facade._logger.debug(`No changes detected for row ${id}, skipping update`);
      const rowToReturn = { ...originalRow };
      return this.facade._applyVirtualColumns(rowToReturn);
    }

    // OPTIMIZATION: Update only the changed cells
    this.facade._logger.debug(
      `Patching ${changedColumns.length} columns for row ${id}: ${changedColumns.join(', ')}`
    );

    try {
      // BATCH QUEUE: Queue the updated complete row
      const updatedRow = { ...originalRow, ...validatedPartial };
      this.facade._applyVirtualColumns(updatedRow);

      this.facade._updateQueue.set(id, updatedRow);

      this.facade._logger.debug(`Successfully queued patch row in '${this.facade.sheetName}'`);

      // WRITE-THROUGH CACHE: Update cache with new values
      this.facade._rowsCache[targetRowIndex] = updatedRow;
      // Invalidate processed cache to recompute virtual columns
      this.facade._processedRowsCache = null;
      // Invalidate indices as data changed
      this.facade.searchEngine.invalidateIndex();

      return updatedRow;
    } catch (e) {
      this.facade._logger.error(
        `Error queuing patched row in '${this.facade.sheetName}': ${e.message}`
      );
      throw e;
    }
  }

  /**
   * @function deleteRowById
   * @description Queues row for deletion and purges it from local caches.
   * @param {string|number} id - PK of row to remove.
   * @returns {Object|null} The deleted row object or null if not found.
   * @throws {Error} If queueing fails.
   */
  deleteRowById(id) {
    this.facade._logger.debug(
      `Starting deletion of row with ${this.facade._keyField}=${id} in '${this.facade.sheetName}'`
    );

    this.facade._ensureDataLoaded();
    const targetRowIndex = this.facade._findRowIndexById(id);

    if (targetRowIndex === -1) {
      this.facade._logger.warn(
        `No row found with ${this.facade._keyField}=${id} in ${this.facade.sheetName} for deletion.`
      );
      return null; // SDL-M007: Return null instead of false for consistency
    }

    // SDL-M007: Store the row before deletion to return it
    const deletedRow = { ...this.facade._rowsCache[targetRowIndex] };

    try {
      this.facade._logger.debug(`Queuing deletion for row in sheet '${this.facade.sheetName}'`);

      // Delegate deletion to Queue
      this.facade._deleteQueue.add(id);
      this.facade._updateQueue.delete(id); // If it was queued for update, it's now deleted
      // Remove from insert queue if it was just added
      const insertIndex = this.facade._insertQueue.findIndex(
        (r) => r[this.facade._keyField] === id
      );
      if (insertIndex !== -1) {
        this.facade._insertQueue.splice(insertIndex, 1);
        this.facade._deleteQueue.delete(id); // No need to delete from remote if it was never pushed
      }

      // WRITE-THROUGH CACHE: Remove row from cache instead of invalidating
      this.facade._rowsCache.splice(targetRowIndex, 1);
      // Invalidate processed cache to recompute virtual columns
      this.facade._processedRowsCache = null;
      // Invalidate indices as data changed
      this.facade.searchEngine.invalidateIndex();

      // OPTIMIZATION: Remove from original data cache
      this.facade._originalRowData.delete(id);

      this.facade._logger.debug(`Row deletion queued successfully from '${this.facade.sheetName}'`);
      return deletedRow; // SDL-M007: Return the deleted row object
    } catch (e) {
      this.facade._logger.error(
        `Error queuing row deletion from '${this.facade.sheetName}': ${e.message}`
      );
      throw e;
    }
  }

  /**
   * @function updateRowsByIds
   * @description Batch patch operation.
   * @param {Object.<string, Object>} updatesObj - ID-to-partial map.
   * @returns {Object[]} Successful updates.
   */
  updateRowsByIds(updatesObj) {
    if (!updatesObj || Object.keys(updatesObj).length === 0) return [];
    const updatedRows = [];
    for (const [id, updates] of Object.entries(updatesObj)) {
      try {
        const result = this.patchRow(id, updates);
        updatedRows.push(result);
      } catch (e) {
        this.facade._logger.warn(`Failed to process bulk update for ID ${id}: ${e.message}`);
      }
    }
    return updatedRows;
  }

  /**
   * @function deleteRowsByIds
   * @description Batch deletion.
   * @param {(string|number)[]} ids - Array of PKs.
   * @returns {Object[]} Successful deletions.
   */
  deleteRowsByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const deletedRows = [];
    for (const id of ids) {
      try {
        const result = this.deleteRowById(id);
        if (result) deletedRows.push(result);
      } catch (e) {
        this.facade._logger.warn(`Failed to process bulk delete for ID ${id}: ${e.message}`);
      }
    }
    return deletedRows;
  }
}
