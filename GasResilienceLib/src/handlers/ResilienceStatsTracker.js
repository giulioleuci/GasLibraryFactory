export class ResilienceStatsTracker {
  constructor(facade) {
    this.facade = facade;
  }

  classifyError(error) {
    // Validate input - handle non-Error throws (GRL-C005)
    if (error === null || error === undefined) {
      throw new Error('ExceptionService.classifyError: error is required');
    }

    // Convert non-Error throws to Error objects
    const errorToClassify = error instanceof Error ? error : new Error(String(error));

    return this.facade._classifier.classify(errorToClassify);
  }

  resetStatistics() {
    this.facade._reporter.reset();
  }

  getErrorSummary() {
    return this.facade._reporter.getSummary();
  }

  printErrorAnalysis() {
    const summary = this.facade._reporter.getSummary();
    this.facade._logger.warn('=== Error Analysis Report ===');
    this.facade._logger.warn(`Total Errors: ${summary.counters.total}`);
    this.facade._logger.warn(`Recovered: ${summary.counters.recovered}`);
    this.facade._logger.warn(`Failed: ${summary.counters.notRecovered}`);
    this.facade._logger.warn(`Recovery Rate: ${summary.recoveryRate}%`);
    this.facade._logger.warn('Errors by Type:', summary.counters.byType);
  }

  getStatistics() {
    const summary = this.facade._reporter.getSummary();
    return {
      totalAttempts: summary.counters.total,
      recoveryRate: summary.recoveryRate,
      counters: summary.counters
    };
  }

  getCircuitBreaker() {
    return this.facade._circuitBreaker;
  }

  getCircuitBreakerStatistics() {
    if (!this.facade._circuitBreaker) {
      return {};
    }
    return this.facade._circuitBreaker.getStatistics();
  }

  resetCircuit(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('ExceptionService.resetCircuit: operationName must be a non-empty string');
    }

    if (!this.facade._circuitBreaker) {
      this.facade._logger.warn('ExceptionService.resetCircuit: No circuit breaker configured');
      return false;
    }

    this.facade._circuitBreaker.reset(operationName);
    return true;
  }
}
