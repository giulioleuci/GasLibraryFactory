import { ValidationException } from '@GasSchemaValidatorLib';
import { UtilsService } from '@CoreUtilsLib';

/**
 * Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.
 * @abstract
 * @class
 */
export class Entity {
  /**
   * Initializes entity state including identity, timestamps, and change tracking registries.
   * @param {Object} [data={}] Initial attribute data.
   * @param {string} [data.id] Unique entity identifier.
   * @param {Date|string} [data.createdAt] Original creation timestamp.
   * @param {Date|string} [data.updatedAt] Last modification timestamp.
   * @throws {TypeError} If attempting to instantiate the abstract class directly.
   */
  constructor(data = {}) {
    if (new.target === Entity) {
      throw new TypeError('Cannot construct Entity instances directly - must use a subclass');
    }

    this._id = data.id || null;
    this._createdAt = this._parseDate(data.createdAt) || new Date();
    this._updatedAt = this._parseDate(data.updatedAt) || new Date();
    this._dirtyFields = new Set();
    this._originalData = {};
    this._domainEvents = [];
    this._validationErrors = [];
    this._dynamicColumns = {};
  }

  /**
   * Gets the entity ID.
   *
   * @returns {string|null} The entity ID
   */
  get id() {
    return this._id;
  }

  /**
   * Sets the entity ID.
   *
   * @param {string} value - The entity ID
   */
  set id(value) {
    this._id = value;
  }

  /**
   * Gets the creation timestamp.
   *
   * @returns {Date} The creation timestamp
   */
  get createdAt() {
    return this._createdAt;
  }

  /**
   * Gets the last update timestamp.
   *
   * @returns {Date} The last update timestamp
   */
  get updatedAt() {
    return this._updatedAt;
  }

  /**
   * Centralized date parser delegating to CoreUtilsLib for consistent format handling.
   * @private
   * @param {Date|string|number} value Raw date input.
   * @returns {Date|null} Parsed Date object or null if unparseable.
   */
  _parseDate(value) {
    const utils = new UtilsService();
    return utils.parseDate(value);
  }

  /**
   * Registers a field as modified and updates the internal modification timestamp.
   * @param {string} fieldName Name of the modified attribute.
   */
  markDirty(fieldName) {
    this._dirtyFields.add(fieldName);
    this._updatedAt = new Date();
  }

  /**
   * Checks if a field has been modified since the last state synchronization.
   * @param {string} fieldName Attribute name to verify.
   * @returns {boolean} True if the field is in the dirty registry.
   */
  isDirty(fieldName) {
    return this._dirtyFields.has(fieldName);
  }

  /**
   * Retrieves all fields that have been modified since the entity was loaded or cleared.
   * @returns {string[]} Collection of dirty field names.
   */
  getDirtyFields() {
    return Array.from(this._dirtyFields);
  }

  /**
   * Determines if the entity instance contains any pending uncommitted changes.
   * @returns {boolean} True if the dirty fields registry is non-empty.
   */
  hasDirtyFields() {
    return this._dirtyFields.size > 0;
  }

  /**
   * Clears all dirty field markers.
   */
  clearDirtyFields() {
    this._dirtyFields.clear();
  }

  /**
   * Gets the changes made to the entity since load.
   *
   * @returns {Object} Object with changed fields and their current values
   */
  getChanges() {
    const changes = {};
    const data = this.toData();
    for (const field of this._dirtyFields) {
      if (field in data) {
        changes[field] = data[field];
      }
    }
    return changes;
  }

  /**
   * Stores the original data for comparison.
   *
   * @param {Object} data - The original data
   */
  storeOriginalData(data) {
    this._originalData = { ...data };
  }

  /**
   * Gets the original value of a field.
   *
   * @param {string} fieldName - The field name
   * @returns {*} The original value
   */
  getOriginalValue(fieldName) {
    return this._originalData[fieldName];
  }

  /**
   * Captures persistence columns not covered by this entity's own `toData()`
   * schema, so a later `save()` round-trip does not silently drop them. Opt-in:
   * a subclass whose physical schema is only partially known at compile time
   * (e.g. a wide, per-subject matrix table generated at runtime from another
   * table) declares a static `getKnownColumns()` returning its fixed column
   * names; every other raw column present at hydration time is captured
   * verbatim and merged back unmodified by `EntityMapper.toData()` (see
   * `getDynamicColumns`). Entities that don't declare `getKnownColumns()` are
   * unaffected (no-op).
   * @param {Object} data Raw persistence record this entity was hydrated from.
   */
  captureDynamicColumns(data) {
    if (typeof this.constructor.getKnownColumns !== 'function' || !data) {
      return;
    }
    const known = new Set(this.constructor.getKnownColumns());
    this._dynamicColumns = {};
    for (const [key, value] of Object.entries(data)) {
      if (!known.has(key)) {
        this._dynamicColumns[key] = value;
      }
    }
  }

  /**
   * Dynamic (schema-unknown-at-compile-time) columns captured at hydration time
   * (see `captureDynamicColumns`), merged back into the persisted row by
   * `EntityMapper.toData()` for any key not already produced by the entity's
   * own `toData()`.
   * @returns {Object} Shallow copy of the captured dynamic columns.
   */
  getDynamicColumns() {
    return { ...this._dynamicColumns };
  }

  /**
   * Sets (or adds) a single dynamic column value and marks it dirty, without
   * requiring the subclass to model every wide-table column as a typed
   * property. The value participates in the next `save()` via
   * `getDynamicColumns()`.
   * @param {string} column Column name.
   * @param {*} value New value.
   */
  setDynamicColumn(column, value) {
    this._dynamicColumns[column] = value;
    this.markDirty(column);
  }

  /**
   * Adds a domain event to the entity.
   *
   * @param {Object} event - The domain event
   */
  addDomainEvent(event) {
    this._domainEvents.push(event);
  }

  /**
   * Gets all domain events.
   *
   * @returns {Array<Object>} Array of domain events
   */
  getDomainEvents() {
    return [...this._domainEvents];
  }

  /**
   * Clears all domain events.
   */
  clearDomainEvents() {
    this._domainEvents = [];
  }

  /**
   * Validates the entity against its specifications.
   * Subclasses should override this method to implement validation.
   *
   * @returns {boolean} True if valid
   */
  validate() {
    this._validationErrors = [];
    return true;
  }

  /**
   * Checks if the entity is valid.
   *
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.validate();
  }

  /**
   * Gets validation errors.
   *
   * @returns {Array<Object>} Array of validation error objects
   */
  getValidationErrors() {
    return [...this._validationErrors];
  }

  /**
   * Adds a validation error.
   *
   * @protected
   * @param {string} field - The field name
   * @param {string} message - The error message
   */
  addValidationError(field, message) {
    this._validationErrors.push({ field, message });
  }

  /**
   * Throws a ValidationException if the entity is invalid.
   *
   * @throws {ValidationException} If validation fails
   */
  validateOrThrow() {
    if (!this.validate()) {
      throw new ValidationException(
        `Validation failed for ${this.constructor.name}`,
        this.constructor.name,
        this._validationErrors
      );
    }
  }

  /**
   * Compares this entity to another for equality.
   * Entities are equal if they have the same ID.
   *
   * @param {Entity} other - The other entity
   * @returns {boolean} True if equal
   */
  equals(other) {
    if (!other || !(other instanceof Entity)) {
      return false;
    }
    if (!this._id || !other._id) {
      return false;
    }
    return this._id === other._id;
  }

  /**
   * Converts the entity to a plain object for persistence.
   * Subclasses must implement this method.
   *
   * @abstract
   * @returns {Object} Plain object representation
   */
  toData() {
    throw new Error(`${this.constructor.name} must implement toData() method`);
  }

  /**
   * Creates an entity instance from a plain object.
   * Subclasses must implement this static method.
   *
   * @abstract
   * @static
   * @param {Object} data - Plain object data
   * @returns {Entity} Entity instance
   */
  static fromData(_data) {
    throw new Error(`${this.name} must implement static fromData() method`);
  }

  /**
   * Gets a string representation of the entity.
   *
   * @returns {string} String representation
   */
  toString() {
    return `${this.constructor.name}(id=${this._id})`;
  }
}
