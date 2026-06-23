/**
 * @file CoreUtilsLib/src/config/ConfigValidator.js
 * @description Provides validation and type coercion for configurations.
 * @version 1.0.0
 */

export class ConfigValidator {
  /**
   * Validates configuration object against provided rules.
   * @param {Object} config Configuration to validate.
   * @param {Object} rules Validation rules.
   * @param {string} context Context for error messages.
   * @returns {{valid: boolean, errors: string[]}} Validation result.
   */
  validateConfiguration(config, rules, context) {
    const errors = [];

    for (const [key, rule] of Object.entries(rules)) {
      const value = config ? config[key] : undefined;
      const keyErrors = this.validateField(key, value, rule, context);
      errors.push(...keyErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Asserts configuration validity against rules, throwing on failure.
   * @param {Object} config Configuration to validate.
   * @param {Object} rules Validation rules.
   * @param {string} context Context for error messages.
   * @throws {Error} If validation fails.
   */
  assertValid(config, rules, context) {
    const result = this.validateConfiguration(config, rules, context);

    if (!result.valid) {
      throw new Error(
        `${context}: Configuration validation failed:\n- ${result.errors.join('\n- ')}`
      );
    }
  }

  /**
   * Coerces value to specified target type for configuration normalization.
   * @param {*} value Value to coerce.
   * @param {string} type Target type ('string', 'number', 'boolean', etc.).
   * @param {string} key Configuration key for context.
   * @param {string} context Error context.
   * @returns {*} Coerced value.
   */
  coerceType(value, type, key, context) {
    switch (type) {
      case 'string':
        return String(value);

      case 'number': {
        const num = Number(value);
        if (Number.isNaN(num)) {
          throw new Error(`${context}: ${key} must be a valid number, got: ${value}`);
        }
        return num;
      }

      case 'integer': {
        const int = parseInt(value, 10);
        if (Number.isNaN(int)) {
          throw new Error(`${context}: ${key} must be a valid integer, got: ${value}`);
        }
        return int;
      }

      case 'boolean':
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1' || lower === 'yes') {
            return true;
          }
          if (lower === 'false' || lower === '0' || lower === 'no') {
            return false;
          }
        }
        return Boolean(value);

      case 'array':
        if (Array.isArray(value)) {
          return value;
        }
        return [value];

      case 'object':
        if (typeof value === 'object' && value !== null) {
          return value;
        }
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            throw new Error(`${context}: ${key} must be a valid JSON object`);
          }
        }
        throw new Error(`${context}: ${key} must be an object`);

      default:
        return value;
    }
  }

  /**
   * Validates single field against rule, returning list of error messages.
   * @param {string} key Field key.
   * @param {*} value Field value.
   * @param {Object} rule Validation rule.
   * @param {string} _context Error context.
   * @returns {string[]} Validation errors.
   */
  validateField(key, value, rule, _context) {
    const errors = [];

    // Check required
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`);
      return errors; // Skip other validations if required field is missing
    }

    // Skip validation for undefined/null optional fields
    if (value === undefined || value === null) {
      return errors;
    }

    // Check type
    if (rule.type) {
      const typeValid = this.checkType(value, rule.type);
      if (!typeValid) {
        errors.push(`${key} must be of type ${rule.type}`);
      }
    }

    // Check enum values
    if (rule.enum && !rule.enum.includes(value)) {
      const allowed = rule.enum.map((v) => `'${v}'`).join(', ');
      errors.push(`${key} must be one of: ${allowed}`);
    }

    // Check min/max for numbers
    if (rule.type === 'number' || rule.type === 'integer') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${key} must be >= ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${key} must be <= ${rule.max}`);
      }
    }

    // Check minLength/maxLength for strings
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`${key} must have at least ${rule.minLength} characters`);
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`${key} must have at most ${rule.maxLength} characters`);
      }
    }

    // Check pattern for strings
    if (rule.pattern && typeof value === 'string') {
      const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      if (!regex.test(value)) {
        errors.push(`${key} must match pattern: ${rule.pattern}`);
      }
    }

    // Custom validator
    if (rule.validator && typeof rule.validator === 'function') {
      const customError = rule.validator(value, key);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }

  /**
   * Checks value type against expectation for configuration validation.
   * @param {*} value Value to check.
   * @param {string} type Expected type ('string', 'number', 'boolean', etc.).
   * @returns {boolean} True if type matches.
   */
  checkType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value);
      case 'integer':
        return Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'function':
        return typeof value === 'function';
      default:
        return true;
    }
  }
}
