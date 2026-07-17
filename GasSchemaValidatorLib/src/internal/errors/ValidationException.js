import { BaseError } from '@CoreUtilsLib';

export class ValidationException extends BaseError {
  constructor(message, entityType = null, errors = []) {
    super(message, { entityType, validationErrors: errors });
    this.name = 'ValidationException';
    this.entityType = entityType;
    this.errors = errors;
    this.validationErrors = errors; // backwards compat with existing consumers
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return this.errors && this.errors.length > 0;
  }

  getErrorsForField(fieldName) {
    return this.errors.filter((e) => e.field === fieldName);
  }

  toObject() {
    return { ...this.toJSON(), errors: this.errors };
  }

  withContext(additionalContext) {
    const mergedContext = { ...this.context, ...additionalContext };
    const newError = new ValidationException(this.message, this.entityType, this.errors);
    newError.context = mergedContext;
    newError.stack = this.stack;
    return newError;
  }
}
