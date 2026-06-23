# Advanced Entity Mapping

This document describes the advanced mapping features available in DomainRepositoryLib for handling dynamic data structures and JSON-expanded properties.

## Overview

DomainRepositoryLib now supports two powerful mapping patterns:

1. **Schema-Driven Dynamic Mapping** - Map multiple database columns into a single Map/Dictionary property on entities
2. **JSON Expansion Mapping** - Expand a single JSON column into multiple first-class entity properties

These features enable clean domain models while maintaining flexibility in the database schema.

## Schema-Driven Dynamic Mapping

### Problem

In dynamic domains (like school subjects or product categories), you need to store data for an unknown number of entities that are defined at configuration time. Hardcoding properties in the Entity class is not feasible.

**Example**: A `CLASSES` table needs columns for teacher assignments per subject (`MATH`, `MATH.assistant`, `HIST`, `HIST.assistant`), where subjects are defined in a separate `SUBJECTS` configuration table.

### Solution

Dynamic Field Mapping aggregates multiple related columns into a `Map` property on the entity.

### Usage

```javascript
import { Repository, Entity, EntityMapper } from '@DomainRepositoryLib';
import { DatabaseService } from '@SheetDBLib';

// 1. Define your entity with a Map property
class ClassEntity extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name || null;
    this.chairs = data.chairs || new Map(); // Map<subjectId, { main, assistant }>
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      chairs: this.chairs
    };
  }

  static fromData(data) {
    return new ClassEntity(data);
  }
}

// 2. Define your repository with dynamic mapping configuration
class ClassRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'Classes', ClassEntity, logger, cache);

    // Configure dynamic field mapping
    this.entityMapper.configureDynamicField({
      propertyName: 'chairs', // The Map property name on the entity

      // Function that returns the list of schema keys (e.g., subject IDs)
      schemaProvider: () => ['MATH', 'HIST', 'SCI'],

      // Function that returns column names for each key
      columnPattern: (subjectId) => ({
        main: subjectId,
        assistant: `${subjectId}.assistant`
      }),

      // Function that aggregates column values into an object
      aggregate: (row, subjectId, columns) => ({
        main: row[columns.main] || null,
        assistant: row[columns.assistant] || null
      }),

      // Function that expands an aggregated value back to columns
      expand: (value, subjectId, columns) => ({
        [columns.main]: value.main,
        [columns.assistant]: value.assistant
      })
    });
  }
}

// 3. Use the repository
const db = new DatabaseService(SPREADSHEET_ID, logger, utils, cache);
const classRepo = new ClassRepository(db, logger, cache);

// Create entity with Map
const chairsMap = new Map();
chairsMap.set('MATH', {
  main: 'teacher_john@school.com',
  assistant: 'assistant_mary@school.com'
});
chairsMap.set('HIST', {
  main: 'teacher_alice@school.com',
  assistant: 'assistant_bob@school.com'
});

const classEntity = new ClassEntity({
  name: '10th Grade A',
  chairs: chairsMap
});

// Save - Map is dehydrated to multiple columns
const saved = classRepo.save(classEntity);

// Load - Multiple columns are hydrated into Map
const loaded = classRepo.findById(saved.id);
console.log(loaded.chairs.get('MATH').main); // 'teacher_john@school.com'
console.log(loaded.chairs.get('HIST').assistant); // 'assistant_bob@school.com'
```

### Database Schema

The above example would work with a Google Sheet that has these columns:

| id      | name         | MATH                    | MATH.assistant            | HIST                     | HIST.assistant           | SCI                    | SCI.assistant |
| ------- | ------------ | ----------------------- | ------------------------- | ------------------------ | ------------------------ | ---------------------- | ------------- |
| CLASS_1 | 10th Grade A | teacher_john@school.com | assistant_mary@school.com | teacher_alice@school.com | assistant_bob@school.com | teacher_eve@school.com |               |

### Real-World Schema Provider

In production, you would typically fetch the schema from a configuration table:

```javascript
class ClassRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'Classes', ClassEntity, logger, cache);

    this.entityMapper.configureDynamicField({
      propertyName: 'chairs',

      // Fetch subjects from SUBJECTS table
      schemaProvider: () => {
        const subjectsTable = database.tables['SUBJECTS'];
        const subjects = subjectsTable.getAllRows();
        return subjects.map((s) => s.id);
      },

      columnPattern: (subjectId) => ({
        main: subjectId,
        assistant: `${subjectId}.assistant`
      }),
      aggregate: (row, subjectId, columns) => ({
        main: row[columns.main] || null,
        assistant: row[columns.assistant] || null
      }),
      expand: (value, subjectId, columns) => ({
        [columns.main]: value.main,
        [columns.assistant]: value.assistant
      })
    });
  }
}
```

## JSON Expansion Mapping

### Problem

Some entity properties are sparse or auxiliary and pollute the database schema with many rarely-used columns. You want to group them in a single JSON column while treating them as first-class properties in the domain layer.

**Example**: A `CLASSES` table has a `ROLES` column containing `{"tutor": "email@test.com", "secretary": "email2@test.com"}`. You want to access `entity.tutor` and `entity.secretary` directly.

### Solution

JSON Expansion Mapping expands a JSON column into individual entity properties during hydration and collapses them back during dehydration.

### Usage

```javascript
// 1. Define your entity with individual properties
class ClassWithRoles extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name || null;
    this.tutor = data.tutor || null;
    this.secretary = data.secretary || null;
    this.coordinator = data.coordinator || null;
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      tutor: this.tutor,
      secretary: this.secretary,
      coordinator: this.coordinator
    };
  }

  static fromData(data) {
    return new ClassWithRoles(data);
  }
}

// 2. Define your repository with JSON expansion configuration
class ClassWithRolesRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'ClassRoles', ClassWithRoles, logger, cache);

    // Configure JSON expansion mapping
    this.entityMapper.configureJsonExpansion({
      column: 'ROLES', // Database column name containing JSON
      properties: ['tutor', 'secretary', 'coordinator'] // Entity properties
    });
  }
}

// 3. Use the repository
const db = new DatabaseService(SPREADSHEET_ID, logger, utils, cache);
const rolesRepo = new ClassWithRolesRepository(db, logger, cache);

// Create entity with individual properties
const classEntity = new ClassWithRoles({
  name: '10th Grade B',
  tutor: 'tutor@school.com',
  secretary: 'secretary@school.com',
  coordinator: 'coordinator@school.com'
});

// Save - Properties are collapsed into JSON column
const saved = rolesRepo.save(classEntity);

// Load - JSON column is expanded to properties
const loaded = rolesRepo.findById(saved.id);
console.log(loaded.tutor); // 'tutor@school.com'
console.log(loaded.secretary); // 'secretary@school.com'
```

### Database Schema

The above example would work with a Google Sheet that has these columns:

| id      | name         | ROLES                                                                                                    |
| ------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| CLASS_1 | 10th Grade B | `{"tutor":"tutor@school.com","secretary":"secretary@school.com","coordinator":"coordinator@school.com"}` |

### Dirty Tracking

JSON Expansion Mapping respects dirty tracking. When you update a JSON-backed property:

```javascript
const entity = rolesRepo.findById('CLASS_1');
entity.tutor = 'new_tutor@school.com';
entity.markDirty('tutor'); // Mark as dirty
rolesRepo.save(entity); // Only the ROLES column is updated
```

## Combining Both Mappings

You can use both Dynamic and JSON Expansion mapping in the same entity:

```javascript
class ComplexClass extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name || null;
    this.chairs = data.chairs || new Map(); // Dynamic mapping
    this.tutor = data.tutor || null; // JSON-backed
    this.secretary = data.secretary || null; // JSON-backed
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      chairs: this.chairs,
      tutor: this.tutor,
      secretary: this.secretary
    };
  }

  static fromData(data) {
    return new ComplexClass(data);
  }
}

class ComplexClassRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'ComplexClasses', ComplexClass, logger, cache);

    // Configure both mappings
    this.entityMapper.configureDynamicField({
      propertyName: 'chairs',
      schemaProvider: () => ['MATH', 'HIST'],
      columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
      aggregate: (row, key, columns) => ({
        main: row[columns.main] || null,
        assistant: row[columns.assistant] || null
      }),
      expand: (value, key, columns) => ({
        [columns.main]: value.main,
        [columns.assistant]: value.assistant
      })
    });

    this.entityMapper.configureJsonExpansion({
      column: 'ROLES',
      properties: ['tutor', 'secretary']
    });
  }
}

// Use both
const chairsMap = new Map();
chairsMap.set('MATH', { main: 'math@school.com', assistant: 'math_asst@school.com' });

const entity = new ComplexClass({
  name: '10th Grade C',
  chairs: chairsMap,
  tutor: 'tutor@school.com',
  secretary: 'secretary@school.com'
});

const saved = complexRepo.save(entity); // Both mappings applied
const loaded = complexRepo.findById(saved.id); // Both mappings applied
```

## API Reference

### EntityMapper.configureDynamicField(config)

Configures a schema-driven dynamic field mapping.

**Parameters:**

- `config.propertyName` (string) - The entity property name (will be a Map)
- `config.schemaProvider` (Function) - Function returning array of schema keys
- `config.columnPattern` (Function) - Function returning column names for a key
- `config.aggregate` (Function) - Function aggregating column values into an object
- `config.expand` (Function) - Function expanding an object back to column values

**Returns:** `EntityMapper` (for chaining)

### EntityMapper.configureJsonExpansion(config)

Configures a JSON expansion mapping.

**Parameters:**

- `config.column` (string) - The database column name containing JSON
- `config.properties` (Array<string>) - Array of entity property names

**Returns:** `EntityMapper` (for chaining)

## Testing

The implementation includes comprehensive tests:

**Unit Tests**: 85 passing tests covering:

- DynamicFieldMapping (19 tests)
- JsonExpansionMapping (26 tests)
- MappingConfiguration (17 tests)
- EntityMapper integration (17 tests)
- HydrationService (7 tests)

**Online Tests**: Integration tests with real Google Sheets:

- Dynamic field mapping with Map properties
- JSON expansion with individual properties
- Combined usage of both mappings
- Update and dirty tracking scenarios

Run tests:

```bash
# Unit tests
npm test DomainRepositoryLib/src/mapping/__tests__

# Online tests (requires Google Apps Script environment)
# Deploy the bundled library and run from GAS editor:
runDomainRepositoryLibOnlineTests()
```

## Best Practices

1. **Schema Provider Performance**: Cache the result of `schemaProvider` if it's expensive to compute.

2. **Null Handling**: Always handle null/undefined values in `aggregate` and `expand` functions.

3. **Dirty Tracking**: When updating Map properties, always call `entity.markDirty('propertyName')`.

4. **JSON Properties**: Use JSON expansion for sparse or rarely-used properties only. Frequently accessed properties should be regular columns.

5. **Column Naming**: Use consistent naming patterns for dynamic columns (e.g., `SUBJECT_ID.role_type`).

## Migration Guide

If you have existing entities without mapping:

1. **Add the mapping configuration** to your repository constructor
2. **Update existing entity classes** to use Map for dynamic fields
3. **Test with a copy of your data** first
4. **Deploy** and verify in production

No database schema changes are required - the mappings work with existing columns.

## Troubleshooting

### Map is empty after loading

Check that your `schemaProvider` returns the correct keys and `columnPattern` matches your actual column names.

### JSON properties are null

Verify that the JSON column exists and contains valid JSON. Check browser console for parsing errors.

### Updates not saving

Ensure you call `entity.markDirty(propertyName)` after modifying Map or JSON-backed properties.

## Support

For issues or questions:

- Check unit tests for usage examples
- Review online integration tests in `__testOnline__/OnlineTests.gs`
- File issues at: https://github.com/giulioleuci/gaslibfactory/issues
