# DomainRepositoryLib

**Version:** 1.0.0  
**Layer:** Application Orchestration (Layer 3)  
**Dependencies:** SheetDBLib, CoreUtilsLib, GasExpressionEngineLib

## 🏛️ Overview

**DomainRepositoryLib** brings **Domain-Driven Design (DDD)** patterns to Google Apps Script. It provides a high-level abstraction over `SheetDBLib`, allowing developers to work with rich **Entities**, **Value Objects**, and **Aggregates** instead of raw database rows.

## 🏗️ File and Folder Structure

A DDD-aligned structure focused on domain logic and mapping:

```text
DomainRepositoryLib/
├── src/
│   ├── Entity.js               # Base class for domain objects with identity
│   ├── Aggregate.js            # Cluster of entities with invariant enforcement
│   ├── ValueObject.js          # Objects with structural equality logic
│   ├── Repository.js           # Generic base for persistence and hydration
│   ├── mapping/                # Logic for data/entity conversion
│   │   ├── EntityMapper.js     # Orchestrates mapping configurations
│   │   ├── HydrationService.js # Logic for deep entity reconstruction
│   │   └── DynamicFieldMapping.js # Maps map-like entity properties
│   ├── specifications/         # Encapsulated business rules and query logic
│   │   ├── Specification.js    # Base interface for rules
│   │   └── SpecificationBuilder.js # Fluent API for rule composition
│   ├── query/                  # Domain-to-DB query translation
│   │   └── QueryTranslator.js  # Translates Specifications into SheetDB queries
│   ├── events/                 # Logic for side effects (Domain Events)
│   │   ├── DomainEvent.js      # Base class for event payloads
│   │   └── EventDispatcher.js  # Registry and notification engine
│   ├── validation/             # Schema validation bridge (Zod)
│   └── errors/                 # Domain-specific exceptions
```

## 🧩 Programming Patterns

1.  **Repository Pattern**: Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.
2.  **Specification Pattern**: Encapsulates business rules as reusable objects that can be used for both validation and filtering.
3.  **Aggregate Root Pattern**: Entities that act as entry points to a cluster of related objects (e.g., `Order` is the root for `OrderItems`).
4.  **Identity Map**: Repositories track hydrated entities to ensure the same object is not loaded multiple times within the same session.
5.  **Observer / Mediator**: `EventDispatcher` implements an observer pattern for decoupled side-effects across the domain.
6.  **Data Mapper**: Decouples the domain objects from the database schema using explicit mapping configurations.

## ✨ Key Features

It decouples your business logic from the underlying storage mechanism (Google Sheets), enabling cleaner, more maintainable, and testable code. It also introduces the **Specification Pattern** for encapsulating business rules and **Domain Events** for side effects.

## ✨ Key Features

- **Entity & Aggregate Roots**: Base classes providing identity management, dirty checking, and lifecycle hooks.
- **Repository Pattern**: Abstract base class for repositories with standard CRUD (`save`, `findById`, `delete`) and batch operations.
- **Specification Pattern**: Encapsulate query logic (e.g., `new ActiveUserSpecification()`). These can be evaluated in-memory OR translated to `SheetDBLib` SQL-like queries automatically.
- **Value Objects**: Immutable objects with structural equality (e.g., `Email`, `Money`).
- **Data Mapper**: Automatically hydrates/dehydrates Entities to/from database rows.
- **Validation**: Integrated **Zod** support for strict schema validation within entities.
- **Domain Events**: Dispatch and handle events (e.g., `UserRegistered`) to decouple side effects.

## 📦 Installation

```javascript
import { Entity, Repository, Specification, ZodValidator } from '@DomainRepositoryLib';
```

## 🚀 Quick Start

### 1. Define an Entity

```javascript
import { z } from '@DomainRepositoryLib';

class User extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.email = data.email;
    this.status = data.status || 'active';
  }

  // Validation Schema
  static schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    status: z.enum(['active', 'inactive'])
  });

  validate() {
    ZodValidator.parse(User.schema, this);
    return true;
  }

  // Business Logic
  deactivate() {
    this.status = 'inactive';
    this.markDirty('status'); // Track change
    this.addDomainEvent(new UserDeactivatedEvent(this.id));
  }
}
```

### 2. Define a Repository

```javascript
class UserRepository extends Repository {
  constructor(db) {
    super(db, 'Users', User); // Table Name, Entity Class
  }

  findActiveUsers() {
    // Uses Specification Pattern
    return this.find(new ActiveUserSpecification());
  }
}
```

### 3. Use in Application

```javascript
const userRepo = new UserRepository(db);

// Create
const user = new User({ name: 'John', email: 'john@example.com' });
userRepo.save(user);

// Update
const existingUser = userRepo.findById(user.id);
existingUser.deactivate();
userRepo.save(existingUser); // Only updates 'status' field
```

## 📚 Core Concepts

### Specifications

Specifications allow you to define business rules that can be used for both validation and querying.

```javascript
class ActiveUserSpecification extends Specification {
  isSatisfiedBy(user) {
    return user.status === 'active';
  }

  // Optional: Translate to DB Query for performance
  toQuery(queryBuilder) {
    return queryBuilder.where('status', '=', 'active');
  }
}
```

### Query Translation

The `QueryTranslator` attempts to convert a Specification into a `SheetDBLib` query. If translation isn't possible (e.g., complex JS logic), the Repository automatically falls back to fetching all records and filtering in-memory.

### Aggregates

Aggregates enforce invariants across multiple entities.

```javascript
class Order extends Aggregate {
  addItem(item) {
    if (this.items.length >= 10) {
      throw new InvariantViolationException('Max 10 items per order');
    }
    this.items.push(item);
    this.markDirty('items');
  }
}
```

## 🔧 Advanced Mapping

**NEW**: DomainRepositoryLib now supports advanced mapping patterns for handling dynamic data structures and JSON-expanded properties.

### Schema-Driven Dynamic Mapping

Map multiple database columns into a single Map/Dictionary property on entities. Perfect for domains with configuration-driven schemas (e.g., school subjects, product categories).

```javascript
class ClassRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'Classes', ClassEntity, logger, cache);

    this.entityMapper.configureDynamicField({
      propertyName: 'chairs', // Map property on entity
      schemaProvider: () => ['MATH', 'HIST', 'SCI'], // Schema keys
      columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
      aggregate: (row, key, columns) => ({
        main: row[columns.main],
        assistant: row[columns.assistant]
      }),
      expand: (value, key, columns) => ({
        [columns.main]: value.main,
        [columns.assistant]: value.assistant
      })
    });
  }
}

// Use Map properties naturally
const chairsMap = new Map();
chairsMap.set('MATH', { main: 'teacher@school.com', assistant: 'assistant@school.com' });
entity.chairs = chairsMap;
```

### JSON Expansion Mapping

Expand a single JSON column into multiple first-class entity properties. Ideal for grouping sparse or auxiliary data.

```javascript
class ClassRepository extends Repository {
  constructor(database, logger, cache) {
    super(database, 'ClassRoles', ClassEntity, logger, cache);

    this.entityMapper.configureJsonExpansion({
      column: 'ROLES', // Database column with JSON
      properties: ['tutor', 'secretary', 'coordinator'] // Entity properties
    });
  }
}

// Access properties directly (no JSON parsing needed)
entity.tutor = 'tutor@school.com';
entity.secretary = 'secretary@school.com';
```

📖 **See [ADVANCED_MAPPING.md](./ADVANCED_MAPPING.md) for complete documentation and examples.**

## 🧪 Testing

The library is designed for unit testing. You can mock the `DatabaseService` to test your Repositories and Entities without touching Google Sheets.

```bash
npm test DomainRepositoryLib
```
