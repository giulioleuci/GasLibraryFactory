/**
 * @file GoogleApiWrapper/src/utils/MenuBuilder.js
 * @description Fluent builder for creating Google Apps Script menus
 * @version 1.0 - Initial implementation
 */

/**
 * @class MenuBuilder
 * @description Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.
 * 
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
 * @property {GoogleAppsScript.Base.Menu} _menu Current native menu object.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {string} _caption Menu header label.
 */
export class MenuBuilder {
  /**
   * @description Initializes MenuBuilder and provisions a native Menu instance.
   * @param {GoogleAppsScript.Base.Ui} ui Native GAS UI object.
   * @param {string} caption Menu header label.
   * @param {LoggerService} logger Diagnostic logger.
   * @throws {Error} If ui, caption, or logger is missing.
   */
  constructor(ui, caption, logger) {
    if (!ui) {
      throw new Error('MenuBuilder: ui is required');
    }
    if (!caption || typeof caption !== 'string') {
      throw new Error('MenuBuilder: caption must be a non-empty string');
    }
    if (!logger) {
      throw new Error('MenuBuilder: logger is required');
    }

    /**
     * The native UI object
     * @private
     * @type {GoogleAppsScript.Base.Ui}
     */
    this._ui = ui;

    /**
     * The native Menu object
     * @private
     * @type {GoogleAppsScript.Base.Menu}
     */
    this._menu = ui.createMenu(caption);

    /**
     * Logger for debugging
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Menu caption
     * @private
     * @type {string}
     */
    this._caption = caption;

    this._logger.debug(`MenuBuilder: Created menu "${caption}"`);
  }

  /**
   * @description Appends a command item to the menu. Requires a globally-scoped handler function.
   * @param {string} caption Item display label.
   * @param {string} functionName Name of the global function to execute.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} On invalid caption or functionName.
   */
  addItem(caption, functionName) {
    if (!caption || typeof caption !== 'string') {
      throw new Error('MenuBuilder.addItem: caption must be a non-empty string');
    }
    if (!functionName || typeof functionName !== 'string') {
      throw new Error('MenuBuilder.addItem: functionName must be a non-empty string');
    }

    this._menu.addItem(caption, functionName);
    this._logger.debug(`MenuBuilder: Added item "${caption}" → ${functionName}`);
    return this;
  }

  /**
   * @description Appends a visual horizontal divider.
   * @returns {MenuBuilder} Current instance for chaining.
   */
  addSeparator() {
    this._menu.addSeparator();
    this._logger.debug('MenuBuilder: Added separator');
    return this;
  }

  /**
   * @description Nestles another menu hierarchy within the current menu.
   * @param {MenuBuilder} subMenuBuilder Pre-configured builder for the submenu.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} If subMenuBuilder is not a valid MenuBuilder.
   */
  addSubMenu(subMenuBuilder) {
    if (!subMenuBuilder || !(subMenuBuilder instanceof MenuBuilder)) {
      throw new Error('MenuBuilder.addSubMenu: subMenuBuilder must be a MenuBuilder instance');
    }

    this._menu.addSubMenu(subMenuBuilder._menu);
    this._logger.debug(`MenuBuilder: Added submenu "${subMenuBuilder._caption}"`);
    return this;
  }

  /**
   * @description Commits the builder state to the host UI. Mandatory final operation.
   */
  addToUi() {
    this._menu.addToUi();
    this._logger.debug(`MenuBuilder: Added menu "${this._caption}" to UI`);
  }

  /**
   * @description Returns the configured native GAS Menu object.
   * @returns {GoogleAppsScript.Base.Menu}
   */
  getNativeMenu() {
    return this._menu;
  }
}
