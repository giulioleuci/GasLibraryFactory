/**
 * @file CoreUtilsLib/src/utils/DateUtils.js
 * @description Extracted DateUtils utility module.
 */

// date-fns removed - using native implementations

// Pre-compiled format token regexes — hoisted to avoid repeated allocation in formatDate.
// Order matters: longer tokens (YYYY, SSS) must be listed before shorter overlapping ones (YY).
const _FORMAT_REGEXES = Object.fromEntries(
  ['YYYY', 'yyyy', 'YY', 'yy', 'MM', 'DD', 'dd', 'HH', 'mm', 'ss', 'SSS'].map((t) => [
    t,
    new RegExp(t, 'g')
  ])
);

export class DateUtils {
  /**
   * Milliseconds in one day (86,400,000).
   * @returns {number} 86400000
   * @example
   * const daysInMs = DateUtils.MILLIS_PER_DAY * 7; // 1 week in milliseconds
   */
  static get MILLIS_PER_DAY() {
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Milliseconds in one hour (3,600,000).
   * @returns {number} 3600000
   * @example
   * const timeout = DateUtils.MILLIS_PER_HOUR * 2; // 2 hours
   */
  static get MILLIS_PER_HOUR() {
    return 60 * 60 * 1000;
  }

  /**
   * Milliseconds in one minute (60,000).
   * @returns {number} 60000
   * @example
   * const delay = DateUtils.MILLIS_PER_MINUTE * 5; // 5 minutes
   */
  static get MILLIS_PER_MINUTE() {
    return 60 * 1000;
  }

  /**
   * Milliseconds in one second (1,000).
   * @returns {number} 1000
   * @example
   * const timeout = DateUtils.MILLIS_PER_SECOND * 30; // 30 seconds
   */
  static get MILLIS_PER_SECOND() {
    return 1000;
  }

  /**
   * Universal date parser for Date objects, ISO strings, Unix timestamps (>=100k), and Sheets serials (<100k).
   * @param {Date|string|number|null|undefined} input Multi-format date input.
   * @returns {Date|null} Parsed Date object or null for invalid inputs.
   */
  parseDate(input) {
    if (!input && input !== 0) {
      return null;
    }

    // Already a Date object
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }

    // String input
    if (typeof input === 'string') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    // Number input
    if (typeof input === 'number') {
      // Check if it's a Google Sheets serial number (typically < 100000)
      if (input > 0 && input < 100000) {
        return this.parseGoogleSheetsDate(input);
      }
      // Otherwise treat as timestamp
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * Converts a Google Sheets serial number (days since Dec 30, 1899) to a Date object.
   * @param {number} serialNumber Sheets date serial number.
   * @returns {Date} Parsed Date object.
   */
  parseGoogleSheetsDate(serialNumber) {
    // Google Sheets epoch: December 30, 1899
    const epoch = new Date(1899, 11, 30);
    const millisPerDay = DateUtils.MILLIS_PER_DAY;
    return new Date(epoch.getTime() + serialNumber * millisPerDay);
  }

  /**
   * Strictly parses an ISO 8601 formatted date string.
   * @param {string} isoString ISO 8601 date string.
   * @returns {Date|null} Parsed Date object or null if invalid.
   */
  parseISODate(isoString) {
    if (typeof isoString !== 'string') {
      return null;
    }
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Parses a date string using a specific pattern (DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD).
   * @param {string} dateString Formatted date string.
   * @param {string} format Expected format pattern.
   * @returns {Date|null} Parsed Date object or null if unparseable.
   */
  parseDateWithFormat(dateString, format) {
    if (!dateString || !format) {
      return null;
    }

    const formatUpper = format.toUpperCase();
    let day, month, year;

    if (formatUpper === 'DD/MM/YYYY') {
      const parts = dateString.split('/');
      if (parts.length !== 3) {
        return null;
      }
      [day, month, year] = parts;
    } else if (formatUpper === 'MM/DD/YYYY') {
      const parts = dateString.split('/');
      if (parts.length !== 3) {
        return null;
      }
      [month, day, year] = parts;
    } else if (formatUpper === 'YYYY-MM-DD') {
      const parts = dateString.split('-');
      if (parts.length !== 3) {
        return null;
      }
      [year, month, day] = parts;
    } else {
      // Fallback to standard parsing
      return this.parseDate(dateString);
    }

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Formats a Date object as a standard ISO 8601 string.
   * @param {Date} date Date to format.
   * @returns {string|null} ISO 8601 string or null if date is invalid.
   */
  formatISODate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }

  /**
   * Formats a Date object using custom tokens (YYYY, MM, DD, HH, mm, ss, SSS).
   * @param {Date} date Date to format.
   * @param {string} [format='YYYY-MM-DD'] Token-based format pattern.
   * @returns {string|null} Formatted string or null if date is invalid.
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }

    const pad = (num) => String(num).padStart(2, '0');

    const replacements = {
      YYYY: date.getFullYear(),
      yyyy: date.getFullYear(), // Support lowercase (GAS compatibility)
      YY: String(date.getFullYear()).slice(-2),
      yy: String(date.getFullYear()).slice(-2), // Support lowercase
      MM: pad(date.getMonth() + 1),
      DD: pad(date.getDate()),
      dd: pad(date.getDate()), // Support lowercase (GAS compatibility)
      HH: pad(date.getHours()),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds()),
      SSS: String(date.getMilliseconds()).padStart(3, '0')
    };

    let result = format;
    for (const [token, value] of Object.entries(replacements)) {
      result = result.replace(_FORMAT_REGEXES[token], value);
    }

    return result;
  }

  /**
   * Converts a Date object to a Google Sheets serial number (decimal days since epoch).
   * @param {Date} date Date to convert.
   * @returns {number|null} Sheets serial number or null if invalid.
   */
  toGoogleSheetsDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const epoch = new Date(1899, 11, 30);
    const millisPerDay = DateUtils.MILLIS_PER_DAY;
    return (date.getTime() - epoch.getTime()) / millisPerDay;
  }

  /**
   * Returns a new Date with specified days added (or subtracted if negative).
   * @param {Date} date Reference date.
   * @param {number} days Days to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
  /** @private Clones a Date instance. @param {Date} date Valid date object. @returns {Date} New instance. */
  _cloneDate(date) {
    return new Date(date.getTime());
  }

  /**
   * @private Calculates millisecond difference (d2 - d1). @param {Date} date1 Start date. @param {Date} date2 End date. @returns {number|null} Diff or null if invalid.
   */
  _diffMs(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return null;
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;
    return date2.getTime() - date1.getTime();
  }

  addDays(date, days) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const result = this._cloneDate(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Returns a new Date with specified hours added.
   * @param {Date} date Reference date.
   * @param {number} hours Hours to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
  addHours(date, hours) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    return new Date(date.getTime() + hours * DateUtils.MILLIS_PER_HOUR);
  }

  /**
   * Returns a new Date with specified minutes added.
   * @param {Date} date Reference date.
   * @param {number} minutes Minutes to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
  addMinutes(date, minutes) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    return new Date(date.getTime() + minutes * DateUtils.MILLIS_PER_MINUTE);
  }

  /**
   * Returns a new Date with specified months added.
   * @param {Date} date Reference date.
   * @param {number} months Months to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
  addMonths(date, months) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const result = this._cloneDate(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Returns a new Date with specified years added.
   * @param {Date} date Reference date.
   * @param {number} years Years to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
  addYears(date, years) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const result = this._cloneDate(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Calculates truncated day difference between two dates (date2 - date1).
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Day count or null if invalid.
   */
  daysBetween(date1, date2) {
    const diff = this._diffMs(date1, date2);
    return diff === null ? null : Math.trunc(diff / DateUtils.MILLIS_PER_DAY);
  }

  /**
   * Calculates truncated hour difference between two dates.
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Hour count or null if invalid.
   */
  hoursBetween(date1, date2) {
    const diff = this._diffMs(date1, date2);
    return diff === null ? null : Math.trunc(diff / DateUtils.MILLIS_PER_HOUR);
  }

  /**
   * Calculates truncated minute difference between two dates.
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Minute count or null if invalid.
   */
  minutesBetween(date1, date2) {
    const diff = this._diffMs(date1, date2);
    return diff === null ? null : Math.trunc(diff / DateUtils.MILLIS_PER_MINUTE);
  }

  /**
   * Checks if date1 is chronologically earlier than date2.
   * @param {Date} date1 Comparison date.
   * @param {Date} date2 Reference date.
   * @returns {boolean|null} Comparison result or null if invalid.
   */
  isBefore(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
      return null;
    }
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return null;
    }
    return date1.getTime() < date2.getTime();
  }

  /**
   * Checks if date1 is chronologically later than date2.
   * @param {Date} date1 Comparison date.
   * @param {Date} date2 Reference date.
   * @returns {boolean|null} Comparison result or null if invalid.
   */
  isAfter(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
      return null;
    }
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return null;
    }
    return date1.getTime() > date2.getTime();
  }

  /**
   * Checks if two dates fall on the same calendar day (ignores time).
   * @param {Date} date1 First date.
   * @param {Date} date2 Second date.
   * @returns {boolean|null} True if YYYY-MM-DD matches, null if invalid.
   */
  isSameDay(date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
      return null;
    }
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return null;
    }

    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Returns a new Date set to 00:00:00.000 for the specified day.
   * @param {Date} date Reference date.
   * @returns {Date|null} Midnight Date instance or null if invalid.
   */
  startOfDay(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const result = this._cloneDate(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Returns a new Date set to 23:59:59.999 for the specified day.
   * @param {Date} date Reference date.
   * @returns {Date|null} End-of-day Date instance or null if invalid.
   */
  endOfDay(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    const result = this._cloneDate(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Validates if a value is a Date object or unparseable date string/number.
   * @param {*} value Input to validate.
   * @returns {boolean} True if parseable as a valid date.
   */
  isValidDate(value) {
    const date = this.parseDate(value);
    return date !== null;
  }

  /**
   * Formats millisecond duration into a human-readable string (e.g., '1d 2h 5m 30s').
   * @param {number} ms Duration in milliseconds.
   * @param {{short?:boolean, showMs?:boolean}} [options={}] Formatting behavior options.
   * @returns {string} Formatted duration string or '--' for invalid inputs.
   */
  formatDuration(ms, options = {}) {
    if (ms === null || ms === undefined || ms < 0 || typeof ms !== 'number') {
      return '--';
    }

    const { short = false, showMs = false } = options;

    // Handle sub-second durations
    if (ms < 1000) {
      return `${Math.floor(ms)}ms`;
    }

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0 || days > 0) {
      if (hours > 0 || !short) {
        parts.push(`${hours}h`);
      }
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      if (minutes > 0 || !short) {
        parts.push(`${minutes}m`);
      }
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds}s`);
    }

    // Short format: remove trailing zero components
    if (short) {
      while (parts.length > 1 && parts[parts.length - 1].match(/^0[smhd]$/)) {
        parts.pop();
      }
    }

    // Optionally show milliseconds
    if (showMs) {
      const milliseconds = Math.floor(ms % 1000);
      if (milliseconds > 0) {
        parts.push(`${milliseconds}ms`);
      }
    }

    return parts.join(' ');
  }

}
