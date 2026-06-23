/**
 * @file PipelineFramework/src/postprocessor/ValueSource.js
 * @description Value source types and utilities for post-processor configurations.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Supported value resolution strategies for post-processor updates.
 */
export const ValueSourceType = Object.freeze({
  /** Static value literal. */
  LITERAL: 'LITERAL',
  /** Pipeline context path (e.g., 'pipeline.userId'). */
  CONTEXT: 'CONTEXT',
  /** Step execution output key. */
  STEP_OUTPUT: 'STEP_OUTPUT',
  /** JSEP expression string. */
  EXPRESSION: 'EXPRESSION',
  /** Current system timestamp. */
  TIMESTAMP: 'TIMESTAMP'
});

/**
 * @function isValidValueSourceType
 * @description Validates if a string is a recognized ValueSourceType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ValueSourceType.
 */
export function isValidValueSourceType(value) {
  return Object.values(ValueSourceType).includes(value);
}

/**
 * @class ValueSource
 * @description Configuration for post-processor value resolution.
 * @property {string} type - Strategy from ValueSourceType.
 * @property {*} [literal] - Static value (for LITERAL).
 * @property {string} [contextPath] - Pipeline path (for CONTEXT).
 * @property {string} [outputKey] - Result key (for STEP_OUTPUT).
 * @property {string} [expression] - Evaluate expression (for EXPRESSION).
 * @property {string|null} [format] - Date format (for TIMESTAMP).
 */
export class ValueSource {
  /**
   * @constructor
   * @param {string} type - Strategy type.
   * @param {Object} [config={}] - Type-specific configuration.
   * @throws {Error} If type is invalid.
   * @private
   */
  constructor(type, config = {}) {
    if (!isValidValueSourceType(type)) {
      throw new Error(`ValueSource: Invalid type '${type}'`);
    }

    /** @type {string} */
    this.type = type;

    /** @type {*} */
    this.literal = config.literal;

    /** @type {string|undefined} */
    this.contextPath = config.contextPath;

    /** @type {string|undefined} */
    this.outputKey = config.outputKey;

    /** @type {string|undefined} */
    this.expression = config.expression;

    /** @type {string|null} */
    this.format = config.format || null;
  }

  /**
   * @static
   * @description Creates a literal value source.
   * @param {*} value - Literal data.
   * @returns {ValueSource} Configured literal source.
   */
  static literal(value) {
    return new ValueSource(ValueSourceType.LITERAL, { literal: value });
  }

  /**
   * @static
   * @description Creates a context path value source.
   * @param {string} path - Context dot-notation path.
   * @returns {ValueSource} Configured context source.
   * @throws {Error} If path is non-string or empty.
   */
  static context(path) {
    if (!path || typeof path !== 'string') {
      throw new Error('ValueSource.context: path must be a non-empty string');
    }
    return new ValueSource(ValueSourceType.CONTEXT, { contextPath: path });
  }

  /**
   * @static
   * @description Creates a step output value source.
   * @param {string} key - Output key.
   * @returns {ValueSource} Configured step output source.
   * @throws {Error} If key is non-string or empty.
   */
  static stepOutput(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('ValueSource.stepOutput: key must be a non-empty string');
    }
    return new ValueSource(ValueSourceType.STEP_OUTPUT, { outputKey: key });
  }

  /**
   * @static
   * @description Creates an expression value source.
   * @param {string} expr - Expression string.
   * @returns {ValueSource} Configured expression source.
   * @throws {Error} If expr is non-string or empty.
   */
  static expression(expr) {
    if (!expr || typeof expr !== 'string') {
      throw new Error('ValueSource.expression: expr must be a non-empty string');
    }
    return new ValueSource(ValueSourceType.EXPRESSION, { expression: expr });
  }

  /**
   * @static
   * @description Creates a timestamp value source.
   * @param {string|null} [format=null] - Date format (ISO if null).
   * @returns {ValueSource} Configured timestamp source.
   */
  static timestamp(format = null) {
    return new ValueSource(ValueSourceType.TIMESTAMP, { format });
  }

  /**
   * @static
   * @description Hydrates a ValueSource from a POJO.
   * @param {Object} config - Configuration object.
   * @param {string} config.type - Strategy type.
   * @returns {ValueSource} Instance from config.
   * @throws {Error} If config is invalid or type is missing.
   */
  static fromConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('ValueSource.fromConfig: config must be an object');
    }

    if (!config.type) {
      throw new Error('ValueSource.fromConfig: config.type is required');
    }

    return new ValueSource(config.type, config);
  }

  /**
   * @function toObject
   * @description Serializes instance to POJO.
   * @returns {Object} JSON-serializable representation.
   */
  toObject() {
    const obj = { type: this.type };

    switch (this.type) {
      case ValueSourceType.LITERAL:
        obj.literal = this.literal;
        break;
      case ValueSourceType.CONTEXT:
        obj.contextPath = this.contextPath;
        break;
      case ValueSourceType.STEP_OUTPUT:
        obj.outputKey = this.outputKey;
        break;
      case ValueSourceType.EXPRESSION:
        obj.expression = this.expression;
        break;
      case ValueSourceType.TIMESTAMP:
        if (this.format) {
          obj.format = this.format;
        }
        break;
    }

    return obj;
  }
}
