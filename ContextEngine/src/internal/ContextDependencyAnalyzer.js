export class ContextDependencyAnalyzer {
  constructor(facade) {
    this.facade = facade;
  }

  validateRecipe(recipe) {
    return this.facade._recipeParser.validate(recipe);
  }

  analyzeRecipeDependencies(recipe) {
    try {
      const validatedRecipe = this.facade._recipeParser.parse(recipe);
      const analysis = {};

      for (const provider of validatedRecipe.providers) {
        analysis[provider.name] = {
          type: provider.type,
          hasCondition: provider.condition !== null,
          condition: provider.condition,
          dependencies: this.facade._dependencyResolver.analyzeDependencies(provider.parameters)
        };
      }

      return analysis;
    } catch (error) {
      this.facade._logger.error(`Failed to analyze recipe dependencies: ${error.message}`);
      throw error;
    }
  }

  getConfigSummary() {
    return {
      hasExpressionEngine: this.facade._expressionEngine !== null,
      hasExceptionService: this.facade._exceptionService !== null,
      hasInterceptorRegistry: this.facade._interceptorRegistry !== null,
      maxRetries: this.facade._maxRetries,
      registeredProviders: this.facade._providerRegistry.getRegisteredTypes(),
      registeredPostProcessors: this.facade._postProcessor.getRegisteredTypes(),
      registeredInterceptors: this.facade._interceptorRegistry
        ? this.facade._interceptorRegistry.getRegisteredTypes()
        : []
    };
  }
}
