function runSchemaValidatorTests() {
  const runner = new EnhancedTestRunner('GasSchemaValidatorLib');

  runner.test('SchemaValidator - validates and coerces data', () => {
    const logger = new LoggerService();
    const validator = new SchemaValidator(logger);
    const schema = z.object({ age: z.coerce.number() });
    const result = validator.validate(schema, { age: '42' });
    SmartAssert.equals(result.age, 42, 'Should coerce string to number');
  });

  runner.test('SchemaValidator - throws ValidationException on failure', () => {
    const logger = new LoggerService();
    const validator = new SchemaValidator(logger);
    const schema = z.object({ name: z.string() });
    let threw = false;
    try {
      validator.validate(schema, { name: 123 });
    } catch (e) {
      threw = true;
      SmartAssert.isTrue(e instanceof ValidationException, 'Should throw ValidationException');
    }
    SmartAssert.isTrue(threw, 'Should have thrown');
  });

  runner.test('SchemaValidator - WeakMap cache benchmark (1000 rows)', () => {
    const logger = new LoggerService();
    const validator = new SchemaValidator(logger);
    const schema = z.object({ id: z.string(), name: z.string() });
    const data = { id: 'abc', name: 'test' };

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      validator.validate(schema, data);
    }
    const elapsed = Date.now() - start;
    Logger.log('1000 validations completed in ' + elapsed + 'ms');
    SmartAssert.isTrue(elapsed < 5000, 'Should complete within GAS time limits');
  });

  runner.test('ValidationException - serializes cleanly', () => {
    const ex = new ValidationException('Test', 'Entity', [{ field: 'x', message: 'bad' }]);
    const json = JSON.stringify(ex.toObject());
    SmartAssert.isTrue(json.length > 0, 'Should serialize to JSON');
    Logger.log('ValidationException JSON: ' + json);
  });

  runner.test('GasValidators.a1Notation() - valid A1 range', () => {
    const schema = GasValidators.a1Notation();
    const result = schema.safeParse('Sheet1!A1:B10');
    SmartAssert.isTrue(result.success, 'Should accept valid A1 notation');
  });

  runner.test('GasValidators.hexColor() - valid hex', () => {
    const schema = GasValidators.hexColor();
    const result = schema.safeParse('#AABBCC');
    SmartAssert.isTrue(result.success, 'Should accept valid hex color');
  });

  runner.run();
}
