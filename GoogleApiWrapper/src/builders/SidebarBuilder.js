/**
 * @file GoogleApiWrapper/src/builders/SidebarBuilder.js
 * @description Fluent builder for creating HTML sidebars in Google Apps Script
 * @version 1.0
 */

export class SidebarBuilder {
  constructor(ui, logger) {
    if (!ui) {
      throw new Error('SidebarBuilder: ui is required');
    }
    if (!logger) {
      throw new Error('SidebarBuilder: logger is required');
    }
    this._ui = ui;
    this._logger = logger;
    this._htmlOutput = null;
    this._title = 'Sidebar';
    this._width = 300;
    this._logger.debug('SidebarBuilder: Instance created');
  }

  setTitle(title) {
    if (typeof title !== 'string' || title.length === 0) {
      throw new Error('SidebarBuilder.setTitle: title must be a non-empty string');
    }
    this._title = title;
    this._logger.debug(`SidebarBuilder: Set title to "${title}"`);
    return this;
  }

  setContent(html) {
    if (typeof html !== 'string') {
      throw new Error('SidebarBuilder.setContent: html must be a string');
    }
    this._htmlOutput = HtmlService.createHtmlOutput(html);
    this._logger.debug('SidebarBuilder: Set content from HTML string');
    return this;
  }

  setContentFromTemplate(template) {
    if (!template || typeof template.evaluate !== 'function') {
      throw new Error(
        'SidebarBuilder.setContentFromTemplate: template must be an HtmlTemplate object'
      );
    }
    this._htmlOutput = template.evaluate();
    this._logger.debug('SidebarBuilder: Set content from HtmlTemplate');
    return this;
  }

  setWidth(pixels) {
    if (typeof pixels !== 'number' || pixels <= 0) {
      throw new Error('SidebarBuilder.setWidth: pixels must be a positive number');
    }
    this._width = pixels;
    this._logger.debug(`SidebarBuilder: Set width to ${pixels}px`);
    return this;
  }

  show() {
    if (!this._htmlOutput) {
      throw new Error('SidebarBuilder.show: Must set content before showing sidebar');
    }
    this._htmlOutput.setTitle(this._title);
    this._htmlOutput.setWidth(this._width);
    this._ui.showSidebar(this._htmlOutput);
    this._logger.debug(`SidebarBuilder: Showed sidebar "${this._title}" (width: ${this._width}px)`);
  }

  getHtmlOutput() {
    return this._htmlOutput;
  }
}
