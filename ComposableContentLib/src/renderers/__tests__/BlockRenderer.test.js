import { HtmlRenderer } from '../../internal/BlockRenderer.js';
import { RenderingError, TemplateNotFoundError } from '../../errors/ComposableContentError.js';

describe('BlockRenderer', () => {
  it('renders nested values, empties missing values, and exposes template failures', () => {
    const renderer = new HtmlRenderer({
      templates: {
        greeting: 'Hello {{person.name}} {{person.missing}}',
        broken: () => {
          throw new Error('bad template');
        }
      }
    });

    expect(renderer.render('greeting', { person: { name: 'Ada' } })).toBe('Hello Ada ');
    expect(() => renderer.render('unknown', {})).toThrow(TemplateNotFoundError);
    expect(() => renderer.render('broken', {}, { blockType: 'greeting' })).toThrow(RenderingError);
  });
});
