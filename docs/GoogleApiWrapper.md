# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GoogleApiWrapper](#googleapiwrapper)

---

## GoogleApiWrapper

**Version:** 3.0.0   **Layer:** Infrastructure (Layer 1)   **Dependencies:** CoreUtilsLib, GasResilienceLib

### DialogBuilder

**Source:** `GoogleApiWrapper/src/builders/DialogBuilder.ts`

Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.

**Initialization:**
```javascript
new DialogBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setTitle` | `setTitle(title: string): DialogBuilder` |
| `setContent` | `setContent(html: string): DialogBuilder` |
| `setContentFromTemplate` | `setContentFromTemplate(template: GoogleAppsScript.HTML.HtmlTemplate): DialogBuilder` |
| `setWidth` | `setWidth(pixels: number): DialogBuilder` |
| `setHeight` | `setHeight(pixels: number): DialogBuilder` |
| `show` | `show(): void` |
| `getHtmlOutput` | `getHtmlOutput(): GoogleAppsScript.HTML.HtmlOutput|null` |


### MenuBuilder

**Source:** `GoogleApiWrapper/src/builders/MenuBuilder.ts`

Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.

**Initialization:**
```javascript
new MenuBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addItem` | `addItem(caption: string, functionName: string): MenuBuilder` |
| `addSeparator` | `addSeparator(): MenuBuilder` |
| `addSubMenu` | `addSubMenu(subMenuBuilder: MenuBuilder): MenuBuilder` |
| `addToUi` | `addToUi(): void` |
| `getNativeMenu` | `getNativeMenu(): GoogleAppsScript.Base.Menu` |


### SidebarBuilder

**Source:** `GoogleApiWrapper/src/builders/SidebarBuilder.ts`

**Initialization:**
```javascript
new SidebarBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setTitle` | `setTitle(): void` |
| `setContent` | `setContent(): void` |
| `setContentFromTemplate` | `setContentFromTemplate(): void` |
| `setWidth` | `setWidth(): void` |
| `show` | `show(): void` |
| `getHtmlOutput` | `getHtmlOutput(): void` |


### GoogleService

**Source:** `GoogleApiWrapper/src/internal/core/GoogleService.ts`

Initializes service with validated dependencies. Enforces abstract class restriction.

**Initialization:**
```javascript
new GoogleService(logger: LoggerService, cache: Cache, utils: UtilsService, exceptionService: ExceptionService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_verifyAdvancedService` | `_verifyAdvancedService(serviceName: string): boolean` |
| `_generateCacheKey` | `_generateCacheKey(prefix: string, id: string, method: string): string` |
| `_getOrExecute` | `_getOrExecute(key: string, func: Function, expirationSeconds=600: number, useCache=true: boolean): *` |
| `_invalidateCache` | `_invalidateCache(key: string): void` |
| `_executeWithRetry` | `_executeWithRetry(func: Function, context={}: Object, maxAttempts=3: number): *` |


### ServiceFactory

**Source:** `GoogleApiWrapper/src/internal/core/ServiceFactory.ts`

Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.

**Initialization:**
```javascript
new ServiceFactory()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `configure` | `configure(config: Object, config.logLevel='INFO': string, config.cacheExpiration=300: number, config.mailRateLimitMs=100: number): void` |
| `reset` | `reset(resetConfig=true: boolean): void` |
| `getLogger` | `getLogger(): LoggerService` |
| `getUtilitiesService` | `getUtilitiesService(): UtilitiesService` |
| `getUtils` | `getUtils(): UtilsService` |
| `getCache` | `getCache(): Cache` |
| `getCacheService` | `getCacheService(): CacheService` |
| `getExceptionService` | `getExceptionService(): ExceptionService` |
| `getDriveService` | `getDriveService(): DriveService` |
| `getDocumentService` | `getDocumentService(): DocumentService` |
| `getSpreadsheetService` | `getSpreadsheetService(): SpreadsheetService` |
| `getMailService` | `getMailService(options={}: Object): MailService` |
| `getPermissionService` | `getPermissionService(): PermissionService` |
| `getPropertiesService` | `getPropertiesService(): PropertiesService` |
| `getTriggerService` | `getTriggerService(): TriggerService` |
| `getUiService` | `getUiService(): UiService` |
| `getUserService` | `getUserService(): UserService` |
| `setLogger` | `setLogger(logger: Object): void` |
| `setUtils` | `setUtils(utils: Object): void` |
| `setCache` | `setCache(cache: Object): void` |
| `setExceptionService` | `setExceptionService(exceptionService: Object): void` |


### DocumentBatchUpdateHandler

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentBatchUpdateHandler.ts`

**Initialization:**
```javascript
new DocumentBatchUpdateHandler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOrCreateHeader` | `getOrCreateHeader(documentId: string): GoogleAppsScript.Document.HeaderSection` |
| `getOrCreateFooter` | `getOrCreateFooter(documentId: string): GoogleAppsScript.Document.FooterSection` |
| `setHeaderText` | `setHeaderText(documentId: string, text: string): DocumentService` |
| `createDocument` | `createDocument(name: string, options={}: Object, options.destinationFolder: string): Object` |
| `getDocument` | `getDocument(documentIds: string|string[]): Object|Object[]|null` |
| `_executeBatchUpdate` | `_executeBatchUpdate(documentId: string, requests: Object[]): Object` |
| `_executeExportPDF` | `_executeExportPDF(documentId: string, op: Object): Object` |
| `batchReplaceText` | `batchReplaceText(documentIds: string|string[], searchPattern: string, replacement: string): Object` |
| `deleteDocuments` | `deleteDocuments(documentIds: string|string[]): Object` |
| `_addHeaderWithStandardAPI` | `_addHeaderWithStandardAPI(documentId: string, op: Object): Object` |
| `_addFooterWithStandardAPI` | `_addFooterWithStandardAPI(documentId: string, op: Object): Object` |


### DocumentContentExtractor

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentContentExtractor.ts`

**Initialization:**
```javascript
new DocumentContentExtractor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getRawDocumentStructure` | `getRawDocumentStructure(documentId: string): Object` |
| `_convertContentToPOJO` | `_convertContentToPOJO(content: Object[]): Object[]` |
| `_extractParagraphText` | `_extractParagraphText(paragraph: Object): string` |
| `_extractParagraphRuns` | `_extractParagraphRuns(paragraph: Object): Array<{text: string, start: number, end: number, style: Object` |
| `_extractTableData` | `_extractTableData(table: Object): Object[]` |
| `_extractCellText` | `_extractCellText(cell: Object): string` |
| `_extractCellRuns` | `_extractCellRuns(cell: Object): Array<{text: string, start: number, end: number, style: Object` |
| `getDocumentBody` | `getDocumentBody(documentId: string): Object` |
| `scanDocumentStructure` | `scanDocumentStructure(documentId: string, textPatterns=['{{': string[]): Object` |


### DocumentTableManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentTableManager.ts`

**Initialization:**
```javascript
new DocumentTableManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDocumentTables` | `getDocumentTables(documentId: string): Object[]` |
| `getTableStructure` | `getTableStructure(documentId: string, tableIndex: number): Object` |
| `getTableData` | `getTableData(documentId: string, tableIndex=0: number): Object` |
| `getTableRow` | `getTableRow(): void` |
| `getTableColumn` | `getTableColumn(): void` |
| `insertTableRow` | `insertTableRow(): void` |
| `appendTableRow` | `appendTableRow(): void` |
| `deleteTableRow` | `deleteTableRow(): void` |
| `updateTableCell` | `updateTableCell(): void` |
| `updateTableRow` | `updateTableRow(): void` |
| `updateTableColumn` | `updateTableColumn(): void` |
| `copyTableRow` | `copyTableRow(): void` |
| `copyTableColumn` | `copyTableColumn(documentId: string, tableIndex: number, sourceColumnIndex: number, targetColumnIndex: number): Object` |
| `setCellRunStyles` | `setCellRunStyles(documentId: string, tableIndex: number, rowIndex: number, columnIndex: number): Object` |
| `deleteTableColumn` | `deleteTableColumn(): void` |
| `insertTableColumn` | `insertTableColumn(): void` |
| `appendTableColumn` | `appendTableColumn(): void` |
| `setColumnWidth` | `setColumnWidth(): void` |
| `getColumnWidth` | `getColumnWidth(): void` |
| `setRowBackgroundColor` | `setRowBackgroundColor(): void` |
| `setRowMinimumHeight` | `setRowMinimumHeight(): void` |
| `getRowMinimumHeight` | `getRowMinimumHeight(): void` |
| `clearTableRow` | `clearTableRow(): void` |
| `setCellBackgroundColor` | `setCellBackgroundColor(): void` |
| `getCellBackgroundColor` | `getCellBackgroundColor(): void` |
| `setCellPadding` | `setCellPadding(): void` |
| `getCellPadding` | `getCellPadding(): void` |
| `setCellVerticalAlignment` | `setCellVerticalAlignment(): void` |
| `getCellVerticalAlignment` | `getCellVerticalAlignment(): void` |
| `getCellDetails` | `getCellDetails(): void` |
| `getTableMetadata` | `getTableMetadata(): void` |
| `setRowTextAlignment` | `setRowTextAlignment(): void` |
| `setRowBold` | `setRowBold(): void` |
| `_applyTableStyling` | `_applyTableStyling(table: GoogleAppsScript.Document.Table, data: Array<Array<string>>, options: Object): void` |
| `_createTableWithStandardAPI` | `_createTableWithStandardAPI(documentId: string, op: Object): Object` |
| `insertTableAtMarker` | `insertTableAtMarker(documentId: string, markerText: string, data: Array<Array<string>>, options={}: Object): Object` |


### SpreadsheetGridManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetGridManager.ts`

Manages structural and formatting changes for Google Sheets grids.

**Initialization:**
```javascript
new SpreadsheetGridManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `formatRanges` | `formatRanges(): void` |
| `setColumnWidths` | `setColumnWidths(): void` |
| `createSheets` | `createSheets(): void` |
| `deleteSheets` | `deleteSheets(): void` |
| `deleteRow` | `deleteRow(): void` |
| `deleteColumn` | `deleteColumn(spreadsheetId: string, sheetName: string, columnIndex: number): *` |
| `deleteRows` | `deleteRows(): void` |
| `expandSheetGrid` | `expandSheetGrid(): void` |
| `getProtectedRanges` | `getProtectedRanges(): void` |
| `deleteProtectedRanges` | `deleteProtectedRanges(): void` |
| `protectRanges` | `protectRanges(): void` |


### SpreadsheetHybridManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetHybridManager.ts`

**Initialization:**
```javascript
new SpreadsheetHybridManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createSpreadsheet` | `createSpreadsheet(title: string, options={}: Object, options.destinationFolder: string): Object` |
| `openStandard` | `openStandard(): void` |
| `getActiveStandard` | `getActiveStandard(): void` |
| `getStandardApp` | `getStandardApp(): void` |
| `flushBatch` | `flushBatch(): void` |
| `_verifyAdvancedSheets` | `_verifyAdvancedSheets(): void` |


### SpreadsheetMetadataCache

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetMetadataCache.ts`

**Initialization:**
```javascript
new SpreadsheetMetadataCache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getSpreadsheetMetadata` | `getSpreadsheetMetadata(): void` |
| `getSheetInfo` | `getSheetInfo(): void` |
| `_getCachedSheetMetadata` | `_getCachedSheetMetadata(): void` |
| `_clearSheetMetadataCache` | `_clearSheetMetadataCache(): void` |
| `_parseRangeToGridRange` | `_parseRangeToGridRange(): void` |
| `_parseCell` | `_parseCell(): void` |
| `_columnToIndex` | `_columnToIndex(): void` |


### SpreadsheetRangeManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetRangeManager.ts`

**Initialization:**
```javascript
new SpreadsheetRangeManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `updateRanges` | `updateRanges(): void` |
| `getRanges` | `getRanges(): void` |
| `appendRows` | `appendRows(): void` |
| `insertRow` | `insertRow(): void` |
| `getLastError` | `getLastError(): void` |
| `clearRanges` | `clearRanges(): void` |


### TextStyleMapper

**Source:** `GoogleApiWrapper/src/internal/services-managers/TextStyleMapper.ts`

**Initialization:**
```javascript
new TextStyleMapper()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `toNativeAttributes` | `toNativeAttributes(textStyle: Object): Object` |
| `_rgbColorToHex` | `_rgbColorToHex(rgbColor: Object): string` |


### CacheService

**Source:** `GoogleApiWrapper/src/services/CacheService.ts`

Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.

**Initialization:**
```javascript
new CacheService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptCache` | `getScriptCache(): Object` |
| `getUserCache` | `getUserCache(): Object` |
| `getDocumentCache` | `getDocumentCache(): Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptCache` | `getScriptCache(): Cache` |
| `getUserCache` | `getUserCache(): Cache` |
| `getDocumentCache` | `getDocumentCache(): Cache` |


### Cache

**Source:** `GoogleApiWrapper/src/services/CacheService.ts`

Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.

**Initialization:**
```javascript
new Cache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(key: string): string|null` |
| `getAll` | `getAll(keys: string[]): Object<string, string|null>` |
| `put` | `put(key: string, value: *, expirationInSeconds=600: number): void` |
| `putAll` | `putAll(values: Object<string, *>, expirationInSeconds=600: number): void` |
| `remove` | `remove(key: string): void` |
| `removeAll` | `removeAll(keys: string[]): void` |
| `unwrap` | `unwrap(): GoogleAppsScript.Cache.Cache` |


### DocumentBuilder

**Source:** `GoogleApiWrapper/src/services/DocumentBuilder.ts`

Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.

**Initialization:**
```javascript
new DocumentBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `appendParagraph` | `appendParagraph(text: string, options={}: Object): DocumentBuilder` |
| `appendListItem` | `appendListItem(text: string, options={}: Object): DocumentBuilder` |
| `setText` | `setText(text: string): DocumentBuilder` |
| `createTable` | `createTable(data: Array<Array>, options={}: Object): DocumentBuilder` |
| `addHeader` | `addHeader(text: string): DocumentBuilder` |
| `addFooter` | `addFooter(text: string): DocumentBuilder` |
| `replaceText` | `replaceText(searchPattern: string, replacement: string): DocumentBuilder` |
| `exportPDF` | `exportPDF(fileName: string, destinationFolderId=null: string): DocumentBuilder` |
| `execute` | `execute(): Object` |
| `_convertOperationToDocsRequests` | `_convertOperationToDocsRequests(op: Object): Object[]` |
| `_createAppendParagraphRequests` | `_createAppendParagraphRequests(): void` |
| `_createAppendListItemRequests` | `_createAppendListItemRequests(): void` |
| `_getBodyEndIndex` | `_getBodyEndIndex(): number` |
| `_createSetTextRequests` | `_createSetTextRequests(): void` |
| `_createTableRequests` | `_createTableRequests(): void` |
| `_createHeaderRequests` | `_createHeaderRequests(): void` |
| `_createFooterRequests` | `_createFooterRequests(): void` |
| `_createReplaceTextRequests` | `_createReplaceTextRequests(): void` |


### DocumentService

**Source:** `GoogleApiWrapper/src/services/DocumentService.ts`

Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.

**Initialization:**
```javascript
new DocumentService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `document` | `document(documentId: string): DocumentBuilder` |
| `openStandard` | `openStandard(documentId: string): GoogleAppsScript.Document.Document` |
| `getStandardApp` | `getStandardApp(): GoogleAppsScript.Document.DocumentApp` |


### DriveService

**Source:** `GoogleApiWrapper/src/services/DriveService.ts`

Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.

**Initialization:**
```javascript
new DriveService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `DRY_RUN_ID_PREFIX` | `DRY_RUN_ID_PREFIX: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |
| `_generateDryRunId` | `_generateDryRunId(): string` |
| `getStandardApp` | `getStandardApp(): GoogleAppsScript.Drive.DriveApp` |


### LockService

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.

**Initialization:**
```javascript
new LockService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptLock` | `getScriptLock(): Lock|MockLock` |
| `getUserLock` | `getUserLock(): Lock|MockLock` |
| `getDocumentLock` | `getDocumentLock(documentId: string): Lock|MockLock` |


### Lock

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

**Initialization:**
```javascript
new Lock(nativeLock: GoogleAppsScript.Lock.Lock, logger: LoggerService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `tryLock` | `tryLock(timeoutInMillis: number): boolean` |
| `waitLock` | `waitLock(timeoutInMillis: number): void` |
| `releaseLock` | `releaseLock(): void` |
| `hasLock` | `hasLock(): boolean` |


### MockLock

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

**Initialization:**
```javascript
new MockLock(logger: LoggerService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `tryLock` | `tryLock(timeoutInMillis: number): boolean` |
| `waitLock` | `waitLock(timeoutInMillis: number): void` |
| `releaseLock` | `releaseLock(): void` |
| `hasLock` | `hasLock(): boolean` |


### MailService

**Source:** `GoogleApiWrapper/src/services/MailService.ts`

Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.

**Initialization:**
```javascript
new MailService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getQuotaUsage` | `getQuotaUsage(): number` |
| `searchMessages` | `searchMessages(query: string, maxResults=50: number): Array<{id: string, threadId: string, subject: string, from: string, date: Date, plainBody: string` |
| `send` | `send(emailOptions: Object, emailOptions.to: string|string[], emailOptions.subject: string, emailOptions.body: string, emailOptions.htmlBody: string, emailOptions.attachments: BlobSource[]): Object` |
| `sendBatch` | `sendBatch(emails: Object[]): Object` |
| `createDraft` | `createDraft(emailOptions: Object): Object` |
| `sendBulk` | `sendBulk(recipientData: Object[], bodyGenerator: Function, subject: string, isHtml=true: boolean): Object` |
| `sendNotification` | `sendNotification(emails: string|string[], title: string, message: string): Object` |


### PermissionService

**Source:** `GoogleApiWrapper/src/services/PermissionService.ts`

Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.

**Initialization:**
```javascript
new PermissionService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `shareWithUsers` | `shareWithUsers(fileIds: string|string[], permissions: Object|Object[], options={}: Object, options.sendNotificationEmail=false: boolean): Object` |
| `removeAccess` | `removeAccess(fileIds: string|string[], emailsOrPermissionIds: string|string[]): Object` |
| `changeRoles` | `changeRoles(fileIds: string|string[], roleChanges: Object|Object[], options={}: Object, fileIds: string|string[], roleChanges: Object|Object[]): Object` |
| `changeRolesByPermissionId` | `changeRolesByPermissionId(fileIds: string|string[], _options: Object): {successful: Array<Object>, failed: Array<Object>` |
| `transferOwnership` | `transferOwnership(fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object, options.sendNotificationEmail=false: boolean, fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object): Object` |
| `getPermissions` | `getPermissions(fileIds: string|string[], options={}: Object, fileIds: string|string[]): Array<Object>|Object<string, Array<Object>>` |
| `getSharingLink` | `getSharingLink(fileIds: string|string[], accessType='view': string, options={}: Object, fileIds: string|string[], accessType='view': string): string|Object<string, string>` |


### PropertiesService

**Source:** `GoogleApiWrapper/src/services/PropertiesService.ts`

Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.

**Initialization:**
```javascript
new PropertiesService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptProperties` | `getScriptProperties(): Object` |
| `getUserProperties` | `getUserProperties(): Object` |
| `getDocumentProperties` | `getDocumentProperties(): Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setUserProperty` | `setUserProperty(key: string, value: string|number|boolean): string|null` |
| `getUserProperty` | `getUserProperty(): void` |
| `deleteUserProperty` | `deleteUserProperty(): void` |
| `setDocumentProperty` | `setDocumentProperty(key: string, value: string|number|boolean): string|null` |
| `getDocumentProperty` | `getDocumentProperty(): void` |
| `deleteDocumentProperty` | `deleteDocumentProperty(): void` |
| `setProperty` | `setProperty(key: string, value: string|number|boolean): string|null` |
| `getProperty` | `getProperty(): void` |
| `setProperties` | `setProperties(properties: Object<string, string|number|boolean>): void` |
| `deleteProperty` | `deleteProperty(key: string): void` |
| `deleteAllProperties` | `deleteAllProperties(): number` |
| `getKeys` | `getKeys(): string[]` |
| `getProperties` | `getProperties(): Object<string, string>` |
| `setObjectProperty` | `setObjectProperty(key: string, object: Object): void` |
| `getObjectProperty` | `getObjectProperty(key: string): Object|null` |
| `_dateReviver` | `_dateReviver(key: string, value: *): Date|*` |
| `hasProperty` | `hasProperty(key: string): boolean` |
| `getPropertyOrDefault` | `getPropertyOrDefault(key: string, defaultValue: string): string` |
| `updatePropertyIfExists` | `updatePropertyIfExists(key: string, value: string|number|boolean): boolean` |
| `setPropertyIfNotExists` | `setPropertyIfNotExists(key: string, value: string|number|boolean): boolean` |
| `getNumericProperty` | `getNumericProperty(key: string, defaultValue=0: number): number` |
| `getBooleanProperty` | `getBooleanProperty(key: string, defaultValue=false: boolean): boolean` |


### SpreadsheetService

**Source:** `GoogleApiWrapper/src/services/SpreadsheetService.ts`

Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.

**Initialization:**
```javascript
new SpreadsheetService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |


### TriggerService

**Source:** `GoogleApiWrapper/src/services/TriggerService.ts`

Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.

**Initialization:**
```javascript
new TriggerService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createTimedTrigger` | `createTimedTrigger(functionName: string, milliseconds: number): string` |
| `createRecurringTrigger` | `createRecurringTrigger(functionName: string, cronExpression: string): string` |
| `_parseCronExpression` | `_parseCronExpression(cronExpression: string): Object` |
| `getAllTriggers` | `getAllTriggers(): Object[]` |
| `findTriggerById` | `findTriggerById(triggerId: string): GoogleAppsScript.Script.Trigger|null` |
| `deleteTriggerById` | `deleteTriggerById(triggerId: string): boolean` |
| `deleteTriggersByFunction` | `deleteTriggersByFunction(functionName: string): number` |
| `deleteAllTriggers` | `deleteAllTriggers(): number` |
| `triggerExistsForFunction` | `triggerExistsForFunction(functionName: string): boolean` |
| `getTriggerInfo` | `getTriggerInfo(triggerId: string): Object|null` |
| `findTriggersByFunction` | `findTriggersByFunction(functionName: string): Object[]` |
| `findTriggersByType` | `findTriggersByType(triggerType: string): Object[]` |
| `_determineTriggerType` | `_determineTriggerType(trigger: GoogleAppsScript.Script.Trigger): string` |
| `createTriggerAt` | `createTriggerAt(functionName: string, date: Date): string` |
| `createEveryMinutesTrigger` | `createEveryMinutesTrigger(functionName: string, minutes: number): string` |
| `createEveryHoursTrigger` | `createEveryHoursTrigger(functionName: string, hours: number): string` |
| `createDailyTrigger` | `createDailyTrigger(functionName: string, hour: number): string` |
| `createWeeklyTrigger` | `createWeeklyTrigger(functionName: string, weekDay: GoogleAppsScript.Base.Weekday, hour: number): string` |


### UiService

**Source:** `GoogleApiWrapper/src/services/UiService.ts`

Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.

**Initialization:**
```javascript
new UiService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_detectUiObject` | `_detectUiObject(): UiBackend|null` |
| `createMenu` | `createMenu(caption: string): MenuBuilder` |
| `alert` | `alert(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.Button` |
| `prompt` | `prompt(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.PromptResponse` |
| `createSidebar` | `createSidebar(): SidebarBuilder` |
| `createDialog` | `createDialog(): DialogBuilder` |
| `getNativeUi` | `getNativeUi(): UiBackend` |
| `Button` | `Button: GoogleAppsScript.Base.Button` |
| `ButtonSet` | `ButtonSet: GoogleAppsScript.Base.ButtonSet` |


### UserService

**Source:** `GoogleApiWrapper/src/services/UserService.ts`

Lightweight facade for the native GAS `Session` global — the L2
boundary for running-user identity lookups, so no other library or consumer
needs to touch `Session` directly.

**Initialization:**
```javascript
new UserService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActiveUserEmail` | `getActiveUserEmail(): string` |


### UtilitiesService

**Source:** `GoogleApiWrapper/src/services/UtilitiesService.ts`

Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.

**Initialization:**
```javascript
new UtilitiesService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `sleep` | `sleep(milliseconds: number): void` |
| `getUuid` | `getUuid(): string` |
| `base64Encode` | `base64Encode(data: string|Blob, charset: string): string` |
| `base64Decode` | `base64Decode(encoded: string): Blob` |
| `base64EncodeWebSafe` | `base64EncodeWebSafe(data: string|Blob, charset: string): string` |
| `base64DecodeWebSafe` | `base64DecodeWebSafe(encoded: string): Blob` |
| `formatString` | `formatString(template: string, args: ...*): string` |
| `formatDateNative` | `formatDateNative(date: Date, timeZone: string, format: string): string` |
| `parseCsv` | `parseCsv(csv: string, delimiter=',': string): string[][]` |
| `newBlob` | `newBlob(data: string|number[], contentType='text/plain': string, name='blob': string): Blob` |
| `gzip` | `gzip(blob: Blob): Blob` |
| `ungzip` | `ungzip(blob: Blob): Blob` |
| `zip` | `zip(blobs: Blob[], name='archive.zip': string): Blob` |
| `unzip` | `unzip(blob: Blob): Blob[]` |
| `computeDigest` | `computeDigest(algorithm: string, value: string|Blob, charset='UTF_8': string): number[]` |
| `computeHmacSignature` | `computeHmacSignature(algorithm: string, value: string|Blob, key: string|Blob, charset='UTF_8': string): number[]` |
| `jsonStringify` | `jsonStringify(obj: *, prettyPrint=false: boolean): string` |
| `jsonParse` | `jsonParse(json: string): *` |


### DriveFileManager

**Source:** `GoogleApiWrapper/src/services/drive/DriveFileManager.ts`

**Initialization:**
```javascript
new DriveFileManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `deleteFiles` | `deleteFiles(fileIds: string|string[], options={}: Object, options.permanently=false: boolean): Object` |
| `restoreFiles` | `restoreFiles(fileIds: string|string[], options={}: Object): Object` |
| `copyFiles` | `copyFiles(copyRequests: Object|Object[], options={}: Object): Object` |
| `moveFiles` | `moveFiles(moveRequests: Object|Object[], options={}: Object): Object` |
| `renameFiles` | `renameFiles(renameRequests: Object|Object[], options={}: Object): Object` |
| `getFileByIdStandard` | `getFileByIdStandard(fileId: string): GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder` |


### DriveFolderManager

**Source:** `GoogleApiWrapper/src/services/drive/DriveFolderManager.ts`

**Initialization:**
```javascript
new DriveFolderManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createFolder` | `createFolder(folderName: string, parentFolderId=null: string, options={}: Object, options.returnExistingIfFound=false: boolean): Object` |
| `getFolderByIdStandard` | `getFolderByIdStandard(folderId: string): GoogleAppsScript.Drive.Folder` |


### DriveMetadataService

**Source:** `GoogleApiWrapper/src/services/drive/DriveMetadataService.ts`

**Initialization:**
```javascript
new DriveMetadataService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `updateMetadata` | `updateMetadata(updateRequests: Object|Object[], options={}: Object): Object` |
| `getFiles` | `getFiles(fileIds: string|string[], options={}: Object, options.fields: string, options.strict=false: boolean): Object|Object<string, Object>` |
| `getPermissions` | `getPermissions(fileIds: string|string[]): Object[]|Object<string, Object[]>` |
| `getFileOwnerEmail` | `getFileOwnerEmail(fileId: string): string|null` |
| `searchFiles` | `searchFiles(query: string, options={}: Object, options.maxResults=Infinity: number, options.orderBy: string): Object[]` |


### DriveShortcutHandler

**Source:** `GoogleApiWrapper/src/services/drive/DriveShortcutHandler.ts`

**Initialization:**
```javascript
new DriveShortcutHandler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createShortcut` | `createShortcut(targetId: string, name: string, parentId=null: string): Object` |
| `getTargetId` | `getTargetId(shortcutId: string): string|null` |
| `isShortcut` | `isShortcut(fileId: string): boolean` |


### SpreadsheetServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.

**Initialization:**
```javascript
new SpreadsheetServiceMock()
```


### PropertiesServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.

**Initialization:**
```javascript
new PropertiesServiceMock()
```


### DocumentServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.

**Initialization:**
```javascript
new DocumentServiceMock()
```


### TriggerServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.

**Initialization:**
```javascript
new TriggerServiceMock()
```


### MailServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for MailService.

**Initialization:**
```javascript
new MailServiceMock()
```


### LockServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for LockService.

**Initialization:**
```javascript
new LockServiceMock()
```


### DriveServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for DriveService.

**Initialization:**
```javascript
new DriveServiceMock()
```


---

