/**
 * @file JobRunnerLib/src/QueuePersistenceHandler.js
 * @description Manages persistence of job configuration, type, and large states (tiered storage).
 * Extracted from JobStateManager for improved separation of concerns.
 *
 * Drive I/O is routed through GoogleApiWrapper's DriveService (L2) rather than the
 * native `DriveApp` global, preserving the L3→L2 layering. The native Drive API is
 * reached only via `driveService.getStandardApp()`.
 */

import { ServiceFactory } from '@GoogleApiWrapper';

export class QueuePersistenceHandler {
  static get LARGE_STATE_THRESHOLD() {
    return 8 * 1024;
  }

  constructor(jobName, propertiesService, stateManager, driveService = null) {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error(
        'QueuePersistenceHandler: jobName is required and must be a non-empty string'
      );
    }
    if (!propertiesService || typeof propertiesService !== 'object') {
      throw new Error(
        'QueuePersistenceHandler: propertiesService is required and must be an object'
      );
    }

    this.jobName = jobName;
    this._propertiesService = propertiesService;
    this._stateManager = stateManager;
    this._driveService = driveService;
  }

  /**
   * Resolves the native Drive API surface via the wrapped DriveService (L2).
   * @private
   * @returns {GoogleAppsScript.Drive.DriveApp|undefined} Native DriveApp, or undefined outside GAS.
   */
  _driveApp() {
    if (!this._driveService) {
      this._driveService = ServiceFactory.getDriveService();
    }
    return this._driveService.getStandardApp();
  }

  _key(suffix) {
    return `${suffix}_${this.jobName}`;
  }

  /**
   * Resolves the ScriptProperties patch for a resume-state value, offloading
   * to Drive (and returning a `__DRIVE__:` pointer + recorded size instead
   * of the inline JSON) whenever the serialized state exceeds
   * `LARGE_STATE_THRESHOLD` — the same protection `saveResumeState` has
   * always provided against `PropertiesService`'s ~9KB per-value cap.
   * Shared by `saveResumeState` (applies the patch immediately) and
   * `batchSave` (merges the patch into its single `setProperties` call), so
   * both persistence paths get identical size-check-then-offload behavior;
   * previously only `saveResumeState` had it, and `batchSave` — used on the
   * timeout/suspension path — silently wrote oversized state inline instead.
   * @private
   * @param {*} state Resume-state value to persist.
   * @returns {{properties: Object<string,string>, propertiesToDelete: string[]}}
   *   `properties` to merge into a `setProperties` call (or apply
   *   individually); `propertiesToDelete` are keys that must be explicitly
   *   deleted afterward (`setProperties` can only set/overwrite, never
   *   delete, keys).
   */
  _resolveResumeStatePatch(state) {
    const stateJson = JSON.stringify(state);
    const stateSize = stateJson.length;

    if (stateSize > QueuePersistenceHandler.LARGE_STATE_THRESHOLD) {
      const fileId = this._saveLargeStateToDrive(stateJson);
      return {
        properties: {
          [this._key('state')]: `__DRIVE__:${fileId}`,
          [this._key('state_size')]: String(stateSize)
        },
        propertiesToDelete: []
      };
    }

    return {
      properties: { [this._key('state')]: stateJson },
      propertiesToDelete: [this._key('state_size')]
    };
  }

  batchSave(updates) {
    const properties = {};
    const propertiesToDelete = [];

    if (updates.resumeState !== undefined) {
      const patch = this._resolveResumeStatePatch(updates.resumeState);
      Object.assign(properties, patch.properties);
      propertiesToDelete.push(...patch.propertiesToDelete);
    }
    if (updates.progress !== undefined) {
      properties[this._key('progress')] = JSON.stringify(updates.progress);
    }
    if (updates.config !== undefined) {
      properties[this._key('config')] = JSON.stringify(updates.config);
    }
    if (updates.type !== undefined) {
      properties[this._key('type')] = updates.type;
    }
    if (updates.state !== undefined) {
      properties[this._key('job')] = updates.state;
      const currentVersion = this._stateManager ? this._stateManager.getStateVersion() : 0;
      properties[this._key('version')] = String(currentVersion + 1);
    }

    if (Object.keys(properties).length > 0) {
      this._propertiesService.setProperties(properties);
    }
    propertiesToDelete.forEach((key) => this._propertiesService.deleteProperty(key));
  }

  saveResumeState(state) {
    const { properties, propertiesToDelete } = this._resolveResumeStatePatch(state);
    this._propertiesService.setProperties(properties);
    propertiesToDelete.forEach((key) => this._propertiesService.deleteProperty(key));
  }

  loadResumeState() {
    const stateValue = this._propertiesService.getProperty(this._key('state'));

    if (!stateValue) {
      return null;
    }

    if (typeof stateValue === 'string' && stateValue.startsWith('__DRIVE__:')) {
      const fileId = stateValue.substring(10);
      return this._loadLargeStateFromDrive(fileId);
    }

    return this._propertiesService.getObjectProperty(this._key('state'));
  }

  _saveLargeStateToDrive(stateJson) {
    const driveApp = this._driveApp();
    if (!driveApp) {
      throw new Error('DriveApp not available - cannot save large state');
    }

    const fileName = `JobState_${this.jobName}_${Date.now()}.json`;
    const folder = this._getOrCreateJobStateFolder();

    const existingFileId = this._propertiesService.getProperty(this._key('state_file_id'));
    let file;

    if (existingFileId) {
      try {
        file = driveApp.getFileById(existingFileId);
        file.setContent(stateJson);
      } catch (_e) {
        file = folder.createFile(fileName, stateJson, 'application/json');
      }
    } else {
      file = folder.createFile(fileName, stateJson, 'application/json');
    }

    const fileId = file.getId();
    this._propertiesService.setProperty(this._key('state_file_id'), fileId);
    return fileId;
  }

  _loadLargeStateFromDrive(fileId) {
    const driveApp = this._driveApp();
    if (!driveApp) {
      throw new Error('DriveApp not available - cannot load large state');
    }

    try {
      const file = driveApp.getFileById(fileId);
      const stateJson = file.getBlob().getDataAsString();
      return JSON.parse(stateJson);
    } catch (e) {
      throw new Error(`Failed to load state from Drive file ${fileId}: ${e.message}`);
    }
  }

  _getOrCreateJobStateFolder() {
    const driveApp = this._driveApp();
    if (!driveApp) {
      throw new Error('DriveApp not available');
    }

    const folderName = 'JobRunnerStates';
    const folders = driveApp.getFoldersByName(folderName);

    if (folders.hasNext()) {
      return folders.next();
    } else {
      return driveApp.createFolder(folderName);
    }
  }

  saveConfiguration(config) {
    this._propertiesService.setObjectProperty(this._key('config'), config);
  }

  loadConfiguration() {
    return this._propertiesService.getObjectProperty(this._key('config')) || {};
  }

  saveType(type) {
    this._propertiesService.setProperty(this._key('type'), type);
  }

  loadType() {
    return this._propertiesService.getProperty(this._key('type'));
  }

  reset() {
    try {
      const stateFileId = this._propertiesService.getProperty(this._key('state_file_id'));
      const driveApp = stateFileId ? this._driveApp() : null;
      if (stateFileId && driveApp) {
        try {
          const file = driveApp.getFileById(stateFileId);
          file.setTrashed(true);
        } catch (_e) {
          // ignore
        }
      }
    } catch (_e) {
      // ignore
    }

    const keys = [
      'state',
      'type',
      'parameters',
      'config',
      'trigger',
      'state_size',
      'state_file_id'
    ];
    keys.forEach((suffix) => this._propertiesService.deleteProperty(this._key(suffix)));
  }
}
