// ===================================================================
// FILE: src/index.js
// ===================================================================
// Main application entry point
// This file will be bundled by Webpack into dist/Code.js
// ===================================================================

/**
 * Main Application Entry Point
 *
 * Import and use all libraries from the local monorepo.
 * Webpack will bundle everything into a single Code.js file for deployment via CLASP.
 */

import * as CoreUtilsLib from '@CoreUtilsLib';
import * as GasResilienceLib from '@GasResilienceLib';
import * as GoogleApiWrapper from '@GoogleApiWrapper';
import * as WorkspaceTemplateEngine from '@WorkspaceTemplateEngine';
import * as GasExpressionEngineLib from '@GasExpressionEngineLib';
import * as SheetDBLib from '@SheetDBLib';
import * as JobRunnerLib from '@JobRunnerLib';
import * as PipelineFramework from '@PipelineFramework';
import * as ContextEngine from '@ContextEngine';
import * as GasDataImporter from '@GasDataImporter';
import * as DomainRepositoryLib from '@DomainRepositoryLib';
import * as GasSchemaValidatorLib from '@GasSchemaValidatorLib';
import * as GasOnlineTestFramework from '@GasOnlineTestFramework';
import * as RoleResolutionLib from '@RoleResolutionLib';
import * as ComposableContentLib from '@ComposableContentLib';
import * as GasProcessMonitorLib from '@GasProcessMonitorLib';

// Save native GAS service references before Object.assign overwrites them.
// The wrapper classes (CacheService, PropertiesService) exported by GoogleApiWrapper
// have the same names as native GAS globals, causing shadowing after Object.assign.
global.__nativeCacheService__ = global.CacheService;
global.__nativePropertiesService__ = global.PropertiesService;

Object.assign(global, CoreUtilsLib);
Object.assign(global, GasResilienceLib);
Object.assign(global, GoogleApiWrapper);
Object.assign(global, WorkspaceTemplateEngine);
Object.assign(global, GasExpressionEngineLib);
Object.assign(global, SheetDBLib);
Object.assign(global, JobRunnerLib);
Object.assign(global, PipelineFramework);
Object.assign(global, ContextEngine);
Object.assign(global, GasDataImporter);
Object.assign(global, DomainRepositoryLib);
Object.assign(global, GasSchemaValidatorLib);
Object.assign(global, GasOnlineTestFramework);
Object.assign(global, RoleResolutionLib);
Object.assign(global, ComposableContentLib);
Object.assign(global, GasProcessMonitorLib);

function initializeServices() {
  // Unified DI: delegate to GoogleApiWrapper's ServiceFactory (lazy singletons)
  // instead of hand-rolling the new LoggerService -> UtilitiesService ->
  // ExceptionService -> CacheService -> SpreadsheetService chain. The returned
  // shape is preserved for backward compatibility (F-3.4 / WP-14).
  const factory = GoogleApiWrapper.ServiceFactory;

  return {
    exceptionService: factory.getExceptionService(),
    logger: factory.getLogger(),
    utils: factory.getUtilitiesService(),
    spreadsheetService: factory.getSpreadsheetService(),
    cacheService: factory.getCacheService()
  };
}

global.initializeServices = initializeServices;

export {
  CoreUtilsLib,
  GasResilienceLib,
  GoogleApiWrapper,
  WorkspaceTemplateEngine,
  GasExpressionEngineLib,
  SheetDBLib,
  JobRunnerLib,
  PipelineFramework,
  ContextEngine,
  GasDataImporter,
  DomainRepositoryLib,
  GasSchemaValidatorLib,
  GasOnlineTestFramework,
  RoleResolutionLib,
  ComposableContentLib,
  GasProcessMonitorLib,
  initializeServices
};
