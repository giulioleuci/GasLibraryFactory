/**
 * @file ContextEngine/src/__tests__/ContextAssemblerInterceptors.test.js
 * @description Unit tests for ContextAssembler interceptor integration.
 */

import { ContextAssembler } from '../ContextAssembler';
import { ProviderRegistry } from '../ProviderRegistry';
import { InterceptorRegistry } from '../interceptors/InterceptorRegistry';
import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { SwapAndEnrichInterceptor } from '../interceptors/SwapAndEnrichInterceptor';
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
      interceptor.intercept.mockImplementation((name, data, context, options) => ({ ...data, intercepted: true }));
      
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

      interceptorRegistry.registerSingleton('OptionAware', new OptionAwareInterceptor(mocks.logger));

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

      interceptorRegistry.registerSingleton('Conditional', new ConditionalInterceptor(mocks.logger));

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

      interceptorRegistry.registerSingleton('PostProcess', new PostProcessInterceptor(mocks.logger));

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

  describe('SwapAndEnrichInterceptor integration', () => {
    class TeacherProvider extends DataProvider {
      _fetchData(parameters) {
        return {
          id: parameters.teacherId,
          name: 'Prof. Smith',
          subject: 'Math'
        };
      }
    }

    beforeEach(() => {
      providerRegistry.registerSingleton('TeacherProvider', new TeacherProvider(mocks.logger));
    });

    it('should perform swap and enrich when substitution found', () => {
      const substitutionLookup = (data, context, options) => {
        if (data.id === 'T001') {
          return {
            id: 'S001',
            name: 'Prof. Doe',
            subject: data.subject
          };
        }
        return null;
      };

      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, substitutionLookup, {
        originalPropertyName: 'titular',
        metadataFlags: { isSubstitute: true },
        targetProviders: ['teacher'],
        optionFlag: 'applySubstitutions'
      });

      interceptorRegistry.registerSingleton('SubstituteTeacher', interceptor);

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
            name: 'teacher',
            type: 'TeacherProvider',
            parameters: { teacherId: 'T001' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, { applySubstitutions: true });

      expect(context.teacher).toEqual({
        id: 'S001',
        name: 'Prof. Doe',
        subject: 'Math',
        isSubstitute: true,
        titular: {
          id: 'T001',
          name: 'Prof. Smith',
          subject: 'Math'
        }
      });
    });

    it('should preserve original when no substitution found', () => {
      const substitutionLookup = () => null; // No substitution

      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, substitutionLookup, {
        originalPropertyName: 'titular',
        optionFlag: 'applySubstitutions'
      });

      interceptorRegistry.registerSingleton('SubstituteTeacher', interceptor);

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
            name: 'teacher',
            type: 'TeacherProvider',
            parameters: { teacherId: 'T001' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, { applySubstitutions: true });

      expect(context.teacher).toEqual({
        id: 'T001',
        name: 'Prof. Smith',
        subject: 'Math'
      });
      expect(context.teacher.titular).toBeUndefined();
    });

    it('should skip when substitution flag not enabled', () => {
      const substitutionLookup = jest.fn(() => ({
        id: 'S001',
        name: 'Prof. Doe',
        subject: 'Math'
      }));

      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, substitutionLookup, {
        optionFlag: 'applySubstitutions'
      });

      interceptorRegistry.registerSingleton('SubstituteTeacher', interceptor);

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
            name: 'teacher',
            type: 'TeacherProvider',
            parameters: { teacherId: 'T001' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, { applySubstitutions: false });

      expect(substitutionLookup).not.toHaveBeenCalled();
      expect(context.teacher).toEqual({
        id: 'T001',
        name: 'Prof. Smith',
        subject: 'Math'
      });
    });

    it('should work with multiple providers and selective interception', () => {
      class StudentProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            id: parameters.studentId,
            name: 'John Student',
            grade: 10
          };
        }
      }

      providerRegistry.registerSingleton('StudentProvider', new StudentProvider(mocks.logger));

      const substitutionLookup = () => ({
        id: 'S001',
        name: 'Prof. Doe',
        subject: 'Math'
      });

      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, substitutionLookup, {
        targetProviders: ['teacher'], // Only intercept teacher, not student
        optionFlag: 'applySubstitutions'
      });

      interceptorRegistry.registerSingleton('SubstituteTeacher', interceptor);

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
            name: 'teacher',
            type: 'TeacherProvider',
            parameters: { teacherId: 'T001' }
          },
          {
            name: 'student',
            type: 'StudentProvider',
            parameters: { studentId: 'STU001' }
          }
        ]
      };

      const context = assembler.assemble(recipe, {}, { applySubstitutions: true });

      // Teacher should be intercepted
      expect(context.teacher.isSubstitute).toBe(true);

      // Student should NOT be intercepted
      expect(context.student).toEqual({
        id: 'STU001',
        name: 'John Student',
        grade: 10
      });
      expect(context.student.isSubstitute).toBeUndefined();
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
