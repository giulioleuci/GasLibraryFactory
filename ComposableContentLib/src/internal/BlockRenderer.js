/**
 * @file ComposableContentLib/src/rendering/BlockRenderer.js
 * @description BlockRenderer base class and implementations.
 * @version 1.0.0
 */

import { TemplateNotFoundError, RenderingError } from '../errors/ComposableContentError.js';
import { ContainerType } from '../core/EmptyBehavior.js';

/**
 * Abstract base class for block rendering engines. Subclasses must implement format-specific logic.
 * @class
 * @abstract
 */
export class BlockRenderer {
  /**
   * Initializes a new BlockRenderer instance.
   * @param {Object} [options={}] Renderer configuration.
   * @param {Object} [options.logger=console] Logger implementation for diagnostic output.
   * @param {Object<string, string|Function>} [options.templates={}] Map of template identifiers to strings or functions.
   */
  constructor(options = {}) {
    /**
     * Logger implementation.
     * @type {Object}
     * @protected
     */
    this._logger = options.logger || console;

    /**
     * Internal registry of rendering templates.
     * @type {Map<string, string|Function>}
     * @protected
     */
    this._templates = new Map(Object.entries(options.templates || {}));
  }

  /**
   * Retrieves the target output format identifier.
   * @returns {string} Format ID (e.g., 'html', 'markdown', 'text').
   * @abstract
   * @throws {Error} If called directly on base class.
   */
  getFormat() {
    throw new Error('BlockRenderer.getFormat() must be implemented');
  }

  /**
   * Executes template rendering with provided data and options.
   * @param {string} templateId Target template identifier.
   * @param {Object} data Source data for interpolation.
   * @param {Object} [options={}] Rendering configuration.
   * @param {string} [options.containerType] Optional container wrapping (ContainerType enum).
   * @param {string} [options.blockType] Block type ID for class name generation.
   * @returns {string} Fully rendered content string.
   * @throws {TemplateNotFoundError} If templateId is not registered.
   * @throws {RenderingError} If rendering logic or interpolation fails.
   */
  render(templateId, data, options = {}) {
    const template = this._templates.get(templateId);

    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    try {
      let content;

      if (typeof template === 'function') {
        content = template(data, options);
      } else {
        content = this._processTemplate(template, data);
      }

      // Apply container if specified
      if (options.containerType && options.containerType !== ContainerType.NONE) {
        content = this._wrapInContainer(content, options.containerType, options);
      }

      return content;
    } catch (error) {
      throw new RenderingError(
        `Failed to render template ${templateId}`,
        options.blockType || 'unknown',
        this.getFormat(),
        error
      );
    }
  }

  /**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
  _processTemplate(template, data) {
    // Simple {{variable}} substitution
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this._getValueByPath(data, path);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  /**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
  _getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Wraps rendered content in a format-specific container structure.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type (ContainerType enum).
   * @param {Object} options Original rendering options.
   * @returns {string} Wrapped output.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    return content;
  }

  /**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
  registerTemplate(templateId, template) {
    this._templates.set(templateId, template);
    return this;
  }

  /**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
  registerTemplates(templates) {
    for (const [id, template] of Object.entries(templates)) {
      this._templates.set(id, template);
    }
    return this;
  }

  /**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
  hasTemplate(templateId) {
    return this._templates.has(templateId);
  }

  /**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
  templateCount() {
    return this._templates.size;
  }

  /**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
  toString() {
    return `BlockRenderer[${this.getFormat()}] ${this._templates.size} templates`;
  }
}

/**
 * HTML-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
export class HtmlRenderer extends BlockRenderer {
  /**
   * Returns 'html' format identifier.
   * @returns {string}
   */
  getFormat() {
    return 'html';
  }

  /**
   * Wraps content in HTML structural elements (div, section) based on ContainerType.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} HTML wrapped content.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    const blockType = options.blockType || 'block';

    switch (containerType) {
      case ContainerType.BOX:
        return `<div class="content-block content-block--${blockType}">${content}</div>`;

      case ContainerType.CARD:
        return `<div class="content-card content-card--${blockType}"><div class="content-card__body">${content}</div></div>`;

      case ContainerType.SECTION:
        return `<section class="content-section content-section--${blockType}">${content}</section>`;

      default:
        return content;
    }
  }
}

/**
 * Markdown-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
export class MarkdownRenderer extends BlockRenderer {
  /**
   * Returns 'markdown' format identifier.
   * @returns {string}
   */
  getFormat() {
    return 'markdown';
  }

  /**
   * Wraps content in Markdown block syntax (blockquote, horizontal rules).
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} Markdown wrapped content.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    switch (containerType) {
      case ContainerType.BOX:
        return `> ${content.split('\n').join('\n> ')}`;

      case ContainerType.CARD:
        return `---\n${content}\n---`;

      case ContainerType.SECTION:
        return `\n${content}\n`;

      default:
        return content;
    }
  }
}

/**
 * Plain text specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
export class PlainTextRenderer extends BlockRenderer {
  /**
   * Returns 'text' format identifier.
   * @returns {string}
   */
  getFormat() {
    return 'text';
  }

  /**
   * Wraps content in basic text delimiters.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} Text wrapped content.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    switch (containerType) {
      case ContainerType.BOX:
      case ContainerType.CARD:
        return `[${content}]`;

      case ContainerType.SECTION:
        return `\n${content}\n`;

      default:
        return content;
    }
  }
}
