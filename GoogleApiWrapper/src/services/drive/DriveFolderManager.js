/**
 * @file GoogleApiWrapper/src/services/DriveFolderManager.js
 * @description Encapsulates folder-level operations for DriveService.
 */

export class DriveFolderManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._exceptionService = facade._exceptionService;

    // Bind helper methods
    this._isDryRun = facade._isDryRun.bind(facade);
    this._generateDryRunId = facade._generateDryRunId.bind(facade);
    
    // Bind facade methods used by this manager
    this.searchFiles = (...args) => this.facade.searchFiles(...args);
  }

  /**
   * @description Creates a Google Drive folder. Supports parent targeting and idempotency via deduplication.
   * @param {string} folderName Target folder name.
   * @param {string} [parentFolderId=null] Parent identifier (defaults to "My Drive").
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.returnExistingIfFound=false] Retrieve first match if name exists in parent.
   * @returns {Object} Folder metadata {id, name, mimeType, parents, webViewLink}.
   * @throws {PermissionDeniedError} On auth/scope failure.
   * @throws {ResourceNotFoundError} If parent folder is missing.
   * @throws {QuotaExceededError} If storage limit reached.
   * @throws {ValidationError} On invalid input.
   */
  createFolder(folderName, parentFolderId = null, options = {}) {
    // Check if folder exists
    if (options.returnExistingIfFound) {
      const query = parentFolderId
        ? `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const existing = this.searchFiles(query, { maxResults: 1 });
      if (existing.length > 0) {
        return existing[0];
      }
    }

    // Check for dry-run mode
    if (this._isDryRun(options)) {
      const dryRunId = this._generateDryRunId();
      this._logger.info(
        `[DRY-RUN] Would create folder "${folderName}"${parentFolderId ? ` in parent ${parentFolderId}` : ' in My Drive root'} (simulated ID: ${dryRunId})`
      );

      return {
        id: dryRunId,
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : [],
        webViewLink: `https://drive.google.com/drive/folders/${dryRunId}`,
        dryRun: true
      };
    }

    // Create new folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentFolderId) {
      folderMetadata.parents = [parentFolderId];
    }

    return this._exceptionService.executeWithRetry(
      () =>
        Drive.Files.create(folderMetadata, null, {
          fields: 'id,name,mimeType,parents,webViewLink'
        }),
      {},
      3
    );
  }

  /**
   * @description Accesses folder via native DriveApp (standard API). Enables use of folder-specific iterators and methods.
   * @param {string} folderId Target resource identifier.
   * @returns {GoogleAppsScript.Drive.Folder} Native GAS Drive Folder object.
   * @throws {ResourceNotFoundError} If folder is missing.
   * @throws {PermissionDeniedError} If access is denied.
   */
  getFolderByIdStandard(folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (error) {
      this._logger.error(`Failed to get folder with DriveApp: ${error.message}`);

      // Wrap with exception service if available
      if (this._exceptionService) {
        return this._exceptionService.executeWithRetry(
          () => DriveApp.getFolderById(folderId),
          { folderId },
          3
        );
      }

      throw error;
    }
  }
}
