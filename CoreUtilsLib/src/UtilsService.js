/**
 * @file CoreUtilsLib/src/UtilsService.js
 * @description Utility service providing stateless helper functions for common operations.
 * @version 2.0 - Refactored using Facade/Delegation pattern
 */

import { IdGenerator } from './utils/IdGenerator.js';
import { DateUtils } from './utils/DateUtils.js';
import { StringUtils } from './utils/StringUtils.js';
import { SystemUtils } from './utils/SystemUtils.js';

export class MyUtilsService {
  static get MILLIS_PER_DAY() {
    return DateUtils.MILLIS_PER_DAY;
  }
  static get MILLIS_PER_HOUR() {
    return DateUtils.MILLIS_PER_HOUR;
  }
  static get MILLIS_PER_MINUTE() {
    return DateUtils.MILLIS_PER_MINUTE;
  }
  static get MILLIS_PER_SECOND() {
    return DateUtils.MILLIS_PER_SECOND;
  }

  constructor(sleepFn = null) {
    this._sleepFn = sleepFn;
    this._idGenerator = new IdGenerator();
    this._dateUtils = new DateUtils();
    this._stringUtils = new StringUtils();
    this._systemUtils = new SystemUtils(sleepFn);

    const managers = [this._idGenerator, this._dateUtils, this._stringUtils, this._systemUtils];
    managers.forEach((manager) => {
      // Get methods from prototype
      const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(manager)).filter(
        (name) => name !== 'constructor' && typeof manager[name] === 'function'
      );

      // Get own methods (for nested facades)
      const ownMethods = Object.getOwnPropertyNames(manager).filter(
        (name) => typeof manager[name] === 'function'
      );

      const allMethods = [...new Set([...protoMethods, ...ownMethods])];

      allMethods.forEach((name) => {
        this[name] = manager[name].bind(manager);
      });
    });
  }
}

export { MyUtilsService as UtilsService };
