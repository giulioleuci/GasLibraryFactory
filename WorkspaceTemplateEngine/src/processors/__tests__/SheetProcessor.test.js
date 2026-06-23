/**
 * @fileoverview Tests for SheetProcessor class
 * @author GasLibraryFactory
 */

import { SheetProcessor } from '../SheetProcessor.js';

describe('SheetProcessor - Core Functionality Tests', () => {
  let processor;
  let mockPlaceholderService;
  let mockSpreadsheetService;
  let mockMustache;
  let mockLogger;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock Mustache
    mockMustache = {
      render: jest.fn((template, context) => {
        return template.replace(/{{(\w+)}}/g, (match, key) => context[key] || match);
      }),
      getValue: jest.fn((path, context) => context[path])
    };

    // Mock SpreadsheetService
    mockSpreadsheetService = {
      getSheetInfo: jest.fn(),
      getRanges: jest.fn(),
      updateRanges: jest.fn(),
      expandSheetGrid: jest.fn()
    };

    // Mock PlaceholderService
    mockPlaceholderService = {
      mustache: mockMustache,
      logger: mockLogger
    };

    // Create processor instance
    processor = new SheetProcessor(mockPlaceholderService);

    // Replace spreadsheetService with mock
    processor.spreadsheetService = mockSpreadsheetService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with mustache and logger', () => {
      expect(processor).toBeInstanceOf(SheetProcessor);
      expect(processor.mustache).toBe(mockMustache);
      expect(processor.logger).toBe(mockLogger);
    });
  });

  // ===================================================================
  // process() Method Tests
  // ===================================================================
  describe('process() Method', () => {
    it('should warn if no sheets found', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', id: 1 },
        { name: 'Sheet2', id: 2 }
      ]);

      processor.process('sheetId123', {}, 'NonExistent');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No sheets found to process. Sheet name: NonExistent'
      );
    });

    it('should process all sheets when sheetName is null', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', id: 1 },
        { name: 'Sheet2', id: 2 }
      ]);

      mockSpreadsheetService.getRanges
        .mockReturnValueOnce([['Value1'], ['Value2']]) // Sheet1
        .mockReturnValueOnce([['Value3']]); // Sheet2

      processor.process('sheetId123', {}, null);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledTimes(2);
    });

    it('should process specific sheet when sheetName provided', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', id: 1 },
        { name: 'Sheet2', id: 2 }
      ]);

      mockSpreadsheetService.getRanges.mockReturnValue([['Value1']]);

      processor.process('sheetId123', {}, 'Sheet1');

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledTimes(1);
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('sheetId123', "'Sheet1'!A:ZZ");
    });

    it('should skip empty sheets', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([]);

      processor.process('sheetId123', {}, null);

      expect(mockLogger.debug).toHaveBeenCalledWith('Sheet Sheet1 is empty, skipping.');
    });

    it('should substitute placeholders in cells', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Hello {{name}}!', 'Static value'],
        ['{{greeting}} World', '123']
      ]);

      mockMustache.render.mockReturnValueOnce('Hello Alice!').mockReturnValueOnce('Hi World');

      processor.process('sheetId123', { name: 'Alice', greeting: 'Hi' }, null);

      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalledWith(
        'sheetId123',
        expect.arrayContaining([
          { range: "'Sheet1'!A1", values: [['Hello Alice!']] },
          { range: "'Sheet1'!A2", values: [['Hi World']] }
        ])
      );
    });

    it('should skip cells without placeholders', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([['Normal text', 'Another normal text']]);

      processor.process('sheetId123', {}, null);

      expect(mockSpreadsheetService.updateRanges).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('No substitutions to perform in the sheet.');
    });

    it('should skip non-string cells', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([[123, true, null, undefined, '{{value}}']]);

      mockMustache.render.mockReturnValue('replaced');

      processor.process('sheetId123', { value: 'replaced' }, null);

      // Only the last cell should be processed
      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalledWith('sheetId123', [
        { range: "'Sheet1'!E1", values: [['replaced']] }
      ]);
    });
  });

  // ===================================================================
  // _columnToLetter() Utility Tests
  // ===================================================================
  describe('_columnToLetter() Utility', () => {
    it('should convert single digit columns', () => {
      expect(processor._columnToLetter(1)).toBe('A');
      expect(processor._columnToLetter(26)).toBe('Z');
    });

    it('should convert double digit columns', () => {
      expect(processor._columnToLetter(27)).toBe('AA');
      expect(processor._columnToLetter(52)).toBe('AZ');
      expect(processor._columnToLetter(53)).toBe('BA');
    });

    it('should convert triple digit columns', () => {
      expect(processor._columnToLetter(702)).toBe('ZZ');
      expect(processor._columnToLetter(703)).toBe('AAA');
    });
  });

  // ===================================================================
  // _rangeToA1() Utility Tests
  // ===================================================================
  describe('_rangeToA1() Utility', () => {
    it('should return single cell for same start and end', () => {
      expect(processor._rangeToA1(1, 1, 1, 1)).toBe('A1');
      expect(processor._rangeToA1(5, 3, 5, 3)).toBe('C5');
    });

    it('should return range for different start and end', () => {
      expect(processor._rangeToA1(1, 1, 10, 5)).toBe('A1:E10');
      expect(processor._rangeToA1(2, 3, 8, 7)).toBe('C2:G8');
    });
  });

  // ===================================================================
  // _prepareMatrixRequests() Tests
  // ===================================================================
  describe('_prepareMatrixRequests() Matrix Expansion', () => {
    beforeEach(() => {
      // Mock getValue for data fetching - handles both top-level and nested access
      mockMustache.getValue.mockImplementation((path, context) => {
        const value = context[path];
        if (value === undefined || value === null) {
          return value;
        }
        // Keep arrays and objects as-is
        if (typeof value === 'object') {
          return value;
        }
        // Convert primitives to string (matching real Mustache behavior)
        return String(value);
      });
    });

    it('should generate requests for matrix with headers', () => {
      const context = {
        users: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
        ]
      };

      const placeholder =
        '{{matrice_dati[sorgente=users, colonne=name;email, intestazioni=Name;Email]}}';

      const requests = processor._prepareMatrixRequests('Sheet1', 1, 1, placeholder, context);

      expect(requests).toHaveLength(3); // clear cell + headers + data

      // Check clear cell request
      expect(requests[0]).toEqual({
        range: "'Sheet1'!A1",
        values: [['']]
      });

      // Check header row
      expect(requests[1]).toEqual({
        range: "'Sheet1'!A1:B1",
        values: [['Name', 'Email']]
      });

      // Check data matrix (both rows in single request)
      expect(requests[2]).toEqual({
        range: "'Sheet1'!A2:B3",
        values: [
          ['Alice', 'alice@example.com'],
          ['Bob', 'bob@example.com']
        ]
      });
    });

    it('should generate requests for matrix with empty headers', () => {
      const context = {
        items: [
          { id: 1, value: 'A' },
          { id: 2, value: 'B' }
        ]
      };

      const placeholder = '{{matrice_dati[sorgente=items, colonne=id;value, intestazioni=;]}}';

      const requests = processor._prepareMatrixRequests('Sheet1', 1, 1, placeholder, context);

      expect(requests).toHaveLength(3); // clear cell + headers + data

      // Clear cell
      expect(requests[0]).toEqual({
        range: "'Sheet1'!A1",
        values: [['']]
      });

      // Headers (empty strings)
      expect(requests[1]).toEqual({
        range: "'Sheet1'!A1:B1",
        values: [['', '']]
      });

      // Data matrix
      expect(requests[2]).toEqual({
        range: "'Sheet1'!A2:B3",
        values: [
          ['1', 'A'],
          ['2', 'B']
        ]
      });
    });

    it('should handle empty data array', () => {
      const context = { users: [] };
      const placeholder =
        '{{matrice_dati[sorgente=users, colonne=name;email, intestazioni=Name;Email]}}';

      const requests = processor._prepareMatrixRequests('Sheet1', 1, 1, placeholder, context);

      // Empty array still generates clear cell + headers, but no data rows
      expect(requests).toHaveLength(2);
      expect(requests[0]).toEqual({
        range: "'Sheet1'!A1",
        values: [['']]
      });
      expect(requests[1]).toEqual({
        range: "'Sheet1'!A1:B1",
        values: [['Name', 'Email']]
      });
    });

    it('should handle non-array data source', () => {
      const context = { users: 'not an array' };
      const placeholder = '{{matrice_dati[sorgente=users, colonne=name, intestazioni=Name]}}';

      const requests = processor._prepareMatrixRequests('Sheet1', 1, 1, placeholder, context);

      expect(requests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Data source 'users' for matrix is not an array."
      );
    });

    it('should handle invalid matrix syntax', () => {
      const placeholder = '{{matrice_dati[invalid]}}';

      const requests = processor._prepareMatrixRequests('Sheet1', 1, 1, placeholder, {});

      expect(requests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid matrix placeholder: {{matrice_dati[invalid]}}'
      );
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should process complete sheet with placeholders and matrices', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Report', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Title: {{reportTitle}}'],
        [''],
        ['{{matrice_dati[sorgente=data, colonne=name;value, intestazioni=Name;Value]}}']
      ]);

      mockMustache.render.mockReturnValue('Title: Monthly Report');
      mockMustache.getValue.mockReturnValue([
        { name: 'Item1', value: 100 },
        { name: 'Item2', value: 200 }
      ]);

      const context = {
        reportTitle: 'Monthly Report',
        data: [
          { name: 'Item1', value: 100 },
          { name: 'Item2', value: 200 }
        ]
      };

      processor.process('sheetId123', context, null);

      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalled();
      const updateCalls = mockSpreadsheetService.updateRanges.mock.calls[0][1];

      // Should have 1 title update + 1 header + 2 data rows = 4 updates
      expect(updateCalls.length).toBeGreaterThan(0);
    });

    it('should batch all updates in single call', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);

      mockSpreadsheetService.getRanges.mockReturnValue([['{{a}}', '{{b}}', '{{c}}']]);

      mockMustache.render
        .mockReturnValueOnce('A')
        .mockReturnValueOnce('B')
        .mockReturnValueOnce('C');

      processor.process('sheetId123', { a: 'A', b: 'B', c: 'C' }, null);

      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalledTimes(1);
      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalledWith(
        'sheetId123',
        expect.arrayContaining([
          { range: "'Sheet1'!A1", values: [['A']] },
          { range: "'Sheet1'!B1", values: [['B']] },
          { range: "'Sheet1'!C1", values: [['C']] }
        ])
      );
    });
  });
});
