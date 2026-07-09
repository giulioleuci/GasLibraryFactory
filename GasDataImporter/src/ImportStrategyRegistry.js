import { ImportConfiguration } from './ImportConfiguration.js';

export class ImportStrategyRegistry {
  constructor(facade) {
    this.facade = facade;
  }

  registerCustomSource(name, strategyClass) {
    this.facade.logger.info(`[ImportEngine] Registering custom source strategy: ${name}`);
    this.facade._sourceFactory.registerStrategy(name, strategyClass);
    // Also whitelist the type for recipe validation — otherwise a recipe using
    // this custom source is rejected by ImportConfiguration before extraction
    // ever runs, defeating the point of registering a custom strategy.
    ImportConfiguration.registerSourceType(name);
  }

  getAvailableSourceTypes() {
    return this.facade._sourceFactory.getAvailableStrategies();
  }

  getConfigSummary() {
    return {
      sourceStrategies: this.facade._sourceFactory.getAvailableStrategies(),
      hasExpressionEngine: !!this.facade._transformer._expressionEngine,
      hasExceptionService: !!this.facade._exceptionService,
      hasMonitor: !!this.facade._monitor
    };
  }
}
