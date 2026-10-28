// ===================================================================
// FILE: WorkspaceTemplateEngine/index.js
// ===================================================================
// Main entry point for WorkspaceTemplateEngine ES Module exports
// ===================================================================

// Core template engine
export { FilterStrategy } from './src/FilterStrategy.js';
export { Mustache, MustacheRenderError } from './src/facades/Mustache.js';
export { PlaceholderService } from './src/PlaceholderService.js';
export { PluralizeFilter } from './src/internal/filters/BuiltInFilters.js';

// Processors
export { DocumentProcessor } from './src/processors/DocumentProcessor.js';
export { SheetProcessor } from './src/processors/SheetProcessor.js';
export type { MustacheOptions, RenderSegment } from './src/facades/Mustache.js';
export type {
  TemplateOptions,
  TemplateLogger,
  TemplateUtils,
  SheetLayout,
  SheetColumn
} from './src/types.js';
