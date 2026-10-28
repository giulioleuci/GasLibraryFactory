import type { RenderOptions } from '../../types.js';
import { jest } from '@jest/globals';
/**
 * @file ComposableContentLib/src/core/__tests__/ContentBlock.test.js
 * @description Unit tests for ContentBlock and SimpleContentBlock classes.
 */

import { ContentBlock, SimpleContentBlock } from '../ContentBlock.js';
import { BlockDefinition } from '../BlockDefinition.js';
import { BlockResult } from '../BlockResult.js';

describe('ContentBlock', () => {
  let mockDefinition: BlockDefinition;

  beforeEach(() => {
    mockDefinition = new BlockDefinition({
      id: 'test_block',
      name: 'Test Block',
      supportedFormats: ['html', 'text']
    });
  });

  describe('constructor', () => {
    it('should initialize with definition and config', () => {
      const config = { key: 'value' };
      // We use a mock class since ContentBlock is abstract and we need it to not throw,
      // but testing constructor of abstract class directly might be fine in JS if we just instantiate it.
      // Let's create a minimal concrete class for testing the base class constructor.
      class ConcreteBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new ConcreteBlock(mockDefinition, config);

      expect(block.definition).toBe(mockDefinition);
      expect(block.config).toEqual(config);
      expect(Object.isFrozen(block.config)).toBe(true);
    });

    it('should default config to empty object if not provided', () => {
      class ConcreteBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new ConcreteBlock(mockDefinition);

      expect(block.config).toEqual({});
      expect(Object.isFrozen(block.config)).toBe(true);
    });

    it('should throw if definition is missing', () => {
      class ConcreteBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      // @ts-expect-error Exercise existing validation with deliberately invalid input.
      expect(() => new ConcreteBlock()).toThrow('ContentBlock requires a definition');
    });
  });

  describe('getters', () => {
    let block: Pick<ContentBlock, 'getTypeId' | 'getName'>;

    beforeEach(() => {
      class ConcreteBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }
      block = new ConcreteBlock(mockDefinition);
    });

    it('should return typeId', () => {
      expect(block.getTypeId()).toBe('test_block');
    });

    it('should return name', () => {
      expect(block.getName()).toBe('Test Block');
    });
  });

  describe('abstract methods', () => {
    it('should throw when abstract methods are called', () => {
      // In JavaScript, we can instantiate the "abstract" class to test its base methods
      const block = new ContentBlock(mockDefinition);

      expect(() => block.getData({})).toThrow(
        'ContentBlock.getData() must be implemented by subclass'
      );
      expect(() => block.getTemplateId('html')).toThrow(
        'ContentBlock.getTemplateId() must be implemented by subclass'
      );
    });
  });

  describe('evaluate', () => {
    let block: ContentBlock;
    let mockContext: { value: string };
    let mockRenderer: {
      render: ReturnType<
        typeof jest.fn<(templateId: string, data: unknown, options?: RenderOptions) => string>
      >;
    };

    beforeEach(() => {
      class TestBlock extends ContentBlock {
        getData(context: { value: string }) {
          return { data: context.value };
        }
        isEmpty(data: { data: string }) {
          return !data.data;
        }
        getTemplateId(format: string) {
          return `template_${format}`;
        }
      }

      block = new TestBlock(mockDefinition);
      mockContext = { value: 'test_data' };
      mockRenderer = {
        render: jest
          .fn<(templateId: string, data: unknown, options?: RenderOptions) => string>()
          .mockReturnValue('rendered_content')
      };
    });

    it('should return successful BlockResult on happy path', () => {
      const result = block.evaluate('instance-1', mockContext, 'html', mockRenderer);

      expect(result).toBeInstanceOf(BlockResult);
      expect(result.instanceId).toBe('instance-1');
      expect(result.blockType).toBe('test_block');
      expect(result.isSuccess()).toBe(true);
      expect(result.isVisible).toBe(true);
      expect(result.isEmpty).toBe(false);
      expect(result.content).toBe('rendered_content');

      expect(mockRenderer.render).toHaveBeenCalledWith(
        'template_html',
        { data: 'test_data' },
        expect.objectContaining({
          format: 'html',
          blockType: 'test_block'
        })
      );
    });

    it('should return hidden BlockResult when empty and hidesWhenEmpty is true', () => {
      // Create definition with hidesWhenEmpty = true (default is HIDE)
      const hideDef = new BlockDefinition({
        id: 'hide_block',
        name: 'Hide Block',
        emptyBehavior: 'HIDE' // EmptyBehavior.HIDE
      });

      class TestBlock extends ContentBlock {
        getData() {
          return {};
        }
        isEmpty() {
          return true;
        } // Force empty
        getTemplateId() {
          return 'temp';
        }
      }

      const hideBlock = new TestBlock(hideDef);

      const result = hideBlock.evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isVisible).toBe(false);
      expect(result.isEmpty).toBe(true);
      expect(result.metadata.hiddenReason).toBe('empty');
      expect(mockRenderer.render).not.toHaveBeenCalled();
    });

    it('should use the shared value emptiness check by default', () => {
      const hideDef = new BlockDefinition({
        id: 'shared_empty_block',
        name: 'Shared Empty Block',
        emptyBehavior: 'HIDE'
      });

      class TestBlock extends ContentBlock {
        getData() {
          return new Map();
        }
        getTemplateId() {
          return 'temp';
        }
      }

      const result = new TestBlock(hideDef).evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isVisible).toBe(false);
      expect(mockRenderer.render).not.toHaveBeenCalled();
    });

    it('should render normally when empty but hidesWhenEmpty is false', () => {
      // Create definition with hidesWhenEmpty = false
      const showDef = new BlockDefinition({
        id: 'show_block',
        name: 'Show Block',
        emptyBehavior: 'SHOW_EMPTY' // EmptyBehavior.SHOW_EMPTY
      });

      class TestBlock extends ContentBlock {
        getData() {
          return {};
        }
        isEmpty() {
          return true;
        } // Force empty
        getTemplateId() {
          return 'temp';
        }
      }

      const showBlock = new TestBlock(showDef);

      const result = showBlock.evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isVisible).toBe(true);
      expect(result.isEmpty).toBe(true);
      expect(result.content).toBe('rendered_content');
      expect(mockRenderer.render).toHaveBeenCalled();
    });

    it('should return error BlockResult when an error occurs', () => {
      class ErrorBlock extends ContentBlock {
        getData() {
          throw new Error('Test Error');
        }
        isEmpty() {
          return false;
        }
        getTemplateId() {
          return 'temp';
        }
      }

      const errorBlock = new ErrorBlock(mockDefinition);

      const result = errorBlock.evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isError()).toBe(true);
      expect(result.error!.message).toBe('Test Error');
    });
  });

  describe('render', () => {
    it('should call renderer.render and return its result', () => {
      class TestBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition, { custom: 'config' });
      const mockRenderer = {
        render: jest
          .fn<(templateId: string, data: unknown, options?: RenderOptions) => string>()
          .mockReturnValue('rendered')
      };

      const result = block.render({ data: 1 }, 'html', mockRenderer, 'template_id');

      expect(result).toBe('rendered');
      expect(mockRenderer.render).toHaveBeenCalledWith(
        'template_id',
        { data: 1 },
        {
          format: 'html',
          blockType: 'test_block',
          config: { custom: 'config' },
          containerType: 'NONE' // Default containerType
        }
      );
    });

    it('should throw if renderer is missing', () => {
      class TestBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      // @ts-expect-error Exercise existing validation with deliberately invalid input.
      expect(() => block.render({}, 'html', null, 'template_id')).toThrow(
        'Renderer is required for rendering'
      );
    });
  });

  describe('_getMetadata', () => {
    it('should return default metadata', () => {
      class TestBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      // Accessing protected method for testing
      const metadata = block._getMetadata({ some: 'data' });

      expect(metadata).toEqual({
        blockType: 'test_block',
        blockName: 'Test Block'
      });
    });
  });

  describe('supportsFormat', () => {
    it('should delegate to definition', () => {
      class TestBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      expect(block.supportsFormat('html')).toBe(true);
      expect(block.supportsFormat('text')).toBe(true);
      expect(block.supportsFormat('unsupported')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      class TestBlock extends ContentBlock {
        getData() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        isEmpty() {}
        // @ts-expect-error Constructor-only fixture intentionally leaves this hook empty.
        getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      expect(block.toString()).toBe('ContentBlock[test_block] "Test Block"');
    });
  });
});

describe('SimpleContentBlock', () => {
  let mockDefinition: BlockDefinition;

  beforeEach(() => {
    mockDefinition = new BlockDefinition({
      id: 'simple_block',
      name: 'Simple Block',
      supportedFormats: ['html', 'text']
    });
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      const config = {
        dataExtractor: () => ({}),
        templates: { html: 'temp_html' }
      };

      const block = new SimpleContentBlock(mockDefinition, config);

      expect(block.definition).toBe(mockDefinition);
      expect(typeof block._dataExtractor).toBe('function');
      expect(block._templates).toEqual(config.templates);
    });

    it('should use the shared emptiness check when no callback is configured', () => {
      const renderer = {
        render: jest.fn<(templateId: string, data: unknown, options?: RenderOptions) => string>()
      };
      const block = new SimpleContentBlock(mockDefinition, {
        dataExtractor: () => ({}),
        templates: { html: 'temp_html' }
      });

      const result = block.evaluate('simple-1', {}, 'html', renderer);

      expect(result.isEmpty).toBe(true);
      expect(result.isVisible).toBe(false);
      expect(renderer.render).not.toHaveBeenCalled();
    });

    it('should dispatch evaluation to the configured empty checker', () => {
      const data = { items: [] };
      const emptyChecker = jest.fn((value: { items: unknown[] }) => value.items.length === 0);
      const renderer = {
        render: jest.fn<(templateId: string, data: unknown, options?: RenderOptions) => string>()
      };
      const block = new SimpleContentBlock(mockDefinition, {
        dataExtractor: () => data,
        emptyChecker,
        templates: { html: 'temp_html' }
      });

      const result = block.evaluate('simple-1', {}, 'html', renderer);

      expect(emptyChecker).toHaveBeenCalledTimes(1);
      expect(emptyChecker).toHaveBeenCalledWith(data);
      expect(result.isEmpty).toBe(true);
      expect(result.isVisible).toBe(false);
      expect(renderer.render).not.toHaveBeenCalled();
    });

    it('should throw if dataExtractor is missing or invalid', () => {
      // @ts-expect-error Exercise existing validation with deliberately invalid input.
      expect(() => new SimpleContentBlock(mockDefinition, { templates: {} })).toThrow(
        'SimpleContentBlock requires a dataExtractor function'
      );
      expect(
        () =>
          // @ts-expect-error Exercise existing validation with deliberately invalid input.
          new SimpleContentBlock(mockDefinition, { dataExtractor: 'not_a_function', templates: {} })
      ).toThrow('SimpleContentBlock requires a dataExtractor function');
    });

    it('should throw if templates is missing or invalid', () => {
      // @ts-expect-error Exercise existing validation with deliberately invalid input.
      expect(() => new SimpleContentBlock(mockDefinition, { dataExtractor: () => ({}) })).toThrow(
        'SimpleContentBlock requires a templates object'
      );
      expect(
        () =>
          new SimpleContentBlock(mockDefinition, {
            dataExtractor: () => ({}),
            // @ts-expect-error Exercise existing validation with deliberately invalid input.
            templates: 'not_an_object'
          })
      ).toThrow('SimpleContentBlock requires a templates object');
    });
  });

  describe('methods', () => {
    let block: ContentBlock;
    let dataExtractorMock: ReturnType<typeof jest.fn<() => unknown>>;

    beforeEach(() => {
      dataExtractorMock = jest.fn<() => unknown>().mockReturnValue({ val: 1 });

      block = new SimpleContentBlock(mockDefinition, {
        dataExtractor: dataExtractorMock,
        templates: {
          html: 'html_template',
          text: 'text_template'
        }
      });
    });

    describe('getData', () => {
      it('should call dataExtractor with context', () => {
        const context = { get: () => 'val' };

        const data = block.getData(context);

        expect(data).toEqual({ val: 1 });
        expect(dataExtractorMock).toHaveBeenCalledWith(context);
      });
    });

    describe('shared emptiness dispatch', () => {
      it('should evaluate extracted collection data with the shared checker', () => {
        const context = { value: 'unused' };
        const renderer = {
          render: jest.fn<(templateId: string, data: unknown, options?: RenderOptions) => string>()
        };
        dataExtractorMock.mockReturnValue(new Set());

        const result = block.evaluate('simple-1', context, 'html', renderer);

        expect(dataExtractorMock).toHaveBeenCalledWith(context);
        expect(result.isEmpty).toBe(true);
        expect(result.isVisible).toBe(false);
        expect(renderer.render).not.toHaveBeenCalled();
      });
    });

    describe('getTemplateId', () => {
      it('should return template id for valid format', () => {
        expect(block.getTemplateId('html')).toBe('html_template');
        expect(block.getTemplateId('text')).toBe('text_template');
      });

      it('should throw error for invalid format', () => {
        expect(() => block.getTemplateId('invalid_format')).toThrow(
          'No template defined for format: invalid_format'
        );
      });
    });
  });
});
