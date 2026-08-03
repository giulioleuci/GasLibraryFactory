# API Reference: DomainRepositoryLib

## CLASS: with
**File Path:** `DomainRepositoryLib/index.js`
**Constructor Usage:** `const instance = new with();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ValueObject
**File Path:** `DomainRepositoryLib/src/ValueObject.js`
**Constructor Usage:** `const instance = new ValueObject();`
**Description:** Abstract base class for domain value objects, enforcing immutability and value-based equality.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for domain value objects, enforcing immutability and value-based equality.
 * @abstract
 * @class
 */
```

### Methods of ValueObject

#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = valueObject.equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * Compares this value object with another instance for deep structural equality.
   * @param {ValueObject} other Comparison target instance.
   * @returns {boolean} True if both instances share the same constructor and deep state.
   */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(!other || this.constructor !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(typeof a !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(typeof a !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(a.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.if
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.if(keysA.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ValueObject.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = valueObject.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a stringified representation of the value object's public properties.
   * @returns {string} Formatted class name and JSON-serialized state.
   */
```
---
#### METHOD: ValueObject.catch
- **Scope:** instance
- **LLM Call Syntax:** `valueObject.catch(_error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ValueObject.getValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = valueObject.getValue();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the underlying serializable data value represented by the object.
   * @abstract
   * @returns {*} Primitive or plain object representation.
   * @throws {Error} If the subclass fails to implement this method.
   */
```
---
<br>

## CLASS: directly
**File Path:** `DomainRepositoryLib/src/ValueObject.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: name
**File Path:** `DomainRepositoryLib/src/ValueObject.js`
**Constructor Usage:** `const instance = new name();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of name

#### METHOD: name.catch
- **Scope:** instance
- **LLM Call Syntax:** `name.catch(_error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: fails
**File Path:** `DomainRepositoryLib/src/ValueObject.js`
**Constructor Usage:** `const instance = new fails();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: Repository
**File Path:** `DomainRepositoryLib/src/Repository.js`
**Constructor Usage:** `const instance = new Repository();`
**Description:** Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.
 * @abstract
 * @class
 */
```

### Methods of Repository

#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(typeof options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!this.database || !this.database.tables);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!table);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.exceptionService && typeof this.exceptionService.executeWithRetry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.find
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.find(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all entities satisfying the provided domain specification.
   * @param {Object} specification Criteria for filtering entities.
   * @returns {Array<Object>} Collection of hydrated domain entities.
   * @throws {DomainException} If specification is invalid.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!specification);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(validation.valid);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.findOne
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.findOne(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the first entity satisfying the domain specification.
   * @param {Object} specification Criteria for filtering.
   * @returns {Object|null} First matching entity instance or null.
   */
```
---
#### METHOD: Repository.findById
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.findById(id);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a single entity by its primary unique identifier with cache-first lookup.
   * @param {string} id Unique entity identifier.
   * @returns {Object|null} Hydrated entity or null if not found.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(cached);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!row);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.findByIdOrFail
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.findByIdOrFail(id);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves entity by ID or throws if non-existent.
   * @param {string} id Unique entity identifier.
   * @returns {Object} Hydrated entity instance.
   * @throws {EntityNotFoundException} If no record matches the identifier.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entity);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.findAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.findAll();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves every record from the target table as hydrated entities.
   * @returns {Array<Object>} Collection of all entities in the repository.
   */
```
---
#### METHOD: Repository.exists
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.exists(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if at least one entity satisfies the specified criteria.
   * @param {Object} specification Criteria to test.
   * @returns {boolean} True if any matches are found.
   */
```
---
#### METHOD: Repository.count
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.count(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Returns the total number of entities satisfying the specification.
   * @param {Object} specification Criteria for counting.
   * @returns {number} Count of matching records.
   */
```
---
#### METHOD: Repository.save
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.save(entity, options);`
- **Pure JSDoc:**
```javascript
/**
   * Persists entity state via insertion or update, managing timestamps and dirty tracking.
   * @param {Object} entity Domain entity to persist.
   * @param {Object} [options={}] Operation configuration.
   * @returns {Object} The persisted entity with updated metadata.
   * @throws {ValidationException} If entity fails domain rules.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(entity.id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.saveMany
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.saveMany(entities);`
- **Pure JSDoc:**
```javascript
/**
   * Executes batch persistence for multiple entities with bulk-insert optimization for new records.
   * @param {Array<Object>} entities Collection of entities to save.
   * @returns {Array<Object>} Collection of successfully persisted entities.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entities || entities.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(const entity of entities);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(newEntities.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(const entity of existingEntities);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(existingEntities.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(const entity of savedEntities);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.patch
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.patch(entity, changes);`
- **Pure JSDoc:**
```javascript
/**
   * Performs a partial update on specific entity fields, minimizing I/O and API calls.
   * @param {Object} entity Target entity instance (must have ID).
   * @param {Object} changes Set of attributes to modify.
   * @returns {Object} The patched and re-validated entity.
   * @throws {DomainException} If entity lacks a valid identifier.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entity.id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.patchById
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.patchById(id, changes);`
- **Pure JSDoc:**
```javascript
/**
   * Performs partial update on a record identified by its unique ID.
   * @param {string} id Unique entity identifier.
   * @param {Object} changes Set of attributes to modify.
   * @returns {Object} The updated domain entity.
   */
```
---
#### METHOD: Repository.delete
- **Scope:** instance
- **LLM Call Syntax:** `repository.delete(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Removes an entity instance from the persistent store.
   * @param {Object} entity Target entity to remove.
   * @throws {DomainException} If entity lacks a valid identifier.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entity.id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.deleteById
- **Scope:** instance
- **LLM Call Syntax:** `repository.deleteById(id);`
- **Pure JSDoc:**
```javascript
/**
   * Removes a record from the persistent store using its unique identifier.
   * @param {string} id Unique entity identifier.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.deleteMany
- **Scope:** instance
- **LLM Call Syntax:** `repository.deleteMany(entities);`
- **Pure JSDoc:**
```javascript
/**
   * Removes multiple entities from the persistent store in a batch operation.
   * @param {Array<Object>} entities Collection of entities to remove.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entities || entities.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(const entity of entities);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entity.id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.for
- **Scope:** instance
- **LLM Call Syntax:** `repository.for(const entity of entities);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Repository.refresh
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.refresh(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Synchronizes entity state with the current data in the persistent store.
   * @param {Object} entity Entity instance to refresh.
   * @returns {Object} The synchronized entity instance.
   * @throws {EntityNotFoundException} If the record no longer exists in the store.
   */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!entity.id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(!freshData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(this.cache && typeof this.cache.remove);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.if
- **Scope:** instance
- **LLM Call Syntax:** `repository.if(entityId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Repository.getTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.getTable();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the low-level TableService instance managed by the repository.
   * @returns {Object} Active table service.
   */
```
---
#### METHOD: Repository.getEntityClass
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.getEntityClass();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the entity constructor used by this repository.
   * @returns {Function} Entity class constructor.
   */
```
---
#### METHOD: Repository.getTableName
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository.getTableName();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the name of the target table in the database.
   * @returns {string} Table identifier.
   */
```
---
<br>

## CLASS: directly
**File Path:** `DomainRepositoryLib/src/Repository.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: constructor
**File Path:** `DomainRepositoryLib/src/Repository.js`
**Constructor Usage:** `const instance = new constructor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: Entity
**File Path:** `DomainRepositoryLib/src/Entity.js`
**Constructor Usage:** `const instance = new Entity();`
**Description:** Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.
 * @abstract
 * @class
 */
```

### Methods of Entity

#### METHOD: Entity.if
- **Scope:** instance
- **LLM Call Syntax:** `entity.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Entity.markDirty
- **Scope:** instance
- **LLM Call Syntax:** `entity.markDirty(fieldName);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a field as modified and updates the internal modification timestamp.
   * @param {string} fieldName Name of the modified attribute.
   */
```
---
#### METHOD: Entity.isDirty
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.isDirty(fieldName);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if a field has been modified since the last state synchronization.
   * @param {string} fieldName Attribute name to verify.
   * @returns {boolean} True if the field is in the dirty registry.
   */
```
---
#### METHOD: Entity.getDirtyFields
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getDirtyFields();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all fields that have been modified since the entity was loaded or cleared.
   * @returns {string[]} Collection of dirty field names.
   */
```
---
#### METHOD: Entity.hasDirtyFields
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.hasDirtyFields();`
- **Pure JSDoc:**
```javascript
/**
   * Determines if the entity instance contains any pending uncommitted changes.
   * @returns {boolean} True if the dirty fields registry is non-empty.
   */
```
---
#### METHOD: Entity.clearDirtyFields
- **Scope:** instance
- **LLM Call Syntax:** `entity.clearDirtyFields();`
- **Pure JSDoc:**
```javascript
/**
   * Clears all dirty field markers.
   */
```
---
#### METHOD: Entity.getChanges
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getChanges();`
- **Pure JSDoc:**
```javascript
/**
   * Gets the changes made to the entity since load.
   *
   * @returns {Object} Object with changed fields and their current values
   */
```
---
#### METHOD: Entity.for
- **Scope:** instance
- **LLM Call Syntax:** `entity.for(const field of this._dirtyFields);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Entity.if
- **Scope:** instance
- **LLM Call Syntax:** `entity.if(field in data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Entity.storeOriginalData
- **Scope:** instance
- **LLM Call Syntax:** `entity.storeOriginalData(data);`
- **Pure JSDoc:**
```javascript
/**
   * Stores the original data for comparison.
   *
   * @param {Object} data - The original data
   */
```
---
#### METHOD: Entity.getOriginalValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getOriginalValue(fieldName);`
- **Pure JSDoc:**
```javascript
/**
   * Gets the original value of a field.
   *
   * @param {string} fieldName - The field name
   * @returns {*} The original value
   */
```
---
#### METHOD: Entity.captureDynamicColumns
- **Scope:** instance
- **LLM Call Syntax:** `entity.captureDynamicColumns(data);`
- **Pure JSDoc:**
```javascript
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
```
---
#### METHOD: Entity.if
- **Scope:** instance
- **LLM Call Syntax:** `entity.if(typeof this.constructor.getKnownColumns !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Entity.getDynamicColumns
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getDynamicColumns();`
- **Pure JSDoc:**
```javascript
/**
   * Dynamic (schema-unknown-at-compile-time) columns captured at hydration time
   * (see `captureDynamicColumns`), merged back into the persisted row by
   * `EntityMapper.toData()` for any key not already produced by the entity's
   * own `toData()`.
   * @returns {Object} Shallow copy of the captured dynamic columns.
   */
```
---
#### METHOD: Entity.setDynamicColumn
- **Scope:** instance
- **LLM Call Syntax:** `entity.setDynamicColumn(column, value);`
- **Pure JSDoc:**
```javascript
/**
   * Sets (or adds) a single dynamic column value and marks it dirty, without
   * requiring the subclass to model every wide-table column as a typed
   * property. The value participates in the next `save()` via
   * `getDynamicColumns()`.
   * @param {string} column Column name.
   * @param {*} value New value.
   */
```
---
#### METHOD: Entity.addDomainEvent
- **Scope:** instance
- **LLM Call Syntax:** `entity.addDomainEvent(event);`
- **Pure JSDoc:**
```javascript
/**
   * Adds a domain event to the entity.
   *
   * @param {Object} event - The domain event
   */
```
---
#### METHOD: Entity.getDomainEvents
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getDomainEvents();`
- **Pure JSDoc:**
```javascript
/**
   * Gets all domain events.
   *
   * @returns {Array<Object>} Array of domain events
   */
```
---
#### METHOD: Entity.clearDomainEvents
- **Scope:** instance
- **LLM Call Syntax:** `entity.clearDomainEvents();`
- **Pure JSDoc:**
```javascript
/**
   * Clears all domain events.
   */
```
---
#### METHOD: Entity.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.validate();`
- **Pure JSDoc:**
```javascript
/**
   * Validates the entity against its specifications.
   * Subclasses should override this method to implement validation.
   *
   * @returns {boolean} True if valid
   */
```
---
#### METHOD: Entity.isValid
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.isValid();`
- **Pure JSDoc:**
```javascript
/**
   * Checks if the entity is valid.
   *
   * @returns {boolean} True if valid
   */
```
---
#### METHOD: Entity.getValidationErrors
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.getValidationErrors();`
- **Pure JSDoc:**
```javascript
/**
   * Gets validation errors.
   *
   * @returns {Array<Object>} Array of validation error objects
   */
```
---
#### METHOD: Entity.addValidationError
- **Scope:** instance
- **LLM Call Syntax:** `entity.addValidationError(field, message);`
- **Pure JSDoc:**
```javascript
/**
   * Adds a validation error.
   *
   * @protected
   * @param {string} field - The field name
   * @param {string} message - The error message
   */
```
---
#### METHOD: Entity.validateOrThrow
- **Scope:** instance
- **LLM Call Syntax:** `entity.validateOrThrow();`
- **Pure JSDoc:**
```javascript
/**
   * Throws a ValidationException if the entity is invalid.
   *
   * @throws {ValidationException} If validation fails
   */
```
---
#### METHOD: Entity.equals
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.equals(other);`
- **Pure JSDoc:**
```javascript
/**
   * Compares this entity to another for equality.
   * Entities are equal if they have the same ID.
   *
   * @param {Entity} other - The other entity
   * @returns {boolean} True if equal
   */
```
---
#### METHOD: Entity.if
- **Scope:** instance
- **LLM Call Syntax:** `entity.if(!this._id || !other._id);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Entity.toData
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.toData();`
- **Pure JSDoc:**
```javascript
/**
   * Converts the entity to a plain object for persistence.
   * Subclasses must implement this method.
   *
   * @abstract
   * @returns {Object} Plain object representation
   */
```
---
#### METHOD: Entity.fromData
- **Scope:** static
- **LLM Call Syntax:** `const result = Entity.fromData(data);`
- **Pure JSDoc:**
```javascript
/**
   * Creates an entity instance from a plain object.
   * Subclasses must implement this static method.
   *
   * @abstract
   * @static
   * @param {Object} data - Plain object data
   * @returns {Entity} Entity instance
   */
```
---
#### METHOD: Entity.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Gets a string representation of the entity.
   *
   * @returns {string} String representation
   */
```
---
<br>

## CLASS: directly
**File Path:** `DomainRepositoryLib/src/Entity.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: whose
**File Path:** `DomainRepositoryLib/src/Entity.js`
**Constructor Usage:** `const instance = new whose();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: to
**File Path:** `DomainRepositoryLib/src/Entity.js`
**Constructor Usage:** `const instance = new to();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: Aggregate
**File Path:** `DomainRepositoryLib/src/Aggregate.js`
**Constructor Usage:** `const instance = new Aggregate();`
**Description:** Abstract base class for domain aggregates, managing child entities and cross-entity invariants.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for domain aggregates, managing child entities and cross-entity invariants.
 * @abstract
 * @class
 * @extends Entity
 */
```

### Methods of Aggregate

#### METHOD: Aggregate.if
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Aggregate.getChildren
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.getChildren();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a shallow copy of the current child entity collection.
   * @returns {Array<Entity>} List of managed child entities.
   */
```
---
#### METHOD: Aggregate.addChild
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.addChild(child);`
- **Pure JSDoc:**
```javascript
/**
   * Appends a child entity to the aggregate and marks the structure as dirty.
   * @protected
   * @param {Entity} child Entity instance to include in the aggregate.
   */
```
---
#### METHOD: Aggregate.removeChild
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.removeChild(child);`
- **Pure JSDoc:**
```javascript
/**
   * Removes a child entity from the aggregate and marks the structure as dirty.
   * @protected
   * @param {Entity} child Entity instance to remove.
   */
```
---
#### METHOD: Aggregate.if
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.if(index > -1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Aggregate.validateInvariants
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.validateInvariants();`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates domain-specific invariants across the aggregate boundary.
   * @abstract
   * @returns {boolean} True if all aggregate-level business rules are satisfied.
   */
```
---
#### METHOD: Aggregate.addInvariantViolation
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.addInvariantViolation(message);`
- **Pure JSDoc:**
```javascript
/**
   * Records a business rule violation message during the validation process.
   * @protected
   * @param {string} message Description of the invariant violation.
   */
```
---
#### METHOD: Aggregate.getInvariantViolations
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.getInvariantViolations();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all recorded invariant violation messages.
   * @returns {string[]} Collection of violation descriptions.
   */
```
---
#### METHOD: Aggregate.hasInvariantViolations
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.hasInvariantViolations();`
- **Pure JSDoc:**
```javascript
/**
   * Checks for the presence of any recorded invariant violations.
   * @returns {boolean} True if violations registry is non-empty.
   */
```
---
#### METHOD: Aggregate.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.validate();`
- **Pure JSDoc:**
```javascript
/**
   * Performs comprehensive validation including base entity checks and aggregate invariants.
   * @returns {boolean} True if both structural and domain-level rules are satisfied.
   */
```
---
#### METHOD: Aggregate.validateInvariantsOrThrow
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.validateInvariantsOrThrow();`
- **Pure JSDoc:**
```javascript
/**
   * Ensures domain invariants are satisfied, throwing an exception upon failure.
   * @throws {InvariantViolationException} If any aggregate invariants are violated.
   */
```
---
#### METHOD: Aggregate.validateOrThrow
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.validateOrThrow();`
- **Pure JSDoc:**
```javascript
/**
   * Executes full validation lifecycle and throws on any structural or invariant failure.
   * @throws {ValidationException} If base entity validation fails.
   * @throws {InvariantViolationException} If aggregate invariants are violated.
   */
```
---
#### METHOD: Aggregate.getChildCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.getChildCount();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the total count of entities currently managed by this aggregate.
   * @returns {number} Child entity count.
   */
```
---
#### METHOD: Aggregate.hasChildren
- **Scope:** instance
- **LLM Call Syntax:** `const result = aggregate.hasChildren();`
- **Pure JSDoc:**
```javascript
/**
   * Checks if the aggregate currently contains any child entities.
   * @returns {boolean} True if children registry is non-empty.
   */
```
---
#### METHOD: Aggregate.clearChildren
- **Scope:** instance
- **LLM Call Syntax:** `aggregate.clearChildren();`
- **Pure JSDoc:**
```javascript
/**
   * Removes all child entities from the aggregate and marks the structure as dirty.
   * @protected
   */
```
---
<br>

## CLASS: directly
**File Path:** `DomainRepositoryLib/src/Aggregate.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SpecificationBuilder
**File Path:** `DomainRepositoryLib/src/specifications/SpecificationBuilder.js`
**Constructor Usage:** `const instance = new SpecificationBuilder();`
**Description:** Fluent API orchestrator for assembling complex logical specifications through chainable method calls.

### Raw JSDoc Context:
```javascript
/**
 * Fluent API orchestrator for assembling complex logical specifications through chainable method calls.
 * @class
 */
```

### Methods of SpecificationBuilder

#### METHOD: SpecificationBuilder.create
- **Scope:** static
- **LLM Call Syntax:** `const result = SpecificationBuilder.create();`
- **Pure JSDoc:**
```javascript
/**
   * Starts building a new specification.
   *
   * @static
   * @returns {SpecificationBuilder} A new builder instance
   */
```
---
#### METHOD: SpecificationBuilder.field
- **Scope:** static
- **LLM Call Syntax:** `const result = SpecificationBuilder.field(field);`
- **Pure JSDoc:**
```javascript
/**
   * Starts building a field specification.
   *
   * @static
   * @param {string} field - The field name
   * @returns {Object} A field specification builder
   */
```
---
#### METHOD: SpecificationBuilder.field
- **Scope:** instance
- **LLM Call Syntax:** `const result = specificationBuilder.field(field);`
- **Pure JSDoc:**
```javascript
/**
   * Transitions to a field-specific building context for relational comparisons.
   * @param {string} field Dot-notation property path.
   * @returns {Object} Scoped builder for the specified attribute.
   */
```
---
#### METHOD: SpecificationBuilder.and
- **Scope:** instance
- **LLM Call Syntax:** `const result = specificationBuilder.and();`
- **Pure JSDoc:**
```javascript
/**
   * Configures the builder to join the next specification using logical AND.
   * @returns {this} Chainable builder instance.
   */
```
---
#### METHOD: SpecificationBuilder.or
- **Scope:** instance
- **LLM Call Syntax:** `const result = specificationBuilder.or();`
- **Pure JSDoc:**
```javascript
/**
   * Configures the builder to join the next specification using logical OR.
   * @returns {this} Chainable builder instance.
   */
```
---
#### METHOD: SpecificationBuilder.build
- **Scope:** instance
- **LLM Call Syntax:** `const result = specificationBuilder.build();`
- **Pure JSDoc:**
```javascript
/**
   * Synthesizes all registered logical units into a single Specification tree.
   * @returns {Object} Fully assembled composite or atomic specification.
   * @throws {Error} If no specifications were added to the builder.
   */
```
---
#### METHOD: SpecificationBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `specificationBuilder.if(this._specifications.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpecificationBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `specificationBuilder.if(this._specifications.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpecificationBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `specificationBuilder.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: SpecificationBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `specificationBuilder.if(item.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: FieldSpecificationBuilder
**File Path:** `DomainRepositoryLib/src/specifications/SpecificationBuilder.js`
**Constructor Usage:** `const instance = new FieldSpecificationBuilder();`
**Description:** Initializes builder with internal logic registries and default join operators.

### Raw JSDoc Context:
```javascript
/**
   * Initializes builder with internal logic registries and default join operators.
   * @private
   */
  constructor() {
    this._specifications = [];
    this._currentOperator = 'AND';
  }

  /**
   * Starts building a new specification.
   *
   * @static
   * @returns {SpecificationBuilder} A new builder instance
   */
  static create() {
    return new SpecificationBuilder();
  }

  /**
   * Starts building a field specification.
   *
   * @static
   * @param {string} field - The field name
   * @returns {Object} A field specification builder
   */
  static field(field) {
    return new FieldSpecificationBuilder(field, new SpecificationBuilder());
  }

  /**
   * Transitions to a field-specific building context for relational comparisons.
   * @param {string} field Dot-notation property path.
   * @returns {Object} Scoped builder for the specified attribute.
   */
  field(field) {
    return new FieldSpecificationBuilder(field, this);
  }

  /**
   * Configures the builder to join the next specification using logical AND.
   * @returns {this} Chainable builder instance.
   */
  and() {
    this._currentOperator = 'AND';
    return this;
  }

  /**
   * Configures the builder to join the next specification using logical OR.
   * @returns {this} Chainable builder instance.
   */
  or() {
    this._currentOperator = 'OR';
    return this;
  }

  /**
   * Records a specification instance within the internal assembly pipeline.
   * @private
   * @param {Object} specification Logical unit to include.
   */
  _addSpecification(specification) {
    this._specifications.push({
      spec: specification,
      operator: this._currentOperator
    });
  }

  /**
   * Synthesizes all registered logical units into a single Specification tree.
   * @returns {Object} Fully assembled composite or atomic specification.
   * @throws {Error} If no specifications were added to the builder.
   */
  build() {
    if (this._specifications.length === 0) {
      throw new Error('Cannot build specification - no specifications added');
    }

    if (this._specifications.length === 1) {
      return this._specifications[0].spec;
    }

    // Group specifications by operator
    let result = this._specifications[0].spec;

    for (let i = 1; i < this._specifications.length; i++) {
      const item = this._specifications[i];
      if (item.operator === 'AND') {
        result = result.and(item.spec);
      } else {
        result = result.or(item.spec);
      }
    }

    return result;
  }
}

/**
 * Context-aware builder for relational field comparisons, mapping operators to FieldSpecification instances.
 * @class
 * @private
 */
```

<br>

## CLASS: Specification
**File Path:** `DomainRepositoryLib/src/specifications/Specification.js`
**Constructor Usage:** `const instance = new Specification();`
**Description:** Internal registry hook to inject CompositeSpecification and resolve circular dependencies.

### Raw JSDoc Context:
```javascript
/**
 * Internal registry hook to inject CompositeSpecification and resolve circular dependencies.
 * @private
 * @param {Function} cls CompositeSpecification constructor.
 */
export function _registerCompositeSpecification(cls) {
  _CompositeSpecificationClass = cls;
}

/**
 * Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.
 * @abstract
 * @class
 */
```

<br>

## CLASS: directly
**File Path:** `DomainRepositoryLib/src/specifications/Specification.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(new.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: fails
**File Path:** `DomainRepositoryLib/src/specifications/Specification.js`
**Constructor Usage:** `const instance = new fails();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: name
**File Path:** `DomainRepositoryLib/src/specifications/Specification.js`
**Constructor Usage:** `const instance = new name();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of name

#### METHOD: name.catch
- **Scope:** instance
- **LLM Call Syntax:** `name.catch(_error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: FunctionSpecification
**File Path:** `DomainRepositoryLib/src/specifications/FunctionSpecification.js`
**Constructor Usage:** `const instance = new FunctionSpecification();`
**Description:** Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.

### Raw JSDoc Context:
```javascript
/**
 * Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.
 * @class
 * @extends Specification
 */
```

### Methods of FunctionSpecification

#### METHOD: FunctionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `functionSpecification.if(typeof predicateFunction !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FunctionSpecification.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = functionSpecification.isSatisfiedBy(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates the custom predicate against a target entity instance.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} Outcome of the predicate function.
   * @throws {SpecificationException} If the predicate function execution fails.
   */
```
---
#### METHOD: FunctionSpecification.catch
- **Scope:** instance
- **LLM Call Syntax:** `functionSpecification.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: FunctionSpecification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `functionSpecification.toQuery(_queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Prevents translation to database queries as arbitrary functions lack persistence mapping.
   * @throws {SpecificationException} Always, as translation is unsupported.
   */
```
---
#### METHOD: FunctionSpecification.canBeTranslatedToQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = functionSpecification.canBeTranslatedToQuery();`
- **Pure JSDoc:**
```javascript
/**
   * Indicates that function specifications are restricted to in-memory evaluation.
   * @returns {false} Always false.
   */
```
---
#### METHOD: FunctionSpecification.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = functionSpecification.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a semantic summary of the function-based specification.
   * @returns {string} Function description or generic label.
   */
```
---
<br>

## CLASS: FieldSpecification
**File Path:** `DomainRepositoryLib/src/specifications/FieldSpecification.js`
**Constructor Usage:** `const instance = new FieldSpecification();`
**Description:** Atomic specification for comparing entity field values against specific criteria using common relational operators.

### Raw JSDoc Context:
```javascript
/**
 * Atomic specification for comparing entity field values against specific criteria using common relational operators.
 * @class
 * @extends Specification
 */
```

### Methods of FieldSpecification

#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(!entity);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.for
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.for(const part of parts);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(value && typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = fieldSpecification.isSatisfiedBy(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates the relational criteria against a target entity's resolved field value.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity field satisfies the comparison.
   * @throws {SpecificationException} If entity is null/undefined or if operator-specific value constraints are violated.
   */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(entity);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.switch
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.switch(this._operator);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(this._secondValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(typeof fieldValue !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(typeof fieldValue !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: FieldSpecification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = fieldSpecification.toQuery(queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Maps the relational criteria to SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If the operator lacks a direct persistence mapping (e.g., notIn, notLike).
   */
```
---
#### METHOD: FieldSpecification.switch
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.switch(this._operator);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: FieldSpecification.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = fieldSpecification.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a human-readable string representation of the comparison criteria.
   * @returns {string} Relational expression string.
   */
```
---
#### METHOD: FieldSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification.if(this._operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ExpressionSpecification
**File Path:** `DomainRepositoryLib/src/specifications/ExpressionSpecification.js`
**Constructor Usage:** `const instance = new ExpressionSpecification();`
**Description:** Dynamic specification leveraging GasExpressionEngineLib for complex string-based evaluation and basic persistence translation.

### Raw JSDoc Context:
```javascript
/**
 * Dynamic specification leveraging GasExpressionEngineLib for complex string-based evaluation and basic persistence translation.
 * @class
 * @extends Specification
 */
```

### Methods of ExpressionSpecification

#### METHOD: ExpressionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.if(!expressionEngine);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExpressionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.if(this.expressionEngine);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExpressionSpecification.catch
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ExpressionSpecification.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionSpecification.isSatisfiedBy(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates the expression against a domain entity using the registered engine.
   * @param {Object} entity Domain entity providing evaluation context.
   * @returns {boolean} True if expression resolves to truthy.
   * @throws {SpecificationException} If evaluation fails due to syntax or engine errors.
   */
```
---
#### METHOD: ExpressionSpecification.catch
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ExpressionSpecification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionSpecification.toQuery(queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Attempts to parse and translate simple expressions into database query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If expression complexity exceeds translation capabilities.
   */
```
---
#### METHOD: ExpressionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.if(!match);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExpressionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExpressionSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `expressionSpecification.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExpressionSpecification.canBeTranslatedToQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionSpecification.canBeTranslatedToQuery();`
- **Pure JSDoc:**
```javascript
/**
   * Determines if the expression matches a supported simple pattern for database query translation.
   * @returns {boolean} True if expression follows simple field-operator-value structure.
   */
```
---
#### METHOD: ExpressionSpecification.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionSpecification.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a string representation of the underlying expression.
   * @returns {string} Formatted expression string.
   */
```
---
<br>

## CLASS: CompositeSpecification
**File Path:** `DomainRepositoryLib/src/specifications/CompositeSpecification.js`
**Constructor Usage:** `const instance = new CompositeSpecification();`
**Description:** Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.

### Raw JSDoc Context:
```javascript
/**
 * Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.
 * @class
 * @extends Specification
 */
```

### Methods of CompositeSpecification

#### METHOD: CompositeSpecification.for
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.for(const spec of this.specifications);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CompositeSpecification.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositeSpecification.isSatisfiedBy(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates the combined logical state against a target entity instance.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity satisfies the composite logic.
   * @throws {SpecificationException} If NOT operator is used with multiple children.
   */
```
---
#### METHOD: CompositeSpecification.switch
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.switch(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.specifications.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositeSpecification.toQuery(queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Translates the composite logic into SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If using NOT operator (unsupported) or if children are non-translatable.
   */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.for
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.for(const spec of this.specifications);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CompositeSpecification.for
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CompositeSpecification.where
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.where(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method where */
```
---
#### METHOD: CompositeSpecification.andWhere
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.andWhere(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method andWhere */
```
---
#### METHOD: CompositeSpecification.orWhere
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.orWhere(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method orWhere */
```
---
#### METHOD: CompositeSpecification.whereLike
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.whereLike(field, pattern);`
- **Pure JSDoc:**
```javascript
/** Method whereLike */
```
---
#### METHOD: CompositeSpecification.whereIn
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.whereIn(field, values);`
- **Pure JSDoc:**
```javascript
/** Method whereIn */
```
---
#### METHOD: CompositeSpecification.for
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.for(const clause of tempBuilder._whereClauses);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(clause.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(clause.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.canBeTranslatedToQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositeSpecification.canBeTranslatedToQuery();`
- **Pure JSDoc:**
```javascript
/**
   * Determines if the entire composite tree possesses a supported database mapping.
   * @returns {boolean} True if all branches are translatable and no unsupported operators are present.
   */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CompositeSpecification.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositeSpecification.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a recursive string representation of the logical tree.
   * @returns {string} Logical expression string.
   */
```
---
#### METHOD: CompositeSpecification.if
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification.if(this.operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: QueryTranslator
**File Path:** `DomainRepositoryLib/src/internal/query/QueryTranslator.js`
**Constructor Usage:** `const instance = new QueryTranslator();`
**Description:** Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.

### Raw JSDoc Context:
```javascript
/**
 * Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.
 * @class
 */
```

### Methods of QueryTranslator

#### METHOD: QueryTranslator.translate
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator.translate(specification, queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Applies domain specification filters to a database query builder.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If specification is null, queryBuilder is missing, or translation is unsupported.
   */
```
---
#### METHOD: QueryTranslator.if
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.if(!specification);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryTranslator.if
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.if(!queryBuilder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryTranslator.catch
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueryTranslator.if
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.if(error instanceof SpecificationException);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryTranslator.catch
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueryTranslator.if
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.if(error instanceof SpecificationException);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryTranslator.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator.validate(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates if a given specification possesses a supported mapping to database query structures.
   * @param {Object} specification Criteria to validate.
   * @returns {{valid:boolean, reason:string|null}} Validation outcome and failure explanation.
   */
```
---
#### METHOD: QueryTranslator.if
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.if(!specification);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryTranslator.tryTranslate
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator.tryTranslate(specification, queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Safely attempts specification translation, encapsulating potential failures in a result object.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {{success:boolean, queryBuilder:Object|null, error:string|null}} Operation result metadata.
   */
```
---
#### METHOD: QueryTranslator.catch
- **Scope:** instance
- **LLM Call Syntax:** `queryTranslator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: MappingConfiguration
**File Path:** `DomainRepositoryLib/src/internal/mapping/MappingConfiguration.js`
**Constructor Usage:** `const instance = new MappingConfiguration();`
**Description:** Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.

### Raw JSDoc Context:
```javascript
/**
 * Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.
 * @class
 */
```

### Methods of MappingConfiguration

#### METHOD: MappingConfiguration.addDynamicFieldMapping
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.addDynamicFieldMapping(config);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a new dynamic field aggregation strategy.
   * @param {Object|DynamicFieldMapping} config mapping configuration or instance.
   * @returns {this} Chainable configuration instance.
   */
```
---
#### METHOD: MappingConfiguration.addJsonExpansionMapping
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.addJsonExpansionMapping(config);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a new JSON property expansion strategy.
   * @param {Object|JsonExpansionMapping} config mapping configuration or instance.
   * @returns {this} Chainable configuration instance.
   */
```
---
#### METHOD: MappingConfiguration.getDynamicFieldMapping
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.getDynamicFieldMapping(propertyName);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves an aggregation strategy by its target entity property identifier.
   * @param {string} propertyName Entity attribute key.
   * @returns {Object|null} Registered mapping or null.
   */
```
---
#### METHOD: MappingConfiguration.getJsonExpansionMapping
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.getJsonExpansionMapping(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves an expansion strategy by its source database column identifier.
   * @param {string} columnName physical database column.
   * @returns {Object|null} Registered mapping or null.
   */
```
---
#### METHOD: MappingConfiguration.getAllDynamicFieldMappings
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.getAllDynamicFieldMappings();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a collection of all active dynamic field aggregation strategies.
   * @returns {Array<Object>} Collection of registered mappings.
   */
```
---
#### METHOD: MappingConfiguration.getAllJsonExpansionMappings
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.getAllJsonExpansionMappings();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a collection of all active JSON expansion strategies.
   * @returns {Array<Object>} Collection of registered mappings.
   */
```
---
#### METHOD: MappingConfiguration.hasDynamicFieldMappings
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.hasDynamicFieldMappings();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if any dynamic field strategies are currently registered.
   * @returns {boolean} True if aggregation registry is non-empty.
   */
```
---
#### METHOD: MappingConfiguration.hasJsonExpansionMappings
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.hasJsonExpansionMappings();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if any JSON expansion strategies are currently registered.
   * @returns {boolean} True if expansion registry is non-empty.
   */
```
---
#### METHOD: MappingConfiguration.clear
- **Scope:** instance
- **LLM Call Syntax:** `mappingConfiguration.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all mapping strategies from the configuration container.
   */
```
---
#### METHOD: MappingConfiguration.findJsonExpansionMappingForProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = mappingConfiguration.findJsonExpansionMappingForProperty(propertyName);`
- **Pure JSDoc:**
```javascript
/**
   * Locates the JSON expansion strategy that manages a specific entity property.
   * @param {string} propertyName Entity attribute key.
   * @returns {Object|null} Participating mapping or null.
   */
```
---
<br>

## CLASS: JsonExpansionMapping
**File Path:** `DomainRepositoryLib/src/internal/mapping/JsonExpansionMapping.js`
**Constructor Usage:** `const instance = new JsonExpansionMapping();`
**Description:** Configuration for JSON-expanded property mapping.
Enables expanding a single JSON column into multiple first-class entity properties.

### Raw JSDoc Context:
```javascript
/**
 * Configuration for JSON-expanded property mapping.
 * Enables expanding a single JSON column into multiple first-class entity properties.
 *
 * @class
 */
```

### Methods of JsonExpansionMapping

#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(!this.column || typeof this.column !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(typeof prop !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.hydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = jsonExpansionMapping.hydrate(row);`
- **Pure JSDoc:**
```javascript
/**
   * Parses JSON from the target column and expands constituent keys into individual object properties.
   * @param {Object} row Raw persistence data record.
   * @returns {Object} Extracted properties map.
   */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(!jsonValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(typeof jsonValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.catch(parseError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(typeof jsonValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: JsonExpansionMapping.dehydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = jsonExpansionMapping.dehydrate(entityData);`
- **Pure JSDoc:**
```javascript
/**
   * Collapses individual entity properties back into a single JSON-serialized string for the target column.
   * @param {Object} entityData Attributes containing expanded properties.
   * @returns {Object} Object containing the serialized JSON column.
   */
```
---
#### METHOD: JsonExpansionMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.for(const prop of this.properties);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(prop in entityData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JsonExpansionMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: JsonExpansionMapping.getColumnName
- **Scope:** instance
- **LLM Call Syntax:** `const result = jsonExpansionMapping.getColumnName();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the physical database column identifier managed by this mapping.
   * @returns {string} Column name.
   */
```
---
#### METHOD: JsonExpansionMapping.getProperties
- **Scope:** instance
- **LLM Call Syntax:** `const result = jsonExpansionMapping.getProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the list of entity attribute keys participating in this expansion strategy.
   * @returns {Array<string>} Collection of property names.
   */
```
---
#### METHOD: JsonExpansionMapping.managesProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = jsonExpansionMapping.managesProperty(propertyName);`
- **Pure JSDoc:**
```javascript
/**
   * Determines if a specific entity property is part of this expansion strategy.
   * @param {string} propertyName Attribute key to verify.
   * @returns {boolean} True if the property is in the constituent list.
   */
```
---
<br>

## CLASS: HydrationService
**File Path:** `DomainRepositoryLib/src/internal/mapping/HydrationService.js`
**Constructor Usage:** `const instance = new HydrationService();`
**Description:** Orchestrator for transforming persistence data records into domain Entity instances and vice versa.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for transforming persistence data records into domain Entity instances and vice versa.
 * @class
 */
```

### Methods of HydrationService

#### METHOD: HydrationService.hydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = hydrationService.hydrate(data, EntityClass);`
- **Pure JSDoc:**
```javascript
/**
   * Reconstitutes a single domain Entity from a raw data record.
   * @param {Object} data Raw persistence data record.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object} Hydrated domain entity instance.
   */
```
---
#### METHOD: HydrationService.hydrateMany
- **Scope:** instance
- **LLM Call Syntax:** `const result = hydrationService.hydrateMany(dataArray, EntityClass);`
- **Pure JSDoc:**
```javascript
/**
   * Reconstitutes a collection of domain Entities from a list of data records.
   * @param {Array<Object>} dataArray Collection of raw records.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Array<Object>} Collection of hydrated domain entities.
   */
```
---
#### METHOD: HydrationService.dehydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = hydrationService.dehydrate(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Reduces a domain Entity instance into a plain data record for persistence.
   * @param {Object} entity Domain entity instance.
   * @returns {Object} Persistence-ready data record.
   */
```
---
#### METHOD: HydrationService.dehydrateMany
- **Scope:** instance
- **LLM Call Syntax:** `const result = hydrationService.dehydrateMany(entities);`
- **Pure JSDoc:**
```javascript
/**
   * Reduces a collection of domain Entities into persistence-ready data records.
   * @param {Array<Object>} entities Collection of domain entities.
   * @returns {Array<Object>} Collection of plain data records.
   */
```
---
#### METHOD: HydrationService.storeOriginalData
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.storeOriginalData(entity, data);`
- **Pure JSDoc:**
```javascript
/**
   * Records the baseline state on an entity instance to enable change detection.
   * @param {Object} entity Target domain entity.
   * @param {Object} data Baseline state record.
   */
```
---
#### METHOD: HydrationService.if
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.if(entity && typeof entity.storeOriginalData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HydrationService.clearDirtyFields
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.clearDirtyFields(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Resets the modification tracking registry on the specified entity.
   * @param {Object} entity Target domain entity.
   */
```
---
#### METHOD: HydrationService.if
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.if(entity && typeof entity.clearDirtyFields);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HydrationService.refresh
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.refresh(entity, data);`
- **Pure JSDoc:**
```javascript
/**
   * Synchronizes an existing entity instance with new data while maintaining object identity.
   * @param {Object} entity Target domain entity instance.
   * @param {Object} data Fresh state data for synchronization.
   */
```
---
#### METHOD: HydrationService.if
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.if(!entity || !data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HydrationService.for
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.for(const key of keys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: HydrationService.if
- **Scope:** instance
- **LLM Call Syntax:** `hydrationService.if(key in entity);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: EntityMapper
**File Path:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.js`
**Constructor Usage:** `const instance = new EntityMapper();`
**Description:** Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.

### Raw JSDoc Context:
```javascript
/**
 * Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.
 * @class
 */
```

### Methods of EntityMapper

#### METHOD: EntityMapper.registerTransformer
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.registerTransformer(fieldName, toData, fromData);`
- **Pure JSDoc:**
```javascript
/**
   * Defines custom conversion logic for a specific entity attribute.
   * @param {string} fieldName target domain attribute identifier.
   * @param {Function} toData Transformation logic for persistence (entity -> data).
   * @param {Function} fromData Transformation logic for hydration (data -> entity).
   */
```
---
#### METHOD: EntityMapper.configureDynamicField
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.configureDynamicField(config);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a schema-driven strategy for aggregating multiple database columns into an entity Map property.
   * @param {Object} config Dynamic mapping configuration.
   * @returns {this} Chainable mapper instance.
   */
```
---
#### METHOD: EntityMapper.configureJsonExpansion
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.configureJsonExpansion(config);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a strategy for expanding or collapsing individual database properties into a JSON-serialized column.
   * @param {Object} config JSON expansion configuration.
   * @returns {this} Chainable mapper instance.
   */
```
---
#### METHOD: EntityMapper.getMappingConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.getMappingConfiguration();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the active mapping configuration container.
   * @returns {MappingConfiguration} current configuration state.
   */
```
---
#### METHOD: EntityMapper.toData
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.toData(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a domain Entity into a plain data record suitable for persistence, applying all registered transformers and expansions.
   * @param {Object} entity Domain entity to dehydrate.
   * @returns {Object|null} Persistence data record or null if entity is missing.
   */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(!entity);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const [fieldName, transformer] of this._customTransformers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(fieldName in data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const key of keys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(typeof entity.getDynamicColumns !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(value instanceof ValueObject);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(value instanceof Date);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(value && typeof value.toData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.fromData
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.fromData(data, EntityClass);`
- **Pure JSDoc:**
```javascript
/**
   * Reconstitutes a domain Entity from a persistent data record using specified class and registered mappings.
   * @param {Object} data Raw persistence data record.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object|null} Hydrated domain entity or null if data is missing.
   * @throws {DomainException} If EntityClass is not provided.
   */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(!data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(!EntityClass);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const [fieldName, transformer] of this._customTransformers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(fieldName in transformedData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(entity && typeof entity.captureDynamicColumns);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.fromDataArray
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.fromDataArray(dataArray, EntityClass);`
- **Pure JSDoc:**
```javascript
/**
   * Batch transforms multiple persistence records into hydrated domain entities.
   * @param {Object[]} dataArray Collection of raw records.
   * @param {Function} EntityClass Target domain entity constructor.
   * @returns {Object[]} Collection of hydrated domain entities.
   */
```
---
#### METHOD: EntityMapper.toDataArray
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.toDataArray(entities);`
- **Pure JSDoc:**
```javascript
/**
   * Batch transforms multiple domain entities into persistence records.
   * @param {Object[]} entities Collection of domain entities.
   * @returns {Object[]} Collection of raw persistence records.
   */
```
---
#### METHOD: EntityMapper.cloneData
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper.cloneData(data);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a deep structural copy of a persistence data object.
   * @param {Object} data Record to clone.
   * @returns {Object} cloned data record.
   */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(!data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const mapping of mappings);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const mapping of mappings);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const mapping of mappings);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.for
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.for(const mapping of mappings);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EntityMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper.if(mapValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: and
**File Path:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.js`
**Constructor Usage:** `const instance = new and();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: has
**File Path:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.js`
**Constructor Usage:** `const instance = new has();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: DynamicFieldMapping
**File Path:** `DomainRepositoryLib/src/internal/mapping/DynamicFieldMapping.js`
**Constructor Usage:** `const instance = new DynamicFieldMapping();`
**Description:** Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.

### Raw JSDoc Context:
```javascript
/**
 * Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.
 * @class
 */
```

### Methods of DynamicFieldMapping

#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(!this.propertyName || typeof this.propertyName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(!this.schemaProvider || typeof this.schemaProvider !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(!this.columnPattern || typeof this.columnPattern !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(!this.aggregate || typeof this.aggregate !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(!this.expand || typeof this.expand !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.hydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dynamicFieldMapping.hydrate(row);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms raw database row data into an aggregated entity Map property.
   * @param {Object} row Raw persistence data record.
   * @returns {Map<string, *>} Aggregated domain attribute state.
   */
```
---
#### METHOD: DynamicFieldMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.for(const key of schemaKeys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(aggregatedValue !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DynamicFieldMapping.dehydrate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dynamicFieldMapping.dehydrate(mapValue);`
- **Pure JSDoc:**
```javascript
/**
   * Flattens an entity Map property back into individual database column values.
   * @param {Map<string, *>} mapValue Aggregated domain attribute state.
   * @returns {Object.<string, *>} Flattened persistence data record.
   */
```
---
#### METHOD: DynamicFieldMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DynamicFieldMapping.getColumnNames
- **Scope:** instance
- **LLM Call Syntax:** `const result = dynamicFieldMapping.getColumnNames();`
- **Pure JSDoc:**
```javascript
/**
   * Identifies every database column consumed or produced by this dynamic mapping.
   * @returns {string[]} Collection of physical column names.
   */
```
---
#### METHOD: DynamicFieldMapping.for
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.for(const key of schemaKeys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DynamicFieldMapping.if
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.if(typeof columns);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DynamicFieldMapping.catch
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: SpecificationException
**File Path:** `DomainRepositoryLib/src/internal/errors/SpecificationException.js`
**Constructor Usage:** `const instance = new SpecificationException();`
**Description:** Exception class for failures during specification evaluation or translation to persistent queries.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for failures during specification evaluation or translation to persistent queries.
 * @class
 * @extends DomainException
 */
```

### Methods of SpecificationException

#### METHOD: SpecificationException.getSpecificationType
- **Scope:** instance
- **LLM Call Syntax:** `const result = specificationException.getSpecificationType();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the classification of the specification that caused the evaluation failure.
   * @returns {string|undefined} Specification type identifier.
   */
```
---
<br>

## CLASS: InvariantViolationException
**File Path:** `DomainRepositoryLib/src/internal/errors/InvariantViolationException.js`
**Constructor Usage:** `const instance = new InvariantViolationException();`
**Description:** Exception class for business rule violations that compromise aggregate integrity.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for business rule violations that compromise aggregate integrity.
 * @class
 * @extends DomainException
 */
```

### Methods of InvariantViolationException

#### METHOD: InvariantViolationException.getAggregateType
- **Scope:** instance
- **LLM Call Syntax:** `const result = invariantViolationException.getAggregateType();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the domain classification of the aggregate that failed invariant validation.
   * @returns {string} Aggregate type name.
   */
```
---
#### METHOD: InvariantViolationException.getViolations
- **Scope:** instance
- **LLM Call Syntax:** `const result = invariantViolationException.getViolations();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the comprehensive list of business rule violations detected.
   * @returns {string[]} Collection of violation descriptions.
   */
```
---
#### METHOD: InvariantViolationException.hasViolations
- **Scope:** instance
- **LLM Call Syntax:** `const result = invariantViolationException.hasViolations();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if the exception contains specific violation details.
   * @returns {boolean} True if the violations list is non-empty.
   */
```
---
<br>

## CLASS: EntityNotFoundException
**File Path:** `DomainRepositoryLib/src/internal/errors/EntityNotFoundException.js`
**Constructor Usage:** `const instance = new EntityNotFoundException();`
**Description:** Exception class for failed entity resolution by identifier or search specification.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for failed entity resolution by identifier or search specification.
 * @class
 * @extends DomainException
 */
```

### Methods of EntityNotFoundException

#### METHOD: EntityNotFoundException.getEntityType
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityNotFoundException.getEntityType();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the domain classification of the entity that failed resolution.
   * @returns {string} Entity type name.
   */
```
---
#### METHOD: EntityNotFoundException.getCriteria
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityNotFoundException.getCriteria();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the failed resolution parameters (ID or search object).
   * @returns {string|Object} Resolution criteria.
   */
```
---
<br>

## CLASS: DomainException
**File Path:** `DomainRepositoryLib/src/internal/errors/DomainException.js`
**Constructor Usage:** `const instance = new DomainException();`
**Description:** Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
Extends the shared {

### Raw JSDoc Context:
```javascript
/**
 * Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 *
 * Note: this class uses `context` as a short architectural label (a string) rather than the
 * structured-metadata object used by {@link BaseError}; it is reassigned explicitly below to
 * preserve that public contract.
 * @class
 * @extends BaseError
 */
```

<br>

## CLASS: EventDispatcher
**File Path:** `DomainRepositoryLib/src/events/EventDispatcher.js`
**Constructor Usage:** `const instance = new EventDispatcher();`
**Description:** Orchestrator for domain event distribution, managing handler registrations and execution lifecycles.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for domain event distribution, managing handler registrations and execution lifecycles.
 * @class
 */
```

### Methods of EventDispatcher

#### METHOD: EventDispatcher.on
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.on(eventType, handler, handlerName);`
- **Pure JSDoc:**
```javascript
/**
   * Subscribes a handler function to a specific event type.
   * @param {string} eventType Domain event classification to monitor.
   * @param {Function} handler Callback function executed on dispatch.
   * @param {string|null} [handlerName] Optional identifier for diagnostic tracking.
   * @throws {Error} If the provided handler is not a function.
   */
```
---
#### METHOD: EventDispatcher.if
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.if(typeof handler !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EventDispatcher.off
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.off(eventType, handler);`
- **Pure JSDoc:**
```javascript
/**
   * Unsubscribes a specific handler or all handlers associated with an event type.
   * @param {string} eventType Domain event classification.
   * @param {Function} [handler] Specific handler function to remove; if omitted, all handlers for the type are purged.
   */
```
---
#### METHOD: EventDispatcher.if
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.if(!handler);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EventDispatcher.if
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.if(index > -1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EventDispatcher.dispatch
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.dispatch(event);`
- **Pure JSDoc:**
```javascript
/**
   * Executes all registered handlers for the provided domain event instance.
   * @param {Object} event Event instance containing state and type metadata.
   */
```
---
#### METHOD: EventDispatcher.for
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.for(const { handler, name } of handlers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EventDispatcher.catch
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EventDispatcher.dispatchMany
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.dispatchMany(events);`
- **Pure JSDoc:**
```javascript
/**
   * Sequentially dispatches a collection of domain events to their respective handlers.
   * @param {Array<Object>} events Collection of events to process.
   */
```
---
#### METHOD: EventDispatcher.for
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.for(const event of events);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EventDispatcher.getHandlers
- **Scope:** instance
- **LLM Call Syntax:** `const result = eventDispatcher.getHandlers(eventType);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the current registry of handler objects for a specific event type.
   * @param {string} eventType Domain event classification.
   * @returns {Array<{handler:Function, name:string}>} Collection of registered handler metadata.
   */
```
---
#### METHOD: EventDispatcher.clearHandlers
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.clearHandlers(eventType);`
- **Pure JSDoc:**
```javascript
/**
   * Purges every handler registration associated with the specified event type.
   * @param {string} eventType Domain event classification.
   */
```
---
#### METHOD: EventDispatcher.clearAll
- **Scope:** instance
- **LLM Call Syntax:** `eventDispatcher.clearAll();`
- **Pure JSDoc:**
```javascript
/**
   * Resets the entire dispatcher registry, removing all handler subscriptions across all event types.
   */
```
---
#### METHOD: EventDispatcher.getHandlerCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = eventDispatcher.getHandlerCount(eventType);`
- **Pure JSDoc:**
```javascript
/**
   * Returns the total number of active handler subscriptions for a given event type.
   * @param {string} eventType Domain event classification.
   * @returns {number} Active handler count.
   */
```
---
<br>

## CLASS: DomainEvent
**File Path:** `DomainRepositoryLib/src/events/DomainEvent.js`
**Constructor Usage:** `const instance = new DomainEvent();`
**Description:** Base class for capturing significant domain-layer occurrences, providing identity and timing metadata.

### Raw JSDoc Context:
```javascript
/**
 * Base class for capturing significant domain-layer occurrences, providing identity and timing metadata.
 * @class
 */
```

### Methods of DomainEvent

#### METHOD: DomainEvent.getEventType
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.getEventType();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the classification identifier for this event.
   * @returns {string} Event type string.
   */
```
---
#### METHOD: DomainEvent.getEventName
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.getEventName();`
- **Pure JSDoc:**
```javascript
/**
   * Alias for getEventType, returning the semantic name of the event.
   * @returns {string} Event name string.
   */
```
---
#### METHOD: DomainEvent.getPayload
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.getPayload();`
- **Pure JSDoc:**
```javascript
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
```
---
#### METHOD: DomainEvent.getOccurredAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.getOccurredAt();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the timestamp when the event was recorded.
   * @returns {Date} Occurrence timestamp.
   */
```
---
#### METHOD: DomainEvent.getEventId
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.getEventId();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the unique identifier assigned to this specific event instance.
   * @returns {string} Unique event ID.
   */
```
---
#### METHOD: DomainEvent.toObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.toObject();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the domain event into a plain data structure for persistence or transmission.
   * @returns {{eventId:string, eventType:string, eventName:string, payload:Object, occurredAt:string}} Serialized state.
   */
```
---
#### METHOD: DomainEvent.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Automatic JSON serialization handler.
   * @returns {Object} Plain object representation.
   */
```
---
#### METHOD: DomainEvent.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainEvent.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a concise string representation of the event type and identifier.
   * @returns {string} Formatted event summary.
   */
```
---
<br>

## CLASS: EntityCreatedEvent
**File Path:** `DomainRepositoryLib/src/events/DomainEvent.js`
**Constructor Usage:** `const instance = new EntityCreatedEvent();`
**Description:** Initializes domain event with type, payload, and occurrence timestamp.

### Raw JSDoc Context:
```javascript
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
```

<br>

## CLASS: EntityUpdatedEvent
**File Path:** `DomainRepositoryLib/src/events/DomainEvent.js`
**Constructor Usage:** `const instance = new EntityUpdatedEvent();`
**Description:** Initializes creation event with target entity metadata.

### Raw JSDoc Context:
```javascript
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
```

<br>

## CLASS: EntityDeletedEvent
**File Path:** `DomainRepositoryLib/src/events/DomainEvent.js`
**Constructor Usage:** `const instance = new EntityDeletedEvent();`
**Description:** Initializes update event with modification details.

### Raw JSDoc Context:
```javascript
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
```

<br>

