/**
 * @file GoogleApiWrapper/src/services/SpreadsheetService.js
 * @description BATCH-FIRST Spreadsheet Service with Advanced Sheets API.
 * @version 4.0 - Refactored using Facade/Delegation pattern.
 */

import { GoogleService } from '../internal/core/GoogleService';
import { SpreadsheetRangeManager } from '../internal/services-managers/SpreadsheetRangeManager.js';
import { SpreadsheetGridManager } from '../internal/services-managers/SpreadsheetGridManager.js';
import { SpreadsheetMetadataCache } from '../internal/services-managers/SpreadsheetMetadataCache.js';
import { SpreadsheetHybridManager } from '../internal/services-managers/SpreadsheetHybridManager.js';

/**
 * @class SpreadsheetService
 * @extends GoogleService
 * @description Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.
 *
 * @property {SpreadsheetMetadataCache} _metadataCache Internal metadata registry.
 * @property {SpreadsheetRangeManager} _rangeManager Logic for cell value mutations.
 * @property {SpreadsheetGridManager} _gridManager Logic for sheet and grid mutations.
 * @property {SpreadsheetHybridManager} _hybridManager Standard API integration logic.
 */
export class SpreadsheetService extends GoogleService {
  constructor(logger, cache, utils, exceptionService, options = {}) {
    super(logger, cache, utils, exceptionService);
    this._cachePrefix = 'sheets';
    this._cacheExpirationTime = 300;
    this._dryRun = options.dryRun || false;

    // Initialize managers
    this._metadataCache = new SpreadsheetMetadataCache(this);
    this._rangeManager = new SpreadsheetRangeManager(this);
    this._gridManager = new SpreadsheetGridManager(this);
    this._hybridManager = new SpreadsheetHybridManager(this);

    // Delegate methods
    this._delegate([
      {
        manager: this._metadataCache,
        methods: [
          'getSpreadsheetMetadata',
          'getSheetInfo',
          '_getCachedSheetMetadata',
          '_clearSheetMetadataCache',
          '_parseRangeToGridRange',
          '_parseA1',
          '_parseCell',
          '_columnToIndex'
        ]
      },
      {
        manager: this._rangeManager,
        methods: [
          'updateRanges',
          'getRanges',
          'appendRows',
          'insertRow',
          'getLastError',
          'clearRanges'
        ]
      },
      {
        manager: this._gridManager,
        methods: [
          'formatRanges',
          'setColumnWidths',
          'createSheets',
          'deleteSheets',
          'deleteRow',
          'deleteRows',
          'expandSheetGrid',
          'getProtectedRanges',
          'deleteProtectedRanges',
          'protectRanges'
        ]
      },
      {
        manager: this._hybridManager,
        methods: [
          'createSpreadsheet',
          'openStandard',
          'getActiveStandard',
          'getStandardApp',
          'flushBatch',
          '_verifyAdvancedSheets'
        ]
      }
    ]);

    if (this._dryRun) {
      this._logger.info('[DRY-RUN] SpreadsheetService initialized in dry-run mode.');
    }
  }

  _delegate(delegations) {
    delegations.forEach(({ manager, methods }) => {
      methods.forEach((method) => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
  }

  /**
   * @private
   * @description Resolves dry-run status for current operation.
   * @param {Object} [options={}] Operation-level dryRun override.
   * @returns {boolean}
   */
  _isDryRun(options = {}) {
    if (typeof options.dryRun === 'boolean') {
      return options.dryRun;
    }
    return this._dryRun;
  }
}
