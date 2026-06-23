import { ConfigurationError } from '@CoreUtilsLib';
import { ValidationException } from '@GasSchemaValidatorLib';

export class TableSchemaValidator {
  constructor(facade) {
    this.facade = facade;
  }

  setSchema(zodSchema) {
    if (!zodSchema || typeof zodSchema.safeParse !== 'function') {
      throw new ConfigurationError('setSchema() requires a Zod schema');
    }
    this.facade._schema = zodSchema;
    this.facade._schemaValidationEnabled = true;
    this.facade._logger.debug(`Schema validation enabled for table '${this.facade.sheetName}'`);
    return this.facade;
  }

  disableSchemaValidation() {
    this.facade._schemaValidationEnabled = false;
    this.facade._logger.debug(`Schema validation disabled for table '${this.facade.sheetName}'`);
    return this.facade;
  }

  enableSchemaValidation() {
    if (!this.facade._schema) {
      throw new ConfigurationError('Cannot enable schema validation: no schema has been set');
    }
    this.facade._schemaValidationEnabled = true;
    this.facade._logger.debug(`Schema validation enabled for table '${this.facade.sheetName}'`);
    return this.facade;
  }

  validateRow(rowObj, isUpdate = false) {
    if (!this.facade._schemaValidationEnabled || !this.facade._schema) {
      return rowObj;
    }

    if (!this.facade._schemaValidator) {
      throw new ConfigurationError(
        'Schema validation requires a SchemaValidator instance'
      );
    }

    const schema = isUpdate ? this.facade._schema.partial() : this.facade._schema;
    const result = this.facade._schemaValidator.safeValidate(schema, rowObj);

    if (!result.success) {
      throw new ValidationException(
        'Row validation failed',
        this.facade.sheetName,
        result.errors
      );
    }

    return result.data;
  }
}
