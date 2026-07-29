/**
 * @file ContextEngine/src/__tests__/ContextAssemblerInterceptors.test.js
 * @description Unit tests for ContextAssembler interceptor integration.
 */

import { ContextAssembler } from '../ContextAssembler';
import { ProviderRegistry } from '../ProviderRegistry';
import { InterceptorRegistry } from '../interceptors/InterceptorRegistry';
import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { CollectionProjectionInterceptor } from '../interceptors/CollectionProjectionInterceptor';
import { CollectionProjector } from '../projection/CollectionProjector';
import { DataProvider } from '../DataProvider';
import { MockFactory } from '../../../test/fakes';
import { testing as ContextEngineTesting } from '@ContextEngine';

describe('ContextAssembler - Interceptor Integration', () => {
  let mocks;
  let providerRegistry;
  let interceptorRegistry;
  let assembler;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    providerRegistry = new ProviderRegistry(mocks.logger);
    interceptorRegistry = new InterceptorRegistry(mocks.logger);
  });

  describe('constructor with interceptorRegistry', () => {
    it('should accept interceptorRegistry parameter', () => {
      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      expect(assembler).toBeInstanceOf(ContextAssembler);
    });

    it('should work without interceptorRegistry (backward compatibility)', () => {
      assembler = new ContextAssembler(mocks.logger, providerRegistry);
      expect(assembler).toBeInstanceOf(ContextAssembler);
    });

    it('should throw error if interceptorRegistry is invalid', () => {
      expect(
        () => new ContextAssembler(mocks.logger, providerRegistry, null, null, 'invalid')
      ).toThrow('ContextAssembler: interceptorRegistry must be of type object');
    });
  });

  describe('assemble with interceptors', () => {
    class TestProvider extends DataProvider {
      _fetchData(parameters) {
        return { id: parameters.id, name: parameters.name, role: 'Original' };
      }
    }

    beforeEach(() => {
      providerRegistry.registerSingleton('TestProvider', new TestProvider(mocks.logger));
    });

    it('should apply interceptors to provider results', () => {
      const interceptor = new ContextEngineTesting.InterceptorMock('SimpleInterceptor');
      interceptor.intercept.mockImplementation((name, data, context, options) => ({
        ...data,
        intercepted: true
      }));

      interceptorRegistry.registerSingleton('SimpleInterceptor', interceptor);

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, {});

      expect(context.testData).toEqual({
        id: 1,
        name: 'Test',
        role: 'Original',
        intercepted: true
      });
    });

    it('should work without interceptorRegistry', () => {
      assembler = new ContextAssembler(mocks.logger, providerRegistry);

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, {});

      expect(context.testData).toEqual({
        id: 1,
        name: 'Test',
        role: 'Original'
      });
      expect(context.testData.intercepted).toBeUndefined();
    });

    it('should apply multiple interceptors in sequence', () => {
      class FirstInterceptor extends ContextInterceptor {
        _performIntercept(name, data, context, options) {
          return { ...data, first: true };
        }
      }

      class SecondInterceptor extends ContextInterceptor {
        _performIntercept(name, data, context, options) {
          return { ...data, second: true };
        }
      }

      interceptorRegistry.registerSingleton('First', new FirstInterceptor(mocks.logger));
      interceptorRegistry.registerSingleton('Second', new SecondInterceptor(mocks.logger));

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, {});

      expect(context.testData).toMatchObject({
        id: 1,
        name: 'Test',
        role: 'Original',
        first: true,
        second: true
      });
    });

    it('should pass options to interceptors', () => {
      class OptionAwareInterceptor extends ContextInterceptor {
        _shouldIntercept(name, data, context, options) {
          return options.enableInterception === true;
        }

        _performIntercept(name, data, context, options) {
          return { ...data, optionValue: options.customValue };
        }
      }

      interceptorRegistry.registerSingleton(
        'OptionAware',
        new OptionAwareInterceptor(mocks.logger)
      );

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' }
          }
        ]
      };

      const context = assembler.assemble(
        recipe,
        {},
        {
          enableInterception: true,
          customValue: 'passed'
        }
      );

      expect(context.testData).toMatchObject({
        optionValue: 'passed'
      });
    });

    it('should skip interception when interceptor conditions not met', () => {
      class ConditionalInterceptor extends ContextInterceptor {
        _shouldIntercept(name, data, context, options) {
          return options.applyOverrides === true;
        }

        _performIntercept(name, data, context, options) {
          return { ...data, modified: true };
        }
      }

      interceptorRegistry.registerSingleton(
        'Conditional',
        new ConditionalInterceptor(mocks.logger)
      );

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, { applyOverrides: false });

      expect(context.testData.modified).toBeUndefined();
    });

    it('should apply interceptors after post-processing', () => {
      class PostProcessInterceptor extends ContextInterceptor {
        _performIntercept(name, data, context, options) {
          // Verify post-processed field exists
          if (data.postProcessed) {
            return { ...data, interceptedAfterPostProcess: true };
          }
          return data;
        }
      }

      interceptorRegistry.registerSingleton(
        'PostProcess',
        new PostProcessInterceptor(mocks.logger)
      );

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      // Mock post-processor
      const postProcessorMock = {
        process: jest.fn((processors, data) => ({ ...data, postProcessed: true }))
      };
      assembler._postProcessor = postProcessorMock;

      const recipe = {
        providers: [
          {
            name: 'testData',
            type: 'TestProvider',
            parameters: { id: 1, name: 'Test' },
            postProcess: [{ type: 'test' }]
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, {});

      expect(context.testData.postProcessed).toBe(true);
      expect(context.testData.interceptedAfterPostProcess).toBe(true);
    });
  });

  describe('CollectionProjectionInterceptor integration', () => {
    it('projects nested collections after the selected mutating provider', () => {
      class AssignmentsProvider extends DataProvider {
        _fetchData() {
          return null;
        }

        provide(sharedTarget) {
          sharedTarget.focus = { items: [{ id: 1 }, { id: 1 }, { id: 2 }] };
        }
      }

      providerRegistry.registerSingleton(
        'AssignmentsProvider',
        new AssignmentsProvider(mocks.logger)
      );
      interceptorRegistry.registerSingleton(
        'ProjectAssignments',
        new CollectionProjectionInterceptor(
          mocks.logger,
          new CollectionProjector({ logger: mocks.logger }),
          {
            targetProviders: ['assignments'],
            targetPaths: ['focus.items'],
            operations: [{ type: 'distinctBy', keys: ['id'] }]
          }
        )
      );
      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const context = assembler.assembleInto(
        {},
        { providers: [{ name: 'assignments', type: 'AssignmentsProvider' }] },
        {},
        {}
      );

      expect(context.focus.items).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getConfigSummary with interceptors', () => {
    it('should include interceptor information in summary', () => {
      const interceptor = {
        intercept: jest.fn()
      };
      interceptorRegistry.registerSingleton('TestInterceptor', interceptor);

      assembler = new ContextAssembler(
        mocks.logger,
        providerRegistry,
        null,
        null,
        interceptorRegistry
      );

      const summary = assembler.getConfigSummary();

      expect(summary.hasInterceptorRegistry).toBe(true);
      expect(summary.registeredInterceptors).toContain('TestInterceptor');
    });

    it('should show no interceptors when registry not provided', () => {
      assembler = new ContextAssembler(mocks.logger, providerRegistry);

      const summary = assembler.getConfigSummary();

      expect(summary.hasInterceptorRegistry).toBe(false);
      expect(summary.registeredInterceptors).toEqual([]);
    });
  });
});
