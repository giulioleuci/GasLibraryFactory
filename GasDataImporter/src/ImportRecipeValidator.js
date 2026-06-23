import { ImportConfiguration } from './ImportConfiguration.js';

export class ImportRecipeValidator {
  constructor(facade) {
    this.facade = facade;
  }

  validateRecipe(recipe) {
    try {
      const config = new ImportConfiguration(recipe, this.facade.logger);
      const summary = config.getSummary();

      return {
        valid: true,
        summary,
        message: 'Recipe is valid'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        code: error.code || 'VALIDATION_ERROR'
      };
    }
  }
}
