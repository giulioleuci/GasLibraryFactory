import type { DriveService } from '../DriveService.js';
import type { DriveFacade, DriveFile } from './types.js';

/**
 * @file GoogleApiWrapper/src/services/DriveShortcutHandler.js
 * @description Encapsulates shortcut operations for DriveService.
 */

export class DriveShortcutHandler {
  declare facade: Pick<
    DriveFacade,
    '_logger' | '_exceptionService' | '_isDryRun' | '_generateDryRunId'
  > &
    Pick<DriveService, 'getFiles'>;
  declare _logger: DriveFacade['_logger'];
  declare _exceptionService: DriveFacade['_exceptionService'];
  declare _isDryRun: DriveFacade['_isDryRun'];
  declare _generateDryRunId: DriveFacade['_generateDryRunId'];
  declare getFiles: DriveService['getFiles'];

  constructor(
    facade: Pick<DriveFacade, '_logger' | '_exceptionService' | '_isDryRun' | '_generateDryRunId'> &
      Pick<DriveService, 'getFiles'>
  ) {
    this.facade = facade;
    this._logger = facade._logger;
    this._exceptionService = facade._exceptionService;

    // Bind helper methods
    this._isDryRun = facade._isDryRun.bind(facade);
    this._generateDryRunId = facade._generateDryRunId.bind(facade);

    // Bind facade methods used by this manager
    this.getFiles = ((...args: Parameters<DriveService['getFiles']>) =>
      this.facade.getFiles(...args)) as DriveService['getFiles'];
  }

  /**
   * @description Creates a Google Drive Shortcut (pointer) to a target resource.
   * @param {string} targetId Target file/folder identifier.
   * @param {string} name Shortcut display name.
   * @param {string} [parentId=null] Destination folder ID.
   * @returns {Object} Shortcut metadata including shortcutDetails.
   */
  createShortcut(
    targetId: string,
    name: string,
    parentId: string | null = null
  ): DriveFile & { dryRun?: boolean } {
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

    const body: DriveFile = {
      name: name,
      mimeType: 'application/vnd.google-apps.shortcut',
      shortcutDetails: {
        targetId: targetId
      }
    };

    if (parentId) {
      body.parents = [parentId];
    }

    return this._exceptionService.executeWithRetry(() => Drive!.Files!.create(body), {}, 3);
  }

  /**
   * @description Resolves the target ID from a shortcut resource.
   * @param {string} shortcutId Shortcut resource identifier.
   * @returns {string|null} Target ID or null if resource is not a shortcut.
   */
  getTargetId(shortcutId: string) {
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
  isShortcut(fileId: string) {
    const file = this.getFiles(fileId, { fields: 'mimeType' });
    return file && file.mimeType === 'application/vnd.google-apps.shortcut';
  }
}
