/**
 * @file RoleResolutionLib/src/__tests__/core/Actor.test.js
 * @description Unit tests for Actor value object
 */

import { Actor } from '../../core/Actor.js';
import { ActorType } from '../../core/ActorType.js';

describe('Actor', () => {
  describe('Constructor', () => {
    it('should create a valid actor with all fields', () => {
      const actor = new Actor('user-123', ActorType.PERSON, 'john.doe@example.com', 'John Doe', {
        department: 'Engineering'
      });

      expect(actor.id).toBe('user-123');
      expect(actor.type).toBe(ActorType.PERSON);
      expect(actor.identifier).toBe('john.doe@example.com');
      expect(actor.displayName).toBe('John Doe');
      expect(actor.metadata).toEqual({ department: 'Engineering' });
    });

    it('should throw error for missing id', () => {
      expect(() => new Actor(null, ActorType.PERSON, 'email', 'Name')).toThrow(
        'Actor id is required'
      );
    });

    it('should throw error for invalid type', () => {
      expect(() => new Actor('id', 'INVALID', 'email', 'Name')).toThrow('Invalid actor type');
    });

    it('should throw error for missing identifier', () => {
      expect(() => new Actor('id', ActorType.PERSON, null, 'Name')).toThrow(
        'Actor identifier is required'
      );
    });

    it('should throw error for missing displayName', () => {
      expect(() => new Actor('id', ActorType.PERSON, 'email', null)).toThrow(
        'Actor displayName is required'
      );
    });

    it('should be immutable', () => {
      const actor = new Actor('id', ActorType.PERSON, 'email', 'Name');

      expect(() => {
        actor.id = 'other';
      }).toThrow();
      expect(() => {
        actor.type = ActorType.SYSTEM;
      }).toThrow();
    });
  });

  describe('Static Factory Methods', () => {
    it('should create person actor', () => {
      const actor = Actor.person('user-123', 'john@example.com', 'John Doe');

      expect(actor.type).toBe(ActorType.PERSON);
      expect(actor.isPerson()).toBe(true);
    });

    it('should create system actor', () => {
      const actor = Actor.system('bot-001', 'workflow-engine', 'Workflow Bot');

      expect(actor.type).toBe(ActorType.SYSTEM);
      expect(actor.isSystem()).toBe(true);
    });

    it('should create group actor', () => {
      const actor = Actor.group('group-sales', 'sales@example.com', 'Sales Team');

      expect(actor.type).toBe(ActorType.GROUP);
      expect(actor.isGroup()).toBe(true);
    });
  });

  describe('Type checks', () => {
    it('should identify person type', () => {
      const actor = Actor.person('id', 'email', 'Name');

      expect(actor.isPerson()).toBe(true);
      expect(actor.isSystem()).toBe(false);
      expect(actor.isGroup()).toBe(false);
    });

    it('should identify system type', () => {
      const actor = Actor.system('id', 'service', 'Name');

      expect(actor.isPerson()).toBe(false);
      expect(actor.isSystem()).toBe(true);
      expect(actor.isGroup()).toBe(false);
    });

    it('should identify group type', () => {
      const actor = Actor.group('id', 'group', 'Name');

      expect(actor.isPerson()).toBe(false);
      expect(actor.isSystem()).toBe(false);
      expect(actor.isGroup()).toBe(true);
    });
  });

  describe('equals()', () => {
    it('should return true for same id', () => {
      const actor1 = Actor.person('user-123', 'john@example.com', 'John');
      const actor2 = Actor.person('user-123', 'john@example.com', 'John Doe');

      expect(actor1.equals(actor2)).toBe(true);
    });

    it('should return false for different id', () => {
      const actor1 = Actor.person('user-123', 'john@example.com', 'John');
      const actor2 = Actor.person('user-456', 'john@example.com', 'John');

      expect(actor1.equals(actor2)).toBe(false);
    });

    it('should return false for non-Actor', () => {
      const actor = Actor.person('user-123', 'email', 'Name');

      expect(actor.equals(null)).toBe(false);
      expect(actor.equals({ id: 'user-123' })).toBe(false);
    });
  });

  describe('Metadata', () => {
    it('should get metadata value', () => {
      const actor = Actor.person('id', 'email', 'Name', { role: 'admin' });

      expect(actor.getMetadata('role')).toBe('admin');
    });

    it('should return default for missing key', () => {
      const actor = Actor.person('id', 'email', 'Name');

      expect(actor.getMetadata('missing', 'default')).toBe('default');
    });

    it('should create new actor with additional metadata', () => {
      const original = Actor.person('id', 'email', 'Name', { a: 1 });
      const enriched = original.withMetadata({ b: 2 });

      expect(enriched.getMetadata('a')).toBe(1);
      expect(enriched.getMetadata('b')).toBe(2);
      expect(original.getMetadata('b')).toBeNull();
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const actor = Actor.person('user-123', 'john@example.com', 'John Doe', { dept: 'Eng' });
      const json = actor.toJSON();

      expect(json).toEqual({
        id: 'user-123',
        type: 'PERSON',
        identifier: 'john@example.com',
        displayName: 'John Doe',
        metadata: { dept: 'Eng' }
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'user-123',
        type: 'PERSON',
        identifier: 'john@example.com',
        displayName: 'John Doe'
      };

      const actor = Actor.fromJSON(json);

      expect(actor.id).toBe('user-123');
      expect(actor.type).toBe(ActorType.PERSON);
    });

    it('should round-trip through JSON', () => {
      const original = Actor.person('user-123', 'john@example.com', 'John Doe', { role: 'admin' });
      const json = original.toJSON();
      const restored = Actor.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
      expect(restored.getMetadata('role')).toBe('admin');
    });
  });

  describe('toString()', () => {
    it('should format actor string', () => {
      const actor = Actor.person('user-123', 'john@example.com', 'John Doe');
      const str = actor.toString();

      expect(str).toContain('PERSON');
      expect(str).toContain('user-123');
      expect(str).toContain('John Doe');
      expect(str).toContain('john@example.com');
    });
  });
});
