// ===================================================================
// FILE: WorkspaceTemplateEngine/index.js
// ===================================================================
// Main entry point for WorkspaceTemplateEngine ES Module exports
// ===================================================================

// Core template engine
export { FilterStrategy } from './src/FilterStrategy';
export { Mustache, MustacheRenderError } from './src/facades/Mustache';
export { PlaceholderService } from './src/PlaceholderService';

// Processors
export { DocumentProcessor } from './src/processors/DocumentProcessor';
export { SheetProcessor } from './src/processors/SheetProcessor';
