/**
 * @file PipelineFramework/src/postprocessor/ValueResolver.js
 * @description Resolves values from various sources for post-processor updates.
 * @version 1.0.0
 */

import { ValueSource, ValueSourceType } from './ValueSource';
import { ValueResolutionError } from '../internal/postprocessor-errors/PostProcessorError';

/**
 * Unified resolver for extracting data from disparate sources (Literals, Context, Outputs, Expressions).
 * Used by post-processors to map dynamic data into side-effect operations.
 *
 * @class ValueResolver
 *
 * @example
 * const val = resolver.resolve(ValueSource.context('user.id'), context);
 */
export class ValueResolver {
  /**
   * @param {Object} [services={}] - Dependency injection container.
   * @param {LoggerService} [services.logger] - Foundation logging service.
   * @param {ExpressionEngineService} [services.expressionEngine] - Service for EXPRESSION-type resolution.
   * @param {Object} [services.utils] - Utility service for advanced date formatting.
   */
  constructor(services = {}) {
    /**
     * Logger service.
     * @type {LoggerService}
     * @private
     */
    const fallback = console;
    if (typeof fallback.debug !== 'function') {
      fallback.debug = fallback.log;
    }
    this._logger = services.logger || fallback;

    /**
     * Expression engine for expression evaluation.
     * @type {ExpressionEngineService|null}
     * @private
     */
    this._expressionEngine = services.expressionEngine || null;

    /**
     * Utils service.
     * @type {Object|null}
     * @private
     */
    this._utils = services.utils || null;
  }

  /**
   * Resolves a single ValueSource into a concrete value.
   *
   * @param {ValueSource|Object} source - Configuration defining the source and path of the data.
   * @param {PostProcessorContext} context - Active execution context for data lookup.
   * @returns {*} The resolved literal, context value, or expression result.
   * @throws {ValueResolutionError} If the source type is unknown or resolution logic fails.
   */
  resolve(source, context) {
    // Convert plain object to ValueSource if needed
    const valueSource = source instanceof ValueSource ? source : ValueSource.fromConfig(source);

    switch (valueSource.type) {
      case ValueSourceType.LITERAL:
        return this._resolveLiteral(valueSource);

      case ValueSourceType.CONTEXT:
        return this._resolveContext(valueSource, context);

      case ValueSourceType.STEP_OUTPUT:
        return this._resolveStepOutput(valueSource, context);

      case ValueSourceType.EXPRESSION:
        return this._resolveExpression(valueSource, context);

      case ValueSourceType.TIMESTAMP:
        return this._resolveTimestamp(valueSource);

      default:
        throw new ValueResolutionError(valueSource.type, 'unknown', {
          message: `Unknown value source type: ${valueSource.type}`
        });
    }
  }

  /**
   * Resolves an object map of ValueSources into an object map of concrete values.
   *
   * @param {Object.<string, ValueSource|Object>} sources - Map of target keys to source configurations.
   * @param {PostProcessorContext} context - Active execution context.
   * @returns {Object.<string, *>} Map of target keys to their respective resolved values.
   */
  resolveAll(sources, context) {
    const result = {};

    for (const [key, source] of Object.entries(sources)) {
      result[key] = this.resolve(source, context);
    }

    return result;
  }

  /**
   * @param {ValueSource} source - Source with literal property.
   * @returns {*} Static value.
   * @private
   */
  _resolveLiteral(source) {
    return source.literal;
  }

  /**
   * @param {ValueSource} source - Source with contextPath property.
   * @param {PostProcessorContext} context - Source of pipeline data.
   * @returns {*} Value from context.
   * @throws {ValueResolutionError} If contextPath is missing.
   * @private
   */
  _resolveContext(source, context) {
    const path = source.contextPath;

    if (!path) {
      throw new ValueResolutionError(ValueSourceType.CONTEXT, 'undefined', {
        message: 'Context path is required for CONTEXT value source'
      });
    }

    // Handle different path prefixes
    let resolvedPath = path;

    // Support 'pipeline.' prefix for clarity (optional)
    if (path.startsWith('pipeline.')) {
      resolvedPath = path.substring('pipeline.'.length);
    }

    const value = context.getPipelineData(resolvedPath);

    this._logger.debug(`[ValueResolver] Resolved context path '${path}' to:`, value);

    return value;
  }

  /**
   * @param {ValueSource} source - Source with outputKey property.
   * @param {PostProcessorContext} context - Source of step output.
   * @returns {*} Value from step result output.
   * @throws {ValueResolutionError} If outputKey is missing.
   * @private
   */
  _resolveStepOutput(source, context) {
    const key = source.outputKey;

    if (!key) {
      throw new ValueResolutionError(ValueSourceType.STEP_OUTPUT, 'undefined', {
        message: 'Output key is required for STEP_OUTPUT value source'
      });
    }

    const value = context.getStepOutput(key);

    this._logger.debug(`[ValueResolver] Resolved step output '${key}' to:`, value);

    return value;
  }

  /**
   * @param {ValueSource} source - Source with expression property.
   * @param {PostProcessorContext} context - Context for expression variables.
   * @returns {*} Evaluation result.
   * @throws {ValueResolutionError} If engine is missing or evaluation fails.
   * @private
   */
  _resolveExpression(source, context) {
    const expression = source.expression;

    if (!expression) {
      throw new ValueResolutionError(ValueSourceType.EXPRESSION, 'undefined', {
        message: 'Expression is required for EXPRESSION value source'
      });
    }

    if (!this._expressionEngine) {
      throw new ValueResolutionError(ValueSourceType.EXPRESSION, expression, {
        message: 'Expression engine is required for EXPRESSION value source but was not provided'
      });
    }

    try {
      // Create expression context from post-processor context
      const expressionContext = context.toExpressionContext();
      const value = this._expressionEngine.evaluate(expression, expressionContext);

      this._logger.debug(`[ValueResolver] Evaluated expression '${expression}' to:`, value);

      return value;
    } catch (error) {
      throw new ValueResolutionError(
        ValueSourceType.EXPRESSION,
        expression,
        { evaluationError: error.message },
        error
      );
    }
  }

  /**
   * @param {ValueSource} source - Source with optional format property.
   * @returns {string} Formatted timestamp.
   * @private
   */
  _resolveTimestamp(source) {
    const now = new Date();

    // If no format specified, return ISO string
    if (!source.format) {
      return now.toISOString();
    }

    // If utils service with date formatting is available, use it
    if (this._utils && typeof this._utils.formatDate === 'function') {
      return this._utils.formatDate(now, source.format);
    }

    // Fallback to basic formatting
    return this._basicFormatDate(now, source.format);
  }

  /**
   * @param {Date} date - Date instance to format.
   * @param {string} format - Pattern string (yyyy, MM, dd, HH, mm, ss).
   * @returns {string} Formatted string.
   * @private
   */
  _basicFormatDate(date, format) {
    // Basic format support for common patterns
    const pad = (n) => n.toString().padStart(2, '0');

    return format
      .replace('yyyy', date.getFullYear())
      .replace('MM', pad(date.getMonth() + 1))
      .replace('dd', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()));
  }
}
