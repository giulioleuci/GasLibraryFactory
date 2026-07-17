import { RoleRegistry } from '../../registry/RoleRegistry.js';
import { Role } from '../../core/Role.js';
import { ScopeType } from '../../core/ScopeType.js';
import {
  RoleNotFoundError,
  RoleValidationError
} from '../../internal/errors/RoleResolutionError.js';

describe('RoleRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new RoleRegistry();
  });

  describe('constructor', () => {
    it('initializes with a provided logger', () => {
      const logger = { warn: jest.fn(), debug: jest.fn() };
      const reg = new RoleRegistry({ logger });
      expect(reg._logger).toBe(logger);
    });

    it('initializes with initial roles', () => {
      const role = new Role({ id: 'r1', name: 'Role 1' });
      const reg = new RoleRegistry({ initialRoles: [role] });
      expect(reg.has('r1')).toBe(true);
    });
  });

  describe('register', () => {
    it('registers a valid Role instance', () => {
      const role = new Role({ id: 'r1', name: 'Role 1' });
      const registered = registry.register(role);
      expect(registered).toBe(role);
      expect(registry.has('r1')).toBe(true);
      expect(registry.get('r1')).toBe(role);
    });

    it('registers a role from a definition object', () => {
      const definition = { id: 'r1', name: 'Role 1' };
      const registered = registry.register(definition);
      expect(registered).toBeInstanceOf(Role);
      expect(registered.id).toBe('r1');
      expect(registry.has('r1')).toBe(true);
    });

    it('throws RoleValidationError for invalid definition', () => {
      const invalidDef = { id: 'r1' }; // missing name
      expect(() => registry.register(invalidDef)).toThrow(RoleValidationError);
    });

    it('warns when overwriting an existing role', () => {
      const logger = { warn: jest.fn(), debug: jest.fn() };
      const reg = new RoleRegistry({ logger });
      const role1 = new Role({ id: 'r1', name: 'Role 1' });
      const role2 = new Role({ id: 'r1', name: 'Role 1 Updated' });

      reg.register(role1);
      reg.register(role2);

      expect(logger.warn).toHaveBeenCalledWith('Overwriting existing role: r1');
      expect(reg.get('r1').name).toBe('Role 1 Updated');
    });
  });

  describe('registerAll', () => {
    it('registers multiple roles', () => {
      const roles = [new Role({ id: 'r1', name: 'Role 1' }), { id: 'r2', name: 'Role 2' }];
      registry.registerAll(roles);
      expect(registry.size()).toBe(2);
      expect(registry.has('r1')).toBe(true);
      expect(registry.has('r2')).toBe(true);
    });

    it('throws if not given an array', () => {
      expect(() => registry.registerAll({})).toThrow('roles must be an array');
    });
  });

  describe('get', () => {
    it('returns the role if it exists', () => {
      const role = new Role({ id: 'r1', name: 'Role 1' });
      registry.register(role);
      expect(registry.get('r1')).toBe(role);
    });

    it('throws RoleNotFoundError if role does not exist', () => {
      expect(() => registry.get('nonexistent')).toThrow(RoleNotFoundError);
    });
  });

  describe('getOrNull', () => {
    it('returns the role if it exists', () => {
      const role = new Role({ id: 'r1', name: 'Role 1' });
      registry.register(role);
      expect(registry.getOrNull('r1')).toBe(role);
    });

    it('returns null if role does not exist', () => {
      expect(registry.getOrNull('nonexistent')).toBeNull();
    });
  });

  describe('has', () => {
    it('returns true if role exists', () => {
      registry.register({ id: 'r1', name: 'Role 1' });
      expect(registry.has('r1')).toBe(true);
    });

    it('returns false if role does not exist', () => {
      expect(registry.has('r1')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('removes an existing role and returns true', () => {
      registry.register({ id: 'r1', name: 'Role 1' });
      const removed = registry.unregister('r1');
      expect(removed).toBe(true);
      expect(registry.has('r1')).toBe(false);
    });

    it('returns false if role does not exist', () => {
      expect(registry.unregister('nonexistent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('returns all registered roles', () => {
      const role1 = registry.register({ id: 'r1', name: 'Role 1' });
      const role2 = registry.register({ id: 'r2', name: 'Role 2' });
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(role1);
      expect(all).toContain(role2);
    });
  });

  describe('getAllIds', () => {
    it('returns all registered role IDs', () => {
      registry.register({ id: 'r1', name: 'Role 1' });
      registry.register({ id: 'r2', name: 'Role 2' });
      const ids = registry.getAllIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('r1');
      expect(ids).toContain('r2');
    });
  });

  describe('size', () => {
    it('returns the number of registered roles', () => {
      expect(registry.size()).toBe(0);
      registry.register({ id: 'r1', name: 'Role 1' });
      expect(registry.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('removes all registered roles', () => {
      registry.register({ id: 'r1', name: 'Role 1' });
      registry.clear();
      expect(registry.size()).toBe(0);
    });
  });

  describe('find', () => {
    it('returns roles matching the predicate', () => {
      const role1 = registry.register({ id: 'r1', name: 'Role 1', allowsDelegation: true });
      const role2 = registry.register({ id: 'r2', name: 'Role 2', allowsDelegation: false });
      const found = registry.find((r) => r.allowsDelegation);
      expect(found).toHaveLength(1);
      expect(found[0]).toBe(role1);
    });
  });

  describe('findByScopeType', () => {
    it('returns roles matching the scope type', () => {
      const role1 = registry.register({ id: 'r1', name: 'Role 1', scopeType: ScopeType.GLOBAL });
      const role2 = registry.register({ id: 'r2', name: 'Role 2', scopeType: ScopeType.RESOURCE });
      const found = registry.findByScopeType(ScopeType.RESOURCE);
      expect(found).toHaveLength(1);
      expect(found[0]).toBe(role2);
    });
  });

  describe('findDelegatable', () => {
    it('returns roles that allow delegation', () => {
      const role1 = registry.register({ id: 'r1', name: 'Role 1', allowsDelegation: true });
      const role2 = registry.register({ id: 'r2', name: 'Role 2', allowsDelegation: false });
      const found = registry.findDelegatable();
      expect(found).toHaveLength(1);
      expect(found[0]).toBe(role1);
    });
  });

  describe('toJSON', () => {
    it('serializes to a JSON object', () => {
      registry.register({ id: 'r1', name: 'Role 1' });
      const json = registry.toJSON();
      expect(json.roles).toBeDefined();
      expect(json.roles.r1).toBeDefined();
      expect(json.roles.r1.name).toBe('Role 1');
    });
  });

  describe('fromJSON', () => {
    it('hydrates a new registry from a JSON object', () => {
      const json = {
        roles: {
          r1: { id: 'r1', name: 'Role 1' }
        }
      };
      const reg = RoleRegistry.fromJSON(json);
      expect(reg.size()).toBe(1);
      expect(reg.has('r1')).toBe(true);
      expect(reg.get('r1').name).toBe('Role 1');
    });

    it('throws error for invalid JSON object', () => {
      expect(() => RoleRegistry.fromJSON(null)).toThrow('Invalid registry object');
      expect(() => RoleRegistry.fromJSON('string')).toThrow('Invalid registry object');
    });
  });
});
