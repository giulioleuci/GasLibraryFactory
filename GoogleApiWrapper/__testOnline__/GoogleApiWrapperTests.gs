/**
 * 🧪 GoogleApiWrapper Online Tests
 * Entry point for comprehensive Google Workspace service wrapper tests.
 */

/**
 * Initialize all GoogleApiWrapper tests in the global runner.
 */
function initGoogleApiWrapperTests() {
  const NS = 'GoogleApiWrapper';

  // Initialize service-specific tests
  if (typeof initGoogleApiWrapperTests_Drive === 'function') initGoogleApiWrapperTests_Drive(NS);
  if (typeof initGoogleApiWrapperTests_Docs === 'function') initGoogleApiWrapperTests_Docs(NS);
  if (typeof initGoogleApiWrapperTests_Sheets === 'function') initGoogleApiWrapperTests_Sheets(NS);
  if (typeof initGoogleApiWrapperTests_Gmail === 'function') initGoogleApiWrapperTests_Gmail(NS);
  if (typeof initGoogleApiWrapperTests_Services === 'function')
    initGoogleApiWrapperTests_Services(NS);

  // Basic Logger test (stays here as it's foundational)
  runner.register(`${NS}/LoggerService/BasicLogging`, () => {
    const logger = new LoggerService();
    logger.info('Test info message');
    logger.warn('Test warning message');
    logger.error('Test error message');
    logger.debug('Test debug message');

    SmartAssert.notNull(logger, 'LoggerService should be created');
  });
}

/**
 * Shared helper to create dependencies for all GoogleApiWrapper tests.
 * @returns {Object} Dependency map
 */
function createGoogleApiWrapperDeps() {
  const logger = new LoggerService();
  const utilitiesService = new UtilitiesService(logger);
  const utils = new UtilsService((ms) => utilitiesService.sleep(ms));
  const cacheServiceWrapper = new CacheService(logger);
  const cache = cacheServiceWrapper.getScriptCache();
  const exceptionService = new ExceptionService(logger, utils);
  const mailUtils = {
    sleep: (ms) => utils.sleep(ms)
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
