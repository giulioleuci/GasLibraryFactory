/** Facade exposing system utilities through a statically visible public surface. */

import { SystemEnvironmentUtils } from './SystemEnvironmentUtils.js';
import { SystemScriptSettings } from './SystemScriptSettings.js';
import {
  clamp,
  compact,
  differenceBy,
  flatten,
  groupBy,
  keyBy,
  maxBy,
  meanBy,
  minBy,
  orderBy,
  sumBy,
  uniqBy,
  unique
} from './collections.js';
import {
  chunk,
  difference,
  every,
  filter,
  find,
  forEach,
  intersection,
  map,
  reduce,
  size,
  some
} from '../facades/LodashFacade.js';

export class SystemUtils {
  constructor(sleepFn = null) {
    this._environmentUtils = new SystemEnvironmentUtils(sleepFn);
    this._scriptSettings = new SystemScriptSettings();
  }

  sleep(...args) {
    return this._environmentUtils.sleep(...args);
  }
  delay(...args) {
    return this._environmentUtils.delay(...args);
  }
  isValidEmail(...args) {
    return this._environmentUtils.isValidEmail(...args);
  }
  isValidUrl(...args) {
    return this._environmentUtils.isValidUrl(...args);
  }
  isEqual(...args) {
    return this._environmentUtils.isEqual(...args);
  }
  isNil(...args) {
    return this._environmentUtils.isNil(...args);
  }
  isNumber(...args) {
    return this._environmentUtils.isNumber(...args);
  }
  isString(...args) {
    return this._environmentUtils.isString(...args);
  }
  isEmptyValue(...args) {
    return this._environmentUtils.isEmptyValue(...args);
  }
  debounce(...args) {
    return this._environmentUtils.debounce(...args);
  }
  once(...args) {
    return this._environmentUtils.once(...args);
  }
  noop(...args) {
    return this._environmentUtils.noop(...args);
  }

  chunk(...args) {
    return chunk(...args);
  }
  unique(...args) {
    return unique(...args);
  }
  flatten(...args) {
    return flatten(...args);
  }
  flattenShallow(array) {
    return flatten(array);
  }
  flattenDeep(array) {
    return flatten(array, Infinity);
  }
  compact(...args) {
    return compact(...args);
  }
  difference(...args) {
    return difference(...args);
  }
  differenceBy(...args) {
    return differenceBy(...args);
  }
  groupBy(...args) {
    return groupBy(...args);
  }
  intersection(...args) {
    return intersection(...args);
  }
  keyBy(...args) {
    return keyBy(...args);
  }
  orderBy(...args) {
    return orderBy(...args);
  }
  uniq(...args) {
    return unique(...args);
  }
  uniqBy(...args) {
    return uniqBy(...args);
  }
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  round(number, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(number * multiplier) / multiplier;
  }
  clamp(...args) {
    return clamp(...args);
  }
  maxBy(...args) {
    return maxBy(...args);
  }
  minBy(...args) {
    return minBy(...args);
  }
  sumBy(...args) {
    return sumBy(...args);
  }
  meanBy(...args) {
    return meanBy(...args);
  }
  every(...args) {
    return every(...args);
  }
  filter(...args) {
    return filter(...args);
  }
  find(...args) {
    return find(...args);
  }
  forEach(...args) {
    return forEach(...args);
  }
  map(...args) {
    return map(...args);
  }
  reduce(...args) {
    return reduce(...args);
  }
  size(...args) {
    return size(...args);
  }
  some(...args) {
    return some(...args);
  }

  deepClone(...args) {
    return this._scriptSettings.deepClone(...args);
  }
  deepMerge(...args) {
    return this._scriptSettings.deepMerge(...args);
  }
  getNestedProperty(...args) {
    return this._scriptSettings.getNestedProperty(...args);
  }
  setNestedProperty(...args) {
    return this._scriptSettings.setNestedProperty(...args);
  }
  has(...args) {
    return this._scriptSettings.has(...args);
  }
  pick(...args) {
    return this._scriptSettings.pick(...args);
  }
  omit(...args) {
    return this._scriptSettings.omit(...args);
  }
  mapKeys(...args) {
    return this._scriptSettings.mapKeys(...args);
  }
  mapValues(...args) {
    return this._scriptSettings.mapValues(...args);
  }
}
