/**
 * @file GoogleApiWrapper/src/services/__tests__/UtilitiesService.test.js
 * @description Comprehensive test suite for UtilitiesService facade
 * @version 1.0
 */

import { UtilitiesService } from '../UtilitiesService';
import { MockFactory } from '../../../../test/fakes/MockFactory';

describe('UtilitiesService - Comprehensive Test Suite', () => {
  let mocks;
  let mockGasUtilities;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Create mock GAS Utilities
    mockGasUtilities = {
      sleep: jest.fn(),
      getUuid: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
      base64Encode: jest.fn().mockReturnValue('SGVsbG8gV29ybGQ='),
      base64Decode: jest.fn().mockReturnValue([72, 101, 108, 108, 111]),
      base64EncodeWebSafe: jest.fn().mockReturnValue('SGVsbG8gV29ybGQ'),
      base64DecodeWebSafe: jest.fn().mockReturnValue([72, 101, 108, 108, 111]),
      formatString: jest.fn().mockImplementation((template, ...args) => {
        let result = template;
        args.forEach((arg, i) => {
          result = result.replace(/%s|%d/, arg);
        });
        return result;
      }),
      formatDate: jest.fn().mockReturnValue('2024-12-28'),
      parseCsv: jest.fn().mockReturnValue([
        ['name', 'age'],
        ['John', '25']
      ]),
      newBlob: jest.fn().mockReturnValue({ getBytes: () => [], getName: () => 'blob' }),
      gzip: jest.fn().mockReturnValue({ getBytes: () => [] }),
      ungzip: jest.fn().mockReturnValue({ getBytes: () => [] }),
      zip: jest.fn().mockReturnValue({ getBytes: () => [], getName: () => 'archive.zip' }),
      unzip: jest
        .fn()
        .mockReturnValue([{ getName: () => 'file1.txt' }, { getName: () => 'file2.txt' }]),
      computeDigest: jest.fn().mockImplementation((algorithm) => {
        if (algorithm === 'SHA_256') {
          return [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30, 31, 32
          ];
        }
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      }),
      computeHmacSignature: jest.fn().mockReturnValue([1, 2, 3, 4, 5, 6, 7, 8]),
      jsonStringify: jest.fn().mockReturnValue('{"name":"John"}'),
      jsonParse: jest.fn().mockReturnValue({ name: 'John' }),
      DigestAlgorithm: {
        MD5: 'MD5',
        SHA_1: 'SHA_1',
        SHA_256: 'SHA_256',
        SHA_384: 'SHA_384',
        SHA_512: 'SHA_512'
      },
      MacAlgorithm: {
        HMAC_MD5: 'HMAC_MD5',
        HMAC_SHA_1: 'HMAC_SHA_1',
        HMAC_SHA_256: 'HMAC_SHA_256',
        HMAC_SHA_384: 'HMAC_SHA_384',
        HMAC_SHA_512: 'HMAC_SHA_512'
      },
      Charset: {
        UTF_8: 'UTF-8',
        US_ASCII: 'US-ASCII'
      }
    };

    // Set up global Utilities
    global.Utilities = mockGasUtilities;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.Utilities;
  });

  describe('Constructor', () => {
    it('should create instance with logger', () => {
      const utilities = new UtilitiesService(mocks.logger);
      expect(utilities).toBeInstanceOf(UtilitiesService);
      expect(utilities._logger).toBe(mocks.logger);
    });

    it('should default to console when no logger provided', () => {
      const utilities = new UtilitiesService();
      expect(utilities._logger).toBe(console);
    });

    it('should handle null logger by defaulting to console', () => {
      const utilities = new UtilitiesService(null);
      expect(utilities._logger).toBe(console);
    });

    it('should accept exception service', () => {
      const mockExceptionService = {};
      const utilities = new UtilitiesService(mocks.logger, mockExceptionService);
      expect(utilities._exceptionService).toBe(mockExceptionService);
    });
  });

  describe('sleep() - Timing', () => {
    it('should call GAS sleep with milliseconds', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.sleep(1000);

      expect(mockGasUtilities.sleep).toHaveBeenCalledWith(1000);
    });

    it('should log debug message', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.sleep(500);

      expect(mocks.logger.debug).toHaveBeenCalledWith('Slept for 500ms');
    });

    it('should throw and log on error', () => {
      mockGasUtilities.sleep.mockImplementation(() => {
        throw new Error('Sleep interrupted');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.sleep(1000)).toThrow('Sleep interrupted');
      expect(mocks.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error during sleep')
      );
    });

    it('should handle zero milliseconds', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.sleep(0);

      expect(mockGasUtilities.sleep).toHaveBeenCalledWith(0);
    });
  });

  describe('getUuid() - ID Generation', () => {
    it('should return UUID from GAS', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const uuid = utilities.getUuid();

      expect(uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(mockGasUtilities.getUuid).toHaveBeenCalled();
    });

    it('should log generated UUID', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.getUuid();

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('Generated UUID:'));
    });

    it('should throw and log on error', () => {
      mockGasUtilities.getUuid.mockImplementation(() => {
        throw new Error('UUID generation failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.getUuid()).toThrow('UUID generation failed');
      expect(mocks.logger.error).toHaveBeenCalled();
    });
  });

  describe('base64Encode() / base64Decode()', () => {
    it('should encode string to base64', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const encoded = utilities.base64Encode('Hello World');

      expect(encoded).toBe('SGVsbG8gV29ybGQ=');
      expect(mockGasUtilities.base64Encode).toHaveBeenCalledWith('Hello World', 'UTF-8');
    });

    it('should log encode operation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.base64Encode('test');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Encoded data to Base64');
    });

    it('should decode base64 to bytes', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const decoded = utilities.base64Decode('SGVsbG8gV29ybGQ=');

      expect(decoded).toEqual([72, 101, 108, 108, 111]);
      expect(mockGasUtilities.base64Decode).toHaveBeenCalledWith('SGVsbG8gV29ybGQ=');
    });

    it('should log decode operation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.base64Decode('SGVsbG8=');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Decoded Base64 data');
    });

    it('should throw on encode error', () => {
      mockGasUtilities.base64Encode.mockImplementation(() => {
        throw new Error('Encode failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.base64Encode('test')).toThrow('Encode failed');
    });

    it('should throw on decode error', () => {
      mockGasUtilities.base64Decode.mockImplementation(() => {
        throw new Error('Decode failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.base64Decode('invalid')).toThrow('Decode failed');
    });
  });

  describe('base64EncodeWebSafe() / base64DecodeWebSafe()', () => {
    it('should encode to web-safe base64', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const encoded = utilities.base64EncodeWebSafe('Hello World');

      expect(encoded).toBe('SGVsbG8gV29ybGQ');
      expect(mockGasUtilities.base64EncodeWebSafe).toHaveBeenCalledWith('Hello World', 'UTF-8');
    });

    it('should log web-safe encode', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.base64EncodeWebSafe('test');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Encoded data to web-safe Base64');
    });

    it('should decode web-safe base64', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const decoded = utilities.base64DecodeWebSafe('SGVsbG8');

      expect(decoded).toEqual([72, 101, 108, 108, 111]);
    });

    it('should log web-safe decode', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.base64DecodeWebSafe('test');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Decoded web-safe Base64 data');
    });

    it('should throw on web-safe encode error', () => {
      mockGasUtilities.base64EncodeWebSafe.mockImplementation(() => {
        throw new Error('Encode failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.base64EncodeWebSafe('test')).toThrow('Encode failed');
    });

    it('should throw on web-safe decode error', () => {
      mockGasUtilities.base64DecodeWebSafe.mockImplementation(() => {
        throw new Error('Decode failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.base64DecodeWebSafe('invalid')).toThrow('Decode failed');
    });
  });

  describe('formatString() - String Formatting', () => {
    it('should format string with placeholders', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.formatString('Hello %s, you are %d years old', 'John', 25);

      expect(result).toBe('Hello John, you are 25 years old');
      expect(mockGasUtilities.formatString).toHaveBeenCalledWith(
        'Hello %s, you are %d years old',
        'John',
        25
      );
    });

    it('should log format operation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.formatString('Test %s', 'value');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Formatted string');
    });

    it('should throw on format error', () => {
      mockGasUtilities.formatString.mockImplementation(() => {
        throw new Error('Format failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.formatString('bad format')).toThrow('Format failed');
    });
  });

  describe('formatDate() - Date Formatting', () => {
    it('should format date with timezone and format', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const date = new Date('2024-12-28');
      const result = utilities.formatDate(date, 'GMT', 'yyyy-MM-dd');

      expect(result).toBe('2024-12-28');
      expect(mockGasUtilities.formatDate).toHaveBeenCalledWith(date, 'GMT', 'yyyy-MM-dd');
    });

    it('should log formatted date', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('Formatted date:'));
    });

    it('should throw on format error', () => {
      mockGasUtilities.formatDate.mockImplementation(() => {
        throw new Error('Invalid date');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.formatDate(null, 'GMT', 'yyyy')).toThrow('Invalid date');
    });
  });

  describe('parseCsv() - CSV Parsing', () => {
    it('should parse CSV with default delimiter', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.parseCsv('name,age\nJohn,25');

      expect(result).toEqual([
        ['name', 'age'],
        ['John', '25']
      ]);
      expect(mockGasUtilities.parseCsv).toHaveBeenCalledWith('name,age\nJohn,25', ',');
    });

    it('should parse CSV with custom delimiter', () => {
      mockGasUtilities.parseCsv.mockReturnValue([
        ['name', 'age'],
        ['John', '25']
      ]);

      const utilities = new UtilitiesService(mocks.logger);
      utilities.parseCsv('name;age\nJohn;25', ';');

      expect(mockGasUtilities.parseCsv).toHaveBeenCalledWith('name;age\nJohn;25', ';');
    });

    it('should log row count', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.parseCsv('a,b\n1,2');

      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Parsed CSV (2 rows)')
      );
    });

    it('should throw on parse error', () => {
      mockGasUtilities.parseCsv.mockImplementation(() => {
        throw new Error('Parse failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.parseCsv('bad csv')).toThrow('Parse failed');
    });
  });

  describe('newBlob() - Blob Creation', () => {
    it('should create blob with defaults', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.newBlob('Hello World');

      expect(mockGasUtilities.newBlob).toHaveBeenCalledWith('Hello World', 'text/plain', 'blob');
    });

    it('should create blob with custom type and name', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.newBlob('<html></html>', 'text/html', 'page.html');

      expect(mockGasUtilities.newBlob).toHaveBeenCalledWith(
        '<html></html>',
        'text/html',
        'page.html'
      );
    });

    it('should log blob creation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.newBlob('test', 'text/plain', 'test.txt');

      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Created blob: test.txt (text/plain)')
      );
    });

    it('should throw on creation error', () => {
      mockGasUtilities.newBlob.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.newBlob('data')).toThrow('Blob creation failed');
    });
  });

  describe('gzip() / ungzip() - Compression', () => {
    it('should compress blob with gzip', () => {
      const mockBlob = { getBytes: () => [] };
      const utilities = new UtilitiesService(mocks.logger);

      utilities.gzip(mockBlob);

      expect(mockGasUtilities.gzip).toHaveBeenCalledWith(mockBlob);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Compressed blob with gzip');
    });

    it('should decompress gzip blob', () => {
      const mockBlob = { getBytes: () => [] };
      const utilities = new UtilitiesService(mocks.logger);

      utilities.ungzip(mockBlob);

      expect(mockGasUtilities.ungzip).toHaveBeenCalledWith(mockBlob);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Decompressed gzip blob');
    });

    it('should throw on gzip error', () => {
      mockGasUtilities.gzip.mockImplementation(() => {
        throw new Error('Compression failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.gzip({})).toThrow('Compression failed');
    });

    it('should throw on ungzip error', () => {
      mockGasUtilities.ungzip.mockImplementation(() => {
        throw new Error('Decompression failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.ungzip({})).toThrow('Decompression failed');
    });
  });

  describe('zip() / unzip() - Archive Operations', () => {
    it('should create zip archive with default name', () => {
      const blobs = [{ name: 'file1' }, { name: 'file2' }];
      const utilities = new UtilitiesService(mocks.logger);

      utilities.zip(blobs);

      expect(mockGasUtilities.zip).toHaveBeenCalledWith(blobs, 'archive.zip');
    });

    it('should create zip archive with custom name', () => {
      const blobs = [{ name: 'file1' }];
      const utilities = new UtilitiesService(mocks.logger);

      utilities.zip(blobs, 'custom.zip');

      expect(mockGasUtilities.zip).toHaveBeenCalledWith(blobs, 'custom.zip');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Created zip archive: custom.zip');
    });

    it('should extract zip archive', () => {
      const mockZipBlob = {};
      const utilities = new UtilitiesService(mocks.logger);

      const result = utilities.unzip(mockZipBlob);

      expect(mockGasUtilities.unzip).toHaveBeenCalledWith(mockZipBlob);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Extracted 2 files from zip')
      );
    });

    it('should throw on zip error', () => {
      mockGasUtilities.zip.mockImplementation(() => {
        throw new Error('Zip failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.zip([])).toThrow('Zip failed');
    });

    it('should throw on unzip error', () => {
      mockGasUtilities.unzip.mockImplementation(() => {
        throw new Error('Unzip failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.unzip({})).toThrow('Unzip failed');
    });
  });

  describe('computeDigest() - Cryptography', () => {
    it('should compute MD5 digest', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.computeDigest('MD5', 'Hello World');

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      expect(mockGasUtilities.computeDigest).toHaveBeenCalledWith('MD5', 'Hello World', 'UTF-8');
    });

    it('should compute SHA-256 digest', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.computeDigest('SHA_256', 'data');

      expect(result).toHaveLength(32);
      expect(mockGasUtilities.computeDigest).toHaveBeenCalledWith('SHA_256', 'data', 'UTF-8');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Computed SHA_256 digest');
    });

    it('should support custom charset', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.computeDigest('MD5', 'data', 'US_ASCII');

      expect(mockGasUtilities.computeDigest).toHaveBeenCalledWith('MD5', 'data', 'US-ASCII');
    });

    it('should throw on digest error', () => {
      mockGasUtilities.computeDigest.mockImplementation(() => {
        throw new Error('Digest failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.computeDigest('MD5', 'data')).toThrow('Digest failed');
    });
  });

  describe('computeHmacSignature() - HMAC', () => {
    it('should compute HMAC-SHA256 signature', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.computeHmacSignature('HMAC_SHA_256', 'message', 'secret');

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(mockGasUtilities.computeHmacSignature).toHaveBeenCalledWith(
        'HMAC_SHA_256',
        'message',
        'secret',
        'UTF-8'
      );
    });

    it('should log HMAC computation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.computeHmacSignature('HMAC_SHA_256', 'msg', 'key');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Computed HMAC_SHA_256 HMAC signature');
    });

    it('should support custom charset', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.computeHmacSignature('HMAC_MD5', 'data', 'key', 'US_ASCII');

      expect(mockGasUtilities.computeHmacSignature).toHaveBeenCalledWith(
        'HMAC_MD5',
        'data',
        'key',
        'US-ASCII'
      );
    });

    it('should throw on HMAC error', () => {
      mockGasUtilities.computeHmacSignature.mockImplementation(() => {
        throw new Error('HMAC failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.computeHmacSignature('HMAC_SHA_256', 'msg', 'key')).toThrow(
        'HMAC failed'
      );
    });
  });

  describe('jsonStringify() / jsonParse() - JSON Utilities', () => {
    it('should stringify object', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.jsonStringify({ name: 'John' });

      expect(result).toBe('{"name":"John"}');
      expect(mockGasUtilities.jsonStringify).toHaveBeenCalledWith({ name: 'John' });
    });

    it('should stringify with pretty print', () => {
      mockGasUtilities.jsonStringify.mockReturnValue('{"name":"John","age":25}');

      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.jsonStringify({ name: 'John', age: 25 }, true);

      // Pretty print should have indentation
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should log stringify operation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.jsonStringify({ test: true });

      expect(mocks.logger.debug).toHaveBeenCalledWith('Stringified object to JSON');
    });

    it('should parse JSON string', () => {
      const utilities = new UtilitiesService(mocks.logger);
      const result = utilities.jsonParse('{"name":"John"}');

      expect(result).toEqual({ name: 'John' });
      expect(mockGasUtilities.jsonParse).toHaveBeenCalledWith('{"name":"John"}');
    });

    it('should log parse operation', () => {
      const utilities = new UtilitiesService(mocks.logger);
      utilities.jsonParse('{}');

      expect(mocks.logger.debug).toHaveBeenCalledWith('Parsed JSON string');
    });

    it('should throw on stringify error', () => {
      mockGasUtilities.jsonStringify.mockImplementation(() => {
        throw new Error('Stringify failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.jsonStringify({})).toThrow('Stringify failed');
    });

    it('should throw on parse error', () => {
      mockGasUtilities.jsonParse.mockImplementation(() => {
        throw new Error('Parse failed');
      });

      const utilities = new UtilitiesService(mocks.logger);

      expect(() => utilities.jsonParse('invalid')).toThrow('Parse failed');
    });
  });

  describe('Real-World Usage Patterns', () => {
    let utilities;

    beforeEach(() => {
      utilities = new UtilitiesService(mocks.logger);
    });

    it('should support rate limiting with sleep', () => {
      const items = ['a', 'b', 'c'];

      items.forEach(() => {
        // Process item
        utilities.sleep(100);
      });

      expect(mockGasUtilities.sleep).toHaveBeenCalledTimes(3);
    });

    it('should support generating unique IDs for records', () => {
      const record = {
        id: utilities.getUuid(),
        name: 'Test Record'
      };

      expect(record.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should support encoding binary data for API transmission', () => {
      const binaryData = 'Hello World';
      const encoded = utilities.base64Encode(binaryData);

      expect(encoded).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should support generating timestamp filenames', () => {
      mockGasUtilities.formatDate.mockReturnValue('2024-12-28_143000');

      const timestamp = utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd_HHmmss');
      const filename = `report_${timestamp}.csv`;

      expect(filename).toBe('report_2024-12-28_143000.csv');
    });

    it('should support CSV data import', () => {
      const csvContent = 'name,age\nJohn,25\nJane,30';
      mockGasUtilities.parseCsv.mockReturnValue([
        ['name', 'age'],
        ['John', '25'],
        ['Jane', '30']
      ]);

      const rows = utilities.parseCsv(csvContent);

      expect(rows[0]).toEqual(['name', 'age']); // Header
      expect(rows[1]).toEqual(['John', '25']); // Data row 1
      expect(rows[2]).toEqual(['Jane', '30']); // Data row 2
    });

    it('should support creating and extracting zip archives', () => {
      const blob1 = { name: 'file1.txt' };
      const blob2 = { name: 'file2.txt' };

      const zipBlob = utilities.zip([blob1, blob2], 'archive.zip');
      expect(mockGasUtilities.zip).toHaveBeenCalled();

      const extracted = utilities.unzip(zipBlob);
      expect(mockGasUtilities.unzip).toHaveBeenCalled();
    });

    it('should support HMAC signature for API authentication', () => {
      const message = 'timestamp=1234567890&user=john';
      const secret = 'my-api-secret';

      const signature = utilities.computeHmacSignature('HMAC_SHA_256', message, secret);

      expect(signature).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('Edge Cases', () => {
    let utilities;

    beforeEach(() => {
      utilities = new UtilitiesService(mocks.logger);
    });

    it('should handle empty string in base64 encode', () => {
      mockGasUtilities.base64Encode.mockReturnValue('');
      const result = utilities.base64Encode('');

      expect(result).toBe('');
    });

    it('should handle empty CSV', () => {
      mockGasUtilities.parseCsv.mockReturnValue([]);
      const result = utilities.parseCsv('');

      expect(result).toEqual([]);
    });

    it('should handle empty blob array for zip', () => {
      const result = utilities.zip([]);

      expect(mockGasUtilities.zip).toHaveBeenCalledWith([], 'archive.zip');
    });

    it('should handle very long strings for hashing', () => {
      const longString = 'a'.repeat(10000);
      utilities.computeDigest('SHA_256', longString);

      expect(mockGasUtilities.computeDigest).toHaveBeenCalledWith('SHA_256', longString, 'UTF-8');
    });

    it('should handle unicode in strings', () => {
      const unicode = 'Hello 世界 🌍';
      utilities.base64Encode(unicode);

      expect(mockGasUtilities.base64Encode).toHaveBeenCalledWith(unicode, 'UTF-8');
    });

    it('should handle special characters in format string', () => {
      utilities.formatString('Value: %s%%', 100);

      expect(mockGasUtilities.formatString).toHaveBeenCalledWith('Value: %s%%', 100);
    });
  });
});
