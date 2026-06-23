/**
 * @file ComposableContentLib/src/core/BlockDefinition.js
 * @description BlockDefinition for declarative block type definitions.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import {
  EmptyBehavior,
  ContainerType,
  OutputFormat,
  isValidEmptyBehavior,
  isValidContainerType,
  isValidOutputFormat
} from './EmptyBehavior.js';

/**
 * @description Immutable blueprint for a reusable content block type.
 * Specifies rendering capabilities, context data dependencies, structural containment, and fallback behaviors.
 * @class
 * @example
 * const headerBlock = new BlockDefinition({
 *   id: 'email_header',
 *   name: 'Email Header',
 *   dataRequirements: ['recipient', 'subject'],
 *   supportedFormats: ['html', 'text'],
 *   emptyBehavior: EmptyBehavior.HIDE
 * });
 */
export class BlockDefinition {
  /**
   * @description Validates and freezes a new block type definition.
   * @param {Object} definition Block configuration payload.
   * @param {string} definition.id Unique identifier (e.g., 'hero_banner').
   * @param {string} definition.name Display name for UI/logging.
   * @param {string} [definition.description=''] Purpose and usage details.
   * @param {string[]} [definition.dataRequirements=[]] Keys required from the BlockDataContext.
   * @param {string} [definition.defaultVisibility='always'] Default evaluation string.
   * @param {number} [definition.defaultOrder=0] Rendering sequence priority.
   * @param {string[]} [definition.supportedFormats=['html','markdown','text']] Compatible output modes.
   * @param {string} [definition.emptyBehavior=EmptyBehavior.HIDE] Action when resolved content is empty.
   * @param {string} [definition.containerType=ContainerType.NONE] HTML wrapper type (e.g., 'div', 'section').
   * @param {Object} [definition.metadata={}] Extended configuration for custom renderers.
   * @throws {Error} If ID, name, format, emptyBehavior, or containerType are invalid.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('BlockDefinition requires a definition object');
    }

    const {
      id,
      name,
      description = '',
      dataRequirements = [],
      defaultVisibility = 'always',
      defaultOrder = 0,
      supportedFormats = [OutputFormat.HTML, OutputFormat.MARKDOWN, OutputFormat.TEXT],
      emptyBehavior = EmptyBehavior.HIDE,
      containerType = ContainerType.NONE,
      metadata = {}
    } = definition;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('BlockDefinition id is required and must be a string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('BlockDefinition name is required and must be a string');
    }
    if (!Array.isArray(dataRequirements)) {
      throw new Error('BlockDefinition dataRequirements must be an array');
    }
    if (!Array.isArray(supportedFormats) || supportedFormats.length === 0) {
      throw new Error('BlockDefinition supportedFormats must be a non-empty array');
    }
    for (const format of supportedFormats) {
      if (!isValidOutputFormat(format)) {
        throw new Error(`Invalid output format: ${format}`);
      }
    }
    if (!isValidEmptyBehavior(emptyBehavior)) {
      throw new Error(`Invalid empty behavior: ${emptyBehavior}`);
    }
    if (!isValidContainerType(containerType)) {
      throw new Error(`Invalid container type: ${containerType}`);
    }

    /**
     * Unique block type identifier.
     * @type {string}
     * @readonly
     */
    this.id = id;

    /**
     * Human-readable name.
     * @type {string}
     * @readonly
     */
    this.name = name;

    /**
     * Block description.
     * @type {string}
     * @readonly
     */
    this.description = description;

    /**
     * Required data keys from context.
     * @type {string[]}
     * @readonly
     */
    this.dataRequirements = Object.freeze([...dataRequirements]);

    /**
     * Default visibility expression.
     * @type {string}
     * @readonly
     */
    this.defaultVisibility = defaultVisibility;

    /**
     * Default ordering priority.
     * @type {number}
     * @readonly
     */
    this.defaultOrder = defaultOrder;

    /**
     * Supported output formats.
     * @type {string[]}
     * @readonly
     */
    this.supportedFormats = Object.freeze([...supportedFormats]);

    /**
     * Behavior when block is empty.
     * @type {string}
     * @readonly
     */
    this.emptyBehavior = emptyBehavior;

    /**
     * Container wrapper type.
     * @type {string}
     * @readonly
     */
    this.containerType = containerType;

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = Object.freeze(cloneDeep(metadata));

    Object.freeze(this);
  }

  /**
   * @description Validates if the block type can render to the requested output format.
   * @param {string} format Target format (e.g., 'html').
   * @returns {boolean} True if supported.
   */
  supportsFormat(format) {
    return this.supportedFormats.includes(format);
  }

  /**
   * @description Checks if a specific data key is mandated by this block type.
   * @param {string} key Context data property name.
   * @returns {boolean} True if explicitly required.
   */
  requiresData(key) {
    return this.dataRequirements.includes(key);
  }

  /**
   * @description Determines if the block has any strictly defined context data dependencies.
   * @returns {boolean} True if requirements array is non-empty.
   */
  hasDataRequirements() {
    return this.dataRequirements.length > 0;
  }

  /**
   * @description Evaluates if the block should be omitted from output when its resolved content is empty.
   * @returns {boolean} True if behavior is EmptyBehavior.HIDE.
   */
  hidesWhenEmpty() {
    return this.emptyBehavior === EmptyBehavior.HIDE;
  }

  /**
   * @description Checks if the block bypasses conditional visibility checks by default.
   * @returns {boolean} True if defaultVisibility is 'always'.
   */
  isAlwaysVisible() {
    return this.defaultVisibility === 'always';
  }

  /**
   * @description Resolves a custom configuration value from the definition's metadata block.
   * @param {string} key Target metadata property.
   * @param {*} [defaultValue=undefined] Fallback if key is absent.
   * @returns {*} Stored value or fallback.
   */
  getMetadata(key, defaultValue) {
    return this.metadata.hasOwnProperty(key) ? this.metadata[key] : defaultValue;
  }

  /**
   * @description Checks if the block is disabled by default.
   * @returns {boolean} True if defaultVisibility is 'never'.
   */
  isNeverVisible() {
    return this.defaultVisibility === 'never';
  }

  /**
   * @description Serializes the definition into a plain, deep-cloned state object.
   * @returns {Object} JSON-safe representation.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dataRequirements: [...this.dataRequirements],
      defaultVisibility: this.defaultVisibility,
      defaultOrder: this.defaultOrder,
      supportedFormats: [...this.supportedFormats],
      emptyBehavior: this.emptyBehavior,
      containerType: this.containerType,
      metadata: { ...this.metadata }
    };
  }

  /**
   * @description Rehydrates a BlockDefinition instance from a serialized state object.
   * @param {Object} obj Valid definition payload.
   * @returns {BlockDefinition} Restored definition model.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid block definition object');
    }
    return new BlockDefinition(obj);
  }

  /**
   * @description Returns a diagnostic summary string for logging and debugging.
   * @returns {string} String identifier.
   */
  toString() {
    return `BlockDefinition[${this.id}] "${this.name}" (${this.supportedFormats.join(', ')})`;
  }
}
