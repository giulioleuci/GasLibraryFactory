/**
 * Resource manager for online test execution, maintaining persistent Google Drive artifacts to optimize quota usage and execution speed.
 * @class
 */
export class TestContext {
  constructor() {
    this.TEST_ROOT_NAME = 'GAS_TEST_ROOT_PERSISTENT';
    this.TEST_SS_NAME = 'GAS_TEST_SS_PERSISTENT';
    this.TEST_DOC_NAME = 'GAS_TEST_DOC_PERSISTENT';

    this._rootFolder = null;
    this._spreadsheet = null;
    this._document = null;

    this.apiCallCount = 0;
  }

  /**
   * Increments the internal counter for outbound Google service requests.
   * @private
   */
  _trackApiCall() {
    this.apiCallCount++;
  }

  /**
   * Resolves or creates the dedicated Drive folder for test artifact storage.
   * @returns {GoogleAppsScript.Drive.Folder} Persistent test root.
   */
  getRootFolder() {
    if (this._rootFolder) {
      return this._rootFolder;
    }
    this._rootFolder = this.getOrCreateNamedFolder(this.TEST_ROOT_NAME);
    return this._rootFolder;
  }

  /**
   * Resolves or creates a Drive folder by name, so repeated online-test runs reuse the same
   * artifact instead of minting a new one every run (ref ALDO_GLF_AUDIT_RESULTS.md K-1).
   * @param {string} name Folder name to look up or create.
   * @param {GoogleAppsScript.Drive.Folder|null} [parentFolder=null] Scope the lookup/creation to
   *   this folder; defaults to Drive root when omitted.
   * @returns {GoogleAppsScript.Drive.Folder} The existing or newly-created folder.
   */
  getOrCreateNamedFolder(name, parentFolder = null) {
    this._trackApiCall();
    const folders = parentFolder
      ? parentFolder.getFoldersByName(name)
      : DriveApp.getFoldersByName(name);
    if (folders.hasNext()) {
      return folders.next();
    }
    this._trackApiCall();
    return parentFolder ? parentFolder.createFolder(name) : DriveApp.createFolder(name);
  }

  /**
   * Resolves or creates the primary Spreadsheet artifact for persistence testing.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Persistent test spreadsheet.
   */
  getSpreadsheet() {
    if (this._spreadsheet) {
      return this._spreadsheet;
    }
    this._spreadsheet = this.getOrCreateNamedSpreadsheet(this.TEST_SS_NAME, this.getRootFolder());
    return this._spreadsheet;
  }

  /**
   * Resolves or creates a Spreadsheet by name, so repeated online-test runs reuse the same
   * artifact instead of minting (and never cleaning up) a new one every run — the capability
   * `SpreadsheetApp.create` alone doesn't provide (ref ALDO_GLF_AUDIT_RESULTS.md K-1).
   * @param {string} name Spreadsheet file name to look up or create.
   * @param {GoogleAppsScript.Drive.Folder|null} [parentFolder=null] Scope the lookup to this
   *   folder, and move a newly-created spreadsheet into it; when omitted the lookup scans all of
   *   Drive by name and a new spreadsheet is left wherever `SpreadsheetApp.create` places it.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} The existing or newly-created spreadsheet.
   */
  getOrCreateNamedSpreadsheet(name, parentFolder = null) {
    this._trackApiCall();
    const files = parentFolder ? parentFolder.getFilesByName(name) : DriveApp.getFilesByName(name);
    if (files.hasNext()) {
      return SpreadsheetApp.openById(files.next().getId());
    }
    this._trackApiCall();
    const spreadsheet = SpreadsheetApp.create(name);
    if (parentFolder) {
      const file = DriveApp.getFileById(spreadsheet.getId());
      this._trackApiCall();
      file.moveTo(parentFolder);
    }
    return spreadsheet;
  }

  /**
   * Resolves or creates the primary Google Doc artifact for template testing.
   * @returns {GoogleAppsScript.Document.Document} Persistent test document.
   */
  getDocument() {
    if (this._document) {
      try {
        this._document.getBody();
        return this._document;
      } catch (_e) {
        // Document might be closed
        this._trackApiCall();
        this._document = DocumentApp.openById(this._document.getId());
        return this._document;
      }
    }

    this._trackApiCall();
    const files = DriveApp.getFilesByName(this.TEST_DOC_NAME);
    if (files.hasNext()) {
      const file = files.next();
      this._document = DocumentApp.openById(file.getId());
    } else {
      this._trackApiCall();
      this._document = DocumentApp.create(this.TEST_DOC_NAME);
      const file = DriveApp.getFileById(this._document.getId());
      this._trackApiCall();
      file.moveTo(this.getRootFolder());
    }
    return this._document;
  }

  /**
   * Restores a spreadsheet to a baseline state by purging protections, named ranges, and additional tabs.
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} [ss] target spreadsheet (defaults to persistent instance).
   */
  resetSpreadsheet(ss) {
    const targetSs = ss || this.getSpreadsheet();
    this._trackApiCall();

    // 1. Clear protected ranges
    const protections = targetSs.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    protections.forEach((p) => {
      this._trackApiCall();
      p.remove();
    });

    // Also clear sheet-specific protections
    targetSs.getSheets().forEach((sheet) => {
      sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach((p) => {
        this._trackApiCall();
        p.remove();
      });
    });

    // 2. Clear named ranges
    const namedRanges = targetSs.getNamedRanges();
    namedRanges.forEach((nr) => {
      this._trackApiCall();
      nr.remove();
    });

    const sheets = targetSs.getSheets();

    // Create a fresh sheet if none exist (shouldn't happen) or to ensure we can delete others
    if (sheets.length === 0) {
      targetSs.insertSheet('Sheet1');
    } else {
      const firstSheet = sheets[0];
      firstSheet.setName('TEMP_RESET_' + new Date().getTime());
      this._trackApiCall();
      firstSheet.clear().clearContents().clearFormats().clearNotes();

      // Delete all other sheets
      for (let i = 1; i < sheets.length; i++) {
        this._trackApiCall();
        targetSs.deleteSheet(sheets[i]);
      }
      firstSheet.setName('Sheet1');
    }
  }

  /**
   * Restores the test document to a baseline state by clearing all body content.
   */
  resetDocument() {
    const doc = this.getDocument();
    this._trackApiCall();
    try {
      const body = doc.getBody();
      body.clear();
    } catch (_e) {
      // If still fails (e.g. Document is closed), reopen and try again
      this._document = DocumentApp.openById(doc.getId());
      this._document.getBody().clear();
    }
  }

  /**
   * Orchestrates a full state reset across all persistent test artifacts and resets the API counter.
   */
  resetAll() {
    this.resetSpreadsheet();
    this.resetDocument();
    this._log(`TestContext reset completed. API calls in this session: ${this.apiCallCount}`);
    this.apiCallCount = 0;
  }

  /**
   * Routes diagnostic messages to the environment-appropriate output.
   * @private
   * @param {string} message Diagnostic content.
   */
  _log(message) {
    if (typeof Logger !== 'undefined') {
      Logger.log(message);
    } else {
      console.log(message);
    }
  }
}

// Singleton instance
export const testContext = new TestContext();
