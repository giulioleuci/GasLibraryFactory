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

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
// LodashFacade's flatten() has no depth param; the public flatten(array, depth) needs one.
const flatten: {
  <T, D extends number = 1>(a: readonly T[] | null | undefined, depth?: D): FlatArray<T, D>[];
  (a: unknown, depth?: number): unknown[];
} = (a: unknown, depth = 1) => (Array.isArray(a) ? a.flat(depth) : []);

type PublicMethods<T> = Pick<
  T,
  {
    [K in keyof T]: K extends `_${string}` ? never : T[K] extends Function ? K : never;
  }[keyof T]
>;

export interface MyUtilsService
  extends
    PublicMethods<IdGenerator>,
    PublicMethods<DateUtils>,
    PublicMethods<StringUtils>,
    PublicMethods<SystemEnvironmentUtils>,
    PublicMethods<SystemScriptSettings> {}

export class MyUtilsService {
  declare isEmpty: typeof isEmpty;
  declare chunk: typeof chunk;
  declare unique: typeof uniq;
  declare flatten: typeof flatten;
  declare flattenDeep: typeof flattenDeep;
  declare compact: typeof compact;
  declare difference: typeof difference;
  declare differenceBy: typeof differenceBy;
  declare groupBy: typeof groupBy;
  declare intersection: typeof intersection;
  declare keyBy: typeof keyBy;
  declare orderBy: typeof orderBy;
  declare uniq: typeof uniq;
  declare uniqBy: typeof uniqBy;
  declare clamp: typeof clamp;
  declare maxBy: typeof maxBy;
  declare minBy: typeof minBy;
  declare sumBy: typeof sumBy;
  declare meanBy: typeof meanBy;
  declare every: typeof every;
  declare filter: typeof filter;
  declare find: typeof find;
  declare forEach: typeof forEach;
  declare map: typeof map;
  declare reduce: typeof reduce;
  declare size: typeof size;
  declare some: typeof some;
  declare flattenShallow: <T>(array: readonly T[] | null | undefined) => FlatArray<T, 1>[];
  declare randomInt: (min: number, max: number) => number;
  declare round: (number: number, decimals?: number) => number;

  declare _sleepFn: ((milliseconds: number) => void) | null;
  declare _idGenerator: IdGenerator;
  declare _dateUtils: DateUtils;
  declare _stringUtils: StringUtils;
  declare _environmentUtils: SystemEnvironmentUtils;
  declare _scriptSettings: SystemScriptSettings;

  constructor(sleepFn: ((milliseconds: number) => void) | null = null) {
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
        (name) =>
          name !== 'constructor' &&
          typeof (manager as unknown as Record<string, unknown>)[name] === 'function'
      );

      // Get own methods (for nested facades). Exclude underscore-prefixed
      // own properties: those are internal state (e.g. SystemEnvironmentUtils'
      // injected `_sleepFn`), not public methods, even when they happen to
      // hold a function value.
      const ownMethods = Object.getOwnPropertyNames(manager).filter(
        (name) =>
          !name.startsWith('_') &&
          typeof (manager as unknown as Record<string, unknown>)[name] === 'function'
      );

      const allMethods = [...new Set([...protoMethods, ...ownMethods])];

      allMethods.forEach((name) => {
        (this as unknown as Record<string, unknown>)[name] = (
          manager as unknown as Record<string, Function>
        )[name].bind(manager);
      });
    });

    this.isEmpty = isEmpty;
    this.chunk = chunk;
    this.unique = uniq;
    this.flatten = flatten;
    this.flattenShallow = <T>(array: readonly T[] | null | undefined) => flatten(array);
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
    this.randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    this.round = (number: number, decimals = 0) => {
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
