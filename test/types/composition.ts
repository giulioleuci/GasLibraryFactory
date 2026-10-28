import {
  BlockDataContext,
  BlockDefinition,
  SimpleContentBlock,
  HtmlRenderer
} from '@ComposableContentLib';

const context = new BlockDataContext({ count: 1 });
const count: number = context.get('count', 0);
context.set('count', 2);
// @ts-expect-error Known context fields retain their value type.
context.set('count', 'two');
const renderer = new HtmlRenderer<{ count: number }>();
renderer.registerTemplate('counter', (data) => String(data.count));
// @ts-expect-error Template callbacks must accept the renderer's data shape.
renderer.registerTemplate('bad', (data: { count: string }) => data.count);
const block = new SimpleContentBlock<{ count: number }, BlockDataContext<{ count: number }>>(
  new BlockDefinition({ id: 'counter', name: 'Counter' }),
  {
    dataExtractor: (data) => ({ count: data.get('count', 0) }),
    emptyChecker: (data) => data.count === 0,
    templates: { html: 'counter' }
  }
);
const extracted: number = block.getData(context).count;
void [count, extracted];
