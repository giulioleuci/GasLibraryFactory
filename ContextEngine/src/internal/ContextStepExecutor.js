import { ContextEngineError } from './errors/ContextEngineError';

export class ContextStepExecutor {
  constructor(facade) {
    this.facade = facade;
  }

  _evaluateCondition(condition, initialParams, providerResults) {
    if (!condition) {
      return true; // No condition means always execute
    }

    if (!this.facade._expressionEngine) {
      this.facade._logger.warn(
        'Condition specified but no expression engine provided - defaulting to true'
      );
      return true;
    }

    try {
      // Build context for expression evaluation
      const expressionContext = {
        ...initialParams,
        ...providerResults
      };

      const result = this.facade._expressionEngine.evaluate(condition, expressionContext);

      this.facade._logger.debug(`Condition '${condition}' evaluated to: ${result}`);
      return result;
    } catch (error) {
      this.facade._logger.error(`Failed to evaluate condition '${condition}': ${error.message}`);
      throw new ContextEngineError(`Condition evaluation failed: ${error.message}`, {
        condition,
        originalError: error
      });
    }
  }

  _executeProvider(providerConfig, initialParams, providerResults, options = {}) {
    const providerName = providerConfig.name;
    const providerType = providerConfig.type;

    this.facade._logger.debug(`[${providerName}] Executing provider of type: ${providerType}`);

    // Get provider instance from registry
    const provider = this.facade._providerRegistry.get(providerType);

    // Resolve dependencies in parameters
    const resolvedParameters = this.facade._dependencyResolver.resolveAll(
      providerConfig.parameters,
      initialParams,
      providerResults,
      providerName
    );

    this.facade._logger.debug(`[${providerName}] Resolved parameters:`, resolvedParameters);

    // Execute provider with optional retry
    let data;

    if (this.facade._exceptionService) {
      // Execute with automatic retry
      data = this.facade._exceptionService.executeWithRetry(
        () => provider.provide(providerName, resolvedParameters),
        {},
        this.facade._maxRetries
      );
    } else {
      // Execute without retry
      data = provider.provide(providerName, resolvedParameters);
    }

    // Apply post-processing if configured
    if (providerConfig.postProcess && providerConfig.postProcess.length > 0) {
      this.facade._logger.debug(
        `[${providerName}] Applying ${providerConfig.postProcess.length} post-processor(s)`
      );
      data = this.facade._postProcessor.process(providerConfig.postProcess, data, providerName);
    }

    // Apply interceptors if configured
    if (this.facade._interceptorRegistry) {
      const interceptors = this.facade._interceptorRegistry.getAll();
      if (interceptors.length > 0) {
        this.facade._logger.debug(`[${providerName}] Applying ${interceptors.length} interceptor(s)`);
        for (const interceptor of interceptors) {
          data = interceptor.intercept(providerName, data, providerResults, options);
        }
      }
    }

    this.facade._logger.info(`[${providerName}] Provider execution completed`);

    return data;
  }

  assemble(recipe, initialParams = {}, options = {}) {
    // Validate inputs
    if (!recipe || typeof recipe !== 'object') {
      throw new Error('ContextAssembler.assemble: recipe is required and must be an object');
    }

    if (initialParams !== null && typeof initialParams !== 'object') {
      throw new Error('ContextAssembler.assemble: initialParams must be an object or null');
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error('ContextAssembler.assemble: options must be an object or null');
    }

    const startTime = Date.now();

    try {
      // Parse and validate recipe
      this.facade._logger.info('Starting context assembly...');
      const validatedRecipe = this.facade._recipeParser.parse(recipe);

      // Initialize result context
      const context = {};
      let executedProviders = 0;
      let skippedProviders = 0;

      // Execute providers sequentially
      for (const providerConfig of validatedRecipe.providers) {
        const providerName = providerConfig.name;

        try {
          // Evaluate condition
          const shouldExecute = this._evaluateCondition(
            providerConfig.condition,
            initialParams,
            context
          );

          if (!shouldExecute) {
            this.facade._logger.info(`[${providerName}] Skipped (condition not met)`);
            skippedProviders++;
            continue;
          }

          // Execute provider (with interceptors if configured)
          const result = this._executeProvider(providerConfig, initialParams, context, options);

          // Store result in context
          context[providerName] = result;
          executedProviders++;
        } catch (error) {
          this.facade._logger.error(`[${providerName}] Provider execution failed: ${error.message}`);
          throw new ContextEngineError(`Provider '${providerName}' failed: ${error.message}`, {
            providerName,
            providerType: providerConfig.type,
            originalError: error
          });
        }
      }

      const durationMs = Date.now() - startTime;

      this.facade._logger.info(
        `Context assembly completed in ${durationMs}ms ` +
          `(${executedProviders} executed, ${skippedProviders} skipped)`
      );

      return context;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      this.facade._logger.error(`Context assembly failed after ${durationMs}ms: ${error.message}`);

      if (error instanceof ContextEngineError) {
        throw error;
      }

      throw new ContextEngineError(`Context assembly failed: ${error.message}`, {
        originalError: error
      });
    }
  }

  assembleAsync(recipe, initialParams = {}, options = {}) {
    return this.assemble(recipe, initialParams, options);
  }
}
