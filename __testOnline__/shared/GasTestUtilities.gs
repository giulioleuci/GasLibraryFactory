/**
 * Google Apps Script specific test utilities
 * Provides helpers for interacting with GAS APIs in tests
 */

/**
 * Test folder management utilities
 * Manages a persistent TEST folder for developer inspection
 */
class TestFolderManager {
  /**
   * Get or create the main TEST folder
   */
  static getOrCreateTestFolder() {
    const folders = DriveApp.getFoldersByName('TEST');
    if (folders.hasNext()) {
      return folders.next();
    }
    const folder = DriveApp.createFolder('TEST');
    Logger.log(`Created TEST folder: ${folder.getUrl()}`);
    return folder;
  }

  /**
   * Create a timestamped subfolder in TEST folder
   */
  static createTimestampedFolder(prefix = 'Test') {
    const testFolder = this.getOrCreateTestFolder();
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );
    const folderName = `${prefix}_${timestamp}`;
    const subfolder = testFolder.createFolder(folderName);
    Logger.log(`Created test subfolder: ${subfolder.getName()} - ${subfolder.getUrl()}`);
    return subfolder;
  }

  /**
   * Create a timestamped file in TEST folder
   */
  static createTimestampedFile(prefix, content, mimeType = 'text/plain', extension = 'txt') {
    const testFolder = this.getOrCreateTestFolder();
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );
    const fileName = `${prefix}_${timestamp}.${extension}`;
    const blob = Utilities.newBlob(content, mimeType, fileName);
    const file = testFolder.createFile(blob);
    Logger.log(`Created test file: ${fileName} - ${file.getUrl()}`);
    return file;
  }

  /**
   * Create a timestamped spreadsheet in TEST folder
   */
  static createTimestampedSpreadsheet(prefix) {
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );
    const name = `${prefix}_${timestamp}`;
    const spreadsheet = SpreadsheetApp.create(name);
    const file = DriveApp.getFileById(spreadsheet.getId());

    const testFolder = this.getOrCreateTestFolder();
    file.moveTo(testFolder);

    Logger.log(`Created test spreadsheet: ${name} - ${spreadsheet.getUrl()}`);
    return spreadsheet;
  }

  /**
   * Create a timestamped document in TEST folder
   */
  static createTimestampedDocument(prefix) {
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );
    const name = `${prefix}_${timestamp}`;
    const doc = DocumentApp.create(name);
    const file = DriveApp.getFileById(doc.getId());

    const testFolder = this.getOrCreateTestFolder();
    file.moveTo(testFolder);

    Logger.log(`Created test document: ${name} - ${doc.getUrl()}`);
    return doc;
  }

  /**
   * List all items in TEST folder
   */
  static listTestFolderContents() {
    const testFolder = this.getOrCreateTestFolder();
    Logger.log(`TEST folder contents (${testFolder.getUrl()}):`);

    const files = testFolder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      Logger.log(`  FILE: ${file.getName()} (${file.getMimeType()})`);
    }

    const folders = testFolder.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      Logger.log(`  FOLDER: ${folder.getName()}`);
    }
  }
}

/**
 * Google Drive test utilities
 */
class DriveTestUtils {
  /**
   * Create a test folder
   */
  static createTestFolder(name, parentFolder = null) {
    const folderName = name || TestDataGenerator.uniqueName('TestFolder');

    if (parentFolder) {
      return parentFolder.createFolder(folderName);
    } else {
      return DriveApp.createFolder(folderName);
    }
  }

  /**
   * Create a test file
   */
  static createTestFile(name, content = 'Test content', mimeType = 'text/plain') {
    const fileName = name || TestDataGenerator.uniqueName('TestFile');
    const blob = Utilities.newBlob(content, mimeType, fileName);
    return DriveApp.createFile(blob);
  }

  /**
   * Get or create test folder (idempotent)
   */
  static getOrCreateTestFolder(name) {
    const folders = DriveApp.getFoldersByName(name);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(name);
  }

  /**
   * Delete folder and all contents
   */
  static deleteFolder(folderId) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      folder.setTrashed(true);
      return true;
    } catch (error) {
      Logger.log(`Warning: Could not delete folder ${folderId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete file
   */
  static deleteFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      return true;
    } catch (error) {
      Logger.log(`Warning: Could not delete file ${fileId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Wait for file to be available
   */
  static waitForFile(fileId, maxAttempts = 10, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const file = DriveApp.getFileById(fileId);
        if (file) return true;
      } catch (error) {
        Utilities.sleep(delayMs);
      }
    }
    return false;
  }
}

/**
 * Google Sheets test utilities
 */
class SheetsTestUtils {
  /**
   * Create a test spreadsheet
   */
  static createTestSpreadsheet(name, rows = 10, cols = 5) {
    const sheetName = name || TestDataGenerator.uniqueName('TestSheet');
    const spreadsheet = SpreadsheetApp.create(sheetName, rows, cols);
    return spreadsheet;
  }

  /**
   * Create spreadsheet with data
   */
  static createSpreadsheetWithData(name, data, headers = null) {
    const spreadsheet = this.createTestSpreadsheet(name);
    const sheet = spreadsheet.getActiveSheet();

    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      if (data && data.length > 0) {
        sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
      }
    } else if (data && data.length > 0) {
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }

    SpreadsheetApp.flush();
    return spreadsheet;
  }

  /**
   * Create a named sheet with data in an existing spreadsheet
   */
  static createSheetWithData(spreadsheet, sheetName, data) {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    if (data && data.length > 0) {
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
    SpreadsheetApp.flush();
    return sheet;
  }

  /**
   * Get spreadsheet data as array of arrays
   */
  static getSheetData(spreadsheet, sheetName = null) {
    const sheet = sheetName ? spreadsheet.getSheetByName(sheetName) : spreadsheet.getActiveSheet();
    const range = sheet.getDataRange();
    return range.getValues();
  }

  /**
   * Get spreadsheet data as array of objects (first row as headers)
   */
  static getSheetDataAsObjects(spreadsheet, sheetName = null) {
    const data = this.getSheetData(spreadsheet, sheetName);
    if (data.length === 0) return [];

    const headers = data[0];
    const rows = data.slice(1);

    return rows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  /**
   * Delete spreadsheet
   */
  static deleteSpreadsheet(spreadsheetId) {
    try {
      const file = DriveApp.getFileById(spreadsheetId);
      file.setTrashed(true);
      return true;
    } catch (error) {
      Logger.log(`Warning: Could not delete spreadsheet ${spreadsheetId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear sheet data
   */
  static clearSheet(spreadsheet, sheetName = null) {
    const sheet = sheetName ? spreadsheet.getSheetByName(sheetName) : spreadsheet.getActiveSheet();
    sheet.clear();
  }

  /**
   * Generate test data for sheets
   */
  static generateTestData(rows = 10, cols = 5) {
    const data = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(`Cell_${i}_${j}`);
      }
      data.push(row);
    }
    return data;
  }

  /**
   * Generate structured test data with headers
   */
  static generateStructuredData(rowCount = 10) {
    const headers = ['ID', 'Name', 'Email', 'Age', 'Status'];
    const data = [];

    for (let i = 1; i <= rowCount; i++) {
      data.push([
        i,
        `User ${i}`,
        `user${i}@example.com`,
        20 + (i % 50),
        i % 2 === 0 ? 'active' : 'inactive'
      ]);
    }

    return { headers, data };
  }
}

/**
 * Google Docs test utilities
 */
class DocsTestUtils {
  /**
   * Create a test document
   */
  static createTestDocument(name, content = null) {
    const docName = name || TestDataGenerator.uniqueName('TestDoc');
    const doc = DocumentApp.create(docName);

    if (content) {
      const body = doc.getBody();
      body.appendParagraph(content);
    }

    return doc;
  }

  /**
   * Create document with structured content
   */
  static createDocumentWithContent(name, sections = []) {
    const doc = this.createTestDocument(name);
    const body = doc.getBody();

    sections.forEach((section) => {
      if (section.type === 'heading') {
        body.appendParagraph(section.text).setHeading(DocumentApp.ParagraphHeading.HEADING1);
      } else if (section.type === 'paragraph') {
        body.appendParagraph(section.text);
      } else if (section.type === 'table') {
        body.appendTable(section.data);
      } else if (section.type === 'list') {
        section.items.forEach((item) => {
          body.appendListItem(item);
        });
      }
    });

    return doc;
  }

  /**
   * Get document text content
   */
  static getDocumentText(doc) {
    return doc.getBody().getText();
  }

  /**
   * Delete document
   */
  static deleteDocument(documentId) {
    try {
      const file = DriveApp.getFileById(documentId);
      file.setTrashed(true);
      return true;
    } catch (error) {
      Logger.log(`Warning: Could not delete document ${documentId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Create document with table
   */
  static createDocumentWithTable(name, tableData) {
    const doc = this.createTestDocument(name);
    const body = doc.getBody();
    body.appendTable(tableData);
    return doc;
  }
}

/**
 * Properties Service test utilities
 */
class PropertiesTestUtils {
  /**
   * Set test properties
   */
  static setTestProperties(properties, store = 'script') {
    const propService = this.getPropertiesService(store);
    propService.setProperties(properties);
  }

  /**
   * Get test properties
   */
  static getTestProperties(keys, store = 'script') {
    const propService = this.getPropertiesService(store);
    const result = {};

    keys.forEach((key) => {
      result[key] = propService.getProperty(key);
    });

    return result;
  }

  /**
   * Clear test properties
   */
  static clearTestProperties(keys, store = 'script') {
    const propService = this.getPropertiesService(store);

    keys.forEach((key) => {
      propService.deleteProperty(key);
    });
  }

  /**
   * Clear all properties
   */
  static clearAllProperties(store = 'script') {
    const propService = this.getPropertiesService(store);
    propService.deleteAllProperties();
  }

  /**
   * Get properties service
   */
  static getPropertiesService(store) {
    switch (store) {
      case 'script':
        return PropertiesService.getScriptProperties();
      case 'user':
        return PropertiesService.getUserProperties();
      case 'document':
        return PropertiesService.getDocumentProperties();
      default:
        throw new Error(`Unknown properties store: ${store}`);
    }
  }
}

/**
 * Cache Service test utilities
 */
class CacheTestUtils {
  /**
   * Set test cache values
   */
  static setTestCache(values, store = 'script', expirationInSeconds = 600) {
    const cache = this.getCacheService(store);

    Object.keys(values).forEach((key) => {
      cache.put(key, values[key], expirationInSeconds);
    });
  }

  /**
   * Get test cache values
   */
  static getTestCache(keys, store = 'script') {
    const cache = this.getCacheService(store);
    return cache.getAll(keys);
  }

  /**
   * Clear test cache
   */
  static clearTestCache(keys, store = 'script') {
    const cache = this.getCacheService(store);
    cache.removeAll(keys);
  }

  /**
   * Clear all cache
   */
  static clearAllCache(store = 'script') {
    const cache = this.getCacheService(store);

    // Note: CacheService doesn't have a removeAll() without keys
    // This is a limitation of GAS CacheService
    Logger.log('Warning: CacheService does not support clearing all values without keys');
  }

  /**
   * Get cache service
   */
  static getCacheService(store) {
    switch (store) {
      case 'script':
        return CacheService.getScriptCache();
      case 'user':
        return CacheService.getUserCache();
      case 'document':
        return CacheService.getDocumentCache();
      default:
        throw new Error(`Unknown cache store: ${store}`);
    }
  }
}

/**
 * Trigger test utilities
 */
class TriggerTestUtils {
  /**
   * Create a time-based trigger for testing
   */
  static createTestTrigger(functionName, delayMinutes = 1) {
    const trigger = ScriptApp.newTrigger(functionName)
      .timeBased()
      .after(delayMinutes * 60 * 1000)
      .create();

    return trigger.getUniqueId();
  }

  /**
   * Delete trigger
   */
  static deleteTrigger(triggerId) {
    const triggers = ScriptApp.getProjectTriggers();

    for (const trigger of triggers) {
      if (trigger.getUniqueId() === triggerId) {
        ScriptApp.deleteTrigger(trigger);
        return true;
      }
    }

    return false;
  }

  /**
   * Delete all triggers for a function
   */
  static deleteTriggersForFunction(functionName) {
    const triggers = ScriptApp.getProjectTriggers();
    let count = 0;

    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === functionName) {
        ScriptApp.deleteTrigger(trigger);
        count++;
      }
    }

    return count;
  }

  /**
   * Get all triggers
   */
  static getAllTriggers() {
    return ScriptApp.getProjectTriggers().map((trigger) => ({
      id: trigger.getUniqueId(),
      function: trigger.getHandlerFunction(),
      type: trigger.getEventType().toString()
    }));
  }
}

/**
 * Comparison utilities for detailed test output
 */
class ComparisonUtils {
  /**
   * Print a detailed comparison between expected and actual values
   */
  static printComparison(label, expected, actual, passed = null) {
    Logger.log(`\n${'='.repeat(60)}`);
    Logger.log(`COMPARISON: ${label}`);
    Logger.log(`${'='.repeat(60)}`);
    Logger.log(`Expected: ${this.formatValue(expected)}`);
    Logger.log(`Actual:   ${this.formatValue(actual)}`);

    if (passed !== null) {
      Logger.log(`Result:   ${passed ? '✓ PASS' : '✗ FAIL'}`);
    } else {
      const match = JSON.stringify(expected) === JSON.stringify(actual);
      Logger.log(`Result:   ${match ? '✓ PASS (Match)' : '✗ FAIL (Mismatch)'}`);
    }
    Logger.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Print array comparison with element-by-element details
   */
  static printArrayComparison(label, expected, actual) {
    Logger.log(`\n${'='.repeat(60)}`);
    Logger.log(`ARRAY COMPARISON: ${label}`);
    Logger.log(`${'='.repeat(60)}`);
    Logger.log(`Expected length: ${expected ? expected.length : 'null'}`);
    Logger.log(`Actual length:   ${actual ? actual.length : 'null'}`);

    if (expected && actual) {
      const maxLen = Math.max(expected.length, actual.length);
      for (let i = 0; i < maxLen; i++) {
        const exp = i < expected.length ? expected[i] : '(missing)';
        const act = i < actual.length ? actual[i] : '(missing)';
        const match = JSON.stringify(exp) === JSON.stringify(act);
        Logger.log(
          `  [${i}] ${match ? '✓' : '✗'} Expected: ${this.formatValue(exp)} | Actual: ${this.formatValue(act)}`
        );
      }
    }
    Logger.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Print object comparison with property-by-property details
   */
  static printObjectComparison(label, expected, actual) {
    Logger.log(`\n${'='.repeat(60)}`);
    Logger.log(`OBJECT COMPARISON: ${label}`);
    Logger.log(`${'='.repeat(60)}`);

    const allKeys = new Set([...Object.keys(expected || {}), ...Object.keys(actual || {})]);

    allKeys.forEach((key) => {
      const exp = expected ? expected[key] : '(missing)';
      const act = actual ? actual[key] : '(missing)';
      const match = JSON.stringify(exp) === JSON.stringify(act);
      Logger.log(
        `  ${key}: ${match ? '✓' : '✗'} Expected: ${this.formatValue(exp)} | Actual: ${this.formatValue(act)}`
      );
    });

    Logger.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Format a value for display
   */
  static formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Print test section header
   */
  static printSection(title) {
    Logger.log(`\n\n${'#'.repeat(70)}`);
    Logger.log(`# ${title}`);
    Logger.log(`${'#'.repeat(70)}\n`);
  }

  /**
   * Print test result summary
   */
  static printResult(description, value, details = null) {
    Logger.log(`\n► ${description}`);
    Logger.log(`  Result: ${this.formatValue(value)}`);
    if (details) {
      Logger.log(`  Details: ${details}`);
    }
  }

  /**
   * Print a table of results
   */
  static printTable(title, headers, rows) {
    Logger.log(`\n${title}`);
    Logger.log(`${'-'.repeat(60)}`);
    Logger.log(headers.join(' | '));
    Logger.log(`${'-'.repeat(60)}`);
    rows.forEach((row) => {
      Logger.log(row.join(' | '));
    });
    Logger.log(`${'-'.repeat(60)}\n`);
  }
}

/**
 * Lock Service test utilities
 */
class LockTestUtils {
  /**
   * Test script lock
   */
  static testScriptLock(fn, waitTime = 30000) {
    const lock = LockService.getScriptLock();
    const hasLock = lock.tryLock(waitTime);

    if (!hasLock) {
      throw new Error('Could not acquire script lock');
    }

    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Test user lock
   */
  static testUserLock(fn, waitTime = 30000) {
    const lock = LockService.getUserLock();
    const hasLock = lock.tryLock(waitTime);

    if (!hasLock) {
      throw new Error('Could not acquire user lock');
    }

    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Test document lock
   */
  static testDocumentLock(fn, waitTime = 30000) {
    const lock = LockService.getDocumentLock();
    const hasLock = lock.tryLock(waitTime);

    if (!hasLock) {
      throw new Error('Could not acquire document lock');
    }

    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  }
}
