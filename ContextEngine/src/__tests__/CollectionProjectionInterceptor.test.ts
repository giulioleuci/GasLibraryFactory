import { jest } from '@jest/globals';
import { CollectionProjectionInterceptor } from '../interceptors/CollectionProjectionInterceptor.js';
import { CollectionProjector } from '../projection/CollectionProjector.js';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError.js';

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
    const projector = {
      project: jest.fn<import('@ContextEngine').CollectionProjector['project']>()
    };
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

  test('supports null options when an option flag is configured', () => {
    const projector = { project: jest.fn(() => ({ value: [{ id: 1 }], trace: [] })) };
    const interceptor = new CollectionProjectionInterceptor(logger, projector, {
      targetProviders: ['assignments'],
      targetPaths: ['focus.items'],
      operations: [{ type: 'distinctBy', keys: ['id'] }],
      optionFlag: 'applyProjection'
    });
    const context = { focus: { items: [{ id: 1 }] } };

    expect(interceptor.intercept('assignments', context, context, null)).toBe(context);
    expect(projector.project).not.toHaveBeenCalled();
  });

  test('preserves projection error metadata through interceptor error handling', () => {
    const projectionError = new CollectionProjectionError('Missing collection path', {
      operationIndex: 2,
      targetPath: 'focus.items'
    });
    const projector = {
      project: jest.fn(() => {
        throw projectionError;
      })
    };
    const interceptor = new CollectionProjectionInterceptor(logger, projector, {
      targetProviders: ['assignments'],
      targetPaths: ['focus.items'],
      operations: [{ type: 'distinctBy', keys: ['id'] }]
    });
    const context = { focus: { items: [{ id: 1 }] } };

    let thrown!: CollectionProjectionError;
    try {
      interceptor.intercept('assignments', context, context, {});
    } catch (error) {
      thrown = error as CollectionProjectionError;
    }
    expect(thrown).toBeInstanceOf(CollectionProjectionError);
    expect(thrown.context).toMatchObject({ operationIndex: 2, targetPath: 'focus.items' });
  });
});
