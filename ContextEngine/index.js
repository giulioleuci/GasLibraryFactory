// ===================================================================
// FILE: ContextEngine/index.js
// ===================================================================
// Main entry point for ContextEngine ES Module exports
// ===================================================================

/**
 * ContextEngine - Declarative Data Assembly from Recipes
 *
 * @module ContextEngine
 *
 * @description
 * Generic, declarative system for assembling complex data contexts (Unified Data
 * Contexts) from disparate sources based on JSON recipes, with automatic dependency
 * resolution, conditional execution, and transformation of provider data.
 *
 * See the package README for architecture, recipe format, usage examples, and
 * design notes.
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 */

// Core classes
export { ContextAssembler } from './src/ContextAssembler';
export { ProviderRegistry } from './src/ProviderRegistry';
export { DependencyResolver } from './src/internal/DependencyResolver';
export { RecipeParser } from './src/internal/RecipeParser';
export { DataProvider } from './src/DataProvider';

// Interceptor classes
export { ContextInterceptor } from './src/interceptors/ContextInterceptor';
export { InterceptorRegistry } from './src/interceptors/InterceptorRegistry';
export { CollectionProjectionInterceptor } from './src/interceptors/CollectionProjectionInterceptor';
export { CollectionProjector } from './src/projection/CollectionProjector';
export { ProjectionRegistry } from './src/projection/ProjectionRegistry';

// Utility classes
export { PostProcessor as ContextPostProcessor } from './src/PostProcessor';

// Error classes
export { ContextEngineError } from './src/internal/errors/ContextEngineError';
export { RecipeValidationError } from './src/internal/errors/RecipeValidationError';
export { DependencyResolutionError } from './src/internal/errors/DependencyResolutionError';
export { ProviderNotFoundError } from './src/internal/errors/ProviderNotFoundError';
export { ProviderExecutionError } from './src/internal/errors/ProviderExecutionError';
export { CollectionProjectionError } from './src/internal/errors/CollectionProjectionError';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
