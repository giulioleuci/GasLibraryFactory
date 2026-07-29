import { CollectionProjector } from '../projection/CollectionProjector';
import { ProjectionRegistry } from '../projection/ProjectionRegistry';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';

describe('CollectionProjector', () => {
  const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

  test('flatMap, groupBy, distinctBy and stable sort support zero-to-many projection', () => {
    const projector = new CollectionProjector({ logger });

    const result = projector.project(
      [
        { actor: 'b', slots: [{ subject: 'S2' }, { subject: 'S1' }] },
        { actor: 'a', slots: [] },
        { actor: 'b', slots: [{ subject: 'S1' }] }
      ],
      [
        { type: 'flatMap', path: 'slots', mergeParent: true },
        {
          type: 'groupBy',
          keys: ['actor'],
          aggregates: { subjects: { type: 'collectDistinct', path: 'subject' } }
        },
        { type: 'sortBy', keys: [{ path: 'actor', direction: 'ASC' }] }
      ],
      {}
    );

    expect(result.value).toEqual([{ actor: 'b', subjects: ['S2', 'S1'] }]);
    expect(result.trace).toEqual([
      { index: 0, type: 'flatMap', inputCount: 3, outputCount: 3 },
      { index: 1, type: 'groupBy', inputCount: 3, outputCount: 1 },
      { index: 2, type: 'sortBy', inputCount: 1, outputCount: 1 }
    ]);
  });

  test('projects mapped fields from nested paths without mutating input', () => {
    const projector = new CollectionProjector({ logger });
    const input = [{ person: { id: 7, name: 'Ada' } }];

    const result = projector.project(
      input,
      [{ type: 'map', fields: { id: { from: 'person.id' }, label: { value: 'teacher' } } }],
      {}
    );

    expect(result.value).toEqual([{ id: 7, label: 'teacher' }]);
    expect(input).toEqual([{ person: { id: 7, name: 'Ada' } }]);
  });

  test('conditionally prepends and appends copied values using the expression engine', () => {
    const expressionEngine = {
      evaluate: jest.fn((expression, context) => expression === 'enabled' && context.enabled)
    };
    const projector = new CollectionProjector({ logger, expressionEngine });
    const marker = { id: 'first' };

    const result = projector.project(
      [{ id: 'middle' }],
      [
        { type: 'prepend', value: marker, when: 'enabled' },
        { type: 'append', value: { id: 'last' }, when: 'disabled' }
      ],
      { enabled: true }
    );

    expect(result.value).toEqual([{ id: 'first' }, { id: 'middle' }]);
    expect(result.value[0]).not.toBe(marker);
    expect(expressionEngine.evaluate).toHaveBeenCalledWith(
      'enabled',
      expect.objectContaining({ enabled: true })
    );
  });

  test('preserves the original order for equal sort keys', () => {
    const projector = new CollectionProjector({ logger });
    const result = projector.project(
      [
        { id: 'first', rank: 1 },
        { id: 'second', rank: 1 },
        { id: 'third', rank: 2 }
      ],
      [{ type: 'sortBy', keys: [{ path: 'rank', direction: 'ASC' }] }],
      {}
    );

    expect(result.value.map((value) => value.id)).toEqual(['first', 'second', 'third']);
  });

  test('runs configured strategies through the registry', () => {
    const registry = new ProjectionRegistry().register('onlyActive', (value, operation, runtime) =>
      value.filter((item) => item.active === runtime.active)
    );
    const projector = new CollectionProjector({ logger, registry });

    const result = projector.project(
      [
        { id: 1, active: true },
        { id: 2, active: false }
      ],
      [{ type: 'strategy', name: 'onlyActive' }],
      { active: true }
    );

    expect(result.value).toEqual([{ id: 1, active: true }]);
  });

  test('reports operation index and target path for missing paths', () => {
    const projector = new CollectionProjector({ logger });

    expect(() =>
      projector.project([{ id: 1 }], [{ type: 'distinctBy', keys: ['missing.id'] }], {
        targetPath: 'focus.items'
      })
    ).toThrow(CollectionProjectionError);

    let thrown;
    try {
      projector.project([{ id: 1 }], [{ type: 'distinctBy', keys: ['missing.id'] }], {
        targetPath: 'focus.items'
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown.context).toMatchObject({ operationIndex: 0, targetPath: 'focus.items' });
  });
});
