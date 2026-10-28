import { SystemScriptSettings } from '../SystemScriptSettings.js';
import { cloneDeep, merge } from '../../facades/LodashFacade.js';

describe('SystemScriptSettings facade characterisation', () => {
  const settings = new SystemScriptSettings();

  it('deepClone preserves nested arrays and objects without retaining input references', () => {
    const original = { nested: { values: [1, 2] } };
    const cloned = settings.deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).toEqual(cloneDeep(original));
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
    expect(cloned.nested.values).not.toBe(original.nested.values);
  });

  it('deepMerge matches the facade while leaving all source objects unchanged', () => {
    const defaults = { nested: { values: [1, 2], enabled: true } };
    const provided = { nested: { values: [3], label: 'custom' } };

    const result = settings.deepMerge(defaults, provided);

    expect(result).toEqual(merge({}, defaults, provided));
    expect(defaults).toEqual({ nested: { values: [1, 2], enabled: true } });
    expect(provided).toEqual({ nested: { values: [3], label: 'custom' } });
  });
});
