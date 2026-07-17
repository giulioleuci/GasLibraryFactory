/**
 * @file ComposableContentLib/src/core/CompositionResult.js
 * @description CompositionResult representing the complete output of content composition.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.
 * @class
 */
export class CompositionResult {
  /**
   * Initializes and freezes a composition result instance.
   * @param {Object} result Initialization payload.
   * @param {string} result.recipeId Source recipe identifier.
   * @param {string} [result.outputFormat] Target output format (e.g., 'html', 'markdown', 'plain_text').
   * @param {string} [result.format] Alias for outputFormat.
   * @param {string} result.content Fully concatenated rendering output.
   * @param {BlockResult[]} [result.blocks=[]] Collection of executed block results.
   * @param {BlockResult[]} [result.blockResults] Alias for blocks.
   * @param {Error[]} [result.errors=[]] Top-level orchestration errors.
   * @param {number} [result.processingTime=0] Total orchestration duration in ms.
   * @param {Object} [result.metadata={}] Global orchestration metadata.
   * @throws {Error} If recipeId, outputFormat/format, or content is null/undefined.
   * @throws {Error} If result is not a valid object.
   */
  constructor(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('CompositionResult requires a result object');
    }

    const {
      recipeId,
      outputFormat: _outputFormat,
      format,
      content,
      blocks: _blocks,
      blockResults,
      errors = [],
      processingTime = 0,
      metadata = {}
    } = result;

    const outputFormat = _outputFormat || format;
    const blocks = _blocks || blockResults || [];

    if (!recipeId || typeof recipeId !== 'string') {
      throw new Error('CompositionResult recipeId is required');
    }
    if (!outputFormat || typeof outputFormat !== 'string') {
      throw new Error('CompositionResult outputFormat is required');
    }
    if (content === undefined || content === null) {
      throw new Error('CompositionResult content is required');
    }

    /**
     * Recipe ID used for composition.
     * @type {string}
     * @readonly
     */
    this.recipeId = recipeId;

    /**
     * Output format.
     * @type {string}
     * @readonly
     */
    this.outputFormat = outputFormat;

    /**
     * Output format (alias).
     * @type {string}
     * @readonly
     */
    this.format = outputFormat;

    /**
     * Final composed content.
     * @type {string}
     * @readonly
     */
    this.content = content;

    /**
     * Individual block results.
     * @type {BlockResult[]}
     * @readonly
     */
    this.blocks = Object.freeze([...blocks]);

    /**
     * Number of visible blocks.
     * @type {number}
     * @readonly
     */
    this.visibleBlocks = blocks.filter((b) => b.isVisible).length;

    /**
     * Total number of blocks.
     * @type {number}
     * @readonly
     */
    this.totalBlocks = blocks.length;

    /**
     * Whether all blocks are empty/hidden.
     * @type {boolean}
     * @readonly
     */
    this.isEmpty = this.visibleBlocks === 0;

    /**
     * Total processing time in milliseconds.
     * @type {number}
     * @readonly
     */
    this.processingTime = processingTime;

    /**
     * Composition errors.
     * @type {Array}
     * @readonly
     */
    this.errors = Object.freeze([...errors]);

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = Object.freeze(cloneDeep(metadata));

    Object.freeze(this);
  }

  /**
   * Verifies if composition completed without top-level or block-level errors.
   * @returns {boolean} True if errors array is empty and all blocks are success states.
   */
  isSuccess() {
    return this.errors.length === 0 && !this.blocks.some((b) => b.isError && b.isError());
  }

  /**
   * Resolves a block result by its instance ID.
   * @param {string} instanceId Target instance identifier.
   * @returns {BlockResult|null} Matched block result or null.
   */
  getBlockResult(instanceId) {
    return this.getBlockById(instanceId);
  }

  /**
   * Filters results for blocks evaluated as visible.
   * @returns {BlockResult[]} Visible block results.
   */
  getVisibleBlocks() {
    return this.blocks.filter((b) => b.isVisible);
  }

  /**
   * Filters results for blocks evaluated as hidden.
   * @returns {BlockResult[]} Hidden block results.
   */
  getHiddenBlocks() {
    return this.blocks.filter((b) => !b.isVisible);
  }

  /**
   * Filters results for blocks that encountered rendering or evaluation errors.
   * @returns {BlockResult[]} Erroneous block results.
   */
  getErrorBlocks() {
    return this.blocks.filter((b) => b.isError());
  }

  /**
   * Checks for presence of top-level composition errors or block-level errors.
   * @returns {boolean} True if errors exist.
   */
  hasErrors() {
    return this.errors.length > 0 || this.blocks.some((b) => b.isError && b.isError());
  }

  /**
   * Resolves a block result by instance ID.
   * @param {string} instanceId Target instance identifier.
   * @returns {BlockResult|null} Matched block result or null.
   */
  getBlockById(instanceId) {
    return this.blocks.find((b) => b.instanceId === instanceId) || null;
  }

  /**
   * Filters results by block type ID.
   * @param {string} blockType Target block type ID.
   * @returns {BlockResult[]} Matching block results.
   */
  getBlocksByType(blockType) {
    return this.blocks.filter((b) => b.blockType === blockType);
  }

  /**
   * Returns character count of final concatenated content.
   * @returns {number} Character length.
   */
  getContentLength() {
    return this.content.length;
  }

  /**
   * Computes mean execution time across all evaluated blocks.
   * @returns {number} Average duration in ms.
   */
  getAverageBlockTime() {
    if (this.totalBlocks === 0) {
      return 0;
    }
    const totalBlockTime = this.blocks.reduce((sum, b) => sum + b.processingTime, 0);
    return totalBlockTime / this.totalBlocks;
  }

  /**
   * Serializes instance into a deep-cloned JSON-safe object.
   * @returns {Object} Serialized composition state.
   */
  toJSON() {
    return {
      recipeId: this.recipeId,
      outputFormat: this.outputFormat,
      content: this.content,
      blocks: this.blocks.map((b) => b.toJSON()),
      visibleBlocks: this.visibleBlocks,
      totalBlocks: this.totalBlocks,
      isEmpty: this.isEmpty,
      processingTime: this.processingTime,
      metadata: { ...this.metadata }
    };
  }

  /**
   * Factory method for standardized empty composition results.
   * @param {string} recipeId Target recipe ID.
   * @param {string} outputFormat Target output format.
   * @param {string} [reason='empty'] Contextual reason for empty state.
   * @returns {CompositionResult} Frozen instance with empty content/blocks.
   * @static
   */
  static empty(recipeId, outputFormat, reason = 'empty') {
    return new CompositionResult({
      recipeId,
      outputFormat,
      content: '',
      blocks: [],
      metadata: { emptyReason: reason }
    });
  }

  /**
   * Returns diagnostic status string including recipe ID, block counts, and performance metrics.
   * @returns {string} Diagnostic summary.
   */
  toString() {
    return `CompositionResult[${this.recipeId}] ${this.visibleBlocks}/${this.totalBlocks} blocks, ${this.content.length} chars (${this.processingTime}ms)`;
  }
}
