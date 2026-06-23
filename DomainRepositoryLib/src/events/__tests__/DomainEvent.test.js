// ===================================================================
// FILE: DomainRepositoryLib/src/events/__tests__/DomainEvent.test.js
// ===================================================================

import {
  DomainEvent,
  EntityCreatedEvent,
  EntityUpdatedEvent,
  EntityDeletedEvent
} from '../DomainEvent';

describe('DomainEvent - Comprehensive Test Suite', () => {
  describe('DomainEvent Base Class', () => {
    it('should create event with name and payload', () => {
      const payload = { id: 'ID1', data: 'test' };
      const event = new DomainEvent('TestEvent', payload);

      expect(event.eventName).toBe('TestEvent');
      expect(event.getPayload()).toEqual(payload);
    });

    it('should generate timestamp', () => {
      const event = new DomainEvent('TestEvent', {});

      expect(event.occurredAt).toBeDefined();
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it('should handle null payload', () => {
      const event = new DomainEvent('TestEvent', null);

      expect(event.getPayload()).toBeNull();
    });

    it('should handle undefined payload', () => {
      const event = new DomainEvent('TestEvent');

      expect(event.getPayload()).toBeUndefined();
    });

    it('should provide event name getter', () => {
      const event = new DomainEvent('TestEvent', {});

      expect(event.getEventName()).toBe('TestEvent');
    });

    it('should provide timestamp getter', () => {
      const event = new DomainEvent('TestEvent', {});

      expect(event.getOccurredAt()).toBe(event.occurredAt);
    });
  });

  describe('EntityCreatedEvent', () => {
    it('should create event with entity type and ID', () => {
      const event = new EntityCreatedEvent('Customer', 'CUST123');

      expect(event.eventName).toBe('EntityCreated');
      expect(event.getPayload().entityType).toBe('Customer');
      expect(event.getPayload().entityId).toBe('CUST123');
    });

    it('should include entity data', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const event = new EntityCreatedEvent('Customer', 'CUST123', data);

      expect(event.getPayload().entityData).toEqual(data);
    });

    it('should work without entity data', () => {
      const event = new EntityCreatedEvent('Customer', 'CUST123');

      expect(event.getPayload().entityData).toBeUndefined();
    });
  });

  describe('EntityUpdatedEvent', () => {
    it('should create event with entity type and ID', () => {
      const event = new EntityUpdatedEvent('Customer', 'CUST123');

      expect(event.eventName).toBe('EntityUpdated');
      expect(event.getPayload().entityType).toBe('Customer');
      expect(event.getPayload().entityId).toBe('CUST123');
    });

    it('should include changes', () => {
      const changes = { name: 'New Name', email: 'new@example.com' };
      const event = new EntityUpdatedEvent('Customer', 'CUST123', changes);

      expect(event.getPayload().changes).toEqual(changes);
    });

    it('should work without changes', () => {
      const event = new EntityUpdatedEvent('Customer', 'CUST123');

      expect(event.getPayload().changes).toBeUndefined();
    });
  });

  describe('EntityDeletedEvent', () => {
    it('should create event with entity type and ID', () => {
      const event = new EntityDeletedEvent('Customer', 'CUST123');

      expect(event.eventName).toBe('EntityDeleted');
      expect(event.getPayload().entityType).toBe('Customer');
      expect(event.getPayload().entityId).toBe('CUST123');
    });

    it('should include reason', () => {
      const event = new EntityDeletedEvent('Customer', 'CUST123', 'Account closed');

      expect(event.getPayload().reason).toBe('Account closed');
    });

    it('should work without reason', () => {
      const event = new EntityDeletedEvent('Customer', 'CUST123');

      expect(event.getPayload().reason).toBeUndefined();
    });
  });

  describe('Event Serialization', () => {
    it('should be JSON serializable', () => {
      const event = new EntityCreatedEvent('Customer', 'CUST123', { name: 'John' });

      const json = JSON.stringify(event);
      const parsed = JSON.parse(json);

      expect(parsed.eventName).toBe('EntityCreated');
      expect(parsed.payload.entityId).toBe('CUST123');
    });

    it('should preserve timestamp in serialization', () => {
      const event = new DomainEvent('TestEvent', {});

      const json = JSON.stringify(event);
      const parsed = JSON.parse(json);

      expect(parsed.occurredAt).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty event name', () => {
      const event = new DomainEvent('', {});

      expect(event.eventName).toBe('');
    });

    it('should handle complex payload', () => {
      const payload = {
        nested: { data: { value: 123 } },
        array: [1, 2, 3],
        mixed: { arr: [{ id: 1 }] }
      };
      const event = new DomainEvent('TestEvent', payload);

      expect(event.getPayload()).toEqual(payload);
    });
  });
});
