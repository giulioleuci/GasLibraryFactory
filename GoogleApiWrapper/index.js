// ===================================================================
// FILE: GoogleApiWrapper/index.js
// ===================================================================
// Main entry point for GoogleApiWrapper ES Module exports
// ===================================================================

/**
 * GoogleApiWrapper (L2) — GAS-native wrappers for Drive, Sheets, Docs, Gmail,
 * Properties, Cache, Triggers, Locks, and UI, plus a ServiceFactory DI
 * container and GasResilienceLib-backed retry. Full API reference and usage
 * examples live in `DOCS_LIBS/GoogleApiWrapper.md`.
 *
 * Exports: MenuBuilder, SidebarBuilder, DialogBuilder, TextStyleMapper,
 * GoogleService, ServiceFactory, CacheService/Cache, DocumentService,
 * DriveService, LockService, MailService, PermissionService,
 * PropertiesService, SpreadsheetService, TriggerService, UiService,
 * UserService, UtilitiesService, plus `testing` mocks. Also re-exports
 * LoggerService/UtilsService from @CoreUtilsLib (deprecated — see below).
 *
 * @module GoogleApiWrapper
 */

// Core services - Re-exported from CoreUtilsLib for backward compatibility.
// @deprecated Import LoggerService/UtilsService directly from `@CoreUtilsLib`.
// The canonical home for these L0 classes is CoreUtilsLib; this re-export exists
// only so older `@GoogleApiWrapper` imports keep working and may be removed in a
// future major version. (WP-06 / F-3.3)
export { LoggerService, UtilsService } from '@CoreUtilsLib';

// Google-specific utilities (remain in GoogleApiWrapper)
export { MenuBuilder } from './src/builders/MenuBuilder';
export { SidebarBuilder } from './src/builders/SidebarBuilder';
export { DialogBuilder } from './src/builders/DialogBuilder';

// Services-managers utilities
export { TextStyleMapper } from './src/internal/services-managers/TextStyleMapper';

// Core base classes
export { GoogleService } from './src/internal/core/GoogleService';

// Service Factory - Centralized dependency injection
export { ServiceFactory } from './src/internal/core/ServiceFactory';

// Google Workspace services
export { CacheService, Cache } from './src/services/CacheService';
export { DocumentService } from './src/services/DocumentService';
export { DriveService } from './src/services/DriveService';
export { LockService } from './src/services/LockService';
export { MailService } from './src/services/MailService';
export { PermissionService } from './src/services/PermissionService';
export { PropertiesService } from './src/services/PropertiesService';
export { SpreadsheetService } from './src/services/SpreadsheetService';
export { TriggerService } from './src/services/TriggerService';
export { UiService } from './src/services/UiService';
export { UserService } from './src/services/UserService';
export { UtilitiesService } from './src/services/UtilitiesService';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
