import { ConfigMergeStrategy } from '../ConfigMergeStrategy.js';
import { cloneDeep, merge } from '../../facades/LodashFacade.js';

describe('ConfigMergeStrategy facade characterisation', () => {
  const strategy = new ConfigMergeStrategy();

  it('merges nested defaults and provided values through facade-equivalent cloning', () => {
    const defaults = { nested: { values: [1, 2], enabled: true } };
    const provided = { nested: { values: [3], label: 'custom' } };

    const result = strategy.mergeWithDefaults(provided, defaults);

    expect(result).toEqual(merge(cloneDeep(defaults), cloneDeep(provided)));
    expect(defaults).toEqual({ nested: { values: [1, 2], enabled: true } });
    expect(provided).toEqual({ nested: { values: [3], label: 'custom' } });
    expect(result.nested).not.toBe(defaults.nested);
    expect(result.nested).not.toBe(provided.nested);
  });

  it('returns a detached facade-equivalent clone when no configuration is provided', () => {
    const defaults = { nested: { values: [1, 2] } };
    const result = strategy.mergeWithDefaults(null, defaults);

    expect(result).toEqual(cloneDeep(defaults));
    expect(result).not.toBe(defaults);
    expect(result.nested).not.toBe(defaults.nested);
  });
});
