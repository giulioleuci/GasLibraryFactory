/**
 * @file CoreUtilsLib/src/UtilsService.js
 * @description Utility service providing stateless helper functions for common operations.
 * @version 2.0 - Refactored using Facade/Delegation pattern
 */

import { IdGenerator } from './utils/IdGenerator.js';
import { DateUtils } from './utils/DateUtils.js';
import { StringUtils } from './utils/StringUtils.js';
import { SystemEnvironmentUtils } from './utils/SystemEnvironmentUtils.js';
import { SystemScriptSettings } from './utils/SystemScriptSettings.js';
import {
  chunk,
  compact,
  difference,
  differenceBy,
  every,
  filter,
  find,
  flattenDeep,
  forEach,
  groupBy,
  intersection,
  isEmpty,
  keyBy,
  map,
  maxBy,
  meanBy,
  minBy,
  orderBy,
  reduce,
  size,
  some,
  sumBy,
  uniq,
  uniqBy
} from './facades/LodashFacade.js';

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
// LodashFacade's flatten() has no depth param; the public flatten(array, depth) needs one.
const flatten = (a, depth = 1) => (Array.isArray(a) ? a.flat(depth) : []);

export class MyUtilsService {
  constructor(sleepFn = null) {
    this._sleepFn = sleepFn;
    this._idGenerator = new IdGenerator();
    this._dateUtils = new DateUtils();
    this._stringUtils = new StringUtils();
    this._environmentUtils = new SystemEnvironmentUtils(sleepFn);
    this._scriptSettings = new SystemScriptSettings();

    const managers = [
      this._idGenerator,
      this._dateUtils,
      this._stringUtils,
      this._environmentUtils,
      this._scriptSettings
    ];
    managers.forEach((manager) => {
      // Get methods from prototype
      const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(manager)).filter(
        (name) => name !== 'constructor' && typeof manager[name] === 'function'
      );

      // Get own methods (for nested facades). Exclude underscore-prefixed
      // own properties: those are internal state (e.g. SystemEnvironmentUtils'
      // injected `_sleepFn`), not public methods, even when they happen to
      // hold a function value.
      const ownMethods = Object.getOwnPropertyNames(manager).filter(
        (name) => !name.startsWith('_') && typeof manager[name] === 'function'
      );

      const allMethods = [...new Set([...protoMethods, ...ownMethods])];

      allMethods.forEach((name) => {
        this[name] = manager[name].bind(manager);
      });
    });

    this.isEmpty = isEmpty;
    this.chunk = chunk;
    this.unique = uniq;
    this.flatten = flatten;
    this.flattenShallow = (array) => flatten(array);
    this.flattenDeep = flattenDeep;
    this.compact = compact;
    this.difference = difference;
    this.differenceBy = differenceBy;
    this.groupBy = groupBy;
    this.intersection = intersection;
    this.keyBy = keyBy;
    this.orderBy = orderBy;
    this.uniq = uniq;
    this.uniqBy = uniqBy;
    this.randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    this.round = (number, decimals = 0) => {
      const multiplier = Math.pow(10, decimals);
      return Math.round(number * multiplier) / multiplier;
    };
    this.clamp = clamp;
    this.maxBy = maxBy;
    this.minBy = minBy;
    this.sumBy = sumBy;
    this.meanBy = meanBy;
    this.every = every;
    this.filter = filter;
    this.find = find;
    this.forEach = forEach;
    this.map = map;
    this.reduce = reduce;
    this.size = size;
    this.some = some;
  }
}

export { MyUtilsService as UtilsService };
