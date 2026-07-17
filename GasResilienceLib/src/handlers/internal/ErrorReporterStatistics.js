/**
 * @file GasResilienceLib/src/handlers/managers/ErrorReporterStatistics.js
 * @description Manager for aggregating error statistics and calculating recovery rates.
 */

export class ErrorReporterStatistics {
  constructor(facade) {
    this.facade = facade;
  }

  getSummary() {
    const counters = this.facade._counters;
    const recoveryRate =
      counters.total > 0 ? Math.round((counters.recovered / counters.total) * 100) : 100;

    return {
      counters: counters,
      recoveryRate
    };
  }
}
