import type { initializeServices as initializeServicesFunction } from '../src/index.js';

declare global {
  var global: typeof globalThis;
  var __nativeCacheService__: GoogleAppsScript.Cache.CacheService | undefined;
  var __nativePropertiesService__: GoogleAppsScript.Properties.PropertiesService | undefined;
  var __nativeLockService__: GoogleAppsScript.Lock.LockService | undefined;
  var initializeServices: typeof initializeServicesFunction;
}
