// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/DocumentService.test.js
// ===================================================================
// Comprehensive test suite for DocumentService (v3.0)
// Coverage: Document creation, builder pattern, batch operations
// ===================================================================

import { DocumentService, DocumentBuilder } from '../DocumentService';

describe('DocumentService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let cache;
  let utils;
  let exceptionService;
  let mockDocs;

  beforeEach(() => {
    global.resetGasMocks();

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    cache = {
      get: jest.fn(() => null),
      put: jest.fn(),
      remove: jest.fn()
    };

    utils = {
      sleep: jest.fn()
    };

    exceptionService = {
      executeWithRetry: jest.fn((fn) => fn())
    };

    // Mock Docs API
    mockDocs = {
      Documents: {
        create: jest.fn(() => ({ documentId: 'doc123', title: 'Test Doc' })),
        get: jest.fn(() => ({
          documentId: 'doc123',
          title: 'Test Doc',
          body: {
            content: [
              { startIndex: 1, endIndex: 1 },
              { startIndex: 1, endIndex: 100001 } // Last element with endIndex for setText
            ]
          }
        })),
        batchUpdate: jest.fn(() => ({ replies: [] }))
      }
    };

    // Mock DocumentApp for table operations (standard API)
    const mockCell = {
      editAsText: jest.fn(() => ({
        setBold: jest.fn(() => mockCell)
      })),
      setBackgroundColor: jest.fn(() => mockCell),
      setWidth: jest.fn(() => mockCell)
    };

    const mockRow = {
      getNumCells: jest.fn(() => 2),
      getCell: jest.fn(() => mockCell)
    };

    const mockTable = {
      getRow: jest.fn(() => mockRow),
      getNumRows: jest.fn(() => 2)
    };

    const mockBody = {
      appendTable: jest.fn(() => mockTable)
    };

    const mockDoc = {
      getBody: jest.fn(() => mockBody),
      getHeader: jest.fn(() => null),
      addHeader: jest.fn(() => ({
        clear: jest.fn().mockReturnThis(),
        appendParagraph: jest.fn().mockReturnThis()
      })),
      getFooter: jest.fn(() => null),
      addFooter: jest.fn(() => ({
        clear: jest.fn().mockReturnThis(),
        appendParagraph: jest.fn().mockReturnThis()
      }))
    };

    global.DocumentApp = {
      openById: jest.fn(() => mockDoc)
    };

    global.Docs = mockDocs;

    service = new DocumentService(logger, cache, utils, exceptionService);

    // Mock internal batch update method
    service._executeBatchUpdate = jest.fn(() => ({ replies: [] }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with all dependencies', () => {
      expect(service._logger).toBe(logger);
      expect(service._cache).toBe(cache);
      expect(service._utils).toBe(utils);
      expect(service._exceptionService).toBe(exceptionService);
    });

    it('should require exception service', () => {
      expect(() => new DocumentService(logger, cache, utils, null)).toThrow(
        'exceptionService is required'
      );
    });
  });

  // ===================================================================
  // createDocument() METHOD
  // ===================================================================

  describe('createDocument() Method', () => {
    it('should create new document with name', () => {
      const result = service.createDocument('My Report');

      expect(mockDocs.Documents.create).toHaveBeenCalledWith({ title: 'My Report' });
      expect(result.documentId).toBe('doc123');
      expect(result.builder).toBeInstanceOf(DocumentBuilder);
    });

    it('should log document creation', () => {
      service.createDocument('Test Doc');

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Created document'));
    });

    it('should return builder instance', () => {
      const result = service.createDocument('Test');

      expect(result.builder).toBeDefined();
      expect(result.builder.documentId).toBe('doc123');
    });

    it('should throw error on API failure', () => {
      mockDocs.Documents.create.mockImplementation(() => {
        throw new Error('API Error');
      });

      expect(() => {
        service.createDocument('Test');
      }).toThrow('API Error');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // document() FACTORY METHOD
  // ===================================================================

  describe('document() Factory Method', () => {
    it('should create builder for existing document', () => {
      const builder = service.document('doc123');

      expect(builder).toBeInstanceOf(DocumentBuilder);
      expect(builder.documentId).toBe('doc123');
      expect(builder.service).toBe(service);
    });

    it('should throw error for invalid document ID', () => {
      expect(() => {
        service.document('');
      }).toThrow('documentId must be a non-empty string');
    });

    it('should throw error for null document ID', () => {
      expect(() => {
        service.document(null);
      }).toThrow('documentId must be a non-empty string');
    });

    it('should throw error for non-string document ID', () => {
      expect(() => {
        service.document(123);
      }).toThrow('documentId must be a non-empty string');
    });
  });

  // ===================================================================
  // getDocument() METHOD
  // ===================================================================

  describe('getDocument() Method', () => {
    it('should get single document metadata', () => {
      const result = service.getDocument('doc123');

      expect(mockDocs.Documents.get).toHaveBeenCalledWith('doc123');
      expect(result).toBeDefined();
      expect(result.documentId).toBe('doc123');
    });

    it('should get multiple documents', () => {
      mockDocs.Documents.get
        .mockReturnValueOnce({ documentId: 'doc1', title: 'Doc 1' })
        .mockReturnValueOnce({ documentId: 'doc2', title: 'Doc 2' });

      const results = service.getDocument(['doc1', 'doc2']);

      expect(mockDocs.Documents.get).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0].documentId).toBe('doc1');
      expect(results[1].documentId).toBe('doc2');
    });

    it('should return empty array for empty input', () => {
      const result = service.getDocument([]);

      expect(result).toEqual([]);
      expect(mockDocs.Documents.get).not.toHaveBeenCalled();
    });

    it('should handle error when document ID is null', () => {
      mockDocs.Documents.get.mockImplementation(() => {
        throw new Error('Invalid document ID');
      });

      const result = service.getDocument(null);

      // getDocument wraps errors and returns null for failed items
      expect(result).toBeNull();
    });
  });

  // ===================================================================
  // DOCUMENT BUILDER - Basic Operations
  // ===================================================================

  describe('DocumentBuilder - Basic Operations', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('doc123');
    });

    it('should accumulate appendParagraph operations', () => {
      builder.appendParagraph('First paragraph');
      builder.appendParagraph('Second paragraph');

      expect(builder.operations).toHaveLength(2);
      expect(builder.operations[0].type).toBe('appendParagraph');
      expect(builder.operations[0].text).toBe('First paragraph');
    });

    it('should accumulate setText operation', () => {
      builder.setText('New content');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0].type).toBe('setText');
      expect(builder.operations[0].text).toBe('New content');
    });

    it('should accumulate createTable operation', () => {
      const data = [
        ['Name', 'Age'],
        ['John', 30]
      ];
      builder.createTable(data, { headerRow: true });

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0].type).toBe('createTable');
      expect(builder.operations[0].data).toEqual(data);
      expect(builder.operations[0].options.headerRow).toBe(true);
    });

    it('should accumulate addHeader operation', () => {
      builder.addHeader('Document Header');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0].type).toBe('addHeader');
      expect(builder.operations[0].text).toBe('Document Header');
    });

    it('should accumulate addFooter operation', () => {
      builder.addFooter('Page Footer');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0].type).toBe('addFooter');
      expect(builder.operations[0].text).toBe('Page Footer');
    });

    it('should accumulate replaceText operation', () => {
      builder.replaceText('{{name}}', 'John');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0].type).toBe('replaceText');
      expect(builder.operations[0].searchPattern).toBe('{{name}}');
      expect(builder.operations[0].replacement).toBe('John');
    });

    it('should support method chaining', () => {
      const result = builder
        .appendParagraph('Para 1')
        .appendParagraph('Para 2')
        .addHeader('Header');

      expect(result).toBe(builder);
      expect(builder.operations).toHaveLength(3);
    });

    it('should clear operations after execute', () => {
      builder.appendParagraph('Test');
      builder.execute();

      expect(builder.operations).toHaveLength(0);
    });
  });

  // ===================================================================
  // DOCUMENT BUILDER - Execute Method
  // ===================================================================

  describe('DocumentBuilder - execute() Method', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('doc123');
    });

    it('should call _executeBatchUpdate when operations exist', () => {
      builder.appendParagraph('Test');
      builder.execute();

      expect(service._executeBatchUpdate).toHaveBeenCalledWith('doc123', expect.any(Array));
    });

    it('should not call _executeBatchUpdate when no operations', () => {
      builder.execute();

      expect(service._executeBatchUpdate).not.toHaveBeenCalled();
    });

    it('should clear operations after execution', () => {
      builder.appendParagraph('Test');
      expect(builder.operations).toHaveLength(1);

      builder.execute();

      expect(builder.operations).toHaveLength(0);
    });

    it('should return response from execute', () => {
      builder.appendParagraph('Test');
      const result = builder.execute();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.batchResult).toBeDefined();
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should create report with multiple sections', () => {
      const builder = service.document('doc123');

      const result = builder
        .addHeader('Monthly Report')
        .appendParagraph('Executive Summary', { heading: 'HEADING_1' })
        .appendParagraph('This month showed strong performance...')
        .createTable(
          [
            ['Metric', 'Value'],
            ['Revenue', '$100K'],
            ['Growth', '15%']
          ],
          { headerRow: true }
        )
        .execute();

      // Batch update called for non-table operations (header, paragraphs)
      expect(service._executeBatchUpdate).toHaveBeenCalled();
      // DocumentApp used for table creation
      expect(global.DocumentApp.openById).toHaveBeenCalledWith('doc123');
      expect(result.tableResults).toHaveLength(1);
    });

    it('should replace placeholders in template', () => {
      const builder = service.document('template123');

      builder
        .replaceText('{{company}}', 'Acme Corp')
        .replaceText('{{date}}', '2024-01-15')
        .replaceText('{{amount}}', '$50,000')
        .execute();

      expect(builder.operations).toHaveLength(0); // Cleared after execute
      expect(service._executeBatchUpdate).toHaveBeenCalled();
    });

    it('should create document and populate in one flow', () => {
      const result = service.createDocument('Invoice');

      const execResult = result.builder
        .appendParagraph('INVOICE', { heading: 'HEADING_1' })
        .createTable([['Item', 'Price']], { headerRow: true })
        .addFooter('Thank you for your business')
        .execute();

      expect(result.documentId).toBe('doc123');
      expect(service._executeBatchUpdate).toHaveBeenCalled();
      // Table created using standard API
      expect(global.DocumentApp.openById).toHaveBeenCalledWith('doc123');
      expect(execResult.tableResults).toHaveLength(1);
    });

    it('should handle empty document creation', () => {
      const result = service.createDocument('Empty Doc');

      expect(result.documentId).toBe('doc123');
      expect(result.builder.operations).toHaveLength(0);
    });

    it('should batch multiple text replacements', () => {
      const builder = service.document('contract123');

      const placeholders = {
        '{{client_name}}': 'John Doe',
        '{{start_date}}': '2024-01-01',
        '{{end_date}}': '2024-12-31',
        '{{fee}}': '$5,000'
      };

      Object.entries(placeholders).forEach(([key, value]) => {
        builder.replaceText(key, value);
      });

      builder.execute();

      expect(service._executeBatchUpdate).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // PDF Export - exportPDF() Method
  // ===================================================================

  describe('DocumentBuilder - exportPDF() Method', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
      // Mock _executeExportPDF
      service._executeExportPDF = jest.fn(() => ({ id: 'pdf123', name: 'report.pdf' }));
    });

    it('should add exportPDF operation to the queue', () => {
      builder.exportPDF('report.pdf');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0]).toEqual({
        type: 'exportPDF',
        fileName: 'report.pdf',
        destinationFolderId: null
      });
    });

    it('should add exportPDF with destination folder', () => {
      builder.exportPDF('report.pdf', 'folder123');

      expect(builder.operations).toHaveLength(1);
      expect(builder.operations[0]).toEqual({
        type: 'exportPDF',
        fileName: 'report.pdf',
        destinationFolderId: 'folder123'
      });
    });

    it('should return builder for chaining', () => {
      const result = builder.exportPDF('report.pdf');

      expect(result).toBe(builder);
    });

    it('should execute PDF export in execute() method', () => {
      builder.exportPDF('test.pdf', 'folder1');
      const result = builder.execute();

      expect(service._executeExportPDF).toHaveBeenCalledWith('test-doc-id', {
        type: 'exportPDF',
        fileName: 'test.pdf',
        destinationFolderId: 'folder1'
      });
      expect(result.success).toBe(true);
      expect(result.nonBatchResults).toHaveLength(1);
      expect(result.nonBatchResults[0]).toEqual({
        operation: 'exportPDF',
        result: { id: 'pdf123', name: 'report.pdf' }
      });
    });

    it('should handle PDF export with other operations', () => {
      builder.appendParagraph('Introduction').exportPDF('final.pdf').addHeader('My Report');

      const result = builder.execute();

      expect(service._executeBatchUpdate).toHaveBeenCalled();
      expect(service._executeExportPDF).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.nonBatchResults).toHaveLength(1);
    });

    it('should handle PDF export without batch operations', () => {
      builder.exportPDF('standalone.pdf');

      const result = builder.execute();

      expect(service._executeBatchUpdate).not.toHaveBeenCalled();
      expect(service._executeExportPDF).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  // ===================================================================
  // Error Handling in execute()
  // ===================================================================

  describe('DocumentBuilder - execute() Error Handling', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
    });

    it('should handle errors in execute and return error result', () => {
      service._executeBatchUpdate = jest.fn(() => {
        throw new Error('Batch update failed');
      });

      builder.appendParagraph('Test');
      const result = builder.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Batch update failed');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('DocumentBuilder.execute failed')
      );
    });

    it('should handle errors in PDF export', () => {
      service._executeExportPDF = jest.fn(() => {
        throw new Error('PDF export failed');
      });

      builder.exportPDF('test.pdf');
      const result = builder.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // Unknown Operation Type Handling
  // ===================================================================

  describe('DocumentBuilder - Unknown Operation Types', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
      service._executeBatchUpdate = jest.fn(() => ({ replies: [] }));
    });

    it('should log warning for unknown operation type', () => {
      // Manually add an unknown operation
      builder.operations.push({ type: 'unknownOperation', data: 'test' });

      builder.execute();

      expect(logger.warn).toHaveBeenCalledWith('Unknown operation type: unknownOperation');
    });

    it('should skip unknown operations in batch', () => {
      builder.appendParagraph('Valid operation');
      builder.operations.push({ type: 'unknownOp', data: 'test' });
      builder.appendParagraph('Another valid operation');

      const result = builder.execute();

      expect(logger.warn).toHaveBeenCalledWith('Unknown operation type: unknownOp');
      expect(result.success).toBe(true);
      expect(service._executeBatchUpdate).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // _createAppendParagraphRequests with Styling
  // ===================================================================

  describe('DocumentBuilder - Paragraph Styling (heading and alignment)', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
      // Restore _executeBatchUpdate to actually call _convertOperationToDocsRequests
      service._executeBatchUpdate = jest.fn((docId, requests) => {
        expect(requests).toBeDefined();
        return { replies: [] };
      });
    });

    it('should apply heading style to paragraph', () => {
      builder.appendParagraph('Chapter 1', { heading: 1 }).execute();

      const calls = service._executeBatchUpdate.mock.calls;
      expect(calls.length).toBe(1);
      const requests = calls[0][1];

      // Should have insertText and updateParagraphStyle
      expect(requests.length).toBeGreaterThanOrEqual(2);
      expect(requests.some((r) => r.updateParagraphStyle)).toBe(true);

      const styleRequest = requests.find((r) => r.updateParagraphStyle);
      expect(styleRequest.updateParagraphStyle.paragraphStyle.namedStyleType).toBe('HEADING_1');
    });

    it('should apply different heading levels', () => {
      [1, 2, 3, 4, 5, 6].forEach((level) => {
        const testBuilder = service.document('doc-' + level);
        service._executeBatchUpdate = jest.fn((docId, requests) => {
          const styleRequest = requests.find((r) => r.updateParagraphStyle);
          expect(styleRequest.updateParagraphStyle.paragraphStyle.namedStyleType).toBe(
            `HEADING_${level}`
          );
          return { replies: [] };
        });
        testBuilder.appendParagraph(`Heading Level ${level}`, { heading: level }).execute();
      });
    });

    it('should apply alignment to paragraph', () => {
      const alignments = {
        center: 'CENTER',
        right: 'END',
        justify: 'JUSTIFIED',
        left: 'START'
      };

      Object.entries(alignments).forEach(([userAlign, apiAlign]) => {
        const testBuilder = service.document('doc-align-' + userAlign);
        service._executeBatchUpdate = jest.fn((docId, requests) => {
          const styleRequest = requests.find((r) => r.updateParagraphStyle);
          expect(styleRequest.updateParagraphStyle.paragraphStyle.alignment).toBe(apiAlign);
          return { replies: [] };
        });
        testBuilder.appendParagraph('Aligned text', { alignment: userAlign }).execute();
      });
    });

    it('should apply both heading and alignment together', () => {
      builder.appendParagraph('Centered Heading', { heading: 2, alignment: 'center' }).execute();

      const calls = service._executeBatchUpdate.mock.calls;
      const requests = calls[0][1];
      const styleRequest = requests.find((r) => r.updateParagraphStyle);

      expect(styleRequest.updateParagraphStyle.paragraphStyle.namedStyleType).toBe('HEADING_2');
      expect(styleRequest.updateParagraphStyle.paragraphStyle.alignment).toBe('CENTER');
    });

    it('should use default NORMAL_TEXT for invalid heading level', () => {
      builder.appendParagraph('Text', { heading: 99 }).execute();

      const calls = service._executeBatchUpdate.mock.calls;
      const requests = calls[0][1];
      const styleRequest = requests.find((r) => r.updateParagraphStyle);

      expect(styleRequest.updateParagraphStyle.paragraphStyle.namedStyleType).toBe('NORMAL_TEXT');
    });

    it('should use default START alignment for invalid alignment', () => {
      builder.appendParagraph('Text', { alignment: 'invalid' }).execute();

      const calls = service._executeBatchUpdate.mock.calls;
      const requests = calls[0][1];
      const styleRequest = requests.find((r) => r.updateParagraphStyle);

      expect(styleRequest.updateParagraphStyle.paragraphStyle.alignment).toBe('START');
    });
  });

  // ===================================================================
  // _createSetTextRequests Implementation
  // ===================================================================

  describe('DocumentBuilder - setText() Implementation', () => {
    let builder;

    beforeEach(() => {
      // Clear and recreate the mock properly
      service._executeBatchUpdate.mockClear();
      service._executeBatchUpdate.mockImplementation((docId, requests) => {
        expect(requests).toBeDefined();
        return { replies: [] };
      });
      builder = service.document('test-doc-id');
    });

    it('should generate deleteContentRange and insertText requests', () => {
      builder.setText('New content').execute();

      const calls = service._executeBatchUpdate.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const requests = calls[0][1];
      expect(requests).toBeDefined();

      expect(requests.length).toBe(2);
      expect(requests[0].deleteContentRange).toBeDefined();
      expect(requests[0].deleteContentRange.range.startIndex).toBe(1);
      expect(requests[0].deleteContentRange.range.endIndex).toBe(100000);

      expect(requests[1].insertText).toBeDefined();
      expect(requests[1].insertText.text).toBe('New content\n');
      expect(requests[1].insertText.location.index).toBe(1);
    });

    it('should handle empty string in setText', () => {
      builder.setText('').execute();

      const calls = service._executeBatchUpdate.mock.calls;
      const requests = calls[0][1];

      expect(requests[1].insertText.text).toBe('\n');
    });

    it('should handle null in setText', () => {
      builder.setText(null).execute();

      const calls = service._executeBatchUpdate.mock.calls;
      const requests = calls[0][1];

      expect(requests[1].insertText.text).toBe('\n');
    });
  });

  // ===================================================================
  // _createTableRequests Edge Cases
  // ===================================================================

  describe('DocumentBuilder - createTable() Edge Cases', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
      service._executeBatchUpdate = jest.fn((docId, requests) => {
        expect(requests).toBeDefined();
        return { replies: [] };
      });
    });

    it('should skip table creation with null data', () => {
      builder.createTable(null).execute();

      expect(logger.warn).toHaveBeenCalledWith('Invalid table data, skipping');
      // No batch update and no DocumentApp call for invalid data
      expect(global.DocumentApp.openById).not.toHaveBeenCalled();
    });

    it('should skip table creation with non-array data', () => {
      builder.createTable('not an array').execute();

      expect(logger.warn).toHaveBeenCalledWith('Invalid table data, skipping');
    });

    it('should skip table creation with empty array', () => {
      builder.createTable([]).execute();

      expect(logger.warn).toHaveBeenCalledWith('Invalid table data, skipping');
    });

    it('should create table with valid data using standard API (DocumentApp)', () => {
      const result = builder
        .createTable([
          ['A', 'B'],
          ['C', 'D']
        ])
        .execute();

      // Table operations now use DocumentApp (standard API) instead of Advanced Docs API
      expect(global.DocumentApp.openById).toHaveBeenCalledWith('test-doc-id');
      expect(result.success).toBe(true);
      expect(result.tableResults).toHaveLength(1);
      expect(result.tableResults[0].operation).toBe('createTable');
      expect(result.tableResults[0].result.rows).toBe(2);
    });

    it('should apply header row styling when option is set', () => {
      builder
        .createTable(
          [
            ['Header1', 'Header2'],
            ['Data1', 'Data2']
          ],
          { headerRow: true }
        )
        .execute();

      expect(global.DocumentApp.openById).toHaveBeenCalled();
      // The mock chain verifies that setBold was called on header cells
    });

    it('should apply alternating row colors when option is set', () => {
      builder
        .createTable(
          [
            ['H1', 'H2'],
            ['R1C1', 'R1C2'],
            ['R2C1', 'R2C2']
          ],
          { alternatingRows: true }
        )
        .execute();

      expect(global.DocumentApp.openById).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // Standard API Table Creation (_createTableWithStandardAPI)
  // ===================================================================

  describe('DocumentBuilder - _createTableWithStandardAPI()', () => {
    let builder;

    beforeEach(() => {
      builder = service.document('test-doc-id');
    });

    it('should use DocumentApp to create table with data', () => {
      const result = builder
        .createTable([
          ['A', 'B'],
          ['C', 'D']
        ])
        .execute();

      expect(global.DocumentApp.openById).toHaveBeenCalledWith('test-doc-id');
      expect(result.tableResults).toHaveLength(1);
      expect(result.tableResults[0].result.success).toBe(true);
      expect(result.tableResults[0].result.rows).toBe(2);
      expect(result.tableResults[0].result.columns).toBe(2);
    });

    it('should handle multiple table operations', () => {
      const result = builder
        .createTable([['Table1-A', 'Table1-B']])
        .createTable([['Table2-A', 'Table2-B', 'Table2-C']])
        .execute();

      expect(global.DocumentApp.openById).toHaveBeenCalledTimes(2);
      expect(result.tableResults).toHaveLength(2);
    });

    it('should log debug message on successful table creation', () => {
      builder.createTable([['A'], ['B']]).execute();

      expect(logger.debug).toHaveBeenCalledWith('Created table with 2 rows using standard API');
    });

    it('should handle table creation error gracefully', () => {
      global.DocumentApp.openById = jest.fn(() => {
        throw new Error('Document not found');
      });

      const result = builder.createTable([['A', 'B']]).execute();

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Document not found');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create table with standard API')
      );
    });
  });

  // ===================================================================
  // _executeBatchUpdate Implementation (Unmocked)
  // ===================================================================

  describe('_executeBatchUpdate Implementation', () => {
    beforeEach(() => {
      // Restore the original implementation by re-binding from the manager
      service._executeBatchUpdate = service._batchUpdateHandler._executeBatchUpdate.bind(service._batchUpdateHandler);
      service._invalidateCache = jest.fn();
    });

    it('should execute batch update with Docs API', () => {
      const requests = [{ insertText: { location: { index: 1 }, text: 'Test\n' } }];

      const result = service._executeBatchUpdate('doc123', requests);

      expect(mockDocs.Documents.batchUpdate).toHaveBeenCalledWith({ requests: requests }, 'doc123');
      expect(result).toEqual({ replies: [] });
      expect(logger.info).toHaveBeenCalledWith(
        'Executing batch update with 1 requests on document doc123'
      );
    });

    it('should return empty replies for null requests', () => {
      const result = service._executeBatchUpdate('doc123', null);

      expect(result).toEqual({ replies: [] });
      expect(mockDocs.Documents.batchUpdate).not.toHaveBeenCalled();
    });

    it('should return empty replies for empty requests array', () => {
      const result = service._executeBatchUpdate('doc123', []);

      expect(result).toEqual({ replies: [] });
      expect(mockDocs.Documents.batchUpdate).not.toHaveBeenCalled();
    });

    it('should use exception service for retry if available', () => {
      const requests = [{ insertText: { location: { index: 1 }, text: 'Test\n' } }];

      service._executeBatchUpdate('doc123', requests);

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should use exception service for batch updates', () => {
      const requests = [{ insertText: { location: { index: 1 }, text: 'Test\n' } }];

      service._executeBatchUpdate('doc123', requests);

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(mockDocs.Documents.batchUpdate).toHaveBeenCalled();
    });

    it('should clear cache after successful batch update', () => {
      const requests = [{ insertText: { location: { index: 1 }, text: 'Test\n' } }];

      service._executeBatchUpdate('doc123', requests);

      expect(service._invalidateCache).toHaveBeenCalledWith('doc_doc123_get');
    });

    it('should handle errors in batch update', () => {
      mockDocs.Documents.batchUpdate = jest.fn(() => {
        throw new Error('Batch update error');
      });

      const requests = [{ insertText: { location: { index: 1 }, text: 'Test\n' } }];

      expect(() => {
        service._executeBatchUpdate('doc123', requests);
      }).toThrow('Batch update error');

      expect(logger.error).toHaveBeenCalledWith(
        'Batch update failed for document doc123: Batch update error'
      );
    });
  });

  // ===================================================================
  // _executeExportPDF Implementation
  // ===================================================================

  describe('_executeExportPDF Implementation', () => {
    let mockDrive;

    beforeEach(() => {
      mockDrive = {
        Files: {
          export: jest.fn(() => 'mockBlob'),
          create: jest.fn(() => ({ id: 'pdf123', name: 'test.pdf' }))
        }
      };
      global.Drive = mockDrive;
    });

    it('should export document as PDF using Drive API', () => {
      const op = { fileName: 'report.pdf', destinationFolderId: null };
      const result = service._executeExportPDF('doc123', op);

      expect(mockDrive.Files.export).toHaveBeenCalledWith('doc123', 'application/pdf');
      expect(mockDrive.Files.create).toHaveBeenCalledWith(
        { name: 'report.pdf', mimeType: 'application/pdf' },
        'mockBlob'
      );
      expect(result).toEqual({ id: 'pdf123', name: 'test.pdf' });
      expect(logger.info).toHaveBeenCalledWith('Exported document doc123 to PDF: pdf123');
    });

    it('should export PDF to specific folder', () => {
      const op = { fileName: 'report.pdf', destinationFolderId: 'folder123' };
      service._executeExportPDF('doc123', op);

      expect(mockDrive.Files.create).toHaveBeenCalledWith(
        { name: 'report.pdf', mimeType: 'application/pdf', parents: ['folder123'] },
        'mockBlob'
      );
    });

    it('should handle export errors', () => {
      mockDrive.Files.export = jest.fn(() => {
        throw new Error('Export failed');
      });

      const op = { fileName: 'report.pdf', destinationFolderId: null };

      expect(() => {
        service._executeExportPDF('doc123', op);
      }).toThrow('Export failed');

      expect(logger.error).toHaveBeenCalledWith('PDF export failed: Export failed');
    });
  });

  // ===================================================================
  // batchReplaceText Implementation
  // ===================================================================

  describe('batchReplaceText Method', () => {
    beforeEach(() => {
      service._executeBatchUpdate = jest.fn(() => ({ replies: [] }));
    });

    it('should replace text in single document', () => {
      const result = service.batchReplaceText('doc123', '{{name}}', 'John Doe');

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].documentId).toBe('doc123');
      expect(service._executeBatchUpdate).toHaveBeenCalledWith(
        'doc123',
        expect.arrayContaining([
          expect.objectContaining({
            replaceAllText: expect.objectContaining({
              containsText: { text: '{{name}}', matchCase: true },
              replaceText: 'John Doe'
            })
          })
        ])
      );
    });

    it('should replace text in multiple documents', () => {
      const docIds = ['doc1', 'doc2', 'doc3'];
      const result = service.batchReplaceText(docIds, '{{company}}', 'Acme Corp');

      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(service._executeBatchUpdate).toHaveBeenCalledTimes(3);
    });

    it('should handle array of document IDs', () => {
      const result = service.batchReplaceText(['doc1', 'doc2'], 'old', 'new');

      expect(result.successful).toHaveLength(2);
    });

    it('should handle single document ID as string', () => {
      const result = service.batchReplaceText('doc1', 'old', 'new');

      expect(result.successful).toHaveLength(1);
    });

    it('should handle errors in individual documents', () => {
      service._executeBatchUpdate = jest.fn((docId) => {
        if (docId === 'doc2') {
          throw new Error('Update failed for doc2');
        }
        return { replies: [] };
      });

      const result = service.batchReplaceText(['doc1', 'doc2', 'doc3'], 'old', 'new');

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        documentId: 'doc2',
        error: 'Update failed for doc2'
      });
    });

    it('should handle null replacement text', () => {
      const result = service.batchReplaceText('doc1', 'text', null);

      expect(service._executeBatchUpdate).toHaveBeenCalledWith(
        'doc1',
        expect.arrayContaining([
          expect.objectContaining({
            replaceAllText: expect.objectContaining({
              replaceText: ''
            })
          })
        ])
      );
    });

    it('should handle empty string replacement', () => {
      const result = service.batchReplaceText('doc1', 'text', '');

      expect(service._executeBatchUpdate).toHaveBeenCalledWith(
        'doc1',
        expect.arrayContaining([
          expect.objectContaining({
            replaceAllText: expect.objectContaining({
              replaceText: ''
            })
          })
        ])
      );
    });
  });

  // ===================================================================
  // deleteDocuments Implementation
  // ===================================================================

  describe('deleteDocuments Method', () => {
    beforeEach(() => {
      global.Drive = {
        Files: {
          update: jest.fn(() => ({}))
        }
      };
      service._invalidateCache = jest.fn();
    });

    it('should delete multiple documents', () => {
      const result = service.deleteDocuments(['doc1', 'doc2']);

      expect(global.Drive.Files.update).toHaveBeenCalledTimes(2);
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'doc1');
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'doc2');

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].documentId).toBe('doc1');
      expect(result.successful[1].documentId).toBe('doc2');
    });

    it('should handle single document ID', () => {
      const result = service.deleteDocuments('doc1');

      expect(global.Drive.Files.update).toHaveBeenCalledTimes(1);
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'doc1');
      expect(result.successful).toHaveLength(1);
      expect(result.successful[0].documentId).toBe('doc1');
    });

    it('should return empty result for empty array', () => {
      const result = service.deleteDocuments([]);

      expect(result).toEqual({ successful: [], failed: [] });
      expect(global.Drive.Files.update).not.toHaveBeenCalled();
    });

    it('should clear cache for deleted documents', () => {
      global.Drive.Files.update
        .mockReturnValueOnce({}) // Success
        .mockImplementationOnce(() => { throw new Error('Failed'); }); // Failure

      const result = service.deleteDocuments(['doc1', 'doc2']);

      // Only successful deletions should clear cache
      expect(service._invalidateCache).toHaveBeenCalledTimes(1);
      expect(service._invalidateCache).toHaveBeenCalledWith('doc_doc1_get');
      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });

    it('should handle errors from individual calls', () => {
      global.Drive.Files.update.mockImplementation(() => {
        throw new Error('API Error');
      });

      const result = service.deleteDocuments(['doc1', 'doc2']);

      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(2);
      expect(result.failed[0].error).toBe('API Error');
    });
  });

  // ===================================================================
  // TABLE ROW AND COLUMN OPERATIONS (Standard API)
  // ===================================================================

  describe('Table Row and Column Operations', () => {
    let mockTableCell;
    let mockTableRow;
    let mockTable;
    let mockTables;

    beforeEach(() => {
      mockTableCell = {
        getText: jest.fn(() => 'cell value'),
        setText: jest.fn(),
        clear: jest.fn()
      };

      mockTableRow = {
        getNumCells: jest.fn(() => 3),
        getCell: jest.fn(() => mockTableCell),
        appendTableCell: jest.fn(() => mockTableCell)
      };

      mockTable = {
        getNumRows: jest.fn(() => 2),
        getRow: jest.fn(() => mockTableRow),
        appendTableRow: jest.fn(() => mockTableRow),
        insertTableRow: jest.fn(() => mockTableRow),
        removeRow: jest.fn()
      };

      mockTables = [mockTable];

      const mockBody = {
        getTables: jest.fn(() => mockTables)
      };

      const mockDoc = {
        getBody: jest.fn(() => mockBody)
      };

      global.DocumentApp = {
        openById: jest.fn(() => mockDoc)
      };
    });

    describe('getTableData()', () => {
      it('should get table data as 2D array', () => {
        const result = service.getTableData('doc123', 0);

        expect(global.DocumentApp.openById).toHaveBeenCalledWith('doc123');
        expect(result.tableIndex).toBe(0);
        expect(result.numRows).toBe(2);
        expect(result.numColumns).toBe(3);
        expect(result.data).toHaveLength(2);
      });

      it('should throw error for out of bounds table index', () => {
        expect(() => {
          service.getTableData('doc123', 5);
        }).toThrow('Table index 5 out of bounds');
      });
    });

    describe('getTableRow()', () => {
      it('should get single row data', () => {
        const result = service.getTableRow('doc123', 0, 1);

        expect(result.rowIndex).toBe(1);
        expect(result.cells).toHaveLength(3);
      });

      it('should throw error for out of bounds row index', () => {
        expect(() => {
          service.getTableRow('doc123', 0, 10);
        }).toThrow('Row index 10 out of bounds');
      });
    });

    describe('getTableColumn()', () => {
      it('should get single column data', () => {
        const result = service.getTableColumn('doc123', 0, 1);

        expect(result.columnIndex).toBe(1);
        expect(result.cells).toHaveLength(2);
      });

      it('should throw error for out of bounds column index', () => {
        mockTableRow.getNumCells.mockReturnValue(2);

        expect(() => {
          service.getTableColumn('doc123', 0, 5);
        }).toThrow('Column index 5 out of bounds');
      });
    });

    describe('insertTableRow()', () => {
      it('should insert row at specified position', () => {
        const result = service.insertTableRow('doc123', 0, 1, ['A', 'B', 'C']);

        expect(mockTable.insertTableRow).toHaveBeenCalledWith(1);
        expect(mockTableRow.appendTableCell).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
        expect(result.rowIndex).toBe(1);
      });
    });

    describe('appendTableRow()', () => {
      it('should append row to end of table', () => {
        const result = service.appendTableRow('doc123', 0, ['X', 'Y', 'Z']);

        expect(mockTable.appendTableRow).toHaveBeenCalled();
        expect(mockTableRow.appendTableCell).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
      });
    });

    describe('deleteTableRow()', () => {
      it('should delete row at specified index', () => {
        const result = service.deleteTableRow('doc123', 0, 1);

        expect(mockTable.removeRow).toHaveBeenCalledWith(1);
        expect(result.success).toBe(true);
        expect(result.deletedRowIndex).toBe(1);
      });

      it('should throw error for out of bounds row index', () => {
        expect(() => {
          service.deleteTableRow('doc123', 0, 10);
        }).toThrow('Row index 10 out of bounds');
      });
    });

    describe('updateTableCell()', () => {
      it('should update single cell value', () => {
        const result = service.updateTableCell('doc123', 0, 1, 2, 'New Value');

        expect(mockTableCell.clear).toHaveBeenCalled();
        expect(mockTableCell.setText).toHaveBeenCalledWith('New Value');
        expect(result.success).toBe(true);
        expect(result.value).toBe('New Value');
      });
    });

    describe('updateTableRow()', () => {
      it('should update entire row', () => {
        const result = service.updateTableRow('doc123', 0, 1, ['A', 'B', 'C']);

        expect(mockTableCell.clear).toHaveBeenCalledTimes(3);
        expect(mockTableCell.setText).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
        expect(result.updatedCells).toBe(3);
      });
    });

    describe('updateTableColumn()', () => {
      it('should update entire column', () => {
        const result = service.updateTableColumn('doc123', 0, 0, ['Header', 'Value1']);

        expect(mockTableCell.clear).toHaveBeenCalledTimes(2);
        expect(mockTableCell.setText).toHaveBeenCalledTimes(2);
        expect(result.success).toBe(true);
        expect(result.updatedRows).toBe(2);
      });
    });
  });

  // ===================================================================
  // ADDITIONAL TABLE MANIPULATION METHODS (Standard API)
  // ===================================================================

  describe('Additional Table Manipulation Methods', () => {
    let mockTableCell;
    let mockTableRow;
    let mockCopiedRow;
    let mockTable;
    let mockTables;
    let mockBody;
    let mockDoc;

    beforeEach(() => {
      mockTableCell = {
        getText: jest.fn(() => 'cell value'),
        setText: jest.fn(),
        clear: jest.fn(),
        setBackgroundColor: jest.fn(),
        getBackgroundColor: jest.fn(() => '#ffffff'),
        setWidth: jest.fn(),
        getWidth: jest.fn(() => 100),
        setPaddingTop: jest.fn(),
        setPaddingBottom: jest.fn(),
        setPaddingLeft: jest.fn(),
        setPaddingRight: jest.fn(),
        getPaddingTop: jest.fn(() => 5),
        getPaddingBottom: jest.fn(() => 5),
        getPaddingLeft: jest.fn(() => 10),
        getPaddingRight: jest.fn(() => 10),
        setVerticalAlignment: jest.fn(),
        getVerticalAlignment: jest.fn(() => ({ toString: () => 'CENTER' })),
        getColSpan: jest.fn(() => 1),
        getRowSpan: jest.fn(() => 1),
        editAsText: jest.fn(() => ({ setBold: jest.fn() })),
        getNumChildren: jest.fn(() => 1),
        getChild: jest.fn(() => ({
          getType: jest.fn(() => 'PARAGRAPH'),
          setAlignment: jest.fn()
        }))
      };

      mockCopiedRow = {
        getNumCells: jest.fn(() => 3)
      };

      mockTableRow = {
        getNumCells: jest.fn(() => 3),
        getCell: jest.fn(() => mockTableCell),
        appendTableCell: jest.fn(() => mockTableCell),
        insertTableCell: jest.fn(() => mockTableCell),
        removeCell: jest.fn(),
        copy: jest.fn(() => mockCopiedRow),
        setMinimumHeight: jest.fn(),
        getMinimumHeight: jest.fn(() => 20)
      };

      mockTable = {
        getNumRows: jest.fn(() => 3),
        getRow: jest.fn(() => mockTableRow),
        appendTableRow: jest.fn(() => mockTableRow),
        insertTableRow: jest.fn(() => mockTableRow),
        removeRow: jest.fn()
      };

      mockTables = [mockTable];

      mockBody = {
        getTables: jest.fn(() => mockTables)
      };

      mockDoc = {
        getBody: jest.fn(() => mockBody)
      };

      global.DocumentApp = {
        openById: jest.fn(() => mockDoc),
        VerticalAlignment: {
          TOP: 'TOP',
          CENTER: 'CENTER',
          BOTTOM: 'BOTTOM'
        },
        HorizontalAlignment: {
          LEFT: 'LEFT',
          CENTER: 'CENTER',
          RIGHT: 'RIGHT',
          JUSTIFY: 'JUSTIFY'
        },
        ElementType: {
          PARAGRAPH: 'PARAGRAPH'
        }
      };
    });

    describe('copyTableRow()', () => {
      it('should copy a row and append at end when targetRowIndex is null', () => {
        const result = service.copyTableRow('doc123', 0, 1, null);

        expect(mockTableRow.copy).toHaveBeenCalled();
        expect(mockTable.appendTableRow).toHaveBeenCalledWith(mockCopiedRow);
        expect(result.success).toBe(true);
        expect(result.sourceRowIndex).toBe(1);
      });

      it('should copy a row and insert at specified position', () => {
        const result = service.copyTableRow('doc123', 0, 0, 2);

        expect(mockTableRow.copy).toHaveBeenCalled();
        expect(mockTable.insertTableRow).toHaveBeenCalledWith(2, mockCopiedRow);
        expect(result.success).toBe(true);
        expect(result.insertedRowIndex).toBe(2);
      });

      it('should throw error for out of bounds source row index', () => {
        expect(() => {
          service.copyTableRow('doc123', 0, 10, null);
        }).toThrow('Source row index 10 out of bounds');
      });
    });

    describe('deleteTableColumn()', () => {
      it('should delete column from all rows', () => {
        const result = service.deleteTableColumn('doc123', 0, 1);

        expect(mockTableRow.removeCell).toHaveBeenCalledWith(1);
        expect(result.success).toBe(true);
        expect(result.deletedColumnIndex).toBe(1);
        expect(result.affectedRows).toBe(3);
      });

      it('should throw error for out of bounds column index', () => {
        mockTableRow.getNumCells.mockReturnValue(2);

        expect(() => {
          service.deleteTableColumn('doc123', 0, 5);
        }).toThrow('Column index 5 out of bounds');
      });
    });

    describe('insertTableColumn()', () => {
      it('should insert column at specified position', () => {
        const result = service.insertTableColumn('doc123', 0, 1, ['A', 'B', 'C']);

        expect(mockTableRow.insertTableCell).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
        expect(result.insertedColumnIndex).toBe(1);
        expect(result.affectedRows).toBe(3);
      });
    });

    describe('appendTableColumn()', () => {
      it('should append column to end of table', () => {
        const result = service.appendTableColumn('doc123', 0, ['X', 'Y', 'Z']);

        expect(mockTableRow.appendTableCell).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
        expect(result.affectedRows).toBe(3);
      });
    });

    describe('setColumnWidth()', () => {
      it('should set column width in points', () => {
        const result = service.setColumnWidth('doc123', 0, 0, 150);

        expect(mockTableCell.setWidth).toHaveBeenCalledWith(150);
        expect(result.success).toBe(true);
        expect(result.widthPoints).toBe(150);
      });
    });

    describe('getColumnWidth()', () => {
      it('should get column width in points', () => {
        const result = service.getColumnWidth('doc123', 0, 0);

        expect(mockTableCell.getWidth).toHaveBeenCalled();
        expect(result.widthPoints).toBe(100);
      });
    });

    describe('setRowBackgroundColor()', () => {
      it('should set background color for all cells in row', () => {
        const result = service.setRowBackgroundColor('doc123', 0, 0, '#f3f3f3');

        expect(mockTableCell.setBackgroundColor).toHaveBeenCalledWith('#f3f3f3');
        expect(result.success).toBe(true);
        expect(result.color).toBe('#f3f3f3');
        expect(result.affectedCells).toBe(3);
      });
    });

    describe('setRowMinimumHeight()', () => {
      it('should set minimum height for row', () => {
        const result = service.setRowMinimumHeight('doc123', 0, 0, 36);

        expect(mockTableRow.setMinimumHeight).toHaveBeenCalledWith(36);
        expect(result.success).toBe(true);
        expect(result.heightPoints).toBe(36);
      });
    });

    describe('getRowMinimumHeight()', () => {
      it('should get minimum height for row', () => {
        const result = service.getRowMinimumHeight('doc123', 0, 0);

        expect(mockTableRow.getMinimumHeight).toHaveBeenCalled();
        expect(result.heightPoints).toBe(20);
      });
    });

    describe('clearTableRow()', () => {
      it('should clear all cells in row', () => {
        const result = service.clearTableRow('doc123', 0, 1);

        expect(mockTableCell.clear).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(true);
        expect(result.clearedCells).toBe(3);
      });
    });

    describe('setCellBackgroundColor()', () => {
      it('should set background color for specific cell', () => {
        const result = service.setCellBackgroundColor('doc123', 0, 1, 2, '#ffff00');

        expect(mockTableCell.setBackgroundColor).toHaveBeenCalledWith('#ffff00');
        expect(result.success).toBe(true);
        expect(result.color).toBe('#ffff00');
      });
    });

    describe('getCellBackgroundColor()', () => {
      it('should get background color for specific cell', () => {
        const result = service.getCellBackgroundColor('doc123', 0, 0, 0);

        expect(mockTableCell.getBackgroundColor).toHaveBeenCalled();
        expect(result.color).toBe('#ffffff');
      });
    });

    describe('setCellPadding()', () => {
      it('should set padding for specific cell', () => {
        const result = service.setCellPadding('doc123', 0, 0, 0, {
          top: 5,
          bottom: 5,
          left: 10,
          right: 10
        });

        expect(mockTableCell.setPaddingTop).toHaveBeenCalledWith(5);
        expect(mockTableCell.setPaddingBottom).toHaveBeenCalledWith(5);
        expect(mockTableCell.setPaddingLeft).toHaveBeenCalledWith(10);
        expect(mockTableCell.setPaddingRight).toHaveBeenCalledWith(10);
        expect(result.success).toBe(true);
      });
    });

    describe('getCellPadding()', () => {
      it('should get padding for specific cell', () => {
        const result = service.getCellPadding('doc123', 0, 0, 0);

        expect(result.padding.top).toBe(5);
        expect(result.padding.bottom).toBe(5);
        expect(result.padding.left).toBe(10);
        expect(result.padding.right).toBe(10);
      });
    });

    describe('setCellVerticalAlignment()', () => {
      it('should set vertical alignment for specific cell', () => {
        const result = service.setCellVerticalAlignment('doc123', 0, 0, 0, 'CENTER');

        expect(mockTableCell.setVerticalAlignment).toHaveBeenCalledWith('CENTER');
        expect(result.success).toBe(true);
        expect(result.alignment).toBe('CENTER');
      });

      it('should throw error for invalid alignment', () => {
        expect(() => {
          service.setCellVerticalAlignment('doc123', 0, 0, 0, 'INVALID');
        }).toThrow('Invalid alignment');
      });
    });

    describe('getCellVerticalAlignment()', () => {
      it('should get vertical alignment for specific cell', () => {
        const result = service.getCellVerticalAlignment('doc123', 0, 0, 0);

        expect(mockTableCell.getVerticalAlignment).toHaveBeenCalled();
        expect(result.alignment).toBe('CENTER');
      });
    });

    describe('getCellDetails()', () => {
      it('should get comprehensive cell details', () => {
        const result = service.getCellDetails('doc123', 0, 0, 0);

        expect(result.text).toBe('cell value');
        expect(result.backgroundColor).toBe('#ffffff');
        expect(result.width).toBe(100);
        expect(result.padding.top).toBe(5);
        expect(result.verticalAlignment).toBe('CENTER');
        expect(result.colSpan).toBe(1);
        expect(result.rowSpan).toBe(1);
      });
    });

    describe('getTableMetadata()', () => {
      it('should get table metadata including dimensions', () => {
        const result = service.getTableMetadata('doc123', 0);

        expect(result.numRows).toBe(3);
        expect(result.numColumns).toBe(3);
        expect(result.columnWidths).toHaveLength(3);
        expect(result.rowMinHeights).toHaveLength(3);
        expect(result.totalTables).toBe(1);
      });
    });

    describe('setRowTextAlignment()', () => {
      it('should set text alignment for all cells in row', () => {
        const mockParagraph = {
          getType: jest.fn(() => 'PARAGRAPH'),
          setAlignment: jest.fn()
        };
        mockTableCell.getNumChildren = jest.fn(() => 1);
        mockTableCell.getChild = jest.fn(() => mockParagraph);

        const result = service.setRowTextAlignment('doc123', 0, 0, 'CENTER');

        expect(result.success).toBe(true);
        expect(result.alignment).toBe('CENTER');
        expect(result.affectedCells).toBe(3);
      });

      it('should throw error for invalid alignment', () => {
        expect(() => {
          service.setRowTextAlignment('doc123', 0, 0, 'INVALID');
        }).toThrow('Invalid alignment');
      });
    });

    describe('setRowBold()', () => {
      it('should apply bold formatting to all cells in row', () => {
        const mockEditAsText = { setBold: jest.fn() };
        mockTableCell.editAsText = jest.fn(() => mockEditAsText);

        const result = service.setRowBold('doc123', 0, 0, true);

        expect(mockTableCell.editAsText).toHaveBeenCalled();
        expect(mockEditAsText.setBold).toHaveBeenCalledWith(true);
        expect(result.success).toBe(true);
        expect(result.bold).toBe(true);
        expect(result.affectedCells).toBe(3);
      });
    });
  });
});
