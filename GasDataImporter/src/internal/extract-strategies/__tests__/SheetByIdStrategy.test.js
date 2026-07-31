/**
 * @fileoverview Tests for SheetByIdStrategy
 * @author GasLibraryFactory
 */

import { SheetByIdStrategy } from '../SheetByIdStrategy.js';
import { SourceStrategy } from '../SourceStrategy.js';
import { SourceError } from '../../errors/SourceError.js';

describe('SheetByIdStrategy - Comprehensive Test Suite', () => {
  let mockLogger;
  let mockSpreadsheetService;
  let strategy;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    mockSpreadsheetService = {
      getSheetInfo: jest.fn().mockReturnValue([{ name: 'Sheet1', rowCount: 10, columnCount: 3 }]),
      getRanges: jest.fn().mockReturnValue([
        ['Name', 'Age', 'Email'],
        ['John', 30, 'john@example.com'],
        ['Jane', 25, 'jane@example.com']
      ])
    };

    strategy = new SheetByIdStrategy(mockLogger, mockSpreadsheetService);
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with logger and spreadsheetService', () => {
      expect(strategy).toBeInstanceOf(SheetByIdStrategy);
      expect(strategy).toBeInstanceOf(SourceStrategy);
      expect(strategy.logger).toBe(mockLogger);
      expect(strategy._spreadsheetService).toBe(mockSpreadsheetService);
    });

    it('should extend SourceStrategy', () => {
      expect(strategy instanceof SourceStrategy).toBe(true);
    });
  });

  // ===================================================================
  // extract() / _extractData() Method Tests
  // ===================================================================
  describe('extract() Method - Basic Functionality', () => {
    it('should extract data from sheet with headers', () => {
      const config = {
        sheetId: 'abc123',
        hasHeaders: true
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'John', Age: 30, Email: 'john@example.com' });
      expect(result[1]).toEqual({ Name: 'Jane', Age: 25, Email: 'jane@example.com' });
      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledWith('abc123');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:C10');
    });

    it('should use first sheet by default when no tabName specified', () => {
      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2);
      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledWith('abc123');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:C10');
    });

    it('should use specified tab name when provided', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'CustomSheet', rowCount: 10, columnCount: 3 }
      ]);

      const config = { sheetId: 'abc123', tabName: 'CustomSheet' };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'CustomSheet!A1:C10');
    });

    it('should default hasHeaders to true when not specified', () => {
      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      // Should treat first row as headers
      expect(result[0]).toHaveProperty('Name');
      expect(result[0]).toHaveProperty('Age');
      expect(result[0]).toHaveProperty('Email');
    });

    it('should handle hasHeaders=false', () => {
      const config = {
        sheetId: 'abc123',
        hasHeaders: false
      };

      const result = strategy.extract(config);

      // Should generate generic column names
      expect(result[0]).toHaveProperty('Col_0');
      expect(result[0]).toHaveProperty('Col_1');
      expect(result[0]).toHaveProperty('Col_2');
      expect(result).toHaveLength(3); // All rows including the header row
    });

    it('should log extraction steps', () => {
      const config = { sheetId: 'test123' };

      strategy.extract(config);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SheetByIdStrategy] Getting sheet info for spreadsheet: test123'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SheetByIdStrategy] Reading from sheet: Sheet1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SheetByIdStrategy] Extracted 2 rows from sheet'
      );
    });
  });

  // ===================================================================
  // Range Handling Tests
  // ===================================================================
  describe('Range Handling', () => {
    it('should use provided range with sheet name prefix', () => {
      const config = {
        sheetId: 'abc123',
        range: 'A1:Z100'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:Z100');
    });

    it('should use range as-is if it already includes sheet name', () => {
      const config = {
        sheetId: 'abc123',
        range: 'CustomSheet!A1:Z100'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith(
        'abc123',
        'CustomSheet!A1:Z100'
      );
    });

    it('should get all data when no range specified', () => {
      const config = { sheetId: 'abc123' };

      strategy.extract(config);

      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalled();
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:C10');
    });

    it('should handle empty range string as no range', () => {
      const config = {
        sheetId: 'abc123',
        range: ''
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalled();
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:C10');
    });
  });

  // ===================================================================
  // Error Handling Tests
  // ===================================================================
  describe('Error Handling', () => {
    it('should throw SourceError when sheetId is missing', () => {
      const config = {};

      expect(() => {
        strategy.extract(config);
      }).toThrow(SourceError);

      expect(() => {
        strategy.extract(config);
      }).toThrow('Missing required configuration fields: sheetId');
    });

    it('should throw SourceError when spreadsheet cannot be opened', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue(null);

      const config = { sheetId: 'invalid123' };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.code).toBe('NO_SHEETS_FOUND');
      }
    });

    it('should throw SourceError when tab name not found', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'DifferentSheet', rowCount: 10, columnCount: 3 }
      ]);

      const config = {
        sheetId: 'abc123',
        tabName: 'NonExistentTab'
      };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Sheet tab "NonExistentTab" not found');
        expect(error.code).toBe('TAB_NOT_FOUND');
      }
    });

    it('should throw SourceError when spreadsheet has no sheets', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([]);

      const config = { sheetId: 'abc123' };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('has no sheets');
        expect(error.code).toBe('NO_SHEETS_FOUND');
      }
    });

    it('should return empty array for empty sheet', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 0, columnCount: 0 }
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith('[SheetByIdStrategy] Sheet is empty');
    });

    it('should return empty array when lastRow is 0', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 0, columnCount: 5 }
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
    });

    it('should return empty array when lastColumn is 0', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 10, columnCount: 0 }
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
    });

    it('should wrap generic errors in SourceError', () => {
      mockSpreadsheetService.getSheetInfo.mockImplementation(() => {
        throw new Error('Network error');
      });

      const config = { sheetId: 'abc123' };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Network error');
        expect(error.code).toBe('SHEET_EXTRACTION_FAILED');
      }
    });

    it('should re-throw SourceError without wrapping', () => {
      const sourceError = new SourceError('Custom error', 'CUSTOM_CODE');
      mockSpreadsheetService.getSheetInfo.mockImplementation(() => {
        throw sourceError;
      });

      const config = { sheetId: 'abc123' };

      expect(() => {
        strategy.extract(config);
      }).toThrow(sourceError);
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should extract data from specific tab with range and headers', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Data', rowCount: 100, columnCount: 10 }
      ]);

      const config = {
        sheetId: 'abc123',
        tabName: 'Data',
        range: 'A1:C50',
        hasHeaders: true
      };

      const result = strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Data!A1:C50');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('Name');
    });

    it('should handle large dataset efficiently', () => {
      const largeDataset = [['Col1', 'Col2', 'Col3']];
      for (let i = 0; i < 1000; i++) {
        largeDataset.push([`val${i}`, i, `email${i}@test.com`]);
      }
      mockSpreadsheetService.getRanges.mockReturnValue(largeDataset);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(1000);
      expect(result[0]).toEqual({ Col1: 'val0', Col2: 0, Col3: 'email0@test.com' });
    });

    it('should work with single row of data', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Name', 'Age', 'Email'],
        ['SingleRow', 99, 'single@test.com']
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ Name: 'SingleRow', Age: 99, Email: 'single@test.com' });
    });

    it('should handle special characters in data', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Name', 'Value'],
        ['Test™', 'Value with "quotes"'],
        ['Spëcial', 'Value,with,commas']
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result[0].Name).toBe('Test™');
      expect(result[0].Value).toBe('Value with "quotes"');
      expect(result[1].Name).toBe('Spëcial');
    });

    it('should preserve data types from sheet', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['String', 'Number', 'Boolean', 'Date'],
        ['text', 42, true, new Date('2024-01-01')]
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(typeof result[0].String).toBe('string');
      expect(typeof result[0].Number).toBe('number');
      expect(typeof result[0].Boolean).toBe('boolean');
      expect(result[0].Date).toBeInstanceOf(Date);
    });
  });

  // ===================================================================
  // Edge Cases
  // ===================================================================
  describe('Edge Cases', () => {
    it('should handle sheet with only headers (no data rows)', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([['Header1', 'Header2', 'Header3']]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
    });

    it('should handle null values in cells', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Col1', 'Col2', 'Col3'],
        ['val1', null, 'val3'],
        [null, 'val2', null]
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result[0]).toEqual({ Col1: 'val1', Col2: null, Col3: 'val3' });
      expect(result[1]).toEqual({ Col1: null, Col2: 'val2', Col3: null });
    });

    it('should handle undefined values in cells', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Col1', 'Col2'],
        ['val1', undefined],
        [undefined, 'val2']
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result[0]).toEqual({ Col1: 'val1', Col2: null });
      expect(result[1]).toEqual({ Col1: null, Col2: 'val2' });
    });

    it('should handle jagged arrays (uneven row lengths)', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['Col1', 'Col2', 'Col3'],
        ['val1'],
        ['val1', 'val2'],
        ['val1', 'val2', 'val3', 'val4']
      ]);

      const config = { sheetId: 'abc123' };

      const result = strategy.extract(config);

      expect(result[0]).toEqual({ Col1: 'val1', Col2: null, Col3: null });
      expect(result[1]).toEqual({ Col1: 'val1', Col2: 'val2', Col3: null });
      expect(result[2]).toEqual({ Col1: 'val1', Col2: 'val2', Col3: 'val3' }); // Extra column ignored
    });

    it('should handle very long sheet names in range', () => {
      const longName = 'A'.repeat(100);
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: longName, rowCount: 10, columnCount: 3 }
      ]);

      const config = {
        sheetId: 'abc123',
        range: 'A1:C10'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', `${longName}!A1:C10`);
    });

    it('should handle sheet names with special characters', () => {
      const specialName = 'Sheet-1 (Copy)';
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: specialName, rowCount: 10, columnCount: 3 }
      ]);

      const config = {
        sheetId: 'abc123',
        range: 'A1:C10'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith(
        'abc123',
        `${specialName}!A1:C10`
      );
    });
  });

  // ===================================================================
  // extractChunk() / supportsCursor() Method Tests
  // ===================================================================
  describe('extractChunk() Method', () => {
    it('extractChunk paginates by row offset and reports exhaustion', () => {
      const chunkedSpreadsheetService = {
        getSheetInfo: () => [{ name: 'Sheet1', gridProperties: { rowCount: 3, columnCount: 2 } }],
        getRanges: (sheetId, range) => {
          if (range === 'Sheet1!A1:B1') return [['A', 'B']];
          if (range === 'Sheet1!A2:B2') return [['1', '2']];
          if (range === 'Sheet1!A3:B3') return [['3', '4']];
          throw new Error(`unexpected range ${range}`);
        }
      };
      const chunkedStrategy = new SheetByIdStrategy(console, chunkedSpreadsheetService);
      expect(chunkedStrategy.supportsCursor()).toBe(true);

      const chunk1 = chunkedStrategy.extractChunk(
        { sheetId: 's1' },
        { rowOffset: 0, headers: null },
        1
      );
      expect(chunk1.rows).toEqual([{ A: 1, B: 2 }]);
      expect(chunk1.exhausted).toBe(false);
      expect(chunk1.nextCursor.rowOffset).toBe(1);

      const chunk2 = chunkedStrategy.extractChunk({ sheetId: 's1' }, chunk1.nextCursor, 1);
      expect(chunk2.rows).toEqual([{ A: 3, B: 4 }]);
      expect(chunk2.exhausted).toBe(true);
    });

    it('honors an explicit config.range, returning the same rows as whole extraction (extract())', () => {
      // Generic fake spreadsheet backing store: getRanges parses any A1
      // range string and slices a real 2D grid, so both extract() (via
      // _resolveValues) and extractChunk() are exercised against the same
      // ground truth instead of a hand-picked per-call mock.
      const colToNum = (letters) => {
        let n = 0;
        for (const ch of letters.toUpperCase()) {
          n = n * 26 + (ch.charCodeAt(0) - 64);
        }
        return n;
      };
      const grid = [
        ['noise', 'noise', 'noise'], // row1 - outside the configured range
        ['noise', 'noise', 'noise'], // row2
        ['noise', 'noise', 'noise'], // row3
        ['noise', 'noise', 'noise'], // row4
        ['Name', 'Age', 'Email'], // row5 - range start / header row
        ['A', 1, 'a@x.com'], // row6
        ['B', 2, 'b@x.com'], // row7
        ['C', 3, 'c@x.com'], // row8
        ['D', 4, 'd@x.com'], // row9
        ['E', 5, 'e@x.com'], // row10 - range end
        ['noise', 'noise', 'noise'] // row11 - outside the configured range
      ];
      const rangedSpreadsheetService = {
        getSheetInfo: () => [
          { name: 'Sheet1', gridProperties: { rowCount: grid.length, columnCount: grid[0].length } }
        ],
        getRanges: (sheetId, rangeStr) => {
          const bare = rangeStr.includes('!') ? rangeStr.split('!')[1] : rangeStr;
          const match = /^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/.exec(bare);
          if (!match) {
            throw new Error(`unexpected range ${rangeStr}`);
          }
          const startCol = colToNum(match[1]);
          const startRow = parseInt(match[2], 10);
          const endCol = colToNum(match[3]);
          const endRow = parseInt(match[4], 10);
          const rows = [];
          for (let r = startRow; r <= endRow; r++) {
            const rowData = grid[r - 1] || [];
            const rowSlice = [];
            for (let c = startCol; c <= endCol; c++) {
              rowSlice.push(rowData[c - 1] !== undefined ? rowData[c - 1] : null);
            }
            rows.push(rowSlice);
          }
          return rows;
        }
      };
      const rangedStrategy = new SheetByIdStrategy(console, rangedSpreadsheetService);
      const config = { sheetId: 's1', range: 'A5:C10', hasHeaders: true };

      // Whole extraction — the pre-existing, already-correct behavior.
      const whole = rangedStrategy.extract(config);
      expect(whole).toEqual([
        { Name: 'A', Age: 1, Email: 'a@x.com' },
        { Name: 'B', Age: 2, Email: 'b@x.com' },
        { Name: 'C', Age: 3, Email: 'c@x.com' },
        { Name: 'D', Age: 4, Email: 'd@x.com' },
        { Name: 'E', Age: 5, Email: 'e@x.com' }
      ]);

      // Chunked extraction, 2 rows at a time — must clamp to the same
      // [A5:C10] window instead of paginating the whole 11-row grid.
      let cursor = { rowOffset: 0, headers: null };
      let chunked = [];
      let exhausted = false;
      let iterations = 0;
      while (!exhausted && iterations < 10) {
        const result = rangedStrategy.extractChunk(config, cursor, 2);
        chunked = chunked.concat(result.rows);
        cursor = result.nextCursor;
        exhausted = result.exhausted;
        iterations++;
      }

      expect(chunked).toEqual(whole);
      expect(iterations).toBeGreaterThan(1); // proves it actually chunked, not one shot
    });
  });

  // ===================================================================
  // extractRaw() Method Tests (ref REPORT_GLF.md B6)
  // ===================================================================
  describe('extractRaw() Method', () => {
    it('returns the raw grid, header row included, without object mapping', () => {
      const result = strategy.extractRaw({ sheetId: 'abc123' });

      expect(result).toEqual([
        ['Name', 'Age', 'Email'],
        ['John', 30, 'john@example.com'],
        ['Jane', 25, 'jane@example.com']
      ]);
      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledWith('abc123');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet1!A1:C10');
    });

    it('resolves tab and range identically to extract()', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 10, columnCount: 3 },
        { name: 'Sheet2', rowCount: 5, columnCount: 2 }
      ]);

      strategy.extractRaw({ sheetId: 'abc123', tabName: 'Sheet2', range: 'A1:B5' });

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('abc123', 'Sheet2!A1:B5');
    });

    it('returns [] for an empty sheet without throwing', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 0, columnCount: 0 }
      ]);

      expect(strategy.extractRaw({ sheetId: 'abc123' })).toEqual([]);
    });

    it('throws SourceError when sheetId is missing, same as extract()', () => {
      expect(() => strategy.extractRaw({})).toThrow(SourceError);
    });

    it('throws SourceError when tab name not found, same as extract()', () => {
      expect(() => strategy.extractRaw({ sheetId: 'abc123', tabName: 'Ghost' })).toThrow(
        SourceError
      );
    });

    it('does not hydrate rows into header-keyed objects (unlike extract())', () => {
      const extracted = strategy.extract({ sheetId: 'abc123' });
      const raw = strategy.extractRaw({ sheetId: 'abc123' });

      expect(Array.isArray(extracted[0])).toBe(false);
      expect(Array.isArray(raw[0])).toBe(true);
      expect(raw).toHaveLength(3); // header row + 2 data rows, unlike extract()'s 2
    });
  });
});
