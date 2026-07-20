/**
 * @file GoogleApiWrapper/src/services/DriveService.js
 * @description BATCH-FIRST Drive Service with Advanced Drive API
 * Version 3.0 - GAW-HIGH-001 Implementation
 *
 * BREAKING CHANGES:
 * - All methods use Advanced Drive API exclusively (no DriveApp fallback)
 * - All mutation methods accept single items OR arrays for batch operations
 * - Methods return detailed per-item results for batch operations
 * - Requires Drive Advanced Service to be enabled in appsscript.json
 *
 * @version 3.0 - Batch operations with Advanced Drive API
 */

// ===================================================================
// DRIVE SERVICE - BATCH-FIRST IMPLEMENTATION
// ===================================================================

import { GoogleService } from '../internal/core/GoogleService';
import { DriveFileManager } from './drive/DriveFileManager';
import { DriveFolderManager } from './drive/DriveFolderManager';
import { DriveShortcutHandler } from './drive/DriveShortcutHandler';
import { DriveMetadataService } from './drive/DriveMetadataService';

/**
 * @class DriveService
 * @extends GoogleService
 * @description Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.
 *
 * @property {DriveFileManager} fileManager Logic for file mutations.
 * @property {DriveFolderManager} folderManager Logic for folder mutations.
 * @property {DriveShortcutHandler} shortcutHandler Logic for shortcut processing.
 * @property {DriveMetadataService} metadataService Logic for metadata and search.
 */
export class DriveService extends GoogleService {
  /**
   * Prefix for simulated file IDs in dry-run mode.
   * @type {string}
   */
  static get DRY_RUN_ID_PREFIX() {
    return 'dry-run-';
  }

  constructor(logger, cache, utils, exceptionService, options = {}) {
    super(logger, cache, utils, exceptionService);

    this._cachePrefix = 'drive';
    this._cacheExpirationTime = 300;

    /**
     * Global dry-run mode flag.
     * When true, no mutations are performed - operations are simulated.
     * @private
     * @type {boolean}
     */
    this._dryRun = options.dryRun || false;

    if (this._dryRun) {
      this._logger.info(
        '[DRY-RUN] DriveService initialized in dry-run mode. No mutations will be performed.'
      );
    }

    // Initialize internal specialized managers
    this.fileManager = new DriveFileManager(this);
    this.folderManager = new DriveFolderManager(this);
    this.shortcutHandler = new DriveShortcutHandler(this);
    this.metadataService = new DriveMetadataService(this);

    // Delegate DriveFileManager methods
    const fileMethods = [
      'deleteFiles',
      'restoreFiles',
      'copyFiles',
      'moveFiles',
      'renameFiles',
      'getFileByIdStandard'
    ];
    fileMethods.forEach((m) => {
      this[m] = this.fileManager[m].bind(this.fileManager);
    });

    // Delegate DriveFolderManager methods
    const folderMethods = ['createFolder', 'getFolderByIdStandard'];
    folderMethods.forEach((m) => {
      this[m] = this.folderManager[m].bind(this.folderManager);
    });

    // Delegate DriveShortcutHandler methods
    const shortcutMethods = ['createShortcut', 'getTargetId', 'isShortcut'];
    shortcutMethods.forEach((m) => {
      this[m] = this.shortcutHandler[m].bind(this.shortcutHandler);
    });

    // Delegate DriveMetadataService methods
    const metadataMethods = ['updateMetadata', 'getFiles', 'searchFiles'];
    metadataMethods.forEach((m) => {
      this[m] = this.metadataService[m].bind(this.metadataService);
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

  /**
   * @private
   * @description Creates a collision-resistant simulated ID for dry-run mutations.
   * @returns {string}
   */
  _generateDryRunId() {
    return `${DriveService.DRY_RUN_ID_PREFIX}${this._utils.generateUuid()}`;
  }

  /**
   * @description Returns the global DriveApp object for enum and static access.
   * @returns {GoogleAppsScript.Drive.DriveApp}
   */
  getStandardApp() {
    return DriveApp;
  }
}
