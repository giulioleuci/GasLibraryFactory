// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/interfaces.test.js
// ===================================================================
// Comprehensive test suite for interface definitions
// Coverage: All interface objects and validation functions
// ===================================================================

import {
  LoggerInterface,
  CacheInterface,
  UtilsServiceInterface,
  ExceptionServiceInterface,
  MonitorInterface,
  DataProviderInterface,
  StepInterface,
  ExpressionEngineInterface,
  ProviderRegistryInterface,
  SpreadsheetServiceInterface,
  InterfaceRegistry,
  validateInterface,
  implementsInterface
} from '../interfaces';

describe('Interface Definitions - Comprehensive Test Suite', () => {
  // ===================================================================
  // LoggerInterface
  // ===================================================================

  describe('LoggerInterface', () => {
    it('should have correct metadata', () => {
      expect(LoggerInterface.name).toBe('LoggerInterface');
      expect(LoggerInterface.requiredMethods).toEqual(['debug', 'info', 'warn', 'error']);
      expect(LoggerInterface.optionalMethods).toContain('getLevel');
      expect(LoggerInterface.optionalMethods).toContain('setLevel');
    });

    it('should validate a valid logger', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(LoggerInterface.validate(logger)).toBe(true);
    });

    it('should validate console as logger', () => {
      expect(LoggerInterface.validate(console)).toBe(true);
    });

    it('should reject null', () => {
      expect(() => LoggerInterface.validate(null)).toThrow('must be a non-null object');
    });

    it('should reject object missing debug method', () => {
      const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
      expect(() => LoggerInterface.validate(logger)).toThrow('missing required methods: debug');
    });

    it('should reject object with non-function method', () => {
      const logger = {
        debug: 'not a function',
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(() => LoggerInterface.validate(logger)).toThrow('missing required methods: debug');
    });
  });

  // ===================================================================
  // CacheInterface
  // ===================================================================

  describe('CacheInterface', () => {
    it('should have correct metadata', () => {
      expect(CacheInterface.name).toBe('CacheInterface');
      expect(CacheInterface.requiredMethods).toEqual(['get', 'put', 'remove']);
      expect(CacheInterface.optionalMethods).toContain('removeByPrefix');
    });

    it('should validate a valid cache', () => {
      const cache = {
        get: jest.fn(),
        put: jest.fn(),
        remove: jest.fn()
      };
      expect(CacheInterface.validate(cache)).toBe(true);
    });

    it('should reject cache missing get method', () => {
      const cache = { put: jest.fn(), remove: jest.fn() };
      expect(() => CacheInterface.validate(cache)).toThrow('missing required methods: get');
    });

    it('should accept cache with extra methods', () => {
      const cache = {
        get: jest.fn(),
        put: jest.fn(),
        remove: jest.fn(),
        removeByPrefix: jest.fn()
      };
      expect(CacheInterface.validate(cache)).toBe(true);
    });
  });

  // ===================================================================
  // UtilsServiceInterface
  // ===================================================================

  describe('UtilsServiceInterface', () => {
    it('should have correct metadata', () => {
      expect(UtilsServiceInterface.name).toBe('UtilsServiceInterface');
      expect(UtilsServiceInterface.requiredMethods).toEqual(['sleep']);
      expect(UtilsServiceInterface.optionalMethods).toContain('deepClone');
    });

    it('should validate a minimal utils service', () => {
      const utils = { sleep: jest.fn() };
      expect(UtilsServiceInterface.validate(utils)).toBe(true);
    });

    it('should reject utils missing sleep method', () => {
      const utils = { deepClone: jest.fn() };
      expect(() => UtilsServiceInterface.validate(utils)).toThrow(
        'missing required methods: sleep'
      );
    });
  });

  // ===================================================================
  // ExceptionServiceInterface
  // ===================================================================

  describe('ExceptionServiceInterface', () => {
    it('should have correct metadata', () => {
      expect(ExceptionServiceInterface.name).toBe('ExceptionServiceInterface');
      expect(ExceptionServiceInterface.requiredMethods).toEqual(['executeWithRetry']);
      expect(ExceptionServiceInterface.optionalMethods).toContain('executeWithBypass');
    });

    it('should validate a valid exception service', () => {
      const exceptionService = { executeWithRetry: jest.fn() };
      expect(ExceptionServiceInterface.validate(exceptionService)).toBe(true);
    });

    it('should reject service missing executeWithRetry', () => {
      const service = { executeWithBypass: jest.fn() };
      expect(() => ExceptionServiceInterface.validate(service)).toThrow(
        'missing required methods: executeWithRetry'
      );
    });
  });

  // ===================================================================
  // MonitorInterface
  // ===================================================================

  describe('MonitorInterface', () => {
    it('should have correct metadata', () => {
      expect(MonitorInterface.name).toBe('MonitorInterface');
      expect(MonitorInterface.requiredMethods).toEqual([
        'logJobStart',
        'logJobComplete',
        'logStepStart',
        'logStepComplete'
      ]);
    });

    it('should validate a valid monitor', () => {
      const monitor = {
        logJobStart: jest.fn(),
        logJobComplete: jest.fn(),
        logStepStart: jest.fn(),
        logStepComplete: jest.fn()
      };
      expect(MonitorInterface.validate(monitor)).toBe(true);
    });

    it('should reject monitor missing methods', () => {
      const monitor = {
        logJobStart: jest.fn(),
        logJobComplete: jest.fn()
      };
      expect(() => MonitorInterface.validate(monitor)).toThrow(
        'missing required methods: logStepStart, logStepComplete'
      );
    });
  });

  // ===================================================================
  // DataProviderInterface
  // ===================================================================

  describe('DataProviderInterface', () => {
    it('should have correct metadata', () => {
      expect(DataProviderInterface.name).toBe('DataProviderInterface');
      expect(DataProviderInterface.requiredMethods).toEqual(['provide']);
    });

    it('should validate a valid provider', () => {
      const provider = { provide: jest.fn() };
      expect(DataProviderInterface.validate(provider)).toBe(true);
    });

    it('should reject provider missing provide method', () => {
      const provider = { fetch: jest.fn() };
      expect(() => DataProviderInterface.validate(provider)).toThrow(
        'missing required methods: provide'
      );
    });
  });

  // ===================================================================
  // StepInterface
  // ===================================================================

  describe('StepInterface', () => {
    it('should have correct metadata', () => {
      expect(StepInterface.name).toBe('StepInterface');
      expect(StepInterface.requiredMethods).toEqual(['getName', 'execute']);
      expect(StepInterface.executeReturnSchema).toBeDefined();
    });

    it('should validate a valid step', () => {
      const step = {
        getName: () => 'TestStep',
        execute: jest.fn()
      };
      expect(StepInterface.validate(step)).toBe(true);
    });

    it('should reject step missing getName', () => {
      const step = { execute: jest.fn() };
      expect(() => StepInterface.validate(step)).toThrow('missing required methods: getName');
    });

    it('should reject step missing execute', () => {
      const step = { getName: () => 'Step' };
      expect(() => StepInterface.validate(step)).toThrow('missing required methods: execute');
    });
  });

  // ===================================================================
  // ExpressionEngineInterface
  // ===================================================================

  describe('ExpressionEngineInterface', () => {
    it('should have correct metadata', () => {
      expect(ExpressionEngineInterface.name).toBe('ExpressionEngineInterface');
      expect(ExpressionEngineInterface.requiredMethods).toEqual(['evaluate']);
    });

    it('should validate a valid engine', () => {
      const engine = { evaluate: jest.fn() };
      expect(ExpressionEngineInterface.validate(engine)).toBe(true);
    });
  });

  // ===================================================================
  // ProviderRegistryInterface
  // ===================================================================

  describe('ProviderRegistryInterface', () => {
    it('should have correct metadata', () => {
      expect(ProviderRegistryInterface.name).toBe('ProviderRegistryInterface');
      expect(ProviderRegistryInterface.requiredMethods).toEqual(['get', 'getRegisteredTypes']);
    });

    it('should validate a valid registry', () => {
      const registry = {
        get: jest.fn(),
        getRegisteredTypes: jest.fn()
      };
      expect(ProviderRegistryInterface.validate(registry)).toBe(true);
    });
  });

  // ===================================================================
  // SpreadsheetServiceInterface
  // ===================================================================

  describe('SpreadsheetServiceInterface', () => {
    it('should have correct metadata', () => {
      expect(SpreadsheetServiceInterface.name).toBe('SpreadsheetServiceInterface');
      expect(SpreadsheetServiceInterface.requiredMethods).toEqual(['getSheetData']);
    });

    it('should validate a valid service', () => {
      const service = { getSheetData: jest.fn() };
      expect(SpreadsheetServiceInterface.validate(service)).toBe(true);
    });
  });

  // ===================================================================
  // InterfaceRegistry
  // ===================================================================

  describe('InterfaceRegistry', () => {
    it('should contain all interfaces', () => {
      const expectedInterfaces = [
        'LoggerInterface',
        'CacheInterface',
        'UtilsServiceInterface',
        'ExceptionServiceInterface',
        'MonitorInterface',
        'DataProviderInterface',
        'StepInterface',
        'ExpressionEngineInterface',
        'ProviderRegistryInterface',
        'SpreadsheetServiceInterface'
      ];

      expectedInterfaces.forEach((name) => {
        expect(InterfaceRegistry[name]).toBeDefined();
        expect(InterfaceRegistry[name].name).toBe(name);
      });
    });

    it('should have 10 interfaces', () => {
      expect(Object.keys(InterfaceRegistry)).toHaveLength(10);
    });
  });

  // ===================================================================
  // validateInterface()
  // ===================================================================

  describe('validateInterface()', () => {
    it('should validate object against named interface', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(validateInterface(logger, 'LoggerInterface')).toBe(true);
    });

    it('should throw for invalid object', () => {
      const invalid = { debug: jest.fn() };
      expect(() => validateInterface(invalid, 'LoggerInterface')).toThrow(
        'missing required methods'
      );
    });

    it('should throw for unknown interface', () => {
      expect(() => validateInterface({}, 'UnknownInterface')).toThrow(
        'Unknown interface: UnknownInterface'
      );
    });

    it('should validate different interfaces', () => {
      expect(validateInterface({ sleep: jest.fn() }, 'UtilsServiceInterface')).toBe(true);
      expect(
        validateInterface({ get: jest.fn(), put: jest.fn(), remove: jest.fn() }, 'CacheInterface')
      ).toBe(true);
    });
  });

  // ===================================================================
  // implementsInterface()
  // ===================================================================

  describe('implementsInterface()', () => {
    it('should return true for valid implementation', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(implementsInterface(logger, 'LoggerInterface')).toBe(true);
    });

    it('should return false for invalid implementation', () => {
      const invalid = { debug: jest.fn() };
      expect(implementsInterface(invalid, 'LoggerInterface')).toBe(false);
    });

    it('should return false for unknown interface', () => {
      expect(implementsInterface({}, 'UnknownInterface')).toBe(false);
    });

    it('should return false for null', () => {
      expect(implementsInterface(null, 'LoggerInterface')).toBe(false);
    });
  });

  // ===================================================================
  // ValidationUtils Integration
  // ===================================================================

  describe('ValidationUtils Integration', () => {
    // Import ValidationUtils to test integration
    const { ValidationUtils } = require('../ValidationUtils');

    it('should validate interface via ValidationUtils', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(ValidationUtils.validateInterface(logger, 'LoggerInterface', 'Test')).toBe(true);
    });

    it('should validate optional interface', () => {
      expect(ValidationUtils.validateInterface(null, 'CacheInterface', 'Test', false)).toBe(true);
      expect(ValidationUtils.validateInterface(undefined, 'CacheInterface', 'Test', false)).toBe(
        true
      );
    });

    it('should throw for invalid interface via ValidationUtils', () => {
      expect(() => ValidationUtils.validateInterface({}, 'LoggerInterface', 'MyService')).toThrow(
        'MyService: Object does not implement LoggerInterface'
      );
    });

    it('should throw for unknown interface via ValidationUtils', () => {
      expect(() => ValidationUtils.validateInterface({}, 'FakeInterface', 'Test')).toThrow(
        'Test: Unknown interface: FakeInterface'
      );
    });

    it('should check interface implementation via implementsInterface', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(ValidationUtils.implementsInterface(logger, 'LoggerInterface')).toBe(true);
      expect(ValidationUtils.implementsInterface({}, 'LoggerInterface')).toBe(false);
    });

    it('should return available interfaces', () => {
      const interfaces = ValidationUtils.getAvailableInterfaces();
      expect(interfaces).toContain('LoggerInterface');
      expect(interfaces).toContain('CacheInterface');
      expect(interfaces.length).toBe(10);
    });
  });
});
