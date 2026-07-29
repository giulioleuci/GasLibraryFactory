import { CollectionProjectionInterceptor } from '../interceptors/CollectionProjectionInterceptor';
import { CollectionProjector } from '../projection/CollectionProjector';

describe('CollectionProjectionInterceptor', () => {
  const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

  test('projects configured nested arrays after the selected provider', () => {
    const projector = new CollectionProjector({ logger });
    const interceptor = new CollectionProjectionInterceptor(logger, projector, {
      targetProviders: ['assignments'],
      targetPaths: ['focus.items'],
      operations: [{ type: 'distinctBy', keys: ['id'] }]
    });
    const context = { focus: { items: [{ id: 1 }, { id: 1 }] } };

    const result = interceptor.intercept('assignments', context, context, {});

    expect(result).toBe(context);
    expect(context.focus.items).toEqual([{ id: 1 }]);
  });

  test('does not run for providers outside its configured scope or a disabled option flag', () => {
    const projector = { project: jest.fn() };
    const interceptor = new CollectionProjectionInterceptor(logger, projector, {
      targetProviders: ['assignments'],
      targetPaths: ['focus.items'],
      operations: [{ type: 'distinctBy', keys: ['id'] }],
      optionFlag: 'applyProjection'
    });
    const context = { focus: { items: [{ id: 1 }, { id: 1 }] } };

    interceptor.intercept('other', context, context, { applyProjection: true });
    interceptor.intercept('assignments', context, context, { applyProjection: false });

    expect(projector.project).not.toHaveBeenCalled();
  });
});
