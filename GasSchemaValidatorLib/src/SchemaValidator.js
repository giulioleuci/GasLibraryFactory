import { ValidationException } from './internal/errors/ValidationException.js';

export class SchemaValidator {
  constructor(logger) {
    this._logger = logger;
  }

  validate(schema, data, entityType = null) {
    const result = schema.safeParse(data);

    if (!result.success) {
      const exception = SchemaValidator.toValidationException(result.error, entityType);
      this._logger.debug(
        `[SchemaValidator] ${exception.message}: ${JSON.stringify(exception.errors)}`
      );
      throw exception;
    }

    return result.data;
  }

  safeValidate(schema, data, _entityType = null) {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      errors: SchemaValidator.formatZodError(result.error)
    };
  }

  static formatZodError(zodError) {
    return zodError.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  static toValidationException(zodError, entityType = null) {
    const errors = SchemaValidator.formatZodError(zodError);
    const message = entityType ? `Validation failed for ${entityType}` : 'Validation failed';
    return new ValidationException(message, entityType, errors);
  }
}
