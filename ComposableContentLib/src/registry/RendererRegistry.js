/**
 * @file ComposableContentLib/src/registry/RendererRegistry.js
 * @description Registry for block renderers by output format.
 * @version 1.0.0
 */

import { RendererNotFoundError } from '../errors/ComposableContentError.js';
import { HtmlRenderer, MarkdownRenderer, PlainTextRenderer } from '../internal/BlockRenderer.js';
import { Registry } from '@CoreUtilsLib';

/**
 * Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').
 * @class
 */
export class RendererRegistry {
  /**
   * Initializes a new RendererRegistry instance.
   * @param {Object} [options={}] Registry configuration.
   * @param {boolean} [options.registerDefaults=true] Whether to auto-register built-in renderers (HTML, Markdown, PlainText).
   * @param {Object} [options.logger=console] Logger implementation for diagnostic output.
   */
  constructor(options = {}) {
    /**
     * Logger implementation.
     * @type {Object}
     * @private
     */
    this._logger = options.logger || console;

    /**
     * Internal map of renderers indexed by output format string.
     * @type {Map<string, BlockRenderer>}
     * @private
     */
    this._renderers = new Registry({ entityName: 'renderer' });

    // Register default renderers
    if (options.registerDefaults !== false) {
      this._registerDefaults();
    }
  }

  /**
   * Instantiates and registers the built-in HTML, Markdown, and PlainText renderers.
   * @private
   */
  _registerDefaults() {
    this.register(new HtmlRenderer({ logger: this._logger }));
    this.register(new MarkdownRenderer({ logger: this._logger }));
    this.register(new PlainTextRenderer({ logger: this._logger }));
  }

  /**
   * Adds a renderer instance to the registry.
   * @param {BlockRenderer} renderer Renderer instance to register.
   * @returns {RendererRegistry} Fluent interface for chaining.
   * @throws {Error} If renderer is null or lacks the required getFormat() method.
   */
  register(renderer) {
    if (!renderer || typeof renderer.getFormat !== 'function') {
      throw new Error('Invalid renderer: must have getFormat() method');
    }

    const format = renderer.getFormat();
    this._renderers.set(format, renderer);
    this._logger.debug?.(`RendererRegistry: Registered renderer for '${format}'`);

    return this;
  }

  /**
   * Removes the renderer associated with the specified format.
   * @param {string} format Target output format ID.
   * @returns {boolean} True if the renderer was successfully removed.
   */
  unregister(format) {
    const existed = this._renderers.has(format);
    this._renderers.unregister(format);
    return existed;
  }

  /**
   * Retrieves a renderer by output format.
   * @param {string} format Target output format ID.
   * @returns {BlockRenderer} The associated renderer instance.
   * @throws {RendererNotFoundError} If no renderer is registered for the specified format.
   */
  get(format) {
    const renderer = this._renderers.get(format);
    if (!renderer) {
      throw new RendererNotFoundError(format);
    }
    return renderer;
  }

  /**
   * Retrieves a renderer or null if unregistered.
   * @param {string} format Target output format ID.
   * @returns {BlockRenderer|null} The renderer instance or null.
   */
  getOrNull(format) {
    return this._renderers.get(format) || null;
  }

  /**
   * Validates presence of a renderer for the specified format.
   * @param {string} format Target output format ID.
   * @returns {boolean} True if a renderer exists.
   */
  has(format) {
    return this._renderers.has(format);
  }

  /**
   * Retrieves all registered output format identifiers.
   * @returns {string[]} Collection of format IDs.
   */
  getFormats() {
    return Array.from(this._renderers.keys());
  }

  /**
   * Retrieves all registered renderer instances.
   * @returns {BlockRenderer[]} Collection of renderer instances.
   */
  getAllRenderers() {
    return Array.from(this._renderers.values());
  }

  /**
   * Returns current count of registered renderers.
   * @returns {number} Registration count.
   */
  size() {
    return this._renderers.size;
  }

  /**
   * Purges all renderer registrations.
   */
  clear() {
    this._renderers.clear();
  }

  /**
   * Returns diagnostic summary string including current registration count and supported formats.
   * @returns {string} Diagnostic summary.
   */
  toString() {
    return `RendererRegistry[${this._renderers.size} formats: ${this.getFormats().join(', ')}]`;
  }
}
