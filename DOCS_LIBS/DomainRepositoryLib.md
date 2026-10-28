# API Reference: DomainRepositoryLib

## CLASS: ValueObject
**File Path:** `DomainRepositoryLib/src/ValueObject.ts`
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

### Methods and properties of ValueObject

#### METHOD: ValueObject._freeze
- **Scope:** instance
- **LLM Call Syntax:** `valueObject._freeze();`
- **Pure JSDoc:**
```javascript
/**
   * Finalizes the value object by making it immutable via Object.freeze.
   * @protected
   */
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
#### METHOD: ValueObject._deepEquals
- **Scope:** instance
- **LLM Call Syntax:** `const result = valueObject._deepEquals(a, b);`
- **Pure JSDoc:**
```javascript
/**
   * Recursively evaluates equality between two values, supporting primitives, arrays, and objects.
   * @private
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {boolean} True if values are deeply equivalent.
   */
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

## CLASS: Repository
**File Path:** `DomainRepositoryLib/src/Repository.ts`
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

### Methods and properties of Repository

#### METHOD: Repository._isDryRun
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository._isDryRun(options);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates if operations should be simulated based on instance state or method overrides.
   * @private
   * @param {Object} [options={}] Call-specific options.
   * @returns {boolean} True if simulation mode is active.
   */
```
---
#### METHOD: Repository._getTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository._getTable();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the primary table service from the database container.
   * @private
   * @returns {Object} Table interface for persistence operations.
   * @throws {DomainException} If database is invalid or table does not exist.
   */
```
---
#### METHOD: Repository._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository._executeWithRetry(operation, maxRetries);`
- **Pure JSDoc:**
```javascript
/**
   * Wraps an operation in transient error handling logic if ExceptionService is available.
   * @private
   * @param {Function} operation Logical block to execute.
   * @param {number} [maxRetries=3] Maximum attempt limit.
   * @returns {*} Result of the logical block execution.
   */
```
---
#### METHOD: Repository._withKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = repository._withKey(rows);`
- **Pure JSDoc:**
```javascript
/**
   * Drops rows whose primary-key cell is blank (e.g. a checkbox column pre-filled below the
   * data makes SheetDBLib return a row that has no identity). Such rows are never entities.
   * @private
   * @param {Array<Object>} rows Raw table rows.
   * @returns {Array<Object>} Rows with a non-blank primary key.
   */
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
#### METHOD: Repository._clearCache
- **Scope:** instance
- **LLM Call Syntax:** `repository._clearCache();`
- **Pure JSDoc:**
```javascript
/**
   * Clears the cache for this repository.
   * @private
   */
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

## CLASS: Entity
**File Path:** `DomainRepositoryLib/src/Entity.ts`
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

### Methods and properties of Entity

#### PROPERTY: Entity.id
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.id;`
- **Pure JSDoc:**
```javascript
/**
   * Sets the entity ID.
   *
   * @param {string} value - The entity ID
   */
```
---
#### PROPERTY: Entity.createdAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.createdAt;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the creation timestamp.
   *
   * @returns {Date} The creation timestamp
   */
```
---
#### PROPERTY: Entity.updatedAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity.updatedAt;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the last update timestamp.
   *
   * @returns {Date} The last update timestamp
   */
```
---
#### METHOD: Entity._parseDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = entity._parseDate(value);`
- **Pure JSDoc:**
```javascript
/**
   * Centralized date parser delegating to CoreUtilsLib for consistent format handling.
   * @private
   * @param {Date|string|number} value Raw date input.
   * @returns {Date|null} Parsed Date object or null if unparseable.
   */
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

## CLASS: Specification
**File Path:** `DomainRepositoryLib/src/specifications/Specification.ts`
**Constructor Usage:** `const instance = new Specification();`
**Description:** Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.
 * @abstract
 * @class
 */
```

### Methods and properties of Specification

#### METHOD: Specification.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.isSatisfiedBy(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates the specification logic against a domain entity instance.
   * @abstract
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity satisfies the business rule.
   * @throws {Error} If the subclass fails to implement this method.
   */
```
---
#### METHOD: Specification.and
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.and(other);`
- **Pure JSDoc:**
```javascript
/**
   * Chains the current specification with another using logical AND.
   * @param {Specification} other Follow-on specification.
   * @returns {Specification} Combined composite specification.
   */
```
---
#### METHOD: Specification.or
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.or(other);`
- **Pure JSDoc:**
```javascript
/**
   * Chains the current specification with another using logical OR.
   * @param {Specification} other Alternative specification.
   * @returns {Specification} Combined composite specification.
   */
```
---
#### METHOD: Specification.not
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.not();`
- **Pure JSDoc:**
```javascript
/**
   * Negates the current specification using logical NOT.
   * @returns {Specification} Negated composite specification.
   */
```
---
#### METHOD: Specification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.toQuery(queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Translates the domain rule into SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {Error} If the specification does not support database translation.
   */
```
---
#### METHOD: Specification.toQueryObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.toQueryObject();`
- **Pure JSDoc:**
```javascript
/**
   * Percorso rapido di pushdown per specification domain-pure.
   *
   * Restituisce un oggetto di uguaglianze `{colonna: valore}` quando la regola è
   * interamente esprimibile come uguaglianze, `null` quando serve la valutazione
   * in memoria. Alternativa a `toQuery(queryBuilder)`: permette al layer di
   * dominio di restare libero da qualsiasi import di query builder.
   *
   * INVARIANTE — quando restituisce un oggetto non-null, il filtro deve essere
   * ESATTAMENTE equivalente a isSatisfiedBy(). Repository.find() applica UNO SOLO
   * dei due: se divergono, il risultato è silenziosamente sbagliato, senza errori.
   * Nel dubbio, restituire null.
   *
   * @returns {Record<string, unknown>|null}
   */
```
---
#### METHOD: Specification.canBeTranslatedToQuery
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.canBeTranslatedToQuery();`
- **Pure JSDoc:**
```javascript
/**
   * Uses the static query-object path first, then probes genuine toQuery overrides.
   * @returns {boolean} True if the specification can be expressed as a database query.
   */
```
---
#### METHOD: Specification.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = specification.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns a concise string representation of the specification type.
   * @returns {string} Formatted class name.
   */
```
---
<br>

## CLASS: FunctionSpecification
**File Path:** `DomainRepositoryLib/src/specifications/FunctionSpecification.ts`
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

### Methods and properties of FunctionSpecification

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
#### METHOD: FunctionSpecification.toQuery
- **Scope:** instance
- **LLM Call Syntax:** `functionSpecification.toQuery();`
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
**File Path:** `DomainRepositoryLib/src/specifications/FieldSpecification.ts`
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

### Methods and properties of FieldSpecification

#### METHOD: FieldSpecification._validateOperator
- **Scope:** instance
- **LLM Call Syntax:** `fieldSpecification._validateOperator();`
- **Pure JSDoc:**
```javascript
/**
   * Enforces usage of supported relational comparison operators.
   * @private
   * @throws {SpecificationException} If operator classification is unknown.
   */
```
---
#### METHOD: FieldSpecification._getFieldValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = fieldSpecification._getFieldValue(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Safely resolves the value of the target field from an entity instance, supporting nested path navigation.
   * @private
   * @param {Object} entity Target domain entity.
   * @returns {*} Resolved field value or undefined if path resolution fails.
   */
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
#### METHOD: FieldSpecification.toQueryObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = fieldSpecification.toQueryObject();`
- **Pure JSDoc:**
```javascript
/**
   * Exposes an exact equality criterion for query-object pushdown.
   * @returns {Record<string, unknown>|null} Equality criterion or null for other operators.
   */
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
<br>

## CLASS: EqualityFieldSpec
**File Path:** `DomainRepositoryLib/src/specifications/EqualityFieldSpec.ts`
**Constructor Usage:** `const instance = new EqualityFieldSpec();`
**Description:** Specification di uguaglianza in cui isSatisfiedBy e toQueryObject sono
coerenti per costruzione: il valore letto dall'entità e quello confrontato
nella query sono lo stesso.

### Raw JSDoc Context:
```javascript
/**
 * Specification di uguaglianza in cui isSatisfiedBy e toQueryObject sono
 * coerenti per costruzione: il valore letto dall'entità e quello confrontato
 * nella query sono lo stesso.
 */
```

### Methods and properties of EqualityFieldSpec

#### METHOD: EqualityFieldSpec.isSatisfiedBy
- **Scope:** instance
- **LLM Call Syntax:** `equalityFieldSpec.isSatisfiedBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EqualityFieldSpec.toQueryObject
- **Scope:** instance
- **LLM Call Syntax:** `equalityFieldSpec.toQueryObject();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: EqualityFieldSpec.toString
- **Scope:** instance
- **LLM Call Syntax:** `equalityFieldSpec.toString();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: CompositeSpecification
**File Path:** `DomainRepositoryLib/src/specifications/CompositeSpecification.ts`
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

### Methods and properties of CompositeSpecification

#### METHOD: CompositeSpecification._validateOperator
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification._validateOperator();`
- **Pure JSDoc:**
```javascript
/**
   * Enforces usage of supported logical operators.
   * @private
   * @throws {SpecificationException} If operator is not AND, OR, or NOT.
   */
```
---
#### METHOD: CompositeSpecification._validateSpecifications
- **Scope:** instance
- **LLM Call Syntax:** `compositeSpecification._validateSpecifications();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the constituent collection contains valid Specification instances.
   * @private
   * @throws {SpecificationException} If the collection is empty or contains non-Specification types.
   */
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
<br>

## CLASS: QueryTranslator
**File Path:** `DomainRepositoryLib/src/internal/query/QueryTranslator.ts`
**Constructor Usage:** `const instance = new QueryTranslator();`
**Description:** Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.

### Raw JSDoc Context:
```javascript
/**
 * Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.
 * @class
 */
```

### Methods and properties of QueryTranslator

#### METHOD: QueryTranslator.translate
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator.translate(specification, queryBuilder, validation);`
- **Pure JSDoc:**
```javascript
/**
   * Applies domain specification filters to a database query builder.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @param {{valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null}|null} [validation=null] Optional analysis already produced for this operation.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If specification is null, queryBuilder is missing, or translation is unsupported.
   */
```
---
#### METHOD: QueryTranslator._queryObjectCriteria
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator._queryObjectCriteria(specification);`
- **Pure JSDoc:**
```javascript
/**
   * Reads the equality-criteria fast path once for the current operation.
   * @private
   * @param {Object} specification Candidate specification.
   * @returns {Record<string, unknown>|null} Equality criteria or null.
   */
```
---
#### METHOD: QueryTranslator._applyQueryObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryTranslator._applyQueryObject(criteria, queryBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * Applies a plain equality-criteria object (`{column: value}`) to a query builder.
   * @private
   * @param {Record<string, unknown>} criteria Equality criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {Object} The configured query builder.
   */
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
   * @returns {{valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null}} Validation outcome and the criterion evaluation for this operation.
   */
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
<br>

## CLASS: MappingConfiguration
**File Path:** `DomainRepositoryLib/src/internal/mapping/MappingConfiguration.ts`
**Constructor Usage:** `const instance = new MappingConfiguration();`
**Description:** Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.

### Raw JSDoc Context:
```javascript
/**
 * Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.
 * @class
 */
```

### Methods and properties of MappingConfiguration

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
**File Path:** `DomainRepositoryLib/src/internal/mapping/JsonExpansionMapping.ts`
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

### Methods and properties of JsonExpansionMapping

#### METHOD: JsonExpansionMapping._validate
- **Scope:** instance
- **LLM Call Syntax:** `jsonExpansionMapping._validate();`
- **Pure JSDoc:**
```javascript
/**
   * Enforces structural integrity of the expansion mapping configuration.
   * @private
   * @throws {Error} If column identifier is missing or properties list is invalid.
   */
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
**File Path:** `DomainRepositoryLib/src/internal/mapping/HydrationService.ts`
**Constructor Usage:** `const instance = new HydrationService();`
**Description:** Orchestrator for transforming persistence data records into domain Entity instances and vice versa.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for transforming persistence data records into domain Entity instances and vice versa.
 * @class
 */
```

### Methods and properties of HydrationService

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
<br>

## CLASS: EntityMapper
**File Path:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.ts`
**Constructor Usage:** `const instance = new EntityMapper();`
**Description:** Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.

### Raw JSDoc Context:
```javascript
/**
 * Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.
 * @class
 */
```

### Methods and properties of EntityMapper

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
#### METHOD: EntityMapper._serializeEntityFields
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper._serializeEntityFields(entity);`
- **Pure JSDoc:**
```javascript
/**
   * Serializes an entity with no `toData()` method by copying its own
   * non-underscore-prefixed properties.
   * @private
   * @param {Object} entity Domain entity to serialize.
   * @returns {Object} Plain data record.
   */
```
---
#### METHOD: EntityMapper._applyDynamicColumnPassthrough
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper._applyDynamicColumnPassthrough(data, entity);`
- **Pure JSDoc:**
```javascript
/**
   * Fills in any column captured by `Entity.captureDynamicColumns` that is not
   * already present in `data`, so wide/dynamic-column tables round-trip through
   * `Repository.save()` without the caller hand-building the merged row.
   * @private
   * @param {Object} data target data record (mutated in place).
   * @param {Object} entity source domain entity.
   */
```
---
#### METHOD: EntityMapper._serializeValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = entityMapper._serializeValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Recursively reduces complex domain values (ValueObjects, Dates, nested Entities) into serializable primitives.
   * @private
   * @param {*} value domain-layer value to serialize.
   * @returns {*} Persistence-ready value.
   */
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
#### METHOD: EntityMapper._applyJsonExpansionHydration
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper._applyJsonExpansionHydration(data);`
- **Pure JSDoc:**
```javascript
/**
   * Executes JSON-to-property expansion mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
```
---
#### METHOD: EntityMapper._applyJsonExpansionDehydration
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper._applyJsonExpansionDehydration(data);`
- **Pure JSDoc:**
```javascript
/**
   * Executes property-to-JSON collapse mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
```
---
#### METHOD: EntityMapper._applyDynamicFieldHydration
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper._applyDynamicFieldHydration(data);`
- **Pure JSDoc:**
```javascript
/**
   * Executes multi-column-to-Map aggregation mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   */
```
---
#### METHOD: EntityMapper._applyDynamicFieldDehydration
- **Scope:** instance
- **LLM Call Syntax:** `entityMapper._applyDynamicFieldDehydration(data, entity);`
- **Pure JSDoc:**
```javascript
/**
   * Executes Map-to-multi-column decomposition mappings on the provided data record.
   * @private
   * @param {Object} data target data record (mutated in place).
   * @param {Object} entity source domain entity for Map extraction.
   */
```
---
<br>

## CLASS: DynamicFieldMapping
**File Path:** `DomainRepositoryLib/src/internal/mapping/DynamicFieldMapping.ts`
**Constructor Usage:** `const instance = new DynamicFieldMapping();`
**Description:** Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.

### Raw JSDoc Context:
```javascript
/**
 * Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.
 * @class
 */
```

### Methods and properties of DynamicFieldMapping

#### METHOD: DynamicFieldMapping._validate
- **Scope:** instance
- **LLM Call Syntax:** `dynamicFieldMapping._validate();`
- **Pure JSDoc:**
```javascript
/**
   * Enforces structural integrity of the mapping configuration.
   * @private
   * @throws {Error} If required configuration properties or transform functions are missing.
   */
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
<br>

## CLASS: SpecificationException
**File Path:** `DomainRepositoryLib/src/internal/errors/SpecificationException.ts`
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

### Methods and properties of SpecificationException

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
**File Path:** `DomainRepositoryLib/src/internal/errors/InvariantViolationException.ts`
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

### Methods and properties of InvariantViolationException

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
**File Path:** `DomainRepositoryLib/src/internal/errors/EntityNotFoundException.ts`
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

### Methods and properties of EntityNotFoundException

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
**File Path:** `DomainRepositoryLib/src/internal/errors/DomainException.ts`
**Constructor Usage:** `const instance = new DomainException();`
**Description:** Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

Note: this class uses `context` as a short architectural label (a string) rather than the
structured-metadata object used by {@link BaseError}; it is reassigned explicitly below to
preserve that public contract.

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

### Methods and properties of DomainException

#### METHOD: DomainException.getDetails
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainException.getDetails();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the auxiliary diagnostic metadata associated with the exception.
   * @returns {Object} Metadata record.
   */
```
---
#### METHOD: DomainException.toObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = domainException.toObject();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the exception into a plain object suitable for logging or external transmission.
   * @returns {{name:string, message:string, context:string, details:Object, stack:string}} Serialized error state.
   */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: assertSpecificationContract
- **Source:** `DomainRepositoryLib/src/testing/specificationContract.ts`
- **LLM Call Syntax:** `const result = assertSpecificationContract(spec, rows, hydrate);`
- **Pure JSDoc:**
```javascript
/**
 * Verifica che le due metà di una specification concordino. Se toQueryObject()
 * è non-null, il filtro di uguaglianza deve selezionare ESATTAMENTE le stesse
 * righe di isSatisfiedBy().
 *
 * @param {Object} spec Specification da verificare.
 * @param {Array<Object>} rows Righe grezze rappresentative — positive E negative.
 * @param {Function} hydrate Trasforma una riga nell'entità valutata dalla spec.
 * @returns {{ok: boolean, divergenti: Array<Object>}}
 */
```

---
### FUNCTION: _registerCompositeSpecification
- **Source:** `DomainRepositoryLib/src/specifications/Specification.ts`
- **LLM Call Syntax:** `_registerCompositeSpecification(cls);`
- **Pure JSDoc:**
```javascript
/**
 * Internal registry hook to inject CompositeSpecification and resolve circular dependencies.
 * @private
 * @param {Function} cls CompositeSpecification constructor.
 */
```

---
