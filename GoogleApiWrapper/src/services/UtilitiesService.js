/**
 * @file GoogleApiWrapper/src/services/UtilitiesService.js
 * @description Facade for Google Apps Script's Utilities API.
 * Provides a consistent interface for utility functions with error handling and logging.
 */

/**
 * @class UtilitiesService
 * @description Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {ExceptionService} _exceptionService Resiliency provider.
 */
export class UtilitiesService {
  /**
   * @description Initializes UtilitiesService with optional diagnostic and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   */
  constructor(logger = console, exceptionService = null) {
    this._logger = logger || console;
    this._exceptionService = exceptionService;
  }

  /**
   * @description Blocks execution for a specified duration.
   * @param {number} milliseconds Pause duration.
   */
  sleep(milliseconds) {
    try {
      global.Utilities.sleep(milliseconds);
      this._logger.debug(`Slept for ${milliseconds}ms`);
    } catch (error) {
      this._logger.error(`Error during sleep: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Generates a RFC 4122 compliant version 4 UUID.
   * @returns {string}
   */
  getUuid() {
    try {
      const uuid = global.Utilities.getUuid();
      this._logger.debug(`Generated UUID: ${uuid}`);
      return uuid;
    } catch (error) {
      this._logger.error(`Error generating UUID: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Encodes data to Base64. Supports strings and Blobs.
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
  base64Encode(data, charset) {
    try {
      let encoded;
      if (typeof data === 'string') {
        encoded = charset
          ? global.Utilities.base64Encode(data, charset)
          : global.Utilities.base64Encode(data, global.Utilities.Charset.UTF_8);
      } else {
        // Byte array
        encoded = global.Utilities.base64Encode(data);
      }
      this._logger.debug('Encoded data to Base64');
      return encoded;
    } catch (error) {
      this._logger.error(`Failed to Base64 encode data: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Decodes Base64 encoded strings.
   * @param {string} encoded Base64 input.
   * @returns {Blob} Decoded data.
   */
  base64Decode(encoded) {
    try {
      const decoded = global.Utilities.base64Decode(encoded);
      this._logger.debug('Decoded Base64 data');
      return decoded;
    } catch (error) {
      this._logger.error(`Error decoding Base64: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Encodes data to web-safe Base64 (RFC 4648).
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
  base64EncodeWebSafe(data, charset) {
    try {
      let encoded;
      if (typeof data === 'string') {
        encoded = charset
          ? global.Utilities.base64EncodeWebSafe(data, charset)
          : global.Utilities.base64EncodeWebSafe(data, global.Utilities.Charset.UTF_8);
      } else {
        // Byte array
        encoded = global.Utilities.base64EncodeWebSafe(data);
      }
      this._logger.debug('Encoded data to web-safe Base64');
      return encoded;
    } catch (error) {
      this._logger.error(`Failed to web-safe Base64 encode data: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Decodes web-safe Base64 encoded strings.
   * @param {string} encoded Web-safe Base64 input.
   * @returns {Blob} Decoded data.
   */
  base64DecodeWebSafe(encoded) {
    try {
      const decoded = global.Utilities.base64DecodeWebSafe(encoded);
      this._logger.debug('Decoded web-safe Base64 data');
      return decoded;
    } catch (error) {
      this._logger.error(`Error decoding web-safe Base64: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Formats a template string using sprintf-style placeholders (%s, %d).
   * @param {string} template Format pattern.
   * @param {...*} args Substitution values.
   * @returns {string}
   */
  formatString(template, ...args) {
    try {
      const formatted = global.Utilities.formatString(template, ...args);
      this._logger.debug('Formatted string');
      return formatted;
    } catch (error) {
      this._logger.error(`Error formatting string: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Generates a formatted date string for a specific timezone.
   * @param {Date} date Source date.
   * @param {string} timeZone IANA timezone (e.g., 'GMT').
   * @param {string} format Java simple date format pattern.
   * @returns {string}
   */
  formatDate(date, timeZone, format) {
    try {
      const formatted = global.Utilities.formatDate(date, timeZone, format);
      this._logger.debug(`Formatted date: ${formatted}`);
      return formatted;
    } catch (error) {
      this._logger.error(`Error formatting date: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Parses RFC 4180 compliant CSV strings into 2D arrays.
   * @param {string} csv Raw CSV content.
   * @param {string} [delimiter=','] Field separator.
   * @returns {string[][]}
   */
  parseCsv(csv, delimiter = ',') {
    try {
      const parsed = global.Utilities.parseCsv(csv, delimiter);
      this._logger.debug(`Parsed CSV (${parsed.length} rows)`);
      return parsed;
    } catch (error) {
      this._logger.error(`Error parsing CSV: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Initializes a new GAS Blob resource.
   * @param {string|number[]} data Raw content.
   * @param {string} [contentType='text/plain'] MIME type.
   * @param {string} [name='blob'] Resource identifier.
   * @returns {Blob}
   */
  newBlob(data, contentType = 'text/plain', name = 'blob') {
    try {
      const blob = global.Utilities.newBlob(data, contentType, name);
      this._logger.debug(`Created blob: ${name} (${contentType})`);
      return blob;
    } catch (error) {
      this._logger.error(`Error creating blob: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Compresses a Blob via GZIP.
   * @param {Blob} blob Source resource.
   * @returns {Blob} GZIP compressed resource.
   */
  gzip(blob) {
    try {
      const compressed = global.Utilities.gzip(blob);
      this._logger.debug('Compressed blob with gzip');
      return compressed;
    } catch (error) {
      this._logger.error(`Error compressing with gzip: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Decompresses a GZIP-encoded Blob.
   * @param {Blob} blob Compressed resource.
   * @returns {Blob}
   */
  ungzip(blob) {
    try {
      const decompressed = global.Utilities.ungzip(blob);
      this._logger.debug('Decompressed gzip blob');
      return decompressed;
    } catch (error) {
      this._logger.error(`Error decompressing gzip: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Packages multiple Blobs into a ZIP archive.
   * @param {Blob[]} blobs Collection of resources to archive.
   * @param {string} [name='archive.zip'] Archive filename.
   * @returns {Blob} ZIP compressed resource.
   */
  zip(blobs, name = 'archive.zip') {
    try {
      const zipped = global.Utilities.zip(blobs, name);
      this._logger.debug(`Created zip archive: ${name}`);
      return zipped;
    } catch (error) {
      this._logger.error(`Error creating zip: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Extracts components from a ZIP-encoded Blob.
   * @param {Blob} blob ZIP archive resource.
   * @returns {Blob[]} Collection of extracted resources.
   */
  unzip(blob) {
    try {
      const extracted = global.Utilities.unzip(blob);
      this._logger.debug(`Extracted ${extracted.length} files from zip`);
      return extracted;
    } catch (error) {
      this._logger.error(`Error extracting zip: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Generates a cryptographic hash digest.
   * @param {string} algorithm Target algorithm (MD5, SHA_1, SHA_256, SHA_384, SHA_512).
   * @param {string|Blob} value Input content.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array digest.
   */
  computeDigest(algorithm, value, charset = 'UTF_8') {
    try {
      // Map string algorithm names to Utilities.DigestAlgorithm enum
      const algorithmEnum = global.Utilities.DigestAlgorithm[algorithm];
      const charsetEnum = global.Utilities.Charset[charset];

      const digest = global.Utilities.computeDigest(algorithmEnum, value, charsetEnum);
      this._logger.debug(`Computed ${algorithm} digest`);
      return digest;
    } catch (error) {
      this._logger.error(`Error computing digest: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Generates a Hash-based Message Authentication Code (HMAC).
   * @param {string} algorithm Target algorithm (HMAC_MD5, HMAC_SHA_1, HMAC_SHA_256, HMAC_SHA_384, HMAC_SHA_512).
   * @param {string|Blob} value Message to sign.
   * @param {string|Blob} key Secret key.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array signature.
   */
  computeHmacSignature(algorithm, value, key, charset = 'UTF_8') {
    try {
      // Map string algorithm names to Utilities.MacAlgorithm enum
      const algorithmEnum = global.Utilities.MacAlgorithm[algorithm];
      const charsetEnum = global.Utilities.Charset[charset];

      const signature = global.Utilities.computeHmacSignature(
        algorithmEnum,
        value,
        key,
        charsetEnum
      );
      this._logger.debug(`Computed ${algorithm} HMAC signature`);
      return signature;
    } catch (error) {
      this._logger.error(`Error computing HMAC signature: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Serializes an entity to a JSON string via native Utilities.
   * @param {*} obj Target entity.
   * @param {boolean} [prettyPrint=false] Enable 2-space indentation.
   * @returns {string}
   */
  jsonStringify(obj, prettyPrint = false) {
    try {
      const json = global.Utilities.jsonStringify(obj);
      if (prettyPrint) {
        return JSON.stringify(JSON.parse(json), null, 2);
      }
      this._logger.debug('Stringified object to JSON');
      return json;
    } catch (error) {
      this._logger.error(`Error stringifying JSON: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Deserializes a JSON string via native Utilities.
   * @param {string} json Raw JSON content.
   * @returns {*}
   */
  jsonParse(json) {
    try {
      const obj = global.Utilities.jsonParse(json);
      this._logger.debug('Parsed JSON string');
      return obj;
    } catch (error) {
      this._logger.error(`Error parsing JSON: ${error.message}`);
      throw error;
    }
  }
}
