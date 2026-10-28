import { BaseError } from '@CoreUtilsLib';
import type { ValidationIssue } from '../../types.js';

export class ValidationException extends BaseError {
  declare entityType: string | null;
  declare errors: ValidationIssue[];
  declare validationErrors: ValidationIssue[];
  constructor(message: string, entityType: string | null = null, errors: ValidationIssue[] = []) {
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

  getErrorsForField(fieldName: string) {
    return this.errors.filter((e) => e.field === fieldName);
  }

  toObject() {
    return { ...this.toJSON(), errors: this.errors };
  }

  withContext(additionalContext: Record<string, unknown>) {
    const mergedContext = { ...this.context, ...additionalContext };
    const newError = new ValidationException(this.message, this.entityType, this.errors);
    newError.context = mergedContext;
    newError.stack = this.stack;
    return newError;
  }
}
