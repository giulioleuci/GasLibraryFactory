/**
 * @file ComposableContentLib/src/registry/BlockRegistry.js
 * @description Registry for block definitions and factories.
 * @version 1.0.0
 */

import { TypeGuards } from '@CoreUtilsLib';
import { BlockDefinition } from '../core/BlockDefinition.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
 * Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.
 * @class
 */
export class BlockRegistry {
  /**
   * Initializes a new BlockRegistry instance.
   * @param {Object} [options={}] Registry configuration.
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
     * Internal map of block definitions indexed by ID.
     * @type {Map<string, BlockDefinition>}
     * @private
     */
    this._definitions = new Map();

    /**
     * Internal map of factory functions indexed by ID.
     * @type {Map<string, Function>}
     * @private
     */
    this._factories = new Map();
  }

  /**
   * Registers a block type definition and its associated factory function.
   * @param {Object} registration Registration payload.
   * @param {Object|BlockDefinition} registration.definition Block configuration or definition instance.
   * @param {Function} registration.factory Factory function with signature (definition, config) => ContentBlock.
   * @returns {BlockDefinition} The registered definition instance.
   * @throws {Error} If registration payload, definition, or factory function is missing/invalid.
   */
  register(registration) {
    if (!TypeGuards.isObject(registration)) {
      throw new Error('Registration object is required');
    }

    const { definition, factory } = registration;

    if (!definition) {
      throw new Error('Block definition is required');
    }
    if (!TypeGuards.isFunction(factory)) {
      throw new Error('Factory function is required');
    }

    // Convert to BlockDefinition if needed
    const blockDef =
      definition instanceof BlockDefinition ? definition : new BlockDefinition(definition);

    this._definitions.set(blockDef.id, blockDef);
    this._factories.set(blockDef.id, factory);

    this._logger.debug?.(`BlockRegistry: Registered block type '${blockDef.id}'`);

    return blockDef;
  }

  /**
   * Removes a block type and its factory from the registry.
   * @param {string} blockType Target block type ID.
   * @returns {boolean} True if the block type existed and was successfully removed.
   */
  unregister(blockType) {
    const existed = this._definitions.has(blockType);
    this._definitions.delete(blockType);
    this._factories.delete(blockType);

    if (existed) {
      this._logger.debug?.(`BlockRegistry: Unregistered block type '${blockType}'`);
    }

    return existed;
  }

  /**
   * Retrieves a block definition by ID.
   * @param {string} blockType Target block type ID.
   * @returns {BlockDefinition} The associated definition instance.
   * @throws {BlockNotFoundError} If the block type is not registered.
   */
  getDefinition(blockType) {
    const definition = this._definitions.get(blockType);
    if (!definition) {
      throw new BlockNotFoundError(blockType);
    }
    return definition;
  }

  /**
   * Retrieves a block definition or null if unregistered.
   * @param {string} blockType Target block type ID.
   * @returns {BlockDefinition|null} The definition instance or null.
   */
  getDefinitionOrNull(blockType) {
    return this._definitions.get(blockType) || null;
  }

  /**
   * Instantiates a block using its registered factory.
   * @param {string} blockType Target block type ID.
   * @param {Object} [config={}] Instance-specific configuration.
   * @returns {ContentBlock} The instantiated content block.
   * @throws {BlockNotFoundError} If the block type factory is not registered.
   */
  createBlock(blockType, config = {}) {
    const definition = this.getDefinition(blockType);
    const factory = this._factories.get(blockType);

    return factory(definition, config);
  }

  /**
   * Validates presence of a block type in the registry.
   * @param {string} blockType Target block type ID.
   * @returns {boolean} True if registered.
   */
  has(blockType) {
    return this._definitions.has(blockType);
  }

  /**
   * Retrieves all registered block type identifiers.
   * @returns {string[]} Collection of block IDs.
   */
  getBlockTypes() {
    return Array.from(this._definitions.keys());
  }

  /**
   * Retrieves all registered block definitions.
   * @returns {BlockDefinition[]} Collection of definition instances.
   */
  getAllDefinitions() {
    return Array.from(this._definitions.values());
  }

  /**
   * Returns current count of registered block types.
   * @returns {number} Registration count.
   */
  size() {
    return this._definitions.size;
  }

  /**
   * Purges all block definitions and factories from the registry.
   */
  clear() {
    this._definitions.clear();
    this._factories.clear();
    this._logger.debug?.('BlockRegistry: Cleared all registrations');
  }

  /**
   * Filters definitions by output format compatibility.
   * @param {string} format Target output format.
   * @returns {BlockDefinition[]} Subset of definitions supporting the format.
   */
  getBlocksForFormat(format) {
    return this.getAllDefinitions().filter((def) => def.supportsFormat(format));
  }

  /**
   * Returns diagnostic summary string including current registration count.
   * @returns {string} Diagnostic summary.
   */
  toString() {
    return `BlockRegistry[${this._definitions.size} block types]`;
  }
}
