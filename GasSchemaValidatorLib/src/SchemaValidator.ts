import type { z } from 'zod';
import type { ValidationResult } from './types.js';

import { ValidationException } from './internal/errors/ValidationException.js';

export class SchemaValidator {
  declare _logger: { debug(message: string): void };
  constructor(logger: SchemaValidator['_logger']) {
    this._logger = logger;
  }

  validate<T extends z.ZodType>(
    schema: T,
    data: unknown,
    entityType: string | null = null
  ): z.output<T> {
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

  safeValidate<T extends z.ZodType>(
    schema: T,
    data: unknown,
    _entityType: string | null = null
  ): ValidationResult<z.output<T>> {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      errors: SchemaValidator.formatZodError(result.error)
    };
  }

  static formatZodError(zodError: z.ZodError) {
    return zodError.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  static toValidationException(zodError: z.ZodError, entityType: string | null = null) {
    const errors = SchemaValidator.formatZodError(zodError);
    const message = entityType ? `Validation failed for ${entityType}` : 'Validation failed';
    return new ValidationException(message, entityType, errors);
  }
}
