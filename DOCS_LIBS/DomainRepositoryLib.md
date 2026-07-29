# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [DomainRepositoryLib](#domainrepositorylib)

---

## DomainRepositoryLib

DomainRepositoryLib - Domain-Driven Design patterns for Google Apps Script

### Aggregate

Abstract base class for domain aggregates, managing child entities and cross-entity invariants.

**Initialization:**
```javascript
new Aggregate(data={}: Object)
```

**Methods:**

- `getChildren(): Array<Entity>`
  > Retrieves a shallow copy of the current child entity collection.

- `addChild(child: Entity): void`
  > Appends a child entity to the aggregate and marks the structure as dirty.

- `removeChild(child: Entity): void`
  > Removes a child entity from the aggregate and marks the structure as dirty.

- `validateInvariants(): boolean`
  > Evaluates domain-specific invariants across the aggregate boundary.

- `addInvariantViolation(message: string): void`
  > Records a business rule violation message during the validation process.

- `getInvariantViolations(): string[]`
  > Retrieves all recorded invariant violation messages.

- `hasInvariantViolations(): boolean`
  > Checks for the presence of any recorded invariant violations.

- `validate(): boolean`
  > Performs comprehensive validation including base entity checks and aggregate invariants.

- `validateInvariantsOrThrow(): void`
  > Ensures domain invariants are satisfied, throwing an exception upon failure.

- `validateOrThrow(): void`
  > Executes full validation lifecycle and throws on any structural or invariant failure.

- `getChildCount(): number`
  > Returns the total count of entities currently managed by this aggregate.

- `hasChildren(): boolean`
  > Checks if the aggregate currently contains any child entities.

- `clearChildren(): void`
  > Removes all child entities from the aggregate and marks the structure as dirty.


### Entity

Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.

**Initialization:**
```javascript
new Entity(data={}: Object, data.id: string, data.createdAt: Date|string, data.updatedAt: Date|string)
```

**Static Methods:**

- `fromData(data: Object): Entity`
  > Creates an entity instance from a plain object. Subclasses must implement this static method.

**Methods:**

- `markDirty(fieldName: string): void`
  > Registers a field as modified and updates the internal modification timestamp.

- `isDirty(fieldName: string): boolean`
  > Checks if a field has been modified since the last state synchronization.

- `getDirtyFields(): string[]`
  > Retrieves all fields that have been modified since the entity was loaded or cleared.

- `hasDirtyFields(): boolean`
  > Determines if the entity instance contains any pending uncommitted changes.

- `clearDirtyFields(): void`
  > Clears all dirty field markers.

- `getChanges(): Object`
  > Gets the changes made to the entity since load.

- `storeOriginalData(data: Object): void`
  > Stores the original data for comparison.

- `getOriginalValue(fieldName: string): *`
  > Gets the original value of a field.

- `captureDynamicColumns(data: Object): void`
  > Captures persistence columns not covered by this entity's own `toData()` schema, so a later `save()` round-trip does not silently drop them. Opt-in: a subclass whose physical schema is only partially known at compile time (e.g. a wide, per-subject matrix table generated at runtime from another table) declares a static `getKnownColumns()` returning its fixed column names; every other raw column present at hydration time is captured verbatim and merged back unmodified by `EntityMapper.toData()` (see `getDynamicColumns`). Entities that don't declare `getKnownColumns()` are unaffected (no-op).

- `getDynamicColumns(): Object`
  > Dynamic (schema-unknown-at-compile-time) columns captured at hydration time (see `captureDynamicColumns`), merged back into the persisted row by `EntityMapper.toData()` for any key not already produced by the entity's own `toData()`.

- `setDynamicColumn(column: string, value: *): void`
  > Sets (or adds) a single dynamic column value and marks it dirty, without requiring the subclass to model every wide-table column as a typed property. The value participates in the next `save()` via `getDynamicColumns()`.

- `addDomainEvent(event: Object): void`
  > Adds a domain event to the entity.

- `getDomainEvents(): Array<Object>`
  > Gets all domain events.

- `clearDomainEvents(): void`
  > Clears all domain events.

- `validate(): boolean`
  > Validates the entity against its specifications. Subclasses should override this method to implement validation.

- `isValid(): boolean`
  > Checks if the entity is valid.

- `getValidationErrors(): Array<Object>`
  > Gets validation errors.

- `addValidationError(field: string, message: string): void`
  > Adds a validation error.

- `validateOrThrow(): void`
  > Throws a ValidationException if the entity is invalid.

- `equals(other: Entity): boolean`
  > Compares this entity to another for equality. Entities are equal if they have the same ID.

- `toData(): Object`
  > Converts the entity to a plain object for persistence. Subclasses must implement this method.

- `toString(): string`
  > Gets a string representation of the entity.


### Repository

Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.

**Initialization:**
```javascript
new Repository(database: Object, tableName: string, EntityClass: Function, logger: Object|null, cache: Object|null, exceptionService: Object|null, options={}: Object, options.dryRun=false: boolean)
```

**Methods:**

- `find(specification: Object): Array<Object>`
  > Retrieves all entities satisfying the provided domain specification.

- `findOne(specification: Object): Object|null`
  > Retrieves the first entity satisfying the domain specification.

- `findById(id: string): Object|null`
  > Retrieves a single entity by its primary unique identifier with cache-first lookup.

- `findByIdOrFail(id: string): Object`
  > Retrieves entity by ID or throws if non-existent.

- `findAll(): Array<Object>`
  > Retrieves every record from the target table as hydrated entities.

- `exists(specification: Object): boolean`
  > Verifies if at least one entity satisfies the specified criteria.

- `count(specification: Object): number`
  > Returns the total number of entities satisfying the specification.

- `save(entity: Object, options={}: Object): Object`
  > Persists entity state via insertion or update, managing timestamps and dirty tracking.

- `saveMany(entities: Array<Object>): Array<Object>`
  > Executes batch persistence for multiple entities with bulk-insert optimization for new records.

- `patch(entity: Object, changes: Object): Object`
  > Performs a partial update on specific entity fields, minimizing I/O and API calls.

- `patchById(id: string, changes: Object): Object`
  > Performs partial update on a record identified by its unique ID.

- `delete(entity: Object): void`
  > Removes an entity instance from the persistent store.

- `deleteById(id: string): void`
  > Removes a record from the persistent store using its unique identifier.

- `deleteMany(entities: Array<Object>): void`
  > Removes multiple entities from the persistent store in a batch operation.

- `refresh(entity: Object): Object`
  > Synchronizes entity state with the current data in the persistent store.

- `getTable(): Object`
  > Returns the low-level TableService instance managed by the repository.

- `getEntityClass(): Function`
  > Returns the entity constructor used by this repository.

- `getTableName(): string`
  > Returns the name of the target table in the database.


### ValueObject

Abstract base class for domain value objects, enforcing immutability and value-based equality.

**Initialization:**
```javascript
new ValueObject()
```

**Methods:**

- `equals(other: ValueObject): boolean`
  > Compares this value object with another instance for deep structural equality.

- `toString(): string`
  > Generates a stringified representation of the value object's public properties.

- `getValue(): *`
  > Returns the underlying serializable data value represented by the object.


### DomainEvent

Base class for capturing significant domain-layer occurrences, providing identity and timing metadata.

**Initialization:**
```javascript
new DomainEvent(eventType: string, payload: Object, occurredAt=null: Date|null)
```

**Methods:**

- `getEventType(): string`
  > Returns the classification identifier for this event.

- `getEventName(): string`
  > Alias for getEventType, returning the semantic name of the event.

- `getPayload(): string`
  > Gets the event name as a property.

- `getOccurredAt(): Date`
  > Returns the timestamp when the event was recorded.

- `getEventId(): string`
  > Retrieves the unique identifier assigned to this specific event instance.

- `toObject(): {eventId:string, eventType:string, eventName:string, payload:Object, occurredAt:string`
  > Serializes the domain event into a plain data structure for persistence or transmission.

- `toJSON(): Object`
  > Automatic JSON serialization handler.

- `toString(): string`
  > Returns a concise string representation of the event type and identifier.


### EntityCreatedEvent

Initializes domain event with type, payload, and occurrence timestamp.

**Initialization:**
```javascript
new EntityCreatedEvent()
```


### EntityUpdatedEvent

Initializes creation event with target entity metadata.

**Initialization:**
```javascript
new EntityUpdatedEvent()
```


### EntityDeletedEvent

Initializes update event with modification details.

**Initialization:**
```javascript
new EntityDeletedEvent()
```


### EventDispatcher

Orchestrator for domain event distribution, managing handler registrations and execution lifecycles.

**Initialization:**
```javascript
new EventDispatcher(logger: Object|null)
```

**Methods:**

- `on(eventType: string, handler: Function, handlerName: string|null): void`
  > Subscribes a handler function to a specific event type.

- `off(eventType: string, handler: Function): void`
  > Unsubscribes a specific handler or all handlers associated with an event type.

- `dispatch(event: Object): void`
  > Executes all registered handlers for the provided domain event instance.

- `dispatchMany(events: Array<Object>): void`
  > Sequentially dispatches a collection of domain events to their respective handlers.

- `getHandlers(eventType: string): Array<{handler:Function, name:string`
  > Retrieves the current registry of handler objects for a specific event type.

- `clearHandlers(eventType: string): void`
  > Purges every handler registration associated with the specified event type.

- `clearAll(): void`
  > Resets the entire dispatcher registry, removing all handler subscriptions across all event types.

- `getHandlerCount(eventType: string): number`
  > Returns the total number of active handler subscriptions for a given event type.


### DomainException

Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
Extends the shared {

**Initialization:**
```javascript
new DomainException(message: string, context: string, details={}: Object)
```

**Methods:**

- `getDetails(): Object`
  > Retrieves the auxiliary diagnostic metadata associated with the exception.

- `toObject(): {name:string, message:string, context:string, details:Object, stack:string`
  > Serializes the exception into a plain object suitable for logging or external transmission.


### EntityNotFoundException

Exception class for failed entity resolution by identifier or search specification.

**Initialization:**
```javascript
new EntityNotFoundException(entityType: string, criteria: string|Object, details={}: Object)
```

**Methods:**

- `getEntityType(): string`
  > Returns the domain classification of the entity that failed resolution.

- `getCriteria(): string|Object`
  > Retrieves the failed resolution parameters (ID or search object).


### InvariantViolationException

Exception class for business rule violations that compromise aggregate integrity.

**Initialization:**
```javascript
new InvariantViolationException(aggregateType: string, violations=[: string[])
```

**Methods:**

- `getAggregateType(): string`
  > Returns the domain classification of the aggregate that failed invariant validation.

- `getViolations(): string[]`
  > Retrieves the comprehensive list of business rule violations detected.

- `hasViolations(): boolean`
  > Verifies if the exception contains specific violation details.


### SpecificationException

Exception class for failures during specification evaluation or translation to persistent queries.

**Initialization:**
```javascript
new SpecificationException(message: string, specificationType: string, details={}: Object)
```

**Methods:**

- `getSpecificationType(): string|undefined`
  > Returns the classification of the specification that caused the evaluation failure.


### DynamicFieldMapping

Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.

**Initialization:**
```javascript
new DynamicFieldMapping(config: Object, config.propertyName: string, config.schemaProvider: Function, config.columnPattern: Function, config.aggregate: Function, config.expand: Function, config.logger: Object)
```

**Methods:**

- `hydrate(row: Object): Map<string, *>`
  > Transforms raw database row data into an aggregated entity Map property.

- `dehydrate(mapValue: Map<string, *>): Object.<string, *>`
  > Flattens an entity Map property back into individual database column values.

- `getColumnNames(): string[]`
  > Identifies every database column consumed or produced by this dynamic mapping.


### EntityMapper

Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.

**Initialization:**
```javascript
new EntityMapper(logger=null: Object|null)
```

**Methods:**

- `registerTransformer(fieldName: string, toData: Function, fromData: Function): void`
  > Defines custom conversion logic for a specific entity attribute.

- `configureDynamicField(config: Object): this`
  > Registers a schema-driven strategy for aggregating multiple database columns into an entity Map property.

- `configureJsonExpansion(config: Object): this`
  > Registers a strategy for expanding or collapsing individual database properties into a JSON-serialized column.

- `getMappingConfiguration(): MappingConfiguration`
  > Retrieves the active mapping configuration container.

- `toData(entity: Object): Object|null`
  > Converts a domain Entity into a plain data record suitable for persistence, applying all registered transformers and expansions.

- `fromData(data: Object, EntityClass: Function): Object|null`
  > Reconstitutes a domain Entity from a persistent data record using specified class and registered mappings.

- `fromDataArray(dataArray: Object[], EntityClass: Function): Object[]`
  > Batch transforms multiple persistence records into hydrated domain entities.

- `toDataArray(entities: Object[]): Object[]`
  > Batch transforms multiple domain entities into persistence records.

- `cloneData(data: Object): Object`
  > Creates a deep structural copy of a persistence data object.


### HydrationService

Orchestrator for transforming persistence data records into domain Entity instances and vice versa.

**Initialization:**
```javascript
new HydrationService(entityMapper=null: Object|null, logger=null: Object|null)
```

**Methods:**

- `hydrate(data: Object, EntityClass: Function): Object`
  > Reconstitutes a single domain Entity from a raw data record.

- `hydrateMany(dataArray: Array<Object>, EntityClass: Function): Array<Object>`
  > Reconstitutes a collection of domain Entities from a list of data records.

- `dehydrate(entity: Object): Object`
  > Reduces a domain Entity instance into a plain data record for persistence.

- `dehydrateMany(entities: Array<Object>): Array<Object>`
  > Reduces a collection of domain Entities into persistence-ready data records.

- `storeOriginalData(entity: Object, data: Object): void`
  > Records the baseline state on an entity instance to enable change detection.

- `clearDirtyFields(entity: Object): void`
  > Resets the modification tracking registry on the specified entity.

- `refresh(entity: Object, data: Object): void`
  > Synchronizes an existing entity instance with new data while maintaining object identity.


### JsonExpansionMapping

Configuration for JSON-expanded property mapping.
Enables expanding a single JSON column into multiple first-class entity properties.

**Initialization:**
```javascript
new JsonExpansionMapping(config: Object, config.column: string, config.properties: Array<string>, config.logger: Object)
```

**Methods:**

- `hydrate(row: Object): Object`
  > Parses JSON from the target column and expands constituent keys into individual object properties.

- `dehydrate(entityData: Object): Object`
  > Collapses individual entity properties back into a single JSON-serialized string for the target column.

- `getColumnName(): string`
  > Returns the physical database column identifier managed by this mapping.

- `getProperties(): Array<string>`
  > Retrieves the list of entity attribute keys participating in this expansion strategy.

- `managesProperty(propertyName: string): boolean`
  > Determines if a specific entity property is part of this expansion strategy.


### MappingConfiguration

Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.

**Initialization:**
```javascript
new MappingConfiguration(logger: Object|null)
```

**Methods:**

- `addDynamicFieldMapping(config: Object|DynamicFieldMapping): this`
  > Registers a new dynamic field aggregation strategy.

- `addJsonExpansionMapping(config: Object|JsonExpansionMapping): this`
  > Registers a new JSON property expansion strategy.

- `getDynamicFieldMapping(propertyName: string): Object|null`
  > Retrieves an aggregation strategy by its target entity property identifier.

- `getJsonExpansionMapping(columnName: string): Object|null`
  > Retrieves an expansion strategy by its source database column identifier.

- `getAllDynamicFieldMappings(): Array<Object>`
  > Returns a collection of all active dynamic field aggregation strategies.

- `getAllJsonExpansionMappings(): Array<Object>`
  > Returns a collection of all active JSON expansion strategies.

- `hasDynamicFieldMappings(): boolean`
  > Verifies if any dynamic field strategies are currently registered.

- `hasJsonExpansionMappings(): boolean`
  > Verifies if any JSON expansion strategies are currently registered.

- `clear(): void`
  > Purges all mapping strategies from the configuration container.

- `findJsonExpansionMappingForProperty(propertyName: string): Object|null`
  > Locates the JSON expansion strategy that manages a specific entity property.


### QueryTranslator

Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.

**Initialization:**
```javascript
new QueryTranslator(logger=null: Object|null)
```

**Methods:**

- `translate(specification: Object, queryBuilder: Object): Object`
  > Applies domain specification filters to a database query builder.

- `validate(specification: Object): {valid:boolean, reason:string|null`
  > Evaluates if a given specification possesses a supported mapping to database query structures.

- `tryTranslate(specification: Object, queryBuilder: Object): {success:boolean, queryBuilder:Object|null, error:string|null`
  > Safely attempts specification translation, encapsulating potential failures in a result object.


### CompositeSpecification

Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.

**Initialization:**
```javascript
new CompositeSpecification(operator: string, specifications: Array<Object>)
```

**Methods:**

- `isSatisfiedBy(entity: Object): boolean`
  > Evaluates the combined logical state against a target entity instance.

- `toQuery(queryBuilder: Object): Object`
  > Translates the composite logic into SheetDBLib query builder instructions.

- `canBeTranslatedToQuery(): boolean`
  > Determines if the entire composite tree possesses a supported database mapping.

- `toString(): string`
  > Returns a recursive string representation of the logical tree.


### ExpressionSpecification

Dynamic specification leveraging GasExpressionEngineLib for complex string-based evaluation and basic persistence translation.

**Initialization:**
```javascript
new ExpressionSpecification(expression: string, expressionEngine: Object)
```

**Methods:**

- `isSatisfiedBy(entity: Object): boolean`
  > Evaluates the expression against a domain entity using the registered engine.

- `toQuery(queryBuilder: Object): Object`
  > Attempts to parse and translate simple expressions into database query builder instructions.

- `canBeTranslatedToQuery(): boolean`
  > Determines if the expression matches a supported simple pattern for database query translation.

- `toString(): string`
  > Returns a string representation of the underlying expression.


### FieldSpecification

Atomic specification for comparing entity field values against specific criteria using common relational operators.

**Initialization:**
```javascript
new FieldSpecification(field: string, operator: string, value: *, secondValue=null: *)
```

**Methods:**

- `isSatisfiedBy(entity: Object): boolean`
  > Evaluates the relational criteria against a target entity's resolved field value.

- `toQuery(queryBuilder: Object): Object`
  > Maps the relational criteria to SheetDBLib query builder instructions.

- `toString(): string`
  > Returns a human-readable string representation of the comparison criteria.


### FunctionSpecification

Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.

**Initialization:**
```javascript
new FunctionSpecification(predicateFunction: Function, description=null: string|null)
```

**Methods:**

- `isSatisfiedBy(entity: Object): boolean`
  > Evaluates the custom predicate against a target entity instance.

- `toQuery(): void`
  > Prevents translation to database queries as arbitrary functions lack persistence mapping.

- `canBeTranslatedToQuery(): false`
  > Indicates that function specifications are restricted to in-memory evaluation.

- `toString(): string`
  > Returns a semantic summary of the function-based specification.


### Specification

Internal registry hook to inject CompositeSpecification and resolve circular dependencies.

**Initialization:**
```javascript
new Specification()
```

**Methods:**

- `isSatisfiedBy(entity: Object): boolean`
  > Evaluates the specification logic against a domain entity instance.

- `and(other: Specification): Specification`
  > Chains the current specification with another using logical AND.

- `or(other: Specification): Specification`
  > Chains the current specification with another using logical OR.

- `not(): Specification`
  > Negates the current specification using logical NOT.

- `toQuery(queryBuilder: Object): Object`
  > Translates the domain rule into SheetDBLib query builder instructions.

- `canBeTranslatedToQuery(): boolean`
  > Heuristically determines if the specification possesses a supported database mapping.

- `toString(): string`
  > Returns a concise string representation of the specification type.


### SpecificationBuilder

Fluent API orchestrator for assembling complex logical specifications through chainable method calls.

**Initialization:**
```javascript
new SpecificationBuilder()
```

**Static Methods:**

- `create(): SpecificationBuilder`
  > Starts building a new specification.

- `field(field: string): Object`
  > Starts building a field specification.

**Methods:**

- `field(field: string): Object`
  > Transitions to a field-specific building context for relational comparisons.

- `and(): this`
  > Configures the builder to join the next specification using logical AND.

- `or(): this`
  > Configures the builder to join the next specification using logical OR.

- `build(): Object`
  > Synthesizes all registered logical units into a single Specification tree.


### FieldSpecificationBuilder

Initializes builder with internal logic registries and default join operators.

**Initialization:**
```javascript
new FieldSpecificationBuilder()
```

**Methods:**

- `equals(value: *): SpecificationBuilder`
  > Assembles an equality specification (field == value).

- `notEquals(value: *): SpecificationBuilder`
  > Assembles an inequality specification (field != value).

- `greaterThan(value: *): SpecificationBuilder`
  > Assembles a strictly greater-than specification (field > value).

- `lessThan(value: *): SpecificationBuilder`
  > Assembles a strictly less-than specification (field < value).

- `greaterThanOrEqual(value: *): SpecificationBuilder`
  > Assembles a greater-than-or-equal specification (field >= value).

- `lessThanOrEqual(value: *): SpecificationBuilder`
  > Assembles a less-than-or-equal specification (field <= value).

- `in(values: Array): SpecificationBuilder`
  > Assembles a set-inclusion specification (field IN [values]).

- `notIn(values: Array): SpecificationBuilder`
  > Assembles a set-exclusion specification (field NOT IN [values]).

- `between(min: *, max: *): SpecificationBuilder`
  > Assembles an inclusive range specification (min <= field <= max).

- `like(pattern: string): SpecificationBuilder`
  > Assembles a string pattern-matching specification supporting '%' wildcards.

- `notLike(pattern: string): SpecificationBuilder`
  > Assembles a string pattern-exclusion specification supporting '%' wildcards.


---

