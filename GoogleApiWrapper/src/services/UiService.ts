import type { UiBackend } from '../builders/UiContracts.js';
import type {
  GoogleLogger,
  GoogleCache,
  GoogleRetryExecutor
} from '../internal/core/GoogleService.js';
/**
 * @file GoogleApiWrapper/src/services/UiService.js
 * @description Unified UI service facade for Google Apps Script UI operations
 * @version 1.0 - Initial implementation
 */

import { GoogleService } from '../internal/core/GoogleService.js';
import { MenuBuilder } from '../builders/MenuBuilder.js';
import { SidebarBuilder } from '../builders/SidebarBuilder.js';
import { DialogBuilder } from '../builders/DialogBuilder.js';

/**
 * @class UiService
 * @extends GoogleService
 * @description Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.
 *
 * @property {UiBackend} _ui Native GAS UI object.
 */
export class UiService extends GoogleService {
  declare _ui: UiBackend;

  /**
   * @description Initializes UiService with host auto-detection or explicit UI provider.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {Cache} cache Persistence provider.
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider.
   * @param {Object} [uiObject=null] Explicit UI object for testing or overriding detection.
   * @throws {Error} If no UI context is detected.
   */
  constructor(
    logger: GoogleLogger,
    cache: GoogleCache,
    utils: object,
    exceptionService: GoogleRetryExecutor,
    uiObject: UiBackend | null = null
  ) {
    super(logger, cache, utils, exceptionService);

    /**
     * The native UI object (SpreadsheetApp.getUi(), DocumentApp.getUi(), etc.)
     * @private
     * @type {UiBackend}
     */
    this._ui = (uiObject || this._detectUiObject())!;

    if (!this._ui) {
      throw new Error(
        'UiService: Unable to detect UI object. Are you running in a Google Apps Script UI context?'
      );
    }

    this._logger.debug('UiService: Instance created with UI object');
  }

  /**
   * @private
   * @description Probes global host applications (SpreadsheetApp, DocumentApp, FormApp, SlidesApp) to resolve the active UI object.
   * @returns {UiBackend|null} Detected UI object.
   */
  _detectUiObject() {
    // Try SpreadsheetApp first (most common)
    try {
      if (typeof SpreadsheetApp !== 'undefined') {
        const ui = SpreadsheetApp.getUi();
        if (ui) {
          this._logger.debug('UiService: Detected Google Sheets UI');
          return ui;
        }
      }
    } catch (_e) {
      // Continue to next detection
    }

    // Try DocumentApp
    try {
      if (typeof DocumentApp !== 'undefined') {
        const ui = DocumentApp.getUi();
        if (ui) {
          this._logger.debug('UiService: Detected Google Docs UI');
          return ui;
        }
      }
    } catch (_e) {
      // Continue to next detection
    }

    // Try FormApp
    try {
      if (typeof FormApp !== 'undefined') {
        const ui = FormApp.getUi();
        if (ui) {
          this._logger.debug('UiService: Detected Google Forms UI');
          return ui;
        }
      }
    } catch (_e) {
      // Continue to next detection
    }

    // Try SlidesApp
    try {
      if (typeof SlidesApp !== 'undefined') {
        const ui = SlidesApp.getUi();
        if (ui) {
          this._logger.debug('UiService: Detected Google Slides UI');
          return ui;
        }
      }
    } catch (_e) {
      // No UI found
    }

    return null;
  }

  // ===================================================================
  // MENU OPERATIONS
  // ===================================================================

  /**
   * @description Factory for fluent menu construction.
   * @param {string} caption Label displayed in the UI menu bar.
   * @returns {MenuBuilder} Chained builder instance.
   */
  createMenu(caption: string) {
    return new MenuBuilder(this._ui, caption, this._logger);
  }

  // ===================================================================
  // DIALOG OPERATIONS
  // ===================================================================

  /**
   * @description Synchronous execution of a standard alert dialog.
   * @param {string} title Dialog header.
   * @param {string} message Dialog body.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.Button} Button identifier clicked by the user.
   */
  alert(title: string, message: string, buttonSet?: unknown) {
    this._logger.debug(`UiService.alert: Showing alert "${title}"`);
    return this._executeWithRetry(
      () =>
        buttonSet ? this._ui.alert(title, message, buttonSet) : this._ui.alert(title, message),
      { title, message },
      1 // Alerts typically don't need retry
    );
  }

  /**
   * @description Synchronous execution of an input prompt dialog.
   * @param {string} title Dialog header.
   * @param {string} message Instruction text.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.PromptResponse} Object containing the selected button and input text.
   */
  prompt(title: string, message: string, buttonSet?: unknown) {
    this._logger.debug(`UiService.prompt: Showing prompt "${title}"`);
    return this._executeWithRetry(
      () =>
        buttonSet ? this._ui.prompt(title, message, buttonSet) : this._ui.prompt(title, message),
      { title, message },
      1 // Prompts typically don't need retry
    );
  }

  // ===================================================================
  // HTML SIDEBAR / DIALOG OPERATIONS
  // ===================================================================

  /**
   * @description Factory for fluent HTML sidebar construction.
   * @returns {SidebarBuilder} Chained builder instance.
   */
  createSidebar() {
    return new SidebarBuilder(this._ui, this._logger);
  }

  /**
   * @description Factory for fluent modal HTML dialog construction.
   * @returns {DialogBuilder} Chained builder instance.
   */
  createDialog() {
    return new DialogBuilder(this._ui, this._logger);
  }

  // ===================================================================
  // NATIVE UI ACCESS (ESCAPE HATCH)
  // ===================================================================

  /**
   * @description Direct accessor for the underlying GAS UI object.
   * @returns {UiBackend}
   */
  getNativeUi() {
    return this._ui;
  }

  /**
   * @description Map of native UI Button constants.
   * @returns {GoogleAppsScript.Base.Button}
   */
  get Button() {
    return this._ui.Button;
  }

  /**
   * @description Map of native UI ButtonSet constants.
   * @returns {GoogleAppsScript.Base.ButtonSet}
   */
  get ButtonSet() {
    return this._ui.ButtonSet;
  }
}
