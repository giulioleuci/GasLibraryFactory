/**
 * @file GasExpressionEngineLib/src/ExpressionEngineService.js
 * @description High-level facade for the Expression Engine library.
 *              Provides a simple, unified API for parsing and evaluating
 *              dynamic logical expressions with placeholder resolution.
 * @version 1.0.0
 */

import { ExpressionParserService } from './ExpressionParserService.js';
import { ExpressionEvaluatorService } from './ExpressionEvaluatorService.js';
import { Mustache, PlaceholderService } from '@WorkspaceTemplateEngine';

/**
 * Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.
 * @class
 */
export class ExpressionEngineService {
  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionEngineService',
      dependencies: ['logger', 'utils', 'cache'],
      isSingleton: true,
      factory: (logger, utils, cache) => new ExpressionEngineService({ logger, utils, cache })
    };
  }

  /**
   * Initializes the expression engine with diagnostic and performance dependencies.
   * @param {Object} options Configuration metadata.
   * @param {Object} options.logger Diagnostic output interface.
   * @param {Object} [options.utils] Optional utility service for data processing.
   * @param {Object} [options.cache] Optional persistence for AST optimization.
   * @throws {Error} If mandatory logger dependency is missing.
   */
  constructor(options = {}) {
    // Validate required dependencies
    if (!options.logger) {
      throw new Error('ExpressionEngineService requires a logger instance');
    }

    this.logger = options.logger;
    this.utils = options.utils;
    this.cache = options.cache;

    // Initialize AST cache (GEL-H001: MAJOR PERFORMANCE BOOST)
    // If no cache service provided, use a simple in-memory Map
    this._astCache = new Map();
    this._astCacheEnabled = true; // Can be disabled for debugging

    // Initialize internal services
    this._initializeServices();

    this.logger.debug('ExpressionEngineService (Facade) initialized successfully.');
  }

  /**
   * Configures internal dependency chain including parser, template engine, and evaluator.
   * @private
   */
  _initializeServices() {
    // 1. Initialize the expression parser
    this.parser = new ExpressionParserService(this.logger);
    this.logger.debug('ExpressionParserService initialized.');

    // 2. Initialize Mustache template engine from WorkspaceTemplateEngine
    this.mustache = new Mustache({ logger: this.logger });
    this.logger.debug('Mustache engine initialized from WorkspaceTemplateEngine.');

    // 3. Initialize PlaceholderService from WorkspaceTemplateEngine
    this.placeholderService = new PlaceholderService({
      logger: this.logger,
      mustache: this.mustache,
      utils: this.utils,
      cache: this.cache
    });
    this.logger.debug('PlaceholderService initialized from WorkspaceTemplateEngine.');

    // 4. Initialize the expression evaluator
    this.evaluator = new ExpressionEvaluatorService(
      this.logger,
      this.parser,
      this.placeholderService
    );
    this.logger.debug('ExpressionEvaluatorService initialized.');
  }

  /**
   * Executes a string-based logical expression against a data context, returning a boolean outcome.
   * @param {string} expressionString Logic template with optional {{placeholders}}.
   * @param {Object} [context={}] Data context for attribute resolution.
   * @returns {boolean} Outcome of the logical evaluation.
   * @throws {Error} If expression syntax is invalid or evaluation fails.
   */
  evaluate(expressionString, context = {}) {
    // GEL-H004: Add input validation
    if (!expressionString || typeof expressionString !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }
    if (context !== null && typeof context !== 'object') {
      throw new Error('Invalid context: must be an object or null');
    }

    try {
      // GEL-H001: Implement AST caching for MAJOR PERFORMANCE BOOST
      // Check if AST is cached
      let ast;
      if (this._astCacheEnabled && this._astCache.has(expressionString)) {
        ast = this._astCache.get(expressionString);
        this.logger.debug(`AST cache hit for expression: ${expressionString.substring(0, 50)}...`);
      } else {
        // Parse and cache the AST
        ast = this.parser.parse(expressionString);

        if (this._astCacheEnabled) {
          this._astCache.set(expressionString, ast);
          this.logger.debug(`AST cached for expression: ${expressionString.substring(0, 50)}...`);

          // Prevent unbounded cache growth - limit to 1000 entries
          if (this._astCache.size > 1000) {
            const firstKey = this._astCache.keys().next().value;
            this._astCache.delete(firstKey);
            this.logger.debug(`AST cache limit reached, removed oldest entry`);
          }
        }
      }

      // Evaluate the AST with the provided context
      return this.evaluator.evaluateAst(ast, context);
    } catch (error) {
      this.logger.error(`ExpressionEngineService.evaluate() failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transforms an expression string into a structured Abstract Syntax Tree (AST) for deferred evaluation.
   * @param {string} expressionString Logic template.
   * @returns {Object} Structured AST representation.
   * @throws {Error} On syntax or tokenization failures.
   */
  parse(expressionString) {
    // GEL-H004: Add input validation
    if (!expressionString || typeof expressionString !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }

    try {
      return this.parser.parse(expressionString);
    } catch (error) {
      this.logger.error(`ExpressionEngineService.parse() failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves library classification and version metadata.
   * @returns {Object} Library identity.
   */
  getInfo() {
    return {
      name: 'GasExpressionEngineLib',
      version: '1.0.0',
      description: 'Expression parser and evaluator for dynamic business logic',
      dependencies: ['WorkspaceTemplateEngine']
    };
  }

  /**
   * Gets AST cache statistics for monitoring and debugging.
   *
   * @returns {Object} Cache statistics containing:
   *   - size {number} - Current number of cached ASTs
   *   - enabled {boolean} - Whether caching is enabled
   *   - maxSize {number} - Maximum cache size (1000 entries)
   */
  getCacheStats() {
    return {
      size: this._astCache.size,
      enabled: this._astCacheEnabled,
      maxSize: 1000
    };
  }

  /**
   * Clears the AST cache.
   */
  clearCache() {
    this._astCache.clear();
    this.logger.debug('AST cache cleared');
  }

  /**
   * Enables or disables AST caching.
   *
   * @param {boolean} enabled - Whether to enable caching
   * @throws {Error} If enabled is not a boolean
   */
  setCacheEnabled(enabled) {
    // GEL-H004: Add input validation
    if (typeof enabled !== 'boolean') {
      throw new Error('Invalid enabled value: must be a boolean');
    }

    this._astCacheEnabled = enabled;
    this.logger.debug(`AST cache ${this._astCacheEnabled ? 'enabled' : 'disabled'}`);
  }
}
