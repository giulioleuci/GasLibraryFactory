import { createFuzzyCondition } from '../FuzzyCondition.js';
import { AdvancedQueryValidator } from '../AdvancedQueryValidator.js';

describe('FuzzyCondition', () => {
  it('creates an immutable fuzzy condition with the default threshold', () => {
    const condition = createFuzzyCondition('name', 'alce', {}, 'AND');

    expect(condition).toEqual({
      kind: 'FUZZY',
      field: 'name',
      query: 'alce',
      options: { threshold: 0.4 },
      type: 'AND'
    });
    expect(Object.isFrozen(condition)).toBe(true);
    expect(Object.isFrozen(condition.options)).toBe(true);
  });

  it.each([
    ['', 'alice', {}, 'field'],
    ['name', '', {}, 'query'],
    ['name', 42, {}, 'query'],
    ['name', 'alice', { threshold: -0.1 }, 'threshold'],
    ['name', 'alice', { threshold: 1.1 }, 'threshold'],
    ['name', 'alice', { threshold: Infinity }, 'threshold'],
    ['name', 'alice', { includeScore: true }, 'Unknown fuzzy option']
  ])('rejects invalid fuzzy input: %s, %s', (field, query, options, message) => {
    const validator = new AdvancedQueryValidator();

    expect(() => validator.validateFuzzyCondition(field, query, options)).toThrow(message);
  });
});
