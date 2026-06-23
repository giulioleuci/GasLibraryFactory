/**
 * @file PipelineFramework/src/ProducerStep.js
 * @description Producer Step - Evaluates business logic and writes scalar results to context
 * @version 1.0.0
 */

import { Step } from './Step';

/**
 * Abstract base class for the "Decision" phase of the Producer-Consumer pattern.
 * Evaluates business logic/rules using GasExpressionEngineLib and writes scalar results to PipelineContext.
 *
 * @class ProducerStep
 * @extends Step
 * @abstract
 * @typedef {Object} ProducerOptions
 * @property {string} outputKey - Required context key for writing the scalar result.
 * @property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
 * @property {boolean} [continueOnError=false] - Whether to proceed if rule evaluation fails.
 * @property {Function} [shouldExecuteCondition=null] - Predicate function for conditional execution.
 *
 * @example
 * class GradeSelectorStep extends ProducerStep {
 *   evaluateRules(context) {
 *     const { grade } = context.getData();
 *     return grade >= 6 ? 'PASS' : 'FAIL';
 *   }
 * }
 */
export class ProducerStep extends Step {
  /**
   * @param {string} name - Unique step identifier.
   * @param {LoggerService} logger - Foundation logging service.
   * @param {ExpressionEngineService} expressionEngine - Service for rule/expression evaluation.
   * @param {ProducerOptions} options - Configuration for context output and validation.
   * @throws {Error} If expressionEngine is missing or lacks 'evaluate' method.
   * @throws {Error} If options.outputKey is missing or not a string.
   */
  constructor(name, logger, expressionEngine, options = {}) {
    // Validate expressionEngine
    if (!expressionEngine || typeof expressionEngine !== 'object') {
      throw new Error('ProducerStep: expressionEngine is required and must be an object');
    }

    if (typeof expressionEngine.evaluate !== 'function') {
      throw new Error('ProducerStep: expressionEngine must have an evaluate method');
    }

    // Validate outputKey
    if (!options.outputKey || typeof options.outputKey !== 'string') {
      throw new Error('ProducerStep: options.outputKey is required and must be a non-empty string');
    }

    super(name, logger, options);

    /**
     * Expression engine for evaluating rules.
     * @protected
     * @type {ExpressionEngineService}
     */
    this._expressionEngine = expressionEngine;

    /**
     * Context key where the result will be written.
     * @protected
     * @type {string}
     */
    this._outputKey = options.outputKey;
  }

  /**
   * @returns {ExpressionEngineService} Active expression engine instance.
   * @protected
   */
  get expressionEngine() {
    return this._expressionEngine;
  }

  /**
   * @returns {string} Configured context output key.
   * @protected
   */
  get outputKey() {
    return this._outputKey;
  }

  /**
   * Evaluates business rules to produce a scalar result. Must be implemented by subclasses.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {string|number|boolean} Scalar result for context write-back.
   * @throws {Error} If not implemented by subclass.
   * @protected
   * @abstract
   */
  evaluateRules(_context) {
    throw new Error(`ProducerStep.evaluateRules must be implemented by subclass: ${this._name}`);
  }

  /**
   * Validates that evaluation results are non-null scalar types.
   *
   * @param {*} result - Value to validate.
   * @returns {boolean} True if result is string, number, or boolean.
   * @throws {Error} If result is null, undefined, or a non-scalar type (object, array, etc).
   * @private
   */
  _validateScalarResult(result) {
    // Check null/undefined first (before typeof check)
    if (result === null || result === undefined) {
      throw new Error(
        `ProducerStep (${this._name}): evaluateRules must not return null or undefined`
      );
    }

    const resultType = typeof result;

    if (resultType !== 'string' && resultType !== 'number' && resultType !== 'boolean') {
      throw new Error(
        `ProducerStep (${this._name}): evaluateRules must return a scalar value (string/number/boolean), got ${resultType}`
      );
    }

    return true;
  }

  /**
   * Orchestrates the producer workflow: rule evaluation, validation, and context write-back.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {void}
   * @final
   */
  _executeLogic(context) {
    this._logger.debug(`[${this._name}] Evaluating business rules...`);

    // Evaluate rules (implemented by subclass)
    const result = this.evaluateRules(context);

    // Validate result is scalar
    this._validateScalarResult(result);

    this._logger.debug(`[${this._name}] Evaluated result: ${result} (type: ${typeof result})`);

    // Write result to context
    this.setResult(context, this._outputKey, result);

    this._logger.info(`[${this._name}] Decision made: ${this._outputKey} = ${result}`);
  }
}
