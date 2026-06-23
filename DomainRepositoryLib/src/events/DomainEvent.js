import { UtilsService } from '@CoreUtilsLib';

/**
 * Base class for capturing significant domain-layer occurrences, providing identity and timing metadata.
 * @class
 */
export class DomainEvent {
  /**
   * Initializes domain event with type, payload, and occurrence timestamp.
   * @param {string} eventType Domain-specific classification of the event.
   * @param {Object} [payload] Event data packet.
   * @param {Date|null} [occurredAt=null] Override for occurrence timing.
   */
  constructor(eventType, payload, occurredAt = null) {
    this.eventType = eventType;
    this.payload = payload;
    this.occurredAt = occurredAt || new Date();
    this.eventId = this._generateId();
  }

  /**
   * Generates a globally unique identifier for the event using a compact alphanumeric strategy.
   * @private
   * @returns {string} Unique event ID (type_compactId).
   */
  _generateId() {
    const utils = new UtilsService();
    return `${this.eventType}_${utils.generateCompactId(12)}`;
  }

  /**
   * Returns the classification identifier for this event.
   * @returns {string} Event type string.
   */
  getEventType() {
    return this.eventType;
  }

  /**
   * Alias for getEventType, returning the semantic name of the event.
   * @returns {string} Event name string.
   */
  getEventName() {
    return this.eventType;
  }

  /**
   * Gets the event name as a property.
   *
   * @returns {string} The event name
   */
  get eventName() {
    return this.eventType;
  }

  /**
   * Retrieves the data object associated with the event occurrence.
   * @returns {Object} Event data packet.
   */
  getPayload() {
    return this.payload;
  }

  /**
   * Returns the timestamp when the event was recorded.
   * @returns {Date} Occurrence timestamp.
   */
  getOccurredAt() {
    return this.occurredAt;
  }

  /**
   * Retrieves the unique identifier assigned to this specific event instance.
   * @returns {string} Unique event ID.
   */
  getEventId() {
    return this.eventId;
  }

  /**
   * Serializes the domain event into a plain data structure for persistence or transmission.
   * @returns {{eventId:string, eventType:string, eventName:string, payload:Object, occurredAt:string}} Serialized state.
   */
  toObject() {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      eventName: this.eventType,
      payload: this.payload,
      occurredAt: this.occurredAt.toISOString()
    };
  }

  /**
   * Automatic JSON serialization handler.
   * @returns {Object} Plain object representation.
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * Returns a concise string representation of the event type and identifier.
   * @returns {string} Formatted event summary.
   */
  toString() {
    return `${this.eventType}(${this.eventId})`;
  }
}

/**
 * Domain event indicating the successful persistence of a new entity instance.
 * @class
 * @extends DomainEvent
 */
export class EntityCreatedEvent extends DomainEvent {
  /**
   * Initializes creation event with target entity metadata.
   * @param {string} entityType Domain entity classification.
   * @param {string} entityId Unique identifier of the created entity.
   * @param {Object} [data] Full attribute set of the new entity.
   */
  constructor(entityType, entityId, data) {
    const payload = {
      entityType,
      entityId
    };

    if (data !== undefined) {
      payload.entityData = data;
    }

    super('EntityCreated', payload);
  }
}

/**
 * Domain event indicating state modifications to an existing entity instance.
 * @class
 * @extends DomainEvent
 */
export class EntityUpdatedEvent extends DomainEvent {
  /**
   * Initializes update event with modification details.
   * @param {string} entityType Domain entity classification.
   * @param {string} entityId Unique identifier of the modified entity.
   * @param {Object} [changes] Map of modified attributes and their new values.
   */
  constructor(entityType, entityId, changes) {
    const payload = {
      entityType,
      entityId
    };

    if (changes !== undefined) {
      payload.changes = changes;
    }

    super('EntityUpdated', payload);
  }
}

/**
 * Domain event indicating the removal of an entity instance from the domain.
 * @class
 * @extends DomainEvent
 */
export class EntityDeletedEvent extends DomainEvent {
  /**
   * Initializes deletion event with audit details.
   * @param {string} entityType Domain entity classification.
   * @param {string} entityId Unique identifier of the removed entity.
   * @param {string} [reason] Explanatory context for the removal.
   */
  constructor(entityType, entityId, reason) {
    const payload = {
      entityType,
      entityId
    };

    if (reason !== undefined) {
      payload.reason = reason;
    }

    super('EntityDeleted', payload);
  }
}
