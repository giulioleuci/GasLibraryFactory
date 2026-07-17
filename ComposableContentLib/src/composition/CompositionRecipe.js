/**
 * @file ComposableContentLib/src/composition/CompositionRecipe.js
 * @description CompositionRecipe for defining content composition.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import { OutputFormat, isValidOutputFormat } from '../core/EmptyBehavior.js';
import { RecipeValidationError } from '../errors/ComposableContentError.js';

/**
 * BlockInstance - Configuration for a block instance within a recipe.
 *
 * @typedef {Object} BlockInstance
 * @property {string} instanceId - Unique instance identifier
 * @property {string} blockType - Block type ID from registry
 * @property {string} [visibility='always'] - Visibility expression
 * @property {number} [order=0] - Display order
 * @property {Object} [config={}] - Block-specific configuration
 */

/**
 * @description Immutable model for multi-block content composition.
 * Defines block selection, execution order, visibility logic, and serialization metadata.
 * @class
 * @example
 * const recipe = new CompositionRecipe({
 *   id: 'welcome_email',
 *   name: 'Welcome Email',
 *   outputFormat: 'html',
 *   blocks: [
 *     { instanceId: 'header', blockType: 'email_header', order: 1 },
 *     { instanceId: 'greeting', blockType: 'greeting_block', order: 2 }
 *   ]
 * });
 */
export class CompositionRecipe {
  /**
   * @description Validates and initializes a new recipe with deep-frozen block configurations.
   * @param {Object} definition Recipe manifest.
   * @param {string} definition.id Unique recipe identifier.
   * @param {string} definition.name Human-readable label.
   * @param {string} [definition.description=''] Functional description.
   * @param {'html'|'markdown'|'text'} [definition.outputFormat='html'] Target rendering format.
   * @param {BlockInstance[]} definition.blocks Collection of block instances.
   * @param {string} [definition.separator=''] String inserted between rendered blocks.
   * @param {Object} [definition.metadata={}] Arbitrary key-value store for orchestration.
   * @throws {RecipeValidationError} If ID/Name is missing, format is invalid, or block IDs collide.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('CompositionRecipe requires a definition object');
    }

    const {
      id,
      name,
      description = '',
      outputFormat = OutputFormat.HTML,
      blocks = [],
      separator = '',
      metadata = {}
    } = definition;

    // Validate
    const errors = [];

    if (!id || typeof id !== 'string') {
      errors.push('Recipe id is required');
    }
    if (!name || typeof name !== 'string') {
      errors.push('Recipe name is required');
    }
    if (!isValidOutputFormat(outputFormat)) {
      errors.push(`Invalid output format: ${outputFormat}`);
    }
    if (!Array.isArray(blocks)) {
      errors.push('Blocks must be an array');
    }

    // Validate blocks (only if blocks is an array)
    const instanceIds = new Set();
    if (Array.isArray(blocks)) {
      blocks.forEach((block, index) => {
        if (!block.instanceId) {
          errors.push(`Block at index ${index} is missing instanceId`);
        } else if (instanceIds.has(block.instanceId)) {
          errors.push(`Duplicate instanceId: ${block.instanceId}`);
        } else {
          instanceIds.add(block.instanceId);
        }

        if (!block.blockType) {
          errors.push(`Block '${block.instanceId || index}' is missing blockType`);
        }
      });
    }

    if (errors.length > 0) {
      throw new RecipeValidationError(
        `Invalid recipe: ${errors.join(', ')}`,
        id || 'unknown',
        errors
      );
    }

    /**
     * Recipe identifier.
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
     * Recipe description.
     * @type {string}
     * @readonly
     */
    this.description = description;

    /**
     * Default output format.
     * @type {string}
     * @readonly
     */
    this.outputFormat = outputFormat;

    /**
     * Block instances with normalized defaults.
     * @type {BlockInstance[]}
     * @readonly
     */
    this.blocks = Object.freeze(
      blocks.map((block, index) => ({
        instanceId: block.instanceId,
        blockType: block.blockType,
        visibility: block.visibility || 'always',
        order: block.order !== undefined ? block.order : index,
        config: Object.freeze(cloneDeep(block.config || {}))
      }))
    );

    /**
     * Separator between blocks.
     * @type {string}
     * @readonly
     */
    this.separator = separator;

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = Object.freeze(cloneDeep(metadata));

    Object.freeze(this);
  }

  /**
   * @description Returns a collection of blocks sorted by their numeric execution order.
   * @returns {BlockInstance[]} Array of blocks in rendering sequence.
   */
  getOrderedBlocks() {
    return [...this.blocks].sort((a, b) => a.order - b.order);
  }

  /**
   * @description Resolves a specific block configuration by its instance ID.
   * @param {string} instanceId Unique instance identifier.
   * @returns {BlockInstance|null} The resolved block or null if not found.
   */
  getBlock(instanceId) {
    return this.blocks.find((b) => b.instanceId === instanceId) || null;
  }

  /**
   * @description Returns all instances of a specific block type registered in the recipe.
   * @param {string} blockType Registered block type identifier.
   * @returns {BlockInstance[]} Matching block configurations.
   */
  getBlocksByType(blockType) {
    return this.blocks.filter((b) => b.blockType === blockType);
  }

  /**
   * @description Extracts all unique block types utilized in this recipe.
   * @returns {string[]} Collection of unique block type IDs.
   */
  getUsedBlockTypes() {
    return [...new Set(this.blocks.map((b) => b.blockType))];
  }

  /**
   * @description Returns the total number of blocks defined in the recipe.
   * @returns {number} Total block count.
   */
  getBlockCount() {
    return this.blocks.length;
  }

  /**
   * @description Checks if any instance of the specified block type exists in the recipe.
   * @param {string} blockType Registered block type identifier.
   * @returns {boolean} True if the type is utilized.
   */
  usesBlockType(blockType) {
    return this.blocks.some((b) => b.blockType === blockType);
  }

  /**
   * @description Serializes the recipe into a plain data object for storage or transmission.
   * @returns {Object} Deep-cloned plain object representation.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      outputFormat: this.outputFormat,
      blocks: this.blocks.map((b) => ({ ...b, config: { ...b.config } })),
      separator: this.separator,
      metadata: { ...this.metadata }
    };
  }

  /**
   * @description Hydrates a new CompositionRecipe from a plain data object.
   * @param {Object} obj Recipe definition data.
   * @returns {CompositionRecipe} Reconstituted immutable recipe instance.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid recipe object');
    }
    return new CompositionRecipe(obj);
  }

  /**
   * @description Returns a technical summary string for diagnostics and logging.
   * @returns {string} Debug string representation.
   */
  toString() {
    return `CompositionRecipe[${this.id}] "${this.name}" (${this.blocks.length} blocks, ${this.outputFormat})`;
  }
}
