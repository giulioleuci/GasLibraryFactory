/**
 * @fileoverview GasDataImporter - Recipe-Based ETL Engine for Google Apps Script. See README.md for the full module manual.
 * @module GasDataImporter
 */

// Main engine
export { ImportEngine } from './src/ImportEngine.js';

// Configuration
export { ImportConfiguration } from './src/ImportConfiguration.js';

// Resumable/chunked imports
export { ImportCheckpoint } from './src/ImportCheckpoint.js';

// Extract phase
export { SourceStrategy } from './src/internal/extract-strategies/SourceStrategy.js';
export { SheetByIdStrategy } from './src/internal/extract-strategies/SheetByIdStrategy.js';
export { FolderStrategy } from './src/internal/extract-strategies/FolderStrategy.js';
export { SourceStrategyFactory } from './src/internal/extract-strategies/SourceStrategyFactory.js';

// Transform phase
export { Transformer } from './src/pipeline/Transformer.js';

// Load phase
export { Loader } from './src/internal/load/Loader.js';

// Errors
export { ImportError } from './src/internal/errors/ImportError.js';
export { SourceError } from './src/internal/errors/SourceError.js';
export { TransformError } from './src/internal/errors/TransformError.js';
export { LoadError } from './src/internal/errors/LoadError.js';
export { ConfigurationError } from './src/internal/errors/ConfigurationError.js';
