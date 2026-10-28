/**
 * 🧪 GoogleApiWrapper Online Tests
 * Entry point for tests of the native Google Workspace API boundary.
 */

/**
 * Initialize all GoogleApiWrapper tests in the global runner.
 */
function initGoogleApiWrapperTests() {
  const NS = 'GoogleApiWrapper';

  // Initialize service-specific tests
  if (typeof initGoogleApiWrapperTests_Drive === 'function') {
    initGoogleApiWrapperTests_Drive(NS);
  }
  if (typeof initGoogleApiWrapperTests_Docs === 'function') {
    initGoogleApiWrapperTests_Docs(NS);
  }
  if (typeof initGoogleApiWrapperTests_Sheets === 'function') {
    initGoogleApiWrapperTests_Sheets(NS);
  }
  if (typeof initGoogleApiWrapperTests_Gmail === 'function') {
    initGoogleApiWrapperTests_Gmail(NS);
  }
  if (typeof initGoogleApiWrapperTests_Services === 'function') {
    initGoogleApiWrapperTests_Services(NS);
  }
}

/**
 * Shared helper to create dependencies for all GoogleApiWrapper tests.
 * @returns {Object} Dependency map
 */
function createGoogleApiWrapperDeps() {
  const logger = new LoggerService();
  const utilitiesService = new UtilitiesService(logger);
  const utils = new UtilsService((ms: number) => utilitiesService.sleep(ms));
  const WrapperCacheService = CacheService as typeof CacheService &
    typeof import('@GoogleApiWrapper').CacheService;
  const cacheServiceWrapper = new WrapperCacheService(logger);
  const cache = cacheServiceWrapper.getScriptCache();
  const exceptionService = new ExceptionService(logger, utils);
  const mailUtils = {
    sleep: (ms: number) => utils.sleep(ms)
  };
  return {
    logger,
    utils,
    cache,
    exceptionService,
    utilitiesService,
    cacheServiceWrapper,
    mailUtils
  };
}
