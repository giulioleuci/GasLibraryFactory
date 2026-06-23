/**
 * @file GoogleApiWrapper/src/services/DriveFileManager.js
 * @description Encapsulates file-level operations for DriveService.
 */

export class DriveFileManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._cache = facade._cache;
    this._utils = facade._utils;
    this._exceptionService = facade._exceptionService;
    this._cachePrefix = facade._cachePrefix;
    this._cacheExpirationTime = facade._cacheExpirationTime;

    // Bind helper methods from the facade
    this._isDryRun = facade._isDryRun.bind(facade);
    this._generateDryRunId = facade._generateDryRunId.bind(facade);
    this._generateCacheKey = facade._generateCacheKey.bind(facade);
  }

  /**
   * @description Deletes or trashes files/folders. Supports single ID or batch array. Automates per-item retry and cache invalidation.
   * @param {string|string[]} fileIds Resource ID(s) to process.
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.permanently=false] Skip trash (irreversible).
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid input.
   */
  deleteFiles(fileIds, options = {}) {
    const idsArray = Array.isArray(fileIds) ? fileIds : [fileIds];
    const permanently = options.permanently || false;

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(
        `[DRY-RUN] Would delete ${idsArray.length} file(s): ${idsArray.join(', ')}${permanently ? ' (permanently)' : ' (to trash)'}`
      );

      // Return simulated success for all files
      return {
        successful: idsArray.map((id) => ({
          id,
          status: 204,
          data: null,
          dryRun: true
        })),
        failed: [],
        dryRun: true
      };
    }

    const results = { successful: [], failed: [] };

    idsArray.forEach((fileId) => {
      try {
        this._exceptionService.executeWithRetry(
          () =>
            permanently
              ? Drive.Files.remove(fileId)
              : Drive.Files.update({ trashed: true }, fileId),
          {},
          3
        );
        results.successful.push({
          id: fileId,
          status: 204,
          data: null
        });

        // Clear cache
        const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');
        this._cache.remove(cacheKey);
      } catch (error) {
        results.failed.push({
          id: fileId,
          status: error.code || 500,
          error: error
        });
        this._logger.warn(`Failed to delete file ${fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Restores files/folders from trash. Supports single ID or batch array. Automates per-item retry and cache invalidation.
   * @param {string|string[]} fileIds Resource ID(s) to restore.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   */
  restoreFiles(fileIds, options = {}) {
    const idsArray = Array.isArray(fileIds) ? fileIds : [fileIds];

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would restore ${idsArray.length} file(s) from trash`);

      return {
        successful: idsArray.map((id) => ({
          id,
          status: 200,
          data: null,
          dryRun: true
        })),
        failed: [],
        dryRun: true
      };
    }

    const results = { successful: [], failed: [] };

    idsArray.forEach((fileId) => {
      try {
        this._exceptionService.executeWithRetry(
          () => Drive.Files.update({ trashed: false }, fileId),
          {},
          3
        );
        results.successful.push({
          id: fileId,
          status: 200,
          data: null
        });

        // Clear cache
        const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');
        this._cache.remove(cacheKey);
      } catch (error) {
        results.failed.push({
          id: fileId,
          status: error.code || 500,
          error: error
        });
        this._logger.warn(`Failed to restore file ${fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Copies files via Advanced Drive API. Supports single request or batch array. Note: Does not support folder copying.
   * @param {Object|Object[]} copyRequests Collection of {fileId, name, destinationFolder}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
  copyFiles(copyRequests, options = {}) {
    const reqsArray = Array.isArray(copyRequests) ? copyRequests : [copyRequests];

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would copy ${reqsArray.length} file(s)`);
      reqsArray.forEach((req) => {
        this._logger.info(
          `[DRY-RUN]   - Copy ${req.fileId} as "${req.name || 'Copy'}"${req.destinationFolder ? ` to folder ${req.destinationFolder}` : ''}`
        );
      });

      // Return simulated success with generated IDs
      return {
        successful: reqsArray.map((req) => ({
          id: req.fileId,
          status: 200,
          data: {
            id: this._generateDryRunId(),
            name: req.name || 'Copy',
            parents: req.destinationFolder ? [req.destinationFolder] : []
          },
          dryRun: true
        })),
        failed: [],
        dryRun: true
      };
    }

    const results = { successful: [], failed: [] };

    reqsArray.forEach((req) => {
      try {
        const body = { name: req.name || 'Copy' };
        if (req.destinationFolder) {
          body.parents = [req.destinationFolder];
        }

        const copiedFile = this._exceptionService.executeWithRetry(
          () => Drive.Files.copy(body, req.fileId),
          {},
          3
        );

        results.successful.push({
          id: req.fileId,
          status: 200,
          data: copiedFile
        });
      } catch (error) {
        results.failed.push({
          id: req.fileId,
          status: error.code || 500,
          error: error
        });
        this._logger.warn(`Failed to copy file ${req.fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Moves files/folders to new parents. Implements N+1 optimization by batching parent metadata lookups.
   * @param {Object|Object[]} moveRequests Collection of {fileId, newParent, removeFromOtherParents}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
  moveFiles(moveRequests, options = {}) {
    const reqsArray = Array.isArray(moveRequests) ? moveRequests : [moveRequests];

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would move ${reqsArray.length} file(s)`);
      reqsArray.forEach((req) => {
        this._logger.info(
          `[DRY-RUN]   - Move ${req.fileId} to ${req.newParent}${req.removeFromOtherParents ? ' (removing from other parents)' : ''}`
        );
      });

      // Return simulated success
      return {
        successful: reqsArray.map((req) => ({
          id: req.fileId,
          status: 200,
          data: {
            id: req.fileId,
            parents: [req.newParent]
          },
          dryRun: true
        })),
        failed: [],
        dryRun: true
      };
    }

    // PHASE 1: BATCH READ all file metadata (if removeFromOtherParents is needed)
    const filesNeedingParentInfo = reqsArray.filter((req) => req.removeFromOtherParents);
    const parentInfoMap = {};

    if (filesNeedingParentInfo.length > 0) {
      this._logger.debug(
        `Batch reading parent info for ${filesNeedingParentInfo.length} files to avoid N+1`
      );

      filesNeedingParentInfo.forEach((req) => {
        try {
          const fileMetadata = this._exceptionService.executeWithRetry(
            () => Drive.Files.get(req.fileId, { fields: 'parents' }),
            {},
            3
          );
          if (fileMetadata && fileMetadata.parents) {
            parentInfoMap[req.fileId] = fileMetadata.parents;
          } else {
            parentInfoMap[req.fileId] = [];
          }
        } catch (error) {
          parentInfoMap[req.fileId] = [];
          this._logger.warn(`Failed to get parent info for file ${req.fileId}: ${error.message}`);
        }
      });
    }

    // PHASE 2 & 3: EXECUTE PATCH operations
    const results = { successful: [], failed: [] };

    reqsArray.forEach((req) => {
      try {
        const options = { addParents: req.newParent };

        if (req.removeFromOtherParents) {
          const parents = parentInfoMap[req.fileId] || [];
          if (parents.length > 0) {
            options.removeParents = parents.join(',');
          }
        }

        const updatedFile = this._exceptionService.executeWithRetry(
          () => Drive.Files.update({}, req.fileId, null, options),
          {},
          3
        );

        results.successful.push({
          id: req.fileId,
          status: 200,
          data: updatedFile
        });

        // Clear cache
        const cacheKey = this._generateCacheKey(this._cachePrefix, req.fileId, 'get');
        this._cache.remove(cacheKey);
      } catch (error) {
        results.failed.push({
          id: req.fileId,
          status: error.code || 500,
          error: error
        });
        this._logger.warn(`Failed to move file ${req.fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Renames files/folders via Advanced Drive API. Supports single request or batch array.
   * @param {Object|Object[]} renameRequests Collection of {fileId, newName}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On missing names or invalid format.
   */
  renameFiles(renameRequests, options = {}) {
    const reqsArray = Array.isArray(renameRequests) ? renameRequests : [renameRequests];

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would rename ${reqsArray.length} file(s)`);
      reqsArray.forEach((req) => {
        this._logger.info(`[DRY-RUN]   - Rename ${req.fileId} to "${req.newName}"`);
      });

      // Return simulated success
      return {
        successful: reqsArray.map((req) => ({
          id: req.fileId,
          status: 200,
          data: {
            id: req.fileId,
            name: req.newName
          },
          dryRun: true
        })),
        failed: [],
        dryRun: true
      };
    }

    const results = { successful: [], failed: [] };

    reqsArray.forEach((req) => {
      try {
        const updatedFile = this._exceptionService.executeWithRetry(
          () => Drive.Files.update({ name: req.newName }, req.fileId),
          {},
          3
        );

        results.successful.push({
          id: req.fileId,
          status: 200,
          data: updatedFile
        });

        // Clear cache
        const cacheKey = this._generateCacheKey(this._cachePrefix, req.fileId, 'get');
        this._cache.remove(cacheKey);
      } catch (error) {
        results.failed.push({
          id: req.fileId,
          status: error.code || 500,
          error: error
        });
        this._logger.warn(`Failed to rename file ${req.fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Accesses file/folder via native DriveApp (standard API). Auto-detects resource type.
   * @param {string} fileId Target resource identifier.
   * @returns {GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder} Native GAS Drive object.
   * @throws {ResourceNotFoundError} If resource is missing.
   * @throws {PermissionDeniedError} If access is denied.
   */
  getFileByIdStandard(fileId) {
    try {
      // Try as file first
      return DriveApp.getFileById(fileId);
    } catch (error) {
      // If file fails, try as folder
      try {
        return DriveApp.getFolderById(fileId);
      } catch (_folderError) {
        this._logger.error(`Failed to get file/folder with DriveApp: ${error.message}`);

        // Wrap with exception service if available
        if (this._exceptionService) {
          return this._exceptionService.executeWithRetry(
            () => {
              try {
                return DriveApp.getFileById(fileId);
              } catch (_e) {
                return DriveApp.getFolderById(fileId);
              }
            },
            { fileId },
            3
          );
        }

        throw error;
      }
    }
  }
}
