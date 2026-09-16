/**
 * Registry-based test orchestrator for Google Apps Script, supporting namespaced test discovery and structured diagnostic logging.
 * @class
 */
export class EnhancedTestRunner {
  constructor() {
    this.registry = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Appends a test case to the internal registry with execution constraints.
   * @param {string} path Hierarchical identifier (e.g., 'Library/Suite/Test').
   * @param {Function} fn Implementation logic for the test case.
   * @param {Object} [options={}] execution configuration.
   * @param {boolean} [options.skip=false] If true, bypasses test execution.
   * @returns {this} Chainable runner instance.
   */
  register(path, fn, options = {}) {
    this.registry.push({
      path: path,
      fn: fn,
      skip: options.skip || false
    });
    return this;
  }

  /**
   * Orchestrates the execution of registered tests filtered by path or regular expression.
   * @param {string|RegExp|null} [filter=null] Selection criteria for test subset.
   * @returns {Object} Execution statistics and failure records.
   */
  run(filter = null) {
    const testsToRun = this.registry.filter((test) => {
      if (!filter) {
        return true;
      }
      if (typeof filter === 'string') {
        return test.path.includes(filter);
      }
      if (filter instanceof RegExp) {
        return filter.test(test.path);
      }
      return true;
    });

    this._log(`Running ${testsToRun.length} tests matching filter: ${filter || 'NONE'}`);

    try {
      for (const test of testsToRun) {
        if (test.skip) {
          this._log(`[TEST:SKIP] ${test.path}`);
          this.results.skipped++;
          continue;
        }

        this._runTest(test);
      }
    } catch (error) {
      this._log(`[FATAL:ERROR] ${error.message}`);
      this._log(`[ERROR:STACK] ${error.stack}`);
    }

    this._printSummary();
    return this.results;
  }

  /**
   * Executes a single test unit and records the outcome.
   * @private
   * @param {Object} test Internal registry record.
   */
  _runTest(test) {
    this._log(`[TEST:START] ${test.path}`);
    const startTime = new Date().getTime();

    try {
      // Execute test function
      test.fn();

      const duration = new Date().getTime() - startTime;
      this._log(`[TEST:END] PASS | Duration: ${duration}ms`);
      this.results.passed++;
    } catch (rawError) {
      // Normalizes a non-Error `throw` (string, object, ...) into an Error-shaped record instead
      // of losing its content to `undefined` .message/.stack (ref ALDO_GLF_AUDIT_RESULTS.md K-2).
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      const duration = new Date().getTime() - startTime;
      this._log(`[ERROR:STACK] ${error.stack}`);
      this._log(`[TEST:END] FAIL | Duration: ${duration}ms`);
      this.results.failed++;
      this.results.errors.push({
        path: test.path,
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Routes diagnostic messages to the environment-appropriate output (GAS Logger or System Console).
   * @private
   * @param {string} message Diagnostic content.
   */
  _log(message) {
    if (typeof Logger !== 'undefined') {
      Logger.log(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Synthesizes and outputs the final execution report including total counts and failure details.
   * @private
   */
  _printSummary() {
    this._log('═══════════════════════════════════════════════');
    this._log('TEST EXECUTION SUMMARY');
    this._log(`TOTAL: ${this.results.passed + this.results.failed + this.results.skipped}`);
    this._log(`PASSED: ${this.results.passed}`);
    this._log(`FAILED: ${this.results.failed}`);
    this._log(`SKIPPED: ${this.results.skipped}`);
    this._log('═══════════════════════════════════════════════');

    if (this.results.failed > 0) {
      this._log('FAILED TESTS:');
      for (const err of this.results.errors) {
        this._log(`- ${err.path}: ${err.message}`);
      }
    }
  }
}

// Singleton instance for global use
export const runner = new EnhancedTestRunner();
