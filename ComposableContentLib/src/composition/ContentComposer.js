/**
 * @file ComposableContentLib/src/composition/ContentComposer.js
 * @description Main composition engine for assembling content from blocks.
 * @version 1.0.0
 */

import { CompositionRecipe } from './CompositionRecipe.js';
import { CompositionResult } from '../core/CompositionResult.js';
import { BlockResult } from '../core/BlockResult.js';
import { BlockDataContext } from '../data/BlockDataContext.js';
import { VisibilityEvaluator } from '../internal/VisibilityEvaluator.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
 * @description Central orchestration engine for content block resolution and rendering.
 * Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.
 * @class
 * @example
 * const composer = new ContentComposer({ blockRegistry, rendererRegistry });
 * const result = composer.compose(recipe, { user: { name: 'Alice' } });
 */
export class ContentComposer {
  /**
   * @description Initializes the composer with mandatory registries and optional evaluation engines.
   * @param {Object} options Configuration options.
   * @param {BlockRegistry} options.blockRegistry Repository of block definitions.
   * @param {RendererRegistry} options.rendererRegistry Repository of format-specific renderers.
   * @param {Object} [options.logger=console] Diagnostic logger.
   * @param {Object} [options.expressionEngine=null] Optional engine for advanced visibility logic.
   * @throws {Error} If registries are missing from options.
   */
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('ContentComposer requires options');
    }

    const { blockRegistry, rendererRegistry, logger = console, expressionEngine = null } = options;

    if (!blockRegistry) {
      throw new Error('ContentComposer requires a blockRegistry');
    }
    if (!rendererRegistry) {
      throw new Error('ContentComposer requires a rendererRegistry');
    }

    /**
     * Block registry.
     * @type {BlockRegistry}
     * @private
     */
    this._blockRegistry = blockRegistry;

    /**
     * Renderer registry.
     * @type {RendererRegistry}
     * @private
     */
    this._rendererRegistry = rendererRegistry;

    /**
     * Logger instance.
     * @type {Object}
     * @private
     */
    this._logger = logger;

    /**
     * Visibility evaluator.
     * @type {VisibilityEvaluator}
     * @private
     */
    this._visibilityEvaluator = new VisibilityEvaluator(expressionEngine);
  }

  /**
   * @description Executes a composition recipe against a data context to generate a final result.
   * Processes blocks sequentially, handling errors based on the `continueOnError` flag, and aggregates visible content.
   * @param {CompositionRecipe|Object} recipe The recipe defining the composition structure.
   * @param {Object|BlockDataContext} context The data payload for block evaluation.
   * @param {Object} [options={}] Execution modifiers.
   * @param {string} [options.format] Output format override (defaults to recipe format).
   * @param {boolean} [options.continueOnError=true] If false, halts execution on first block failure.
   * @returns {CompositionResult} Detailed execution report including aggregated content and block-level metadata.
   */
  compose(recipe, context, options = {}) {
    const startTime = Date.now();

    // Normalize inputs
    const compositionRecipe =
      recipe instanceof CompositionRecipe ? recipe : new CompositionRecipe(recipe);

    const dataContext =
      context instanceof BlockDataContext ? context : new BlockDataContext(context);

    const format = options.format || compositionRecipe.outputFormat;
    const continueOnError = options.continueOnError !== false;

    this._logger.debug?.(
      `Composing '${compositionRecipe.id}' with ${compositionRecipe.getBlockCount()} blocks`
    );

    // Get renderer for format
    const renderer = this._rendererRegistry.get(format);

    // Get ordered blocks
    const orderedBlocks = compositionRecipe.getOrderedBlocks();

    // Evaluate each block
    const blockResults = [];
    const errors = [];

    for (const blockInstance of orderedBlocks) {
      try {
        const result = this._evaluateBlock(blockInstance, dataContext, format, renderer);
        blockResults.push(result);

        if (result.isError()) {
          errors.push({
            instanceId: blockInstance.instanceId,
            error: result.error
          });

          if (!continueOnError) {
            break;
          }
        }
      } catch (error) {
        const errorResult = BlockResult.error(
          blockInstance.instanceId,
          blockInstance.blockType,
          error
        );
        blockResults.push(errorResult);
        errors.push({
          instanceId: blockInstance.instanceId,
          error
        });

        if (!continueOnError) {
          break;
        }
      }
    }

    // Aggregate content
    const visibleResults = blockResults.filter((r) => r.hasDisplayableContent());
    const content = visibleResults.map((r) => r.content).join(compositionRecipe.separator);

    // Build result
    return new CompositionResult({
      recipeId: compositionRecipe.id,
      recipeName: compositionRecipe.name,
      outputFormat: format,
      content,
      blocks: blockResults,
      errors: errors.length > 0 ? errors : undefined,
      processingTime: Date.now() - startTime,
      metadata: {
        totalBlocks: orderedBlocks.length,
        visibleBlocks: visibleResults.length,
        hiddenBlocks: blockResults.filter((r) => !r.isVisible).length,
        errorBlocks: errors.length
      }
    });
  }

  /**
   * @description Convenience method for composition that returns only the aggregated string content.
   * @param {CompositionRecipe|Object} recipe Composition manifest.
   * @param {Object|BlockDataContext} context Data payload.
   * @param {Object} [options={}] Execution modifiers.
   * @returns {string} Fully rendered and joined content string.
   */
  composeToString(recipe, context, options = {}) {
    return this.compose(recipe, context, options).content;
  }

  /**
   * @description Internal evaluator for a single block instance.
   * Handles visibility checks, registry resolution, format validation, and block execution.
   * @param {Object} blockInstance Recipe block configuration.
   * @param {BlockDataContext} context Data context.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Format-specific renderer.
   * @returns {BlockResult} Execution outcome for the block.
   * @throws {BlockNotFoundError} If the requested block type is unregistered.
   * @private
   */
  _evaluateBlock(blockInstance, context, format, renderer) {
    const { instanceId, blockType, visibility, config } = blockInstance;

    // Check visibility
    if (!this._visibilityEvaluator.isVisible(visibility, context)) {
      return BlockResult.hidden(instanceId, blockType, 'visibility_condition');
    }

    // Get block from registry
    if (!this._blockRegistry.has(blockType)) {
      throw new BlockNotFoundError(blockType);
    }

    const block = this._blockRegistry.createBlock(blockType, config);

    // Check format support
    if (!block.supportsFormat(format)) {
      return BlockResult.hidden(instanceId, blockType, `unsupported_format:${format}`);
    }

    // Evaluate block
    return block.evaluate(instanceId, context, format, renderer);
  }

  /**
   * @description Validates a recipe against current registry states to ensure all dependencies are met.
   * @param {CompositionRecipe|Object} recipe Recipe to validate.
   * @returns {Object} Validation summary containing `{ valid: boolean, errors: string[] }`.
   */
  validateRecipe(recipe) {
    const compositionRecipe =
      recipe instanceof CompositionRecipe ? recipe : new CompositionRecipe(recipe);

    const errors = [];

    // Check all block types exist
    for (const blockType of compositionRecipe.getUsedBlockTypes()) {
      if (!this._blockRegistry.has(blockType)) {
        errors.push(`Unknown block type: ${blockType}`);
      }
    }

    // Check renderer exists for format
    if (!this._rendererRegistry.hasRenderer(compositionRecipe.outputFormat)) {
      errors.push(`No renderer for format: ${compositionRecipe.outputFormat}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * @description Returns the configured block registry instance.
   * @returns {BlockRegistry} Active block repository.
   */
  getBlockRegistry() {
    return this._blockRegistry;
  }

  /**
   * @description Returns the configured renderer registry instance.
   * @returns {RendererRegistry} Active renderer repository.
   */
  getRendererRegistry() {
    return this._rendererRegistry;
  }

  /**
   * @description Returns a technical summary of the composer's registry states.
   * @returns {string} Debug string representation.
   */
  toString() {
    return `ContentComposer[${this._blockRegistry.size()} blocks, ${this._rendererRegistry.size()} renderers]`;
  }
}
