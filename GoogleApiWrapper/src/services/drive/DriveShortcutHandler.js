/**
 * @file GoogleApiWrapper/src/services/DriveShortcutHandler.js
 * @description Encapsulates shortcut operations for DriveService.
 */

export class DriveShortcutHandler {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._exceptionService = facade._exceptionService;

    // Bind helper methods
    this._isDryRun = facade._isDryRun.bind(facade);
    this._generateDryRunId = facade._generateDryRunId.bind(facade);
    
    // Bind facade methods used by this manager
    this.getFiles = (...args) => this.facade.getFiles(...args);
  }

  /**
   * @description Creates a Google Drive Shortcut (pointer) to a target resource.
   * @param {string} targetId Target file/folder identifier.
   * @param {string} name Shortcut display name.
   * @param {string} [parentId=null] Destination folder ID.
   * @returns {Object} Shortcut metadata including shortcutDetails.
   */
  createShortcut(targetId, name, parentId = null) {
    // Check for dry-run mode
    if (this._isDryRun()) {
      const dryRunId = this._generateDryRunId();
      this._logger.info(
        `[DRY-RUN] Would create shortcut "${name}" to target ${targetId}${parentId ? ` in folder ${parentId}` : ''} (simulated ID: ${dryRunId})`
      );

      return {
        id: dryRunId,
        name: name,
        mimeType: 'application/vnd.google-apps.shortcut',
        shortcutDetails: {
          targetId: targetId
        },
        parents: parentId ? [parentId] : [],
        dryRun: true
      };
    }

    const body = {
      name: name,
      mimeType: 'application/vnd.google-apps.shortcut',
      shortcutDetails: {
        targetId: targetId
      }
    };

    if (parentId) {
      body.parents = [parentId];
    }

    return this._exceptionService.executeWithRetry(() => Drive.Files.create(body), {}, 3);
  }

  /**
   * @description Resolves the target ID from a shortcut resource.
   * @param {string} shortcutId Shortcut resource identifier.
   * @returns {string|null} Target ID or null if resource is not a shortcut.
   */
  getTargetId(shortcutId) {
    const file = this.getFiles(shortcutId, { fields: 'id,mimeType,shortcutDetails' });
    if (file && file.mimeType === 'application/vnd.google-apps.shortcut' && file.shortcutDetails) {
      return file.shortcutDetails.targetId;
    }
    return null;
  }

  /**
   * @description Validates if a resource is a Google Drive Shortcut.
   * @param {string} fileId Resource identifier.
   * @returns {boolean}
   */
  isShortcut(fileId) {
    const file = this.getFiles(fileId, { fields: 'mimeType' });
    return file && file.mimeType === 'application/vnd.google-apps.shortcut';
  }
}
