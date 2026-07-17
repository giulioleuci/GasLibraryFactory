/**
 * DomainRepositoryLib - Domain-Driven Design patterns for Google Apps Script
 *
 * Brings DDD concepts to Google Apps Script projects:
 * - Entity base class with identity and dirty tracking
 * - Repository pattern for domain-oriented data access
 * - Specification pattern for reusable business rules
 * - Value Objects for immutable domain concepts
 * - Aggregates for managing complex entity graphs
 * - Domain Events for decoupled communication
 *
 * @module DomainRepositoryLib
 * @version 1.0.0
 */

// Core domain classes
export { Entity } from './src/Entity.js';
export { ValueObject } from './src/ValueObject.js';
export { Repository } from './src/Repository.js';
export { Aggregate } from './src/Aggregate.js';

// Specification pattern
export { Specification } from './src/specifications/Specification.js';
export { FieldSpecification } from './src/specifications/FieldSpecification.js';
export { ExpressionSpecification } from './src/specifications/ExpressionSpecification.js';
export { FunctionSpecification } from './src/specifications/FunctionSpecification.js';
export { CompositeSpecification } from './src/specifications/CompositeSpecification.js';
export { SpecificationBuilder } from './src/specifications/SpecificationBuilder.js';

// Mapping and hydration
export { EntityMapper } from './src/internal/mapping/EntityMapper.js';
export { HydrationService } from './src/internal/mapping/HydrationService.js';
export { MappingConfiguration } from './src/internal/mapping/MappingConfiguration.js';
export { DynamicFieldMapping } from './src/internal/mapping/DynamicFieldMapping.js';
export { JsonExpansionMapping } from './src/internal/mapping/JsonExpansionMapping.js';

// Query translation
export { QueryTranslator } from './src/internal/query/QueryTranslator.js';

// Validation — re-exported from GasSchemaValidatorLib for backwards compatibility
export { SchemaValidator as ZodValidator, ValidationException, z } from '@GasSchemaValidatorLib';

// Domain events
export {
  DomainEvent,
  EntityCreatedEvent,
  EntityUpdatedEvent,
  EntityDeletedEvent
} from './src/events/DomainEvent.js';
export { EventDispatcher } from './src/events/EventDispatcher.js';

// Error classes
export { DomainException } from './src/internal/errors/DomainException.js';
export { EntityNotFoundException } from './src/internal/errors/EntityNotFoundException.js';
export { InvariantViolationException } from './src/internal/errors/InvariantViolationException.js';
export { SpecificationException } from './src/internal/errors/SpecificationException.js';
