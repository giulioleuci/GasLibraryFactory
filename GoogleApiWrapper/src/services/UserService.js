/**
 * @file GoogleApiWrapper/src/services/UserService.js
 * @description Facade for Google Apps Script's Session API (running-user identity).
 */

/**
 * @class UserService
 * @description Lightweight facade for the native GAS `Session` global — the L2
 * boundary for running-user identity lookups, so no other library or consumer
 * needs to touch `Session` directly.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 */
export class UserService {
  /**
   * @param {LoggerService} [logger=console] Diagnostic logger.
   */
  constructor(logger = console) {
    this._logger = logger || console;
  }

  /**
   * @description Returns the email address of the user running the current script execution.
   * @returns {string}
   */
  getActiveUserEmail() {
    try {
      const email = global.Session.getActiveUser().getEmail();
      this._logger.debug('Resolved active user email');
      return email;
    } catch (error) {
      this._logger.error(`Error resolving active user email: ${error.message}`);
      throw error;
    }
  }
}
