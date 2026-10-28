# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [DomainRepositoryLib](#domainrepositorylib)

---

## DomainRepositoryLib

DomainRepositoryLib - Domain-Driven Design patterns for Google Apps Script

### Entity

**Source:** `DomainRepositoryLib/src/Entity.ts`

Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.

**Initialization:**
```javascript
new Entity()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromData` | `fromData(data: Object): Entity` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `id` | `id: unknown` |
| `createdAt` | `createdAt: Date` |
| `updatedAt` | `updatedAt: Date` |
| `_parseDate` | `_parseDate(value: Date|string|number): Date|null` |
| `markDirty` | `markDirty(fieldName: string): void` |
| `isDirty` | `isDirty(fieldName: string): boolean` |
| `getDirtyFields` | `getDirtyFields(): string[]` |
| `hasDirtyFields` | `hasDirtyFields(): boolean` |
| `clearDirtyFields` | `clearDirtyFields(): void` |
| `getChanges` | `getChanges(): Object` |
| `storeOriginalData` | `storeOriginalData(data: Object): void` |
| `getOriginalValue` | `getOriginalValue(fieldName: string): *` |
| `captureDynamicColumns` | `captureDynamicColumns(data: Object): void` |
| `getDynamicColumns` | `getDynamicColumns(): Object` |
| `setDynamicColumn` | `setDynamicColumn(column: string, value: *): void` |
| `validate` | `validate(): boolean` |
| `isValid` | `isValid(): boolean` |
| `getValidationErrors` | `getValidationErrors(): Array<Object>` |
| `addValidationError` | `addValidationError(field: string, message: string): void` |
| `validateOrThrow` | `validateOrThrow(): void` |
| `equals` | `equals(other: Entity): boolean` |
| `toData` | `toData(): Object` |
| `toString` | `toString(): string` |


### Repository

**Source:** `DomainRepositoryLib/src/Repository.ts`

Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.

**Initialization:**
```javascript
new Repository()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |
| `_getTable` | `_getTable(): Object` |
| `_executeWithRetry` | `_executeWithRetry(operation: Function, maxRetries=3: number): *` |
| `_withKey` | `_withKey(rows: Array<Object>): Array<Object>` |
| `find` | `find(specification: Object): Array<Object>` |
| `findOne` | `findOne(specification: Object): Object|null` |
| `findById` | `findById(id: string): Object|null` |
| `findByIdOrFail` | `findByIdOrFail(id: string): Object` |
| `findAll` | `findAll(): Array<Object>` |
| `exists` | `exists(specification: Object): boolean` |
| `count` | `count(specification: Object): number` |
| `save` | `save(entity: Object, options={}: Object): Object` |
| `saveMany` | `saveMany(entities: Array<Object>): Array<Object>` |
| `patch` | `patch(entity: Object, changes: Object): Object` |
| `patchById` | `patchById(id: string, changes: Object): Object` |
| `delete` | `delete(entity: Object): void` |
| `deleteById` | `deleteById(id: string): void` |
| `deleteMany` | `deleteMany(entities: Array<Object>): void` |
| `refresh` | `refresh(entity: Object): Object` |
| `_clearCache` | `_clearCache(): void` |
| `getTable` | `getTable(): Object` |
| `getEntityClass` | `getEntityClass(): Function` |
| `getTableName` | `getTableName(): string` |


### ValueObject

**Source:** `DomainRepositoryLib/src/ValueObject.ts`

Abstract base class for domain value objects, enforcing immutability and value-based equality.

**Initialization:**
```javascript
new ValueObject()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_freeze` | `_freeze(): void` |
| `equals` | `equals(other: ValueObject): boolean` |
| `_deepEquals` | `_deepEquals(a: *, b: *): boolean` |
| `toString` | `toString(): string` |
| `getValue` | `getValue(): *` |


### DomainException

**Source:** `DomainRepositoryLib/src/internal/errors/DomainException.ts`

Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

Note: this class uses `context` as a short architectural label (a string) rather than the
structured-metadata object used by {@link BaseError}; it is reassigned explicitly below to
preserve that public contract.

**Initialization:**
```javascript
new DomainException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDetails` | `getDetails(): Object` |
| `toObject` | `toObject(): {name:string, message:string, context:string, details:Object, stack:string` |


### EntityNotFoundException

**Source:** `DomainRepositoryLib/src/internal/errors/EntityNotFoundException.ts`

Exception class for failed entity resolution by identifier or search specification.

**Initialization:**
```javascript
new EntityNotFoundException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getEntityType` | `getEntityType(): string` |
| `getCriteria` | `getCriteria(): string|Object` |


### InvariantViolationException

**Source:** `DomainRepositoryLib/src/internal/errors/InvariantViolationException.ts`

Exception class for business rule violations that compromise aggregate integrity.

**Initialization:**
```javascript
new InvariantViolationException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAggregateType` | `getAggregateType(): string` |
| `getViolations` | `getViolations(): string[]` |
| `hasViolations` | `hasViolations(): boolean` |


### SpecificationException

**Source:** `DomainRepositoryLib/src/internal/errors/SpecificationException.ts`

Exception class for failures during specification evaluation or translation to persistent queries.

**Initialization:**
```javascript
new SpecificationException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getSpecificationType` | `getSpecificationType(): string|undefined` |


### DynamicFieldMapping

**Source:** `DomainRepositoryLib/src/internal/mapping/DynamicFieldMapping.ts`

Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.

**Initialization:**
```javascript
new DynamicFieldMapping()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(): void` |
| `hydrate` | `hydrate(row: Object): Map<string, *>` |
| `dehydrate` | `dehydrate(mapValue: Map<string, *>): Object.<string, *>` |
| `getColumnNames` | `getColumnNames(): string[]` |


### EntityMapper

**Source:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.ts`

Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.

**Initialization:**
```javascript
new EntityMapper()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerTransformer` | `registerTransformer(fieldName: string, toData: Function, fromData: Function): void` |
| `configureDynamicField` | `configureDynamicField(config: Object): this` |
| `configureJsonExpansion` | `configureJsonExpansion(config: Object): this` |
| `toData` | `toData(entity: Object): Object|null` |
| `_serializeEntityFields` | `_serializeEntityFields(entity: Object): Object` |
| `_applyDynamicColumnPassthrough` | `_applyDynamicColumnPassthrough(data: Object, entity: Object): void` |
| `_serializeValue` | `_serializeValue(value: *): *` |
| `fromData` | `fromData(data: Object, EntityClass: Function): Object|null` |
| `fromDataArray` | `fromDataArray(dataArray: Object[], EntityClass: Function): Object[]` |
| `toDataArray` | `toDataArray(entities: Object[]): Object[]` |
| `cloneData` | `cloneData(data: Object): Object` |
| `_applyJsonExpansionHydration` | `_applyJsonExpansionHydration(data: Object): void` |
| `_applyJsonExpansionDehydration` | `_applyJsonExpansionDehydration(data: Object): void` |
| `_applyDynamicFieldHydration` | `_applyDynamicFieldHydration(data: Object): void` |
| `_applyDynamicFieldDehydration` | `_applyDynamicFieldDehydration(data: Object, entity: Object): void` |


### HydrationService

**Source:** `DomainRepositoryLib/src/internal/mapping/HydrationService.ts`

Orchestrator for transforming persistence data records into domain Entity instances and vice versa.

**Initialization:**
```javascript
new HydrationService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `hydrate` | `hydrate(data: Object, EntityClass: Function): Object` |
| `hydrateMany` | `hydrateMany(dataArray: Array<Object>, EntityClass: Function): Array<Object>` |
| `dehydrate` | `dehydrate(entity: Object): Object` |
| `dehydrateMany` | `dehydrateMany(entities: Array<Object>): Array<Object>` |
| `storeOriginalData` | `storeOriginalData(entity: Object, data: Object): void` |
| `clearDirtyFields` | `clearDirtyFields(entity: Object): void` |
| `refresh` | `refresh(entity: Object, data: Object): void` |


### JsonExpansionMapping

**Source:** `DomainRepositoryLib/src/internal/mapping/JsonExpansionMapping.ts`

Configuration for JSON-expanded property mapping.
Enables expanding a single JSON column into multiple first-class entity properties.

**Initialization:**
```javascript
new JsonExpansionMapping()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(): void` |
| `hydrate` | `hydrate(row: Object): Object` |
| `dehydrate` | `dehydrate(entityData: Object): Object` |
| `getColumnName` | `getColumnName(): string` |
| `getProperties` | `getProperties(): Array<string>` |
| `managesProperty` | `managesProperty(propertyName: string): boolean` |


### MappingConfiguration

**Source:** `DomainRepositoryLib/src/internal/mapping/MappingConfiguration.ts`

Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.

**Initialization:**
```javascript
new MappingConfiguration()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addDynamicFieldMapping` | `addDynamicFieldMapping(config: Object|DynamicFieldMapping): this` |
| `addJsonExpansionMapping` | `addJsonExpansionMapping(config: Object|JsonExpansionMapping): this` |
| `getDynamicFieldMapping` | `getDynamicFieldMapping(propertyName: string): Object|null` |
| `getJsonExpansionMapping` | `getJsonExpansionMapping(columnName: string): Object|null` |
| `getAllDynamicFieldMappings` | `getAllDynamicFieldMappings(): Array<Object>` |
| `getAllJsonExpansionMappings` | `getAllJsonExpansionMappings(): Array<Object>` |
| `hasDynamicFieldMappings` | `hasDynamicFieldMappings(): boolean` |
| `hasJsonExpansionMappings` | `hasJsonExpansionMappings(): boolean` |
| `clear` | `clear(): void` |
| `findJsonExpansionMappingForProperty` | `findJsonExpansionMappingForProperty(propertyName: string): Object|null` |


### QueryTranslator

**Source:** `DomainRepositoryLib/src/internal/query/QueryTranslator.ts`

Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.

**Initialization:**
```javascript
new QueryTranslator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `translate` | `translate(specification: Object, queryBuilder: Object): Object` |
| `_queryObjectCriteria` | `_queryObjectCriteria(specification: Object): Record<string, unknown>|null` |
| `_applyQueryObject` | `_applyQueryObject(criteria: Record<string, unknown>, queryBuilder: Object): Object` |
| `validate` | `validate(specification: Object): {valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null` |
| `tryTranslate` | `tryTranslate(specification: Object, queryBuilder: Object): {success:boolean, queryBuilder:Object|null, error:string|null` |


### CompositeSpecification

**Source:** `DomainRepositoryLib/src/specifications/CompositeSpecification.ts`

Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.

**Initialization:**
```javascript
new CompositeSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateOperator` | `_validateOperator(): void` |
| `_validateSpecifications` | `_validateSpecifications(): void` |
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): boolean` |
| `toString` | `toString(): string` |


### EqualityFieldSpec

**Source:** `DomainRepositoryLib/src/specifications/EqualityFieldSpec.ts`

Specification di uguaglianza in cui isSatisfiedBy e toQueryObject sono
coerenti per costruzione: il valore letto dall'entità e quello confrontato
nella query sono lo stesso.

**Initialization:**
```javascript
new EqualityFieldSpec()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(): void` |
| `toQueryObject` | `toQueryObject(): void` |
| `toString` | `toString(): void` |


### FieldSpecification

**Source:** `DomainRepositoryLib/src/specifications/FieldSpecification.ts`

Atomic specification for comparing entity field values against specific criteria using common relational operators.

**Initialization:**
```javascript
new FieldSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateOperator` | `_validateOperator(): void` |
| `_getFieldValue` | `_getFieldValue(entity: Object): *` |
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQueryObject` | `toQueryObject(): Record<string, unknown>|null` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `toString` | `toString(): string` |


### FunctionSpecification

**Source:** `DomainRepositoryLib/src/specifications/FunctionSpecification.ts`

Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.

**Initialization:**
```javascript
new FunctionSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQuery` | `toQuery(): void` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): false` |
| `toString` | `toString(): string` |


### Specification

**Source:** `DomainRepositoryLib/src/specifications/Specification.ts`

Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.

**Initialization:**
```javascript
new Specification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `and` | `and(other: Specification): Specification` |
| `or` | `or(other: Specification): Specification` |
| `not` | `not(): Specification` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `toQueryObject` | `toQueryObject(): Record<string, unknown>|null` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): boolean` |
| `toString` | `toString(): string` |


---

