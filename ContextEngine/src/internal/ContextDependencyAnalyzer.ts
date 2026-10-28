import type { ContextAssembler } from '../ContextAssembler.js';
import type { Recipe, ProviderAnalysis } from './contracts.js';
export class ContextDependencyAnalyzer {
  declare facade: ContextAssembler;
  constructor(facade: ContextAssembler) {
    this.facade = facade;
  }

  validateRecipe(recipe: unknown) {
    return this.facade._recipeParser.validate(recipe);
  }

  analyzeRecipeDependencies(recipe: Recipe) {
    try {
      const validatedRecipe = this.facade._recipeParser.parse(recipe);
      const analysis: Record<string, ProviderAnalysis> = {};

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
      this.facade._logger.error(
        `Failed to analyze recipe dependencies: ${(error as Error).message}`
      );
      throw error;
    }
  }

  getConfigSummary() {
    return {
      hasExpressionEngine: this.facade._expressionEngine !== null,
      hasExceptionService: this.facade._exceptionService !== null,
      hasInterceptorRegistry: this.facade._interceptorRegistry !== null,
      maxRetries: this.facade._maxRetries,
      registeredProviders: this.facade._providerRegistry.getRegisteredTypes!(),
      registeredPostProcessors: this.facade._postProcessor.getRegisteredTypes!(),
      registeredInterceptors: this.facade._interceptorRegistry
        ? this.facade._interceptorRegistry.getRegisteredTypes!()
        : []
    };
  }
}
