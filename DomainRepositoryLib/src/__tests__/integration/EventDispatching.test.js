// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/EventDispatching.test.js
// ===================================================================
// Integration Test 11: Event Dispatching
// Verifies that DomainRepositoryLib triggers EventDispatcher upon successful persistence
// ===================================================================

import { EventDispatcher } from '../../events/EventDispatcher.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';

class MockEvent {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
  getEventType() { return this.type; }
  getData() { return this.data; }
}

/**
 * Test Scenario: Event Dispatching
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (Repository, EventDispatcher, DomainEvent)
 * - Persistence: SheetDBLib (DatabaseService)
 *
 * Objective:
 * Verify that when an Entity is successfully persisted, the Repository
 * dispatches domain events to registered handlers, enabling event-driven
 * architecture patterns.
 */

describe('Integration Test 11: Event Dispatching', () => {
  let dispatcher;
  let logger;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    dispatcher = new EventDispatcher(logger);
  });

  describe('Event Registration', () => {
    test('should register event handlers', () => {
      const handler = jest.fn();
      dispatcher.on('UserCreatedEvent', handler);
      
      expect(dispatcher.getHandlerCount('UserCreatedEvent')).toBe(1);
      expect(dispatcher.getHandlers('UserCreatedEvent')[0].handler).toBe(handler);
    });
  });

  describe('Event Dispatching', () => {
    test('should dispatch event to registered handlers', () => {
      const handler = jest.fn();
      dispatcher.on('UserCreatedEvent', handler);
      
      const event = new MockEvent('UserCreatedEvent', { id: '123' });
      dispatcher.dispatch(event);
      
      expect(handler).toHaveBeenCalledWith(event);
    });

    test('should pass correct event payload to handlers', () => {
      const handler = jest.fn();
      dispatcher.on('DataEvent', handler);
      
      const payload = { id: 'user-1', name: 'John' };
      const event = new MockEvent('DataEvent', payload);
      dispatcher.dispatch(event);
      
      expect(handler).toHaveBeenCalled();
      const receivedEvent = handler.mock.calls[0][0];
      expect(receivedEvent.getData()).toEqual(payload);
    });

    test('should not dispatch events if type mismatch', () => {
      const handler = jest.fn();
      dispatcher.on('UserCreatedEvent', handler);
      
      const event = new MockEvent('OtherEvent', { id: '123' });
      dispatcher.dispatch(event);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Event Handlers', () => {
    test('should call all registered handlers for same event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      dispatcher.on('MultiEvent', handler1);
      dispatcher.on('MultiEvent', handler2);
      dispatcher.on('MultiEvent', handler3);
      
      dispatcher.dispatch(new MockEvent('MultiEvent', {}));
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    test('should execute handlers in registration order', () => {
      const executionOrder = [];
      dispatcher.on('OrderEvent', () => executionOrder.push(1));
      dispatcher.on('OrderEvent', () => executionOrder.push(2));
      dispatcher.on('OrderEvent', () => executionOrder.push(3));
      
      dispatcher.dispatch(new MockEvent('OrderEvent', {}));
      
      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });

  describe('Event Handler Errors', () => {
    test('should continue dispatching even if one handler throws', () => {
      const handler1 = jest.fn(() => { throw new Error('First handler failed'); });
      const handler2 = jest.fn();
      
      dispatcher.on('ErrorTest', handler1);
      dispatcher.on('ErrorTest', handler2);
      
      dispatcher.dispatch(new MockEvent('ErrorTest', {}));
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler handler_0 for ErrorTest')
      );
    });
  });
});
