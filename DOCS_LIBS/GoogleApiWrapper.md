# API Reference: GoogleApiWrapper

## CLASS: provides
**File Path:** `GoogleApiWrapper/index.js`
**Constructor Usage:** `const instance = new provides();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: for
**File Path:** `GoogleApiWrapper/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: MenuBuilderMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new MenuBuilderMock();`
**Description:** Centralized high-fidelity mocks for GoogleApiWrapper services.

/

/**
@class MenuBuilderMock
High-fidelity mock for MenuBuilder. Supports fluent chaining and Jest tracking.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GoogleApiWrapper services.
 * @version 1.0.0
 */

/**
 * @class MenuBuilderMock
 * @description High-fidelity mock for MenuBuilder. Supports fluent chaining and Jest tracking.
 */
```

<br>

## CLASS: SidebarBuilderMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new SidebarBuilderMock();`
**Description:** @class SidebarBuilderMock
High-fidelity mock for SidebarBuilder. Supports fluent chaining and Jest tracking.

### Raw JSDoc Context:
```javascript
/**
 * @class SidebarBuilderMock
 * @description High-fidelity mock for SidebarBuilder. Supports fluent chaining and Jest tracking.
 */
```

<br>

## CLASS: DialogBuilderMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DialogBuilderMock();`
**Description:** @class DialogBuilderMock
High-fidelity mock for DialogBuilder. Supports fluent chaining and Jest tracking.

### Raw JSDoc Context:
```javascript
/**
 * @class DialogBuilderMock
 * @description High-fidelity mock for DialogBuilder. Supports fluent chaining and Jest tracking.
 */
```

<br>

## CLASS: SpreadsheetServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new SpreadsheetServiceMock();`
**Description:** @class SpreadsheetServiceMock
High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.

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
**Description:** @class PropertiesServiceMock
High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.

### Raw JSDoc Context:
```javascript
/**
 * @class PropertiesServiceMock
 * @description High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.
 */
```

<br>

## CLASS: DocumentBuilderMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DocumentBuilderMock();`
**Description:** @class DocumentBuilderMock
High-fidelity mock for DocumentBuilder. Supports fluent API chaining and operation queue tracking.

### Raw JSDoc Context:
```javascript
/**
 * @class DocumentBuilderMock
 * @description High-fidelity mock for DocumentBuilder. Supports fluent API chaining and operation queue tracking.
 */
```

### Methods of DocumentBuilderMock

#### METHOD: DocumentBuilderMock.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBuilderMock.if(op.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBuilderMock.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBuilderMock.if(op.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBuilderMock.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBuilderMock.if(op.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DocumentServiceMock
**File Path:** `GoogleApiWrapper/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DocumentServiceMock();`
**Description:** @class DocumentServiceMock
High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.

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
**Description:** @class TriggerServiceMock
High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.

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
**Description:** @class MailServiceMock
High-fidelity mock for MailService.

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
**Description:** @class LockServiceMock
High-fidelity mock for LockService.

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
**Description:** @class DriveServiceMock
High-fidelity mock for DriveService.

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
**Description:** Facade for Google Apps Script's Utilities API.
Provides a consistent interface for utility functions with error handling and logging.
/

/**
@class UtilitiesService
Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.

@property {LoggerService} _logger Diagnostic logger.
@property {ExceptionService} _exceptionService Resiliency provider.

### Raw JSDoc Context:
```javascript
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
```

<br>

## CLASS: UserService
**File Path:** `GoogleApiWrapper/src/services/UserService.js`
**Constructor Usage:** `const instance = new UserService();`
**Description:** Facade for Google Apps Script's Session API (running-user identity).
/

/**
@class UserService
Lightweight facade for the native GAS `Session` global — the L2
boundary for running-user identity lookups, so no other library or consumer
needs to touch `Session` directly.

@property {LoggerService} _logger Diagnostic logger.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/UserService.js
 * @description Facade for Google Apps Script's Session API (running-user identity).
 */

/**
 * @class UserService
 * @description Lightweight facade for the native GAS `Session` global — the L2
 * boundary for running-user identity lookups, so no other library or consumer
 * needs to touch `Session` directly.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 */
```

<br>

## CLASS: UiService
**File Path:** `GoogleApiWrapper/src/services/UiService.js`
**Constructor Usage:** `const instance = new UiService();`
**Description:** Unified UI service facade for Google Apps Script UI operations

/

import { GoogleService } from '../internal/core/GoogleService';
import { MenuBuilder } from '../builders/MenuBuilder';
import { SidebarBuilder } from '../builders/SidebarBuilder';
import { DialogBuilder } from '../builders/DialogBuilder';

/**
@class UiService
@extends GoogleService
Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.

@property {GoogleAppsScript.Base.Ui} _ui Native GAS UI object.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/UiService.js
 * @description Unified UI service facade for Google Apps Script UI operations
 * @version 1.0 - Initial implementation
 */

import { GoogleService } from '../internal/core/GoogleService';
import { MenuBuilder } from '../builders/MenuBuilder';
import { SidebarBuilder } from '../builders/SidebarBuilder';
import { DialogBuilder } from '../builders/DialogBuilder';

/**
 * @class UiService
 * @extends GoogleService
 * @description Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.
 *
 * @property {GoogleAppsScript.Base.Ui} _ui Native GAS UI object.
 */
```

<br>

## CLASS: TriggerService
**File Path:** `GoogleApiWrapper/src/services/TriggerService.js`
**Constructor Usage:** `const instance = new TriggerService();`
**Description:** Facade for Google Apps Script's ScriptApp trigger management.
Provides a clean, testable interface for creating and managing triggers.

/

/**
@class TriggerService
Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.

@property {LoggerService} _logger Diagnostic logger.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/MyTriggerService.js
 * @description Facade for Google Apps Script's ScriptApp trigger management.
 * Provides a clean, testable interface for creating and managing triggers.
 * @version 1.0 - Translated from Italian and refactored for standalone use.
 */

/**
 * @class TriggerService
 * @description Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 */
```

<br>

## CLASS: SpreadsheetService
**File Path:** `GoogleApiWrapper/src/services/SpreadsheetService.js`
**Constructor Usage:** `const instance = new SpreadsheetService();`
**Description:** BATCH-FIRST Spreadsheet Service with Advanced Sheets API.

/

import { Delegation } from '@CoreUtilsLib';
import { GoogleService } from '../internal/core/GoogleService';
import { SpreadsheetRangeManager } from '../internal/services-managers/SpreadsheetRangeManager.js';
import { SpreadsheetGridManager } from '../internal/services-managers/SpreadsheetGridManager.js';
import { SpreadsheetMetadataCache } from '../internal/services-managers/SpreadsheetMetadataCache.js';
import { SpreadsheetHybridManager } from '../internal/services-managers/SpreadsheetHybridManager.js';

/**
@class SpreadsheetService
@extends GoogleService
Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.

@property {SpreadsheetMetadataCache} _metadataCache Internal metadata registry.
@property {SpreadsheetRangeManager} _rangeManager Logic for cell value mutations.
@property {SpreadsheetGridManager} _gridManager Logic for sheet and grid mutations.
@property {SpreadsheetHybridManager} _hybridManager Standard API integration logic.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/SpreadsheetService.js
 * @description BATCH-FIRST Spreadsheet Service with Advanced Sheets API.
 * @version 4.0 - Refactored using Facade/Delegation pattern.
 */

import { Delegation } from '@CoreUtilsLib';
import { GoogleService } from '../internal/core/GoogleService';
import { SpreadsheetRangeManager } from '../internal/services-managers/SpreadsheetRangeManager.js';
import { SpreadsheetGridManager } from '../internal/services-managers/SpreadsheetGridManager.js';
import { SpreadsheetMetadataCache } from '../internal/services-managers/SpreadsheetMetadataCache.js';
import { SpreadsheetHybridManager } from '../internal/services-managers/SpreadsheetHybridManager.js';

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

<br>

## CLASS: PropertiesService
**File Path:** `GoogleApiWrapper/src/services/PropertiesService.js`
**Constructor Usage:** `const instance = new PropertiesService();`
**Description:** Facade for Google Apps Script's PropertiesService.
Provides a clean, testable interface for reading and writing script properties.

/

// Access native GAS PropertiesService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativePropertiesService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.PropertiesService (the mock).
function _getNativePropertiesService() {
  return global.__nativePropertiesService__ || global.PropertiesService;
}

/**
@class PropertiesService
Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.

@property {LoggerService} _logger Diagnostic logger.
@property {Object} _properties Native GAS Properties instance.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/MyPropertiesService.js
 * @description Facade for Google Apps Script's PropertiesService.
 * Provides a clean, testable interface for reading and writing script properties.
 * @version 1.0 - Translated from Italian and refactored for standalone use.
 */

// Access native GAS PropertiesService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativePropertiesService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.PropertiesService (the mock).
function _getNativePropertiesService() {
  return global.__nativePropertiesService__ || global.PropertiesService;
}

/**
 * @class PropertiesService
 * @description Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _properties Native GAS Properties instance.
 */
```

<br>

## CLASS: PermissionService
**File Path:** `GoogleApiWrapper/src/services/PermissionService.js`
**Constructor Usage:** `const instance = new PermissionService();`
**Description:** BATCH-FIRST Permission Service with Advanced Drive API
Version 3.0 - GAW-HIGH-001 Implementation

BREAKING CHANGES:
- All methods use Advanced Drive API exclusively (no DriveApp fallback)
- All methods accept single items OR arrays for batch operations
- Email notifications are DISABLED by default (sendNotificationEmail: false)
- Methods return detailed per-item results for batch operations
- Requires Drive Advanced Service to be enabled in appsscript.json


/

// ===================================================================
// PERMISSION SERVICE - BATCH-FIRST IMPLEMENTATION
// ===================================================================
import { GoogleService } from '../internal/core/GoogleService';
/**
@class PermissionService
@extends GoogleService
Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/MyPermissionService.js
 * @description BATCH-FIRST Permission Service with Advanced Drive API
 * Version 3.0 - GAW-HIGH-001 Implementation
 *
 * BREAKING CHANGES:
 * - All methods use Advanced Drive API exclusively (no DriveApp fallback)
 * - All methods accept single items OR arrays for batch operations
 * - Email notifications are DISABLED by default (sendNotificationEmail: false)
 * - Methods return detailed per-item results for batch operations
 * - Requires Drive Advanced Service to be enabled in appsscript.json
 *
 * @version 3.0 - Batch operations with NO email notifications
 */

// ===================================================================
// PERMISSION SERVICE - BATCH-FIRST IMPLEMENTATION
// ===================================================================
import { GoogleService } from '../internal/core/GoogleService';
/**
 * @class PermissionService
 * @extends GoogleService
 * @description Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.
 */
```

<br>

## CLASS: MailService
**File Path:** `GoogleApiWrapper/src/services/MailService.js`
**Constructor Usage:** `const instance = new MailService();`
**Description:** Simplified service for sending emails via GmailApp/MailApp.
Provides quota-aware operations and batch processing.
/

import { HtmlSanitizer } from '@CoreUtilsLib';

/**
@class MailService
Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.

@property {LoggerService} _logger Diagnostic logger.
@property {UtilsService} _utils Foundational utilities (requires sleep).
@property {ExceptionService} _exceptionService Resiliency provider.
@property {number} _rateLimitMs Throttling delay between sequential operations.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/MailService.js
 * @description Simplified service for sending emails via GmailApp/MailApp.
 * Provides quota-aware operations and batch processing.
 */

import { HtmlSanitizer } from '@CoreUtilsLib';

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

<br>

## CLASS: LockService
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new LockService();`
**Description:** Facade for Google Apps Script's LockService.
Provides a clean, testable interface for script-level locking.

/

/**
@class LockService
Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.

@property {LoggerService} _logger Diagnostic logger.
@property {Object} _nativeLockService Reference to the global GAS LockService object.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/LockService.js
 * @description Facade for Google Apps Script's LockService.
 * Provides a clean, testable interface for script-level locking.
 * @version 1.0 - Created for performance optimization
 */

/**
 * @class LockService
 * @description Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {Object} _nativeLockService Reference to the global GAS LockService object.
 */
```

<br>

## CLASS: Lock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new Lock();`
**Description:** Initializes LockService and auto-detects native GAS LockService availability.
@param {LoggerService} logger Diagnostic logger.
/
  constructor(logger) {
    /**
Logger instance for operation logging.
@private
@type {LoggerService}
/
    this._logger = logger;

    /**
Native GAS LockService (if available).
@private
@type {GoogleAppsScript.Lock.LockService|null}
/
    // Detect native GAS LockService by checking for static getScriptLock method.
    // In webpack bundles, global.LockService may be our wrapper class (instance methods only),
    // so we verify the candidate has getScriptLock directly (not on prototype).
    const candidate =
      typeof global !== 'undefined' && global.LockService ? global.LockService : null;
    this._nativeLockService =
      candidate && typeof candidate.getScriptLock === 'function' ? candidate : null;
  }

  /**
Returns a Lock wrapper for the GAS Script Lock (global concurrency).
@returns {Lock|MockLock} Script lock implementation.
/
  getScriptLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring script lock from native LockService');
      return new Lock(this._nativeLockService.getScriptLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
Returns a Lock wrapper for the GAS User Lock (per-user concurrency).
@returns {Lock|MockLock} User lock implementation.
/
  getUserLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring user lock from native LockService');
      return new Lock(this._nativeLockService.getUserLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
Returns a Lock wrapper for the GAS Document Lock (per-document concurrency).
@param {string} documentId Target document identifier.
@returns {Lock|MockLock} Document lock implementation.
/
  getDocumentLock(documentId) {
    if (this._nativeLockService) {
      this._logger.debug(`Acquiring document lock for: ${documentId}`);
      return new Lock(this._nativeLockService.getDocumentLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }
}

/**
@private
@class Lock
Wrapper for native GAS Lock object. Provides consistent acquisition status and diagnostic logging.

@property {Object} _nativeLock Native GAS Lock instance.
@property {LoggerService} _logger Diagnostic logger.
@property {boolean} _acquired Current acquisition status.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes LockService and auto-detects native GAS LockService availability.
   * @param {LoggerService} logger Diagnostic logger.
   */
  constructor(logger) {
    /**
     * Logger instance for operation logging.
     * @private
     * @type {LoggerService}
     */
    this._logger = logger;

    /**
     * Native GAS LockService (if available).
     * @private
     * @type {GoogleAppsScript.Lock.LockService|null}
     */
    // Detect native GAS LockService by checking for static getScriptLock method.
    // In webpack bundles, global.LockService may be our wrapper class (instance methods only),
    // so we verify the candidate has getScriptLock directly (not on prototype).
    const candidate =
      typeof global !== 'undefined' && global.LockService ? global.LockService : null;
    this._nativeLockService =
      candidate && typeof candidate.getScriptLock === 'function' ? candidate : null;
  }

  /**
   * @description Returns a Lock wrapper for the GAS Script Lock (global concurrency).
   * @returns {Lock|MockLock} Script lock implementation.
   */
  getScriptLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring script lock from native LockService');
      return new Lock(this._nativeLockService.getScriptLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
   * @description Returns a Lock wrapper for the GAS User Lock (per-user concurrency).
   * @returns {Lock|MockLock} User lock implementation.
   */
  getUserLock() {
    if (this._nativeLockService) {
      this._logger.debug('Acquiring user lock from native LockService');
      return new Lock(this._nativeLockService.getUserLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }

  /**
   * @description Returns a Lock wrapper for the GAS Document Lock (per-document concurrency).
   * @param {string} documentId Target document identifier.
   * @returns {Lock|MockLock} Document lock implementation.
   */
  getDocumentLock(documentId) {
    if (this._nativeLockService) {
      this._logger.debug(`Acquiring document lock for: ${documentId}`);
      return new Lock(this._nativeLockService.getDocumentLock(), this._logger);
    } else {
      this._logger.warn('LockService not available - using mock lock for testing');
      return new MockLock(this._logger);
    }
  }
}

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

<br>

## CLASS: MockLock
**File Path:** `GoogleApiWrapper/src/services/LockService.js`
**Constructor Usage:** `const instance = new MockLock();`
**Description:** @param {GoogleAppsScript.Lock.Lock} nativeLock - Native GAS Lock object
@param {LoggerService} logger - Logger instance
/
  constructor(nativeLock, logger) {
    this._nativeLock = nativeLock;
    this._logger = logger;
    this._acquired = false;
  }

  /**
Non-blocking attempt to acquire lock.
@param {number} timeoutInMillis Maximum wait duration.
@returns {boolean} True if acquisition succeeded.
@throws {Error} On native acquisition failure.
/
  tryLock(timeoutInMillis) {
    try {
      this._acquired = this._nativeLock.tryLock(timeoutInMillis);
      if (this._acquired) {
        this._logger.debug(`Lock acquired with timeout: ${timeoutInMillis}ms`);
      } else {
        this._logger.debug(`Failed to acquire lock after: ${timeoutInMillis}ms`);
      }
      return this._acquired;
    } catch (error) {
      this._logger.error(`Error acquiring lock: ${error.message}`);
      throw error;
    }
  }

  /**
Blocking attempt to acquire lock. Throws on timeout.
@param {number} timeoutInMillis Maximum wait duration.
@throws {Error} If lock cannot be acquired within timeout.
/
  waitLock(timeoutInMillis) {
    try {
      this._nativeLock.waitLock(timeoutInMillis);
      this._acquired = true;
      this._logger.debug(`Lock acquired (wait) with timeout: ${timeoutInMillis}ms`);
    } catch (error) {
      this._logger.error(`Failed to wait for lock: ${error.message}`);
      throw error;
    }
  }

  /**
Relinquishes held lock. No-op if not acquired.
@throws {Error} On native release failure.
/
  releaseLock() {
    if (this._acquired) {
      try {
        this._nativeLock.releaseLock();
        this._logger.debug('Lock released');
        this._acquired = false;
      } catch (error) {
        this._logger.error(`Error releasing lock: ${error.message}`);
        throw error;
      }
    }
  }

  /**
Returns the local acquisition status of the lock.
@returns {boolean}
/
  hasLock() {
    return this._acquired;
  }
}

/**
@private
@class MockLock
Simulated lock for test environments. Always succeeds in acquisition.

### Raw JSDoc Context:
```javascript
/**
   * @param {GoogleAppsScript.Lock.Lock} nativeLock - Native GAS Lock object
   * @param {LoggerService} logger - Logger instance
   */
  constructor(nativeLock, logger) {
    this._nativeLock = nativeLock;
    this._logger = logger;
    this._acquired = false;
  }

  /**
   * @description Non-blocking attempt to acquire lock.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @returns {boolean} True if acquisition succeeded.
   * @throws {Error} On native acquisition failure.
   */
  tryLock(timeoutInMillis) {
    try {
      this._acquired = this._nativeLock.tryLock(timeoutInMillis);
      if (this._acquired) {
        this._logger.debug(`Lock acquired with timeout: ${timeoutInMillis}ms`);
      } else {
        this._logger.debug(`Failed to acquire lock after: ${timeoutInMillis}ms`);
      }
      return this._acquired;
    } catch (error) {
      this._logger.error(`Error acquiring lock: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Blocking attempt to acquire lock. Throws on timeout.
   * @param {number} timeoutInMillis Maximum wait duration.
   * @throws {Error} If lock cannot be acquired within timeout.
   */
  waitLock(timeoutInMillis) {
    try {
      this._nativeLock.waitLock(timeoutInMillis);
      this._acquired = true;
      this._logger.debug(`Lock acquired (wait) with timeout: ${timeoutInMillis}ms`);
    } catch (error) {
      this._logger.error(`Failed to wait for lock: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Relinquishes held lock. No-op if not acquired.
   * @throws {Error} On native release failure.
   */
  releaseLock() {
    if (this._acquired) {
      try {
        this._nativeLock.releaseLock();
        this._logger.debug('Lock released');
        this._acquired = false;
      } catch (error) {
        this._logger.error(`Error releasing lock: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * @description Returns the local acquisition status of the lock.
   * @returns {boolean}
   */
  hasLock() {
    return this._acquired;
  }
}

/**
 * @private
 * @class MockLock
 * @description Simulated lock for test environments. Always succeeds in acquisition.
 */
```

<br>

## CLASS: DriveService
**File Path:** `GoogleApiWrapper/src/services/DriveService.js`
**Constructor Usage:** `const instance = new DriveService();`
**Description:** BATCH-FIRST Drive Service with Advanced Drive API
Version 3.0 - GAW-HIGH-001 Implementation

BREAKING CHANGES:
- All methods use Advanced Drive API exclusively (no DriveApp fallback)
- All mutation methods accept single items OR arrays for batch operations
- Methods return detailed per-item results for batch operations
- Requires Drive Advanced Service to be enabled in appsscript.json


/

// ===================================================================
// DRIVE SERVICE - BATCH-FIRST IMPLEMENTATION
// ===================================================================

import { GoogleService } from '../internal/core/GoogleService';
import { DriveFileManager } from './drive/DriveFileManager';
import { DriveFolderManager } from './drive/DriveFolderManager';
import { DriveShortcutHandler } from './drive/DriveShortcutHandler';
import { DriveMetadataService } from './drive/DriveMetadataService';

/**
@class DriveService
@extends GoogleService
Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.

@property {DriveFileManager} fileManager Logic for file mutations.
@property {DriveFolderManager} folderManager Logic for folder mutations.
@property {DriveShortcutHandler} shortcutHandler Logic for shortcut processing.
@property {DriveMetadataService} metadataService Logic for metadata and search.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DriveService.js
 * @description BATCH-FIRST Drive Service with Advanced Drive API
 * Version 3.0 - GAW-HIGH-001 Implementation
 *
 * BREAKING CHANGES:
 * - All methods use Advanced Drive API exclusively (no DriveApp fallback)
 * - All mutation methods accept single items OR arrays for batch operations
 * - Methods return detailed per-item results for batch operations
 * - Requires Drive Advanced Service to be enabled in appsscript.json
 *
 * @version 3.0 - Batch operations with Advanced Drive API
 */

// ===================================================================
// DRIVE SERVICE - BATCH-FIRST IMPLEMENTATION
// ===================================================================

import { GoogleService } from '../internal/core/GoogleService';
import { DriveFileManager } from './drive/DriveFileManager';
import { DriveFolderManager } from './drive/DriveFolderManager';
import { DriveShortcutHandler } from './drive/DriveShortcutHandler';
import { DriveMetadataService } from './drive/DriveMetadataService';

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

<br>

## CLASS: DocumentService
**File Path:** `GoogleApiWrapper/src/services/DocumentService.js`
**Constructor Usage:** `const instance = new DocumentService();`
**Description:** Stateless service for manipulating Google Documents using Advanced Docs API v1 with batch operations.
Provides a fluent API for creating, modifying, and formatting documents, tables, and document structure.

/

import { Delegation } from '@CoreUtilsLib';
import { GoogleService } from '../internal/core/GoogleService.js';
import { DocumentBuilder } from './DocumentBuilder.js';
export { DocumentBuilder };
import { DocumentTableManager } from '../internal/services-managers/DocumentTableManager.js';
import { DocumentContentExtractor } from '../internal/services-managers/DocumentContentExtractor.js';
import { DocumentBatchUpdateHandler } from '../internal/services-managers/DocumentBatchUpdateHandler.js';

/**
@class DocumentService
@extends GoogleService
Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.

@property {DocumentTableManager} _tableManager Logic for table structure and data.
@property {DocumentContentExtractor} _contentExtractor Logic for document parsing.
@property {DocumentBatchUpdateHandler} _batchUpdateHandler Logic for atomic mutations.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DocumentService.js
 * @description Stateless service for manipulating Google Documents using Advanced Docs API v1 with batch operations.
 * Provides a fluent API for creating, modifying, and formatting documents, tables, and document structure.
 * @version 4.0 - Refactored using Facade/Delegation pattern.
 */

import { Delegation } from '@CoreUtilsLib';
import { GoogleService } from '../internal/core/GoogleService.js';
import { DocumentBuilder } from './DocumentBuilder.js';
export { DocumentBuilder };
import { DocumentTableManager } from '../internal/services-managers/DocumentTableManager.js';
import { DocumentContentExtractor } from '../internal/services-managers/DocumentContentExtractor.js';
import { DocumentBatchUpdateHandler } from '../internal/services-managers/DocumentBatchUpdateHandler.js';

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

<br>

## CLASS: DocumentBuilder
**File Path:** `GoogleApiWrapper/src/services/DocumentBuilder.js`
**Constructor Usage:** `const instance = new DocumentBuilder();`
**Description:** Builder class for fluent Google Docs document operations with atomic batch execution.
/

/**
@class DocumentBuilder
Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.

@property {string} documentId Target document identifier.
@property {GoogleService} service Reference to the Google Docs service.
@property {Array<Object>} operations Queue of pending document mutations.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DocumentBuilder.js
 * @description Builder class for fluent Google Docs document operations with atomic batch execution.
 */

/**
 * @class DocumentBuilder
 * @description Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.
 *
 * @property {string} documentId Target document identifier.
 * @property {GoogleService} service Reference to the Google Docs service.
 * @property {Array<Object>} operations Queue of pending document mutations.
 */
```

<br>

## CLASS: CacheService
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new CacheService();`
**Description:** Facade for Google Apps Script's CacheService.
Provides a consistent interface for caching with error handling and logging.
/

// Access native GAS CacheService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativeCacheService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.CacheService (the mock).
function _getNativeCacheService() {
  return global.__nativeCacheService__ || global.CacheService;
}

/**
@class CacheService
Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.

@property {LoggerService} _logger Diagnostic logger.
@property {ExceptionService} _exceptionService Resiliency provider.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/CacheService.js
 * @description Facade for Google Apps Script's CacheService.
 * Provides a consistent interface for caching with error handling and logging.
 */

// Access native GAS CacheService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativeCacheService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.CacheService (the mock).
function _getNativeCacheService() {
  return global.__nativeCacheService__ || global.CacheService;
}

/**
 * @class CacheService
 * @description Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {ExceptionService} _exceptionService Resiliency provider.
 */
```

<br>

## CLASS: Cache
**File Path:** `GoogleApiWrapper/src/services/CacheService.js`
**Constructor Usage:** `const instance = new Cache();`
**Description:** Initializes CacheService with optional logging and resiliency providers.
@param {LoggerService} [logger=console] Diagnostic logger.
@param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
/
  constructor(logger = console, exceptionService = null) {
    this._logger = logger || console;
    this._exceptionService = exceptionService;
  }

  /**
Returns a Cache wrapper for the GAS Script Cache (global scope).
@returns {Cache} Script cache wrapper.
@throws {Error} If native CacheService is unavailable.
/
  getScriptCache() {
    try {
      const gasCache = _getNativeCacheService().getScriptCache();
      this._logger.debug('Retrieved script cache');
      return new Cache(gasCache, this._logger, 'script');
    } catch (error) {
      this._logger.error(`Error getting script cache: ${error.message}`);
      throw error;
    }
  }

  /**
Returns a Cache wrapper for the GAS User Cache (per-user scope).
@returns {Cache} User cache wrapper.
@throws {Error} If native CacheService is unavailable.
/
  getUserCache() {
    try {
      const gasCache = _getNativeCacheService().getUserCache();
      this._logger.debug('Retrieved user cache');
      return new Cache(gasCache, this._logger, 'user');
    } catch (error) {
      this._logger.error(`Error getting user cache: ${error.message}`);
      throw error;
    }
  }

  /**
Returns a Cache wrapper for the GAS Document Cache (per-document scope).
@returns {Cache} Document cache wrapper.
@throws {Error} If native CacheService is unavailable or if called from a standalone script.
/
  getDocumentCache() {
    try {
      const gasCache = _getNativeCacheService().getDocumentCache();
      this._logger.debug('Retrieved document cache');
      return new Cache(gasCache, this._logger, 'document');
    } catch (error) {
      this._logger.error(`Error getting document cache: ${error.message}`);
      throw error;
    }
  }

  /**
@static
Native GAS Script Cache accessor (backward compatibility).
@returns {Object} Native GAS script cache.
/
  static getScriptCache() {
    return _getNativeCacheService().getScriptCache();
  }

  /**
@static
Native GAS User Cache accessor.
@returns {Object} Native GAS user cache.
/
  static getUserCache() {
    return _getNativeCacheService().getUserCache();
  }

  /**
@static
Native GAS Document Cache accessor.
@returns {Object} Native GAS document cache.
/
  static getDocumentCache() {
    return _getNativeCacheService().getDocumentCache();
  }
}

/**
@class Cache
Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.

@property {Object} _cache Native GAS Cache instance.
@property {LoggerService} _logger Diagnostic logger.
@property {string} _type Cache scope identifier ('script', 'user', 'document').
@property {Set<string>} _trackedKeys Set of keys modified in current instance.
@property {boolean} _autoTrackKeys Enable/disable key tracking.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes CacheService with optional logging and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
   */
  constructor(logger = console, exceptionService = null) {
    this._logger = logger || console;
    this._exceptionService = exceptionService;
  }

  /**
   * @description Returns a Cache wrapper for the GAS Script Cache (global scope).
   * @returns {Cache} Script cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
  getScriptCache() {
    try {
      const gasCache = _getNativeCacheService().getScriptCache();
      this._logger.debug('Retrieved script cache');
      return new Cache(gasCache, this._logger, 'script');
    } catch (error) {
      this._logger.error(`Error getting script cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns a Cache wrapper for the GAS User Cache (per-user scope).
   * @returns {Cache} User cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
  getUserCache() {
    try {
      const gasCache = _getNativeCacheService().getUserCache();
      this._logger.debug('Retrieved user cache');
      return new Cache(gasCache, this._logger, 'user');
    } catch (error) {
      this._logger.error(`Error getting user cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns a Cache wrapper for the GAS Document Cache (per-document scope).
   * @returns {Cache} Document cache wrapper.
   * @throws {Error} If native CacheService is unavailable or if called from a standalone script.
   */
  getDocumentCache() {
    try {
      const gasCache = _getNativeCacheService().getDocumentCache();
      this._logger.debug('Retrieved document cache');
      return new Cache(gasCache, this._logger, 'document');
    } catch (error) {
      this._logger.error(`Error getting document cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @static
   * @description Native GAS Script Cache accessor (backward compatibility).
   * @returns {Object} Native GAS script cache.
   */
  static getScriptCache() {
    return _getNativeCacheService().getScriptCache();
  }

  /**
   * @static
   * @description Native GAS User Cache accessor.
   * @returns {Object} Native GAS user cache.
   */
  static getUserCache() {
    return _getNativeCacheService().getUserCache();
  }

  /**
   * @static
   * @description Native GAS Document Cache accessor.
   * @returns {Object} Native GAS document cache.
   */
  static getDocumentCache() {
    return _getNativeCacheService().getDocumentCache();
  }
}

/**
 * @class Cache
 * @description Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.
 *
 * @property {Object} _cache Native GAS Cache instance.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {string} _type Cache scope identifier ('script', 'user', 'document').
 * @property {Set<string>} _trackedKeys Set of keys modified in current instance.
 * @property {boolean} _autoTrackKeys Enable/disable key tracking.
 */
```

<br>

## CLASS: DriveShortcutHandler
**File Path:** `GoogleApiWrapper/src/services/drive/DriveShortcutHandler.js`
**Constructor Usage:** `const instance = new DriveShortcutHandler();`
**Description:** Encapsulates shortcut operations for DriveService.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DriveShortcutHandler.js
 * @description Encapsulates shortcut operations for DriveService.
 */
```

### Methods of DriveShortcutHandler

#### METHOD: DriveShortcutHandler.createShortcut
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveShortcutHandler.createShortcut(targetId, name, parentId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a Google Drive Shortcut (pointer) to a target resource.
   * @param {string} targetId Target file/folder identifier.
   * @param {string} name Shortcut display name.
   * @param {string} [parentId=null] Destination folder ID.
   * @returns {Object} Shortcut metadata including shortcutDetails.
   */
```
---
#### METHOD: DriveShortcutHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `driveShortcutHandler.if(parentId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveShortcutHandler.getTargetId
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveShortcutHandler.getTargetId(shortcutId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves the target ID from a shortcut resource.
   * @param {string} shortcutId Shortcut resource identifier.
   * @returns {string|null} Target ID or null if resource is not a shortcut.
   */
```
---
#### METHOD: DriveShortcutHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `driveShortcutHandler.if(file && file.mimeType);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveShortcutHandler.isShortcut
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveShortcutHandler.isShortcut(fileId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates if a resource is a Google Drive Shortcut.
   * @param {string} fileId Resource identifier.
   * @returns {boolean}
   */
```
---
<br>

## CLASS: DriveMetadataService
**File Path:** `GoogleApiWrapper/src/services/drive/DriveMetadataService.js`
**Constructor Usage:** `const instance = new DriveMetadataService();`
**Description:** Encapsulates metadata operations for DriveService.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DriveMetadataService.js
 * @description Encapsulates metadata operations for DriveService.
 */
```

### Methods of DriveMetadataService

#### METHOD: DriveMetadataService.updateMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveMetadataService.updateMetadata(updateRequests, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Batch updates file/folder metadata fields (name, description, starred, properties, etc.). Automates per-item retry and cache invalidation.
   * @param {Object|Object[]} updateRequests Collection of {fileId, metadata}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
```
---
#### METHOD: DriveMetadataService.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveMetadataService.getFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveMetadataService.getFiles(fileIds, options, options.fields);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves file/folder metadata with intelligent caching. Transparently merges cached metadata with batch API results.
   * @param {string|string[]} fileIds Resource ID(s) to fetch.
   * @param {Object} [options={}] Operation settings.
   * @param {string} [options.fields] Comma-separated fields to retrieve (defaults to comprehensive metadata set).
   * @returns {Object|Object<string, Object>} Metadata object (single) or ID-to-Metadata map (batch).
   * @throws {ServiceError} On execution failure.
   */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(cached);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveMetadataService.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(uncachedIds.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveMetadataService.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveMetadataService.getFileOwnerEmail
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveMetadataService.getFileOwnerEmail(fileId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the email address of a Drive file's owner, reusing `getFiles`'
   * caching/retry behaviour (the `owners` field is already part of its default field set).
   * @param {string} fileId Resource ID.
   * @returns {string|null} Owner email, or null when no owner is present (e.g. a Shared Drive file).
   * @throws {ServiceError} On execution failure.
   */
```
---
#### METHOD: DriveMetadataService.searchFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveMetadataService.searchFiles(query, options, options.maxResults, options.orderBy);`
- **Pure JSDoc:**
```javascript
/**
   * @description Performs paginated file search using Google Drive Query Language.
   * @param {string} query Search query string.
   * @param {Object} [options={}] Operation settings.
   * @param {number} [options.maxResults=Infinity] Upper bound for result count.
   * @param {string} [options.orderBy] Sorting criteria (e.g., 'modifiedTime desc').
   * @returns {Object[]} Collection of matching file metadata objects.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid query syntax.
   */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(pageToken);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(orderBy);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(results.files && results.files.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveMetadataService.if
- **Scope:** instance
- **LLM Call Syntax:** `driveMetadataService.if(allFiles.length >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DriveFolderManager
**File Path:** `GoogleApiWrapper/src/services/drive/DriveFolderManager.js`
**Constructor Usage:** `const instance = new DriveFolderManager();`
**Description:** Encapsulates folder-level operations for DriveService.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DriveFolderManager.js
 * @description Encapsulates folder-level operations for DriveService.
 */
```

### Methods of DriveFolderManager

#### METHOD: DriveFolderManager.createFolder
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFolderManager.createFolder(folderName, parentFolderId, options, options.returnExistingIfFound);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a Google Drive folder. Supports parent targeting and idempotency via deduplication.
   * @param {string} folderName Target folder name.
   * @param {string} [parentFolderId=null] Parent identifier (defaults to "My Drive").
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.returnExistingIfFound=false] Retrieve first match if name exists in parent.
   * @returns {Object} Folder metadata {id, name, mimeType, parents, webViewLink}.
   * @throws {PermissionDeniedError} On auth/scope failure.
   * @throws {ResourceNotFoundError} If parent folder is missing.
   * @throws {QuotaExceededError} If storage limit reached.
   * @throws {ValidationError} On invalid input.
   */
```
---
#### METHOD: DriveFolderManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFolderManager.if(options.returnExistingIfFound);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFolderManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFolderManager.if(existing.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFolderManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFolderManager.if(parentFolderId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFolderManager.getFolderByIdStandard
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFolderManager.getFolderByIdStandard(folderId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses folder via native DriveApp (standard API). Enables use of folder-specific iterators and methods.
   * @param {string} folderId Target resource identifier.
   * @returns {GoogleAppsScript.Drive.Folder} Native GAS Drive Folder object.
   * @throws {ResourceNotFoundError} If folder is missing.
   * @throws {PermissionDeniedError} If access is denied.
   */
```
---
#### METHOD: DriveFolderManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFolderManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFolderManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFolderManager.if(this._exceptionService);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DriveFileManager
**File Path:** `GoogleApiWrapper/src/services/drive/DriveFileManager.js`
**Constructor Usage:** `const instance = new DriveFileManager();`
**Description:** Encapsulates file-level operations for DriveService.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/DriveFileManager.js
 * @description Encapsulates file-level operations for DriveService.
 */
```

### Methods of DriveFileManager

#### METHOD: DriveFileManager.deleteFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.deleteFiles(fileIds, options, options.permanently);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deletes or trashes files/folders. Supports single ID or batch array. Automates per-item retry and cache invalidation.
   * @param {string|string[]} fileIds Resource ID(s) to process.
   * @param {Object} [options={}] Operation settings.
   * @param {boolean} [options.permanently=false] Skip trash (irreversible).
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid input.
   */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.restoreFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.restoreFiles(fileIds, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Restores files/folders from trash. Supports single ID or batch array. Automates per-item retry and cache invalidation.
   * @param {string|string[]} fileIds Resource ID(s) to restore.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.copyFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.copyFiles(copyRequests, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Copies files via Advanced Drive API. Supports single request or batch array. Note: Does not support folder copying.
   * @param {Object|Object[]} copyRequests Collection of {fileId, name, destinationFolder}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(req.destinationFolder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.moveFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.moveFiles(moveRequests, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Moves files/folders to new parents. Implements N+1 optimization by batching parent metadata lookups.
   * @param {Object|Object[]} moveRequests Collection of {fileId, newParent, removeFromOtherParents}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On invalid request format.
   */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(filesNeedingParentInfo.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(fileMetadata && fileMetadata.parents);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(req.removeFromOtherParents);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(parents.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.renameFiles
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.renameFiles(renameRequests, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renames files/folders via Advanced Drive API. Supports single request or batch array.
   * @param {Object|Object[]} renameRequests Collection of {fileId, newName}.
   * @param {Object} [options={}] Operation settings.
   * @returns {Object} Result summary {successful: Array<{id, status, data}>, failed: Array<{id, status, error}>}.
   * @throws {ServiceError} On execution failure.
   * @throws {ValidationError} On missing names or invalid format.
   */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.getFileByIdStandard
- **Scope:** instance
- **LLM Call Syntax:** `const result = driveFileManager.getFileByIdStandard(fileId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Accesses file/folder via native DriveApp (standard API). Auto-detects resource type.
   * @param {string} fileId Target resource identifier.
   * @returns {GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder} Native GAS Drive object.
   * @throws {ResourceNotFoundError} If resource is missing.
   * @throws {PermissionDeniedError} If access is denied.
   */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(_folderError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DriveFileManager.if
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.if(this._exceptionService);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DriveFileManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `driveFileManager.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: RateLimiter
**File Path:** `GoogleApiWrapper/src/internal/RateLimiter.js`
**Constructor Usage:** `const instance = new RateLimiter();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of RateLimiter

#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(config.requestsPerSecond !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(refillRate <);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(burstCapacity < 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(maxWaitThresholdMs < 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(typeof utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(!this._buckets[operationName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.tryAcquire
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.tryAcquire(operationName, tokensRequired);`
- **Pure JSDoc:**
```javascript
/** Method tryAcquire */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(typeof tokensRequired !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(bucket.tokens >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.waitForToken
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.waitForToken(operationName, tokensRequired, _maxWaitMs);`
- **Pure JSDoc:**
```javascript
/** Method waitForToken */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(bucket.tokens >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(requiredWaitMs > this._maxWaitThresholdMs || !this._utils);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RateLimiter.acquire
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.acquire(operationName, tokensRequired);`
- **Pure JSDoc:**
```javascript
/** Method acquire */
```
---
#### METHOD: RateLimiter.reset
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.reset(operationName);`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
#### METHOD: RateLimiter.resetAll
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.resetAll();`
- **Pure JSDoc:**
```javascript
/** Method resetAll */
```
---
#### METHOD: RateLimiter.getStats
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.getStats(operationName);`
- **Pure JSDoc:**
```javascript
/** Method getStats */
```
---
#### METHOD: RateLimiter.getGlobalStats
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.getGlobalStats();`
- **Pure JSDoc:**
```javascript
/** Method getGlobalStats */
```
---
#### METHOD: RateLimiter.if
- **Scope:** instance
- **LLM Call Syntax:** `rateLimiter.if(this._logger && typeof this._logger.debug);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TextStyleMapper
**File Path:** `GoogleApiWrapper/src/internal/services-managers/TextStyleMapper.js`
**Constructor Usage:** `const instance = new TextStyleMapper();`
**Description:** Converts an Advanced Docs API TextStyle POJO (as captured by
DocumentContentExtractor at scan time) into the native DocumentApp.Attribute
object shape required by Text.setAttributes(). Native-only boundary (L2).

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/internal/services-managers/TextStyleMapper.js
 * @description Converts an Advanced Docs API TextStyle POJO (as captured by
 * DocumentContentExtractor at scan time) into the native DocumentApp.Attribute
 * object shape required by Text.setAttributes(). Native-only boundary (L2).
 */
```

### Methods of TextStyleMapper

#### METHOD: TextStyleMapper.toNativeAttributes
- **Scope:** static
- **LLM Call Syntax:** `const result = TextStyleMapper.toNativeAttributes(textStyle);`
- **Pure JSDoc:**
```javascript
/**
   * @param {Object} textStyle Advanced-API TextStyle POJO, any subset of fields.
   * @returns {Object} Native DocumentApp.Attribute-keyed object; only fields present in `textStyle` are included.
   */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(!textStyle || typeof textStyle !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(typeof textStyle.bold);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(typeof textStyle.italic);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(typeof textStyle.underline);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(typeof textStyle.strikethrough);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(textStyle.fontSize && typeof textStyle.fontSize.magnitude);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(textStyle.weightedFontFamily && textStyle.weightedFontFamily.fontFamily);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TextStyleMapper.if
- **Scope:** instance
- **LLM Call Syntax:** `textStyleMapper.if(textStyle.foregroundColor &&
      textStyle.foregroundColor.color &&
      textStyle.foregroundColor.color.rgbColor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SpreadsheetRangeManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetRangeManager.js`
**Constructor Usage:** `const instance = new SpreadsheetRangeManager();`
**Description:** Manager for spreadsheet value and range operations.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetRangeManager.js
 * @description Manager for spreadsheet value and range operations.
 */
```

### Methods of SpreadsheetRangeManager

#### METHOD: SpreadsheetRangeManager.updateRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.updateRanges(spreadsheetId, updates, options);`
- **Pure JSDoc:**
```javascript
/** Method updateRanges */
```
---
#### METHOD: SpreadsheetRangeManager.getRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.getRanges(spreadsheetId, ranges, options);`
- **Pure JSDoc:**
```javascript
/** Method getRanges */
```
---
#### METHOD: SpreadsheetRangeManager.appendRows
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.appendRows(spreadsheetId, appends, options);`
- **Pure JSDoc:**
```javascript
/** Method appendRows */
```
---
#### METHOD: SpreadsheetRangeManager.insertRow
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.insertRow(spreadsheetId, sheetName, rowData, options);`
- **Pure JSDoc:**
```javascript
/** Method insertRow */
```
---
#### METHOD: SpreadsheetRangeManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: SpreadsheetRangeManager.getLastError
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.getLastError();`
- **Pure JSDoc:**
```javascript
/** Method getLastError */
```
---
#### METHOD: SpreadsheetRangeManager.clearRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetRangeManager.clearRanges(spreadsheetId, ranges, options);`
- **Pure JSDoc:**
```javascript
/** Method clearRanges */
```
---
<br>

## CLASS: SpreadsheetMetadataCache
**File Path:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetMetadataCache.js`
**Constructor Usage:** `const instance = new SpreadsheetMetadataCache();`
**Description:** Manager for spreadsheet metadata retrieval and in-memory caching.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetMetadataCache.js
 * @description Manager for spreadsheet metadata retrieval and in-memory caching.
 */
```

### Methods of SpreadsheetMetadataCache

#### METHOD: SpreadsheetMetadataCache.getSpreadsheetMetadata
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.getSpreadsheetMetadata(spreadsheetId, options);`
- **Pure JSDoc:**
```javascript
/** Method getSpreadsheetMetadata */
```
---
#### METHOD: SpreadsheetMetadataCache.getSheetInfo
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.getSheetInfo(spreadsheetId, options);`
- **Pure JSDoc:**
```javascript
/** Method getSheetInfo */
```
---
#### METHOD: SpreadsheetMetadataCache.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.if(!includeHidden);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetMetadataCache.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.if(this._sheetIdCache[spreadsheetId]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetMetadataCache.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.if(spreadsheetId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetMetadataCache.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.if(isColumnOnly);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetMetadataCache.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.if(isRowOnly);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetMetadataCache.for
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetMetadataCache.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
<br>

## CLASS: SpreadsheetHybridManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetHybridManager.js`
**Constructor Usage:** `const instance = new SpreadsheetHybridManager();`
**Description:** Manager for hybrid operations and "escape hatch" methods (Standard API).

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetHybridManager.js
 * @description Manager for hybrid operations and "escape hatch" methods (Standard API).
 */
```

### Methods of SpreadsheetHybridManager

#### METHOD: SpreadsheetHybridManager.createSpreadsheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = spreadsheetHybridManager.createSpreadsheet(title, options, options.destinationFolder);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a new blank spreadsheet via Advanced Sheets API (no template copy required).
   * @param {string} title Spreadsheet title.
   * @param {Object} [options={}] Creation options.
   * @param {string} [options.destinationFolder] Target folder ID; moved there via Advanced Drive API after creation (Sheets API always creates in Drive root).
   * @returns {Object} Advanced Sheets API spreadsheet resource.
   */
```
---
#### METHOD: SpreadsheetHybridManager.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.if(options.sheets);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetHybridManager.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.if(options.destinationFolder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetHybridManager.openStandard
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.openStandard(spreadsheetId);`
- **Pure JSDoc:**
```javascript
/** Method openStandard */
```
---
#### METHOD: SpreadsheetHybridManager.getActiveStandard
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.getActiveStandard();`
- **Pure JSDoc:**
```javascript
/** Method getActiveStandard */
```
---
#### METHOD: SpreadsheetHybridManager.getStandardApp
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.getStandardApp();`
- **Pure JSDoc:**
```javascript
/** Method getStandardApp */
```
---
#### METHOD: SpreadsheetHybridManager.flushBatch
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.flushBatch();`
- **Pure JSDoc:**
```javascript
/** Method flushBatch */
```
---
#### METHOD: SpreadsheetHybridManager.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetHybridManager.if(typeof Sheets);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SpreadsheetGridManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetGridManager.js`
**Constructor Usage:** `const instance = new SpreadsheetGridManager();`
**Description:** Manager for structural and formatting changes (sheets, widths, formats, protections).

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetGridManager.js
 * @description Manager for structural and formatting changes (sheets, widths, formats, protections).
 */
```

### Methods of SpreadsheetGridManager

#### METHOD: SpreadsheetGridManager.formatRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.formatRanges(spreadsheetId, formatRequests, options);`
- **Pure JSDoc:**
```javascript
/** Method formatRanges */
```
---
#### METHOD: SpreadsheetGridManager.setColumnWidths
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.setColumnWidths(spreadsheetId, widthRequests, _options);`
- **Pure JSDoc:**
```javascript
/** Method setColumnWidths */
```
---
#### METHOD: SpreadsheetGridManager.createSheets
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.createSheets(spreadsheetId, sheetRequests, options);`
- **Pure JSDoc:**
```javascript
/** Method createSheets */
```
---
#### METHOD: SpreadsheetGridManager.deleteSheets
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.deleteSheets(spreadsheetId, sheetIds, options);`
- **Pure JSDoc:**
```javascript
/** Method deleteSheets */
```
---
#### METHOD: SpreadsheetGridManager.deleteRow
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.deleteRow(spreadsheetId, sheetName, rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method deleteRow */
```
---
#### METHOD: SpreadsheetGridManager.deleteRows
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.deleteRows(spreadsheetId, sheetName, rowIndices);`
- **Pure JSDoc:**
```javascript
/** Method deleteRows */
```
---
#### METHOD: SpreadsheetGridManager.expandSheetGrid
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.expandSheetGrid(spreadsheetId, sheetId, rowCount, columnCount);`
- **Pure JSDoc:**
```javascript
/** Method expandSheetGrid */
```
---
#### METHOD: SpreadsheetGridManager.getProtectedRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.getProtectedRanges(spreadsheetId, sheetName);`
- **Pure JSDoc:**
```javascript
/** Method getProtectedRanges */
```
---
#### METHOD: SpreadsheetGridManager.deleteProtectedRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.deleteProtectedRanges(spreadsheetId, protectedRangeIds);`
- **Pure JSDoc:**
```javascript
/** Method deleteProtectedRanges */
```
---
#### METHOD: SpreadsheetGridManager.protectRanges
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.protectRanges(spreadsheetId, protectionRequests, options);`
- **Pure JSDoc:**
```javascript
/** Method protectRanges */
```
---
#### METHOD: SpreadsheetGridManager.if
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.if(options.onError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SpreadsheetGridManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `spreadsheetGridManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: DocumentTableManager
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentTableManager.js`
**Constructor Usage:** `const instance = new DocumentTableManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(doc.body && doc.body.content);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(element.table);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(const element of doc.body.content);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(element.table && currentTableIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(element.table);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getTableRow(documentId, tableIndex, rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method getTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getTableColumn(documentId, tableIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getTableColumn */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.insertTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.insertTableRow(documentId, tableIndex, rowIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method insertTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.appendTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.appendTableRow(documentId, tableIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method appendTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(const value of cellValues);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.deleteTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.deleteTableRow(documentId, tableIndex, rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method deleteTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.updateTableCell
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.updateTableCell(documentId, tableIndex, rowIndex, columnIndex, value);`
- **Pure JSDoc:**
```javascript
/** Method updateTableCell */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.updateTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.updateTableRow(documentId, tableIndex, rowIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method updateTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.updateTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.updateTableColumn(documentId, tableIndex, columnIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method updateTableColumn */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.copyTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.copyTableRow(documentId, tableIndex, sourceRowIndex, targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method copyTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(numRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(sourceColumnIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(targetColumnIndex > numCells);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setCellRunStyles
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentTableManager.setCellRunStyles(documentId, tableIndex, rowIndex, columnIndex, {Array<{rendered:);`
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(const segment of segments);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(rendered.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.deleteTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.deleteTableColumn(documentId, tableIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method deleteTableColumn */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(numRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.insertTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.insertTableColumn(documentId, tableIndex, columnIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method insertTableColumn */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(numRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.appendTableColumn
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.appendTableColumn(documentId, tableIndex, cellValues);`
- **Pure JSDoc:**
```javascript
/** Method appendTableColumn */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(numRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setColumnWidth
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setColumnWidth(documentId, tableIndex, columnIndex, widthPoints);`
- **Pure JSDoc:**
```javascript
/** Method setColumnWidth */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getColumnWidth
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getColumnWidth(documentId, tableIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getColumnWidth */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setRowBackgroundColor
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setRowBackgroundColor(documentId, tableIndex, rowIndex, color);`
- **Pure JSDoc:**
```javascript
/** Method setRowBackgroundColor */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setRowMinimumHeight
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setRowMinimumHeight(documentId, tableIndex, rowIndex, heightPoints);`
- **Pure JSDoc:**
```javascript
/** Method setRowMinimumHeight */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getRowMinimumHeight
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getRowMinimumHeight(documentId, tableIndex, rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method getRowMinimumHeight */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.clearTableRow
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.clearTableRow(documentId, tableIndex, rowIndex);`
- **Pure JSDoc:**
```javascript
/** Method clearTableRow */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setCellBackgroundColor
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setCellBackgroundColor(documentId, tableIndex, rowIndex, columnIndex, color);`
- **Pure JSDoc:**
```javascript
/** Method setCellBackgroundColor */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getCellBackgroundColor
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getCellBackgroundColor(documentId, tableIndex, rowIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getCellBackgroundColor */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setCellPadding
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setCellPadding(documentId, tableIndex, rowIndex, columnIndex, padding);`
- **Pure JSDoc:**
```javascript
/** Method setCellPadding */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(padding.top !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(padding.bottom !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(padding.left !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(padding.right !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getCellPadding
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getCellPadding(documentId, tableIndex, rowIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getCellPadding */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setCellVerticalAlignment
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setCellVerticalAlignment(documentId, tableIndex, rowIndex, columnIndex, alignment);`
- **Pure JSDoc:**
```javascript
/** Method setCellVerticalAlignment */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(!verticalAlignment);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getCellVerticalAlignment
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getCellVerticalAlignment(documentId, tableIndex, rowIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getCellVerticalAlignment */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getCellDetails
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getCellDetails(documentId, tableIndex, rowIndex, columnIndex);`
- **Pure JSDoc:**
```javascript
/** Method getCellDetails */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.getTableMetadata
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.getTableMetadata(documentId, tableIndex);`
- **Pure JSDoc:**
```javascript
/** Method getTableMetadata */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(numRows > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setRowTextAlignment
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setRowTextAlignment(documentId, tableIndex, rowIndex, alignment);`
- **Pure JSDoc:**
```javascript
/** Method setRowTextAlignment */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(!horizontalAlignment);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.setRowBold
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.setRowBold(documentId, tableIndex, rowIndex, bold);`
- **Pure JSDoc:**
```javascript
/** Method setRowBold */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(tableIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(options.headerRow && data.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(options.alternatingRows && data.length > 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(rowIndex % 2);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.for
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.for(let colIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentTableManager.if
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.if(!rangeElement);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentTableManager.while
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.while(typeof element.getParent);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: DocumentTableManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentTableManager.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: DocumentContentExtractor
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentContentExtractor.js`
**Constructor Usage:** `const instance = new DocumentContentExtractor();`
**Description:** Specialized manager for extracting and parsing Google Documents content.
Converts complex document structures into POJOs for decoupling from GAS APIs.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/DocumentContentExtractor.js
 * @description Specialized manager for extracting and parsing Google Documents content.
 * Converts complex document structures into POJOs for decoupling from GAS APIs.
 */
```

<br>

## CLASS: const
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentContentExtractor.js`
**Constructor Usage:** `const instance = new const();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: DocumentBatchUpdateHandler
**File Path:** `GoogleApiWrapper/src/internal/services-managers/DocumentBatchUpdateHandler.js`
**Constructor Usage:** `const instance = new DocumentBatchUpdateHandler();`
**Description:** Specialized manager for Google Documents batch operations and core mutations.
Handles Docs API batchUpdate, PDF export, and bulk document operations.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/services/managers/DocumentBatchUpdateHandler.js
 * @description Specialized manager for Google Documents batch operations and core mutations.
 * Handles Docs API batchUpdate, PDF export, and bulk document operations.
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
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(options.destinationFolder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(ids.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(!requests || requests.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(op.destinationFolderId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentBatchUpdateHandler.for
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.for(const docId of ids);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: DocumentBatchUpdateHandler.for
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.for(const docId of ids);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(op.text);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DocumentBatchUpdateHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.if(op.text);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentBatchUpdateHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentBatchUpdateHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: ServiceFactory
**File Path:** `GoogleApiWrapper/src/internal/core/ServiceFactory.js`
**Constructor Usage:** `const instance = new ServiceFactory();`
**Description:** Centralized service container for dependency injection.
Provides factory methods to create fully-wired service instances.

/

import { LoggerService, UtilsService } from '@CoreUtilsLib';
import { ExceptionService } from '@GasResilienceLib';
import { CacheService } from '../../services/CacheService.js';
import { UtilitiesService } from '../../services/UtilitiesService.js';
import { DriveService } from '../../services/DriveService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { SpreadsheetService } from '../../services/SpreadsheetService.js';
import { MailService } from '../../services/MailService.js';
import { PermissionService } from '../../services/PermissionService.js';
import { PropertiesService } from '../../services/PropertiesService.js';
import { TriggerService } from '../../services/TriggerService.js';
import { UiService } from '../../services/UiService.js';
import { UserService } from '../../services/UserService.js';

/**
@class ServiceFactory
Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.

@static
@property {LoggerService} _logger Shared diagnostic logger.
@property {UtilsService} _utils Shared foundational utilities.
@property {Cache} _cache Shared persistence provider.
@property {ExceptionService} _exceptionService Shared resiliency handler.
@property {Object} _config Global service configuration.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/core/ServiceFactory.js
 * @description Centralized service container for dependency injection.
 * Provides factory methods to create fully-wired service instances.
 * @version 1.0 - Initial implementation
 */

import { LoggerService, UtilsService } from '@CoreUtilsLib';
import { ExceptionService } from '@GasResilienceLib';
import { CacheService } from '../../services/CacheService.js';
import { UtilitiesService } from '../../services/UtilitiesService.js';
import { DriveService } from '../../services/DriveService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { SpreadsheetService } from '../../services/SpreadsheetService.js';
import { MailService } from '../../services/MailService.js';
import { PermissionService } from '../../services/PermissionService.js';
import { PropertiesService } from '../../services/PropertiesService.js';
import { TriggerService } from '../../services/TriggerService.js';
import { UiService } from '../../services/UiService.js';
import { UserService } from '../../services/UserService.js';

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

<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService();`
**Description:** Abstract base class for all Google service wrappers.
Provides common functionality for caching, service verification, and dependency injection.

/

// No imports needed - using native validation

/**
@class GoogleService
@abstract
Abstract foundation for Google Apps Script service wrappers. Implements standardized dependency injection (DI), multi-level caching strategies, and resilient execution patterns via GasResilienceLib.

@property {LoggerService} _logger Diagnostic logging provider.
@property {Cache} _cache State persistence provider (get/put/remove).
@property {UtilsService} _utils Foundational utility provider.
@property {ExceptionService} _exceptionService Resiliency and retry logic provider.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/core/MyGoogleService.js
 * @description Abstract base class for all Google service wrappers.
 * Provides common functionality for caching, service verification, and dependency injection.
 * @version 2.0 - Translated from Italian and refactored with ExceptionService support.
 */

// No imports needed - using native validation

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

<br>

## CLASS: restriction
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new restriction();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: if
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new if();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: GoogleService
**File Path:** `GoogleApiWrapper/src/internal/core/GoogleService.js`
**Constructor Usage:** `const instance = new GoogleService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ServiceError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new ServiceError();`
**Description:** Standardized error handling utilities for GoogleApiWrapper services.
GAW-H003: Provides consistent error handling patterns across all services.

/

import { LoggerService, BaseError } from '@CoreUtilsLib';

// =============================================================================
// ERROR CLASSES
// =============================================================================

/**
Base infrastructure error for GoogleApiWrapper services (L1).
High-density error structure preserving service identity, operation context, and original error chaining.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

@class
@extends BaseError
@property {string} name - Error type name (default: 'ServiceError').
@property {string} serviceName - Originating service identifier.
@property {string} operation - Failed method or operation name.
@property {Error|null} originalError - Chained error instance for root cause analysis.
@property {Object} context - Diagnostic metadata (IDs, params, state).
@property {string} timestamp - ISO 8601 timestamp of error occurrence.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/core/ErrorHandler.js
 * @description Standardized error handling utilities for GoogleApiWrapper services.
 * GAW-H003: Provides consistent error handling patterns across all services.
 * @version 1.0
 */

import { LoggerService, BaseError } from '@CoreUtilsLib';

// =============================================================================
// ERROR CLASSES
// =============================================================================

/**
 * Base infrastructure error for GoogleApiWrapper services (L1).
 * High-density error structure preserving service identity, operation context, and original error chaining.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 *
 * @class
 * @extends BaseError
 * @property {string} name - Error type name (default: 'ServiceError').
 * @property {string} serviceName - Originating service identifier.
 * @property {string} operation - Failed method or operation name.
 * @property {Error|null} originalError - Chained error instance for root cause analysis.
 * @property {Object} context - Diagnostic metadata (IDs, params, state).
 * @property {string} timestamp - ISO 8601 timestamp of error occurrence.
 */
```

<br>

## CLASS: QuotaExceededError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new QuotaExceededError();`
**Description:** Initializes ServiceError with full operation context and chained error.

### Raw JSDoc Context:
```javascript
/**
   * Initializes ServiceError with full operation context and chained error.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service name.
   * @param {string} operation - Failed method name.
   * @param {Error} [originalError=null] - Root cause instance.
   * @param {Object} [context={}] - Diagnostic metadata (e.g., { fileId: '...' }).
   */
  constructor(message, serviceName, operation, originalError = null, context = {}) {
    super(message, context, originalError);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ServiceError';
    this.serviceName = serviceName;
    this.operation = operation;
  }

  /**
   * Transforms error into structured POJO for logging.
   *
   * @returns {Object} Structured error data { name, message, serviceName, operation, timestamp, context, originalError: { message, stack } | null }.
   */
  toLogObject() {
    return {
      name: this.name,
      message: this.message,
      serviceName: this.serviceName,
      operation: this.operation,
      timestamp: this.timestamp,
      context: this.context,
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : null
    };
  }
}

/**
 * Error for Google API quota/rate limit violations (L1).
 * Automatically classified from "User rate limit exceeded", "Quota exceeded", or 429 responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'QuotaExceededError'.
 * @property {boolean} retryable - Always true.
 * @property {number} retryAfter - Default wait time (60000ms) before retry.
 */
```

<br>

## CLASS: PermissionDeniedError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new PermissionDeniedError();`
**Description:** Initializes QuotaExceededError with retry metadata.

### Raw JSDoc Context:
```javascript
/**
   * Initializes QuotaExceededError with retry metadata.
   *
   * @param {string} message - Violation description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., quotaType, limits).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'QuotaExceededError';
    this.retryable = true;
    this.retryAfter = 60000; // Default: retry after 1 minute
  }
}

/**
 * Error for authorization or permission failures (L1).
 * Classified from "Permission denied", "Unauthorized" (401), or "Forbidden" (403).
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'PermissionDeniedError'.
 * @property {boolean} retryable - Always false.
 */
```

<br>

## CLASS: ResourceNotFoundError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new ResourceNotFoundError();`
**Description:** Initializes PermissionDeniedError.

### Raw JSDoc Context:
```javascript
/**
   * Initializes PermissionDeniedError.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., fileId, scopes).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'PermissionDeniedError';
    this.retryable = false;
  }
}

/**
 * Error for non-existent or deleted Google resources (L1).
 * Classified from "not found", "does not exist", or 404 responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ResourceNotFoundError'.
 * @property {boolean} retryable - Always false.
 */
```

<br>

## CLASS: ServiceUnavailableError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new ServiceUnavailableError();`
**Description:** Initializes ResourceNotFoundError.

### Raw JSDoc Context:
```javascript
/**
   * Initializes ResourceNotFoundError.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., resourceId, type).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ResourceNotFoundError';
    this.retryable = false;
  }
}

/**
 * Error for temporary Google service outages or timeouts (L1).
 * Classified from "service unavailable", 503, 502, or "timeout" responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ServiceUnavailableError'.
 * @property {boolean} retryable - Always true.
 * @property {number} retryAfter - Default wait time (5000ms) before retry.
 */
```

<br>

## CLASS: ValidationError
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new ValidationError();`
**Description:** Initializes ServiceUnavailableError with retry metadata.

### Raw JSDoc Context:
```javascript
/**
   * Initializes ServiceUnavailableError with retry metadata.
   *
   * @param {string} message - Service failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., httpStatus, attemptNumber).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ServiceUnavailableError';
    this.retryable = true;
    this.retryAfter = 5000; // Default: retry after 5 seconds
  }
}

/**
 * Error for input validation or business rule failures (L1).
 * Used for pre-flight checks, schema validation, or malformed data detection.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ValidationError'.
 * @property {boolean} retryable - Always false.
 */
```

<br>

## CLASS: ErrorHandler
**File Path:** `GoogleApiWrapper/src/internal/core/ErrorHandler.js`
**Constructor Usage:** `const instance = new ErrorHandler();`
**Description:** Initializes ValidationError.

### Raw JSDoc Context:
```javascript
/**
   * Initializes ValidationError.
   *
   * @param {string} message - Validation failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} [originalError=null] - Root cause (if any).
   * @param {Object} [context={}] - Metadata (e.g., parameterName, expectedType).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ValidationError';
    this.retryable = false;
  }
}

// =============================================================================
// ERROR HANDLER UTILITY
// =============================================================================

/**
 * Standardized error handling, classification, and retry management for GoogleApiWrapper services (L1).
 * Implements exponential backoff and structured error mapping (GAW-H003).
 *
 * @class
 * @property {string} serviceName - Target service identity for error tagging.
 * @property {Object} logger - Logger instance for diagnostic output.
 */
```

<br>

## CLASS: SidebarBuilder
**File Path:** `GoogleApiWrapper/src/builders/SidebarBuilder.js`
**Constructor Usage:** `const instance = new SidebarBuilder();`
**Description:** Fluent builder for creating HTML sidebars in Google Apps Script

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/builders/SidebarBuilder.js
 * @description Fluent builder for creating HTML sidebars in Google Apps Script
 * @version 1.0
 */
```

### Methods of SidebarBuilder

#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(!ui);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(!logger);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.setTitle
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.setTitle(title);`
- **Pure JSDoc:**
```javascript
/** Method setTitle */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(typeof title !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.setContent
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.setContent(html);`
- **Pure JSDoc:**
```javascript
/** Method setContent */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(typeof html !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.setContentFromTemplate
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.setContentFromTemplate(template);`
- **Pure JSDoc:**
```javascript
/** Method setContentFromTemplate */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(!template || typeof template.evaluate !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.setWidth
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.setWidth(pixels);`
- **Pure JSDoc:**
```javascript
/** Method setWidth */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(typeof pixels !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.show
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.show();`
- **Pure JSDoc:**
```javascript
/** Method show */
```
---
#### METHOD: SidebarBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.if(!this._htmlOutput);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SidebarBuilder.getHtmlOutput
- **Scope:** instance
- **LLM Call Syntax:** `sidebarBuilder.getHtmlOutput();`
- **Pure JSDoc:**
```javascript
/** Method getHtmlOutput */
```
---
<br>

## CLASS: MenuBuilder
**File Path:** `GoogleApiWrapper/src/builders/MenuBuilder.js`
**Constructor Usage:** `const instance = new MenuBuilder();`
**Description:** Fluent builder for creating Google Apps Script menus

/

/**
@class MenuBuilder
Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.

@property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
@property {GoogleAppsScript.Base.Menu} _menu Current native menu object.
@property {LoggerService} _logger Diagnostic logger.
@property {string} _caption Menu header label.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/utils/MenuBuilder.js
 * @description Fluent builder for creating Google Apps Script menus
 * @version 1.0 - Initial implementation
 */

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

<br>

## CLASS: DialogBuilder
**File Path:** `GoogleApiWrapper/src/builders/DialogBuilder.js`
**Constructor Usage:** `const instance = new DialogBuilder();`
**Description:** Fluent builder for creating modal HTML dialogs in Google Apps Script

/

/**
@class DialogBuilder
Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.

@property {GoogleAppsScript.Base.Ui} _ui Native GAS UI provider.
@property {LoggerService} _logger Diagnostic logger.
@property {GoogleAppsScript.HTML.HtmlOutput|null} _htmlOutput Pending output object.
@property {string} _title Dialog header.
@property {number|null} _width Width in pixels.
@property {number|null} _height Height in pixels.

### Raw JSDoc Context:
```javascript
/**
 * @file GoogleApiWrapper/src/utils/DialogBuilder.js
 * @description Fluent builder for creating modal HTML dialogs in Google Apps Script
 * @version 1.0 - Initial implementation
 */

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

<br>

