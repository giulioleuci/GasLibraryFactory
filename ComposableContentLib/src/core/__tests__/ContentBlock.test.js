/**
 * @file ComposableContentLib/src/core/__tests__/ContentBlock.test.js
 * @description Unit tests for ContentBlock and SimpleContentBlock classes.
 */

import { ContentBlock, SimpleContentBlock } from '../ContentBlock.js';
import { BlockDefinition } from '../BlockDefinition.js';
import { BlockResult } from '../BlockResult.js';
import { MockFactory } from '../../../../test/fakes';

describe('ContentBlock', () => {
  let mockDefinition;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
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
        isEmpty() {}
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
        isEmpty() {}
        getTemplateId() {}
      }

      const block = new ConcreteBlock(mockDefinition);

      expect(block.config).toEqual({});
      expect(Object.isFrozen(block.config)).toBe(true);
    });

    it('should throw if definition is missing', () => {
      class ConcreteBlock extends ContentBlock {
        getData() {}
        isEmpty() {}
        getTemplateId() {}
      }

      expect(() => new ConcreteBlock()).toThrow('ContentBlock requires a definition');
    });
  });

  describe('getters', () => {
    let block;

    beforeEach(() => {
      class ConcreteBlock extends ContentBlock {
        getData() {}
        isEmpty() {}
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

      expect(() => block.getData({})).toThrow('ContentBlock.getData() must be implemented by subclass');
      expect(() => block.isEmpty({})).toThrow('ContentBlock.isEmpty() must be implemented by subclass');
      expect(() => block.getTemplateId('html')).toThrow('ContentBlock.getTemplateId() must be implemented by subclass');
    });
  });

  describe('evaluate', () => {
    let block;
    let mockContext;
    let mockRenderer;

    beforeEach(() => {
      class TestBlock extends ContentBlock {
        getData(context) {
          return { data: context.value };
        }
        isEmpty(data) {
          return !data.data;
        }
        getTemplateId(format) {
          return `template_${format}`;
        }
      }

      block = new TestBlock(mockDefinition);
      mockContext = { value: 'test_data' };
      mockRenderer = {
        render: jest.fn().mockReturnValue('rendered_content')
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
        getData() { return {}; }
        isEmpty() { return true; } // Force empty
        getTemplateId() { return 'temp'; }
      }

      const hideBlock = new TestBlock(hideDef);

      const result = hideBlock.evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isVisible).toBe(false);
      expect(result.isEmpty).toBe(true);
      expect(result.metadata.hiddenReason).toBe('empty');
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
        getData() { return {}; }
        isEmpty() { return true; } // Force empty
        getTemplateId() { return 'temp'; }
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
        getData() { throw new Error('Test Error'); }
        isEmpty() { return false; }
        getTemplateId() { return 'temp'; }
      }

      const errorBlock = new ErrorBlock(mockDefinition);

      const result = errorBlock.evaluate('instance-1', {}, 'html', mockRenderer);

      expect(result.isError()).toBe(true);
      expect(result.error.message).toBe('Test Error');
    });
  });

  describe('render', () => {
    it('should call renderer.render and return its result', () => {
      class TestBlock extends ContentBlock {
        getData() {} isEmpty() {} getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition, { custom: 'config' });
      const mockRenderer = {
        render: jest.fn().mockReturnValue('rendered')
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
        getData() {} isEmpty() {} getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      expect(() => block.render({}, 'html', null, 'template_id')).toThrow('Renderer is required for rendering');
    });
  });

  describe('_getMetadata', () => {
    it('should return default metadata', () => {
      class TestBlock extends ContentBlock {
        getData() {} isEmpty() {} getTemplateId() {}
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
        getData() {} isEmpty() {} getTemplateId() {}
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
        getData() {} isEmpty() {} getTemplateId() {}
      }

      const block = new TestBlock(mockDefinition);

      expect(block.toString()).toBe('ContentBlock[test_block] "Test Block"');
    });
  });
});

describe('SimpleContentBlock', () => {
  let mockDefinition;

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
        emptyChecker: () => false,
        templates: { html: 'temp_html' }
      };

      const block = new SimpleContentBlock(mockDefinition, config);

      expect(block.definition).toBe(mockDefinition);
      expect(typeof block._dataExtractor).toBe('function');
      expect(typeof block._emptyChecker).toBe('function');
      expect(block._templates).toEqual(config.templates);
    });

    it('should default emptyChecker to returning false', () => {
      const config = {
        dataExtractor: () => ({}),
        templates: { html: 'temp_html' }
      };

      const block = new SimpleContentBlock(mockDefinition, config);

      expect(block._emptyChecker()).toBe(false);
    });

    it('should throw if dataExtractor is missing or invalid', () => {
      expect(() => new SimpleContentBlock(mockDefinition, { templates: {} })).toThrow('SimpleContentBlock requires a dataExtractor function');
      expect(() => new SimpleContentBlock(mockDefinition, { dataExtractor: 'not_a_function', templates: {} })).toThrow('SimpleContentBlock requires a dataExtractor function');
    });

    it('should throw if templates is missing or invalid', () => {
      expect(() => new SimpleContentBlock(mockDefinition, { dataExtractor: () => ({}) })).toThrow('SimpleContentBlock requires a templates object');
      expect(() => new SimpleContentBlock(mockDefinition, { dataExtractor: () => ({}), templates: 'not_an_object' })).toThrow('SimpleContentBlock requires a templates object');
    });
  });

  describe('methods', () => {
    let block;
    let dataExtractorMock;
    let emptyCheckerMock;

    beforeEach(() => {
      dataExtractorMock = jest.fn().mockReturnValue({ val: 1 });
      emptyCheckerMock = jest.fn().mockReturnValue(false);

      block = new SimpleContentBlock(mockDefinition, {
        dataExtractor: dataExtractorMock,
        emptyChecker: emptyCheckerMock,
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

    describe('isEmpty', () => {
      it('should call emptyChecker with data', () => {
        const data = { val: 1 };

        const isEmpty = block.isEmpty(data);

        expect(isEmpty).toBe(false);
        expect(emptyCheckerMock).toHaveBeenCalledWith(data);
      });
    });

    describe('getTemplateId', () => {
      it('should return template id for valid format', () => {
        expect(block.getTemplateId('html')).toBe('html_template');
        expect(block.getTemplateId('text')).toBe('text_template');
      });

      it('should throw error for invalid format', () => {
        expect(() => block.getTemplateId('invalid_format')).toThrow('No template defined for format: invalid_format');
      });
    });
  });
});
