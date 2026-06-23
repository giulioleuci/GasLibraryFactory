/**
 * @file ContextEngine/src/ContextAssembler.js
 * @description Main facade for assembling data contexts from recipes.
 * @version 1.0.0
 */

import { DependencyResolver } from './internal/DependencyResolver';
import { RecipeParser } from './internal/RecipeParser';
import { PostProcessor } from './PostProcessor';
import { ContextEngineError } from './internal/errors/ContextEngineError';
import { ContextStepExecutor } from './internal/ContextStepExecutor';
import { ContextDependencyAnalyzer } from './internal/ContextDependencyAnalyzer';

/**
 * Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
 * Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.
 * @class
 * @example
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'user',
 *       type: 'UserDataProvider',
 *       condition: '{{userId}} != null',
 *       parameters: { userId: '@userId' }
 *     },
 *     {
 *       name: 'analytics',
 *       type: 'AnalyticsProvider',
 *       condition: 'len($user.orders) > 0',
 *       parameters: { orders: '$user.orders' },
 *       postProcess: [{ type: 'round', decimals: 2 }]
 *     }
 *   ]
 * };
 * const context = assembler.assemble(recipe, { userId: 123 });
 */
export class ContextAssembler {
  /**
   * Initializes the assembler with required orchestrators and optional engines.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @param {Object} providerRegistry Registry for provider lookup by type.
   * @param {Object} [expressionEngine=null] Optional engine for evaluating 'condition' strings.
   * @param {Object} [exceptionService=null] Optional service for transient error retries.
   * @param {Object} [interceptorRegistry=null] Optional registry for data interception.
   * @param {Object} [options={}] Configuration options.
   * @param {number} [options.maxRetries=3] Maximum retry attempts per provider.
   * @throws {Error} If logger or providerRegistry are missing or lack required interface methods.
   * @throws {Error} If any engine parameter is provided but is not an object.
   */
  constructor(
    logger,
    providerRegistry,
    expressionEngine = null,
    exceptionService = null,
    interceptorRegistry = null,
    options = {}
  ) {
    // Validate inputs
    if (logger == null) {
      throw new Error('ContextAssembler: logger is required and cannot be null or undefined');
    }
    if (typeof logger !== 'object') {
      throw new Error(
        'ContextAssembler: logger must be of type object, received: ' + typeof logger
      );
    }
    const requiredLoggerMethods = ['debug', 'info', 'warn', 'error'];
    for (const method of requiredLoggerMethods) {
      if (typeof logger[method] !== 'function') {
        throw new Error('ContextAssembler: logger must have method: ' + method);
      }
    }

    if (providerRegistry == null) {
      throw new Error(
        'ContextAssembler: providerRegistry is required and cannot be null or undefined'
      );
    }
    if (typeof providerRegistry !== 'object') {
      throw new Error(
        'ContextAssembler: providerRegistry must be of type object, received: ' +
          typeof providerRegistry
      );
    }
    if (typeof providerRegistry.get !== 'function') {
      throw new Error('ContextAssembler: providerRegistry must have method: get');
    }

    if (expressionEngine !== null && typeof expressionEngine !== 'object') {
      throw new Error(
        'ContextAssembler: expressionEngine must be of type object, received: ' +
          typeof expressionEngine
      );
    }

    if (exceptionService !== null && typeof exceptionService !== 'object') {
      throw new Error(
        'ContextAssembler: exceptionService must be of type object, received: ' +
          typeof exceptionService
      );
    }

    if (interceptorRegistry !== null && typeof interceptorRegistry !== 'object') {
      throw new Error(
        'ContextAssembler: interceptorRegistry must be of type object, received: ' +
          typeof interceptorRegistry
      );
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error(
        'ContextAssembler: options must be of type object, received: ' + typeof options
      );
    }

    /**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Provider registry.
     * @private
     * @type {Object}
     */
    this._providerRegistry = providerRegistry;

    /**
     * Expression engine for conditional execution.
     * @private
     * @type {Object|null}
     */
    this._expressionEngine = expressionEngine;

    /**
     * Exception service for error handling.
     * @private
     * @type {Object|null}
     */
    this._exceptionService = exceptionService;

    /**
     * Interceptor registry for data interception.
     * @private
     * @type {Object|null}
     */
    this._interceptorRegistry = interceptorRegistry;

    /**
     * Maximum retry attempts per provider.
     * @private
     * @type {number}
     */
    this._maxRetries = options.maxRetries || 3;

    /**
     * Dependency resolver.
     * @private
     * @type {DependencyResolver}
     */
    this._dependencyResolver = new DependencyResolver(logger);

    /**
     * Recipe parser.
     * @private
     * @type {RecipeParser}
     */
    this._recipeParser = new RecipeParser(logger);

    /**
     * Post processor.
     * @private
     * @type {PostProcessor}
     */
    this._postProcessor = new PostProcessor(logger);

    // Facade Delegation
    this._stepExecutor = new ContextStepExecutor(this);
    this._dependencyAnalyzer = new ContextDependencyAnalyzer(this);

    const executionMethods = [
      '_evaluateCondition',
      '_executeProvider',
      'assemble',
      'assembleAsync'
    ];
    executionMethods.forEach(m => {
      this[m] = this._stepExecutor[m].bind(this._stepExecutor);
    });

    const analyzerMethods = [
      'validateRecipe',
      'analyzeRecipeDependencies',
      'getConfigSummary'
    ];
    analyzerMethods.forEach(m => {
      this[m] = this._dependencyAnalyzer[m].bind(this._dependencyAnalyzer);
    });
  }

  /**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

  /**
   * Provider registry for type lookup.
   * @type {Object}
   * @readonly
   */
  get providerRegistry() {
    return this._providerRegistry;
  }

  /**
   * Engine for reference resolution (@param, $provider).
   * @type {DependencyResolver}
   * @readonly
   */
  get dependencyResolver() {
    return this._dependencyResolver;
  }

  /**
   * Engine for structural recipe validation.
   * @type {RecipeParser}
   * @readonly
   */
  get recipeParser() {
    return this._recipeParser;
  }

  /**
   * Engine for data transformation pipelines.
   * @type {PostProcessor}
   * @readonly
   */
  get postProcessor() {
    return this._postProcessor;
  }

}
