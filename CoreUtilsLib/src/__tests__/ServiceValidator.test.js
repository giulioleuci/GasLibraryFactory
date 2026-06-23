// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/ServiceValidator.test.js
// ===================================================================
// Comprehensive test suite for ServiceValidator
// Coverage: 100% of all static methods
// ===================================================================

import { ServiceValidator } from '../ServiceValidator';
import { MockFactory } from '../../../test/fakes/MockFactory';

describe('ServiceValidator - Comprehensive Test Suite', () => {
  // Create mocks for testing
  const mocks = MockFactory.createAllJest();

  // Extend exceptionService mock with classifyException for ServiceValidator
  mocks.exceptionService.classifyException = jest.fn();

  // Extend spreadsheetService mock with required methods for ServiceValidator
  mocks.spreadsheetService.getSpreadsheet = jest.fn();
  mocks.spreadsheetService.getSheet = jest.fn();
  mocks.spreadsheetService.getRange = jest.fn();

  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have UTILS_METHODS constant', () => {
      expect(ServiceValidator.UTILS_METHODS).toEqual(['sleep']);
    });

    it('should have CACHE_METHODS constant', () => {
      expect(ServiceValidator.CACHE_METHODS).toEqual(['get', 'put', 'remove']);
    });

    it('should have EXCEPTION_SERVICE_METHODS constant', () => {
      expect(ServiceValidator.EXCEPTION_SERVICE_METHODS).toEqual([
        'executeWithRetry',
        'classifyException'
      ]);
    });

    it('should have SPREADSHEET_METHODS constant', () => {
      expect(ServiceValidator.SPREADSHEET_METHODS).toEqual([
        'getSpreadsheet',
        'getSheet',
        'getRange'
      ]);
    });
  });

  // ===================================================================
  // validateLogger()
  // ===================================================================

  describe('validateLogger()', () => {
    it('should pass for valid logger', () => {
      expect(ServiceValidator.validateLogger(mocks.logger, 'Test')).toBe(true);
    });

    it('should throw for invalid logger', () => {
      expect(() => ServiceValidator.validateLogger(null, 'Test')).toThrow(
        'Test: logger is required'
      );
    });
  });

  // ===================================================================
  // validateUtils()
  // ===================================================================

  describe('validateUtils()', () => {
    it('should pass for valid utils with sleep method', () => {
      expect(ServiceValidator.validateUtils(mocks.utils, 'Test')).toBe(true);
    });

    it('should throw for utils missing sleep method', () => {
      expect(() => ServiceValidator.validateUtils({}, 'Test')).toThrow(
        'Test: utils.sleep must be a function'
      );
    });

    it('should validate additional methods', () => {
      const utils = { sleep: jest.fn(), formatDate: jest.fn() };
      expect(ServiceValidator.validateUtils(utils, 'Test', ['formatDate'])).toBe(true);
    });

    it('should throw for missing additional methods', () => {
      expect(() => ServiceValidator.validateUtils(mocks.utils, 'Test', ['nonExistentMethod'])).toThrow(
        'Test: utils.nonExistentMethod must be a function'
      );
    });

    it('should pass for null when not required', () => {
      expect(ServiceValidator.validateUtils(null, 'Test', [], false)).toBe(true);
    });
  });

  // ===================================================================
  // validateCache()
  // ===================================================================

  describe('validateCache()', () => {
    it('should pass for valid cache', () => {
      expect(ServiceValidator.validateCache(mocks.cache, 'Test')).toBe(true);
    });

    it('should pass for null cache by default (optional)', () => {
      expect(ServiceValidator.validateCache(null, 'Test')).toBe(true);
    });

    it('should throw for null cache when required', () => {
      expect(() => ServiceValidator.validateCache(null, 'Test', true)).toThrow(
        'Test: cache is required'
      );
    });

    it('should throw for cache missing methods', () => {
      expect(() => ServiceValidator.validateCache({ get: jest.fn() }, 'Test', true)).toThrow(
        'Test: cache.put must be a function'
      );
    });
  });

  // ===================================================================
  // validateExceptionService()
  // ===================================================================

  describe('validateExceptionService()', () => {
    it('should pass for valid exception service', () => {
      expect(ServiceValidator.validateExceptionService(mocks.exceptionService, 'Test')).toBe(true);
    });

    it('should pass for null by default (optional)', () => {
      expect(ServiceValidator.validateExceptionService(null, 'Test')).toBe(true);
    });

    it('should throw for null when required', () => {
      expect(() => ServiceValidator.validateExceptionService(null, 'Test', true)).toThrow(
        'Test: exceptionService is required'
      );
    });

    it('should throw for missing methods', () => {
      expect(() =>
        ServiceValidator.validateExceptionService({ executeWithRetry: jest.fn() }, 'Test', true)
      ).toThrow('Test: exceptionService.classifyException must be a function');
    });
  });

  // ===================================================================
  // validateSpreadsheetService()
  // ===================================================================

  describe('validateSpreadsheetService()', () => {
    it('should pass for valid spreadsheet service', () => {
      expect(ServiceValidator.validateSpreadsheetService(mocks.spreadsheetService, 'Test')).toBe(
        true
      );
    });

    it('should throw for null by default (required)', () => {
      expect(() => ServiceValidator.validateSpreadsheetService(null, 'Test')).toThrow(
        'Test: spreadsheetService is required'
      );
    });

    it('should pass for null when not required', () => {
      expect(ServiceValidator.validateSpreadsheetService(null, 'Test', false)).toBe(true);
    });
  });

  // ===================================================================
  // validateServiceDependencies()
  // ===================================================================

  describe('validateServiceDependencies()', () => {
    it('should validate all standard dependencies', () => {
      const deps = {
        logger: mocks.logger,
        utils: mocks.utils,
        cache: mocks.cache,
        exceptionService: mocks.exceptionService
      };
      expect(ServiceValidator.validateServiceDependencies(deps, 'Test')).toBe(true);
    });

    it('should pass with optional dependencies as null', () => {
      const deps = {
        logger: mocks.logger,
        utils: mocks.utils,
        cache: null,
        exceptionService: null
      };
      expect(ServiceValidator.validateServiceDependencies(deps, 'Test')).toBe(true);
    });

    it('should throw when required dependency is missing', () => {
      const deps = {
        logger: null,
        utils: mocks.utils
      };
      expect(() => ServiceValidator.validateServiceDependencies(deps, 'Test')).toThrow(
        'Test: logger is required'
      );
    });

    it('should throw when cache is required but missing', () => {
      const deps = {
        logger: mocks.logger,
        utils: mocks.utils,
        cache: null
      };
      expect(() =>
        ServiceValidator.validateServiceDependencies(deps, 'Test', { requireCache: true })
      ).toThrow('Test: cache is required');
    });

    it('should throw when exception service is required but missing', () => {
      const deps = {
        logger: mocks.logger,
        utils: mocks.utils,
        exceptionService: null
      };
      expect(() =>
        ServiceValidator.validateServiceDependencies(deps, 'Test', {
          requireExceptionService: true
        })
      ).toThrow('Test: exceptionService is required');
    });
  });

  // ===================================================================
  // validateService()
  // ===================================================================

  describe('validateService()', () => {
    it('should validate service with custom methods', () => {
      const service = { getData: jest.fn(), setData: jest.fn() };
      expect(
        ServiceValidator.validateService(service, 'myService', ['getData', 'setData'], 'Test')
      ).toBe(true);
    });

    it('should throw for missing custom methods', () => {
      const service = { getData: jest.fn() };
      expect(() =>
        ServiceValidator.validateService(service, 'myService', ['getData', 'setData'], 'Test')
      ).toThrow('Test: myService.setData must be a function');
    });

    it('should pass for null when not required', () => {
      expect(ServiceValidator.validateService(null, 'myService', [], 'Test', false)).toBe(true);
    });
  });

  // ===================================================================
  // createValidator()
  // ===================================================================

  describe('createValidator()', () => {
    it('should create reusable validator function', () => {
      const validateDocService = ServiceValidator.createValidator('documentService', [
        'getDocument',
        'updateDocument'
      ]);

      const validService = { getDocument: jest.fn(), updateDocument: jest.fn() };
      expect(validateDocService(validService, 'Test')).toBe(true);
    });

    it('should throw when created validator finds invalid service', () => {
      const validateDocService = ServiceValidator.createValidator('documentService', [
        'getDocument'
      ]);

      expect(() => validateDocService({}, 'Test')).toThrow(
        'Test: documentService.getDocument must be a function'
      );
    });

    it('should support required parameter in created validator', () => {
      const validateDocService = ServiceValidator.createValidator('documentService', []);

      expect(validateDocService(null, 'Test', false)).toBe(true);
    });
  });

  // ===================================================================
  // validateConstructorOptions()
  // ===================================================================

  describe('validateConstructorOptions()', () => {
    it('should validate all options', () => {
      const options = {
        logger: mocks.logger,
        utils: mocks.utils
      };
      const requirements = {
        logger: { required: true, methods: ['debug', 'info', 'warn', 'error'] },
        utils: { required: true, methods: ['sleep'] }
      };

      expect(ServiceValidator.validateConstructorOptions(options, requirements, 'Test')).toBe(true);
    });

    it('should handle optional options', () => {
      const options = {
        logger: mocks.logger,
        cache: null
      };
      const requirements = {
        logger: { required: true, methods: ['debug', 'info', 'warn', 'error'] },
        cache: { required: false, methods: ['get', 'put'] }
      };

      expect(ServiceValidator.validateConstructorOptions(options, requirements, 'Test')).toBe(true);
    });

    it('should throw for missing required option', () => {
      const options = {
        logger: null
      };
      const requirements = {
        logger: { required: true, methods: ['debug'] }
      };

      expect(() =>
        ServiceValidator.validateConstructorOptions(options, requirements, 'Test')
      ).toThrow('Test: logger is required');
    });

    it('should handle null options object', () => {
      const requirements = {
        logger: { required: false, methods: [] }
      };

      expect(ServiceValidator.validateConstructorOptions(null, requirements, 'Test')).toBe(true);
    });

    it('should default to required if not specified', () => {
      const options = { service: null };
      const requirements = {
        service: { methods: [] } // required not specified, defaults to true
      };

      expect(() =>
        ServiceValidator.validateConstructorOptions(options, requirements, 'Test')
      ).toThrow('Test: service is required');
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should use default context when not provided', () => {
      expect(() => ServiceValidator.validateLogger(null)).toThrow(
        'ServiceValidator: logger is required'
      );
    });

    it('should handle empty requirements object', () => {
      expect(ServiceValidator.validateConstructorOptions({}, {}, 'Test')).toBe(true);
    });

    it('should handle empty additionalMethods array', () => {
      expect(ServiceValidator.validateUtils(mocks.utils, 'Test', [])).toBe(true);
    });
  });
});
