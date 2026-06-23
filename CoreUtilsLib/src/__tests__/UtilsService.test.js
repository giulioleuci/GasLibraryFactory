/**
 * @file CoreUtilsLib/src/__tests__/UtilsService.test.js
 * @description Comprehensive unit tests for UtilsService (100+ methods).
 */

import { UtilsService, MyUtilsService } from '../UtilsService.js';

describe('UtilsService', () => {
  let utils;

  beforeEach(() => {
    utils = new UtilsService();
  });

  describe('Export aliases', () => {
    it('should export UtilsService', () => {
      expect(UtilsService).toBeDefined();
    });

    it('should export MyUtilsService as alias', () => {
      expect(MyUtilsService).toBe(UtilsService);
    });
  });

  describe('Static Constants', () => {
    it('MILLIS_PER_DAY should be 86400000', () => {
      expect(MyUtilsService.MILLIS_PER_DAY).toBe(86400000);
    });

    it('MILLIS_PER_HOUR should be 3600000', () => {
      expect(MyUtilsService.MILLIS_PER_HOUR).toBe(3600000);
    });

    it('MILLIS_PER_MINUTE should be 60000', () => {
      expect(MyUtilsService.MILLIS_PER_MINUTE).toBe(60000);
    });

    it('MILLIS_PER_SECOND should be 1000', () => {
      expect(MyUtilsService.MILLIS_PER_SECOND).toBe(1000);
    });
  });

  describe('Constructor', () => {
    it('should create instance without sleep function', () => {
      const u = new UtilsService();
      expect(u).toBeInstanceOf(UtilsService);
    });

    it('should create instance with sleep function', () => {
      const sleepFn = jest.fn();
      const u = new UtilsService(sleepFn);
      expect(u._sleepFn).toBe(sleepFn);
    });
  });

  // ============================================================================
  // UUID and ID Generation
  // ============================================================================

  describe('generateUuid', () => {
    it('should generate valid UUID v4 format', () => {
      // The shared test/setup.js mock returns a deterministic, non-UUID value
      // ("test-uuid-NNNN") for unique-id stability across the suite. To verify
      // generateUuid() passes a real v4 through from Utilities.getUuid(), stub a
      // valid v4 just for this assertion (cleared automatically between tests).
      global.Utilities.getUuid.mockReturnValueOnce('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      const uuid = utils.generateUuid();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = utils.generateUuid();
      const uuid2 = utils.generateUuid();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateShortId', () => {
    it('should generate 8 character ID', () => {
      const id = utils.generateShortId();
      expect(id.length).toBe(8);
    });

    it('should generate alphanumeric ID', () => {
      const id = utils.generateShortId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const id1 = utils.generateShortId();
      const id2 = utils.generateShortId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateCompactId', () => {
    it('should generate default 21 character ID', () => {
      const id = utils.generateCompactId();
      expect(id.length).toBe(21);
    });

    it('should generate custom length ID', () => {
      const id = utils.generateCompactId(10);
      expect(id.length).toBe(10);
    });

    it('should generate unique IDs', () => {
      const id1 = utils.generateCompactId();
      const id2 = utils.generateCompactId();
      expect(id1).not.toBe(id2);
    });
  });

  // ============================================================================
  // Sleep and Timing
  // ============================================================================

  describe('sleep', () => {
    it('should throw if no sleep function provided', () => {
      expect(() => utils.sleep(100)).toThrow('Sleep function not provided');
    });

    it('should call injected sleep function', () => {
      const sleepFn = jest.fn();
      const u = new UtilsService(sleepFn);
      u.sleep(100);
      expect(sleepFn).toHaveBeenCalledWith(100);
    });
  });

  describe('delay', () => {
    it('should throw if no sleep function provided', () => {
      expect(() => utils.delay(() => 'result', 100)).toThrow('Sleep function not provided');
    });

    it('should call function after sleeping', () => {
      const sleepFn = jest.fn();
      const callback = jest.fn(() => 'result');
      const u = new UtilsService(sleepFn);

      const result = u.delay(callback, 100);

      expect(sleepFn).toHaveBeenCalledWith(100);
      expect(callback).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });

  // ============================================================================
  // Date/Time Parsing
  // ============================================================================

  describe('parseDate', () => {
    it('should return Date object as-is if valid', () => {
      const date = new Date('2025-01-15');
      const result = utils.parseDate(date);
      expect(result).toBe(date);
    });

    it('should return null for invalid Date object', () => {
      const result = utils.parseDate(new Date('invalid'));
      expect(result).toBeNull();
    });

    it('should parse ISO string', () => {
      const result = utils.parseDate('2025-01-15T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toContain('2025-01-15');
    });

    it('should return null for invalid string', () => {
      const result = utils.parseDate('invalid date');
      expect(result).toBeNull();
    });

    it('should treat small numbers as Sheets serial numbers', () => {
      const result = utils.parseDate(44941); // Jan 15, 2023
      expect(result).toBeInstanceOf(Date);
    });

    it('should treat large numbers as timestamps', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const result = utils.parseDate(timestamp);
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for null input', () => {
      expect(utils.parseDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(utils.parseDate(undefined)).toBeNull();
    });

    it('should return epoch date for 0 (treated as timestamp)', () => {
      // 0 is treated as a Unix timestamp (epoch), which is a valid date
      const result = utils.parseDate(0);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(0); // Jan 1, 1970
    });

    it('should handle empty string', () => {
      expect(utils.parseDate('')).toBeNull();
    });
  });

  describe('parseGoogleSheetsDate', () => {
    it('should convert Sheets serial number to Date', () => {
      // Jan 1, 2000 is approximately serial number 36526
      const result = utils.parseGoogleSheetsDate(36526);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2000);
    });

    it('should handle serial number 1 (Dec 31, 1899)', () => {
      const result = utils.parseGoogleSheetsDate(1);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('parseISODate', () => {
    it('should parse valid ISO string', () => {
      const result = utils.parseISODate('2025-01-15T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for invalid string', () => {
      expect(utils.parseISODate('invalid')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(utils.parseISODate(123)).toBeNull();
      expect(utils.parseISODate(null)).toBeNull();
    });
  });

  describe('parseDateWithFormat', () => {
    it('should parse DD/MM/YYYY format', () => {
      const result = utils.parseDateWithFormat('15/01/2025', 'DD/MM/YYYY');
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2025);
    });

    it('should parse MM/DD/YYYY format', () => {
      const result = utils.parseDateWithFormat('01/15/2025', 'MM/DD/YYYY');
      expect(result).toBeInstanceOf(Date);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should parse YYYY-MM-DD format', () => {
      const result = utils.parseDateWithFormat('2025-01-15', 'YYYY-MM-DD');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
    });

    it('should be case-insensitive', () => {
      const result = utils.parseDateWithFormat('15/01/2025', 'dd/mm/yyyy');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for wrong format structure', () => {
      expect(utils.parseDateWithFormat('15-01-2025', 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for empty dateString', () => {
      expect(utils.parseDateWithFormat('', 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for empty format', () => {
      expect(utils.parseDateWithFormat('15/01/2025', '')).toBeNull();
    });

    it('should fallback to parseDate for unknown format', () => {
      const result = utils.parseDateWithFormat('2025-01-15', 'UNKNOWN');
      expect(result).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Date/Time Formatting
  // ============================================================================

  describe('formatISODate', () => {
    it('should format Date to ISO string', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const result = utils.formatISODate(date);
      expect(result).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should return null for invalid Date', () => {
      expect(utils.formatISODate(new Date('invalid'))).toBeNull();
    });

    it('should return null for non-Date input', () => {
      expect(utils.formatISODate('2025-01-15')).toBeNull();
    });
  });

  describe('formatDate', () => {
    const date = new Date(2025, 0, 15, 10, 30, 45, 123); // Jan 15, 2025 10:30:45.123

    it('should use default format YYYY-MM-DD', () => {
      const result = utils.formatDate(date);
      expect(result).toBe('2025-01-15');
    });

    it('should format with DD/MM/YYYY', () => {
      const result = utils.formatDate(date, 'DD/MM/YYYY');
      expect(result).toBe('15/01/2025');
    });

    it('should format with MM/DD/YYYY', () => {
      const result = utils.formatDate(date, 'MM/DD/YYYY');
      expect(result).toBe('01/15/2025');
    });

    it('should format with time HH:mm:ss', () => {
      const result = utils.formatDate(date, 'HH:mm:ss');
      expect(result).toBe('10:30:45');
    });

    it('should format with milliseconds SSS', () => {
      const result = utils.formatDate(date, 'HH:mm:ss.SSS');
      expect(result).toBe('10:30:45.123');
    });

    it('should format with 2-digit year YY', () => {
      const result = utils.formatDate(date, 'DD/MM/YY');
      expect(result).toBe('15/01/25');
    });

    it('should support lowercase yyyy and dd', () => {
      const result = utils.formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2025-01-15');
    });

    it('should return null for invalid Date', () => {
      expect(utils.formatDate(new Date('invalid'), 'YYYY-MM-DD')).toBeNull();
    });

    it('should return null for non-Date input', () => {
      expect(utils.formatDate(null, 'YYYY-MM-DD')).toBeNull();
    });
  });

  describe('toGoogleSheetsDate', () => {
    it('should convert Date to Sheets serial number', () => {
      const date = new Date(2000, 0, 1); // Jan 1, 2000
      const result = utils.toGoogleSheetsDate(date);
      expect(result).toBeCloseTo(36526, 0);
    });

    it('should return null for invalid Date', () => {
      expect(utils.toGoogleSheetsDate(new Date('invalid'))).toBeNull();
    });

    it('should return null for non-Date input', () => {
      expect(utils.toGoogleSheetsDate(null)).toBeNull();
    });
  });

  // ============================================================================
  // Date/Time Manipulation
  // ============================================================================

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date(2025, 0, 15);
      const result = utils.addDays(date, 10);
      expect(result.getDate()).toBe(25);
    });

    it('should subtract days with negative value', () => {
      const date = new Date(2025, 0, 15);
      const result = utils.addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should return null for invalid date', () => {
      expect(utils.addDays(new Date('invalid'), 1)).toBeNull();
    });

    it('should return null for non-Date input', () => {
      expect(utils.addDays(null, 1)).toBeNull();
    });
  });

  describe('addHours', () => {
    it('should add hours to date', () => {
      const date = new Date(2025, 0, 15, 10);
      const result = utils.addHours(date, 5);
      expect(result.getHours()).toBe(15);
    });

    it('should return null for invalid date', () => {
      expect(utils.addHours(new Date('invalid'), 1)).toBeNull();
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to date', () => {
      const date = new Date(2025, 0, 15, 10, 30);
      const result = utils.addMinutes(date, 15);
      expect(result.getMinutes()).toBe(45);
    });

    it('should return null for invalid date', () => {
      expect(utils.addMinutes(new Date('invalid'), 1)).toBeNull();
    });
  });

  describe('addMonths', () => {
    it('should add months to date', () => {
      const date = new Date(2025, 0, 15); // Jan 15
      const result = utils.addMonths(date, 2);
      expect(result.getMonth()).toBe(2); // March
    });

    it('should return null for invalid date', () => {
      expect(utils.addMonths(new Date('invalid'), 1)).toBeNull();
    });
  });

  describe('addYears', () => {
    it('should add years to date', () => {
      const date = new Date(2025, 0, 15);
      const result = utils.addYears(date, 5);
      expect(result.getFullYear()).toBe(2030);
    });

    it('should return null for invalid date', () => {
      expect(utils.addYears(new Date('invalid'), 1)).toBeNull();
    });
  });

  // ============================================================================
  // Date/Time Comparison
  // ============================================================================

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const date1 = new Date(2025, 0, 1);
      const date2 = new Date(2025, 0, 15);
      expect(utils.daysBetween(date1, date2)).toBe(14);
    });

    it('should return negative for reversed dates', () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 1);
      expect(utils.daysBetween(date1, date2)).toBe(-14);
    });

    it('should return null for invalid dates', () => {
      expect(utils.daysBetween(new Date('invalid'), new Date())).toBeNull();
      expect(utils.daysBetween(new Date(), new Date('invalid'))).toBeNull();
      expect(utils.daysBetween(null, new Date())).toBeNull();
    });
  });

  describe('hoursBetween', () => {
    it('should calculate hours between dates', () => {
      const date1 = new Date(2025, 0, 15, 10);
      const date2 = new Date(2025, 0, 15, 15);
      expect(utils.hoursBetween(date1, date2)).toBe(5);
    });

    it('should return null for invalid dates', () => {
      expect(utils.hoursBetween(new Date('invalid'), new Date())).toBeNull();
    });
  });

  describe('minutesBetween', () => {
    it('should calculate minutes between dates', () => {
      const date1 = new Date(2025, 0, 15, 10, 0);
      const date2 = new Date(2025, 0, 15, 10, 30);
      expect(utils.minutesBetween(date1, date2)).toBe(30);
    });

    it('should return null for invalid dates', () => {
      expect(utils.minutesBetween(new Date('invalid'), new Date())).toBeNull();
    });
  });

  describe('isBefore', () => {
    it('should return true if date1 is before date2', () => {
      const date1 = new Date(2025, 0, 1);
      const date2 = new Date(2025, 0, 15);
      expect(utils.isBefore(date1, date2)).toBe(true);
    });

    it('should return false if date1 is after date2', () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 1);
      expect(utils.isBefore(date1, date2)).toBe(false);
    });

    it('should return null for invalid dates', () => {
      expect(utils.isBefore(new Date('invalid'), new Date())).toBeNull();
    });
  });

  describe('isAfter', () => {
    it('should return true if date1 is after date2', () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 1);
      expect(utils.isAfter(date1, date2)).toBe(true);
    });

    it('should return false if date1 is before date2', () => {
      const date1 = new Date(2025, 0, 1);
      const date2 = new Date(2025, 0, 15);
      expect(utils.isAfter(date1, date2)).toBe(false);
    });

    it('should return null for invalid dates', () => {
      expect(utils.isAfter(new Date('invalid'), new Date())).toBeNull();
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date(2025, 0, 15, 10);
      const date2 = new Date(2025, 0, 15, 15);
      expect(utils.isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 16);
      expect(utils.isSameDay(date1, date2)).toBe(false);
    });

    it('should return null for invalid dates', () => {
      expect(utils.isSameDay(new Date('invalid'), new Date())).toBeNull();
    });
  });

  describe('startOfDay', () => {
    it('should return midnight', () => {
      const date = new Date(2025, 0, 15, 15, 30, 45);
      const result = utils.startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should return null for invalid date', () => {
      expect(utils.startOfDay(new Date('invalid'))).toBeNull();
    });
  });

  describe('endOfDay', () => {
    it('should return 23:59:59.999', () => {
      const date = new Date(2025, 0, 15, 10);
      const result = utils.endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should return null for invalid date', () => {
      expect(utils.endOfDay(new Date('invalid'))).toBeNull();
    });
  });

  // ============================================================================
  // String Utilities
  // ============================================================================

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      expect(utils.isEmpty('')).toBe(true);
    });

    it('should return true for whitespace string', () => {
      expect(utils.isEmpty('   ')).toBe(true);
    });

    it('should return true for null', () => {
      expect(utils.isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(utils.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(utils.isEmpty('hello')).toBe(false);
    });

    it('should return false for string with content and whitespace', () => {
      expect(utils.isEmpty('  hello  ')).toBe(false);
    });
  });

  describe('truncate', () => {
    it('should truncate long string with ellipsis', () => {
      expect(utils.truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate short string', () => {
      expect(utils.truncate('Hi', 10)).toBe('Hi');
    });

    it('should use custom suffix', () => {
      expect(utils.truncate('Hello World', 8, '…')).toBe('Hello W…');
    });

    it('should handle null input', () => {
      expect(utils.truncate(null, 10)).toBe(null);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(utils.capitalize('hello')).toBe('Hello');
    });

    it('should handle already capitalized', () => {
      expect(utils.capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(utils.capitalize('')).toBe('');
    });

    it('should handle null', () => {
      expect(utils.capitalize(null)).toBe(null);
    });
  });

  describe('toCamelCase', () => {
    it('should convert kebab-case', () => {
      expect(utils.toCamelCase('hello-world')).toBe('helloWorld');
    });

    it('should convert snake_case', () => {
      expect(utils.toCamelCase('hello_world')).toBe('helloWorld');
    });

    it('should convert space separated', () => {
      expect(utils.toCamelCase('hello world')).toBe('helloWorld');
    });

    it('should handle empty string', () => {
      expect(utils.toCamelCase('')).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase', () => {
      expect(utils.toSnakeCase('helloWorld')).toBe('hello_world');
    });

    it('should handle already snake_case', () => {
      expect(utils.toSnakeCase('hello_world')).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(utils.toSnakeCase('')).toBe('');
    });
  });

  // ============================================================================
  // Object Utilities
  // ============================================================================

  describe('deepClone', () => {
    it('should create deep copy of object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = utils.deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });

    it('should clone arrays', () => {
      const original = [1, [2, 3]];
      const clone = utils.deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone[1]).not.toBe(original[1]);
    });

    it('should clone Date objects', () => {
      const date = new Date();
      const clone = utils.deepClone({ date });
      expect(clone.date).toEqual(date);
      expect(clone.date).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { x: 10 } };
      const obj2 = { b: { y: 20 }, c: 3 };
      const result = utils.deepMerge(obj1, obj2);

      expect(result).toEqual({ a: 1, b: { x: 10, y: 20 }, c: 3 });
    });

    it('should not mutate original objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      utils.deepMerge(obj1, obj2);

      expect(obj1).toEqual({ a: 1 });
      expect(obj2).toEqual({ b: 2 });
    });

    it('should handle multiple objects', () => {
      const result = utils.deepMerge({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe('getNestedProperty', () => {
    it('should get nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(utils.getNestedProperty(obj, 'a.b.c')).toBe('value');
    });

    it('should return default for missing property', () => {
      const obj = { a: 1 };
      expect(utils.getNestedProperty(obj, 'a.b.c', 'default')).toBe('default');
    });

    it('should return null as default', () => {
      const obj = {};
      expect(utils.getNestedProperty(obj, 'missing')).toBeNull();
    });

    it('should handle array notation', () => {
      const obj = { users: [{ name: 'Alice' }] };
      expect(utils.getNestedProperty(obj, 'users[0].name')).toBe('Alice');
    });
  });

  describe('setNestedProperty', () => {
    it('should set nested property', () => {
      const obj = {};
      utils.setNestedProperty(obj, 'a.b.c', 'value');
      expect(obj.a.b.c).toBe('value');
    });

    it('should create intermediate objects', () => {
      const obj = {};
      utils.setNestedProperty(obj, 'deep.nested.value', 42);
      expect(obj.deep.nested.value).toBe(42);
    });

    it('should handle array notation', () => {
      const obj = {};
      utils.setNestedProperty(obj, 'users[0].name', 'Alice');
      expect(obj.users[0].name).toBe('Alice');
    });

    it('should return modified object', () => {
      const obj = {};
      const result = utils.setNestedProperty(obj, 'a', 1);
      expect(result).toBe(obj);
    });
  });

  // ============================================================================
  // Validation Utilities
  // ============================================================================

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(utils.isValidEmail('user@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(utils.isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(utils.isValidEmail('invalid')).toBe(false);
      expect(utils.isValidEmail('user@')).toBe(false);
      expect(utils.isValidEmail('@example.com')).toBe(false);
    });

    it('should reject null/empty', () => {
      expect(utils.isValidEmail(null)).toBe(false);
      expect(utils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate HTTP URL', () => {
      expect(utils.isValidUrl('http://example.com')).toBe(true);
    });

    it('should validate HTTPS URL', () => {
      expect(utils.isValidUrl('https://example.com')).toBe(true);
    });

    it('should validate URL with path', () => {
      expect(utils.isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(utils.isValidUrl('not a url')).toBe(false);
      expect(utils.isValidUrl('example.com')).toBe(false);
    });

    it('should reject null/empty', () => {
      expect(utils.isValidUrl(null)).toBe(false);
      expect(utils.isValidUrl('')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate Date object', () => {
      expect(utils.isValidDate(new Date())).toBe(true);
    });

    it('should validate date string', () => {
      expect(utils.isValidDate('2025-01-15')).toBe(true);
    });

    it('should validate timestamp', () => {
      expect(utils.isValidDate(Date.now())).toBe(true);
    });

    it('should reject invalid date', () => {
      expect(utils.isValidDate('invalid')).toBe(false);
      expect(utils.isValidDate(new Date('invalid'))).toBe(false);
    });
  });

  // ============================================================================
  // Array Utilities
  // ============================================================================

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(utils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle size larger than array', () => {
      expect(utils.chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.chunk(null, 2)).toEqual([]);
      expect(utils.chunk([1, 2], 0)).toEqual([]);
      expect(utils.chunk([1, 2], -1)).toEqual([]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(utils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should preserve order', () => {
      expect(utils.unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.unique(null)).toEqual([]);
    });
  });

  describe('flatten', () => {
    it('should flatten one level by default', () => {
      expect(
        utils.flatten([
          [1, 2],
          [3, [4]]
        ])
      ).toEqual([1, 2, 3, [4]]);
    });

    it('should flatten to specified depth', () => {
      expect(utils.flatten([[1, [2, [3]]]], 2)).toEqual([1, 2, [3]]);
    });

    it('should flatten completely with Infinity', () => {
      expect(utils.flatten([[1, [2, [3, [4]]]]], Infinity)).toEqual([1, 2, 3, 4]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.flatten(null)).toEqual([]);
    });
  });

  describe('flattenShallow', () => {
    it('should flatten one level', () => {
      expect(
        utils.flattenShallow([
          [1, 2],
          [3, 4]
        ])
      ).toEqual([1, 2, 3, 4]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.flattenShallow(null)).toEqual([]);
    });
  });

  describe('flattenDeep', () => {
    it('should flatten all levels', () => {
      expect(utils.flattenDeep([[1, [2, [3, [4]]]]])).toEqual([1, 2, 3, 4]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.flattenDeep(null)).toEqual([]);
    });
  });

  describe('compact', () => {
    it('should remove falsy values', () => {
      expect(utils.compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.compact(null)).toEqual([]);
    });
  });

  describe('difference', () => {
    it('should return values not in other arrays', () => {
      expect(utils.difference([2, 1], [2, 3])).toEqual([1]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.difference(null)).toEqual([]);
    });
  });

  describe('differenceBy', () => {
    it('should use iteratee for comparison', () => {
      expect(utils.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([1.2]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.differenceBy(null, [], (x) => x)).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('should group by iteratee result', () => {
      expect(utils.groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({
        4: [4.2],
        6: [6.1, 6.3]
      });
    });

    it('should group by property string', () => {
      const users = [{ type: 'a' }, { type: 'b' }, { type: 'a' }];
      expect(utils.groupBy(users, 'type')).toEqual({
        a: [{ type: 'a' }, { type: 'a' }],
        b: [{ type: 'b' }]
      });
    });

    it('should return empty for invalid input', () => {
      expect(utils.groupBy(null, (x) => x)).toEqual({});
    });
  });

  describe('intersection', () => {
    it('should return common values', () => {
      expect(utils.intersection([2, 1], [2, 3])).toEqual([2]);
    });

    it('should handle multiple arrays', () => {
      expect(utils.intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3]);
    });
  });

  describe('keyBy', () => {
    it('should key by property', () => {
      const arr = [{ id: 'a' }, { id: 'b' }];
      expect(utils.keyBy(arr, 'id')).toEqual({
        a: { id: 'a' },
        b: { id: 'b' }
      });
    });

    it('should return empty for invalid input', () => {
      expect(utils.keyBy(null, 'id')).toEqual({});
    });
  });

  describe('orderBy', () => {
    it('should sort by single property', () => {
      const users = [{ name: 'B' }, { name: 'A' }, { name: 'C' }];
      expect(utils.orderBy(users, ['name'], ['asc'])).toEqual([
        { name: 'A' },
        { name: 'B' },
        { name: 'C' }
      ]);
    });

    it('should sort descending', () => {
      const users = [{ age: 20 }, { age: 30 }, { age: 10 }];
      expect(utils.orderBy(users, ['age'], ['desc'])).toEqual([
        { age: 30 },
        { age: 20 },
        { age: 10 }
      ]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.orderBy(null, ['a'], ['asc'])).toEqual([]);
    });
  });

  describe('uniq', () => {
    it('should remove duplicates', () => {
      expect(utils.uniq([2, 1, 2])).toEqual([2, 1]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.uniq(null)).toEqual([]);
    });
  });

  describe('uniqBy', () => {
    it('should remove duplicates using iteratee', () => {
      expect(utils.uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
    });

    it('should return empty for invalid input', () => {
      expect(utils.uniqBy(null, (x) => x)).toEqual([]);
    });
  });

  // ============================================================================
  // Number Utilities
  // ============================================================================

  describe('randomInt', () => {
    it('should generate number within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = utils.randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('round', () => {
    it('should round to specified decimals', () => {
      expect(utils.round(3.14159, 2)).toBe(3.14);
      expect(utils.round(3.14159, 3)).toBe(3.142);
    });

    it('should round to integer by default', () => {
      expect(utils.round(3.7)).toBe(4);
      expect(utils.round(3.2)).toBe(3);
    });
  });

  describe('clamp', () => {
    it('should clamp below minimum', () => {
      expect(utils.clamp(-5, 0, 10)).toBe(0);
    });

    it('should clamp above maximum', () => {
      expect(utils.clamp(15, 0, 10)).toBe(10);
    });

    it('should return value within range', () => {
      expect(utils.clamp(5, 0, 10)).toBe(5);
    });
  });

  describe('maxBy', () => {
    it('should return element with max value', () => {
      const arr = [{ n: 1 }, { n: 3 }, { n: 2 }];
      expect(utils.maxBy(arr, 'n')).toEqual({ n: 3 });
    });

    it('should return undefined for empty array', () => {
      expect(utils.maxBy([], 'n')).toBeUndefined();
    });

    it('should return undefined for invalid input', () => {
      expect(utils.maxBy(null, 'n')).toBeUndefined();
    });
  });

  describe('minBy', () => {
    it('should return element with min value', () => {
      const arr = [{ n: 3 }, { n: 1 }, { n: 2 }];
      expect(utils.minBy(arr, 'n')).toEqual({ n: 1 });
    });

    it('should return undefined for empty array', () => {
      expect(utils.minBy([], 'n')).toBeUndefined();
    });
  });

  describe('sumBy', () => {
    it('should sum by property', () => {
      const arr = [{ n: 1 }, { n: 2 }, { n: 3 }];
      expect(utils.sumBy(arr, 'n')).toBe(6);
    });

    it('should return 0 for empty array', () => {
      expect(utils.sumBy([], 'n')).toBe(0);
    });
  });

  describe('meanBy', () => {
    it('should calculate mean by property', () => {
      const arr = [{ n: 2 }, { n: 4 }, { n: 6 }];
      expect(utils.meanBy(arr, 'n')).toBe(4);
    });

    it('should return NaN for empty array', () => {
      expect(utils.meanBy([], 'n')).toBeNaN();
    });
  });

  // ============================================================================
  // Object Utilities (Additional)
  // ============================================================================

  describe('has', () => {
    it('should check if path exists', () => {
      expect(utils.has({ a: { b: 2 } }, 'a.b')).toBe(true);
      expect(utils.has({ a: 1 }, 'b')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(utils.has(null, 'a')).toBe(false);
    });
  });

  describe('pick', () => {
    it('should pick specified properties', () => {
      expect(utils.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should return empty for invalid input', () => {
      expect(utils.pick(null, ['a'])).toEqual({});
    });
  });

  describe('omit', () => {
    it('should omit specified properties', () => {
      expect(utils.omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
    });

    it('should return empty for invalid input', () => {
      expect(utils.omit(null, ['a'])).toEqual({});
    });
  });

  describe('mapKeys', () => {
    it('should transform keys', () => {
      expect(utils.mapKeys({ a: 1, b: 2 }, (v, k) => k.toUpperCase())).toEqual({ A: 1, B: 2 });
    });

    it('should return empty for invalid input', () => {
      expect(utils.mapKeys(null, (x) => x)).toEqual({});
    });
  });

  describe('mapValues', () => {
    it('should transform values', () => {
      expect(utils.mapValues({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
    });

    it('should return empty for invalid input', () => {
      expect(utils.mapValues(null, (x) => x)).toEqual({});
    });
  });

  // ============================================================================
  // Collection Utilities
  // ============================================================================

  describe('every', () => {
    it('should return true if all pass', () => {
      expect(utils.every([1, 2, 3], (n) => n > 0)).toBe(true);
    });

    it('should return false if any fail', () => {
      expect(utils.every([1, 2, -1], (n) => n > 0)).toBe(false);
    });
  });

  describe('filter', () => {
    it('should filter elements', () => {
      expect(utils.filter([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([2, 4]);
    });
  });

  describe('find', () => {
    it('should find first matching element', () => {
      expect(utils.find([1, 2, 3], (n) => n > 1)).toBe(2);
    });

    it('should return undefined if not found', () => {
      expect(utils.find([1, 2, 3], (n) => n > 10)).toBeUndefined();
    });
  });

  describe('forEach', () => {
    it('should iterate over elements', () => {
      const result = [];
      utils.forEach([1, 2, 3], (n) => result.push(n * 2));
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('map', () => {
    it('should transform elements', () => {
      expect(utils.map([1, 2, 3], (n) => n * 2)).toEqual([2, 4, 6]);
    });
  });

  describe('reduce', () => {
    it('should reduce to single value', () => {
      expect(utils.reduce([1, 2, 3], (sum, n) => sum + n, 0)).toBe(6);
    });
  });

  describe('size', () => {
    it('should return array length', () => {
      expect(utils.size([1, 2, 3])).toBe(3);
    });

    it('should return object key count', () => {
      expect(utils.size({ a: 1, b: 2 })).toBe(2);
    });

    it('should return string length', () => {
      expect(utils.size('hello')).toBe(5);
    });
  });

  describe('some', () => {
    it('should return true if any pass', () => {
      expect(utils.some([1, 2, 3], (n) => n > 2)).toBe(true);
    });

    it('should return false if none pass', () => {
      expect(utils.some([1, 2, 3], (n) => n > 10)).toBe(false);
    });
  });

  // ============================================================================
  // Type Checking Utilities
  // ============================================================================

  describe('isEqual', () => {
    it('should compare objects deeply', () => {
      expect(utils.isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(utils.isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should compare arrays', () => {
      expect(utils.isEqual([1, 2], [1, 2])).toBe(true);
      expect(utils.isEqual([1, 2], [2, 1])).toBe(false);
    });
  });

  describe('isNil', () => {
    it('should return true for null/undefined', () => {
      expect(utils.isNil(null)).toBe(true);
      expect(utils.isNil(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(utils.isNil(0)).toBe(false);
      expect(utils.isNil('')).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(utils.isNumber(3)).toBe(true);
      expect(utils.isNumber(3.14)).toBe(true);
      expect(utils.isNumber(NaN)).toBe(true);
    });

    it('should return false for non-numbers', () => {
      expect(utils.isNumber('3')).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(utils.isString('hello')).toBe(true);
      expect(utils.isString('')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(utils.isString(123)).toBe(false);
    });
  });

  describe('isEmptyValue', () => {
    it('should return true for empty values', () => {
      expect(utils.isEmptyValue(null)).toBe(true);
      expect(utils.isEmptyValue([])).toBe(true);
      expect(utils.isEmptyValue({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(utils.isEmptyValue([1])).toBe(false);
      expect(utils.isEmptyValue({ a: 1 })).toBe(false);
    });
  });

  // ============================================================================
  // Function Utilities
  // ============================================================================

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debounced = utils.debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('should only call function once', () => {
      const fn = jest.fn(() => 'result');
      const onceFn = utils.once(fn);

      expect(onceFn()).toBe('result');
      expect(onceFn()).toBe('result');
      expect(onceFn()).toBe('result');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('noop', () => {
    it('should return undefined', () => {
      expect(utils.noop()).toBeUndefined();
    });
  });

  // ============================================================================
  // String Case Conversion Utilities
  // ============================================================================

  describe('camelCase', () => {
    it('should convert various formats to camelCase', () => {
      expect(utils.camelCase('Foo Bar')).toBe('fooBar');
      expect(utils.camelCase('--foo-bar--')).toBe('fooBar');
      expect(utils.camelCase('__FOO_BAR__')).toBe('fooBar');
    });

    it('should handle empty/null', () => {
      expect(utils.camelCase('')).toBe('');
      expect(utils.camelCase(null)).toBe('');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(utils.kebabCase('Foo Bar')).toBe('foo-bar');
      expect(utils.kebabCase('fooBar')).toBe('foo-bar');
    });

    it('should handle empty/null', () => {
      expect(utils.kebabCase('')).toBe('');
      expect(utils.kebabCase(null)).toBe('');
    });
  });

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(utils.snakeCase('Foo Bar')).toBe('foo_bar');
      expect(utils.snakeCase('fooBar')).toBe('foo_bar');
    });

    it('should handle empty/null', () => {
      expect(utils.snakeCase('')).toBe('');
      expect(utils.snakeCase(null)).toBe('');
    });
  });

  describe('startCase', () => {
    it('should convert to Start Case', () => {
      expect(utils.startCase('--foo-bar--')).toBe('Foo Bar');
      expect(utils.startCase('fooBar')).toBe('Foo Bar');
    });

    it('should handle empty/null', () => {
      expect(utils.startCase('')).toBe('');
      expect(utils.startCase(null)).toBe('');
    });
  });

  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(utils.pascalCase('hello world')).toBe('HelloWorld');
      expect(utils.pascalCase('hello-world')).toBe('HelloWorld');
    });

    it('should handle empty/null', () => {
      expect(utils.pascalCase('')).toBe('');
      expect(utils.pascalCase(null)).toBe('');
    });
  });

  describe('constantCase', () => {
    it('should convert to CONSTANT_CASE', () => {
      expect(utils.constantCase('hello world')).toBe('HELLO_WORLD');
      expect(utils.constantCase('helloWorld')).toBe('HELLO_WORLD');
    });

    it('should handle empty/null', () => {
      expect(utils.constantCase('')).toBe('');
      expect(utils.constantCase(null)).toBe('');
    });
  });

  describe('dotCase', () => {
    it('should convert to dot.case', () => {
      expect(utils.dotCase('hello world')).toBe('hello.world');
      expect(utils.dotCase('helloWorld')).toBe('hello.world');
    });

    it('should handle empty/null', () => {
      expect(utils.dotCase('')).toBe('');
      expect(utils.dotCase(null)).toBe('');
    });
  });

  describe('pathCase', () => {
    it('should convert to path/case', () => {
      expect(utils.pathCase('hello world')).toBe('hello/world');
      expect(utils.pathCase('helloWorld')).toBe('hello/world');
    });

    it('should handle empty/null', () => {
      expect(utils.pathCase('')).toBe('');
      expect(utils.pathCase(null)).toBe('');
    });
  });

  describe('stringToArray', () => {
    it('should decompose string into words', () => {
      expect(utils.stringToArray('myVariableName')).toEqual(['my', 'variable', 'name']);
      expect(utils.stringToArray('MY_CONSTANT')).toEqual(['my', 'constant']);
    });

    it('should handle empty/null', () => {
      expect(utils.stringToArray('')).toEqual([]);
      expect(utils.stringToArray(null)).toEqual([]);
    });
  });

  describe('humanisePath', () => {
    it('should humanize path', () => {
      const result = utils.humanisePath('documents/invoices_2024/January');
      expect(result).toContain('Documents');
      expect(result).toContain('>');
    });

    it('should use custom separator', () => {
      const result = utils.humanisePath('a/b', ' - ');
      expect(result).toContain(' - ');
    });

    it('should handle empty/null', () => {
      expect(utils.humanisePath('')).toBe('');
      expect(utils.humanisePath(null)).toBe('');
    });
  });

  // ============================================================================
  // Duration Formatting
  // ============================================================================

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(utils.formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(utils.formatDuration(5000)).toBe('5s');
    });

    it('should format minutes and seconds', () => {
      expect(utils.formatDuration(65000)).toBe('1m 5s');
    });

    it('should format hours, minutes, seconds', () => {
      expect(utils.formatDuration(3665000)).toBe('1h 1m 5s');
    });

    it('should format days', () => {
      expect(utils.formatDuration(90061000)).toBe('1d 1h 1m 1s');
    });

    it('should return "--" for invalid input', () => {
      expect(utils.formatDuration(null)).toBe('--');
      expect(utils.formatDuration(undefined)).toBe('--');
      expect(utils.formatDuration(-1)).toBe('--');
      expect(utils.formatDuration('invalid')).toBe('--');
    });

    it('should support short format (removes trailing zeros)', () => {
      // Short format removes trailing zero components
      expect(utils.formatDuration(60000, { short: true })).toBe('1m');
      // With non-zero seconds, both are shown
      expect(utils.formatDuration(65000, { short: true })).toBe('1m 5s');
    });

    it('should support showMs option', () => {
      const result = utils.formatDuration(5500, { showMs: true });
      expect(result).toContain('5s');
      expect(result).toContain('500ms');
    });

    it('should handle 0 seconds edge case', () => {
      expect(utils.formatDuration(1000)).toBe('1s');
    });
  });
});
