import { BlockResult } from '../BlockResult.js';
import { CompositionResult } from '../CompositionResult.js';

describe('CompositionResult', () => {
  it('reports visible, hidden, and failed blocks from their real result state', () => {
    const result = new CompositionResult({
      recipeId: 'welcome',
      outputFormat: 'plain_text',
      content: 'Hello',
      blocks: [
        new BlockResult({ instanceId: 'visible', blockType: 'greeting', content: 'Hello', processingTime: 10 }),
        BlockResult.hidden('hidden', 'optional'),
        BlockResult.error('failed', 'notice', new Error('template unavailable'))
      ],
      processingTime: 30,
      metadata: { audience: 'staff' }
    });

    expect(result.getVisibleBlocks().map((block) => block.instanceId)).toEqual(['visible']);
    expect(result.getHiddenBlocks().map((block) => block.instanceId)).toEqual(['hidden', 'failed']);
    expect(result.getErrorBlocks().map((block) => block.instanceId)).toEqual(['failed']);
    expect(result.hasErrors()).toBe(true);
    expect(result.isSuccess()).toBe(false);
    expect(result.getAverageBlockTime()).toBe(10 / 3);
  });

  it('creates a serializable empty success result with its reason', () => {
    const result = CompositionResult.empty('empty-notice', 'html', 'no recipients');

    expect(result.isSuccess()).toBe(true);
    expect(result.isEmpty).toBe(true);
    expect(result.toJSON()).toEqual({
      recipeId: 'empty-notice',
      outputFormat: 'html',
      content: '',
      blocks: [],
      visibleBlocks: 0,
      totalBlocks: 0,
      isEmpty: true,
      processingTime: 0,
      metadata: { emptyReason: 'no recipients' }
    });
  });
});
