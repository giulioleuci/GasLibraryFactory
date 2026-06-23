/**
 * @file ContextEngine/src/__tests__/ContextInterceptor.test.js
 * @description Unit tests for ContextInterceptor base class.
 */

import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { MockFactory } from '../../../test/fakes';

describe('ContextInterceptor', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  describe('constructor', () => {
    it('should create instance with valid logger', () => {
      const interceptor = new TestInterceptor(mocks.logger);
      expect(interceptor).toBeInstanceOf(ContextInterceptor);
      expect(interceptor.logger).toBe(mocks.logger);
    });

    it('should throw error if logger is null', () => {
      expect(() => new TestInterceptor(null)).toThrow(
        'ContextInterceptor: logger is required and must be an object'
      );
    });

    it('should throw error if logger is not an object', () => {
      expect(() => new TestInterceptor('not an object')).toThrow(
        'ContextInterceptor: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing debug method', () => {
      const invalidLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(() => new TestInterceptor(invalidLogger)).toThrow(
        'ContextInterceptor: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing error method', () => {
      const invalidLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
      };
      expect(() => new TestInterceptor(invalidLogger)).toThrow(
        'ContextInterceptor: logger must have debug, info, warn, and error methods'
      );
    });
  });

  describe('_shouldIntercept', () => {
    it('should return true by default', () => {
      const interceptor = new TestInterceptor(mocks.logger);
      const result = interceptor._shouldIntercept('test', {}, {}, {});
      expect(result).toBe(true);
    });

    it('should be overridable by subclass', () => {
      const interceptor = new ConditionalTestInterceptor(mocks.logger);
      expect(interceptor._shouldIntercept('test', {}, {}, { enabled: true })).toBe(true);
      expect(interceptor._shouldIntercept('test', {}, {}, { enabled: false })).toBe(false);
    });
  });

  describe('_performIntercept', () => {
    it('should throw error if not implemented by subclass', () => {
      class AbstractInterceptor extends ContextInterceptor {
        // Intentionally not implementing _performIntercept
      }
      const interceptor = new AbstractInterceptor(mocks.logger);
      expect(() => interceptor._performIntercept('test', {}, {}, {})).toThrow(
        'ContextInterceptor._performIntercept must be implemented by subclass'
      );
    });

    it('should be called by intercept method', () => {
      const interceptor = new TestInterceptor(mocks.logger);
      const spy = jest.spyOn(interceptor, '_performIntercept');

      interceptor.intercept('test', { data: 'test' }, {}, {});

      expect(spy).toHaveBeenCalledWith('test', { data: 'test' }, {}, {});
    });
  });

  describe('intercept', () => {
    let interceptor;

    beforeEach(() => {
      interceptor = new TestInterceptor(mocks.logger);
    });

    it('should validate name parameter', () => {
      expect(() => interceptor.intercept(null, {}, {}, {})).toThrow(
        'ContextInterceptor.intercept: name is required and must be a string'
      );
      expect(() => interceptor.intercept('', {}, {}, {})).toThrow(
        'ContextInterceptor.intercept: name is required and must be a string'
      );
      expect(() => interceptor.intercept(123, {}, {}, {})).toThrow(
        'ContextInterceptor.intercept: name is required and must be a string'
      );
    });

    it('should validate context parameter', () => {
      expect(() => interceptor.intercept('test', {}, null, {})).toThrow(
        'ContextInterceptor.intercept: context is required and must be an object'
      );
      expect(() => interceptor.intercept('test', {}, 'invalid', {})).toThrow(
        'ContextInterceptor.intercept: context is required and must be an object'
      );
    });

    it('should validate options parameter', () => {
      expect(() => interceptor.intercept('test', {}, {}, 'invalid')).toThrow(
        'ContextInterceptor.intercept: options must be an object or null'
      );
    });

    it('should accept null options', () => {
      const result = interceptor.intercept('test', { data: 'test' }, {}, null);
      expect(result).toEqual({ data: 'test', intercepted: true });
    });

    it('should call _shouldIntercept before _performIntercept', () => {
      const callOrder = [];
      jest.spyOn(interceptor, '_shouldIntercept').mockImplementation((...args) => {
        callOrder.push('shouldIntercept');
        return true;
      });
      jest.spyOn(interceptor, '_performIntercept').mockImplementation((...args) => {
        callOrder.push('performIntercept');
        return { data: 'test', intercepted: true };
      });

      interceptor.intercept('test', { data: 'test' }, {}, {});

      expect(callOrder).toEqual(['shouldIntercept', 'performIntercept']);
    });

    it('should return original data if _shouldIntercept returns false', () => {
      const conditionalInterceptor = new ConditionalTestInterceptor(mocks.logger);
      const data = { original: 'data' };

      const result = conditionalInterceptor.intercept('test', data, {}, { enabled: false });

      expect(result).toBe(data);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        '[test] Interceptor skipped (condition not met)'
      );
    });

    it('should call _performIntercept if _shouldIntercept returns true', () => {
      const data = { original: 'data' };

      const result = interceptor.intercept('test', data, {}, {});

      expect(result).toEqual({ original: 'data', intercepted: true });
    });

    it('should log debug messages during interception', () => {
      interceptor.intercept('test', { data: 'test' }, {}, {});

      expect(mocks.logger.debug).toHaveBeenCalledWith('[test] Intercepting data...');
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[test\] Interception completed in \d+ms/)
      );
    });

    it('should handle errors during interception', () => {
      class ErrorInterceptor extends ContextInterceptor {
        _performIntercept() {
          throw new Error('Interception failed');
        }
      }
      const errorInterceptor = new ErrorInterceptor(mocks.logger);

      expect(() => errorInterceptor.intercept('test', {}, {}, {})).toThrow(
        "Interceptor failed for 'test': Interception failed"
      );
      expect(mocks.logger.error).toHaveBeenCalledWith(
        '[test] Interception failed: Interception failed'
      );
    });

    it('should pass all parameters to _performIntercept', () => {
      const spy = jest.spyOn(interceptor, '_performIntercept');
      const name = 'provider';
      const data = { test: 'data' };
      const context = { existing: 'context' };
      const options = { flag: true };

      interceptor.intercept(name, data, context, options);

      expect(spy).toHaveBeenCalledWith(name, data, context, options);
    });

    it('should use default empty object for options if not provided', () => {
      const spy = jest.spyOn(interceptor, '_shouldIntercept');

      interceptor.intercept('test', {}, {});

      expect(spy).toHaveBeenCalledWith('test', {}, {}, {});
    });
  });

  describe('logger getter', () => {
    it('should return logger instance', () => {
      const interceptor = new TestInterceptor(mocks.logger);
      expect(interceptor.logger).toBe(mocks.logger);
    });
  });
});

// Test helper classes
class TestInterceptor extends ContextInterceptor {
  _performIntercept(name, data, context, options) {
    return { ...data, intercepted: true };
  }
}

class ConditionalTestInterceptor extends ContextInterceptor {
  _shouldIntercept(name, data, context, options) {
    return options.enabled === true;
  }

  _performIntercept(name, data, context, options) {
    return { ...data, intercepted: true };
  }
}
