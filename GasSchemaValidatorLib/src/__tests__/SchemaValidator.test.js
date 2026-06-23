import { z } from 'zod';
import { SchemaValidator } from '../SchemaValidator.js';
import { ValidationException } from '../internal/errors/ValidationException.js';
import { GasValidators } from '../internal/validators/GasValidators.js';
import { BaseError } from '@CoreUtilsLib';

describe('SchemaValidator', () => {
  let validator;
  let mockLogger;

  beforeEach(() => {
    mockLogger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
    validator = new SchemaValidator(mockLogger);
  });

  describe('validate()', () => {
    it('returns parsed/coerced data on success', () => {
      const schema = z.object({ age: z.coerce.number() });
      const result = validator.validate(schema, { age: '10' });
      expect(result).toEqual({ age: 10 });
    });

    it('throws ValidationException on failure', () => {
      const schema = z.object({ name: z.string() });
      expect(() => validator.validate(schema, { name: 123 })).toThrow(ValidationException);
    });

    it('throws with entityType in message when provided', () => {
      const schema = z.object({ name: z.string() });
      expect(() => validator.validate(schema, { name: 123 }, 'User')).toThrow(
        'Validation failed for User'
      );
    });

    it('throws with generic message when entityType is null', () => {
      const schema = z.object({ name: z.string() });
      expect(() => validator.validate(schema, { name: 123 })).toThrow('Validation failed');
    });

    it('logs debug message on validation failure', () => {
      const schema = z.object({ name: z.string() });
      try { validator.validate(schema, { name: 123 }); } catch {}
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('safeValidate()', () => {
    it('returns { success: true, data } on valid input', () => {
      const schema = z.object({ name: z.string() });
      const result = validator.safeValidate(schema, { name: 'Alice' });
      expect(result).toEqual({ success: true, data: { name: 'Alice' } });
    });

    it('returns { success: false, errors } on invalid input', () => {
      const schema = z.object({ name: z.string() });
      const result = validator.safeValidate(schema, { name: 123 });
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ field: 'name' })
      ]));
    });
  });

  describe('WeakMap caching', () => {
    it('caches bound parse function on first call', () => {
      const schema = z.string();
      validator.validate(schema, 'hello');
      expect(validator._cache.has(schema)).toBe(true);
    });

    it('creates separate cache entry for different schema references', () => {
      const schema1 = z.string();
      const schema2 = z.string();
      validator.validate(schema1, 'a');
      validator.validate(schema2, 'b');
      expect(validator._cache.has(schema1)).toBe(true);
      expect(validator._cache.has(schema2)).toBe(true);
    });
  });

  describe('formatZodError() static', () => {
    it('flattens nested Zod errors using .issues (Zod v4)', () => {
      const schema = z.object({ user: z.object({ email: z.string().email() }) });
      const result = schema.safeParse({ user: { email: 'bad' } });
      expect(result.success).toBe(false);
      const formatted = SchemaValidator.formatZodError(result.error);
      expect(formatted).toEqual(expect.arrayContaining([
        { field: 'user.email', message: expect.any(String) }
      ]));
    });

    it('returns field as empty string for top-level errors', () => {
      const schema = z.string();
      const result = schema.safeParse(123);
      const formatted = SchemaValidator.formatZodError(result.error);
      expect(formatted[0].field).toBe('');
    });
  });

  describe('toValidationException() static', () => {
    it('creates ValidationException from ZodError with entityType', () => {
      const schema = z.object({ name: z.string() });
      const result = schema.safeParse({ name: 123 });
      const ex = SchemaValidator.toValidationException(result.error, 'Widget');
      expect(ex).toBeInstanceOf(ValidationException);
      expect(ex.entityType).toBe('Widget');
      expect(ex.errors.length).toBeGreaterThan(0);
    });

    it('creates ValidationException without entityType', () => {
      const schema = z.string();
      const result = schema.safeParse(123);
      const ex = SchemaValidator.toValidationException(result.error);
      expect(ex.entityType).toBeNull();
      expect(ex.message).toBe('Validation failed');
    });
  });
});

describe('ValidationException', () => {
  it('extends BaseError', () => {
    const ex = new ValidationException('msg', 'Entity', []);
    expect(ex).toBeInstanceOf(BaseError);
    expect(ex).toBeInstanceOf(Error);
  });

  it('sets name, entityType, errors, validationErrors', () => {
    const errors = [{ field: 'x', message: 'bad' }];
    const ex = new ValidationException('msg', 'Foo', errors);
    expect(ex.name).toBe('ValidationException');
    expect(ex.entityType).toBe('Foo');
    expect(ex.errors).toEqual(errors);
    expect(ex.validationErrors).toEqual(errors);
  });

  it('defaults errors to empty array when not provided', () => {
    const ex = new ValidationException('msg');
    expect(ex.errors).toEqual([]);
    expect(ex.validationErrors).toEqual([]);
  });

  it('getErrors() returns errors array', () => {
    const errors = [{ field: 'x', message: 'bad' }];
    const ex = new ValidationException('msg', 'T', errors);
    expect(ex.getErrors()).toEqual(errors);
  });

  it('hasErrors() returns true when errors present', () => {
    const ex = new ValidationException('msg', 'T', [{ field: 'x', message: 'bad' }]);
    expect(ex.hasErrors()).toBe(true);
  });

  it('hasErrors() returns false when empty', () => {
    const ex = new ValidationException('msg', 'T', []);
    expect(ex.hasErrors()).toBe(false);
  });

  it('getErrorsForField() filters by field', () => {
    const errors = [
      { field: 'name', message: 'required' },
      { field: 'age', message: 'positive' }
    ];
    const ex = new ValidationException('msg', 'T', errors);
    expect(ex.getErrorsForField('name')).toEqual([{ field: 'name', message: 'required' }]);
  });

  it('withContext() preserves entityType and errors', () => {
    const errors = [{ field: 'x', message: 'bad' }];
    const ex = new ValidationException('msg', 'Widget', errors);
    const enriched = ex.withContext({ requestId: '123' });
    expect(enriched).toBeInstanceOf(ValidationException);
    expect(enriched.entityType).toBe('Widget');
    expect(enriched.errors).toEqual(errors);
    expect(enriched.context.requestId).toBe('123');
  });

  it('toObject() includes errors', () => {
    const errors = [{ field: 'x', message: 'bad' }];
    const ex = new ValidationException('msg', 'T', errors);
    const obj = ex.toObject();
    expect(obj.errors).toEqual(errors);
  });
});

describe('GasValidators', () => {
  describe('a1Notation()', () => {
    const schema = GasValidators.a1Notation();

    it.each(['A1', 'B10', 'A1:B10', 'Sheet1!A1:B10'])(
      'accepts valid notation: %s',
      (val) => expect(() => schema.parse(val)).not.toThrow()
    );

    it('rejects invalid notation', () => {
      expect(() => schema.parse('not-a1-notation!')).toThrow();
    });
  });

  describe('spreadsheetId()', () => {
    const schema = GasValidators.spreadsheetId();
    const validId = 'a'.repeat(44);

    it('accepts valid 44-char alphanumeric ID', () => {
      expect(() => schema.parse(validId)).not.toThrow();
    });

    it('rejects too-short ID', () => {
      expect(() => schema.parse('short')).toThrow();
    });

    it('rejects ID with invalid chars', () => {
      expect(() => schema.parse('a'.repeat(30) + '!')).toThrow();
    });
  });

  describe('hexColor()', () => {
    const schema = GasValidators.hexColor();

    it('accepts #FFF (3-char)', () => expect(() => schema.parse('#FFF')).not.toThrow());
    it('accepts #FFFFFF (6-char)', () => expect(() => schema.parse('#FFFFFF')).not.toThrow());
    it('accepts lowercase hex', () => expect(() => schema.parse('#aabbcc')).not.toThrow());
    it('rejects invalid color', () => expect(() => schema.parse('red')).toThrow());
    it('rejects missing hash', () => expect(() => schema.parse('FFFFFF')).toThrow());
  });

  describe('jsonString()', () => {
    const schema = GasValidators.jsonString();

    it('parses a JSON string into an object', () => {
      expect(schema.parse('{"key":"val"}')).toEqual({ key: 'val' });
    });

    it('parses a JSON array string', () => {
      expect(schema.parse('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('rejects non-JSON strings', () => {
      expect(() => schema.parse('not-json')).toThrow();
    });

    it('validates against inner schema when provided', () => {
      const typedSchema = GasValidators.jsonString(z.object({ name: z.string() }));
      expect(typedSchema.parse('{"name":"Alice"}')).toEqual({ name: 'Alice' });
      expect(() => typedSchema.parse('{"name":123}')).toThrow();
    });
  });
});
