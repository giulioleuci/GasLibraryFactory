/**
 * @file GoogleApiWrapper/src/services/DriveMetadataService.js
 * @description Encapsulates metadata operations for DriveService.
 */

export class DriveMetadataService {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._cache = facade._cache;
    this._exceptionService = facade._exceptionService;
    this._cachePrefix = facade._cachePrefix;
    this._cacheExpirationTime = facade._cacheExpirationTime;

    // Bind helper methods
    this._isDryRun = facade._isDryRun.bind(facade);
    this._generateCacheKey = facade._generateCacheKey.bind(facade);
  }

  /**
   * @description Batch updates file/folder metadata fields (name, description, starred, properties, etc.). Automates per-item retry and cache invalidation.
   * @param {Object|Object[]} updateRequests Collection of {fileId, metadata}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
  updateMetadata(updateRequests, options = {}) {
    const reqsArray = Array.isArray(updateRequests) ? updateRequests : [updateRequests];

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would update metadata for ${reqsArray.length} file(s)`);
      reqsArray.forEach((req) => {
        const metadataFields = Object.keys(req.metadata || {}).join(', ');
        this._logger.info(`[DRY-RUN]   - Update ${req.fileId} metadata: ${metadataFields}`);
      });

      // Return simulated success
      return {
        successful: reqsArray.map((req) => ({
          id: req.fileId,
          status: 200,
          data: {
            id: req.fileId,
            ...req.metadata
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
          () => Drive.Files.update(req.metadata, req.fileId),
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
        this._logger.warn(`Failed to update metadata for file ${req.fileId}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * @description Retrieves file/folder metadata with intelligent caching. Transparently merges cached metadata with batch API results.
   * @param {string|string[]} fileIds Resource ID(s) to fetch.
   * @param {Object} [options={}] Operation settings.
   * @param {string} [options.fields] Comma-separated fields to retrieve (defaults to comprehensive metadata set).
   * @returns {Object|Object<string, Object>} Metadata object (single) or ID-to-Metadata map (batch).
   * @throws {ServiceError} On execution failure.
   */
  getFiles(fileIds, options = {}) {
    const isSingleId = !Array.isArray(fileIds);
    const idsArray = isSingleId ? [fileIds] : fileIds;
    const fields =
      options.fields || 'id,name,mimeType,parents,modifiedTime,createdTime,webViewLink,size,owners';

    // Check cache first
    const cacheResults = {};
    const uncachedIds = [];

    idsArray.forEach((fileId) => {
      const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');
      const cached = this._cache.get(cacheKey);

      if (cached) {
        try {
          cacheResults[fileId] = JSON.parse(cached);
        } catch (_e) {
          uncachedIds.push(fileId);
        }
      } else {
        uncachedIds.push(fileId);
      }
    });

    // If all cached, return immediately
    if (uncachedIds.length === 0) {
      return isSingleId ? cacheResults[fileIds] : cacheResults;
    }

    // Fetch individually (previously batch execution)
    uncachedIds.forEach((fileId) => {
      try {
        const fileMetadata = this._exceptionService.executeWithRetry(
          () => Drive.Files.get(fileId, { fields: fields }),
          {},
          3
        );
        cacheResults[fileId] = fileMetadata;

        const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');
        this._cache.put(cacheKey, JSON.stringify(fileMetadata), this._cacheExpirationTime);
      } catch (error) {
        cacheResults[fileId] = null;
        this._logger.warn(`Failed to get file ${fileId}: ${error.message}`);
      }
    });

    return isSingleId ? cacheResults[fileIds] : cacheResults;
  }

  /**
   * @description Performs paginated file search using Google Drive Query Language.
   * @param {string} query Search query string.
   * @param {Object} [options={}] Operation settings.
   * @param {number} [options.maxResults=Infinity] Upper bound for result count.
   * @param {string} [options.orderBy] Sorting criteria (e.g., 'modifiedTime desc').
   * @returns {Object[]} Collection of matching file metadata objects.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid query syntax.
   */
  searchFiles(query, options = {}) {
    const allFiles = [];
    let pageToken = null;
    const maxResults = options.maxResults || Infinity;
    const orderBy = options.orderBy || null;

    do {
      const requestOptions = {
        q: query,
        fields:
          'nextPageToken,files(id,name,mimeType,parents,modifiedTime,createdTime,webViewLink,size,owners)',
        pageSize: Math.min(1000, maxResults - allFiles.length)
      };

      if (pageToken) {
        requestOptions.pageToken = pageToken;
      }
      if (orderBy) {
        requestOptions.orderBy = orderBy;
      }

      const results = this._exceptionService.executeWithRetry(
        () => Drive.Files.list(requestOptions),
        {},
        3
      );

      if (results.files && results.files.length > 0) {
        allFiles.push(...results.files);
      }

      pageToken = results.nextPageToken;

      // Stop if we've reached maxResults
      if (allFiles.length >= maxResults) {
        break;
      }
    } while (pageToken);

    return allFiles.slice(0, maxResults);
  }
}
