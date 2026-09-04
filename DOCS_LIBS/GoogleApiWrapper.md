# API Reference: GoogleApiWrapper

## CLASS: SpreadsheetServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new SpreadsheetServiceMock();`
**Description:** High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.

### Raw JSDoc Context:
```javascript
/**
 * @class SpreadsheetServiceMock
 * @description High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.
 */
```

<br>

## CLASS: PropertiesServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new PropertiesServiceMock();`
**Description:** High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.

### Raw JSDoc Context:
```javascript
/**
 * @class PropertiesServiceMock
 * @description High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.
 */
```

<br>

## CLASS: DocumentServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DocumentServiceMock();`
**Description:** High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.

### Raw JSDoc Context:
```javascript
/**
 * @class DocumentServiceMock
 * @description High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.
 */
```

<br>

## CLASS: TriggerServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new TriggerServiceMock();`
**Description:** High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.

### Raw JSDoc Context:
```javascript
/**
 * @class TriggerServiceMock
 * @description High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.
 */
```

<br>

## CLASS: MailServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new MailServiceMock();`
**Description:** High-fidelity mock for MailService.

### Raw JSDoc Context:
```javascript
/**
 * @class MailServiceMock
 * @description High-fidelity mock for MailService.
 */
```

<br>

## CLASS: LockServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new LockServiceMock();`
**Description:** High-fidelity mock for LockService.

### Raw JSDoc Context:
```javascript
/**
 * @class LockServiceMock
 * @description High-fidelity mock for LockService.
 */
```

<br>

## CLASS: DriveServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DriveServiceMock();`
**Description:** High-fidelity mock for DriveService.

### Raw JSDoc Context:
```javascript
/**
 * @class DriveServiceMock
 * @description High-fidelity mock for DriveService.
 */
```

<br>

## CLASS: UtilitiesService
**File Path:** `GoogleApiWrapper/src/services/UtilitiesService.js`
**Constructor Usage:** `const instance = new UtilitiesService();`
**Description:** Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.

### Raw JSDoc Context:
```javascript
/**
 * @class UtilitiesService
 * @description Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {ExceptionService} _exceptionService Resiliency provider.
 */
```

### Methods of UtilitiesService

#### METHOD: UtilitiesService.sleep
- **Scope:** instance
- **LLM Call Syntax:** `utilitiesService.sleep(milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Blocks execution for a specified duration.
   * @param {number} milliseconds Pause duration.
   */
```
---
#### METHOD: UtilitiesService.getUuid
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.getUuid();`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a RFC 4122 compliant version 4 UUID.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64Encode
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64Encode(data, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Encodes data to Base64. Supports strings and Blobs.
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64Decode
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64Decode(encoded);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decodes Base64 encoded strings.
   * @param {string} encoded Base64 input.
   * @returns {Blob} Decoded data.
   */
```
---
#### METHOD: UtilitiesService.base64EncodeWebSafe
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64EncodeWebSafe(data, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Encodes data to web-safe Base64 (RFC 4648).
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64DecodeWebSafe
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64DecodeWebSafe(encoded);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decodes web-safe Base64 encoded strings.
   * @param {string} encoded Web-safe Base64 input.
   * @returns {Blob} Decoded data.
   */
```
---
#### METHOD: UtilitiesService.formatString
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.formatString(template, args);`
- **Pure JSDoc:**
```javascript
/**
   * @description Formats a template string using sprintf-style placeholders (%s, %d).
   * @param {string} template Format pattern.
   * @param {...*} args Substitution values.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.formatDateNative
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.formatDateNative(date, timeZone, format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a formatted date string for a specific timezone.
   * @param {Date} date Source date.
   * @param {string} timeZone IANA timezone (e.g., 'GMT').
   * @param {string} format Java simple date format pattern.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.parseCsv
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.parseCsv(csv, delimiter);`
- **Pure JSDoc:**
```javascript
/**
   * @description Parses RFC 4180 compliant CSV strings into 2D arrays.
   * @param {string} csv Raw CSV content.
   * @param {string} [delimiter=','] Field separator.
   * @returns {string[][]}
   */
```
---
#### METHOD: UtilitiesService.newBlob
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.newBlob(data, contentType, name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Initializes a new GAS Blob resource.
   * @param {string|number[]} data Raw content.
   * @param {string} [contentType='text/plain'] MIME type.
   * @param {string} [name='blob'] Resource identifier.
   * @returns {Blob}
   */
```
---
#### METHOD: UtilitiesService.gzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.gzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Compresses a Blob via GZIP.
   * @param {Blob} blob Source resource.
   * @returns {Blob} GZIP compressed resource.
   */
```
---
#### METHOD: UtilitiesService.ungzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.ungzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decompresses a GZIP-encoded Blob.
   * @param {Blob} blob Compressed resource.
   * @returns {Blob}
   */
```
---
#### METHOD: UtilitiesService.zip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.zip(blobs, name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Packages multiple Blobs into a ZIP archive.
   * @param {Blob[]} blobs Collection of resources to archive.
   * @param {string} [name='archive.zip'] Archive filename.
   * @returns {Blob} ZIP compressed resource.
   */
```
---
#### METHOD: UtilitiesService.unzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.unzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Extracts components from a ZIP-encoded Blob.
   * @param {Blob} blob ZIP archive resource.
   * @returns {Blob[]} Collection of extracted resources.
   */
```
---
#### METHOD: UtilitiesService.computeDigest
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.computeDigest(algorithm, value, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a cryptographic hash digest.
   * @param {string} algorithm Target algorithm (MD5, SHA_1, SHA_256, SHA_384, SHA_512).
   * @param {string|Blob} value Input content.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array digest.
   */
```
---
#### METHOD: UtilitiesService.computeHmacSignature
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.computeHmacSignature(algorithm, value, key, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a Hash-based Message Authentication Code (HMAC).
   * @param {string} algorithm Target algorithm (HMAC_MD5, HMAC_SHA_1, HMAC_SHA_256, HMAC_SHA_384, HMAC_SHA_512).
   * @param {string|Blob} value Message to sign.
   * @param {string|Blob} key Secret key.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array signature.
   */
```
---
#### METHOD: UtilitiesService.jsonStringify
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.jsonStringify(obj, prettyPrint);`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes an entity to a JSON string via native Utilities.
   * @param {*} obj Target entity.
   * @param {boolean} [prettyPrint=false] Enable 2-space indentation.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.jsonParse
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.jsonParse(json);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deserializes a JSON string via native Utilities.
   * @param {string} json Raw JSON content.
   * @returns {*}
   */
```
---
<br>

## CLASS: UtilitiesService
**File Path:** `GoogleApiWrapper/src/services/UtilitiesService.js`
**Constructor Usage:** `const instance = new UtilitiesService(logger, exceptionService);`
**Description:** Initializes UtilitiesService with optional diagnostic and resiliency providers.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes UtilitiesService with optional diagnostic and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   */
```

### Methods of UtilitiesService

#### METHOD: UtilitiesService.sleep
- **Scope:** instance
- **LLM Call Syntax:** `utilitiesService.sleep(milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Blocks execution for a specified duration.
   * @param {number} milliseconds Pause duration.
   */
```
---
#### METHOD: UtilitiesService.getUuid
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.getUuid();`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a RFC 4122 compliant version 4 UUID.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64Encode
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64Encode(data, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Encodes data to Base64. Supports strings and Blobs.
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64Decode
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64Decode(encoded);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decodes Base64 encoded strings.
   * @param {string} encoded Base64 input.
   * @returns {Blob} Decoded data.
   */
```
---
#### METHOD: UtilitiesService.base64EncodeWebSafe
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64EncodeWebSafe(data, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Encodes data to web-safe Base64 (RFC 4648).
   * @param {string|Blob} data Input data.
   * @param {string} [charset] Character set for string input.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.base64DecodeWebSafe
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.base64DecodeWebSafe(encoded);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decodes web-safe Base64 encoded strings.
   * @param {string} encoded Web-safe Base64 input.
   * @returns {Blob} Decoded data.
   */
```
---
#### METHOD: UtilitiesService.formatString
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.formatString(template, args);`
- **Pure JSDoc:**
```javascript
/**
   * @description Formats a template string using sprintf-style placeholders (%s, %d).
   * @param {string} template Format pattern.
   * @param {...*} args Substitution values.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.formatDateNative
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.formatDateNative(date, timeZone, format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a formatted date string for a specific timezone.
   * @param {Date} date Source date.
   * @param {string} timeZone IANA timezone (e.g., 'GMT').
   * @param {string} format Java simple date format pattern.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.parseCsv
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.parseCsv(csv, delimiter);`
- **Pure JSDoc:**
```javascript
/**
   * @description Parses RFC 4180 compliant CSV strings into 2D arrays.
   * @param {string} csv Raw CSV content.
   * @param {string} [delimiter=','] Field separator.
   * @returns {string[][]}
   */
```
---
#### METHOD: UtilitiesService.newBlob
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.newBlob(data, contentType, name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Initializes a new GAS Blob resource.
   * @param {string|number[]} data Raw content.
   * @param {string} [contentType='text/plain'] MIME type.
   * @param {string} [name='blob'] Resource identifier.
   * @returns {Blob}
   */
```
---
#### METHOD: UtilitiesService.gzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.gzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Compresses a Blob via GZIP.
   * @param {Blob} blob Source resource.
   * @returns {Blob} GZIP compressed resource.
   */
```
---
#### METHOD: UtilitiesService.ungzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.ungzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decompresses a GZIP-encoded Blob.
   * @param {Blob} blob Compressed resource.
   * @returns {Blob}
   */
```
---
#### METHOD: UtilitiesService.zip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.zip(blobs, name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Packages multiple Blobs into a ZIP archive.
   * @param {Blob[]} blobs Collection of resources to archive.
   * @param {string} [name='archive.zip'] Archive filename.
   * @returns {Blob} ZIP compressed resource.
   */
```
---
#### METHOD: UtilitiesService.unzip
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.unzip(blob);`
- **Pure JSDoc:**
```javascript
/**
   * @description Extracts components from a ZIP-encoded Blob.
   * @param {Blob} blob ZIP archive resource.
   * @returns {Blob[]} Collection of extracted resources.
   */
```
---
#### METHOD: UtilitiesService.computeDigest
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.computeDigest(algorithm, value, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a cryptographic hash digest.
   * @param {string} algorithm Target algorithm (MD5, SHA_1, SHA_256, SHA_384, SHA_512).
   * @param {string|Blob} value Input content.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array digest.
   */
```
---
#### METHOD: UtilitiesService.computeHmacSignature
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.computeHmacSignature(algorithm, value, key, charset);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a Hash-based Message Authentication Code (HMAC).
   * @param {string} algorithm Target algorithm (HMAC_MD5, HMAC_SHA_1, HMAC_SHA_256, HMAC_SHA_384, HMAC_SHA_512).
   * @param {string|Blob} value Message to sign.
   * @param {string|Blob} key Secret key.
   * @param {string} [charset='UTF_8'] Encoding for string input.
   * @returns {number[]} Byte array signature.
   */
```
---
#### METHOD: UtilitiesService.jsonStringify
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.jsonStringify(obj, prettyPrint);`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes an entity to a JSON string via native Utilities.
   * @param {*} obj Target entity.
   * @param {boolean} [prettyPrint=false] Enable 2-space indentation.
   * @returns {string}
   */
```
---
#### METHOD: UtilitiesService.jsonParse
- **Scope:** instance
- **LLM Call Syntax:** `const result = utilitiesService.jsonParse(json);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deserializes a JSON string via native Utilities.
   * @param {string} json Raw JSON content.
   * @returns {*}
   */
```
---
<br>

## CLASS: UserService
**File Path:** `GoogleApiWrapper/src/services/UserService.js`
**Constructor Usage:** `const instance = new UserService();`
**Description:** Lightweight facade for the native GAS `Session` global — the L2
boundary for running-user identity lookups, so no other library or consumer
needs to touch `Session` directly.

### Raw JSDoc Context:
```javascript
/**
 * @class UserService
 * @description Lightweight facade for the native GAS `Session` global — the L2
 * boundary for running-user identity lookups, so no other library or consumer
 * needs to touch `Session` directly.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 */
```

### Methods of UserService

#### METHOD: UserService.getActiveUserEmail
- **Scope:** instance
- **LLM Call Syntax:** `const result = userService.getActiveUserEmail();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the email address of the user running the current script execution.
   * @returns {string}
   */
```
---
<br>

## CLASS: UserService
**File Path:** `GoogleApiWrapper/src/services/UserService.js`
**Constructor Usage:** `const instance = new UserService(logger);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {LoggerService} [logger=console] Diagnostic logger.
   */
```

### Methods of UserService

#### METHOD: UserService.getActiveUserEmail
- **Scope:** instance
- **LLM Call Syntax:** `const result = userService.getActiveUserEmail();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the email address of the user running the current script execution.
   * @returns {string}
   */
```
---
<br>

## CLASS: UiService
**File Path:** `GoogleApiWrapper/src/services/UiService.js`
**Constructor Usage:** `const instance = new UiService();`
**Description:** Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.

### Raw JSDoc Context:
```javascript
/**
 * @class UiService
 * @extends GoogleService
 * @description Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.
 *
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI object.
 */
```

### Methods of UiService

#### METHOD: UiService._detectUiObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._detectUiObject();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Probes global host applications (SpreadsheetApp, DocumentApp, FormApp, SlidesApp) to resolve the active UI object.
   * @returns {GoogleAppsScript.Base.Ui|null} Detected UI object.
   */
```
---
#### METHOD: UiService.createMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createMenu(caption);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent menu construction.
   * @param {string} caption Label displayed in the UI menu bar.
   * @returns {MenuBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.alert
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.alert(title, message, buttonSet);`
- **Pure JSDoc:**
```javascript
/**
   * @description Synchronous execution of a standard alert dialog.
   * @param {string} title Dialog header.
   * @param {string} message Dialog body.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.Button} Button identifier clicked by the user.
   */
```
---
#### METHOD: UiService.prompt
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.prompt(title, message, buttonSet);`
- **Pure JSDoc:**
```javascript
/**
   * @description Synchronous execution of an input prompt dialog.
   * @param {string} title Dialog header.
   * @param {string} message Instruction text.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.PromptResponse} Object containing the selected button and input text.
   */
```
---
#### METHOD: UiService.createSidebar
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createSidebar();`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent HTML sidebar construction.
   * @returns {SidebarBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.createDialog
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createDialog();`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent modal HTML dialog construction.
   * @returns {DialogBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.getNativeUi
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.getNativeUi();`
- **Pure JSDoc:**
```javascript
/**
   * @description Direct accessor for the underlying GAS UI object.
   * @returns {GoogleAppsScript.Base.Ui}
   */
```
---
#### METHOD: UiService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: UiService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: UiService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: UiService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `uiService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: UiService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: UiService
**File Path:** `GoogleApiWrapper/src/services/UiService.js`
**Constructor Usage:** `const instance = new UiService(logger, cache, utils, exceptionService, uiObject);`
**Description:** Initializes UiService with host auto-detection or explicit UI provider.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes UiService with host auto-detection or explicit UI provider.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {Cache} cache Persistence provider.
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider.
   * @param {Object} [uiObject=null] Explicit UI object for testing or overriding detection.
   * @throws {Error} If no UI context is detected.
   */
```

### Methods of UiService

#### METHOD: UiService._detectUiObject
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._detectUiObject();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Probes global host applications (SpreadsheetApp, DocumentApp, FormApp, SlidesApp) to resolve the active UI object.
   * @returns {GoogleAppsScript.Base.Ui|null} Detected UI object.
   */
```
---
#### METHOD: UiService.createMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createMenu(caption);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent menu construction.
   * @param {string} caption Label displayed in the UI menu bar.
   * @returns {MenuBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.alert
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.alert(title, message, buttonSet);`
- **Pure JSDoc:**
```javascript
/**
   * @description Synchronous execution of a standard alert dialog.
   * @param {string} title Dialog header.
   * @param {string} message Dialog body.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.Button} Button identifier clicked by the user.
   */
```
---
#### METHOD: UiService.prompt
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.prompt(title, message, buttonSet);`
- **Pure JSDoc:**
```javascript
/**
   * @description Synchronous execution of an input prompt dialog.
   * @param {string} title Dialog header.
   * @param {string} message Instruction text.
   * @param {GoogleAppsScript.Base.ButtonSet} [buttonSet] Configuration of buttons to display.
   * @returns {GoogleAppsScript.Base.PromptResponse} Object containing the selected button and input text.
   */
```
---
#### METHOD: UiService.createSidebar
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createSidebar();`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent HTML sidebar construction.
   * @returns {SidebarBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.createDialog
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.createDialog();`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory for fluent modal HTML dialog construction.
   * @returns {DialogBuilder} Chained builder instance.
   */
```
---
#### METHOD: UiService.getNativeUi
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService.getNativeUi();`
- **Pure JSDoc:**
```javascript
/**
   * @description Direct accessor for the underlying GAS UI object.
   * @returns {GoogleAppsScript.Base.Ui}
   */
```
---
#### METHOD: UiService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: UiService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: UiService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: UiService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `uiService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: UiService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = uiService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: TriggerService
**File Path:** `GoogleApiWrapper/src/services/TriggerService.js`
**Constructor Usage:** `const instance = new TriggerService();`
**Description:** Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.

### Raw JSDoc Context:
```javascript
/**
 * @class TriggerService
 * @description Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 */
```

### Methods of TriggerService

#### METHOD: TriggerService.createTimedTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createTimedTrigger(functionName, milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a one-time execution after a specific delay. Ideal for Approaching-Timeout resumption patterns.
   * @param {string} functionName Target function identifier.
   * @param {number} milliseconds Execution delay.
   * @returns {string} Unique trigger identifier.
   * @throws {Error} If delay is invalid or quota exceeded.
   */
```
---
#### METHOD: TriggerService.createRecurringTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createRecurringTrigger(functionName, cronExpression);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a recurring execution based on a simplified CRON-like expression.
   * @param {string} functionName Target function identifier.
   * @param {string} cronExpression Schedule definition (e.g., 'every 5 minutes').
   * @returns {string} Unique trigger identifier.
   * @throws {Error} On invalid schedule expression.
   */
```
---
#### METHOD: TriggerService._parseCronExpression
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService._parseCronExpression(cronExpression);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Maps CRON-like strings to native ScriptApp trigger builders.
   * @param {string} cronExpression Schedule definition.
   * @returns {Object} Parsed schedule metadata.
   */
```
---
#### METHOD: TriggerService.getAllTriggers
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.getAllTriggers();`
- **Pure JSDoc:**
```javascript
/**
   * @description Audits all triggers associated with the current script project.
   * @returns {Object[]} Collection of trigger metadata {id, function, type, event}.
   */
```
---
#### METHOD: TriggerService.findTriggerById
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggerById(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves a specific trigger by its ID.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {GoogleAppsScript.Script.Trigger|null} Trigger object or null if not found.
   */
```
---
#### METHOD: TriggerService.deleteTriggerById
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteTriggerById(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys a specific trigger.
   * @param {string} triggerId Unique ID of the trigger to delete.
   * @returns {boolean} True if deleted successfully, false if not found.
   */
```
---
#### METHOD: TriggerService.deleteTriggersByFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteTriggersByFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys all triggers targeting a specific global function.
   * @param {string} functionName Name of the function.
   * @returns {number} Number of triggers deleted.
   */
```
---
#### METHOD: TriggerService.deleteAllTriggers
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteAllTriggers();`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys all project-associated triggers. WARNING: Destructive.
   * @returns {number} Number of triggers deleted.
   */
```
---
#### METHOD: TriggerService.triggerExistsForFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.triggerExistsForFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates presence of at least one trigger for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {boolean}
   */
```
---
#### METHOD: TriggerService.getTriggerInfo
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.getTriggerInfo(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves detailed metadata for a trigger.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {Object|null} Metadata {id, function, type, event, enabled}.
   */
```
---
#### METHOD: TriggerService.findTriggersByFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggersByFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Finds all triggers for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {Object[]} Collection of trigger metadata.
   */
```
---
#### METHOD: TriggerService.findTriggersByType
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggersByType(triggerType);`
- **Pure JSDoc:**
```javascript
/**
   * @description Finds all triggers of a specific type.
   * @param {string} triggerType Type of trigger (e.g., 'time_based').
   * @returns {Object[]} Collection of trigger metadata.
   */
```
---
#### METHOD: TriggerService._determineTriggerType
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService._determineTriggerType(trigger);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Determines the type of a trigger.
   * @param {GoogleAppsScript.Script.Trigger} trigger Native GAS trigger.
   * @returns {string} Category string.
   */
```
---
#### METHOD: TriggerService.createTriggerAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createTriggerAt(functionName, date);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a one-time execution at an absolute Date/Time.
   * @param {string} functionName Target function identifier.
   * @param {Date} date Fire date.
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createEveryMinutesTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createEveryMinutesTrigger(functionName, minutes);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules high-frequency recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} minutes Interval in minutes (1, 5, 10, 15, or 30).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createEveryHoursTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createEveryHoursTrigger(functionName, hours);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules hourly recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} hours Interval in hours (1, 2, 4, 6, 8, or 12).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createDailyTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createDailyTrigger(functionName, hour);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules daily recurring execution at a specific hour.
   * @param {string} functionName Target function identifier.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createWeeklyTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createWeeklyTrigger(functionName, weekDay, hour);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules weekly recurring execution on a specific day.
   * @param {string} functionName Target function identifier.
   * @param {GoogleAppsScript.Script.WeekDay} weekDay Day of week.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
```
---
<br>

## CLASS: TriggerService
**File Path:** `GoogleApiWrapper/src/services/TriggerService.js`
**Constructor Usage:** `const instance = new TriggerService(logger);`
**Description:** Initializes TriggerService with diagnostic logging.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes TriggerService with diagnostic logging.
   * @param {LoggerService} logger Diagnostic logger.
   */
```

### Methods of TriggerService

#### METHOD: TriggerService.createTimedTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createTimedTrigger(functionName, milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a one-time execution after a specific delay. Ideal for Approaching-Timeout resumption patterns.
   * @param {string} functionName Target function identifier.
   * @param {number} milliseconds Execution delay.
   * @returns {string} Unique trigger identifier.
   * @throws {Error} If delay is invalid or quota exceeded.
   */
```
---
#### METHOD: TriggerService.createRecurringTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createRecurringTrigger(functionName, cronExpression);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a recurring execution based on a simplified CRON-like expression.
   * @param {string} functionName Target function identifier.
   * @param {string} cronExpression Schedule definition (e.g., 'every 5 minutes').
   * @returns {string} Unique trigger identifier.
   * @throws {Error} On invalid schedule expression.
   */
```
---
#### METHOD: TriggerService._parseCronExpression
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService._parseCronExpression(cronExpression);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Maps CRON-like strings to native ScriptApp trigger builders.
   * @param {string} cronExpression Schedule definition.
   * @returns {Object} Parsed schedule metadata.
   */
```
---
#### METHOD: TriggerService.getAllTriggers
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.getAllTriggers();`
- **Pure JSDoc:**
```javascript
/**
   * @description Audits all triggers associated with the current script project.
   * @returns {Object[]} Collection of trigger metadata {id, function, type, event}.
   */
```
---
#### METHOD: TriggerService.findTriggerById
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggerById(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves a specific trigger by its ID.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {GoogleAppsScript.Script.Trigger|null} Trigger object or null if not found.
   */
```
---
#### METHOD: TriggerService.deleteTriggerById
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteTriggerById(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys a specific trigger.
   * @param {string} triggerId Unique ID of the trigger to delete.
   * @returns {boolean} True if deleted successfully, false if not found.
   */
```
---
#### METHOD: TriggerService.deleteTriggersByFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteTriggersByFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys all triggers targeting a specific global function.
   * @param {string} functionName Name of the function.
   * @returns {number} Number of triggers deleted.
   */
```
---
#### METHOD: TriggerService.deleteAllTriggers
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.deleteAllTriggers();`
- **Pure JSDoc:**
```javascript
/**
   * @description Destroys all project-associated triggers. WARNING: Destructive.
   * @returns {number} Number of triggers deleted.
   */
```
---
#### METHOD: TriggerService.triggerExistsForFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.triggerExistsForFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates presence of at least one trigger for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {boolean}
   */
```
---
#### METHOD: TriggerService.getTriggerInfo
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.getTriggerInfo(triggerId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves detailed metadata for a trigger.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {Object|null} Metadata {id, function, type, event, enabled}.
   */
```
---
#### METHOD: TriggerService.findTriggersByFunction
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggersByFunction(functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Finds all triggers for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {Object[]} Collection of trigger metadata.
   */
```
---
#### METHOD: TriggerService.findTriggersByType
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.findTriggersByType(triggerType);`
- **Pure JSDoc:**
```javascript
/**
   * @description Finds all triggers of a specific type.
   * @param {string} triggerType Type of trigger (e.g., 'time_based').
   * @returns {Object[]} Collection of trigger metadata.
   */
```
---
#### METHOD: TriggerService._determineTriggerType
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService._determineTriggerType(trigger);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Determines the type of a trigger.
   * @param {GoogleAppsScript.Script.Trigger} trigger Native GAS trigger.
   * @returns {string} Category string.
   */
```
---
#### METHOD: TriggerService.createTriggerAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createTriggerAt(functionName, date);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules a one-time execution at an absolute Date/Time.
   * @param {string} functionName Target function identifier.
   * @param {Date} date Fire date.
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createEveryMinutesTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createEveryMinutesTrigger(functionName, minutes);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules high-frequency recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} minutes Interval in minutes (1, 5, 10, 15, or 30).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createEveryHoursTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createEveryHoursTrigger(functionName, hours);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules hourly recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} hours Interval in hours (1, 2, 4, 6, 8, or 12).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createDailyTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createDailyTrigger(functionName, hour);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules daily recurring execution at a specific hour.
   * @param {string} functionName Target function identifier.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
```
---
#### METHOD: TriggerService.createWeeklyTrigger
- **Scope:** instance
- **LLM Call Syntax:** `const result = triggerService.createWeeklyTrigger(functionName, weekDay, hour);`
- **Pure JSDoc:**
```javascript
/**
   * @description Schedules weekly recurring execution on a specific day.
   * @param {string} functionName Target function identifier.
   * @param {GoogleAppsScript.Script.WeekDay} weekDay Day of week.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
```
---
<br>

## CLASS: SpreadsheetService
**File Path:** `GoogleApiWrapper/src/services/SpreadsheetService.js`
**Constructor Usage:** `const instance = new SpreadsheetService();`
**Description:** Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.

### Raw JSDoc Context:
```javascript
/**
 * @class SpreadsheetService
 * @extends GoogleService
 * @description Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.
 *
 * @property {SpreadsheetMetadataCache} _metadataCache Internal metadata registry.
 * @property {SpreadsheetRangeManager} _rangeManager Logic for cell value mutations.
 * @property {SpreadsheetGridManager} _gridManager Logic for sheet and grid mutations.
 * @property {SpreadsheetHybridManager} _hybridManager Standard API integration logic.
 */
```

### Methods of SpreadsheetService

#### METHOD: SpreadsheetService._isDryRun
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetService._isDryRun(options);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Resolves dry-run status for current operation.
   * @param {Object} [options={}] Operation-level dryRun override.
   * @returns {boolean}
   */
```
---
#### METHOD: SpreadsheetService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: SpreadsheetService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: SpreadsheetService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: SpreadsheetService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: SpreadsheetService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: PropertiesService
**File Path:** `GoogleApiWrapper/src/services/PropertiesService.js`
**Constructor Usage:** `const instance = new PropertiesService();`
**Description:** Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.

### Raw JSDoc Context:
```javascript
/**
 * @class PropertiesService
 * @description Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _properties Native GAS Properties instance.
 */
```

### Methods of PropertiesService

#### METHOD: PropertiesService.setUserProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setUserProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses per-user persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure.
   */
```
---
#### METHOD: PropertiesService.setDocumentProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setDocumentProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses document-bound persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or if script is not container-bound.
   */
```
---
#### METHOD: PropertiesService.setProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses global script persistent storage. Auto-converts input to string.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or size limit violation (9KB).
   */
```
---
#### METHOD: PropertiesService.setProperties
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.setProperties(properties);`
- **Pure JSDoc:**
```javascript
/**
   * @description Writes multiple properties in a single GAS API call. Optimized for performance (3-5x faster than sequential set).
   * @param {Object<string, string|number|boolean>} properties Map of key-value pairs.
   * @throws {Error} If total size or individual property limits are exceeded.
   */
```
---
#### METHOD: PropertiesService.deleteProperty
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.deleteProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes a single script property. Idempotent.
   * @param {string} key Property identifier.
   * @throws {Error} On storage failure.
   */
```
---
#### METHOD: PropertiesService.deleteAllProperties
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.deleteAllProperties();`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes all script properties in current scope. Irreversible.
   * @returns {number} Count of deleted properties.
   */
```
---
#### METHOD: PropertiesService.getKeys
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getKeys();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all property keys in current scope.
   * @returns {string[]}
   */
```
---
#### METHOD: PropertiesService.getProperties
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getProperties();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all key-value pairs in current scope.
   * @returns {Object<string, string>}
   */
```
---
#### METHOD: PropertiesService.setObjectProperty
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.setObjectProperty(key, object);`
- **Pure JSDoc:**
```javascript
/**
   * @description Managed JSON storage with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @param {Object} object Entity to serialize.
   * @throws {TypeError} On circular references.
   */
```
---
#### METHOD: PropertiesService.getObjectProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getObjectProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves deserialized entity with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @returns {Object|null} Deserialized entity with revived Date objects.
   */
```
---
#### METHOD: PropertiesService._dateReviver
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService._dateReviver(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description JSON reviver for ISO 8601 string-to-Date conversion.
   * @param {string} key Current property key.
   * @param {*} value Current property value.
   * @returns {Date|*} Revived Date or original value.
   */
```
---
#### METHOD: PropertiesService.hasProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.hasProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if a property exists in the current scope.
   * @param {string} key Property identifier.
   * @returns {boolean}
   */
```
---
#### METHOD: PropertiesService.getPropertyOrDefault
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getPropertyOrDefault(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value with a fallback if missing.
   * @param {string} key Property identifier.
   * @param {string} defaultValue Fallback value.
   * @returns {string}
   */
```
---
#### METHOD: PropertiesService.updatePropertyIfExists
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.updatePropertyIfExists(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Updates a property only if it exists.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value New data.
   * @returns {boolean} True if updated.
   */
```
---
#### METHOD: PropertiesService.setPropertyIfNotExists
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setPropertyIfNotExists(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a property only if it does not exist.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value Data to store.
   * @returns {boolean} True if created.
   */
```
---
#### METHOD: PropertiesService.getNumericProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getNumericProperty(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value as a number.
   * @param {string} key Property identifier.
   * @param {number} [defaultValue=0] Fallback if missing or NaN.
   * @returns {number}
   */
```
---
#### METHOD: PropertiesService.getBooleanProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getBooleanProperty(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value as a boolean. Maps 'true', '1', 'yes' to true.
   * @param {string} key Property identifier.
   * @param {boolean} [defaultValue=false] Fallback if missing.
   * @returns {boolean}
   */
```
---
#### METHOD: PropertiesService.getScriptProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getScriptProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS script properties.
   * Preserves backward compatibility with code that calls
   * PropertiesService.getScriptProperties() expecting the native GAS API pattern.
   * @returns {Object} Native GAS script properties
   */
```
---
#### METHOD: PropertiesService.getUserProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getUserProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS user properties.
   * @returns {Object} Native GAS user properties
   */
```
---
#### METHOD: PropertiesService.getDocumentProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getDocumentProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS document properties.
   * @returns {Object} Native GAS document properties
   */
```
---
<br>

## CLASS: PropertiesService
**File Path:** `GoogleApiWrapper/src/services/PropertiesService.js`
**Constructor Usage:** `const instance = new PropertiesService(logger);`
**Description:** Initializes PropertiesService with targeted storage scope.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes PropertiesService with targeted storage scope.
   * @param {LoggerService} logger Diagnostic logger.
   */
```

### Methods of PropertiesService

#### METHOD: PropertiesService.setUserProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setUserProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses per-user persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure.
   */
```
---
#### METHOD: PropertiesService.setDocumentProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setDocumentProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses document-bound persistent storage.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or if script is not container-bound.
   */
```
---
#### METHOD: PropertiesService.setProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setProperty(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses global script persistent storage. Auto-converts input to string.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} [value] Data to store.
   * @returns {string|null} Retrieved value (for get).
   * @throws {Error} On storage failure or size limit violation (9KB).
   */
```
---
#### METHOD: PropertiesService.setProperties
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.setProperties(properties);`
- **Pure JSDoc:**
```javascript
/**
   * @description Writes multiple properties in a single GAS API call. Optimized for performance (3-5x faster than sequential set).
   * @param {Object<string, string|number|boolean>} properties Map of key-value pairs.
   * @throws {Error} If total size or individual property limits are exceeded.
   */
```
---
#### METHOD: PropertiesService.deleteProperty
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.deleteProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes a single script property. Idempotent.
   * @param {string} key Property identifier.
   * @throws {Error} On storage failure.
   */
```
---
#### METHOD: PropertiesService.deleteAllProperties
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.deleteAllProperties();`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes all script properties in current scope. Irreversible.
   * @returns {number} Count of deleted properties.
   */
```
---
#### METHOD: PropertiesService.getKeys
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getKeys();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all property keys in current scope.
   * @returns {string[]}
   */
```
---
#### METHOD: PropertiesService.getProperties
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getProperties();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all key-value pairs in current scope.
   * @returns {Object<string, string>}
   */
```
---
#### METHOD: PropertiesService.setObjectProperty
- **Scope:** instance
- **LLM Call Syntax:** `propertiesService.setObjectProperty(key, object);`
- **Pure JSDoc:**
```javascript
/**
   * @description Managed JSON storage with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @param {Object} object Entity to serialize.
   * @throws {TypeError} On circular references.
   */
```
---
#### METHOD: PropertiesService.getObjectProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getObjectProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves deserialized entity with automatic ISO date revival.
   * @param {string} key Property identifier.
   * @returns {Object|null} Deserialized entity with revived Date objects.
   */
```
---
#### METHOD: PropertiesService._dateReviver
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService._dateReviver(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description JSON reviver for ISO 8601 string-to-Date conversion.
   * @param {string} key Current property key.
   * @param {*} value Current property value.
   * @returns {Date|*} Revived Date or original value.
   */
```
---
#### METHOD: PropertiesService.hasProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.hasProperty(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if a property exists in the current scope.
   * @param {string} key Property identifier.
   * @returns {boolean}
   */
```
---
#### METHOD: PropertiesService.getPropertyOrDefault
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getPropertyOrDefault(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value with a fallback if missing.
   * @param {string} key Property identifier.
   * @param {string} defaultValue Fallback value.
   * @returns {string}
   */
```
---
#### METHOD: PropertiesService.updatePropertyIfExists
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.updatePropertyIfExists(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Updates a property only if it exists.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value New data.
   * @returns {boolean} True if updated.
   */
```
---
#### METHOD: PropertiesService.setPropertyIfNotExists
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.setPropertyIfNotExists(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a property only if it does not exist.
   * @param {string} key Property identifier.
   * @param {string|number|boolean} value Data to store.
   * @returns {boolean} True if created.
   */
```
---
#### METHOD: PropertiesService.getNumericProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getNumericProperty(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value as a number.
   * @param {string} key Property identifier.
   * @param {number} [defaultValue=0] Fallback if missing or NaN.
   * @returns {number}
   */
```
---
#### METHOD: PropertiesService.getBooleanProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = propertiesService.getBooleanProperty(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves property value as a boolean. Maps 'true', '1', 'yes' to true.
   * @param {string} key Property identifier.
   * @param {boolean} [defaultValue=false] Fallback if missing.
   * @returns {boolean}
   */
```
---
#### METHOD: PropertiesService.getScriptProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getScriptProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS script properties.
   * Preserves backward compatibility with code that calls
   * PropertiesService.getScriptProperties() expecting the native GAS API pattern.
   * @returns {Object} Native GAS script properties
   */
```
---
#### METHOD: PropertiesService.getUserProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getUserProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS user properties.
   * @returns {Object} Native GAS user properties
   */
```
---
#### METHOD: PropertiesService.getDocumentProperties
- **Scope:** static
- **LLM Call Syntax:** `const result = PropertiesService.getDocumentProperties();`
- **Pure JSDoc:**
```javascript
/**
   * Static method providing direct access to native GAS document properties.
   * @returns {Object} Native GAS document properties
   */
```
---
<br>

## CLASS: PermissionService
**File Path:** `GoogleApiWrapper/src/services/PermissionService.js`
**Constructor Usage:** `const instance = new PermissionService();`
**Description:** Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.

### Raw JSDoc Context:
```javascript
/**
 * @class PermissionService
 * @extends GoogleService
 * @description Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.
 */
```

### Methods of PermissionService

#### METHOD: PermissionService.shareWithUsers
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.shareWithUsers(fileIds, permissions, options, options.sendNotificationEmail);`
- **Pure JSDoc:**
```javascript
/**
   * @description Grants access to user(s) for file(s) in batch. Supports 'user', 'group', and 'domain' types. Notifications disabled by default.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {Object|Object[]} permissions Access parameters {email, role, type, sendEmail}.
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.sendNotificationEmail=false] Global notification toggle.
   * @returns {Object} Result summary {successful: Array<{fileId, permission, statusCode}>, failed: Array<{fileId, error, statusCode}>}.
   * @throws {Error} If Drive API is disabled.
   */
```
---
#### METHOD: PermissionService.removeAccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.removeAccess(fileIds, emailsOrPermissionIds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Revokes access for user(s) from file(s) in batch. Auto-resolves emails to permission IDs.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string|string[]} emailsOrPermissionIds Identifiers for removal.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.changeRoles
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.changeRoles(fileIds, roleChanges, options, fileIds, roleChanges);`
- **Pure JSDoc:**
```javascript
/**
   * Changes role(s) for existing permission(s) in batch.
   *
   * This method updates access levels for users who already have permissions on files.
   * It's more efficient than removing and re-adding permissions, as it preserves
   * the permission ID and other metadata.
   *
   * ## Behavior
   *
   * - **Existing Permissions Only**: Only updates users who currently have access
   * - **Email Resolution**: Automatically resolves emails to permission IDs via getPermissions()
   * - **Batch Processing**: Updates multiple roles in single batch request
   * - **Cache Invalidation**: Clears permission cache for all affected files
   * - **Graceful Failures**: Logs warning if email not found, continues with valid updates
   *
   * ## Common Use Cases
   *
   * - Promote user from reader to writer
   * - Demote user from writer to reader
   * - Grant commenter access to existing reader
   * - Bulk role updates after organizational changes
   *
   * ## Available Roles
   *
   * - **reader**: Can view and download
   * - **writer**: Can view, download, and edit
   * - **commenter**: Can view and add comments (Docs/Sheets only)
   * - **owner**: Full control (use transferOwnership() instead)
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {Object|Object[]} roleChanges - Role change(s)
   *   Each object: `{ email: string, newRole: 'reader'|'writer'|'commenter' }`
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {Object} Results object with categorized outcomes
   * @returns {Array<Object>} return.successful - Successfully updated permissions
   *   Each: `{ fileId, permissionId, oldRole, newRole, statusCode: 200 }`
   * @returns {Array<Object>} return.failed - Failed update operations
   *   Each: `{ fileId, email, error: {...}, statusCode: 4xx/5xx }`
   *
   * @throws {Error} If Drive Advanced API is not enabled
   *
   * @example
   * // Promote single user to writer
   * const result = permissions.changeRoles('fileId', {
   *   email: 'user@example.com',
   *   newRole: 'writer'
   * });
   * // User can now edit the file
   *
   * @example
   * // Change multiple user roles on single file
   * permissions.changeRoles('fileId', [
   *   { email: 'user1@example.com', newRole: 'writer' },   // Promote to editor
   *   { email: 'user2@example.com', newRole: 'reader' },   // Demote to viewer
   *   { email: 'user3@example.com', newRole: 'commenter' } // Grant commenting
   * ]);
   * // Result: 3 role updates in 1 batch request
   *
   * @example
   * // Change single user role across multiple files
   * permissions.changeRoles(
   *   ['file1', 'file2', 'file3'],
   *   { email: 'user@example.com', newRole: 'writer' }
   * );
   * // User becomes writer on all 3 files
   *
   * @example
   * // Bulk role changes across files and users
   * permissions.changeRoles(
   *   ['file1', 'file2'],
   *   [
   *     { email: 'user1@example.com', newRole: 'writer' },
   *     { email: 'user2@example.com', newRole: 'reader' }
   *   ]
   * );
   * // Result: 4 role updates (2 files × 2 users) in 1 batch request
   *
   * @example
   * // Demote all external users to readers (org restructure)
   * const fileIds = ['file1', 'file2', 'file3'];
   * const externalUsers = [
   *   { email: 'contractor1@external.com', newRole: 'reader' },
   *   { email: 'contractor2@external.com', newRole: 'reader' },
   *   { email: 'vendor@external.com', newRole: 'reader' }
   * ];
   *
   * permissions.changeRoles(fileIds, externalUsers);
   * // All external users demoted to read-only across all files
   *
   * @example
   * // Handle non-existent permission (graceful failure)
   * const result = permissions.changeRoles('fileId', {
   *   email: 'nonexistent@example.com',
   *   newRole: 'writer'
   * });
   * // Logs warning: "Permission not found for nonexistent@example.com on fileId"
   * // Returns: { successful: [], failed: [] } (no operations performed)
   *
   * @example
   * // Grant editing rights to team after review phase
   * const reportFiles = ['report1', 'report2', 'report3'];
   * const teamMembers = [
   *   { email: 'alice@example.com', newRole: 'writer' },
   *   { email: 'bob@example.com', newRole: 'writer' },
   *   { email: 'carol@example.com', newRole: 'writer' }
   * ];
   *
  /**
   * @description Updates access levels for existing permissions in batch. Auto-resolves emails to permission IDs.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {Object|Object[]} roleChanges Collection of {email, newRole}.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.changeRolesByPermissionId
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.changeRolesByPermissionId(fileIds, roleChanges, _options);`
- **Pure JSDoc:**
```javascript
/**
   * Changes roles addressed by PERMISSION ID rather than by email.
   *
   * `changeRoles` resolves each change through `emailAddress`, so grants that
   * have no email — `type: 'anyone'` (link sharing) and `type: 'domain'` —
   * are unreachable through it. Callers that enumerate permissions themselves
   * (e.g. "downgrade every writer on this file") use this method.
   *
   * @param {string|string[]} fileIds
   * @param {{permissionId: string, newRole: string}|Array<{permissionId: string, newRole: string}>} roleChanges
   * @param {Object} [_options]
   * @returns {{successful: Array<Object>, failed: Array<Object>}}
   */
```
---
#### METHOD: PermissionService.transferOwnership
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.transferOwnership(fileIds, newOwnerEmails, options, options.sendNotificationEmail, fileIds, newOwnerEmails, options);`
- **Pure JSDoc:**
```javascript
/**
   * Transfers ownership of file(s) to user(s) in batch with NO email notifications.
   *
   * This method transfers file ownership to new owner(s). Ownership transfer is a special
   * permission operation that automatically:
   * - Grants 'owner' role to new owner
   * - Demotes current owner to 'writer' role (if applicable)
   * - Transfers all ownership responsibilities
   *
   * ## Behavior
   *
   * - **Batch Processing**: Transfer multiple files to one or more owners
   * - **Email Control**: NO emails sent by default (GAW-HIGH-001)
   * - **Cache Invalidation**: Clears permission cache for all affected files
   * - **Auto Role Change**: Previous owner becomes writer automatically
   * - **Domain Restrictions**: New owner must be in same domain (Google Workspace)
   *
   * ## Important Considerations
   *
   * **Ownership Requirements**:
   * - Only current owner can transfer ownership
   * - New owner must have Google account
   * - New owner must be in same domain (Workspace) or file must allow external sharing
   * - New owner automatically gets 'owner' role
   * - Previous owner typically becomes 'writer' (Google Drive behavior)
   *
   * **Irreversible Action**:
   * - Ownership transfer cannot be undone programmatically
   * - New owner must manually transfer back
   * - Be cautious with batch transfers
   *
   * ## When to Use
   *
   * - Employee departure (transfer their files to manager)
   * - Project handoff (transfer project files to new lead)
   * - Organizational restructuring
   * - Automated file ownership management
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {string|string[]} newOwnerEmails - New owner email(s)
   *   Must be valid Google account email(s)
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.sendNotificationEmail=false] - Override to enable email
   *
   * @returns {Object} Results object with categorized outcomes
   * @returns {Array<Object>} return.successful - Successfully transferred ownership
   *   Each: `{ fileId, newOwnerEmail, statusCode: 200 }`
   * @returns {Array<Object>} return.failed - Failed transfer operations
   *   Each: `{ fileId, newOwnerEmail, error: {...}, statusCode: 4xx/5xx }`
   *
   * @throws {Error} If Drive Advanced API is not enabled
   * @throws {Error} If not current owner of the file
   * @throws {Error} If new owner is in different domain (Workspace)
   *
   * @example
   * // Transfer single file to new owner (no email notification)
   * const result = permissions.transferOwnership(
   *   'fileId123',
   *   'newowner@example.com'
   * );
   * // Result: newowner@example.com is now the owner
   *
   * @example
   * // Transfer multiple files to same new owner
   * permissions.transferOwnership(
   *   ['file1', 'file2', 'file3'],
   *   'newowner@example.com'
   * );
   * // All 3 files transferred to newowner@example.com in 1 batch
   *
   * @example
   * // Transfer with email notification
   * permissions.transferOwnership(
   *   'fileId',
   *   'newowner@example.com',
   *   { sendNotificationEmail: true }
   * );
   * // New owner receives email about ownership transfer
   *
   * @example
   * // Employee departure - transfer all their files to manager
   * const departingEmployee = 'john@example.com';
   * const manager = 'manager@example.com';
   *
   * // Find all files owned by departing employee
   * const ownedFiles = driveService.searchFiles(
   *   `'${departingEmployee}' in owners`
   * );
   * const fileIds = ownedFiles.map(f => f.id);
   *
   * // Transfer ownership to manager
   * const result = permissions.transferOwnership(fileIds, manager);
   *
   * console.log(`Transferred ${result.successful.length} files`);
   * console.log(`Failed: ${result.failed.length} files`);
   *
   * @example
   * // Project handoff - transfer project folder contents
   * const projectFolderId = 'folderId123';
   * const newProjectLead = 'newlead@example.com';
   *
   * // Get all files in project folder
   * const projectFiles = driveService.searchFiles(
   *   `'${projectFolderId}' in parents and trashed = false`
   * );
   * const fileIds = projectFiles.map(f => f.id);
   *
   * // Transfer ownership of all project files
   * permissions.transferOwnership(fileIds, newProjectLead, {
   *   sendNotificationEmail: true  // Notify new lead
   * });
   *
   * @example
   * // Handle transfer failures (domain restrictions)
   * const result = permissions.transferOwnership(
   *   'fileId',
   *   'external@differentdomain.com'  // Different domain
   * );
   *
  /**
   * @description Transfers resource ownership to new user(s). Previous owner becomes 'writer'.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string|string[]} newOwnerEmails Target owner email(s).
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.getPermissions
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.getPermissions(fileIds, options, fileIds);`
- **Pure JSDoc:**
```javascript
/**
   * Gets permissions for file(s) in batch with intelligent caching.
   *
   * This method retrieves permission lists for files, automatically leveraging cache
   * for recently-accessed files and batching API calls for uncached files.
   *
   * ## Behavior
   *
   * - **Cache-First**: Checks cache before making API calls
   * - **Batch Uncached**: Single batch request for all uncached files
   * - **5-Minute Cache**: Permission lists cached for 300 seconds
   * - **Automatic Parsing**: Returns parsed permission objects (not raw API response)
   * - **Flexible Return**: Single array for single file, map for multiple files
   *
   * ## Permission Object Structure
   *
   * Each permission in the returned array contains:
   * - **id**: Permission ID (use for direct deletion/updates)
   * - **emailAddress**: User's email (if user/group type)
   * - **role**: Access level - 'owner', 'writer', 'reader', 'commenter'
   * - **type**: Permission type - 'user', 'group', 'domain', 'anyone'
   * - **domain**: Domain name (if domain type)
   *
   * ## Cache Behavior
   *
   * - **Cache Hit**: Returns immediately (no API call)
   * - **Cache Miss**: Fetches from API, caches for 5 minutes
   * - **Cache Invalidation**: Automatic on share/remove/change/transfer operations
   *
   * ## Performance
   *
   * - 1 file (cached): ~1ms (cache lookup)
   * - 1 file (uncached): ~200ms (API call)
   * - 10 files (all uncached): ~300ms (1 batch request)
   * - 10 files (all cached): ~10ms (10 cache lookups)
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {Array<Object>|Object<string, Array<Object>>} Permission list or file ID map
   *   - Single file ID input: Returns `Array<Permission>` directly
   *   - Multiple file IDs input: Returns `Object<fileId, Array<Permission>>`
   *
   * @example
   * // Get permissions for single file
   * const perms = permissions.getPermissions('fileId123');
   * // Returns: [
   * //   { id: 'perm1', emailAddress: 'user1@example.com', role: 'writer', type: 'user' },
   * //   { id: 'perm2', emailAddress: 'user2@example.com', role: 'reader', type: 'user' },
   * //   { id: 'anyoneWithLink', role: 'reader', type: 'anyone' }
   * // ]
   *
   * @example
   * // Get permissions for multiple files (returns map)
   * const permsMap = permissions.getPermissions(['fileId1', 'fileId2']);
   * // Returns: {
   * //   'fileId1': [{ id: '...', emailAddress: '...', role: '...', type: '...' }, ...],
   * //   'fileId2': [{ id: '...', emailAddress: '...', role: '...', type: '...' }, ...]
   * // }
   *
   * @example
   * // Find all users with writer access
   * const perms = permissions.getPermissions('fileId');
   * const writers = perms.filter(p => p.role === 'writer' && p.type === 'user');
   *
   * writers.forEach(writer => {
   *   console.log(`Writer: ${writer.emailAddress}`);
   * });
   *
   * @example
   * // Check if file is publicly accessible
   * const perms = permissions.getPermissions('fileId');
   * const isPublic = perms.some(p => p.type === 'anyone');
   *
   * if (isPublic) {
   *   console.log('File has public link sharing enabled');
   * }
   *
   * @example
   * // Audit permissions across multiple files
   * const fileIds = ['file1', 'file2', 'file3'];
   * const permsMap = permissions.getPermissions(fileIds);
   *
   * Object.entries(permsMap).forEach(([fileId, perms]) => {
   *   console.log(`\nFile: ${fileId}`);
   *   console.log(`  Total permissions: ${perms.length}`);
   *   console.log(`  Writers: ${perms.filter(p => p.role === 'writer').length}`);
   *   console.log(`  Readers: ${perms.filter(p => p.role === 'reader').length}`);
   * });
   *
   * @example
   * // Extract permission IDs for batch deletion
   * const perms = permissions.getPermissions('fileId');
   * const externalPermIds = perms
   *   .filter(p => p.emailAddress && !p.emailAddress.endsWith('@example.com'))
   *   .map(p => p.id);
   *
   * // Remove all external users
   * permissions.removeAccess('fileId', externalPermIds);
   *
   * @example
   * // Check domain-wide access
   * const perms = permissions.getPermissions('fileId');
   * const domainPerm = perms.find(p => p.type === 'domain');
   *
  /**
   * @description Retrieves permission metadata with 5-minute intelligent caching.
   * @param {string|string[]} fileIds Resource ID(s).
   * @returns {Object[]|Object<string, Object[]>} Collection of permissions (single) or ID-to-Permissions map (batch).
   */
```
---
#### METHOD: PermissionService.getSharingLink
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.getSharingLink(fileIds, accessType, options, fileIds, accessType);`
- **Pure JSDoc:**
```javascript
/**
   * Generates shareable "anyone with link" URLs for file(s) with NO email notifications.
   *
   * This method creates or updates the 'anyone' permission on files to enable link sharing,
   * then returns the shareable URLs. It's ideal for sharing files publicly or with large
   * groups without needing individual email addresses.
   *
   * ## Behavior
   *
   * - **Auto Permission**: Creates 'anyone' permission if not exists
   * - **Role Update**: Updates existing 'anyone' permission if role differs
   * - **Batch Processing**: Generates links for multiple files in one batch
   * - **Email Control**: NO emails sent when creating/updating 'anyone' permission
   * - **Link Types**: Supports view, edit, and comment links
   *
   * ## Access Types
   *
   * - **view**: Anyone with link can view and download (role: 'reader')
   * - **edit**: Anyone with link can edit (role: 'writer')
   * - **comment**: Anyone with link can comment (role: 'commenter', Docs/Sheets only)
   *
   * ## Two-Step Process
   *
   * 1. **Ensure Permission**: Creates/updates 'anyone' permission with correct role
   * 2. **Get Link**: Retrieves webViewLink from file metadata
   *
   * ## Security Considerations
   *
   * - Link sharing bypasses all email-based permissions
   * - Anyone with the URL can access (even without Google account)
   * - Consider using expiration or restricting to domain for sensitive files
   * - Links remain valid until permission is removed
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {string} [accessType='view'] - Access type for the link
   *   Options: 'view', 'edit', 'comment'
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {string|Object<string, string>} Shareable link or file ID map
   *   - Single file ID input: Returns URL string directly
   *   - Multiple file IDs input: Returns `Object<fileId, URL>`
   *
   * @example
   * // Get view link for single file
   * const link = permissions.getSharingLink('fileId123', 'view');
   * // Returns: 'https://drive.google.com/file/d/fileId123/view?usp=sharing'
   *
   * @example
   * // Get edit link for spreadsheet
   * const editLink = permissions.getSharingLink('spreadsheetId', 'edit');
   * // Anyone with link can now edit the spreadsheet
   *
   * @example
   * // Get comment link for document
   * const commentLink = permissions.getSharingLink('docId', 'comment');
   * // Anyone with link can add comments but not edit
   *
   * @example
   * // Get links for multiple files
   * const links = permissions.getSharingLink(['file1', 'file2', 'file3'], 'view');
   * // Returns: {
   * //   'file1': 'https://drive.google.com/file/d/file1/view?usp=sharing',
   * //   'file2': 'https://drive.google.com/file/d/file2/view?usp=sharing',
   * //   'file3': 'https://drive.google.com/file/d/file3/view?usp=sharing'
   * // }
   *
   * @example
   * // Share presentation for public viewing
   * const presentationId = 'abc123';
   * const link = permissions.getSharingLink(presentationId, 'view');
   *
   * // Distribute link via email, Slack, etc.
   * console.log(`View the presentation: ${link}`);
   *
   * @example
   * // Enable collaborative editing on multiple documents
   * const docIds = ['doc1', 'doc2', 'doc3'];
   * const editLinks = permissions.getSharingLink(docIds, 'edit');
   *
   * Object.entries(editLinks).forEach(([docId, link]) => {
   *   console.log(`Edit ${docId}: ${link}`);
   * });
   *
   * @example
   * // Change existing link from view-only to editable
   * const fileId = 'existingFile';
   *
   * // First, file had view link
   * const viewLink = permissions.getSharingLink(fileId, 'view');
   *
   * // Later, upgrade to edit link (updates 'anyone' permission role)
   * const editLink = permissions.getSharingLink(fileId, 'edit');
   *
   * // Same URL, but now grants edit access instead of view
   *
   * @example
   * // Disable link sharing (remove 'anyone' permission)
   * const fileId = 'publicFile';
   *
   * // First, get current permissions
   * const perms = permissions.getPermissions(fileId);
   * const anyonePerm = perms.find(p => p.type === 'anyone');
   *
   * if (anyonePerm) {
   *   // Remove 'anyone' permission to disable link sharing
   *   permissions.removeAccess(fileId, anyonePerm.id);
   *   console.log('Link sharing disabled');
   * }
   *
   * @example
   * // Generate QR codes for file links
   * const fileIds = ['menu', 'flyer', 'brochure'];
   * const links = permissions.getSharingLink(fileIds, 'view');
   *
  /**
   * @description Generates "anyone with link" URLs. Creates/updates 'anyone' permissions as needed.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string} [accessType='view'] Access level ('view', 'edit', 'comment').
   * @returns {string|Object<string, string>} URL (single) or ID-to-URL map (batch).
   */
```
---
#### METHOD: PermissionService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: PermissionService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: PermissionService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: PermissionService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `permissionService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: PermissionService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: PermissionService
**File Path:** `GoogleApiWrapper/src/services/PermissionService.js`
**Constructor Usage:** `const instance = new PermissionService(logger, cache, utils, exceptionService);`
**Description:** Initializes PermissionService with standard GAS service dependencies.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes PermissionService with standard GAS service dependencies.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {Cache} cache Persistence provider for permission metadata.
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider.
   */
```

### Methods of PermissionService

#### METHOD: PermissionService.shareWithUsers
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.shareWithUsers(fileIds, permissions, options, options.sendNotificationEmail);`
- **Pure JSDoc:**
```javascript
/**
   * @description Grants access to user(s) for file(s) in batch. Supports 'user', 'group', and 'domain' types. Notifications disabled by default.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {Object|Object[]} permissions Access parameters {email, role, type, sendEmail}.
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.sendNotificationEmail=false] Global notification toggle.
   * @returns {Object} Result summary {successful: Array<{fileId, permission, statusCode}>, failed: Array<{fileId, error, statusCode}>}.
   * @throws {Error} If Drive API is disabled.
   */
```
---
#### METHOD: PermissionService.removeAccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.removeAccess(fileIds, emailsOrPermissionIds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Revokes access for user(s) from file(s) in batch. Auto-resolves emails to permission IDs.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string|string[]} emailsOrPermissionIds Identifiers for removal.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.changeRoles
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.changeRoles(fileIds, roleChanges, options, fileIds, roleChanges);`
- **Pure JSDoc:**
```javascript
/**
   * Changes role(s) for existing permission(s) in batch.
   *
   * This method updates access levels for users who already have permissions on files.
   * It's more efficient than removing and re-adding permissions, as it preserves
   * the permission ID and other metadata.
   *
   * ## Behavior
   *
   * - **Existing Permissions Only**: Only updates users who currently have access
   * - **Email Resolution**: Automatically resolves emails to permission IDs via getPermissions()
   * - **Batch Processing**: Updates multiple roles in single batch request
   * - **Cache Invalidation**: Clears permission cache for all affected files
   * - **Graceful Failures**: Logs warning if email not found, continues with valid updates
   *
   * ## Common Use Cases
   *
   * - Promote user from reader to writer
   * - Demote user from writer to reader
   * - Grant commenter access to existing reader
   * - Bulk role updates after organizational changes
   *
   * ## Available Roles
   *
   * - **reader**: Can view and download
   * - **writer**: Can view, download, and edit
   * - **commenter**: Can view and add comments (Docs/Sheets only)
   * - **owner**: Full control (use transferOwnership() instead)
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {Object|Object[]} roleChanges - Role change(s)
   *   Each object: `{ email: string, newRole: 'reader'|'writer'|'commenter' }`
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {Object} Results object with categorized outcomes
   * @returns {Array<Object>} return.successful - Successfully updated permissions
   *   Each: `{ fileId, permissionId, oldRole, newRole, statusCode: 200 }`
   * @returns {Array<Object>} return.failed - Failed update operations
   *   Each: `{ fileId, email, error: {...}, statusCode: 4xx/5xx }`
   *
   * @throws {Error} If Drive Advanced API is not enabled
   *
   * @example
   * // Promote single user to writer
   * const result = permissions.changeRoles('fileId', {
   *   email: 'user@example.com',
   *   newRole: 'writer'
   * });
   * // User can now edit the file
   *
   * @example
   * // Change multiple user roles on single file
   * permissions.changeRoles('fileId', [
   *   { email: 'user1@example.com', newRole: 'writer' },   // Promote to editor
   *   { email: 'user2@example.com', newRole: 'reader' },   // Demote to viewer
   *   { email: 'user3@example.com', newRole: 'commenter' } // Grant commenting
   * ]);
   * // Result: 3 role updates in 1 batch request
   *
   * @example
   * // Change single user role across multiple files
   * permissions.changeRoles(
   *   ['file1', 'file2', 'file3'],
   *   { email: 'user@example.com', newRole: 'writer' }
   * );
   * // User becomes writer on all 3 files
   *
   * @example
   * // Bulk role changes across files and users
   * permissions.changeRoles(
   *   ['file1', 'file2'],
   *   [
   *     { email: 'user1@example.com', newRole: 'writer' },
   *     { email: 'user2@example.com', newRole: 'reader' }
   *   ]
   * );
   * // Result: 4 role updates (2 files × 2 users) in 1 batch request
   *
   * @example
   * // Demote all external users to readers (org restructure)
   * const fileIds = ['file1', 'file2', 'file3'];
   * const externalUsers = [
   *   { email: 'contractor1@external.com', newRole: 'reader' },
   *   { email: 'contractor2@external.com', newRole: 'reader' },
   *   { email: 'vendor@external.com', newRole: 'reader' }
   * ];
   *
   * permissions.changeRoles(fileIds, externalUsers);
   * // All external users demoted to read-only across all files
   *
   * @example
   * // Handle non-existent permission (graceful failure)
   * const result = permissions.changeRoles('fileId', {
   *   email: 'nonexistent@example.com',
   *   newRole: 'writer'
   * });
   * // Logs warning: "Permission not found for nonexistent@example.com on fileId"
   * // Returns: { successful: [], failed: [] } (no operations performed)
   *
   * @example
   * // Grant editing rights to team after review phase
   * const reportFiles = ['report1', 'report2', 'report3'];
   * const teamMembers = [
   *   { email: 'alice@example.com', newRole: 'writer' },
   *   { email: 'bob@example.com', newRole: 'writer' },
   *   { email: 'carol@example.com', newRole: 'writer' }
   * ];
   *
  /**
   * @description Updates access levels for existing permissions in batch. Auto-resolves emails to permission IDs.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {Object|Object[]} roleChanges Collection of {email, newRole}.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.changeRolesByPermissionId
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.changeRolesByPermissionId(fileIds, roleChanges, _options);`
- **Pure JSDoc:**
```javascript
/**
   * Changes roles addressed by PERMISSION ID rather than by email.
   *
   * `changeRoles` resolves each change through `emailAddress`, so grants that
   * have no email — `type: 'anyone'` (link sharing) and `type: 'domain'` —
   * are unreachable through it. Callers that enumerate permissions themselves
   * (e.g. "downgrade every writer on this file") use this method.
   *
   * @param {string|string[]} fileIds
   * @param {{permissionId: string, newRole: string}|Array<{permissionId: string, newRole: string}>} roleChanges
   * @param {Object} [_options]
   * @returns {{successful: Array<Object>, failed: Array<Object>}}
   */
```
---
#### METHOD: PermissionService.transferOwnership
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.transferOwnership(fileIds, newOwnerEmails, options, options.sendNotificationEmail, fileIds, newOwnerEmails, options);`
- **Pure JSDoc:**
```javascript
/**
   * Transfers ownership of file(s) to user(s) in batch with NO email notifications.
   *
   * This method transfers file ownership to new owner(s). Ownership transfer is a special
   * permission operation that automatically:
   * - Grants 'owner' role to new owner
   * - Demotes current owner to 'writer' role (if applicable)
   * - Transfers all ownership responsibilities
   *
   * ## Behavior
   *
   * - **Batch Processing**: Transfer multiple files to one or more owners
   * - **Email Control**: NO emails sent by default (GAW-HIGH-001)
   * - **Cache Invalidation**: Clears permission cache for all affected files
   * - **Auto Role Change**: Previous owner becomes writer automatically
   * - **Domain Restrictions**: New owner must be in same domain (Google Workspace)
   *
   * ## Important Considerations
   *
   * **Ownership Requirements**:
   * - Only current owner can transfer ownership
   * - New owner must have Google account
   * - New owner must be in same domain (Workspace) or file must allow external sharing
   * - New owner automatically gets 'owner' role
   * - Previous owner typically becomes 'writer' (Google Drive behavior)
   *
   * **Irreversible Action**:
   * - Ownership transfer cannot be undone programmatically
   * - New owner must manually transfer back
   * - Be cautious with batch transfers
   *
   * ## When to Use
   *
   * - Employee departure (transfer their files to manager)
   * - Project handoff (transfer project files to new lead)
   * - Organizational restructuring
   * - Automated file ownership management
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {string|string[]} newOwnerEmails - New owner email(s)
   *   Must be valid Google account email(s)
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.sendNotificationEmail=false] - Override to enable email
   *
   * @returns {Object} Results object with categorized outcomes
   * @returns {Array<Object>} return.successful - Successfully transferred ownership
   *   Each: `{ fileId, newOwnerEmail, statusCode: 200 }`
   * @returns {Array<Object>} return.failed - Failed transfer operations
   *   Each: `{ fileId, newOwnerEmail, error: {...}, statusCode: 4xx/5xx }`
   *
   * @throws {Error} If Drive Advanced API is not enabled
   * @throws {Error} If not current owner of the file
   * @throws {Error} If new owner is in different domain (Workspace)
   *
   * @example
   * // Transfer single file to new owner (no email notification)
   * const result = permissions.transferOwnership(
   *   'fileId123',
   *   'newowner@example.com'
   * );
   * // Result: newowner@example.com is now the owner
   *
   * @example
   * // Transfer multiple files to same new owner
   * permissions.transferOwnership(
   *   ['file1', 'file2', 'file3'],
   *   'newowner@example.com'
   * );
   * // All 3 files transferred to newowner@example.com in 1 batch
   *
   * @example
   * // Transfer with email notification
   * permissions.transferOwnership(
   *   'fileId',
   *   'newowner@example.com',
   *   { sendNotificationEmail: true }
   * );
   * // New owner receives email about ownership transfer
   *
   * @example
   * // Employee departure - transfer all their files to manager
   * const departingEmployee = 'john@example.com';
   * const manager = 'manager@example.com';
   *
   * // Find all files owned by departing employee
   * const ownedFiles = driveService.searchFiles(
   *   `'${departingEmployee}' in owners`
   * );
   * const fileIds = ownedFiles.map(f => f.id);
   *
   * // Transfer ownership to manager
   * const result = permissions.transferOwnership(fileIds, manager);
   *
   * console.log(`Transferred ${result.successful.length} files`);
   * console.log(`Failed: ${result.failed.length} files`);
   *
   * @example
   * // Project handoff - transfer project folder contents
   * const projectFolderId = 'folderId123';
   * const newProjectLead = 'newlead@example.com';
   *
   * // Get all files in project folder
   * const projectFiles = driveService.searchFiles(
   *   `'${projectFolderId}' in parents and trashed = false`
   * );
   * const fileIds = projectFiles.map(f => f.id);
   *
   * // Transfer ownership of all project files
   * permissions.transferOwnership(fileIds, newProjectLead, {
   *   sendNotificationEmail: true  // Notify new lead
   * });
   *
   * @example
   * // Handle transfer failures (domain restrictions)
   * const result = permissions.transferOwnership(
   *   'fileId',
   *   'external@differentdomain.com'  // Different domain
   * );
   *
  /**
   * @description Transfers resource ownership to new user(s). Previous owner becomes 'writer'.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string|string[]} newOwnerEmails Target owner email(s).
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary.
   */
```
---
#### METHOD: PermissionService.getPermissions
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.getPermissions(fileIds, options, fileIds);`
- **Pure JSDoc:**
```javascript
/**
   * Gets permissions for file(s) in batch with intelligent caching.
   *
   * This method retrieves permission lists for files, automatically leveraging cache
   * for recently-accessed files and batching API calls for uncached files.
   *
   * ## Behavior
   *
   * - **Cache-First**: Checks cache before making API calls
   * - **Batch Uncached**: Single batch request for all uncached files
   * - **5-Minute Cache**: Permission lists cached for 300 seconds
   * - **Automatic Parsing**: Returns parsed permission objects (not raw API response)
   * - **Flexible Return**: Single array for single file, map for multiple files
   *
   * ## Permission Object Structure
   *
   * Each permission in the returned array contains:
   * - **id**: Permission ID (use for direct deletion/updates)
   * - **emailAddress**: User's email (if user/group type)
   * - **role**: Access level - 'owner', 'writer', 'reader', 'commenter'
   * - **type**: Permission type - 'user', 'group', 'domain', 'anyone'
   * - **domain**: Domain name (if domain type)
   *
   * ## Cache Behavior
   *
   * - **Cache Hit**: Returns immediately (no API call)
   * - **Cache Miss**: Fetches from API, caches for 5 minutes
   * - **Cache Invalidation**: Automatic on share/remove/change/transfer operations
   *
   * ## Performance
   *
   * - 1 file (cached): ~1ms (cache lookup)
   * - 1 file (uncached): ~200ms (API call)
   * - 10 files (all uncached): ~300ms (1 batch request)
   * - 10 files (all cached): ~10ms (10 cache lookups)
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {Array<Object>|Object<string, Array<Object>>} Permission list or file ID map
   *   - Single file ID input: Returns `Array<Permission>` directly
   *   - Multiple file IDs input: Returns `Object<fileId, Array<Permission>>`
   *
   * @example
   * // Get permissions for single file
   * const perms = permissions.getPermissions('fileId123');
   * // Returns: [
   * //   { id: 'perm1', emailAddress: 'user1@example.com', role: 'writer', type: 'user' },
   * //   { id: 'perm2', emailAddress: 'user2@example.com', role: 'reader', type: 'user' },
   * //   { id: 'anyoneWithLink', role: 'reader', type: 'anyone' }
   * // ]
   *
   * @example
   * // Get permissions for multiple files (returns map)
   * const permsMap = permissions.getPermissions(['fileId1', 'fileId2']);
   * // Returns: {
   * //   'fileId1': [{ id: '...', emailAddress: '...', role: '...', type: '...' }, ...],
   * //   'fileId2': [{ id: '...', emailAddress: '...', role: '...', type: '...' }, ...]
   * // }
   *
   * @example
   * // Find all users with writer access
   * const perms = permissions.getPermissions('fileId');
   * const writers = perms.filter(p => p.role === 'writer' && p.type === 'user');
   *
   * writers.forEach(writer => {
   *   console.log(`Writer: ${writer.emailAddress}`);
   * });
   *
   * @example
   * // Check if file is publicly accessible
   * const perms = permissions.getPermissions('fileId');
   * const isPublic = perms.some(p => p.type === 'anyone');
   *
   * if (isPublic) {
   *   console.log('File has public link sharing enabled');
   * }
   *
   * @example
   * // Audit permissions across multiple files
   * const fileIds = ['file1', 'file2', 'file3'];
   * const permsMap = permissions.getPermissions(fileIds);
   *
   * Object.entries(permsMap).forEach(([fileId, perms]) => {
   *   console.log(`\nFile: ${fileId}`);
   *   console.log(`  Total permissions: ${perms.length}`);
   *   console.log(`  Writers: ${perms.filter(p => p.role === 'writer').length}`);
   *   console.log(`  Readers: ${perms.filter(p => p.role === 'reader').length}`);
   * });
   *
   * @example
   * // Extract permission IDs for batch deletion
   * const perms = permissions.getPermissions('fileId');
   * const externalPermIds = perms
   *   .filter(p => p.emailAddress && !p.emailAddress.endsWith('@example.com'))
   *   .map(p => p.id);
   *
   * // Remove all external users
   * permissions.removeAccess('fileId', externalPermIds);
   *
   * @example
   * // Check domain-wide access
   * const perms = permissions.getPermissions('fileId');
   * const domainPerm = perms.find(p => p.type === 'domain');
   *
  /**
   * @description Retrieves permission metadata with 5-minute intelligent caching.
   * @param {string|string[]} fileIds Resource ID(s).
   * @returns {Object[]|Object<string, Object[]>} Collection of permissions (single) or ID-to-Permissions map (batch).
   */
```
---
#### METHOD: PermissionService.getSharingLink
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService.getSharingLink(fileIds, accessType, options, fileIds, accessType);`
- **Pure JSDoc:**
```javascript
/**
   * Generates shareable "anyone with link" URLs for file(s) with NO email notifications.
   *
   * This method creates or updates the 'anyone' permission on files to enable link sharing,
   * then returns the shareable URLs. It's ideal for sharing files publicly or with large
   * groups without needing individual email addresses.
   *
   * ## Behavior
   *
   * - **Auto Permission**: Creates 'anyone' permission if not exists
   * - **Role Update**: Updates existing 'anyone' permission if role differs
   * - **Batch Processing**: Generates links for multiple files in one batch
   * - **Email Control**: NO emails sent when creating/updating 'anyone' permission
   * - **Link Types**: Supports view, edit, and comment links
   *
   * ## Access Types
   *
   * - **view**: Anyone with link can view and download (role: 'reader')
   * - **edit**: Anyone with link can edit (role: 'writer')
   * - **comment**: Anyone with link can comment (role: 'commenter', Docs/Sheets only)
   *
   * ## Two-Step Process
   *
   * 1. **Ensure Permission**: Creates/updates 'anyone' permission with correct role
   * 2. **Get Link**: Retrieves webViewLink from file metadata
   *
   * ## Security Considerations
   *
   * - Link sharing bypasses all email-based permissions
   * - Anyone with the URL can access (even without Google account)
   * - Consider using expiration or restricting to domain for sensitive files
   * - Links remain valid until permission is removed
   *
   * @param {string|string[]} fileIds - Single file ID or array of file IDs
   * @param {string} [accessType='view'] - Access type for the link
   *   Options: 'view', 'edit', 'comment'
   * @param {Object} [options={}] - Optional settings (reserved for future use)
   *
   * @returns {string|Object<string, string>} Shareable link or file ID map
   *   - Single file ID input: Returns URL string directly
   *   - Multiple file IDs input: Returns `Object<fileId, URL>`
   *
   * @example
   * // Get view link for single file
   * const link = permissions.getSharingLink('fileId123', 'view');
   * // Returns: 'https://drive.google.com/file/d/fileId123/view?usp=sharing'
   *
   * @example
   * // Get edit link for spreadsheet
   * const editLink = permissions.getSharingLink('spreadsheetId', 'edit');
   * // Anyone with link can now edit the spreadsheet
   *
   * @example
   * // Get comment link for document
   * const commentLink = permissions.getSharingLink('docId', 'comment');
   * // Anyone with link can add comments but not edit
   *
   * @example
   * // Get links for multiple files
   * const links = permissions.getSharingLink(['file1', 'file2', 'file3'], 'view');
   * // Returns: {
   * //   'file1': 'https://drive.google.com/file/d/file1/view?usp=sharing',
   * //   'file2': 'https://drive.google.com/file/d/file2/view?usp=sharing',
   * //   'file3': 'https://drive.google.com/file/d/file3/view?usp=sharing'
   * // }
   *
   * @example
   * // Share presentation for public viewing
   * const presentationId = 'abc123';
   * const link = permissions.getSharingLink(presentationId, 'view');
   *
   * // Distribute link via email, Slack, etc.
   * console.log(`View the presentation: ${link}`);
   *
   * @example
   * // Enable collaborative editing on multiple documents
   * const docIds = ['doc1', 'doc2', 'doc3'];
   * const editLinks = permissions.getSharingLink(docIds, 'edit');
   *
   * Object.entries(editLinks).forEach(([docId, link]) => {
   *   console.log(`Edit ${docId}: ${link}`);
   * });
   *
   * @example
   * // Change existing link from view-only to editable
   * const fileId = 'existingFile';
   *
   * // First, file had view link
   * const viewLink = permissions.getSharingLink(fileId, 'view');
   *
   * // Later, upgrade to edit link (updates 'anyone' permission role)
   * const editLink = permissions.getSharingLink(fileId, 'edit');
   *
   * // Same URL, but now grants edit access instead of view
   *
   * @example
   * // Disable link sharing (remove 'anyone' permission)
   * const fileId = 'publicFile';
   *
   * // First, get current permissions
   * const perms = permissions.getPermissions(fileId);
   * const anyonePerm = perms.find(p => p.type === 'anyone');
   *
   * if (anyonePerm) {
   *   // Remove 'anyone' permission to disable link sharing
   *   permissions.removeAccess(fileId, anyonePerm.id);
   *   console.log('Link sharing disabled');
   * }
   *
   * @example
   * // Generate QR codes for file links
   * const fileIds = ['menu', 'flyer', 'brochure'];
   * const links = permissions.getSharingLink(fileIds, 'view');
   *
  /**
   * @description Generates "anyone with link" URLs. Creates/updates 'anyone' permissions as needed.
   * @param {string|string[]} fileIds Resource ID(s).
   * @param {string} [accessType='view'] Access level ('view', 'edit', 'comment').
   * @returns {string|Object<string, string>} URL (single) or ID-to-URL map (batch).
   */
```
---
#### METHOD: PermissionService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: PermissionService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: PermissionService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: PermissionService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `permissionService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: PermissionService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = permissionService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: MailService
**File Path:** `GoogleApiWrapper/src/services/MailService.js`
**Constructor Usage:** `const instance = new MailService();`
**Description:** Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.

### Raw JSDoc Context:
```javascript
/**
 * @class MailService
 * @description Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {UtilsService} _utils Foundational utilities (requires sleep).
 * @property {ExceptionService} _exceptionService Resiliency provider.
 * @property {number} _rateLimitMs Throttling delay between sequential operations.
 */
```

### Methods of MailService

#### METHOD: MailService.getQuotaUsage
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.getQuotaUsage();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the remaining daily email quota for the current user.
   * @returns {number} Remaining email count.
   */
```
---
#### METHOD: MailService.send
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.send(emailOptions, emailOptions.to, emailOptions.subject, emailOptions.body, emailOptions.htmlBody, emailOptions.attachments);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sends a single email with resilient retry logic. Normalizes recipient arrays to comma-separated strings.
   * @param {Object} emailOptions Transmission parameters.
   * @param {string|string[]} emailOptions.to Primary recipient(s).
   * @param {string} emailOptions.subject Message subject.
   * @param {string} [emailOptions.body] Plain text content.
   * @param {string} [emailOptions.htmlBody] HTML content.
   * @param {BlobSource[]} [emailOptions.attachments] File attachments.
   * @returns {Object} Transmission result {success, error}.
   */
```
---
#### METHOD: MailService.sendBatch
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendBatch(emails);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sequentially transmits a collection of emails with inter-operation sleep.
   * @param {Object[]} emails Array of transmission parameters.
   * @returns {Object} Result summary {successful: Object[], failed: Array<{email, error}>}.
   */
```
---
#### METHOD: MailService.createDraft
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.createDraft(emailOptions);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a Gmail draft without transmission.
   * @param {Object} emailOptions Drafting parameters.
   * @returns {Object} Result {success, draftId, error}.
   */
```
---
#### METHOD: MailService.sendBulk
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendBulk(recipientData, bodyGenerator, subject, isHtml);`
- **Pure JSDoc:**
```javascript
/**
   * @description Transmits personalized emails generated via callback for each recipient.
   * @param {Object[]} recipientData Contextual data for body generation.
   * @param {Function} bodyGenerator Factory function: (recipient) => bodyContent.
   * @param {string} subject Uniform subject line.
   * @param {boolean} [isHtml=true] Toggle between HTML and plain text generation.
   * @returns {Object} Transmission summary {sent, failed, details}.
   */
```
---
#### METHOD: MailService.sendNotification
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendNotification(emails, title, message);`
- **Pure JSDoc:**
```javascript
/**
   * @description Transmits a standard HTML notification template.
   * @param {string|string[]} emails Target recipient(s).
   * @param {string} title Notification header.
   * @param {string} message Primary notification content.
   * @returns {Object} Transmission result.
   */
```
---
<br>

## CLASS: MailService
**File Path:** `GoogleApiWrapper/src/services/MailService.js`
**Constructor Usage:** `const instance = new MailService(logger, utils, exceptionService, options, options.rateLimitMs);`
**Description:** Initializes MailService with mandatory utilities and optional resiliency.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes MailService with mandatory utilities and optional resiliency.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {UtilsService} utils Foundational utilities (must provide sleep()).
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   * @param {Object} [options={}] Configuration overrides.
   * @param {number} [options.rateLimitMs=100] Sequential send delay.
   * @throws {Error} If utils.sleep is missing.
   */
```

### Methods of MailService

#### METHOD: MailService.getQuotaUsage
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.getQuotaUsage();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the remaining daily email quota for the current user.
   * @returns {number} Remaining email count.
   */
```
---
#### METHOD: MailService.send
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.send(emailOptions, emailOptions.to, emailOptions.subject, emailOptions.body, emailOptions.htmlBody, emailOptions.attachments);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sends a single email with resilient retry logic. Normalizes recipient arrays to comma-separated strings.
   * @param {Object} emailOptions Transmission parameters.
   * @param {string|string[]} emailOptions.to Primary recipient(s).
   * @param {string} emailOptions.subject Message subject.
   * @param {string} [emailOptions.body] Plain text content.
   * @param {string} [emailOptions.htmlBody] HTML content.
   * @param {BlobSource[]} [emailOptions.attachments] File attachments.
   * @returns {Object} Transmission result {success, error}.
   */
```
---
#### METHOD: MailService.sendBatch
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendBatch(emails);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sequentially transmits a collection of emails with inter-operation sleep.
   * @param {Object[]} emails Array of transmission parameters.
   * @returns {Object} Result summary {successful: Object[], failed: Array<{email, error}>}.
   */
```
---
#### METHOD: MailService.createDraft
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.createDraft(emailOptions);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a Gmail draft without transmission.
   * @param {Object} emailOptions Drafting parameters.
   * @returns {Object} Result {success, draftId, error}.
   */
```
---
#### METHOD: MailService.sendBulk
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendBulk(recipientData, bodyGenerator, subject, isHtml);`
- **Pure JSDoc:**
```javascript
/**
   * @description Transmits personalized emails generated via callback for each recipient.
   * @param {Object[]} recipientData Contextual data for body generation.
   * @param {Function} bodyGenerator Factory function: (recipient) => bodyContent.
   * @param {string} subject Uniform subject line.
   * @param {boolean} [isHtml=true] Toggle between HTML and plain text generation.
   * @returns {Object} Transmission summary {sent, failed, details}.
   */
```
---
#### METHOD: MailService.sendNotification
- **Scope:** instance
- **LLM Call Syntax:** `const result = mailService.sendNotification(emails, title, message);`
- **Pure JSDoc:**
```javascript
/**
   * @description Transmits a standard HTML notification template.
   * @param {string|string[]} emails Target recipient(s).
   * @param {string} title Notification header.
   * @param {string} message Primary notification content.
   * @returns {Object} Transmission result.
   */
```
---
<br>

## CLASS: LockService
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new LockService();`
**Description:** Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.

### Raw JSDoc Context:
```javascript
/**
 * @class LockService
 * @description Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _nativeLockService Reference to the global GAS LockService object.
 */
```

### Methods of LockService

#### METHOD: LockService.getScriptLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getScriptLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS Script Lock (global concurrency).
   * @returns {Lock|MockLock} Script lock implementation.
   */
```
---
#### METHOD: LockService.getUserLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getUserLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS User Lock (per-user concurrency).
   * @returns {Lock|MockLock} User lock implementation.
   */
```
---
#### METHOD: LockService.getDocumentLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getDocumentLock(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS Document Lock (per-document concurrency).
   * @param {string} documentId Target document identifier.
   * @returns {Lock|MockLock} Document lock implementation.
   */
```
---
<br>

## CLASS: LockService
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new LockService(logger);`
**Description:** Initializes LockService and auto-detects native GAS LockService availability.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes LockService and auto-detects native GAS LockService availability.
   * @param {LoggerService} logger Diagnostic logger.
   */
```

### Methods of LockService

#### METHOD: LockService.getScriptLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getScriptLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS Script Lock (global concurrency).
   * @returns {Lock|MockLock} Script lock implementation.
   */
```
---
#### METHOD: LockService.getUserLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getUserLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS User Lock (per-user concurrency).
   * @returns {Lock|MockLock} User lock implementation.
   */
```
---
#### METHOD: LockService.getDocumentLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lockService.getDocumentLock(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Lock wrapper for the GAS Document Lock (per-document concurrency).
   * @param {string} documentId Target document identifier.
   * @returns {Lock|MockLock} Document lock implementation.
   */
```
---
<br>

## CLASS: Lock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new Lock();`
**Description:** Wrapper for native GAS Lock object. Provides consistent acquisition status and diagnostic logging.

### Raw JSDoc Context:
```javascript
/**
 * @private
 * @class Lock
 * @description Wrapper for native GAS Lock object. Provides consistent acquisition status and diagnostic logging.
 *
 * @property {Object} _nativeLock Native GAS Lock instance.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {boolean} _acquired Current acquisition status.
 */
```

### Methods of Lock

#### METHOD: Lock.tryLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lock.tryLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Non-blocking attempt to acquire lock.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @returns {boolean} True if acquisition succeeded.
   * @throws {Error} On native acquisition failure.
   */
```
---
#### METHOD: Lock.waitLock
- **Scope:** instance
- **LLM Call Syntax:** `lock.waitLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Blocking attempt to acquire lock. Throws on timeout.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @throws {Error} If lock cannot be acquired within timeout.
   */
```
---
#### METHOD: Lock.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `lock.releaseLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Relinquishes held lock. No-op if not acquired.
   * @throws {Error} On native release failure.
   */
```
---
#### METHOD: Lock.hasLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lock.hasLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the local acquisition status of the lock.
   * @returns {boolean}
   */
```
---
<br>

## CLASS: Lock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new Lock(nativeLock, logger);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {GoogleAppsScript.Lock.Lock} nativeLock - Native GAS Lock object
   * @param {LoggerService} logger - Logger instance
   */
```

### Methods of Lock

#### METHOD: Lock.tryLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lock.tryLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Non-blocking attempt to acquire lock.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @returns {boolean} True if acquisition succeeded.
   * @throws {Error} On native acquisition failure.
   */
```
---
#### METHOD: Lock.waitLock
- **Scope:** instance
- **LLM Call Syntax:** `lock.waitLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Blocking attempt to acquire lock. Throws on timeout.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @throws {Error} If lock cannot be acquired within timeout.
   */
```
---
#### METHOD: Lock.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `lock.releaseLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Relinquishes held lock. No-op if not acquired.
   * @throws {Error} On native release failure.
   */
```
---
#### METHOD: Lock.hasLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = lock.hasLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the local acquisition status of the lock.
   * @returns {boolean}
   */
```
---
<br>

## CLASS: MockLock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new MockLock();`
**Description:** Simulated lock for test environments. Always succeeds in acquisition.

### Raw JSDoc Context:
```javascript
/**
 * @private
 * @class MockLock
 * @description Simulated lock for test environments. Always succeeds in acquisition.
 */
```

### Methods of MockLock

#### METHOD: MockLock.tryLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = mockLock.tryLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock tryLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   * @returns {boolean} Always returns true
   */
```
---
#### METHOD: MockLock.waitLock
- **Scope:** instance
- **LLM Call Syntax:** `mockLock.waitLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock waitLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   */
```
---
#### METHOD: MockLock.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `mockLock.releaseLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock releaseLock - clears acquired flag.
   */
```
---
#### METHOD: MockLock.hasLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = mockLock.hasLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns whether this mock lock is acquired.
   * @returns {boolean} True if acquired
   */
```
---
<br>

## CLASS: MockLock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new MockLock(logger);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {LoggerService} logger - Logger instance
   */
```

### Methods of MockLock

#### METHOD: MockLock.tryLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = mockLock.tryLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock tryLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   * @returns {boolean} Always returns true
   */
```
---
#### METHOD: MockLock.waitLock
- **Scope:** instance
- **LLM Call Syntax:** `mockLock.waitLock(timeoutInMillis);`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock waitLock - always succeeds immediately.
   * @param {number} timeoutInMillis - Ignored in mock
   */
```
---
#### METHOD: MockLock.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `mockLock.releaseLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Mock releaseLock - clears acquired flag.
   */
```
---
#### METHOD: MockLock.hasLock
- **Scope:** instance
- **LLM Call Syntax:** `const result = mockLock.hasLock();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns whether this mock lock is acquired.
   * @returns {boolean} True if acquired
   */
```
---
<br>

## CLASS: DriveService
**File Path:** `GoogleApiWrapper/src/services/DriveService.js`
**Constructor Usage:** `const instance = new DriveService();`
**Description:** Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.

### Raw JSDoc Context:
```javascript
/**
 * @class DriveService
 * @extends GoogleService
 * @description Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.
 *
 * @property {DriveFileManager} fileManager Logic for file mutations.
 * @property {DriveFolderManager} folderManager Logic for folder mutations.
 * @property {DriveShortcutHandler} shortcutHandler Logic for shortcut processing.
 * @property {DriveMetadataService} metadataService Logic for metadata and search.
 */
```

### Methods of DriveService

#### METHOD: DriveService._isDryRun
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._isDryRun(options);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Resolves dry-run status for current operation.
   * @param {Object} [options={}] Operation-level dryRun override.
   * @returns {boolean}
   */
```
---
#### METHOD: DriveService._generateDryRunId
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._generateDryRunId();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Creates a collision-resistant simulated ID for dry-run mutations.
   * @returns {string}
   */
```
---
#### METHOD: DriveService.getStandardApp
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService.getStandardApp();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the global DriveApp object for enum and static access.
   * @returns {GoogleAppsScript.Drive.DriveApp}
   */
```
---
#### METHOD: DriveService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: DriveService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: DriveService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: DriveService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `driveService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: DriveService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: DocumentService
**File Path:** `GoogleApiWrapper/src/services/DocumentService.js`
**Constructor Usage:** `const instance = new DocumentService();`
**Description:** Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.

### Raw JSDoc Context:
```javascript
/**
 * @class DocumentService
 * @extends GoogleService
 * @description Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.
 *
 * @property {DocumentTableManager} _tableManager Logic for table structure and data.
 * @property {DocumentContentExtractor} _contentExtractor Logic for document parsing.
 * @property {DocumentBatchUpdateHandler} _batchUpdateHandler Logic for atomic mutations.
 */
```

### Methods of DocumentService

#### METHOD: DocumentService.document
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.document(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method for DocumentBuilder.
   * @param {string} documentId Target Google Doc ID.
   * @returns {DocumentBuilder} Builder instance for fluent mutations.
   * @throws {Error} If documentId is invalid.
   */
```
---
#### METHOD: DocumentService.openStandard
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.openStandard(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses document via native DocumentApp (standard API).
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.Document} Native GAS Document object.
   */
```
---
#### METHOD: DocumentService.getStandardApp
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.getStandardApp();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the global DocumentApp object for enum and static access.
   * @returns {GoogleAppsScript.Document.DocumentApp}
   */
```
---
#### METHOD: DocumentService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: DocumentService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: DocumentService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: DocumentService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `documentService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: DocumentService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: DocumentService
**File Path:** `GoogleApiWrapper/src/services/DocumentService.js`
**Constructor Usage:** `const instance = new DocumentService(logger, cache, utils, exceptionService);`
**Description:** Initializes DocumentService and wires manager delegations.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes DocumentService and wires manager delegations.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {Cache} cache Persistence provider.
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   */
```

### Methods of DocumentService

#### METHOD: DocumentService.document
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.document(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method for DocumentBuilder.
   * @param {string} documentId Target Google Doc ID.
   * @returns {DocumentBuilder} Builder instance for fluent mutations.
   * @throws {Error} If documentId is invalid.
   */
```
---
#### METHOD: DocumentService.openStandard
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.openStandard(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses document via native DocumentApp (standard API).
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.Document} Native GAS Document object.
   */
```
---
#### METHOD: DocumentService.getStandardApp
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService.getStandardApp();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the global DocumentApp object for enum and static access.
   * @returns {GoogleAppsScript.Document.DocumentApp}
   */
```
---
#### METHOD: DocumentService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: DocumentService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: DocumentService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: DocumentService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `documentService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: DocumentService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: DocumentBuilder
**File Path:** `GoogleApiWrapper/src/services/DocumentBuilder.js`
**Constructor Usage:** `const instance = new DocumentBuilder();`
**Description:** Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.

### Raw JSDoc Context:
```javascript
/**
 * @class DocumentBuilder
 * @description Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.
 *
 * @property {string} documentId Target document identifier.
 * @property {GoogleService} service Reference to the Google Docs service.
 * @property {Array<Object>} operations Queue of pending document mutations.
 */
```

### Methods of DocumentBuilder

#### METHOD: DocumentBuilder.appendParagraph
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.appendParagraph(text, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a paragraph append operation.
   * @param {string} text Paragraph content.
   * @param {Object} [options={}] Formatting metadata (heading, alignment).
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.appendListItem
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.appendListItem(text, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a native Google Docs list item append operation.
   * @param {string} text List item content.
   * @param {Object} [options={}] List metadata; `listType` is `bullet` or `number`.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.setText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.setText(text);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a full body content override operation.
   * @param {string} text Document text content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.createTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.createTable(data, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a table insertion operation.
   * @param {Array<Array>} data 2D array representing table rows and cells.
   * @param {Object} [options={}] Table configuration (headerRow, widths).
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.addHeader
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.addHeader(text);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a header content operation.
   * @param {string} text Header content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.addFooter
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.addFooter(text);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a footer content operation.
   * @param {string} text Footer content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.replaceText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.replaceText(searchPattern, replacement);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a global text replacement operation.
   * @param {string} searchPattern Text pattern to replace.
   * @param {string} replacement New text content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.exportPDF
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.exportPDF(fileName, destinationFolderId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Queues a PDF generation operation.
   * @param {string} fileName Destination file name.
   * @param {string} [destinationFolderId=null] Target folder ID.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DocumentBuilder.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder.execute();`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes all queued operations. Combines Batch Update requests with standard API calls for tables and exports.
   * @returns {Object} Execution summary {success, batchResult, standardResults, tableResults, nonBatchResults}.
   */
```
---
#### METHOD: DocumentBuilder._convertOperationToDocsRequests
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder._convertOperationToDocsRequests(op);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Maps builder operations to Google Docs API Request objects.
   * @param {Object} op Builder operation metadata.
   * @returns {Object[]} Collection of API requests.
   */
```
---
#### METHOD: DocumentBuilder._getBodyEndIndex
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBuilder._getBodyEndIndex();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Reads the document's current body end index (Docs API), used
   * to anchor `insertText` requests so they land after existing content
   * instead of at a fixed offset.
   * @returns {number} The index immediately after the last body element.
   */
```
---
<br>

## CLASS: CacheService
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new CacheService();`
**Description:** Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.

### Raw JSDoc Context:
```javascript
/**
 * @class CacheService
 * @description Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {ExceptionService} _exceptionService Resiliency provider.
 */
```

### Methods of CacheService

#### METHOD: CacheService.getScriptCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getScriptCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS Script Cache (global scope).
   * @returns {Cache} Script cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
```
---
#### METHOD: CacheService.getUserCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getUserCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS User Cache (per-user scope).
   * @returns {Cache} User cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
```
---
#### METHOD: CacheService.getDocumentCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getDocumentCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS Document Cache (per-document scope).
   * @returns {Cache} Document cache wrapper.
   * @throws {Error} If native CacheService is unavailable or if called from a standalone script.
   */
```
---
#### METHOD: CacheService.getScriptCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getScriptCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS Script Cache accessor (backward compatibility).
   * @returns {Object} Native GAS script cache.
   */
```
---
#### METHOD: CacheService.getUserCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getUserCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS User Cache accessor.
   * @returns {Object} Native GAS user cache.
   */
```
---
#### METHOD: CacheService.getDocumentCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getDocumentCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS Document Cache accessor.
   * @returns {Object} Native GAS document cache.
   */
```
---
<br>

## CLASS: CacheService
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new CacheService(logger, exceptionService);`
**Description:** Initializes CacheService with optional logging and resiliency providers.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes CacheService with optional logging and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
   */
```

### Methods of CacheService

#### METHOD: CacheService.getScriptCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getScriptCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS Script Cache (global scope).
   * @returns {Cache} Script cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
```
---
#### METHOD: CacheService.getUserCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getUserCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS User Cache (per-user scope).
   * @returns {Cache} User cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
```
---
#### METHOD: CacheService.getDocumentCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = cacheService.getDocumentCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a Cache wrapper for the GAS Document Cache (per-document scope).
   * @returns {Cache} Document cache wrapper.
   * @throws {Error} If native CacheService is unavailable or if called from a standalone script.
   */
```
---
#### METHOD: CacheService.getScriptCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getScriptCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS Script Cache accessor (backward compatibility).
   * @returns {Object} Native GAS script cache.
   */
```
---
#### METHOD: CacheService.getUserCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getUserCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS User Cache accessor.
   * @returns {Object} Native GAS user cache.
   */
```
---
#### METHOD: CacheService.getDocumentCache
- **Scope:** static
- **LLM Call Syntax:** `const result = CacheService.getDocumentCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Native GAS Document Cache accessor.
   * @returns {Object} Native GAS document cache.
   */
```
---
<br>

## CLASS: Cache
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new Cache();`
**Description:** Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.

### Raw JSDoc Context:
```javascript
/**
 * @class Cache
 * @description Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.
 *
 * @property {Object} _cache Native GAS Cache instance.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {string} _type Cache scope identifier ('script', 'user', 'document').
 */
```

### Methods of Cache

#### METHOD: Cache.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.get(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves value from cache.
   * @param {string} key Cache key.
   * @returns {string|null} Cached value or null on miss/error.
   */
```
---
#### METHOD: Cache.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.getAll(keys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves multiple values in a single batch operation.
   * @param {string[]} keys Array of cache keys.
   * @returns {Object<string, string|null>} Map of keys to cached values (null if missing).
   */
```
---
#### METHOD: Cache.put
- **Scope:** instance
- **LLM Call Syntax:** `cache.put(key, value, expirationInSeconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Stores value in cache with automatic string conversion and TTL capping.
   * @param {string} key Cache key.
   * @param {*} value Value to cache (auto-converted to string).
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If caching operation fails.
   */
```
---
#### METHOD: Cache.putAll
- **Scope:** instance
- **LLM Call Syntax:** `cache.putAll(values, expirationInSeconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Stores multiple key-value pairs in a single batch operation.
   * @param {Object<string, *>} values Map of keys to values.
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If batch caching operation fails.
   */
```
---
#### METHOD: Cache.remove
- **Scope:** instance
- **LLM Call Syntax:** `cache.remove(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes specific key from cache.
   * @param {string} key Target cache key.
   * @throws {Error} If removal operation fails.
   */
```
---
#### METHOD: Cache.removeAll
- **Scope:** instance
- **LLM Call Syntax:** `cache.removeAll(keys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes multiple keys in a single batch operation.
   * @param {string[]} keys Array of keys to remove.
   * @throws {Error} If batch removal fails.
   */
```
---
#### METHOD: Cache.unwrap
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.unwrap();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the underlying native GAS Cache instance. Bypasses wrapper logic (logging, auto-string, TTL capping).
   * @returns {GoogleAppsScript.Cache.Cache} Native GAS cache object.
   */
```
---
<br>

## CLASS: Cache
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new Cache(gasCache, logger, type);`
**Description:** Initializes Cache wrapper for a native GAS cache object.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes Cache wrapper for a native GAS cache object.
   * @param {Object} gasCache Native GAS Cache instance.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {string} type Cache scope identifier ('script', 'user', 'document').
   */
```

### Methods of Cache

#### METHOD: Cache.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.get(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves value from cache.
   * @param {string} key Cache key.
   * @returns {string|null} Cached value or null on miss/error.
   */
```
---
#### METHOD: Cache.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.getAll(keys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves multiple values in a single batch operation.
   * @param {string[]} keys Array of cache keys.
   * @returns {Object<string, string|null>} Map of keys to cached values (null if missing).
   */
```
---
#### METHOD: Cache.put
- **Scope:** instance
- **LLM Call Syntax:** `cache.put(key, value, expirationInSeconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Stores value in cache with automatic string conversion and TTL capping.
   * @param {string} key Cache key.
   * @param {*} value Value to cache (auto-converted to string).
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If caching operation fails.
   */
```
---
#### METHOD: Cache.putAll
- **Scope:** instance
- **LLM Call Syntax:** `cache.putAll(values, expirationInSeconds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Stores multiple key-value pairs in a single batch operation.
   * @param {Object<string, *>} values Map of keys to values.
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If batch caching operation fails.
   */
```
---
#### METHOD: Cache.remove
- **Scope:** instance
- **LLM Call Syntax:** `cache.remove(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes specific key from cache.
   * @param {string} key Target cache key.
   * @throws {Error} If removal operation fails.
   */
```
---
#### METHOD: Cache.removeAll
- **Scope:** instance
- **LLM Call Syntax:** `cache.removeAll(keys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes multiple keys in a single batch operation.
   * @param {string[]} keys Array of keys to remove.
   * @throws {Error} If batch removal fails.
   */
```
---
#### METHOD: Cache.unwrap
- **Scope:** instance
- **LLM Call Syntax:** `const result = cache.unwrap();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the underlying native GAS Cache instance. Bypasses wrapper logic (logging, auto-string, TTL capping).
   * @returns {GoogleAppsScript.Cache.Cache} Native GAS cache object.
   */
```
---
<br>

## CLASS: SpreadsheetGridManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetGridManager.js`
**Constructor Usage:** `const instance = new SpreadsheetGridManager();`
**Description:** Manages structural and formatting changes for Google Sheets grids.

### Raw JSDoc Context:
```javascript
/**
 * Manages structural and formatting changes for Google Sheets grids.
 */
```

### Methods of SpreadsheetGridManager

#### METHOD: SpreadsheetGridManager.deleteColumn
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetGridManager.deleteColumn(spreadsheetId, sheetName, columnIndex);`
- **Pure JSDoc:**
```javascript
/**
   * Deletes one column using a one-based column index.
   * @param {string} spreadsheetId Spreadsheet identifier.
   * @param {string} sheetName Target sheet title.
   * @param {number} columnIndex One-based column index to delete.
   * @returns {*} Sheets batch-update result.
   */
```
---
<br>

## CLASS: DocumentTableManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentTableManager.js`
**Constructor Usage:** `const instance = new DocumentTableManager(facade);`
**Description:** Creates a new DocumentTableManager instance.

### Raw JSDoc Context:
```javascript
/**
   * Creates a new DocumentTableManager instance.
   * @param {DocumentService} facade - The DocumentService facade
   */
```

### Methods of DocumentTableManager

#### METHOD: DocumentTableManager.getDocumentTables
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.getDocumentTables(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves metadata for all tables in a document via Advanced Docs API.
   * @param {string} documentId Target document identifier.
   * @returns {Object[]} Collection of table summaries {startIndex, endIndex, tableIndex, rows, columns}.
   */
```
---
#### METHOD: DocumentTableManager.getTableStructure
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.getTableStructure(documentId, tableIndex);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves detailed structural metadata for a specific table via Advanced Docs API.
   * @param {string} documentId Target document identifier.
   * @param {number} tableIndex Zero-based sequence index.
   * @returns {Object} Table structure {startIndex, endIndex, rows: Array<{startIndex, endIndex, rowIndex, cells: Array<{startIndex, endIndex, cellIndex}>}>}.
   * @throws {Error} If index is out of bounds.
   */
```
---
#### METHOD: DocumentTableManager.getTableData
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.getTableData(documentId, tableIndex);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves all cell text from a table via standard DocumentApp API.
   * @param {string} documentId Target document identifier.
   * @param {number} [tableIndex=0] Zero-based sequence index.
   * @returns {Object} Table data {tableIndex, numRows, numColumns, data: string[][]}.
   */
```
---
#### METHOD: DocumentTableManager.copyTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.copyTableColumn(documentId, tableIndex, sourceColumnIndex, targetColumnIndex);`
- **Pure JSDoc:**
```javascript
/**
   * @description Copies a table column's cells (preserving native formatting via
   * TableCell.copy()) from sourceColumnIndex into a new column at targetColumnIndex,
   * one row at a time. Mirrors copyTableRow's shape for columns.
   * @param {string} documentId Target document identifier.
   * @param {number} tableIndex Table ordinal.
   * @param {number} sourceColumnIndex Column to copy from.
   * @param {number} targetColumnIndex Column position to insert the copy at.
   * @returns {Object} {success, tableIndex, sourceColumnIndex, insertedColumnIndex, numRows}.
   * @throws {Error} If tableIndex is out of bounds, the table has no rows, sourceColumnIndex
   * is out of bounds, or targetColumnIndex is out of bounds (targetColumnIndex may equal the
   * first row's cell count, to insert the copy as a new last column).
   */
```
---
#### METHOD: DocumentTableManager.setCellRunStyles
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.setCellRunStyles(documentId, tableIndex, rowIndex, columnIndex, segments);`
- **Pure JSDoc:**
```javascript
/**
   * @description Replaces one table cell's text content with a sequence of styled
   * segments, clearing the cell first and re-applying each segment's captured
   * Advanced-API TextStyle via native Text.setAttributes(). Used after a
   * formatting-preserving structural clone (copyTableRow/copyTableColumn) to
   * retext the clone without discarding its cell-level (border/shading/padding)
   * attributes, which clear()/setText() do not touch.
   *
   * Offset convention: `setAttributes` is called with an inclusive end offset
   * (`offset + rendered.length - 1`) for each segment, per Apps Script's
   * `Text.setAttributes(startOffset, endOffsetInclusive, attrs)` contract.
   * @param {string} documentId Target document identifier.
   * @param {number} tableIndex Table ordinal.
   * @param {number} rowIndex Row index of the cell to retext.
   * @param {number} columnIndex Column index of the cell to retext.
   * @param {Array<{rendered: string, style: Object}>} segments Ordered text+style segments.
   * @returns {Object} {success, tableIndex, rowIndex, columnIndex, runsApplied}.
   * @throws {Error} If tableIndex/rowIndex/columnIndex is out of bounds.
   */
```
---
#### METHOD: DocumentTableManager._applyTableStyling
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager._applyTableStyling(table, data, options);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Applies header-row bold, alternating-row background and column-width
   * styling to a freshly created/inserted `Table`. Shared by `_createTableWithStandardAPI`
   * (append-at-end) and `insertTableAtMarker` (positional insertion) so the styling logic
   * lives in exactly one place regardless of how the table was placed.
   * @param {GoogleAppsScript.Document.Table} table Native table to style.
   * @param {Array<Array<string>>} data The data the table was created from (used for row/column counts).
   * @param {Object} options {headerRow, alternatingRows, columnWidths}.
   */
```
---
#### METHOD: DocumentTableManager._createTableWithStandardAPI
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager._createTableWithStandardAPI(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for table creation. Supports header styling and alternating row backgrounds.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Table parameters {data, options: {headerRow, alternatingRows, columnWidths}}.
   * @returns {Object} Result summary {success, rows, columns}.
   */
```
---
#### METHOD: DocumentTableManager.insertTableAtMarker
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.insertTableAtMarker(documentId, markerText, data, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Inserts a table immediately after the paragraph/element containing
   * `markerText`, instead of appending it at the document's end. Locates the marker via
   * native `body.findText()`, walks up from the matched text run to the top-level child of
   * `body` (a Paragraph/ListItem/etc.), and inserts the table right after that child's index.
   *
   * The marker text itself is NOT removed by this call — the caller (e.g. a facade doing a
   * scan-then-remove flow) is expected to remove it separately using the returned
   * `foundElementIndex`/its own marker-search logic. This mirrors the existing
   * find-placeholder / remove-text split already used by callers of `appendTable`.
   *
   * @param {string} documentId Target document identifier.
   * @param {string} markerText Literal text to search for (e.g. `{{TABELLA:sheetId}}`).
   * @param {Array<Array<string>>} data Table cell data.
   * @param {Object} [options={}] {headerRow, alternatingRows, columnWidths} - same as `_createTableWithStandardAPI`.
   * @returns {Object} Result summary {success, rows, columns, foundElementIndex}.
   * @throws {Error} If `markerText` is not found in the document (no silent fallback to append).
   */
```
---
<br>

## CLASS: DocumentContentExtractor
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentContentExtractor.js`
**Constructor Usage:** `const instance = new DocumentContentExtractor(facade);`
**Description:** Creates a new DocumentContentExtractor instance.

### Raw JSDoc Context:
```javascript
/**
   * Creates a new DocumentContentExtractor instance.
   * @param {DocumentService} facade - The DocumentService facade
   */
```

### Methods of DocumentContentExtractor

#### METHOD: DocumentContentExtractor.getRawDocumentStructure
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor.getRawDocumentStructure(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves the full document hierarchy as a Plain Old JavaScript Object (POJO). Bypasses internal GAS types.
   * @param {string} documentId Target document identifier.
   * @returns {Object} POJO representation including body content collection.
   */
```
---
#### METHOD: DocumentContentExtractor._convertContentToPOJO
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._convertContentToPOJO(content);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Recursively maps native Docs API content elements to POJOs.
   * @param {Object[]} content Collection of native Docs API elements.
   * @returns {Object[]} Collection of mapped POJOs.
   */
```
---
#### METHOD: DocumentContentExtractor._extractParagraphText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._extractParagraphText(paragraph);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Aggregates all text runs within a paragraph element.
   * @param {Object} paragraph Native Docs API paragraph object.
   * @returns {string} Concatenated plain text.
   */
```
---
#### METHOD: DocumentContentExtractor._extractParagraphRuns
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._extractParagraphRuns(paragraph);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Extracts per-run text + style spans from a paragraph, with
   * offsets relative to the paragraph's own flattened text (i.e. directly
   * usable as offsets into `_extractParagraphText(paragraph)`'s output).
   * @param {Object} paragraph Native Docs API paragraph object.
   * @returns {Array<{text: string, start: number, end: number, style: Object}>}
   */
```
---
#### METHOD: DocumentContentExtractor._extractTableData
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._extractTableData(table);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Maps native Docs API table rows and cells to a POJO collection.
   * @param {Object} table Native Docs API table object.
   * @returns {Object[]} Collection of row and cell POJOs.
   */
```
---
#### METHOD: DocumentContentExtractor._extractCellText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._extractCellText(cell);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Resolves text content from a table cell by aggregating paragraph segments.
   * @param {Object} cell Native Docs API table cell object.
   * @returns {string} Concatenated plain text.
   */
```
---
#### METHOD: DocumentContentExtractor._extractCellRuns
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor._extractCellRuns(cell);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Extracts per-run text + style spans from a table cell,
   * concatenating across the cell's paragraphs with cell-relative offsets
   * (matching `_extractCellText`'s concatenation order exactly).
   * @param {Object} cell Native Docs API table cell object.
   * @returns {Array<{text: string, start: number, end: number, style: Object}>}
   */
```
---
#### METHOD: DocumentContentExtractor.getDocumentBody
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor.getDocumentBody(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves the document body metadata with index boundaries.
   * @param {string} documentId Target document identifier.
   * @returns {Object} Body structure {startIndex, endIndex, content}.
   * @throws {Error} If body is missing.
   */
```
---
#### METHOD: DocumentContentExtractor.scanDocumentStructure
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentContentExtractor.scanDocumentStructure(documentId, textPatterns);`
- **Pure JSDoc:**
```javascript
/**
   * @description Probes document structure for tables and specific text patterns. Optimized for POJO-based scanning.
   * @param {string} documentId Target document identifier.
   * @param {string[]} [textPatterns=['{{']] Collection of search strings.
   * @returns {Object} Scan results {tables: Object[], textMatches: Object[]}.
   */
```
---
<br>

## CLASS: DocumentBatchUpdateHandler
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentBatchUpdateHandler.js`
**Constructor Usage:** `const instance = new DocumentBatchUpdateHandler(facade);`
**Description:** Creates a new DocumentBatchUpdateHandler instance.

### Raw JSDoc Context:
```javascript
/**
   * Creates a new DocumentBatchUpdateHandler instance.
   * @param {DocumentService} facade - The DocumentService facade
   */
```

### Methods of DocumentBatchUpdateHandler

#### METHOD: DocumentBatchUpdateHandler.getOrCreateHeader
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.getOrCreateHeader(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves the document header. Provisions a new header if missing.
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.HeaderSection}
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.getOrCreateFooter
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.getOrCreateFooter(documentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves the document footer. Provisions a new footer if missing.
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.FooterSection}
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.setHeaderText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.setHeaderText(documentId, text);`
- **Pure JSDoc:**
```javascript
/**
   * @description Replaces header content with specified text.
   * @param {string} documentId Target document identifier.
   * @param {string} text New header content.
   * @returns {DocumentService} Facade instance for chaining.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.createDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.createDocument(name, options, options.destinationFolder);`
- **Pure JSDoc:**
```javascript
/**
   * @description Initializes a new blank document via Advanced Docs API (no template copy required).
   * @param {string} name Document title.
   * @param {Object} [options={}] Creation options.
   * @param {string} [options.destinationFolder] Target folder ID; moved there via Advanced Drive API after creation (Docs API always creates in Drive root).
   * @returns {Object} Result {documentId, builder}.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.getDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.getDocument(documentIds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves document metadata with intelligent caching.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @returns {Object|Object[]|null} Metadata object (single) or collection (batch).
   */
```
---
#### METHOD: DocumentBatchUpdateHandler._executeBatchUpdate
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler._executeBatchUpdate(documentId, requests);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Executes atomic mutations via Docs API batchUpdate. Invalidates metadata cache on success.
   * @param {string} documentId Target document identifier.
   * @param {Object[]} requests Collection of API request objects.
   * @returns {Object} API response.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler._executeExportPDF
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler._executeExportPDF(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Triggers server-side PDF conversion and saves to Drive.
   * @param {string} documentId Source document identifier.
   * @param {Object} op Export parameters {fileName, destinationFolderId}.
   * @returns {Object} Created Drive file metadata.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.batchReplaceText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.batchReplaceText(documentIds, searchPattern, replacement);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes case-sensitive global text replacement in batch across multiple documents.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @param {string} searchPattern Text to find.
   * @param {string} replacement New text content.
   * @returns {Object} Result summary {successful, failed}.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler.deleteDocuments
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler.deleteDocuments(documentIds);`
- **Pure JSDoc:**
```javascript
/**
   * @description Trashes multiple documents in batch. Invalidates associated metadata caches.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @returns {Object} Result summary {successful, failed}.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler._addHeaderWithStandardAPI
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler._addHeaderWithStandardAPI(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for header mutations.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Mutation parameters {text}.
   * @returns {Object} {success}.
   */
```
---
#### METHOD: DocumentBatchUpdateHandler._addFooterWithStandardAPI
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentBatchUpdateHandler._addFooterWithStandardAPI(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for footer mutations.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Mutation parameters {text}.
   * @returns {Object} {success}.
   */
```
---
<br>

## CLASS: ServiceFactory
**File Path:** `GoogleApiWrapper/src/internal/core/ServiceFactory.js`
**Constructor Usage:** `const instance = new ServiceFactory();`
**Description:** Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.

### Raw JSDoc Context:
```javascript
/**
 * @class ServiceFactory
 * @description Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.
 *
 * @static
 * @property {LoggerService} _logger Shared diagnostic logger.
 * @property {UtilsService} _utils Shared foundational utilities.
 * @property {Cache} _cache Shared persistence provider.
 * @property {ExceptionService} _exceptionService Shared resiliency handler.
 * @property {Object} _config Global service configuration.
 */
```

### Methods of ServiceFactory

#### METHOD: ServiceFactory.configure
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.configure(config, config.logLevel, config.cacheExpiration, config.mailRateLimitMs);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Updates global service configuration via shallow merge. Resets shared instances to apply new settings to subsequent service requests. Must be called before service instantiation to ensure consistent dependency states.
   * @param {Object} config Partial configuration object.
   * @param {string} [config.logLevel='INFO'] Logging verbosity ('OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG').
   * @param {number} [config.cacheExpiration=300] Default cache TTL in seconds.
   * @param {number} [config.mailRateLimitMs=100] Minimum delay (ms) between mail operations.
   */
```
---
#### METHOD: ServiceFactory.reset
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.reset(resetConfig);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Resets shared service instances. Optionally restores configuration to defaults. Primarily for test state isolation.
   * @param {boolean} [resetConfig=true] If true, restores default values to _config.
   */
```
---
#### METHOD: ServiceFactory.getLogger
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getLogger();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns singleton LoggerService instance, lazy-initialized with current _config.logLevel.
   * @returns {LoggerService} Shared diagnostic logger.
   */
```
---
#### METHOD: ServiceFactory.getUtilitiesService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getUtilitiesService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns singleton UtilitiesService instance (GAS native API wrapper).
   * @returns {UtilitiesService} Shared GAS utility wrapper.
   */
```
---
#### METHOD: ServiceFactory.getUtils
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getUtils();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns singleton UtilsService instance (CoreUtilsLib). Injects sleepFn from UtilitiesService.
   * @returns {UtilsService} Shared foundational utility provider.
   */
```
---
#### METHOD: ServiceFactory.getCache
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getCache();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns singleton Script Cache instance (GAS CacheService.getScriptCache()).
   * @returns {Cache} Shared script-level persistence provider.
   */
```
---
#### METHOD: ServiceFactory.getCacheService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getCacheService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns the singleton CacheService instance (GAS CacheService wrapper).
   * Prefer {@link ServiceFactory.getCache} for the script cache itself; this exposes the
   * service object for callers that need user/document caches or the service directly.
   * @returns {CacheService} Shared cache service wrapper.
   */
```
---
#### METHOD: ServiceFactory.getExceptionService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getExceptionService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Returns singleton ExceptionService instance (GasResilienceLib) for resilient execution.
   * @returns {ExceptionService} Shared resiliency and retry handler.
   */
```
---
#### METHOD: ServiceFactory.getDriveService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getDriveService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new DriveService instance with injected shared dependencies.
   * @returns {DriveService}
   */
```
---
#### METHOD: ServiceFactory.getDocumentService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getDocumentService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new DocumentService instance with injected shared dependencies.
   * @returns {DocumentService}
   */
```
---
#### METHOD: ServiceFactory.getSpreadsheetService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getSpreadsheetService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new SpreadsheetService instance with injected shared dependencies.
   * @returns {SpreadsheetService}
   */
```
---
#### METHOD: ServiceFactory.getMailService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getMailService(options);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new MailService instance with injected shared dependencies and optional configuration.
   * @param {Object} [options={}] Rate limiting overrides.
   * @returns {MailService}
   */
```
---
#### METHOD: ServiceFactory.getPermissionService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getPermissionService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new PermissionService instance with injected shared dependencies.
   * @returns {PermissionService}
   */
```
---
#### METHOD: ServiceFactory.getPropertiesService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getPropertiesService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new PropertiesService instance with injected shared dependencies.
   * @returns {PropertiesService}
   */
```
---
#### METHOD: ServiceFactory.getTriggerService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getTriggerService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new TriggerService instance with injected shared dependencies.
   * @returns {TriggerService}
   */
```
---
#### METHOD: ServiceFactory.getUiService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getUiService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new UiService instance with injected shared dependencies and auto-detected host UI.
   * @returns {UiService}
   */
```
---
#### METHOD: ServiceFactory.getUserService
- **Scope:** static
- **LLM Call Syntax:** `const result = ServiceFactory.getUserService();`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Creates a new UserService instance with injected shared dependencies.
   * @returns {UserService}
   */
```
---
#### METHOD: ServiceFactory.setLogger
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.setLogger(logger);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Overrides the shared logger instance.
   * @param {Object} logger Custom logger instance.
   */
```
---
#### METHOD: ServiceFactory.setUtils
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.setUtils(utils);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Overrides the shared utils instance.
   * @param {Object} utils Custom utils instance.
   */
```
---
#### METHOD: ServiceFactory.setCache
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.setCache(cache);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Overrides the shared cache instance.
   * @param {Object} cache Custom cache instance.
   */
```
---
#### METHOD: ServiceFactory.setExceptionService
- **Scope:** static
- **LLM Call Syntax:** `ServiceFactory.setExceptionService(exceptionService);`
- **Pure JSDoc:**
```javascript
/**
   * @static
   * @description Overrides the shared exception service instance.
   * @param {Object} exceptionService Custom exception service instance.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService();`
**Description:** Abstract foundation for Google Apps Script service wrappers. Implements standardized dependency injection (DI), multi-level caching strategies, and resilient execution patterns via GasResilienceLib.

### Raw JSDoc Context:
```javascript
/**
 * @class GoogleService
 * @abstract
 * @description Abstract foundation for Google Apps Script service wrappers. Implements standardized dependency injection (DI), multi-level caching strategies, and resilient execution patterns via GasResilienceLib.
 *
 * @property {LoggerService} _logger Diagnostic logging provider.
 * @property {Cache} _cache State persistence provider (get/put/remove).
 * @property {UtilsService} _utils Foundational utility provider.
 * @property {ExceptionService} _exceptionService Resiliency and retry logic provider.
 */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: MenuBuilder
**File Path:** `GoogleApiWrapper/src/builders/MenuBuilder.js`
**Constructor Usage:** `const instance = new MenuBuilder();`
**Description:** Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.

### Raw JSDoc Context:
```javascript
/**
 * @class MenuBuilder
 * @description Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.
 *
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
 * @property {GoogleAppsScript.Base.Menu} _menu Current native menu object.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {string} _caption Menu header label.
 */
```

### Methods of MenuBuilder

#### METHOD: MenuBuilder.addItem
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addItem(caption, functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Appends a command item to the menu. Requires a globally-scoped handler function.
   * @param {string} caption Item display label.
   * @param {string} functionName Name of the global function to execute.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} On invalid caption or functionName.
   */
```
---
#### METHOD: MenuBuilder.addSeparator
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addSeparator();`
- **Pure JSDoc:**
```javascript
/**
   * @description Appends a visual horizontal divider.
   * @returns {MenuBuilder} Current instance for chaining.
   */
```
---
#### METHOD: MenuBuilder.addSubMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addSubMenu(subMenuBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * @description Nestles another menu hierarchy within the current menu.
   * @param {MenuBuilder} subMenuBuilder Pre-configured builder for the submenu.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} If subMenuBuilder is not a valid MenuBuilder.
   */
```
---
#### METHOD: MenuBuilder.addToUi
- **Scope:** instance
- **LLM Call Syntax:** `menuBuilder.addToUi();`
- **Pure JSDoc:**
```javascript
/**
   * @description Commits the builder state to the host UI. Mandatory final operation.
   */
```
---
#### METHOD: MenuBuilder.getNativeMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.getNativeMenu();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured native GAS Menu object.
   * @returns {GoogleAppsScript.Base.Menu}
   */
```
---
<br>

## CLASS: MenuBuilder
**File Path:** `GoogleApiWrapper/src/builders/MenuBuilder.js`
**Constructor Usage:** `const instance = new MenuBuilder(ui, caption, logger);`
**Description:** Initializes MenuBuilder and provisions a native Menu instance.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes MenuBuilder and provisions a native Menu instance.
   * @param {GoogleAppsScript.Base.Ui} ui Native GAS UI object.
   * @param {string} caption Menu header label.
   * @param {LoggerService} logger Diagnostic logger.
   * @throws {Error} If ui, caption, or logger is missing.
   */
```

### Methods of MenuBuilder

#### METHOD: MenuBuilder.addItem
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addItem(caption, functionName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Appends a command item to the menu. Requires a globally-scoped handler function.
   * @param {string} caption Item display label.
   * @param {string} functionName Name of the global function to execute.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} On invalid caption or functionName.
   */
```
---
#### METHOD: MenuBuilder.addSeparator
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addSeparator();`
- **Pure JSDoc:**
```javascript
/**
   * @description Appends a visual horizontal divider.
   * @returns {MenuBuilder} Current instance for chaining.
   */
```
---
#### METHOD: MenuBuilder.addSubMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.addSubMenu(subMenuBuilder);`
- **Pure JSDoc:**
```javascript
/**
   * @description Nestles another menu hierarchy within the current menu.
   * @param {MenuBuilder} subMenuBuilder Pre-configured builder for the submenu.
   * @returns {MenuBuilder} Current instance for chaining.
   * @throws {Error} If subMenuBuilder is not a valid MenuBuilder.
   */
```
---
#### METHOD: MenuBuilder.addToUi
- **Scope:** instance
- **LLM Call Syntax:** `menuBuilder.addToUi();`
- **Pure JSDoc:**
```javascript
/**
   * @description Commits the builder state to the host UI. Mandatory final operation.
   */
```
---
#### METHOD: MenuBuilder.getNativeMenu
- **Scope:** instance
- **LLM Call Syntax:** `const result = menuBuilder.getNativeMenu();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured native GAS Menu object.
   * @returns {GoogleAppsScript.Base.Menu}
   */
```
---
<br>

## CLASS: DialogBuilder
**File Path:** `GoogleApiWrapper/src/builders/DialogBuilder.js`
**Constructor Usage:** `const instance = new DialogBuilder();`
**Description:** Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.

### Raw JSDoc Context:
```javascript
/**
 * @class DialogBuilder
 * @description Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.
 *
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {GoogleAppsScript.HTML.HtmlOutput|null} _htmlOutput Pending output object.
 * @property {string} _title Dialog header.
 * @property {number|null} _width Width in pixels.
 * @property {number|null} _height Height in pixels.
 */
```

### Methods of DialogBuilder

#### METHOD: DialogBuilder.setTitle
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setTitle(title);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sets the window title.
   * @param {string} title Dialog header text.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid title string.
   */
```
---
#### METHOD: DialogBuilder.setContent
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setContent(html);`
- **Pure JSDoc:**
```javascript
/**
   * @description Maps raw HTML string to the builder's output state.
   * @param {string} html Valid HTML content.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid HTML input.
   */
```
---
#### METHOD: DialogBuilder.setContentFromTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setContentFromTemplate(template);`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates an HtmlTemplate and maps result to output state.
   * @param {GoogleAppsScript.HTML.HtmlTemplate} template Template object with scriptlets.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} If template is invalid or evaluation fails.
   */
```
---
#### METHOD: DialogBuilder.setWidth
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setWidth(pixels);`
- **Pure JSDoc:**
```javascript
/**
   * @description Overrides default dialog width.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DialogBuilder.setHeight
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setHeight(pixels);`
- **Pure JSDoc:**
```javascript
/**
   * @description Overrides default dialog height.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DialogBuilder.show
- **Scope:** instance
- **LLM Call Syntax:** `dialogBuilder.show();`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders the dialog in the host UI. Blocks script execution until closed.
   * @throws {Error} If no content was provided prior to call.
   */
```
---
#### METHOD: DialogBuilder.getHtmlOutput
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.getHtmlOutput();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured HtmlOutput object.
   * @returns {GoogleAppsScript.HTML.HtmlOutput|null}
   */
```
---
<br>

## CLASS: DialogBuilder
**File Path:** `GoogleApiWrapper/src/builders/DialogBuilder.js`
**Constructor Usage:** `const instance = new DialogBuilder(ui, logger);`
**Description:** Initializes DialogBuilder with native UI and logging context.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes DialogBuilder with native UI and logging context.
   * @param {GoogleAppsScript.Base.Ui} ui Native GAS UI object.
   * @param {LoggerService} logger Diagnostic logger.
   * @throws {Error} If ui or logger is missing.
   */
```

### Methods of DialogBuilder

#### METHOD: DialogBuilder.setTitle
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setTitle(title);`
- **Pure JSDoc:**
```javascript
/**
   * @description Sets the window title.
   * @param {string} title Dialog header text.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid title string.
   */
```
---
#### METHOD: DialogBuilder.setContent
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setContent(html);`
- **Pure JSDoc:**
```javascript
/**
   * @description Maps raw HTML string to the builder's output state.
   * @param {string} html Valid HTML content.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} On invalid HTML input.
   */
```
---
#### METHOD: DialogBuilder.setContentFromTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setContentFromTemplate(template);`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates an HtmlTemplate and maps result to output state.
   * @param {GoogleAppsScript.HTML.HtmlTemplate} template Template object with scriptlets.
   * @returns {DialogBuilder} Current instance for chaining.
   * @throws {Error} If template is invalid or evaluation fails.
   */
```
---
#### METHOD: DialogBuilder.setWidth
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setWidth(pixels);`
- **Pure JSDoc:**
```javascript
/**
   * @description Overrides default dialog width.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DialogBuilder.setHeight
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.setHeight(pixels);`
- **Pure JSDoc:**
```javascript
/**
   * @description Overrides default dialog height.
   * @param {number} pixels Positive integer.
   * @returns {DialogBuilder} Current instance for chaining.
   */
```
---
#### METHOD: DialogBuilder.show
- **Scope:** instance
- **LLM Call Syntax:** `dialogBuilder.show();`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders the dialog in the host UI. Blocks script execution until closed.
   * @throws {Error} If no content was provided prior to call.
   */
```
---
#### METHOD: DialogBuilder.getHtmlOutput
- **Scope:** instance
- **LLM Call Syntax:** `const result = dialogBuilder.getHtmlOutput();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured HtmlOutput object.
   * @returns {GoogleAppsScript.HTML.HtmlOutput|null}
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService(logger, cache, utils, exceptionService);`
**Description:** Initializes service with validated dependencies. Enforces abstract class restriction.

### Raw JSDoc Context:
```javascript
/**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
```

### Methods of GoogleService

#### METHOD: GoogleService._verifyAdvancedService
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._verifyAdvancedService(serviceName);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
```
---
#### METHOD: GoogleService._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._generateCacheKey(prefix, id, method);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
```
---
#### METHOD: GoogleService._getOrExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._getOrExecute(key, func, expirationSeconds, useCache);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
```
---
#### METHOD: GoogleService._invalidateCache
- **Scope:** instance
- **LLM Call Syntax:** `googleService._invalidateCache(key);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
```
---
#### METHOD: GoogleService._executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = googleService._executeWithRetry(func, context, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
```
---
<br>

