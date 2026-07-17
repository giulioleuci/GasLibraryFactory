/**
 * @file GoogleApiWrapper/src/services/LockService.js
 * @description Facade for Google Apps Script's LockService.
 * Provides a clean, testable interface for script-level locking.
 * @version 1.0 - Created for performance optimization
 */

/**
 * @class LockService
 * @description Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _nativeLockService Reference to the global GAS LockService object.
 */
export class LockService {
  /**
   * @description Initializes LockService and auto-detects native GAS LockService availability.
   * @param {LoggerService} logger Diagnostic logger.
   */
  constructor(logger) {
    /**
     * Logger instance for operation logging.
     * @private
     * @type {LoggerService}
     */
    this._logger = logger;

    /**
     * Native GAS LockService (if available).
     * @private
     * @type {GoogleAppsScript.Lock.LockService|null}
     */
    // Detect native GAS LockService by checking for static getScriptLock method.
    // In webpack bundles, global.LockService may be our wrapper class (instance methods only),
    // so we verify the candidate has getScriptLock directly (not on prototype).
    const candidate =
      typeof global !== 'undefined' && global.LockService ? global.LockService : null;
    this._nativeLockService =
      candidate && typeof candidate.getScriptLock === 'function' ? candidate : null;
  }

  /**
   * @description Returns a Lock wrapper for the GAS Script Lock (global concurrency).
   * @returns {Lock|MockLock} Script lock implementation.
   */
  getScriptLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring script lock from native LockService');
      return new Lock(this._nativeLockService.getScriptLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
   * @description Returns a Lock wrapper for the GAS User Lock (per-user concurrency).
   * @returns {Lock|MockLock} User lock implementation.
   */
  getUserLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring user lock from native LockService');
      return new Lock(this._nativeLockService.getUserLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
   * @description Returns a Lock wrapper for the GAS Document Lock (per-document concurrency).
   * @param {string} documentId Target document identifier.
   * @returns {Lock|MockLock} Document lock implementation.
   */
  getDocumentLock(documentId) {
    if (this._nativeLockService) {
      this._logger.debug(`Acquiring document lock for: ${documentId}`);
      return new Lock(this._nativeLockService.getDocumentLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }
}

/**
 * @private
 * @class Lock
 * @description Wrapper for native GAS Lock object. Provides consistent acquisition status and diagnostic logging.
 *
 * @property {Object} _nativeLock Native GAS Lock instance.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {boolean} _acquired Current acquisition status.
 */
class Lock {
  /**
   * @param {GoogleAppsScript.Lock.Lock} nativeLock - Native GAS Lock object
   * @param {LoggerService} logger - Logger instance
   */
  constructor(nativeLock, logger) {
    this._nativeLock = nativeLock;
    this._logger = logger;
    this._acquired = false;
  }

  /**
   * @description Non-blocking attempt to acquire lock.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @returns {boolean} True if acquisition succeeded.
   * @throws {Error} On native acquisition failure.
   */
  tryLock(timeoutInMillis) {
    try {
      this._acquired = this._nativeLock.tryLock(timeoutInMillis);
      if (this._acquired) {
        this._logger.debug(`Lock acquired with timeout: ${timeoutInMillis}ms`);
      } else {
        this._logger.debug(`Failed to acquire lock after: ${timeoutInMillis}ms`);
      }
      return this._acquired;
    } catch (error) {
      this._logger.error(`Error acquiring lock: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Blocking attempt to acquire lock. Throws on timeout.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @throws {Error} If lock cannot be acquired within timeout.
   */
  waitLock(timeoutInMillis) {
    try {
      this._nativeLock.waitLock(timeoutInMillis);
      this._acquired = true;
      this._logger.debug(`Lock acquired (wait) with timeout: ${timeoutInMillis}ms`);
    } catch (error) {
      this._logger.error(`Failed to wait for lock: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Relinquishes held lock. No-op if not acquired.
   * @throws {Error} On native release failure.
   */
  releaseLock() {
    if (this._acquired) {
      try {
        this._nativeLock.releaseLock();
        this._logger.debug('Lock released');
        this._acquired = false;
      } catch (error) {
        this._logger.error(`Error releasing lock: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * @description Returns the local acquisition status of the lock.
   * @returns {boolean}
   */
  hasLock() {
    return this._acquired;
  }
}

/**
 * @private
 * @class MockLock
 * @description Simulated lock for test environments. Always succeeds in acquisition.
 */
class MockLock {
  /**
   * @param {LoggerService} logger - Logger instance
   */
  constructor(logger) {
    this._logger = logger;
    this._acquired = false;
  }

  /**
   * @description Mock tryLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   * @returns {boolean} Always returns true
   */
  tryLock(timeoutInMillis) {
    this._acquired = true;
    this._logger.debug(`Mock lock acquired (timeout: ${timeoutInMillis}ms)`);
    return true;
  }

  /**
   * @description Mock waitLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   */
  waitLock(timeoutInMillis) {
    this._acquired = true;
    this._logger.debug(`Mock lock acquired via wait (timeout: ${timeoutInMillis}ms)`);
  }

  /**
   * @description Mock releaseLock - clears acquired flag.
   */
  releaseLock() {
    this._acquired = false;
    this._logger.debug('Mock lock released');
  }

  /**
   * @description Returns whether this mock lock is acquired.
   * @returns {boolean} True if acquired
   */
  hasLock() {
    return this._acquired;
  }
}
