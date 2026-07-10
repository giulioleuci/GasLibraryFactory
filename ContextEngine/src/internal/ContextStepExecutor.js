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
        this.facade._logger.debug(
          `[${providerName}] Applying ${interceptors.length} interceptor(s)`
        );
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
          this.facade._logger.error(
            `[${providerName}] Provider execution failed: ${error.message}`
          );
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

  /**
   * Invokes a single provider in "mutate" mode: the provider receives the
   * shared target object directly (instead of resolved `@`/`$` parameters)
   * and is expected to mutate it in place. This is a real behavioral fork
   * from `_executeProvider`/flat mode, not an overload of it:
   *  - No `DependencyResolver.resolveAll` parameter resolution — mutation-mode
   *    providers read/write the shared target directly, they don't declare
   *    `parameters` maps of `@param`/`$provider` references.
   *  - No `postProcessor` pass — there is no return value to post-process.
   *  - No return-value merge — the provider's return value is IGNORED.
   *  - Registered interceptors ARE still invoked after the provider step
   *    (mirrors flat mode), but they receive `(name, sharedTarget,
   *    sharedTarget, options)` since there is no separate "this provider's
   *    slice of data" — the whole shared target is the only payload.
   * Provider lookup (`ProviderRegistry`) and retry (`exceptionService`) are
   * reused unchanged from flat mode.
   * @param {Object} providerConfig Normalized provider config (name, type).
   * @param {Object} sharedTarget The shared object every provider mutates.
   * @param {Object} initialParams Initial parameters passed to `assembleInto`.
   * @param {Object} [options={}] Runtime options forwarded to providers/interceptors.
   * @private
   */
  _executeMutatingProvider(providerConfig, sharedTarget, initialParams, options = {}) {
    const providerName = providerConfig.name;
    const providerType = providerConfig.type;

    this.facade._logger.debug(
      `[${providerName}] Executing provider (mutate mode) of type: ${providerType}`
    );

    const provider = this.facade._providerRegistry.get(providerType);

    if (this.facade._exceptionService) {
      this.facade._exceptionService.executeWithRetry(
        () => provider.provide(sharedTarget, initialParams, options),
        {},
        this.facade._maxRetries
      );
    } else {
      provider.provide(sharedTarget, initialParams, options);
    }

    if (this.facade._interceptorRegistry) {
      const interceptors = this.facade._interceptorRegistry.getAll();
      if (interceptors.length > 0) {
        this.facade._logger.debug(
          `[${providerName}] Applying ${interceptors.length} interceptor(s) (mutate mode)`
        );
        for (const interceptor of interceptors) {
          interceptor.intercept(providerName, sharedTarget, sharedTarget, options);
        }
      }
    }

    this.facade._logger.info(`[${providerName}] Provider execution completed (mutate mode)`);
  }

  /**
   * Mutation-mode counterpart to `assemble()`. Instead of collecting each
   * provider's return value into a fresh flat `{ providerName: output }` map,
   * every provider in the recipe receives the SAME `sharedTarget` object
   * across the whole run and is expected to mutate it in place (matching
   * ALDO's `ContextProvider.provide(cdu, params, options): void` contract).
   *
   * What is reused unchanged from flat mode: recipe parsing/normalization
   * (`RecipeParser.parse`), per-provider condition evaluation
   * (`_evaluateCondition`), provider lookup (`ProviderRegistry`), and retry
   * semantics (`exceptionService`). What is NOT reused: `_executeProvider`
   * itself — it pushes a provider's return value through
   * `DependencyResolver.resolveAll`/`postProcessor`, both of which assume a
   * return-value pipeline that doesn't apply to a void mutator, so this mode
   * has its own leaner step, `_executeMutatingProvider`.
   *
   * Return value handling is the precise behavioral fork versus `assemble()`:
   * a mutation-mode provider's return value is ALWAYS ignored — the contract
   * is "mutate `sharedTarget`; return nothing meaningful". Interceptors are
   * still invoked by the assembler after each provider step (this method owns
   * that loop directly, mirroring `_executeProvider`'s existing interceptor
   * loop, rather than pushing interceptor invocation onto the caller) — this
   * keeps the "assembler owns declared order + conditions + retries +
   * interceptor invocation" contract identical in both modes; only what
   * happens to a provider's output differs.
   *
   * @param {Object} sharedTarget The object every provider in the recipe mutates in place.
   * @param {Object} recipe Recipe (validated the same way as `assemble()`'s recipe).
   * @param {Object} [initialParams={}] Initial parameters forwarded to every provider.
   * @param {Object} [options={}] Runtime options forwarded to providers/interceptors.
   * @returns {Object} `sharedTarget`, for convenience (it was mutated in place).
   * @throws {Error} If `sharedTarget`/`recipe`/`initialParams`/`options` are invalid.
   * @throws {ContextEngineError} If recipe validation or a provider step fails.
   */
  assembleInto(sharedTarget, recipe, initialParams = {}, options = {}) {
    if (sharedTarget == null || typeof sharedTarget !== 'object') {
      throw new Error(
        'ContextAssembler.assembleInto: sharedTarget is required and must be an object'
      );
    }

    if (!recipe || typeof recipe !== 'object') {
      throw new Error('ContextAssembler.assembleInto: recipe is required and must be an object');
    }

    if (initialParams !== null && typeof initialParams !== 'object') {
      throw new Error('ContextAssembler.assembleInto: initialParams must be an object or null');
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error('ContextAssembler.assembleInto: options must be an object or null');
    }

    const startTime = Date.now();

    try {
      this.facade._logger.info('Starting mutation-mode context assembly...');
      const validatedRecipe = this.facade._recipeParser.parse(recipe);

      let executedProviders = 0;
      let skippedProviders = 0;

      for (const providerConfig of validatedRecipe.providers) {
        const providerName = providerConfig.name;

        try {
          // Condition context uses `sharedTarget` in place of flat mode's
          // `providerResults` map — expressions can reference whatever has
          // been written into the shared object so far.
          const shouldExecute = this._evaluateCondition(
            providerConfig.condition,
            initialParams,
            sharedTarget
          );

          if (!shouldExecute) {
            this.facade._logger.info(`[${providerName}] Skipped (condition not met)`);
            skippedProviders++;
            continue;
          }

          this._executeMutatingProvider(providerConfig, sharedTarget, initialParams, options);
          executedProviders++;
        } catch (error) {
          this.facade._logger.error(
            `[${providerName}] Provider execution failed: ${error.message}`
          );
          throw new ContextEngineError(`Provider '${providerName}' failed: ${error.message}`, {
            providerName,
            providerType: providerConfig.type,
            originalError: error
          });
        }
      }

      const durationMs = Date.now() - startTime;

      this.facade._logger.info(
        `Mutation-mode context assembly completed in ${durationMs}ms ` +
          `(${executedProviders} executed, ${skippedProviders} skipped)`
      );

      return sharedTarget;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      this.facade._logger.error(
        `Mutation-mode context assembly failed after ${durationMs}ms: ${error.message}`
      );

      if (error instanceof ContextEngineError) {
        throw error;
      }

      throw new ContextEngineError(`Mutation-mode context assembly failed: ${error.message}`, {
        originalError: error
      });
    }
  }
}
