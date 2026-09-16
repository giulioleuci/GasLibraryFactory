import { RendererRegistry } from '../RendererRegistry.js';
import { RendererNotFoundError } from '../../errors/ComposableContentError.js';

describe('RendererRegistry', () => {
  it('supports renderer registration, lookup, removal, and reset', () => {
    const registry = new RendererRegistry({ registerDefaults: false });
    const renderer = { getFormat: () => 'receipt', render: () => 'receipt' };

    expect(registry.register(renderer)).toBe(registry);
    expect(registry.get('receipt')).toBe(renderer);
    expect(registry.getFormats()).toEqual(['receipt']);
    expect(registry.unregister('receipt')).toBe(true);
    expect(registry.getOrNull('receipt')).toBeNull();
    expect(() => registry.get('receipt')).toThrow(RendererNotFoundError);
    registry.register(renderer);
    registry.clear();
    expect(registry.size()).toBe(0);
  });
});
