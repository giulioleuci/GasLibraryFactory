/**
 * @file ComposableContentLib/src/core/BlockResult.js
 * @description BlockResult representing the output of block evaluation.
 * @version 1.0.0
 */

import { cloneDeep, Result } from '@CoreUtilsLib';

/**
 * @description Immutable data transfer object representing the outcome of a block rendering execution.
 * Extends the shared {@link Result} base for the success/error contract.
 * Encapsulates generated content, visibility state, errors, and profiling metrics.
 * @class
 * @example
 * const result = new BlockResult({
 *   instanceId: 'header-001',
 *   blockType: 'email_header',
 *   content: '<div class="header">...</div>',
 *   isVisible: true
 * });
 */
export class BlockResult extends Result {
  /**
   * @description Freezes a new block execution result.
   * @param {Object} result Result payload.
   * @param {string} result.instanceId Target block instance ID.
   * @param {string} result.blockType Resolved block type ID.
   * @param {boolean} [result.isEmpty=false] True if the source data yielded no content.
   * @param {boolean} [result.isVisible=true] True if visibility conditions evaluated to true.
   * @param {string} [result.content=''] Final formatted string output.
   * @param {Object} [result.metadata={}] Block-specific runtime context (e.g., titles, icons).
   * @param {number} [result.processingTime=0] Execution duration in milliseconds.
   * @param {Error|null} [result.error=null] Caught runtime exception.
   * @throws {Error} If instanceId or blockType are missing.
   */
  constructor(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('BlockResult requires a result object');
    }

    const {
      instanceId,
      blockType,
      isEmpty = false,
      isVisible = true,
      content = '',
      metadata = {},
      processingTime = 0,
      error = null
    } = result;

    if (!instanceId || typeof instanceId !== 'string') {
      throw new Error('BlockResult instanceId is required');
    }
    if (!blockType || typeof blockType !== 'string') {
      throw new Error('BlockResult blockType is required');
    }

    // Initialize the shared Result base (sets this.error and this.value).
    super({ error });

    /**
     * Block instance ID.
     * @type {string}
     * @readonly
     */
    this.instanceId = instanceId;

    /**
     * Block type identifier.
     * @type {string}
     * @readonly
     */
    this.blockType = blockType;

    /**
     * Whether block content is empty.
     * @type {boolean}
     * @readonly
     */
    this.isEmpty = Boolean(isEmpty);

    /**
     * Whether block is visible.
     * @type {boolean}
     * @readonly
     */
    this.isVisible = Boolean(isVisible);

    /**
     * Rendered content.
     * @type {string}
     * @readonly
     */
    this.content = content;

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = Object.freeze(cloneDeep(metadata));

    /**
     * Processing time in milliseconds.
     * @type {number}
     * @readonly
     */
    this.processingTime = processingTime;

    // Note: this.error is set by the Result base constructor above.

    Object.freeze(this);
  }

  /**
   * @description Assesses if the result contains renderable output.
   * @returns {boolean} True if the block is visible, not empty, and has a non-zero length content string.
   */
  hasDisplayableContent() {
    return this.isVisible && !this.isEmpty && this.content.length > 0;
  }

  // isSuccess()/isError() are inherited from the shared Result base
  // (success === no error), matching the previous BlockResult semantics.

  /**
   * @description Resolves a specific key from the result's metadata payload.
   * @param {string} key Target metadata key.
   * @param {*} [defaultValue=null] Fallback if key is missing.
   * @returns {*} Metadata value or default.
   */
  getMetadata(key, defaultValue = null) {
    return key in this.metadata ? this.metadata[key] : defaultValue;
  }

  /**
   * @description Serializes the result into a plain, deep-cloned object. Errors are mapped to their message strings.
   * @returns {Object} JSON-safe representation.
   */
  toJSON() {
    return {
      instanceId: this.instanceId,
      blockType: this.blockType,
      isEmpty: this.isEmpty,
      isVisible: this.isVisible,
      content: this.content,
      metadata: { ...this.metadata },
      processingTime: this.processingTime,
      error: this.error ? this.error.message : null
    };
  }

  /**
   * @description Factory method generating a standardized hidden state result.
   * @param {string} instanceId Block instance ID.
   * @param {string} blockType Block type ID.
   * @param {string} [reason='hidden'] Description of why the block is suppressed.
   * @returns {BlockResult} Frozen instance marked invisible and empty.
   * @static
   */
  static hidden(instanceId, blockType, reason = 'hidden') {
    return new BlockResult({
      instanceId,
      blockType,
      isEmpty: true,
      isVisible: false,
      content: '',
      metadata: { hiddenReason: reason }
    });
  }

  /**
   * @description Factory method generating a standardized error state result.
   * @param {string} instanceId Target instance ID.
   * @param {string} blockType Target block type ID.
   * @param {Error} error Caught exception.
   * @returns {BlockResult} Frozen instance encapsulating the failure state.
   * @static
   */
  static error(instanceId, blockType, error) {
    return new BlockResult({
      instanceId,
      blockType,
      isEmpty: true,
      isVisible: false,
      content: '',
      error,
      metadata: { errorMessage: error.message }
    });
  }

  /**
   * @description Provides a brief diagnostic status string.
   * @returns {string} Summary string (e.g., "BlockResult[id] VISIBLE (5ms)").
   */
  toString() {
    const status = this.isError() ? 'ERROR' : this.isVisible ? 'VISIBLE' : 'HIDDEN';
    return `BlockResult[${this.instanceId}] ${status} (${this.processingTime}ms)`;
  }
}
