import { BaseError } from '@CoreUtilsLib';
import {
  RoleResolutionError,
  RoleNotFoundError,
  NoActorFoundError,
  ActorNotFoundError,
  CircularDelegationError,
  InvalidScopeError,
  DelegationDepthExceededError,
  RoleValidationError
} from '../../../internal/errors/RoleResolutionError.js';

describe('RoleResolutionError classes', () => {
  describe('RoleResolutionError', () => {
    it('should correctly inherit and assign properties', () => {
      const originalError = new Error('Original');
      const error = new RoleResolutionError('Test message', { meta: 'data' }, originalError);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(RoleResolutionError);

      expect(error.name).toBe('RoleResolutionError');
      expect(error.message).toBe('Test message');
      expect(error.context).toEqual({ meta: 'data' });
      expect(error.originalError).toBe(originalError);
    });

    it('should handle default parameters', () => {
      const error = new RoleResolutionError('Test message');
      expect(error.name).toBe('RoleResolutionError');
      expect(error.message).toBe('Test message');
      expect(error.context).toEqual({});
      expect(error.originalError).toBeNull();
    });
  });

  describe('RoleNotFoundError', () => {
    it('should assign message and context correctly', () => {
      const error = new RoleNotFoundError('role-1', { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('RoleNotFoundError');
      expect(error.message).toBe('Role not found: role-1');
      expect(error.roleId).toBe('role-1');
      expect(error.context).toEqual({ extra: 'info', roleId: 'role-1' });
    });
  });

  describe('NoActorFoundError', () => {
    it('should assign message and context with scope', () => {
      const scope = { toString: () => 'TestScope' };
      const error = new NoActorFoundError('role-2', scope, { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('NoActorFoundError');
      expect(error.message).toBe('No actor found for role role-2 in scope TestScope');
      expect(error.roleId).toBe('role-2');
      expect(error.scope).toBe(scope);
      expect(error.context).toEqual({ extra: 'info', roleId: 'role-2', scope });
    });

    it('should assign message and context without scope', () => {
      const error = new NoActorFoundError('role-2');

      expect(error.name).toBe('NoActorFoundError');
      expect(error.message).toBe('No actor found for role role-2');
      expect(error.roleId).toBe('role-2');
      expect(error.scope).toBeNull();
      expect(error.context).toEqual({ roleId: 'role-2', scope: null });
    });

    it('should assign message and context with scope without toString', () => {
      const scope = Object.create(null);
      scope.id = 1;
      const error = new NoActorFoundError('role-2', scope);

      expect(error.name).toBe('NoActorFoundError');
      expect(error.message).toBe('No actor found for role role-2 in scope {"id":1}');
      expect(error.roleId).toBe('role-2');
      expect(error.scope).toBe(scope);
      expect(error.context).toEqual({ roleId: 'role-2', scope });
    });
  });

  describe('ActorNotFoundError', () => {
    it('should assign message and context correctly', () => {
      const error = new ActorNotFoundError('actor-1', { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('ActorNotFoundError');
      expect(error.message).toBe('Actor not found: actor-1');
      expect(error.actorId).toBe('actor-1');
      expect(error.context).toEqual({ extra: 'info', actorId: 'actor-1' });
    });
  });

  describe('CircularDelegationError', () => {
    it('should assign message and context with chain', () => {
      const chain = ['actor-1', 'actor-2', 'actor-1'];
      const error = new CircularDelegationError('actor-1', chain, { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('CircularDelegationError');
      expect(error.message).toBe('Circular delegation detected for actor: actor-1 (chain: actor-1 -> actor-2 -> actor-1)');
      expect(error.actorId).toBe('actor-1');
      expect(error.chain).toBe(chain);
      expect(error.context).toEqual({ extra: 'info', actorId: 'actor-1', chain });
    });

    it('should assign message and context without chain', () => {
      const error = new CircularDelegationError('actor-1');

      expect(error.name).toBe('CircularDelegationError');
      expect(error.message).toBe('Circular delegation detected for actor: actor-1');
      expect(error.actorId).toBe('actor-1');
      expect(error.chain).toEqual([]);
      expect(error.context).toEqual({ actorId: 'actor-1', chain: [] });
    });
  });

  describe('InvalidScopeError', () => {
    it('should assign message and context correctly', () => {
      const error = new InvalidScopeError('role-3', 'LOCAL', 'GLOBAL', { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('InvalidScopeError');
      expect(error.message).toBe('Invalid scope for role role-3: expected GLOBAL, got LOCAL');
      expect(error.roleId).toBe('role-3');
      expect(error.providedScopeType).toBe('LOCAL');
      expect(error.expectedScopeType).toBe('GLOBAL');
      expect(error.context).toEqual({ extra: 'info', roleId: 'role-3', providedScopeType: 'LOCAL', expectedScopeType: 'GLOBAL' });
    });
  });

  describe('DelegationDepthExceededError', () => {
    it('should assign message and context correctly', () => {
      const error = new DelegationDepthExceededError(11, 10, { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('DelegationDepthExceededError');
      expect(error.message).toBe('Delegation chain depth (11) exceeds maximum (10)');
      expect(error.actualDepth).toBe(11);
      expect(error.maxDepth).toBe(10);
      expect(error.context).toEqual({ extra: 'info', actualDepth: 11, maxDepth: 10 });
    });
  });

  describe('RoleValidationError', () => {
    it('should assign message and context correctly', () => {
      const validationErrors = ['Missing field X', 'Invalid type Y'];
      const error = new RoleValidationError('Validation failed', validationErrors, { extra: 'info' });

      expect(error).toBeInstanceOf(RoleResolutionError);
      expect(error.name).toBe('RoleValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.validationErrors).toBe(validationErrors);
      expect(error.context).toEqual({ extra: 'info', validationErrors });
    });

    it('should assign message and context without detailed errors', () => {
      const error = new RoleValidationError('Validation failed');

      expect(error.name).toBe('RoleValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.validationErrors).toEqual([]);
      expect(error.context).toEqual({ validationErrors: [] });
    });
  });
});
