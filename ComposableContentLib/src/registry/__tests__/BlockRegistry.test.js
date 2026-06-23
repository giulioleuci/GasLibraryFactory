/**
 * @file ComposableContentLib/src/registry/__tests__/BlockRegistry.test.js
 * @description Unit tests for BlockRegistry class.
 */

import { BlockRegistry } from '../BlockRegistry.js';
import { BlockDefinition } from '../../core/BlockDefinition.js';
import { BlockNotFoundError } from '../../errors/ComposableContentError.js';
import { MockFactory } from '../../../../test/fakes';

describe('BlockRegistry', () => {
  let registry;
  let mocks;

  const createMockDefinition = (id, name = 'Test Block') => ({
    id,
    name,
    supportedFormats: ['html', 'text']
  });

  const createMockFactory = () =>
    jest.fn((definition, config) => ({
      definition,
      config,
      getTypeId: () => definition.id
    }));

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    registry = new BlockRegistry({ logger: mocks.logger });
  });

  describe('constructor', () => {
    it('should create empty registry', () => {
      expect(registry.size()).toBe(0);
      expect(registry.getBlockTypes()).toEqual([]);
    });

    it('should use console as default logger', () => {
      const defaultRegistry = new BlockRegistry();
      expect(defaultRegistry.size()).toBe(0);
    });
  });

  describe('register', () => {
    it('should register block with definition object', () => {
      const definition = createMockDefinition('greeting');
      const factory = createMockFactory();

      const result = registry.register({ definition, factory });

      expect(result).toBeInstanceOf(BlockDefinition);
      expect(result.id).toBe('greeting');
      expect(registry.has('greeting')).toBe(true);
    });

    it('should register block with BlockDefinition instance', () => {
      const definition = new BlockDefinition(createMockDefinition('greeting'));
      const factory = createMockFactory();

      registry.register({ definition, factory });

      expect(registry.has('greeting')).toBe(true);
    });

    it('should throw if registration object is missing', () => {
      expect(() => registry.register()).toThrow('Registration object is required');
      expect(() => registry.register(null)).toThrow('Registration object is required');
    });

    it('should throw if definition is missing', () => {
      expect(() =>
        registry.register({
          factory: createMockFactory()
        })
      ).toThrow('Block definition is required');
    });

    it('should throw if factory is missing', () => {
      expect(() =>
        registry.register({
          definition: createMockDefinition('test')
        })
      ).toThrow('Factory function is required');
    });

    it('should throw if factory is not a function', () => {
      expect(() =>
        registry.register({
          definition: createMockDefinition('test'),
          factory: 'not a function'
        })
      ).toThrow('Factory function is required');
    });
  });

  describe('unregister', () => {
    it('should remove registered block', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });

      const result = registry.unregister('greeting');

      expect(result).toBe(true);
      expect(registry.has('greeting')).toBe(false);
    });

    it('should return false for unregistered block', () => {
      const result = registry.unregister('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getDefinition', () => {
    it('should return definition for registered block', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });

      const definition = registry.getDefinition('greeting');

      expect(definition).toBeInstanceOf(BlockDefinition);
      expect(definition.id).toBe('greeting');
    });

    it('should throw BlockNotFoundError for unregistered block', () => {
      expect(() => registry.getDefinition('nonexistent')).toThrow(BlockNotFoundError);
    });
  });

  describe('getDefinitionOrNull', () => {
    it('should return definition for registered block', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });

      const definition = registry.getDefinitionOrNull('greeting');

      expect(definition.id).toBe('greeting');
    });

    it('should return null for unregistered block', () => {
      const definition = registry.getDefinitionOrNull('nonexistent');

      expect(definition).toBeNull();
    });
  });

  describe('createBlock', () => {
    it('should create block using factory', () => {
      const factory = createMockFactory();
      registry.register({
        definition: createMockDefinition('greeting'),
        factory
      });

      const block = registry.createBlock('greeting', { custom: 'config' });

      expect(factory).toHaveBeenCalled();
      expect(block.config).toEqual({ custom: 'config' });
    });

    it('should pass definition to factory', () => {
      const factory = createMockFactory();
      registry.register({
        definition: createMockDefinition('greeting'),
        factory
      });

      registry.createBlock('greeting');

      expect(factory).toHaveBeenCalledWith(expect.any(BlockDefinition), expect.any(Object));
    });

    it('should throw BlockNotFoundError for unregistered block', () => {
      expect(() => registry.createBlock('nonexistent')).toThrow(BlockNotFoundError);
    });
  });

  describe('has', () => {
    it('should return true for registered block', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });

      expect(registry.has('greeting')).toBe(true);
    });

    it('should return false for unregistered block', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('getBlockTypes', () => {
    it('should return all registered block type IDs', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });
      registry.register({
        definition: createMockDefinition('footer'),
        factory: createMockFactory()
      });

      const types = registry.getBlockTypes();

      expect(types).toContain('greeting');
      expect(types).toContain('footer');
      expect(types).toHaveLength(2);
    });
  });

  describe('getAllDefinitions', () => {
    it('should return all registered definitions', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });
      registry.register({
        definition: createMockDefinition('footer'),
        factory: createMockFactory()
      });

      const definitions = registry.getAllDefinitions();

      expect(definitions).toHaveLength(2);
      expect(definitions.every((d) => d instanceof BlockDefinition)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all registrations', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });
      registry.register({
        definition: createMockDefinition('footer'),
        factory: createMockFactory()
      });

      registry.clear();

      expect(registry.size()).toBe(0);
      expect(registry.getBlockTypes()).toEqual([]);
    });
  });

  describe('getBlocksForFormat', () => {
    it('should return blocks supporting a format', () => {
      registry.register({
        definition: { id: 'html_only', name: 'HTML Only', supportedFormats: ['html'] },
        factory: createMockFactory()
      });
      registry.register({
        definition: {
          id: 'all_formats',
          name: 'All Formats',
          supportedFormats: ['html', 'text', 'markdown']
        },
        factory: createMockFactory()
      });
      registry.register({
        definition: { id: 'text_only', name: 'Text Only', supportedFormats: ['text'] },
        factory: createMockFactory()
      });

      const htmlBlocks = registry.getBlocksForFormat('html');
      const textBlocks = registry.getBlocksForFormat('text');
      const markdownBlocks = registry.getBlocksForFormat('markdown');

      expect(htmlBlocks).toHaveLength(2);
      expect(textBlocks).toHaveLength(2);
      expect(markdownBlocks).toHaveLength(1);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      registry.register({
        definition: createMockDefinition('greeting'),
        factory: createMockFactory()
      });

      const str = registry.toString();

      expect(str).toContain('1 block types');
    });
  });
});
