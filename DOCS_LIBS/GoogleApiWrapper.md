# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [GoogleApiWrapper](#googleapiwrapper)

---

## GoogleApiWrapper

**Version:** 3.0.0   **Layer:** Infrastructure (Layer 1)   **Dependencies:** CoreUtilsLib, GasResilienceLib

### DialogBuilder

Fluent builder for creating modal HTML dialogs in Google Apps Script

**Initialization:**
```javascript
new DialogBuilder(ui: GoogleAppsScript.Base.Ui, logger: LoggerService)
```

**Methods:**

- `setTitle(title: string): DialogBuilder`
  > The native UI object

- `setContent(html: string): DialogBuilder`

- `setContentFromTemplate(template: GoogleAppsScript.HTML.HtmlTemplate): DialogBuilder`

- `setWidth(pixels: number): DialogBuilder`

- `setHeight(pixels: number): DialogBuilder`

- `show(): void`

- `getHtmlOutput(): GoogleAppsScript.HTML.HtmlOutput|null`


### MenuBuilder

Fluent builder for creating Google Apps Script menus

**Initialization:**
```javascript
new MenuBuilder(ui: GoogleAppsScript.Base.Ui, caption: string, logger: LoggerService)
```

**Methods:**

- `addItem(caption: string, functionName: string): MenuBuilder`
  > The native UI object

- `addSeparator(): MenuBuilder`

- `addSubMenu(subMenuBuilder: MenuBuilder): MenuBuilder`

- `addToUi(): void`

- `getNativeMenu(): GoogleAppsScript.Base.Menu`


### SidebarBuilder

Fluent builder for creating HTML sidebars in Google Apps Script

**Initialization:**
```javascript
new SidebarBuilder()
```


### ServiceError

Standardized error handling utilities for GoogleApiWrapper services.
GAW-H003: Provides consistent error handling patterns across all services.

**Initialization:**
```javascript
new ServiceError()
```

**Methods:**

- `toLogObject(): Object`
  > Transforms error into structured POJO for logging.


### QuotaExceededError

Initializes ServiceError with full operation context and chained error.

**Initialization:**
```javascript
new QuotaExceededError()
```


### PermissionDeniedError

Initializes QuotaExceededError with retry metadata.

**Initialization:**
```javascript
new PermissionDeniedError()
```


### ResourceNotFoundError

Initializes PermissionDeniedError.

**Initialization:**
```javascript
new ResourceNotFoundError()
```


### ServiceUnavailableError

Initializes ResourceNotFoundError.

**Initialization:**
```javascript
new ServiceUnavailableError()
```


### ValidationError

Initializes ServiceUnavailableError with retry metadata.

**Initialization:**
```javascript
new ValidationError()
```


### ErrorHandler

Initializes ValidationError.

**Initialization:**
```javascript
new ErrorHandler()
```

**Methods:**

- `classifyError(error: Error|string, operation: string, context={}: Object): ServiceError`
  > Classifies error and wraps in ServiceError subclass. Priority: Quota (1) > Permission (2) > Resource (3) > Availability (4) > Default (5).

- `wrap(func: Function, operation: string, context={}: Object): *`
  > Executes callback and wraps any thrown error.

- `withRetry(func: Function, operation: string, options={}: Object, options.maxAttempts=3: number, options.baseDelay=1000: number, options.context={}: Object): *`
  > NOTE: Google Apps Script does not support async/await. All operations in GAS are synchronous, so use the wrap() method instead. This method has been removed as part of GRL-CRITICAL-001. / /** Executes callback with exponential backoff retry logic. Uses bitshift optimization (GAW-M003). Retries only QuotaExceededError and ServiceUnavailableError.


### GoogleService

Abstract base class for all Google service wrappers.
Provides common functionality for caching, service verification, and dependency injection.

**Initialization:**
```javascript
new GoogleService(logger: LoggerService, cache: Cache, utils: UtilsService, exceptionService: ExceptionService)
```


### ServiceFactory

Centralized service container for dependency injection.
Provides factory methods to create fully-wired service instances.

**Static Methods:**

- `configure(config: Object, config.logLevel='INFO': string, config.cacheExpiration=300: number, config.mailRateLimitMs=100: number): void`

- `reset(resetConfig=true: boolean): void`

- `getLogger(): LoggerService`

- `getUtilitiesService(): UtilitiesService`

- `getUtils(): UtilsService`

- `getCache(): Cache`

- `getCacheService(): CacheService`
  > Prefer { service object for callers that need user/document caches or the service directly.

- `getExceptionService(): ExceptionService`

- `getDriveService(): DriveService`

- `getDocumentService(): DocumentService`

- `getSpreadsheetService(): SpreadsheetService`

- `getMailService(options={}: Object): MailService`

- `getPermissionService(): PermissionService`

- `getPropertiesService(): PropertiesService`

- `getTriggerService(): TriggerService`

- `getUiService(): UiService`

- `getUserService(): UserService`

- `setLogger(logger: Object): void`

- `setUtils(utils: Object): void`

- `setCache(cache: Object): void`

- `setExceptionService(exceptionService: Object): void`


### DocumentBatchUpdateHandler

Specialized manager for Google Documents batch operations and core mutations.
Handles Docs API batchUpdate, PDF export, and bulk document operations.

**Initialization:**
```javascript
new DocumentBatchUpdateHandler(facade: DocumentService)
```

**Methods:**

- `getOrCreateHeader(documentId: string): GoogleAppsScript.Document.HeaderSection`

- `getOrCreateFooter(documentId: string): GoogleAppsScript.Document.FooterSection`

- `setHeaderText(documentId: string, text: string): DocumentService`

- `createDocument(name: string, options={}: Object, options.destinationFolder: string): Object`

- `getDocument(documentIds: string|string[]): Object|Object[]|null`

- `batchReplaceText(documentIds: string|string[], searchPattern: string, replacement: string): Object`

- `deleteDocuments(documentIds: string|string[]): Object`


### DocumentContentExtractor

Specialized manager for extracting and parsing Google Documents content.
Converts complex document structures into POJOs for decoupling from GAS APIs.

**Initialization:**
```javascript
new DocumentContentExtractor(facade: DocumentService)
```


### SpreadsheetGridManager

Manager for structural and formatting changes (sheets, widths, formats, protections).

**Initialization:**
```javascript
new SpreadsheetGridManager()
```


### SpreadsheetHybridManager

Manager for hybrid operations and "escape hatch" methods (Standard API).

**Initialization:**
```javascript
new SpreadsheetHybridManager()
```

**Methods:**

- `createSpreadsheet(title: string, options={}: Object, options.destinationFolder: string): Object`


### SpreadsheetMetadataCache

Manager for spreadsheet metadata retrieval and in-memory caching.

**Initialization:**
```javascript
new SpreadsheetMetadataCache()
```


### SpreadsheetRangeManager

Manager for spreadsheet value and range operations.

**Initialization:**
```javascript
new SpreadsheetRangeManager()
```


### TextStyleMapper

Converts an Advanced Docs API TextStyle POJO (as captured by
DocumentContentExtractor at scan time) into the native DocumentApp.Attribute
object shape required by Text.setAttributes(). Native-only boundary (L2).

**Static Methods:**

- `toNativeAttributes(textStyle: Object): Object`


### CacheService

Facade for Google Apps Script's CacheService.
Provides a consistent interface for caching with error handling and logging.
/

**Initialization:**
```javascript
new CacheService()
```

**Static Methods:**

- `getScriptCache(): Object`

- `getUserCache(): Object`

- `getDocumentCache(): Object`

**Methods:**

- `getScriptCache(): Cache`

- `getUserCache(): Cache`

- `getDocumentCache(): Cache`


### Cache

Initializes CacheService with optional logging and resiliency providers.
@param {LoggerService} [logger=console] Diagnostic logger.
@param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
/
  constructor(logger = console, exceptionService = null) {
    this._logger = logger || console;
    this._exceptionService = exceptionService;
  }

**Initialization:**
```javascript
new Cache()
```

**Methods:**

- `getAll(keys: string[]): Object<string, string|null>`

- `put(key: string, value: *, expirationInSeconds=600: number): void`

- `putAll(values: Object<string, *>, expirationInSeconds=600: number): void`

- `remove(key: string): void`

- `removeAll(keys: string[]): void`

- `removeByPrefix(prefix: string): number`

- `enableKeyTracking(): Cache`

- `disableKeyTracking(): Cache`

- `trackKey(key: string): Cache`

- `getTrackedKeyCount(): number`

- `clearTrackedKeys(): Cache`

- `unwrap(): GoogleAppsScript.Cache.Cache`


### DocumentBuilder

Builder class for fluent Google Docs document operations with atomic batch execution.
/

**Initialization:**
```javascript
new DocumentBuilder()
```

**Methods:**

- `appendParagraph(text: string, options={}: Object): DocumentBuilder`

- `appendListItem(text: string, options={}: Object): DocumentBuilder`

- `setText(text: string): DocumentBuilder`

- `createTable(data: Array<Array>, options={}: Object): DocumentBuilder`

- `addHeader(text: string): DocumentBuilder`

- `addFooter(text: string): DocumentBuilder`

- `replaceText(searchPattern: string, replacement: string): DocumentBuilder`

- `exportPDF(fileName: string, destinationFolderId=null: string): DocumentBuilder`

- `execute(): Object`


### DocumentService

Stateless service for manipulating Google Documents using Advanced Docs API v1 with batch operations.
Provides a fluent API for creating, modifying, and formatting documents, tables, and document structure.

**Initialization:**
```javascript
new DocumentService()
```

**Methods:**

- `document(documentId: string): DocumentBuilder`

- `openStandard(documentId: string): GoogleAppsScript.Document.Document`

- `getStandardApp(): GoogleAppsScript.Document.DocumentApp`


### DriveService

BATCH-FIRST Drive Service with Advanced Drive API
Version 3.0 - GAW-HIGH-001 Implementation

**Initialization:**
```javascript
new DriveService()
```

**Methods:**

- `getStandardApp(): GoogleAppsScript.Drive.DriveApp`


### LockService

Facade for Google Apps Script's LockService.
Provides a clean, testable interface for script-level locking.

**Initialization:**
```javascript
new LockService(logger: LoggerService)
```

**Methods:**

- `getScriptLock(): Lock|MockLock`
  > Logger instance for operation logging.

- `getUserLock(): Lock|MockLock`

- `getDocumentLock(documentId: string): Lock|MockLock`


### Lock

Initializes LockService and auto-detects native GAS LockService availability.
@param {LoggerService} logger Diagnostic logger.
/
  constructor(logger) {
    /**
Logger instance for operation logging.
@private
@type {LoggerService}
/
    this._logger = logger;

**Initialization:**
```javascript
new Lock()
```

**Methods:**

- `tryLock(timeoutInMillis: number): boolean`

- `waitLock(timeoutInMillis: number): void`

- `releaseLock(): void`

- `hasLock(): boolean`


### MockLock

@param {GoogleAppsScript.Lock.Lock} nativeLock - Native GAS Lock object
@param {LoggerService} logger - Logger instance
/
  constructor(nativeLock, logger) {
    this._nativeLock = nativeLock;
    this._logger = logger;
    this._acquired = false;
  }

**Initialization:**
```javascript
new MockLock(timeoutInMillis: number)
```

**Methods:**

- `tryLock(timeoutInMillis: number): boolean`

- `waitLock(timeoutInMillis: number): void`

- `releaseLock(): void`

- `hasLock(): boolean`


### MailService

Simplified service for sending emails via GmailApp/MailApp.
Provides quota-aware operations and batch processing.
/

**Initialization:**
```javascript
new MailService()
```

**Methods:**

- `getQuotaUsage(): number`

- `send(emailOptions: Object, emailOptions.to: string|string[], emailOptions.subject: string, emailOptions.body: string, emailOptions.htmlBody: string, emailOptions.attachments: BlobSource[]): Object`

- `sendBatch(emails: Object[]): Object`

- `createDraft(emailOptions: Object): Object`

- `sendBulk(recipientData: Object[], bodyGenerator: Function, subject: string, isHtml=true: boolean): Object`

- `sendNotification(emails: string|string[], title: string, message: string): Object`


### PermissionService

BATCH-FIRST Permission Service with Advanced Drive API
Version 3.0 - GAW-HIGH-001 Implementation

**Initialization:**
```javascript
new PermissionService()
```

**Methods:**

- `shareWithUsers(fileIds: string|string[], permissions: Object|Object[], options={}: Object, options.sendNotificationEmail=false: boolean): Object`

- `shareFilesWithUsers(fileIds: string[], userPermissions: Object[], options={}: Object): Object`

- `removeAccess(fileIds: string|string[], emailsOrPermissionIds: string|string[]): Object`

- `changeRoles(fileIds: string|string[], roleChanges: Object|Object[], options={}: Object, fileIds: string|string[], roleChanges: Object|Object[]): Object`
  > Changes role(s) for existing permission(s) in batch. This method updates access levels for users who already have permissions on files. It's more efficient than removing and re-adding permissions, as it preserves the permission ID and other metadata. ## Behavior - **Existing Permissions Only**: Only updates users who currently have access - **Email Resolution**: Automatically resolves emails to permission IDs via getPermissions() - **Batch Processing**: Updates multiple roles in single batch request - **Cache Invalidation**: Clears permission cache for all affected files - **Graceful Failures**: Logs warning if email not found, continues with valid updates ## Common Use Cases - Promote user from reader to writer - Demote user from writer to reader - Grant commenter access to existing reader - Bulk role updates after organizational changes ## Available Roles - **reader**: Can view and download - **writer**: Can view, download, and edit - **commenter**: Can view and add comments (Docs/Sheets only) - **owner**: Full control (use transferOwnership() instead)

- `transferOwnership(fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object, options.sendNotificationEmail=false: boolean, fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object): Object`
  > Transfers ownership of file(s) to user(s) in batch with NO email notifications. This method transfers file ownership to new owner(s). Ownership transfer is a special permission operation that automatically: - Grants 'owner' role to new owner - Demotes current owner to 'writer' role (if applicable) - Transfers all ownership responsibilities ## Behavior - **Batch Processing**: Transfer multiple files to one or more owners - **Email Control**: NO emails sent by default (GAW-HIGH-001) - **Cache Invalidation**: Clears permission cache for all affected files - **Auto Role Change**: Previous owner becomes writer automatically - **Domain Restrictions**: New owner must be in same domain (Google Workspace) ## Important Considerations **Ownership Requirements**: - Only current owner can transfer ownership - New owner must have Google account - New owner must be in same domain (Workspace) or file must allow external sharing - New owner automatically gets 'owner' role - Previous owner typically becomes 'writer' (Google Drive behavior) **Irreversible Action**: - Ownership transfer cannot be undone programmatically - New owner must manually transfer back - Be cautious with batch transfers ## When to Use - Employee departure (transfer their files to manager) - Project handoff (transfer project files to new lead) - Organizational restructuring - Automated file ownership management

- `getPermissions(fileIds: string|string[], options={}: Object, fileIds: string|string[]): Array<Object>|Object<string, Array<Object>>`
  > Gets permissions for file(s) in batch with intelligent caching. This method retrieves permission lists for files, automatically leveraging cache for recently-accessed files and batching API calls for uncached files. ## Behavior - **Cache-First**: Checks cache before making API calls - **Batch Uncached**: Single batch request for all uncached files - **5-Minute Cache**: Permission lists cached for 300 seconds - **Automatic Parsing**: Returns parsed permission objects (not raw API response) - **Flexible Return**: Single array for single file, map for multiple files ## Permission Object Structure Each permission in the returned array contains: - **id**: Permission ID (use for direct deletion/updates) - **emailAddress**: User's email (if user/group type) - **role**: Access level - 'owner', 'writer', 'reader', 'commenter' - **type**: Permission type - 'user', 'group', 'domain', 'anyone' - **domain**: Domain name (if domain type) ## Cache Behavior - **Cache Hit**: Returns immediately (no API call) - **Cache Miss**: Fetches from API, caches for 5 minutes - **Cache Invalidation**: Automatic on share/remove/change/transfer operations ## Performance - 1 file (cached): ~1ms (cache lookup) - 1 file (uncached): ~200ms (API call) - 10 files (all uncached): ~300ms (1 batch request) - 10 files (all cached): ~10ms (10 cache lookups)

- `getSharingLink(fileIds: string|string[], accessType='view': string, options={}: Object, fileIds: string|string[], accessType='view': string): string|Object<string, string>`
  > Generates shareable "anyone with link" URLs for file(s) with NO email notifications. This method creates or updates the 'anyone' permission on files to enable link sharing, then returns the shareable URLs. It's ideal for sharing files publicly or with large groups without needing individual email addresses. ## Behavior - **Auto Permission**: Creates 'anyone' permission if not exists - **Role Update**: Updates existing 'anyone' permission if role differs - **Batch Processing**: Generates links for multiple files in one batch - **Email Control**: NO emails sent when creating/updating 'anyone' permission - **Link Types**: Supports view, edit, and comment links ## Access Types - **view**: Anyone with link can view and download (role: 'reader') - **edit**: Anyone with link can edit (role: 'writer') - **comment**: Anyone with link can comment (role: 'commenter', Docs/Sheets only) ## Two-Step Process 1. **Ensure Permission**: Creates/updates 'anyone' permission with correct role 2. **Get Link**: Retrieves webViewLink from file metadata ## Security Considerations - Link sharing bypasses all email-based permissions - Anyone with the URL can access (even without Google account) - Consider using expiration or restricting to domain for sensitive files - Links remain valid until permission is removed


### PropertiesService

Facade for Google Apps Script's PropertiesService.
Provides a clean, testable interface for reading and writing script properties.

**Initialization:**
```javascript
new PropertiesService()
```

**Static Methods:**

- `getScriptProperties(): Object`
  > Static method providing direct access to native GAS script properties. Preserves backward compatibility with code that calls PropertiesService.getScriptProperties() expecting the native GAS API pattern.

- `getUserProperties(): Object`
  > Static method providing direct access to native GAS user properties.

- `getDocumentProperties(): Object`
  > Static method providing direct access to native GAS document properties.

**Methods:**

- `setUserProperty(key: string, value: string|number|boolean): string|null`
  > Logger instance for operation logging.

- `setDocumentProperty(key: string, value: string|number|boolean): string|null`

- `setProperty(key: string, value: string|number|boolean): string|null`

- `setProperties(properties: Object<string, string|number|boolean>): void`

- `deleteProperty(key: string): void`

- `deleteAllProperties(): number`

- `getKeys(): string[]`

- `getProperties(): Object<string, string>`

- `setObjectProperty(key: string, object: Object, key: string, object: Object): void`
  > Saves an object as JSON in a script property. ## Behavior 1. Serializes the object to JSON using `JSON.stringify()` 2. Stores the JSON string via `setProperty()` 3. Logs the operation at DEBUG level 4. Date objects are automatically converted to ISO 8601 strings ## Date Handling Date objects are automatically serialized to ISO 8601 format: ```javascript const state = { createdAt: new Date('2024-12-13T10:00:00Z') }; // Stored as: { "createdAt": "2024-12-13T10:00:00.000Z" } ``` When loaded via `getObjectProperty()`, the date string is automatically converted back to a Date object thanks to the `_dateReviver()` function. ## JSON Serialization Limitations Be aware of JSON.stringify() limitations: - **Functions**: Not serialized (silently omitted) - **undefined values**: Omitted from objects, converted to `null` in arrays - **Symbol keys**: Ignored - **Circular references**: Throws TypeError - **Special objects**: RegExp, Map, Set, etc. serialized as `{}` or `null` ## Size Limitations - **Maximum property size**: 9 KB (9,216 bytes) - If JSON exceeds this, consider: - Splitting data across multiple properties - Using CacheService for temporary large data - Storing only essential state ## Typical Use Cases (JobRunnerLib Integration) 1. **Job State Persistence**: - Job progress checkpoints - Resume data for long-running operations - Error tracking 2. **Configuration Objects**: - Complex application settings - User preferences - Feature flags with metadata 3. **Metadata Storage**: - Circuit breaker state (GasResilienceLib) - Cache invalidation timestamps - Quota tracking details

- `getObjectProperty(key: string, key: string): Object|null`
  > Loads and deserializes an object from a JSON property. ## Behavior 1. Retrieves the JSON string via `getProperty()` 2. Returns `null` immediately if property doesn't exist 3. Deserializes JSON using `JSON.parse()` with `_dateReviver()` 4. **Automatic Date Revival**: ISO 8601 date strings converted to Date objects 5. Returns `null` (not throws) if JSON parsing fails 6. Logs the operation at DEBUG level ## Date Revival (Critical for JobRunnerLib) This method automatically converts ISO 8601 date strings back to Date objects: ```javascript // Stored JSON: { "startedAt": "2024-12-13T10:00:00.000Z" } const state = properties.getObjectProperty('job:state'); console.log(state.startedAt instanceof Date);  // true ✅ console.log(state.startedAt.getFullYear());    // 2024 ✅ ``` **Why This Matters**: JobRunnerLib stores Date objects in job state. Without automatic date revival, resumed jobs would crash when trying to call Date methods on string values. ## Error Handling (Graceful Degradation) Unlike `setObjectProperty()`, this method does NOT throw on errors: - **Property doesn't exist**: Returns `null` - **Invalid JSON**: Logs error and returns `null` - **Corrupt data**: Logs error and returns `null` This graceful degradation prevents job crashes when property data is corrupt. ## Return Value - **Success**: Returns the deserialized object (with dates revived) - **Property missing**: Returns `null` - **JSON invalid**: Returns `null` (logs error) - **Parse error**: Returns `null` (logs error) ## Performance - **Read + parse**: ~30-70ms depending on JSON size - **Date revival**: Adds ~1-5ms per date string

- `getScriptPropertyJSON(key: string): Object|null`
  > Loads an object from a JSON property (alias for getObjectProperty). This method provides compatibility with test helpers.

- `hasProperty(key: string): boolean`

- `getPropertyOrDefault(key: string, defaultValue: string): string`

- `updatePropertyIfExists(key: string, value: string|number|boolean): boolean`

- `setPropertyIfNotExists(key: string, value: string|number|boolean): boolean`

- `getNumericProperty(key: string, defaultValue=0: number): number`

- `getBooleanProperty(key: string, defaultValue=false: boolean): boolean`


### SpreadsheetService

BATCH-FIRST Spreadsheet Service with Advanced Sheets API.

**Initialization:**
```javascript
new SpreadsheetService()
```


### TriggerService

Facade for Google Apps Script's ScriptApp trigger management.
Provides a clean, testable interface for creating and managing triggers.

**Initialization:**
```javascript
new TriggerService(logger: LoggerService)
```

**Methods:**

- `createTimedTrigger(functionName: string, milliseconds: number): string`
  > Logger instance for operation logging.

- `createRecurringTrigger(functionName: string, cronExpression: string): string`

- `getAllTriggers(): Object[]`

- `findTriggerById(triggerId: string): GoogleAppsScript.Script.Trigger|null`

- `deleteTriggerById(triggerId: string): boolean`

- `deleteTriggersByFunction(functionName: string): number`

- `deleteAllTriggers(): number`

- `triggerExistsForFunction(functionName: string): boolean`

- `getTriggerInfo(triggerId: string): Object|null`

- `findTriggersByFunction(functionName: string): Object[]`

- `findTriggersByType(triggerType: string): Object[]`

- `createTriggerAt(functionName: string, date: Date): string`

- `createEveryMinutesTrigger(functionName: string, minutes: number): string`

- `createEveryHoursTrigger(functionName: string, hours: number): string`

- `createDailyTrigger(functionName: string, hour: number): string`

- `createWeeklyTrigger(functionName: string, weekDay: GoogleAppsScript.Script.WeekDay, hour: number): string`


### UiService

Unified UI service facade for Google Apps Script UI operations

**Initialization:**
```javascript
new UiService()
```

**Methods:**

- `createMenu(caption: string): MenuBuilder`

- `alert(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.Button`

- `prompt(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.PromptResponse`

- `createSidebar(): SidebarBuilder`

- `createDialog(): DialogBuilder`

- `getNativeUi(): GoogleAppsScript.Base.Ui`


### UserService

Facade for Google Apps Script's Session API (running-user identity).
/

**Initialization:**
```javascript
new UserService(logger=console: LoggerService)
```

**Methods:**

- `getActiveUserEmail(): string`


### UtilitiesService

Facade for Google Apps Script's Utilities API.
Provides a consistent interface for utility functions with error handling and logging.
/

**Initialization:**
```javascript
new UtilitiesService(logger=console: LoggerService, exceptionService=null: ExceptionService)
```

**Methods:**

- `sleep(milliseconds: number): void`

- `getUuid(): string`

- `base64Encode(data: string|Blob, charset: string): string`

- `base64Decode(encoded: string): Blob`

- `base64EncodeWebSafe(data: string|Blob, charset: string): string`

- `base64DecodeWebSafe(encoded: string): Blob`

- `formatString(template: string, args: ...*): string`

- `formatDate(date: Date, timeZone: string, format: string): string`

- `parseCsv(csv: string, delimiter=',': string): string[][]`

- `newBlob(data: string|number[], contentType='text/plain': string, name='blob': string): Blob`

- `gzip(blob: Blob): Blob`

- `ungzip(blob: Blob): Blob`

- `zip(blobs: Blob[], name='archive.zip': string): Blob`

- `unzip(blob: Blob): Blob[]`

- `computeDigest(algorithm: string, value: string|Blob, charset='UTF_8': string): number[]`

- `computeHmacSignature(algorithm: string, value: string|Blob, key: string|Blob, charset='UTF_8': string): number[]`

- `jsonStringify(obj: *, prettyPrint=false: boolean): string`

- `jsonParse(json: string): *`


### DriveFileManager

Encapsulates file-level operations for DriveService.

**Initialization:**
```javascript
new DriveFileManager()
```

**Methods:**

- `deleteFiles(fileIds: string|string[], options={}: Object, options.permanently=false: boolean): Object`

- `restoreFiles(fileIds: string|string[], options={}: Object): Object`

- `copyFiles(copyRequests: Object|Object[], options={}: Object): Object`

- `moveFiles(moveRequests: Object|Object[], options={}: Object): Object`

- `renameFiles(renameRequests: Object|Object[], options={}: Object): Object`

- `getFileByIdStandard(fileId: string): GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder`


### DriveFolderManager

Encapsulates folder-level operations for DriveService.

**Initialization:**
```javascript
new DriveFolderManager()
```

**Methods:**

- `createFolder(folderName: string, parentFolderId=null: string, options={}: Object, options.returnExistingIfFound=false: boolean): Object`

- `getFolderByIdStandard(folderId: string): GoogleAppsScript.Drive.Folder`


### DriveMetadataService

Encapsulates metadata operations for DriveService.

**Initialization:**
```javascript
new DriveMetadataService()
```

**Methods:**

- `updateMetadata(updateRequests: Object|Object[], options={}: Object): Object`

- `getFiles(fileIds: string|string[], options={}: Object, options.fields: string): Object|Object<string, Object>`

- `getFileOwnerEmail(fileId: string): string|null`
  > caching/retry behaviour (the `owners` field is already part of its default field set).

- `searchFiles(query: string, options={}: Object, options.maxResults=Infinity: number, options.orderBy: string): Object[]`


### DriveShortcutHandler

Encapsulates shortcut operations for DriveService.

**Initialization:**
```javascript
new DriveShortcutHandler()
```

**Methods:**

- `createShortcut(targetId: string, name: string, parentId=null: string): Object`

- `getTargetId(shortcutId: string): string|null`

- `isShortcut(fileId: string): boolean`


### MenuBuilderMock

Centralized high-fidelity mocks for GoogleApiWrapper services.

**Initialization:**
```javascript
new MenuBuilderMock()
```


### SidebarBuilderMock

@class SidebarBuilderMock
High-fidelity mock for SidebarBuilder. Supports fluent chaining and Jest tracking.

**Initialization:**
```javascript
new SidebarBuilderMock()
```


### DialogBuilderMock

@class DialogBuilderMock
High-fidelity mock for DialogBuilder. Supports fluent chaining and Jest tracking.

**Initialization:**
```javascript
new DialogBuilderMock()
```


### SpreadsheetServiceMock

@class SpreadsheetServiceMock
High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.

**Initialization:**
```javascript
new SpreadsheetServiceMock()
```


### PropertiesServiceMock

@class PropertiesServiceMock
High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.

**Initialization:**
```javascript
new PropertiesServiceMock()
```


### DocumentBuilderMock

@class DocumentBuilderMock
High-fidelity mock for DocumentBuilder. Supports fluent API chaining and operation queue tracking.

**Initialization:**
```javascript
new DocumentBuilderMock()
```


### DocumentServiceMock

@class DocumentServiceMock
High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.

**Initialization:**
```javascript
new DocumentServiceMock()
```


### TriggerServiceMock

@class TriggerServiceMock
High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.

**Initialization:**
```javascript
new TriggerServiceMock()
```


### MailServiceMock

@class MailServiceMock
High-fidelity mock for MailService.

**Initialization:**
```javascript
new MailServiceMock()
```


### LockServiceMock

@class LockServiceMock
High-fidelity mock for LockService.

**Initialization:**
```javascript
new LockServiceMock()
```


### DriveServiceMock

@class DriveServiceMock
High-fidelity mock for DriveService.

**Initialization:**
```javascript
new DriveServiceMock()
```


---

