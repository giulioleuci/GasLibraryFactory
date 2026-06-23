/**
 * @file ComposableContentLib/src/core/__tests__/BlockResult.test.js
 * @description Unit tests for BlockResult class.
 */

import { BlockResult } from '../BlockResult.js';

describe('BlockResult', () => {
  describe('constructor', () => {
    it('should create result with required fields', () => {
      const result = new BlockResult({
        instanceId: 'header-001',
        blockType: 'email_header'
      });

      expect(result.instanceId).toBe('header-001');
      expect(result.blockType).toBe('email_header');
      expect(result.isEmpty).toBe(false);
      expect(result.isVisible).toBe(true);
      expect(result.content).toBe('');
      expect(result.processingTime).toBe(0);
      expect(result.error).toBeNull();
    });

    it('should create result with all fields', () => {
      const result = new BlockResult({
        instanceId: 'header-001',
        blockType: 'email_header',
        isEmpty: false,
        isVisible: true,
        content: '<div>Content</div>',
        metadata: { title: 'Welcome' },
        processingTime: 50,
        error: null
      });

      expect(result.content).toBe('<div>Content</div>');
      expect(result.metadata.title).toBe('Welcome');
      expect(result.processingTime).toBe(50);
    });

    it('should throw if result object is missing', () => {
      expect(() => new BlockResult()).toThrow('BlockResult requires a result object');
      expect(() => new BlockResult(null)).toThrow('BlockResult requires a result object');
    });

    it('should throw if instanceId is missing', () => {
      expect(() => new BlockResult({ blockType: 'test' })).toThrow('instanceId is required');
    });

    it('should throw if blockType is missing', () => {
      expect(() => new BlockResult({ instanceId: 'test' })).toThrow('blockType is required');
    });

    it('should freeze metadata', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        metadata: { key: 'value' }
      });

      expect(Object.isFrozen(result.metadata)).toBe(true);
    });
  });

  describe('hasDisplayableContent', () => {
    it('should return true when visible and has content', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        isVisible: true,
        isEmpty: false,
        content: 'Hello'
      });

      expect(result.hasDisplayableContent()).toBe(true);
    });

    it('should return false when hidden', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        isVisible: false,
        content: 'Hello'
      });

      expect(result.hasDisplayableContent()).toBe(false);
    });

    it('should return false when empty', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        isVisible: true,
        isEmpty: true,
        content: ''
      });

      expect(result.hasDisplayableContent()).toBe(false);
    });

    it('should return false when content is empty string', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        isVisible: true,
        isEmpty: false,
        content: ''
      });

      expect(result.hasDisplayableContent()).toBe(false);
    });
  });

  describe('isSuccess and isError', () => {
    it('should return true for isSuccess when no error', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test'
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.isError()).toBe(false);
    });

    it('should return true for isError when error exists', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        error: new Error('Test error')
      });

      expect(result.isSuccess()).toBe(false);
      expect(result.isError()).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata value', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        metadata: { title: 'Welcome', count: 5 }
      });

      expect(result.getMetadata('title')).toBe('Welcome');
      expect(result.getMetadata('count')).toBe(5);
    });

    it('should return default value for missing key', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        metadata: {}
      });

      expect(result.getMetadata('missing')).toBeNull();
      expect(result.getMetadata('missing', 'default')).toBe('default');
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test_block',
        content: 'Hello',
        metadata: { key: 'value' }
      });

      const json = result.toJSON();

      expect(json.instanceId).toBe('test');
      expect(json.blockType).toBe('test_block');
      expect(json.content).toBe('Hello');
      expect(json.metadata).toEqual({ key: 'value' });
      expect(json.error).toBeNull();
    });

    it('should serialize error message', () => {
      const result = new BlockResult({
        instanceId: 'test',
        blockType: 'test',
        error: new Error('Something went wrong')
      });

      const json = result.toJSON();

      expect(json.error).toBe('Something went wrong');
    });
  });

  describe('static hidden', () => {
    it('should create hidden block result', () => {
      const result = BlockResult.hidden('test', 'test_block', 'empty_data');

      expect(result.instanceId).toBe('test');
      expect(result.blockType).toBe('test_block');
      expect(result.isEmpty).toBe(true);
      expect(result.isVisible).toBe(false);
      expect(result.content).toBe('');
      expect(result.metadata.hiddenReason).toBe('empty_data');
    });

    it('should use default reason', () => {
      const result = BlockResult.hidden('test', 'test_block');

      expect(result.metadata.hiddenReason).toBe('hidden');
    });
  });

  describe('static error', () => {
    it('should create error block result', () => {
      const error = new Error('Test error');
      const result = BlockResult.error('test', 'test_block', error);

      expect(result.instanceId).toBe('test');
      expect(result.blockType).toBe('test_block');
      expect(result.isEmpty).toBe(true);
      expect(result.isVisible).toBe(false);
      expect(result.error).toBe(error);
      expect(result.metadata.errorMessage).toBe('Test error');
    });
  });

  describe('toString', () => {
    it('should return string for visible result', () => {
      const result = new BlockResult({
        instanceId: 'header',
        blockType: 'test',
        isVisible: true
      });

      const str = result.toString();

      expect(str).toContain('header');
      expect(str).toContain('VISIBLE');
    });

    it('should return string for hidden result', () => {
      const result = BlockResult.hidden('header', 'test');

      const str = result.toString();

      expect(str).toContain('HIDDEN');
    });

    it('should return string for error result', () => {
      const result = BlockResult.error('header', 'test', new Error('fail'));

      const str = result.toString();

      expect(str).toContain('ERROR');
    });
  });
});
