import { jest } from '@jest/globals';
import { BlockDefinition } from '../BlockDefinition.js';

describe('BlockDefinition', () => {
  it('validates formats and preserves its serializable contract', () => {
    const definition = new BlockDefinition({
      id: 'banner',
      name: 'Banner',
      supportedFormats: ['html'],
      emptyBehavior: 'SHOW_EMPTY',
      containerType: 'BOX'
    });

    expect(definition.supportsFormat('html')).toBe(true);
    expect(definition.supportsFormat('text')).toBe(false);
    expect(definition.hidesWhenEmpty()).toBe(false);
    expect(BlockDefinition.fromJSON(definition.toJSON()).toJSON()).toEqual({
      id: 'banner',
      name: 'Banner',
      description: '',
      supportedFormats: ['html'],
      emptyBehavior: 'SHOW_EMPTY',
      containerType: 'BOX'
    });
    expect(
      () => new BlockDefinition({ id: 'bad', name: 'Bad', supportedFormats: ['pdf'] })
    ).toThrow('Invalid output format: pdf');
    // @ts-expect-error Exercise existing ID validation with deliberately invalid input.
    expect(() => new BlockDefinition({ name: 'Missing ID' })).toThrow(
      'BlockDefinition id is required and must be a string'
    );
    // @ts-expect-error Exercise existing ID validation with deliberately invalid input.
    expect(() => new BlockDefinition({ id: 1, name: 'Invalid ID' })).toThrow(
      'BlockDefinition id is required and must be a string'
    );
  });
});
