/**
 * @file ContextEngine/src/__tests__/SwapAndEnrichInterceptor.test.js
 * @description Unit tests for SwapAndEnrichInterceptor.
 */

import { SwapAndEnrichInterceptor } from '../interceptors/SwapAndEnrichInterceptor';
import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { MockFactory } from '../../../test/fakes';

describe('SwapAndEnrichInterceptor', () => {
  let mocks;
  let mockLookup;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLookup = jest.fn();
  });

  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      expect(interceptor).toBeInstanceOf(ContextInterceptor);
      expect(interceptor).toBeInstanceOf(SwapAndEnrichInterceptor);
    });

    it('should throw error if substitutionLookup is not a function', () => {
      expect(() => new SwapAndEnrichInterceptor(mocks.logger, null)).toThrow(
        'SwapAndEnrichInterceptor: substitutionLookup is required and must be a function'
      );
      expect(() => new SwapAndEnrichInterceptor(mocks.logger, 'not a function')).toThrow(
        'SwapAndEnrichInterceptor: substitutionLookup is required and must be a function'
      );
    });

    it('should throw error if config is not an object', () => {
      expect(() => new SwapAndEnrichInterceptor(mocks.logger, mockLookup, 'invalid')).toThrow(
        'SwapAndEnrichInterceptor: config must be an object or null'
      );
    });

    it('should use default configuration if not provided', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      // Test default behavior by checking interception result
      mockLookup.mockReturnValue({ id: 2, name: 'Substitute' });

      const result = interceptor.intercept(
        'test',
        { id: 1, name: 'Original' },
        {},
        { applyOverrides: true }
      );

      expect(result).toHaveProperty('isSubstitute', true);
      expect(result).toHaveProperty('original');
    });

    it('should use custom originalPropertyName', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        originalPropertyName: 'titular'
      });
      mockLookup.mockReturnValue({ id: 2, name: 'Substitute' });

      const result = interceptor.intercept(
        'test',
        { id: 1, name: 'Original' },
        {},
        { applyOverrides: true }
      );

      expect(result).toHaveProperty('titular');
      expect(result.titular).toEqual({ id: 1, name: 'Original' });
    });

    it('should use custom metadataFlags', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        metadataFlags: { isActing: true, type: 'temporary' }
      });
      mockLookup.mockReturnValue({ id: 2, name: 'Substitute' });

      const result = interceptor.intercept(
        'test',
        { id: 1, name: 'Original' },
        {},
        { applyOverrides: true }
      );

      expect(result.isActing).toBe(true);
      expect(result.type).toBe('temporary');
      expect(result.isSubstitute).toBeUndefined();
    });

    it('should use custom targetProviders', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        targetProviders: ['teacher', 'instructor']
      });

      // Should intercept 'teacher'
      expect(interceptor._shouldIntercept('teacher', {}, {}, { applyOverrides: true })).toBe(true);
      // Should intercept 'instructor'
      expect(interceptor._shouldIntercept('instructor', {}, {}, { applyOverrides: true })).toBe(
        true
      );
      // Should NOT intercept 'manager'
      expect(interceptor._shouldIntercept('manager', {}, {}, { applyOverrides: true })).toBe(false);
    });

    it('should use custom optionFlag', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        optionFlag: 'enableSubstitutions'
      });

      // Should intercept when custom flag is true
      expect(interceptor._shouldIntercept('test', {}, {}, { enableSubstitutions: true })).toBe(
        true
      );
      // Should NOT intercept when custom flag is false
      expect(interceptor._shouldIntercept('test', {}, {}, { enableSubstitutions: false })).toBe(
        false
      );
      // Should NOT intercept when default flag is set
      expect(interceptor._shouldIntercept('test', {}, {}, { applyOverrides: true })).toBe(false);
    });
  });

  describe('_shouldIntercept', () => {
    it('should return false if option flag is not enabled', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const result = interceptor._shouldIntercept('test', {}, {}, { applyOverrides: false });

      expect(result).toBe(false);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        "[test] SwapAndEnrichInterceptor: Option flag 'applyOverrides' not enabled"
      );
    });

    it('should return false if option flag is missing', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const result = interceptor._shouldIntercept('test', {}, {}, {});

      expect(result).toBe(false);
    });

    it('should return true if option flag is enabled and no target providers', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const result = interceptor._shouldIntercept('test', {}, {}, { applyOverrides: true });

      expect(result).toBe(true);
    });

    it('should return false if provider not in target list', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        targetProviders: ['teacher']
      });

      const result = interceptor._shouldIntercept('student', {}, {}, { applyOverrides: true });

      expect(result).toBe(false);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        '[student] SwapAndEnrichInterceptor: Provider not in target list: teacher'
      );
    });

    it('should return true if provider is in target list and flag enabled', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        targetProviders: ['teacher', 'instructor']
      });

      const result = interceptor._shouldIntercept('teacher', {}, {}, { applyOverrides: true });

      expect(result).toBe(true);
    });
  });

  describe('_performIntercept', () => {
    it('should return original data if no substitution found', () => {
      mockLookup.mockReturnValue(null);
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      const originalData = { id: 1, name: 'Original' };

      const result = interceptor._performIntercept('test', originalData, {}, {});

      expect(result).toBe(originalData);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        '[test] SwapAndEnrichInterceptor: No substitution found'
      );
    });

    it('should return original data if substitution is null', () => {
      mockLookup.mockReturnValue(null);
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      const originalData = { id: 1, name: 'Original' };

      const result = interceptor._performIntercept('test', originalData, {}, {});

      expect(result).toBe(originalData);
    });

    it('should perform swap and enrich if substitution found', () => {
      const substituteData = { id: 2, name: 'Substitute', role: 'Teacher' };
      mockLookup.mockReturnValue(substituteData);
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      const originalData = { id: 1, name: 'Original', role: 'Teacher' };

      const result = interceptor._performIntercept('test', originalData, {}, {});

      // Substitute data should be at top level
      expect(result.id).toBe(2);
      expect(result.name).toBe('Substitute');
      expect(result.role).toBe('Teacher');

      // Metadata should be added
      expect(result.isSubstitute).toBe(true);

      // Original should be preserved
      expect(result.original).toEqual(originalData);

      expect(mocks.logger.info).toHaveBeenCalledWith(
        '[test] SwapAndEnrichInterceptor: Substitution found, performing swap & enrich'
      );
    });

    it('should call substitutionLookup with correct parameters', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);
      const data = { id: 1 };
      const context = { existing: 'data' };
      const options = { date: '2025-01-01' };

      interceptor._performIntercept('test', data, context, options);

      expect(mockLookup).toHaveBeenCalledWith(data, context, options);
    });

    it('should handle substitution lookup errors', () => {
      mockLookup.mockImplementation(() => {
        throw new Error('Lookup failed');
      });
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      expect(() => interceptor._performIntercept('test', {}, {}, {})).toThrow(
        'Substitution lookup failed: Lookup failed'
      );
      expect(mocks.logger.error).toHaveBeenCalledWith(
        '[test] SwapAndEnrichInterceptor: Substitution lookup failed: Lookup failed'
      );
    });

    it('should preserve all substitute properties', () => {
      const substituteData = {
        id: 2,
        name: 'Substitute',
        email: 'sub@example.com',
        nested: { prop: 'value' }
      };
      mockLookup.mockReturnValue(substituteData);
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const result = interceptor._performIntercept('test', { id: 1, name: 'Original' }, {}, {});

      expect(result.id).toBe(2);
      expect(result.name).toBe('Substitute');
      expect(result.email).toBe('sub@example.com');
      expect(result.nested).toEqual({ prop: 'value' });
    });
  });

  describe('intercept (integration)', () => {
    it('should perform complete swap and enrich flow', () => {
      const substituteData = { id: 'S001', name: 'Prof. Doe', subject: 'Math' };
      mockLookup.mockReturnValue(substituteData);

      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup, {
        originalPropertyName: 'titular',
        metadataFlags: { isSubstitute: true, substituteDate: '2025-01-15' },
        targetProviders: ['teacher'],
        optionFlag: 'applySubstitutions'
      });

      const originalData = { id: 'T001', name: 'Prof. Smith', subject: 'Math' };
      const context = { classId: 'C123' };
      const options = { applySubstitutions: true, date: '2025-01-15' };

      const result = interceptor.intercept('teacher', originalData, context, options);

      // Verify structure
      expect(result).toEqual({
        id: 'S001',
        name: 'Prof. Doe',
        subject: 'Math',
        isSubstitute: true,
        substituteDate: '2025-01-15',
        titular: {
          id: 'T001',
          name: 'Prof. Smith',
          subject: 'Math'
        }
      });

      // Verify lookup was called correctly
      expect(mockLookup).toHaveBeenCalledWith(originalData, context, options);
    });

    it('should skip interception when conditions not met', () => {
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const result = interceptor.intercept(
        'test',
        { id: 1, name: 'Original' },
        {},
        { applyOverrides: false }
      );

      expect(result).toEqual({ id: 1, name: 'Original' });
      expect(mockLookup).not.toHaveBeenCalled();
    });

    it('should work with complex nested data', () => {
      const substituteData = {
        id: 2,
        name: 'Substitute',
        contact: {
          email: 'sub@example.com',
          phone: '555-0002'
        },
        metadata: {
          startDate: '2025-01-01',
          endDate: '2025-12-31'
        }
      };
      mockLookup.mockReturnValue(substituteData);
      const interceptor = new SwapAndEnrichInterceptor(mocks.logger, mockLookup);

      const originalData = {
        id: 1,
        name: 'Original',
        contact: {
          email: 'orig@example.com',
          phone: '555-0001'
        }
      };

      const result = interceptor.intercept('test', originalData, {}, { applyOverrides: true });

      expect(result.contact).toEqual(substituteData.contact);
      expect(result.metadata).toEqual(substituteData.metadata);
      expect(result.original).toEqual(originalData);
    });
  });
});
