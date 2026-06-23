# GoogleApiWrapper

**Version:** 3.0.0  
**Layer:** Infrastructure (Layer 1)  
**Dependencies:** CoreUtilsLib, GasResilienceLib

## 🏗️ File and Folder Structure

A highly modularized structure organized by responsibility:

```text
GoogleApiWrapper/
├── src/
│   ├── core/               # Infrastructure logic
│   │   ├── GoogleService.js  # Base class with common resilience logic
│   │   ├── ServiceFactory.js # Centralized DI container for all services
│   │   └── ErrorHandler.js   # Standardized error mapping and reporting
│   ├── services/           # Concrete implementations (Adapter Layer)
│   │   ├── DriveService.js   # Batch-first Drive v3 implementation
│   │   ├── SpreadsheetService.js # Batch-first Sheets v4 implementation
│   │   ├── MailService.js    # Gmail API with quota tracking
│   │   ├── DocumentService.js # Google Docs v1 builder-style manipulation
│   │   ├── PermissionService.js # Silent ACL management
│   │   ├── CacheService.js   # Wrapper for GAS CacheService (with TTL)
│   │   ├── PropertiesService.js # Wrapper for GAS PropertiesService
│   │   └── ... (Lock, Trigger, Ui, Utilities)
│   ├── utils/              # Low-level helpers
│   │   ├── BatchUtilities.js # Logic for multipart/mixed payload creation
│   │   ├── RateLimiter.js    # Token Bucket implementation for throttling
│   │   └── ... (Builders for UI: Dialog, Menu, Sidebar)
│   └── __tests__/          # Extensive local and integration tests
```

## 🧩 Programming Patterns

1.  **Adapter Pattern**: The primary pattern of the library. It wraps standard GAS "App" globals (e.g., `SpreadsheetApp`) or Advanced REST APIs into a consistent, resilient interface.
2.  **Bridge Pattern**: `GoogleService` (Abstraction) and the concrete services (Implementation) are separated to allow the base service to evolve its resilience logic independently of the specific API logic.
3.  **Abstract Factory / Service Locator**: `ServiceFactory` acts as the single source of truth for instantiating and wiring services with their dependencies (Logger, Resilience, etc.).
4.  **Builder Pattern**: Used extensively in `DocumentService` and UI utilities (`DialogBuilder`, `MenuBuilder`) to construct complex requests fluently.
5.  **Strategy Pattern**: Rate limiting and batch execution use interchangeable strategies for handling high-volume traffic.

## 🌉 Overview

**GoogleApiWrapper** is the heavy-lifting infrastructure layer of the GasLibraryFactory. It provides a unified, resilient, and performance-optimized interface for Google Workspace APIs (Drive, Sheets, Docs, Gmail).

Unlike standard Google Apps Script services (like `DriveApp` or `SpreadsheetApp`) which operate synchronously one item at a time, this library adopts a **"Batch-First" Architecture**. It leverages Google's **Advanced REST APIs** to bundle hundreds of operations into single HTTP requests, dramatically reducing execution time and avoiding quota limits.

It is tightly integrated with `GasResilienceLib` to provide automatic retries, exponential backoff, and error classification for every API call.

## ✨ Key Features

- **Batch-First Architecture**: Operations like `deleteFiles`, `updateRanges`, or `shareWithUsers` accept arrays and execute via `multipart/mixed` batch requests or native batch endpoints.
- **Resilience Integration**: Every API call is wrapped in a retry logic block that handles 429 (Too Many Requests), 5xx (Server Errors), and network timeouts automatically.
- **Service Factory**: A centralized Dependency Injection container (`ServiceFactory`) that wires up all services with their required dependencies (Logger, Cache, Utils, ExceptionService), solving the "waterfall initialization" problem.
- **Rate Limiting**: Built-in `RateLimiter` using the Token Bucket algorithm to smooth out traffic bursts and prevent quota exhaustion.
- **Escape Hatches**: Hybrid design allows seamless switching between high-performance REST APIs and native GAS objects (e.g., `getStandardApp()`) when specific functionality (like Chart creation) is needed.
- **Quota Management**: The `MailService` tracks daily email usage to prevent script lockouts.
- **Dry-Run Mode**: All mutation services support dry-run mode for testing workflows without making real changes.

## 🧪 Dry-Run Mode

All services that perform mutations (DriveService, SpreadsheetService) support dry-run mode. When enabled, operations are simulated and logged without actually being executed.

### Enabling Dry-Run Mode

**Global (Constructor-Level):**

```javascript
const driveService = new DriveService(logger, cache, utils, exceptionService, {
  dryRun: true
});

const sheetsService = new SpreadsheetService(logger, cache, utils, exceptionService, {
  dryRun: true
});
```

**Per-Operation Override:**

```javascript
// Dry-run for Drive operations
driveService.deleteFiles(['id1', 'id2'], { dryRun: true });
driveService.moveFiles([...], { dryRun: true });
driveService.copyFiles([...], { dryRun: true });

// Dry-run for Sheets operations
sheetsService.updateRanges('spreadsheetId', updates, { dryRun: true });
sheetsService.clearRanges('spreadsheetId', ranges, { dryRun: true });
```

### Dry-Run Response

Dry-run operations return a result with `dryRun: true` flag:

```javascript
const result = mailService.send({
  to: 'user@example.com',
  subject: 'Test',
  body: 'Hello',
  dryRun: true
});
// Result: { success: true, messageId: 'dry-run-abc123', dryRun: true }
```

## 📦 Installation

```javascript
import { ServiceFactory, DriveService, SpreadsheetService } from '@GoogleApiWrapper';
```

## Exported Components

**Core Services:**

- `ServiceFactory` - Centralized dependency injection container
- `GoogleService` - Base class for all Google API services

**Google Workspace Services:**

- `DriveService` - Drive API v3 operations (batch-first)
- `SpreadsheetService` - Sheets API v4 operations (batch-first)
- `DocumentService` - Docs API v1 operations
- `MailService` - Gmail API v1 operations with quota tracking
- `PermissionService` - Drive permissions and sharing (silent by default)
- `CacheService` / `Cache` - Caching with JSON serialization
- `PropertiesService` - Script/User/Document properties with object serialization
- `TriggerService` - Trigger management for time-based and event-driven execution
- `LockService` - Concurrency control with locks
- `UtilitiesService` - Utility operations and helpers

**Utilities:**

- `BatchRequestBuilder` - Construct multipart/mixed HTTP payloads
- `BatchResponseParser` - Parse batch response data
- `BatchExecutor` - Execute batch requests
- `RateLimiter` - Token bucket algorithm for rate limiting

**Error Handling:**

- `ErrorHandler` - Base error handling class
- `ServiceError` - Base service error
- `QuotaExceededError` - Quota limit errors
- `PermissionDeniedError` - Permission/authorization errors
- `ResourceNotFoundError` - Resource not found errors
- `ServiceUnavailableError` - Service unavailable errors
- `ValidationError` - Input validation errors

**Backward Compatibility:**

- `LoggerService` - Re-exported from @CoreUtilsLib
- `UtilsService` - Re-exported from @CoreUtilsLib

## 🏭 Service Factory (Dependency Injection)

Instead of manually instantiating services and passing dependencies, use the `ServiceFactory`.

```javascript
// Configure global settings (optional)
ServiceFactory.configure({
  logLevel: 'DEBUG',
  cacheExpiration: 600
});

// Get fully wired services
const driveService = ServiceFactory.getDriveService();
const sheetService = ServiceFactory.getSpreadsheetService();
const mailService = ServiceFactory.getMailService();
```

## 📚 API Reference

### 1. DriveService (Batch-First)

Replaces `DriveApp` for high-volume file operations. Uses Advanced Drive API v3.

- **`deleteFiles(fileIds)`**: Deletes hundreds of files in a single HTTP request.
- **`moveFiles(requests)`**: Moves files to new parents. Optimized to avoid N+1 reads for parent metadata.
- **`copyFiles(requests)`**: Batch copies files.
- **`searchFiles(query)`**: Paginated search using Drive Query Language.

```javascript
// Batch move example
driveService.moveFiles([
  { fileId: 'id1', newParent: 'folderA', removeFromOtherParents: true },
  { fileId: 'id2', newParent: 'folderB', removeFromOtherParents: true }
]);
```

### 2. SpreadsheetService (Batch-First)

Replaces `SpreadsheetApp` for data manipulation. Uses Advanced Sheets API v4.

- **`getRanges(spreadsheetId, ranges)`**: Fetches multiple non-contiguous ranges in one call.
- **`updateRanges(spreadsheetId, updates)`**: Writes data to multiple ranges simultaneously.
- **`appendRows(spreadsheetId, appends)`**: Appends data to multiple sheets.
- **`formatRanges(spreadsheetId, formats)`**: Applies cell formatting (colors, fonts) in batch.

```javascript
// Batch update example
sheetService.updateRanges('SPREADSHEET_ID', [
  {
    range: 'Sheet1!A1:B2',
    values: [
      [1, 2],
      [3, 4]
    ]
  },
  { range: 'Config!C1', values: [['Updated']] }
]);
```

### 3. MailService (Quota-Aware)

Stateless service for managing and sending emails via GmailApp/MailApp.

- **`send(options)`**: Sends an email with attachments.
- **`sendBatch(emails)`**: Sends multiple emails with rate limiting.
- **`sendBulk(recipients, bodyFn)`**: Mass mailing helper with personalization.
- **`getQuotaUsage()`**: Returns current daily usage (remaining quota).

```javascript
mailService.sendBatch([
  { to: 'user1@example.com', subject: 'Update', body: '...' },
  { to: 'user2@example.com', subject: 'Update', body: '...' }
]);
```

### 4. PermissionService (Silent)

Manages ACLs via Drive API v3.

- **`shareWithUsers(fileIds, permissions)`**: Batch shares files. **Crucially, it defaults to sending NO email notifications**, unlike `DriveApp`.
- **`transferOwnership(fileIds, newOwner)`**: Batch ownership transfer.
- **`getSharingLink(fileIds)`**: Generates web view links.

```javascript
// Share 50 files with a user silently
permissionService.shareWithUsers(fileIdsArray, {
  email: 'newuser@example.com',
  role: 'writer',
  sendNotificationEmail: false
});
```

### 5. DocumentService (Builder Pattern)

Manipulates Google Docs via Docs API v1.

- **`document(id)`**: Returns a `DocumentBuilder` for fluent chaining.
- **`scanDocumentStructure(id)`**: Returns a lightweight POJO representation of the doc structure (used by template engines).

```javascript
docService
  .document('DOC_ID')
  .appendParagraph('Chapter 1')
  .createTable(data)
  .replaceText('{{placeholder}}', 'Value')
  .execute(); // Executes all operations in one batchUpdate call
```

### 6. Utilities & Helpers

- **`BatchRequestBuilder`**: Helper to construct `multipart/mixed` HTTP payloads manually.
- **`RateLimiter`**: Token bucket implementation for throttling.
- **`CacheService`**: Facade for `CacheService` with JSON serialization support.
- **`PropertiesService`**: Facade for `PropertiesService` with object serialization.

## 🛡️ Resilience & Error Handling

All services in this library automatically use `GasResilienceLib`. If a batch request fails with a `429 Too Many Requests` or `503 Service Unavailable`, the library will:

1.  Catch the error.
2.  Wait (using exponential backoff).
3.  Retry the request (up to 3 times by default).
4.  Throw a structured `ServiceError` only if all retries fail.

## 🧪 Testing

Integration tests for this library require a real Google Workspace environment.
See `__testOnline__/IntegrationTests.gs` (if available) for live API testing examples.
