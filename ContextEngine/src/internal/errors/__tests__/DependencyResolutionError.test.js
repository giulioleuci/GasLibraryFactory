/**
 * @file ContextEngine/src/internal/errors/__tests__/DependencyResolutionError.test.js
 * @description Tests for DependencyResolutionError
 * @version 1.0.0
 */

import { describe, it, expect } from '@jest/globals';
import { ContextEngineError } from '../ContextEngineError';
import { DependencyResolutionError } from '../DependencyResolutionError';

describe('DependencyResolutionError', () => {
  describe('Constructor', () => {
    it('should create error with message and context', () => {
      const context = {
        dependency: '@userId',
        availableParams: ['startDate', 'endDate']
      };
      const error = new DependencyResolutionError('Cannot resolve dependency', context);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ContextEngineError);
      expect(error).toBeInstanceOf(DependencyResolutionError);
      expect(error.message).toBe('Cannot resolve dependency');
      expect(error.name).toBe('DependencyResolutionError');
      expect(error.context).toEqual(context);
    });

    it('should set dependency property from context', () => {
      const context = { dependency: '@userId' };
      const error = new DependencyResolutionError('Cannot resolve', context);

      expect(error.dependency).toBe('@userId');
    });

    it('should set providerName property from context', () => {
      const context = { dependency: '$userData.id', providerName: 'UserDataProvider' };
      const error = new DependencyResolutionError('Cannot resolve', context);

      expect(error.providerName).toBe('UserDataProvider');
      expect(error.dependency).toBe('$userData.id');
    });

    it('should preserve availableParams, availableProviders, propertyPath, and actualStructure in context', () => {
      const context = {
        dependency: '$userData.id',
        providerName: 'UserDataProvider',
        availableParams: ['userId'],
        availableProviders: ['UserProvider', 'SettingsProvider'],
        propertyPath: 'id',
        actualStructure: { user: { email: 'test@example.com' } }
      };
      const error = new DependencyResolutionError('Resolution failed', context);

      expect(error.context.availableParams).toEqual(['userId']);
      expect(error.context.availableProviders).toEqual(['UserProvider', 'SettingsProvider']);
      expect(error.context.propertyPath).toBe('id');
      expect(error.context.actualStructure).toEqual({ user: { email: 'test@example.com' } });
    });

    it('should handle undefined dependency', () => {
      const context = { providerName: 'TestProvider' };
      const error = new DependencyResolutionError('Cannot resolve', context);

      expect(error.dependency).toBeUndefined();
      expect(error.providerName).toBe('TestProvider');
    });

    it('should handle empty context', () => {
      const error = new DependencyResolutionError('Cannot resolve');

      expect(error.dependency).toBeUndefined();
      expect(error.providerName).toBeUndefined();
      expect(error.context).toEqual({});
    });

    it('should preserve additional context properties', () => {
      const context = {
        dependency: '@missing',
        providerName: 'TestProvider',
        availableParams: ['param1', 'param2'],
        attemptedValue: null
      };
      const error = new DependencyResolutionError('Cannot resolve', context);

      expect(error.context.availableParams).toEqual(['param1', 'param2']);
      expect(error.context.attemptedValue).toBeNull();
    });
  });

  describe('Inheritance', () => {
    it('should inherit from ContextEngineError', () => {
      const error = new DependencyResolutionError('Test');
      expect(error instanceof ContextEngineError).toBe(true);
    });

    it('should have correct error name', () => {
      const error = new DependencyResolutionError('Test');
      expect(error.name).toBe('DependencyResolutionError');
    });

    it('should use toString() from parent', () => {
      const context = { dependency: '@userId' };
      const error = new DependencyResolutionError('Cannot resolve', context);
      const result = error.toString();

      expect(result).toContain('DependencyResolutionError: Cannot resolve');
      expect(result).toContain('"dependency": "@userId"');
    });
  });
});
