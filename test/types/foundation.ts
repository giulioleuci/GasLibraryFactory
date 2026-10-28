import { isPlainObject, isString, LazyRef, Registry, Result } from '@CoreUtilsLib';
import type { ExceptionService } from '@GasResilienceLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';
import type { DatasetRule } from '@GasSchemaValidatorLib';

export function foundationContracts(service: ExceptionService, input: unknown) {
  const registry = new Registry<string, number>();
  registry.set('count', 123);
  const stored: number | undefined = registry.get('count');
  // @ts-expect-error Registry values must retain the declared payload type.
  registry.set('wrong', '123');
  const lazy: number = new LazyRef<number>(() => 123).get();
  const payload: number | null = Result.ok(123).value;
  if (isString(input)) {
    const text: string = input;
    text.toUpperCase();
  }
  if (isPlainObject(input)) {
    const record: Record<string, unknown> = input;
    Object.keys(record);
  }
  const result = service.executeWithAdvancedHandling(() => 123);
  const synchronous: number | null = result.result;
  // @ts-expect-error Retry counts are numeric options.
  service.executeWithAdvancedHandling(() => 123, {}, { maxAttempts: '3' });
  const validator = new SchemaValidator({ debug() {} });
  const validated = validator.validate(z.object({ count: z.number() }), { count: 123 });
  const count: number = validated.count;
  // @ts-expect-error Dataset rules use the existing supported rule variants.
  const invalidRule: DatasetRule = { type: 'unsupported', id: 'rule', table: 'rows' };
  return { stored, lazy, payload, synchronous, count, invalidRule };
}
