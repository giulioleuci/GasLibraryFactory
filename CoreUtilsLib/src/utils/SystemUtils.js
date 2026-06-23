/**
 * @file CoreUtilsLib/src/utils/SystemUtils.js
 * @description Facade for system utilities, delegating to specialized managers.
 * @version 2.0 - Refactored into specialized modules.
 */

import { SystemEnvironmentUtils } from './SystemEnvironmentUtils.js';
import { SystemQuotaManager } from './SystemQuotaManager.js';
import { SystemScriptSettings } from './SystemScriptSettings.js';

export class SystemUtils {
  constructor(sleepFn = null) {
    this._environmentUtils = new SystemEnvironmentUtils(sleepFn);
    this._quotaManager = new SystemQuotaManager();
    this._scriptSettings = new SystemScriptSettings();

    // Delegate methods to specialized managers
    const delegations = [
      {
        manager: this._environmentUtils,
        methods: [
          'sleep', 'delay', 'isValidEmail', 'isValidUrl', 'isEqual', 'isNil',
          'isNumber', 'isString', 'isEmptyValue', 'debounce', 'once', 'noop'
        ]
      },
      {
        manager: this._quotaManager,
        methods: [
          'chunk', 'unique', 'flatten', 'flattenShallow', 'flattenDeep', 'compact',
          'difference', 'differenceBy', 'groupBy', 'intersection', 'keyBy', 'orderBy',
          'uniq', 'uniqBy', 'randomInt', 'round', 'clamp', 'maxBy', 'minBy', 'sumBy',
          'meanBy', 'every', 'filter', 'find', 'forEach', 'map', 'reduce', 'size', 'some'
        ]
      },
      {
        manager: this._scriptSettings,
        methods: [
          'deepClone', 'deepMerge', 'getNestedProperty', 'setNestedProperty', 'has',
          'pick', 'omit', 'mapKeys', 'mapValues'
        ]
      }
    ];

    delegations.forEach(({ manager, methods }) => {
      methods.forEach(method => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
  }
}
