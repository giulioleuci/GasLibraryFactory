/**
 * @file ComposableContentLib/src/composition/__tests__/CompositionRecipe.test.js
 * @description Unit tests for CompositionRecipe class.
 */

import { CompositionRecipe } from '../CompositionRecipe.js';
import { OutputFormat } from '../../core/EmptyBehavior.js';
import { RecipeValidationError } from '../../errors/ComposableContentError.js';
import { MockFactory } from '../../../../test/fakes';

describe('CompositionRecipe', () => {
  let mocks;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();
  });
  const validRecipe = {
    id: 'welcome_email',
    name: 'Welcome Email',
    outputFormat: 'html',
    blocks: [
      { instanceId: 'header', blockType: 'email_header', order: 1 },
      { instanceId: 'greeting', blockType: 'greeting_block', order: 2 },
      { instanceId: 'footer', blockType: 'email_footer', order: 100 }
    ]
  };

  describe('constructor', () => {
    it('should create recipe with valid definition', () => {
      const recipe = new CompositionRecipe(validRecipe);

      expect(recipe.id).toBe('welcome_email');
      expect(recipe.name).toBe('Welcome Email');
      expect(recipe.outputFormat).toBe('html');
      expect(recipe.blocks).toHaveLength(3);
    });

    it('should use default values', () => {
      const recipe = new CompositionRecipe({
        id: 'test',
        name: 'Test Recipe',
        blocks: [{ instanceId: 'block1', blockType: 'test_block' }]
      });

      expect(recipe.outputFormat).toBe(OutputFormat.HTML);
      expect(recipe.description).toBe('');
      expect(recipe.separator).toBe('');
    });

    it('should normalize blocks with defaults', () => {
      const recipe = new CompositionRecipe({
        id: 'test',
        name: 'Test',
        blocks: [
          { instanceId: 'block1', blockType: 'test' },
          { instanceId: 'block2', blockType: 'test', order: 5 }
        ]
      });

      expect(recipe.blocks[0].visibility).toBe('always');
      expect(recipe.blocks[0].order).toBe(0);
      expect(recipe.blocks[1].order).toBe(5);
    });

    it('should freeze blocks and configs', () => {
      const recipe = new CompositionRecipe({
        ...validRecipe,
        blocks: [{ instanceId: 'b1', blockType: 'test', config: { key: 'value' } }]
      });

      expect(Object.isFrozen(recipe.blocks)).toBe(true);
      expect(Object.isFrozen(recipe.blocks[0].config)).toBe(true);
    });

    it('should throw if definition is missing', () => {
      expect(() => new CompositionRecipe()).toThrow();
      expect(() => new CompositionRecipe(null)).toThrow();
    });

    it('should throw if id is missing', () => {
      expect(
        () =>
          new CompositionRecipe({
            name: 'Test',
            blocks: [{ instanceId: 'b1', blockType: 'test' }]
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw if name is missing', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            blocks: [{ instanceId: 'b1', blockType: 'test' }]
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw on invalid output format', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            name: 'Test',
            outputFormat: 'invalid',
            blocks: [{ instanceId: 'b1', blockType: 'test' }]
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw if blocks is not an array', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            name: 'Test',
            blocks: 'not-an-array'
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw if block instanceId is missing', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            name: 'Test',
            blocks: [{ blockType: 'test' }]
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw if block blockType is missing', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            name: 'Test',
            blocks: [{ instanceId: 'b1' }]
          })
      ).toThrow(RecipeValidationError);
    });

    it('should throw on duplicate instanceIds', () => {
      expect(
        () =>
          new CompositionRecipe({
            id: 'test',
            name: 'Test',
            blocks: [
              { instanceId: 'dup', blockType: 'test' },
              { instanceId: 'dup', blockType: 'other' }
            ]
          })
      ).toThrow(RecipeValidationError);
    });
  });

  describe('getOrderedBlocks', () => {
    it('should return blocks sorted by order', () => {
      const recipe = new CompositionRecipe({
        id: 'test',
        name: 'Test',
        blocks: [
          { instanceId: 'b3', blockType: 'test', order: 30 },
          { instanceId: 'b1', blockType: 'test', order: 10 },
          { instanceId: 'b2', blockType: 'test', order: 20 }
        ]
      });

      const ordered = recipe.getOrderedBlocks();

      expect(ordered[0].instanceId).toBe('b1');
      expect(ordered[1].instanceId).toBe('b2');
      expect(ordered[2].instanceId).toBe('b3');
    });
  });

  describe('getBlock', () => {
    it('should return block by instanceId', () => {
      const recipe = new CompositionRecipe(validRecipe);

      const block = recipe.getBlock('header');

      expect(block).not.toBeNull();
      expect(block.blockType).toBe('email_header');
    });

    it('should return null for unknown instanceId', () => {
      const recipe = new CompositionRecipe(validRecipe);

      const block = recipe.getBlock('nonexistent');

      expect(block).toBeNull();
    });
  });

  describe('getBlocksByType', () => {
    it('should return blocks matching type', () => {
      const recipe = new CompositionRecipe({
        id: 'test',
        name: 'Test',
        blocks: [
          { instanceId: 'b1', blockType: 'greeting' },
          { instanceId: 'b2', blockType: 'greeting' },
          { instanceId: 'b3', blockType: 'footer' }
        ]
      });

      const greetings = recipe.getBlocksByType('greeting');

      expect(greetings).toHaveLength(2);
    });
  });

  describe('getUsedBlockTypes', () => {
    it('should return unique block types', () => {
      const recipe = new CompositionRecipe({
        id: 'test',
        name: 'Test',
        blocks: [
          { instanceId: 'b1', blockType: 'greeting' },
          { instanceId: 'b2', blockType: 'greeting' },
          { instanceId: 'b3', blockType: 'footer' }
        ]
      });

      const types = recipe.getUsedBlockTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('greeting');
      expect(types).toContain('footer');
    });
  });

  describe('usesBlockType', () => {
    it('should return true for used block type', () => {
      const recipe = new CompositionRecipe(validRecipe);

      expect(recipe.usesBlockType('email_header')).toBe(true);
    });

    it('should return false for unused block type', () => {
      const recipe = new CompositionRecipe(validRecipe);

      expect(recipe.usesBlockType('sidebar')).toBe(false);
    });
  });

  describe('getBlockCount', () => {
    it('should return number of blocks', () => {
      const recipe = new CompositionRecipe(validRecipe);

      expect(recipe.getBlockCount()).toBe(3);
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const recipe = new CompositionRecipe(validRecipe);

      const json = recipe.toJSON();

      expect(json.id).toBe('welcome_email');
      expect(json.blocks).toHaveLength(3);
      expect(json.outputFormat).toBe('html');
    });
  });

  describe('fromJSON', () => {
    it('should create from plain object', () => {
      const recipe = CompositionRecipe.fromJSON(validRecipe);

      expect(recipe).toBeInstanceOf(CompositionRecipe);
      expect(recipe.id).toBe('welcome_email');
    });

    it('should throw on invalid object', () => {
      expect(() => CompositionRecipe.fromJSON(null)).toThrow();
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const recipe = new CompositionRecipe(validRecipe);

      const str = recipe.toString();

      expect(str).toContain('welcome_email');
      expect(str).toContain('3 blocks');
      expect(str).toContain('html');
    });
  });
});
