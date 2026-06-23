import { LoggerService } from '@CoreUtilsLib';

/**
 * Orchestrator for domain event distribution, managing handler registrations and execution lifecycles.
 * @class
 */
export class EventDispatcher {
  /**
   * Initializes dispatcher with optional logging and an internal handler registry.
   * @param {Object|null} [logger] Optional diagnostic logger.
   */
  constructor(logger = null) {
    this.logger = logger || new LoggerService();
    this._handlers = new Map();
  }

  /**
   * Subscribes a handler function to a specific event type.
   * @param {string} eventType Domain event classification to monitor.
   * @param {Function} handler Callback function executed on dispatch.
   * @param {string|null} [handlerName] Optional identifier for diagnostic tracking.
   * @throws {Error} If the provided handler is not a function.
   */
  on(eventType, handler, handlerName = null) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, []);
    }

    this._handlers.get(eventType).push({
      handler,
      name: handlerName || `handler_${this._handlers.get(eventType).length}`
    });

    this.logger.debug(`Registered handler for event: ${eventType}`);
  }

  /**
   * Unsubscribes a specific handler or all handlers associated with an event type.
   * @param {string} eventType Domain event classification.
   * @param {Function} [handler] Specific handler function to remove; if omitted, all handlers for the type are purged.
   */
  off(eventType, handler) {
    if (!this._handlers.has(eventType)) {
      return;
    }

    // If no handler specified, remove all handlers for this event type
    if (!handler) {
      this._handlers.delete(eventType);
      this.logger.debug(`Removed all handlers for event: ${eventType}`);
      return;
    }

    // Remove specific handler
    const handlers = this._handlers.get(eventType);
    const index = handlers.findIndex((h) => h.handler === handler);

    if (index > -1) {
      handlers.splice(index, 1);
      this.logger.debug(`Removed handler for event: ${eventType}`);
    }
  }

  /**
   * Executes all registered handlers for the provided domain event instance.
   * @param {Object} event Event instance containing state and type metadata.
   */
  dispatch(event) {
    const eventType = event.getEventType();
    this.logger.debug(`Dispatching event: ${eventType}`);

    if (!this._handlers.has(eventType)) {
      this.logger.debug(`No handlers registered for event: ${eventType}`);
      return;
    }

    const handlers = this._handlers.get(eventType);

    for (const { handler, name } of handlers) {
      try {
        this.logger.debug(`Executing handler: ${name} for event: ${eventType}`);
        handler(event);
      } catch (error) {
        this.logger.error(`Error in event handler ${name} for ${eventType}: ${error.message}`);
      }
    }
  }

  /**
   * Sequentially dispatches a collection of domain events to their respective handlers.
   * @param {Array<Object>} events Collection of events to process.
   */
  dispatchMany(events) {
    for (const event of events) {
      this.dispatch(event);
    }
  }

  /**
   * Retrieves the current registry of handler objects for a specific event type.
   * @param {string} eventType Domain event classification.
   * @returns {Array<{handler:Function, name:string}>} Collection of registered handler metadata.
   */
  getHandlers(eventType) {
    return this._handlers.get(eventType) || [];
  }

  /**
   * Purges every handler registration associated with the specified event type.
   * @param {string} eventType Domain event classification.
   */
  clearHandlers(eventType) {
    this._handlers.delete(eventType);
  }

  /**
   * Resets the entire dispatcher registry, removing all handler subscriptions across all event types.
   */
  clearAll() {
    this._handlers.clear();
  }

  /**
   * Returns the total number of active handler subscriptions for a given event type.
   * @param {string} eventType Domain event classification.
   * @returns {number} Active handler count.
   */
  getHandlerCount(eventType) {
    return this.getHandlers(eventType).length;
  }
}
