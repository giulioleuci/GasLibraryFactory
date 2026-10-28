/**
 * Offline Bundle Test Setup
 *
 * This file runs in setupFilesAfterEnv and just marks that the offline
 * test environment is ready. The actual bundle loading is deferred to
 * test/offline/helpers/load-bundle.js which each test file calls in
 * beforeAll(), giving Jest's worker proper control over timing.
 */

// Mark that we're in offline test mode (GAS mocks from test/setup.js are active)
global.__offlineTestEnv = true;
global.__bundleLoaded = false;
global.__bundleError = null;
global.__bundleSource = null;
