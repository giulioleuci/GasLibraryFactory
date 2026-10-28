import type {
  ContextLogger,
  ProviderLookup,
  ExpressionEvaluator,
  ContextRetryService,
  InterceptorLookup
} from './internal/contracts.js';
/**
 * @file ContextEngine/src/ContextAssembler.js
 * @description Main facade for assembling data contexts from recipes.
 * @version 1.0.0
 */

import { DependencyResolver } from './internal/DependencyResolver.js';
import { RecipeParser } from './internal/RecipeParser.js';
import { PostProcessor } from './PostProcessor.js';
import { ContextEngineError } from './internal/errors/ContextEngineError.js';
import { ContextStepExecutor } from './internal/ContextStepExecutor.js';
import { ContextDependencyAnalyzer } from './internal/ContextDependencyAnalyzer.js';

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
 * @example
 * // Mutation mode: every provider mutates the SAME shared target object in
 * // place instead of producing a value merged into a flat, provider-keyed
 * // map. Useful for consumers whose "context" is one deeply nested object
 * // multiple providers read from and write into at the same paths (e.g. a
 * // recipe where a later provider must overwrite a field an earlier
 * // provider already set). Provider return values are ignored in this mode.
 * const sharedTarget = { meta: {}, focus: {} };
 * assembler.assembleInto(sharedTarget, recipe, { userId: 123 });
 * // sharedTarget now holds everything every provider wrote, in recipe order.
 */
export class ContextAssembler {
  declare _logger: ContextLogger;
  declare _providerRegistry: ProviderLookup;
  declare _expressionEngine: ExpressionEvaluator | null;
  declare _exceptionService: ContextRetryService | null;
  declare _interceptorRegistry: InterceptorLookup | null;
  declare _maxRetries: number;
  declare _dependencyResolver: DependencyResolver;
  declare _recipeParser: RecipeParser;
  declare _postProcessor: Pick<PostProcessor, 'process' | 'getRegisteredTypes'>;
  declare _stepExecutor: ContextStepExecutor;
  declare _dependencyAnalyzer: ContextDependencyAnalyzer;
  declare _evaluateCondition: ContextStepExecutor['_evaluateCondition'];
  declare _executeProvider: ContextStepExecutor['_executeProvider'];
  declare _executeMutatingProvider: ContextStepExecutor['_executeMutatingProvider'];
  declare assemble: ContextStepExecutor['assemble'];
  declare assembleInto: ContextStepExecutor['assembleInto'];
  declare validateRecipe: ContextDependencyAnalyzer['validateRecipe'];
  declare analyzeRecipeDependencies: ContextDependencyAnalyzer['analyzeRecipeDependencies'];
  declare getConfigSummary: ContextDependencyAnalyzer['getConfigSummary'];
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
    logger: ContextLogger,
    providerRegistry: ProviderLookup,
    expressionEngine: ExpressionEvaluator | null = null,
    exceptionService: ContextRetryService | null = null,
    interceptorRegistry: InterceptorLookup | null = null,
    options: { maxRetries?: number } = {}
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
      if (
        typeof logger[method as keyof Pick<ContextLogger, 'debug' | 'info' | 'warn' | 'error'>] !==
        'function'
      ) {
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
      '_executeMutatingProvider',
      'assemble',
      'assembleInto'
    ] as const;
    executionMethods.forEach((m) => {
      (this[m] as ContextStepExecutor[typeof m]) = this._stepExecutor[m].bind(this._stepExecutor);
    });

    const analyzerMethods = [
      'validateRecipe',
      'analyzeRecipeDependencies',
      'getConfigSummary'
    ] as const;
    analyzerMethods.forEach((m) => {
      (this[m] as ContextDependencyAnalyzer[typeof m]) = this._dependencyAnalyzer[m].bind(
        this._dependencyAnalyzer
      );
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
}
