/**
 * @file PipelineFramework/src/examples/TemplateSelectorStep.js
 * @description Example ProducerStep implementation - Selects template based on business rules
 * @version 1.0.0
 */

import { ProducerStep } from '../ProducerStep';

/**
 * Example ProducerStep implementation for template selection via business rules.
 * Demonstrates the Producer pattern by evaluating logical expressions to decide
 * which template ID should be used in subsequent pipeline steps.
 *
 * @class TemplateSelectorStep
 * @extends ProducerStep
 *
 * @example
 * const step = new TemplateSelectorStep(logger, expressionEngine, {
 *   outputKey: 'selected_template_id',
 *   rules: [ { condition: '{{grade}} >= 6', value: 'PASS' } ]
 * });
 */
export class TemplateSelectorStep extends ProducerStep {
  /**
   * @param {LoggerService} logger - Foundation logging service.
   * @param {ExpressionEngineService} expressionEngine - Service for rule/expression evaluation.
   * @param {Object} [options={}] - Step configuration.
   * @param {string} options.outputKey - Required: Context key for the selected template ID result.
   * @param {string[]} [options.requiredKeys=['grade', 'absences']] - Mandatory context keys.
   * @param {Array<{condition: string, value: string}>} [options.rules] - Ordered list of evaluation rules.
   */
  constructor(logger, expressionEngine, options = {}) {
    // Ensure default required keys
    const defaultOptions = {
      requiredKeys: ['grade', 'absences'],
      ...options
    };

    super('TemplateSelector', logger, expressionEngine, defaultOptions);

    /**
     * Business rules for template selection.
     * Each rule has a condition (expression) and a value (template ID).
     * @private
     * @type {Array<{condition: string, value: string}>}
     */
    this._rules = options.rules || [
      {
        condition: '{{grade}} >= 6 && {{absences}} < 5',
        value: 'TEMPLATE_PASS'
      },
      {
        condition: '{{grade}} < 6',
        value: 'TEMPLATE_FAIL'
      },
      {
        condition: '{{absences}} >= 5',
        value: 'TEMPLATE_TOO_MANY_ABSENCES'
      }
    ];

    /**
     * Default template if no rules match.
     * @private
     * @type {string}
     */
    this._defaultTemplate = 'TEMPLATE_DEFAULT';
  }

  /**
   * Evaluates defined rules in order against context data.
   * Returns the value of the first matching rule, or a default template if no matches occur.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {string} Selected template identifier (e.g., 'TEMPLATE_PASS').
   * @protected
   */
  evaluateRules(context) {
    const contextData = context.getData();

    this._logger.debug(
      `[${this._name}] Evaluating ${this._rules.length} rules against context: ` +
        `grade=${contextData.grade}, absences=${contextData.absences}`
    );

    // Evaluate rules in order
    for (const rule of this._rules) {
      try {
        const matches = this._expressionEngine.evaluate(rule.condition, contextData);

        this._logger.debug(
          `[${this._name}] Rule: "${rule.condition}" => ${matches} (value: ${rule.value})`
        );

        if (matches) {
          this._logger.info(`[${this._name}] Rule matched: "${rule.condition}" => ${rule.value}`);
          return rule.value;
        }
      } catch (error) {
        this._logger.error(
          `[${this._name}] Error evaluating rule "${rule.condition}": ${error.message}`
        );
        // Continue to next rule
      }
    }

    // No rules matched, return default
    this._logger.warn(
      `[${this._name}] No rules matched, using default template: ${this._defaultTemplate}`
    );
    return this._defaultTemplate;
  }
}
