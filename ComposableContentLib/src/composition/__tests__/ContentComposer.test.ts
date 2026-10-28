import type { BlockDataContext } from '../../data/BlockDataContext.js';
import { jest } from '@jest/globals';
import { ContentComposer } from '../ContentComposer.js';
import { BlockRegistry } from '../../registry/BlockRegistry.js';
import { RendererRegistry } from '../../registry/RendererRegistry.js';
import { BlockDefinition } from '../../core/BlockDefinition.js';
import { SimpleContentBlock } from '../../core/ContentBlock.js';
import { HtmlRenderer } from '../../internal/BlockRenderer.js';

describe('ContentComposer', () => {
  it('orders rendered blocks and reports hidden, empty, and failed blocks', () => {
    const blocks = new BlockRegistry();
    const renderers = new RendererRegistry({ registerDefaults: false });
    renderers.register(new HtmlRenderer({ templates: { message: '{{value}}' } }));
    blocks.register({
      definition: new BlockDefinition({
        id: 'message',
        name: 'Message',
        supportedFormats: ['html']
      }),
      factory: (definition: BlockDefinition, config: Record<string, unknown>) =>
        new SimpleContentBlock(definition, {
          dataExtractor: (context: BlockDataContext) => ({
            value: context.get(config.path as string)
          }),
          emptyChecker: (data) => !data.value,
          templates: { html: (config.template as string) || 'message' }
        })
    });
    const result = new ContentComposer({
      blockRegistry: blocks,
      rendererRegistry: renderers
    }).compose(
      {
        id: 'notice',
        name: 'Notice',
        outputFormat: 'html',
        separator: '|',
        blocks: [
          { instanceId: 'last', blockType: 'message', order: 4, config: { path: 'last' } },
          {
            instanceId: 'hidden',
            blockType: 'message',
            order: 1,
            visibility: 'never',
            config: { path: 'first' }
          },
          { instanceId: 'empty', blockType: 'message', order: 2, config: { path: 'empty' } },
          {
            instanceId: 'broken',
            blockType: 'message',
            order: 3,
            config: { path: 'first', template: 'absent' }
          },
          { instanceId: 'first', blockType: 'message', order: 0, config: { path: 'first' } }
        ]
      },
      { first: 'First', last: 'Last' }
    );

    expect(result.content).toBe('First|Last');
    expect(result.getVisibleBlocks().map((block) => block.instanceId)).toEqual(['first', 'last']);
    expect(result.getHiddenBlocks().map((block) => block.instanceId)).toEqual([
      'hidden',
      'empty',
      'broken'
    ]);
    expect(result.getErrorBlocks().map((block) => block.instanceId)).toEqual(['broken']);
    expect(result.metadata).toEqual({
      totalBlocks: 5,
      visibleBlocks: 2,
      hiddenBlocks: 3,
      errorBlocks: 1
    });
    expect(result.isSuccess()).toBe(false);
  });
});
