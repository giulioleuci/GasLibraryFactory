/**
 * @file GoogleApiWrapper/src/utils/DialogBuilder.js
 * @description Fluent builder for creating modal HTML dialogs in Google Apps Script
 * @version 1.0 - Initial implementation
 */

/**
 * @class DialogBuilder
 * @description Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.
 * 
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {GoogleAppsScript.HTML.HtmlOutput|null} _htmlOutput Pending output object.
 * @property {string} _title Dialog header.
 * @property {number|null} _width Width in pixels.
 * @property {number|null} _height Height in pixels.
 */
export class DialogBuilder {
  /**
   * @description Initializes DialogBuilder with native UI and logging context.
   * @param {GoogleAppsScript.Base.Ui} ui Native GAS UI object.
   * @param {LoggerService} logger Diagnostic logger.
   * @throws {Error} If ui or logger is missing.
   */
  constructor(ui, logger) {
    if (!ui) {
      throw new Error('DialogBuilder: ui is required');
    }
    if (!logger) {
      throw new Error('DialogBuilder: logger is required');
    }

    /**
     * The native UI object
     * @private
     * @type {GoogleAppsScript.Base.Ui}
     */
    this._ui = ui;

    /**
     * Logger for debugging
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * The HtmlOutput object (created when content is set)
     * @private
     * @type {GoogleAppsScript.HTML.HtmlOutput|null}
     */
    this._htmlOutput = null;

    /**
     * Dialog title
     * @private
     * @type {string}
     */
    this._title = 'Dialog';

    /**
     * Dialog width in pixels
     * @private
     * @type {number|null}
     */
    this._width = null;

    /**
     * Dialog height in pixels
     * @private
     * @type {number|null}
     */
    this._height = null;

    this._logger.debug('DialogBuilder: Instance created');
  }

  /**
   * @description Sets the window title.
   * @param {string} title Dialog header text.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid title string.
   */
  setTitle(title) {
    if (!title || typeof title !== 'string') {
      throw new Error('DialogBuilder.setTitle: title must be a non-empty string');
    }

    this._title = title;
    this._logger.debug(`DialogBuilder: Set title to "${title}"`);
    return this;
  }

  /**
   * @description Maps raw HTML string to the builder's output state.
   * @param {string} html Valid HTML content.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid HTML input.
   */
  setContent(html) {
    if (typeof html !== 'string') {
      throw new Error('DialogBuilder.setContent: html must be a string');
    }

    this._htmlOutput = HtmlService.createHtmlOutput(html);
    this._logger.debug('DialogBuilder: Set content from HTML string');
    return this;
  }

  /**
   * @description Evaluates an HtmlTemplate and maps result to output state.
   * @param {GoogleAppsScript.HTML.HtmlTemplate} template Template object with scriptlets.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} If template is invalid or evaluation fails.
   */
  setContentFromTemplate(template) {
    if (!template || typeof template.evaluate !== 'function') {
      throw new Error(
        'DialogBuilder.setContentFromTemplate: template must be an HtmlTemplate object'
      );
    }

    this._htmlOutput = template.evaluate();
    this._logger.debug('DialogBuilder: Set content from HtmlTemplate');
    return this;
  }

  /**
   * @description Overrides default dialog width.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
  setWidth(pixels) {
    if (typeof pixels !== 'number' || pixels <= 0) {
      throw new Error('DialogBuilder.setWidth: pixels must be a positive number');
    }

    this._width = pixels;
    this._logger.debug(`DialogBuilder: Set width to ${pixels}px`);
    return this;
  }

  /**
   * @description Overrides default dialog height.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
  setHeight(pixels) {
    if (typeof pixels !== 'number' || pixels <= 0) {
      throw new Error('DialogBuilder.setHeight: pixels must be a positive number');
    }

    this._height = pixels;
    this._logger.debug(`DialogBuilder: Set height to ${pixels}px`);
    return this;
  }

  /**
   * @description Renders the dialog in the host UI. Blocks script execution until closed.
   * @throws {Error} If no content was provided prior to call.
   */
  show() {
    if (!this._htmlOutput) {
      throw new Error('DialogBuilder.show: Must set content before showing dialog');
    }

    // Apply configuration
    this._htmlOutput.setTitle(this._title);

    if (this._width !== null) {
      this._htmlOutput.setWidth(this._width);
    }

    if (this._height !== null) {
      this._htmlOutput.setHeight(this._height);
    }

    // Show the dialog
    this._ui.showModalDialog(this._htmlOutput, this._title);
    this._logger.debug(
      `DialogBuilder: Showed dialog "${this._title}" (${this._width}x${this._height}px)`
    );
  }

  /**
   * @description Returns the configured HtmlOutput object.
   * @returns {GoogleAppsScript.HTML.HtmlOutput|null}
   */
  getHtmlOutput() {
    return this._htmlOutput;
  }
}
