/**
 * @file ComposableContentLib/src/core/ContentBlock.js
 * @description ContentBlock base class for content blocks.
 * @version 1.0.0
 */

import { BlockResult } from './BlockResult.js';

/**
 * @description Abstract base class defining the execution contract for content blocks.
 * Subclasses implement data extraction, empty state evaluation, and template resolution.
 * @class
 * @abstract
 * @example
 * class HeaderBlock extends ContentBlock {
 *   getData(ctx) { return { title: ctx.get('title') }; }
 *   isEmpty(data) { return !data.title; }
 *   getTemplateId(format) { return `header_${format}`; }
 * }
 */
export class ContentBlock {
  /**
   * @description Initializes block with its definition blueprint and runtime configuration.
   * @param {BlockDefinition} definition Immutable type specification.
   * @param {Object} [config={}] Instance-specific configuration overrides.
   * @throws {Error} If definition is missing.
   */
  constructor(definition, config = {}) {
    if (!definition) {
      throw new Error('ContentBlock requires a definition');
    }

    /**
     * Block definition.
     * @type {BlockDefinition}
     * @readonly
     */
    this.definition = definition;

    /**
     * Instance-specific configuration.
     * @type {Object}
     * @readonly
     */
    this.config = Object.freeze({ ...config });
  }

  /**
   * @description Returns the unique identifier from the block definition.
   * @returns {string} Block type ID.
   */
  getTypeId() {
    return this.definition.id;
  }

  /**
   * @description Returns the human-readable name from the block definition.
   * @returns {string} Block name.
   */
  getName() {
    return this.definition.name;
  }

  /**
   * @description Extracts required rendering data from the global context.
   * @param {BlockDataContext} context Current state payload.
   * @returns {Object} Extracted data dictionary.
   * @abstract
   */
  getData(context) {
    throw new Error('ContentBlock.getData() must be implemented by subclass');
  }

  /**
   * @description Evaluates if the extracted data represents an empty state.
   * @param {Object} data Output from getData().
   * @returns {boolean} True if empty.
   * @abstract
   */
  isEmpty(data) {
    throw new Error('ContentBlock.isEmpty() must be implemented by subclass');
  }

  /**
   * @description Resolves the format-specific template identifier for this block.
   * @param {string} format Target rendering format.
   * @returns {string} Template ID.
   * @abstract
   */
  getTemplateId(format) {
    throw new Error('ContentBlock.getTemplateId() must be implemented by subclass');
  }

  /**
   * @description Orchestrates the block lifecycle: data extraction, empty state handling, and template rendering.
   * @param {string} instanceId Unique instance identifier.
   * @param {BlockDataContext} context Data payload.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Engine capable of processing the template.
   * @returns {BlockResult} Encapsulated execution outcome.
   */
  evaluate(instanceId, context, format, renderer) {
    const startTime = Date.now();

    try {
      // 1. Get data from context
      const data = this.getData(context);

      // 2. Check if empty
      const empty = this.isEmpty(data);

      // 3. Handle empty behavior
      if (empty && this.definition.hidesWhenEmpty()) {
        return BlockResult.hidden(instanceId, this.getTypeId(), 'empty');
      }

      // 4. Get template and render
      const templateId = this.getTemplateId(format);
      const content = this.render(data, format, renderer, templateId);

      return new BlockResult({
        instanceId,
        blockType: this.getTypeId(),
        isEmpty: empty,
        isVisible: true,
        content,
        metadata: this._getMetadata(data),
        processingTime: Date.now() - startTime
      });
    } catch (error) {
      return BlockResult.error(instanceId, this.getTypeId(), error);
    }
  }

  /**
   * @description Delegates final string generation to the injected renderer.
   * @param {Object} data Extracted payload.
   * @param {string} format Output format.
   * @param {BlockRenderer} renderer Engine instance.
   * @param {string} templateId Resolved template identifier.
   * @returns {string} Rendered content string.
   * @throws {Error} If renderer is not provided.
   */
  render(data, format, renderer, templateId) {
    if (!renderer) {
      throw new Error('Renderer is required for rendering');
    }

    return renderer.render(templateId, data, {
      format,
      blockType: this.getTypeId(),
      config: this.config,
      containerType: this.definition.containerType
    });
  }

  /**
   * @description Generates diagnostic metadata for the BlockResult.
   * @param {Object} data Extracted block data.
   * @returns {Object} Metadata dictionary.
   * @protected
   */
  _getMetadata(data) {
    return {
      blockType: this.getTypeId(),
      blockName: this.getName()
    };
  }

  /**
   * @description Verifies format support against the block definition.
   * @param {string} format Target output format.
   * @returns {boolean} True if supported.
   */
  supportsFormat(format) {
    return this.definition.supportsFormat(format);
  }

  /**
   * @description Returns a diagnostic string identifier for the block.
   * @returns {string} String representation.
   */
  toString() {
    return `ContentBlock[${this.getTypeId()}] "${this.getName()}"`;
  }
}

/**
 * @description Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.
 * @class
 * @extends ContentBlock
 * @example
 * const block = new SimpleContentBlock(def, {
 *   dataExtractor: (ctx) => ({ name: ctx.get('name') }),
 *   templates: { html: 'tpl_html' }
 * });
 */
export class SimpleContentBlock extends ContentBlock {
  /**
   * @description Initializes a simple block with functional callbacks for lifecycle methods.
   * @param {BlockDefinition} definition Immutable type specification.
   * @param {Object} config Configuration payload.
   * @param {Function} config.dataExtractor Strategy for `getData`.
   * @param {Function} [config.emptyChecker] Strategy for `isEmpty`.
   * @param {Object} config.templates Format-to-TemplateId mapping.
   * @throws {Error} If dataExtractor or templates are missing.
   */
  constructor(definition, config) {
    super(definition, config);

    if (typeof config.dataExtractor !== 'function') {
      throw new Error('SimpleContentBlock requires a dataExtractor function');
    }
    if (!config.templates || typeof config.templates !== 'object') {
      throw new Error('SimpleContentBlock requires a templates object');
    }

    /**
     * Data extractor function.
     * @type {Function}
     * @private
     */
    this._dataExtractor = config.dataExtractor;

    /**
     * Empty checker function.
     * @type {Function}
     * @private
     */
    this._emptyChecker = config.emptyChecker || (() => false);

    /**
     * Template IDs by format.
     * @type {Object}
     * @private
     */
    this._templates = config.templates;
  }

  /**
   * @description Executes the injected data extractor function.
   * @param {BlockDataContext} context Target data context.
   * @returns {Object} Extracted data.
   */
  getData(context) {
    return this._dataExtractor(context);
  }

  /**
   * @description Executes the injected empty checker function.
   * @param {Object} data Extracted payload.
   * @returns {boolean} True if empty.
   */
  isEmpty(data) {
    return this._emptyChecker(data);
  }

  /**
   * @description Resolves the template ID from the injected format mapping.
   * @param {string} format Target format.
   * @returns {string} Mapped template ID.
   * @throws {Error} If no template is mapped for the format.
   */
  getTemplateId(format) {
    const templateId = this._templates[format];
    if (!templateId) {
      throw new Error(`No template defined for format: ${format}`);
    }
    return templateId;
  }
}
