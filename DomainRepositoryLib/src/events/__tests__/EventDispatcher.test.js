// ===================================================================
// FILE: DomainRepositoryLib/src/events/__tests__/EventDispatcher.test.js
// ===================================================================

import { EventDispatcher } from '../EventDispatcher';
import {
  DomainEvent,
  EntityCreatedEvent,
  EntityUpdatedEvent,
  EntityDeletedEvent
} from '../DomainEvent';

describe('EventDispatcher - Comprehensive Test Suite', () => {
  let dispatcher;

  beforeEach(() => {
    dispatcher = new EventDispatcher();
  });

  describe('Handler Registration', () => {
    it('should register event handler', () => {
      const handler = jest.fn();

      dispatcher.on('TestEvent', handler);

      expect(dispatcher._handlers.has('TestEvent')).toBe(true);
    });

    it('should register multiple handlers for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher.on('TestEvent', handler1);
      dispatcher.on('TestEvent', handler2);

      const handlers = dispatcher._handlers.get('TestEvent');
      expect(handlers.length).toBe(2);
    });

    it('should register handlers for different events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher.on('Event1', handler1);
      dispatcher.on('Event2', handler2);

      expect(dispatcher._handlers.has('Event1')).toBe(true);
      expect(dispatcher._handlers.has('Event2')).toBe(true);
    });

    it('should throw error for non-function handler', () => {
      expect(() => dispatcher.on('TestEvent', 'not a function')).toThrow();
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch event to registered handler', () => {
      const handler = jest.fn();
      dispatcher.on('TestEvent', handler);

      const event = new DomainEvent('TestEvent', { data: 'test' });
      dispatcher.dispatch(event);

      expect(handler).toHaveBeenCalledWith(event);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should dispatch to all registered handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      dispatcher.on('TestEvent', handler1);
      dispatcher.on('TestEvent', handler2);
      dispatcher.on('TestEvent', handler3);

      const event = new DomainEvent('TestEvent', {});
      dispatcher.dispatch(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch to handlers of different events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher.on('Event1', handler1);
      dispatcher.on('Event2', handler2);

      const event = new DomainEvent('Event1', {});
      dispatcher.dispatch(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle dispatching with no registered handlers', () => {
      const event = new DomainEvent('UnregisteredEvent', {});

      expect(() => dispatcher.dispatch(event)).not.toThrow();
    });

    it('should pass correct event payload to handler', () => {
      const handler = jest.fn();
      dispatcher.on('EntityCreated', handler);

      const event = new EntityCreatedEvent('Customer', 'CUST123', { name: 'John' });
      dispatcher.dispatch(event);

      expect(handler).toHaveBeenCalledWith(event);
      expect(handler.mock.calls[0][0].getPayload().entityId).toBe('CUST123');
    });
  });

  describe('Handler Removal', () => {
    it('should remove specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher.on('TestEvent', handler1);
      dispatcher.on('TestEvent', handler2);
      dispatcher.off('TestEvent', handler1);

      const event = new DomainEvent('TestEvent', {});
      dispatcher.dispatch(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should remove all handlers for event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher.on('TestEvent', handler1);
      dispatcher.on('TestEvent', handler2);
      dispatcher.off('TestEvent');

      const event = new DomainEvent('TestEvent', {});
      dispatcher.dispatch(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent handler', () => {
      const handler = jest.fn();

      expect(() => dispatcher.off('NonExistentEvent', handler)).not.toThrow();
    });
  });

  describe('Handler Execution Order', () => {
    it('should execute handlers in registration order', () => {
      const executionOrder = [];

      dispatcher.on('TestEvent', () => executionOrder.push(1));
      dispatcher.on('TestEvent', () => executionOrder.push(2));
      dispatcher.on('TestEvent', () => executionOrder.push(3));

      const event = new DomainEvent('TestEvent', {});
      dispatcher.dispatch(event);

      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });

  describe('Error Handling', () => {
    it('should continue dispatching after handler error', () => {
      const handler1 = jest.fn(() => {
        throw new Error('Handler 1 error');
      });
      const handler2 = jest.fn();

      dispatcher.on('TestEvent', handler1);
      dispatcher.on('TestEvent', handler2);

      const event = new DomainEvent('TestEvent', {});

      expect(() => dispatcher.dispatch(event)).not.toThrow();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should throw error for null event', () => {
      expect(() => dispatcher.dispatch(null)).toThrow();
    });

    it('should throw error for invalid event', () => {
      expect(() => dispatcher.dispatch({ invalid: 'object' })).toThrow();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle entity lifecycle events', () => {
      const createdHandler = jest.fn();
      const updatedHandler = jest.fn();
      const deletedHandler = jest.fn();

      dispatcher.on('EntityCreated', createdHandler);
      dispatcher.on('EntityUpdated', updatedHandler);
      dispatcher.on('EntityDeleted', deletedHandler);

      dispatcher.dispatch(new EntityCreatedEvent('Customer', 'CUST123'));
      dispatcher.dispatch(new EntityUpdatedEvent('Customer', 'CUST123'));
      dispatcher.dispatch(new EntityDeletedEvent('Customer', 'CUST123'));

      expect(createdHandler).toHaveBeenCalledTimes(1);
      expect(updatedHandler).toHaveBeenCalledTimes(1);
      expect(deletedHandler).toHaveBeenCalledTimes(1);
    });

    it('should support logging handler', () => {
      const logs = [];
      const logger = (event) => {
        logs.push(event.getEventName() + ' at ' + event.getOccurredAt());
      };

      dispatcher.on('EntityCreated', logger);
      dispatcher.on('EntityUpdated', logger);

      dispatcher.dispatch(new EntityCreatedEvent('Customer', 'CUST123'));
      dispatcher.dispatch(new EntityUpdatedEvent('Customer', 'CUST123'));

      expect(logs.length).toBe(2);
      expect(logs[0]).toContain('EntityCreated');
      expect(logs[1]).toContain('EntityUpdated');
    });

    it('should support notification handler', () => {
      const notifications = [];

      dispatcher.on('EntityCreated', (event) => {
        const payload = event.getPayload();
        notifications.push('New ' + payload.entityType + ' created: ' + payload.entityId);
      });

      dispatcher.dispatch(new EntityCreatedEvent('Customer', 'CUST123'));

      expect(notifications).toEqual(['New Customer created: CUST123']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty event name', () => {
      const handler = jest.fn();
      dispatcher.on('', handler);

      const event = new DomainEvent('', {});
      dispatcher.dispatch(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple dispatches', () => {
      const handler = jest.fn();
      dispatcher.on('TestEvent', handler);

      const event = new DomainEvent('TestEvent', {});
      dispatcher.dispatch(event);
      dispatcher.dispatch(event);
      dispatcher.dispatch(event);

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should not interfere between different dispatchers', () => {
      const dispatcher1 = new EventDispatcher();
      const dispatcher2 = new EventDispatcher();

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      dispatcher1.on('TestEvent', handler1);
      dispatcher2.on('TestEvent', handler2);

      const event = new DomainEvent('TestEvent', {});
      dispatcher1.dispatch(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
