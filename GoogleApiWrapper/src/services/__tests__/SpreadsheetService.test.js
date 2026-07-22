// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/SpreadsheetService.test.js
// ===================================================================
// Comprehensive test suite for SpreadsheetService (v3.0)
// Coverage: Batch operations, formatting, sheet management, metadata
// ===================================================================

import { SpreadsheetService } from '../SpreadsheetService';
import { testing as CoreUtilsTesting } from '@CoreUtilsLib';
import { testing as GasResilienceTesting } from '@GasResilienceLib';

describe('SpreadsheetService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let cache;
  let utils;
  let exceptionService;
  let mockSheets;
  let mockBatchExecutor;

  beforeEach(() => {
    global.resetGasMocks();

    logger = new CoreUtilsTesting.LoggerServiceMock();
    cache = new CoreUtilsTesting.CacheInterfaceMock();
    utils = new CoreUtilsTesting.UtilsServiceMock();
    exceptionService = new GasResilienceTesting.ExceptionServiceMock();

    // Mock Sheets API
    mockSheets = {
      Spreadsheets: {
        get: jest.fn(() => ({
          spreadsheetId: 'sheet123',
          properties: { title: 'Test Spreadsheet' },
          sheets: [
            {
              properties: {
                title: 'Sheet1',
                sheetId: 0,
                index: 0,
                hidden: false
              }
            },
            {
              properties: {
                title: 'Sheet2',
                sheetId: 1,
                index: 1,
                hidden: false
              }
            },
            {
              properties: {
                title: 'HiddenSheet',
                sheetId: 2,
                index: 2,
                hidden: true
              }
            }
          ]
        })),
        create: jest.fn((resource) => ({
          spreadsheetId: 'newsheet123',
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/newsheet123',
          properties: resource.properties
        })),
        batchUpdate: jest.fn(() => ({
          spreadsheetId: 'sheet123',
          replies: []
        })),
        Values: {
          batchGet: jest.fn((spreadsheetId, params) => ({
            spreadsheetId: spreadsheetId,
            valueRanges: (params.ranges || []).map((range, idx) => ({
              range: range,
              values: [
                [`Row${idx}Col1`, `Row${idx}Col2`],
                [`Row${idx}Col3`, `Row${idx}Col4`]
              ]
            }))
          })),
          batchUpdate: jest.fn((resource, spreadsheetId) => ({
            spreadsheetId: spreadsheetId,
            totalUpdatedRows: 10,
            totalUpdatedColumns: 5,
            totalUpdatedCells: 50,
            totalUpdatedSheets: 1,
            responses: resource.data.map((d) => ({
              updatedRange: d.range,
              updatedRows: d.values.length,
              updatedColumns: d.values[0] ? d.values[0].length : 0,
              updatedCells: d.values.reduce((sum, row) => sum + row.length, 0)
            }))
          })),
          batchClear: jest.fn((resource, spreadsheetId) => ({
            spreadsheetId: spreadsheetId,
            clearedRanges: resource.ranges
          })),
          append: jest.fn((resource, spreadsheetId, range) => ({
            spreadsheetId: spreadsheetId,
            updates: {
              updatedCells: resource.values.reduce((sum, row) => sum + row.length, 0),
              updatedRows: resource.values.length,
              updatedColumns: resource.values[0] ? resource.values[0].length : 0
            }
          }))
        }
      }
    };

    global.Sheets = mockSheets;

    // Mock BatchExecutor for appendRows
    mockBatchExecutor = {
      execute: jest.fn(() => [
        {
          index: 0,
          success: true,
          statusCode: 200,
          data: { updates: { updatedCells: 50, updatedRows: 10, updatedColumns: 5 } },
          error: null
        }
      ])
    };
    // Mock BatchExecutor class locally to bypass missing import
    global.BatchExecutor = class {
      execute() {
        return mockBatchExecutor.execute();
      }
    };
    jest.spyOn(global.BatchExecutor.prototype, 'execute');

    service = new SpreadsheetService(logger, cache, utils, exceptionService);
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

    it('should set cache prefix and expiration time', () => {
      expect(service._cachePrefix).toBe('sheets');
      expect(service._cacheExpirationTime).toBe(300);
    });

    it('should require exception service', () => {
      expect(() => new SpreadsheetService(logger, cache, utils, null)).toThrow(
        'exceptionService is required'
      );
    });
  });

  // ===================================================================
  // updateRanges() METHOD - BATCH VALUE OPERATIONS
  // ===================================================================

  describe('updateRanges() Method', () => {
    it('should update a single range', () => {
      const update = {
        range: 'Sheet1!A1:B2',
        values: [
          [1, 2],
          [3, 4]
        ]
      };

      const result = service.updateRanges('sheet123', update);

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          valueInputOption: 'USER_ENTERED',
          data: [update]
        }),
        'sheet123'
      );
      expect(result.totalUpdatedCells).toBe(50);
      expect(result.totalUpdatedRows).toBe(10);
    });

    it('should update multiple ranges in batch', () => {
      const updates = [
        {
          range: 'Sheet1!A1:B2',
          values: [
            [1, 2],
            [3, 4]
          ]
        },
        {
          range: 'Sheet1!C1:D2',
          values: [
            [5, 6],
            [7, 8]
          ]
        }
      ];

      const result = service.updateRanges('sheet123', updates);

      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: updates
        }),
        'sheet123'
      );
      expect(result.responses).toHaveLength(2);
    });

    it('should support RAW value input option', () => {
      const update = { range: 'Sheet1!A1', values: [['=A1+B1']] };

      service.updateRanges('sheet123', update, { valueInputOption: 'RAW' });

      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          valueInputOption: 'RAW'
        }),
        'sheet123'
      );
    });

    it('should log update summary', () => {
      const update = {
        range: 'Sheet1!A1:B2',
        values: [
          [1, 2],
          [3, 4]
        ]
      };

      service.updateRanges('sheet123', update);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updated 50 cells across 10 rows')
      );
    });

    it('should handle empty updates array', () => {
      const result = service.updateRanges('sheet123', []);

      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: []
        }),
        'sheet123'
      );
    });

    it('should return detailed response for each range', () => {
      const updates = [
        {
          range: 'Sheet1!A1:B2',
          values: [
            [1, 2],
            [3, 4]
          ]
        },
        {
          range: 'Sheet2!A1:C3',
          values: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ]
        }
      ];

      const result = service.updateRanges('sheet123', updates);

      expect(result.responses).toBeDefined();
      expect(Array.isArray(result.responses)).toBe(true);
    });
  });

  // ===================================================================
  // getRanges() METHOD - BATCH READ OPERATIONS
  // ===================================================================

  describe('getRanges() Method', () => {
    it('should get a single range and return values array', () => {
      const result = service.getRanges('sheet123', 'Sheet1!A1:B10');

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.Values.batchGet).toHaveBeenCalledWith(
        'sheet123',
        expect.objectContaining({
          ranges: ['Sheet1!A1:B10'],
          majorDimension: 'ROWS'
        })
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should get multiple ranges and return map', () => {
      const ranges = ['Sheet1!A1:B10', 'Sheet2!A1:C5'];

      const result = service.getRanges('sheet123', ranges);

      expect(mockSheets.Spreadsheets.Values.batchGet).toHaveBeenCalledWith(
        'sheet123',
        expect.objectContaining({
          ranges: ranges
        })
      );
      expect(typeof result).toBe('object');
      expect(result['Sheet1!A1:B10']).toBeDefined();
      expect(result['Sheet2!A1:C5']).toBeDefined();
    });

    it('should support COLUMNS major dimension', () => {
      service.getRanges('sheet123', 'Sheet1!A1:B10', { majorDimension: 'COLUMNS' });

      expect(mockSheets.Spreadsheets.Values.batchGet).toHaveBeenCalledWith(
        'sheet123',
        expect.objectContaining({
          majorDimension: 'COLUMNS'
        })
      );
    });

    it('should handle empty values in single range', () => {
      mockSheets.Spreadsheets.Values.batchGet.mockReturnValueOnce({
        spreadsheetId: 'sheet123',
        valueRanges: [{ range: 'Sheet1!A1:B10' }]
      });

      const result = service.getRanges('sheet123', 'Sheet1!A1:B10');

      expect(result).toEqual([]);
    });

    it('should handle empty values in multiple ranges', () => {
      mockSheets.Spreadsheets.Values.batchGet.mockReturnValueOnce({
        spreadsheetId: 'sheet123',
        valueRanges: [{ range: 'Sheet1!A1:B10' }, { range: 'Sheet2!A1:C5', values: [[1, 2, 3]] }]
      });

      const result = service.getRanges('sheet123', ['Sheet1!A1:B10', 'Sheet2!A1:C5']);

      expect(result['Sheet1!A1:B10']).toEqual([]);
      expect(result['Sheet2!A1:C5']).toEqual([[1, 2, 3]]);
    });

    it('should batch read 10 ranges efficiently', () => {
      const ranges = Array.from({ length: 10 }, (_, i) => `Sheet1!A${i}:B${i}`);

      const result = service.getRanges('sheet123', ranges);

      expect(mockSheets.Spreadsheets.Values.batchGet).toHaveBeenCalledTimes(1);
      expect(Object.keys(result)).toHaveLength(10);
    });
  });

  // ===================================================================
  // appendRows() METHOD - APPEND OPERATIONS
  // ===================================================================

  describe('appendRows() Method', () => {
    it('should append a single row', () => {
      const append = {
        range: 'Sheet1!A1',
        values: [['New', 'Row', 'Data']]
      };

      const result = service.appendRows('sheet123', append);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        {
          requests: [
            {
              appendCells: {
                sheetId: 0,
                rows: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: 'New' } },
                      { userEnteredValue: { stringValue: 'Row' } },
                      { userEnteredValue: { stringValue: 'Data' } }
                    ]
                  }
                ],
                fields: 'userEnteredValue'
              }
            }
          ]
        },
        'sheet123'
      );
      expect(result.totalUpdatedCells).toBe(3);
    });

    it('should append multiple rows to different sheets', () => {
      const appends = [
        { range: 'Sheet1!A1', values: [['Data1', 'Data2']] },
        { range: 'Sheet2!A1', values: [['Data3', 'Data4']] }
      ];

      const result = service.appendRows('sheet123', appends);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledTimes(1);
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({ appendCells: expect.objectContaining({ sheetId: 0 }) }),
            expect.objectContaining({ appendCells: expect.objectContaining({ sheetId: 1 }) })
          ])
        }),
        'sheet123'
      );
      expect(result.successful).toHaveLength(2);
    });

    it('should support RAW value input for appends', () => {
      const append = { range: 'Sheet1!A1', values: [['=SUM(A1:A10)']] };

      service.appendRows('sheet123', append, { valueInputOption: 'RAW' });

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: [
            expect.objectContaining({
              appendCells: expect.objectContaining({
                rows: [
                  {
                    values: [{ userEnteredValue: { stringValue: '=SUM(A1:A10)' } }]
                  }
                ]
              })
            })
          ]
        }),
        'sheet123'
      );
    });

    it('should return total updated rows', () => {
      const append = { range: 'Sheet1!A1', values: [['A'], ['B'], ['C']] };

      const result = service.appendRows('sheet123', append);

      expect(result.totalUpdatedRows).toBe(3);
    });
  });

  // ===================================================================
  // clearRanges() METHOD - CLEAR OPERATIONS
  // ===================================================================

  describe('clearRanges() Method', () => {
    it('should clear a single range', () => {
      const result = service.clearRanges('sheet123', 'Sheet1!A1:B10');

      expect(mockSheets.Spreadsheets.Values.batchClear).toHaveBeenCalledWith(
        { ranges: ['Sheet1!A1:B10'] },
        'sheet123'
      );
      expect(result.clearedRanges).toEqual(['Sheet1!A1:B10']);
    });

    it('should clear multiple ranges in batch', () => {
      const ranges = ['Sheet1!A1:B10', 'Sheet2!A1:C5', 'Sheet3!D1:E20'];

      const result = service.clearRanges('sheet123', ranges);

      expect(mockSheets.Spreadsheets.Values.batchClear).toHaveBeenCalledWith(
        { ranges: ranges },
        'sheet123'
      );
      expect(result.clearedRanges).toEqual(ranges);
    });

    it('should handle array normalization for single range', () => {
      service.clearRanges('sheet123', 'Sheet1!A1');

      expect(mockSheets.Spreadsheets.Values.batchClear).toHaveBeenCalledWith(
        { ranges: ['Sheet1!A1'] },
        'sheet123'
      );
    });

    it('should clear 15 ranges efficiently', () => {
      const ranges = Array.from({ length: 15 }, (_, i) => `Sheet1!A${i}:B${i}`);

      service.clearRanges('sheet123', ranges);

      expect(mockSheets.Spreadsheets.Values.batchClear).toHaveBeenCalledTimes(1);
    });
  });

  // ===================================================================
  // formatRanges() METHOD - FORMATTING OPERATIONS
  // ===================================================================

  describe('formatRanges() Method', () => {
    it('should format a single range', () => {
      const formatRequest = {
        range: 'Sheet1!A1:B1',
        format: {
          backgroundColor: { red: 0.2, green: 0.6, blue: 1 },
          textFormat: { bold: true }
        }
      };

      const result = service.formatRanges('sheet123', formatRequest);

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: formatRequest.format
                },
                fields: 'userEnteredFormat'
              })
            })
          ])
        }),
        'sheet123'
      );
      expect(result.updatedSpreadsheet).toBe('sheet123');
    });

    it('should format multiple ranges with different styles', () => {
      const formatRequests = [
        {
          range: 'Sheet1!A1:Z1',
          format: {
            backgroundColor: { red: 0.2, green: 0.6, blue: 1 },
            textFormat: { bold: true }
          }
        },
        {
          range: 'Sheet1!A2:A100',
          format: {
            numberFormat: { type: 'NUMBER', pattern: '#,##0.00' }
          }
        }
      ];

      const result = service.formatRanges('sheet123', formatRequests);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalled();
      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(2);
    });

    it('should handle bold header formatting', () => {
      const formatRequest = {
        range: 'Sheet1!A1:E1',
        format: {
          backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
          textFormat: { bold: true, fontSize: 12 }
        }
      };

      service.formatRanges('sheet123', formatRequest);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalled();
    });

    it('should handle number formatting', () => {
      const formatRequest = {
        range: 'Sheet1!B2:B100',
        format: {
          numberFormat: { type: 'CURRENCY', pattern: '$#,##0.00' }
        }
      };

      service.formatRanges('sheet123', formatRequest);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests[0].repeatCell.cell.userEnteredFormat.numberFormat).toEqual({
        type: 'CURRENCY',
        pattern: '$#,##0.00'
      });
    });
  });

  // ===================================================================
  // setColumnWidths() METHOD - COLUMN WIDTH OPERATIONS
  // ===================================================================

  describe('setColumnWidths() Method', () => {
    it('should set width for a single column range', () => {
      const widthRequest = {
        sheetName: 'Sheet1',
        startColumn: 0,
        endColumn: 3,
        width: 200
      };

      service.setColumnWidths('sheet123', widthRequest);

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({
              updateDimensionProperties: expect.objectContaining({
                range: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 3
                },
                properties: {
                  pixelSize: 200
                },
                fields: 'pixelSize'
              })
            })
          ])
        }),
        'sheet123'
      );
    });

    it('should set widths for multiple column ranges', () => {
      const widthRequests = [
        { sheetName: 'Sheet1', startColumn: 0, endColumn: 3, width: 200 },
        { sheetName: 'Sheet1', startColumn: 3, endColumn: 5, width: 100 }
      ];

      service.setColumnWidths('sheet123', widthRequests);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(2);
    });

    it('should handle different sheet names', () => {
      const widthRequests = [
        { sheetName: 'Sheet1', startColumn: 0, endColumn: 5, width: 150 },
        { sheetName: 'Sheet2', startColumn: 0, endColumn: 10, width: 100 }
      ];

      service.setColumnWidths('sheet123', widthRequests);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests[0].updateDimensionProperties.range.sheetId).toBe(0);
      expect(calls[0].requests[1].updateDimensionProperties.range.sheetId).toBe(1);
    });
  });

  // ===================================================================
  // createSheets() METHOD - SHEET CREATION
  // ===================================================================

  describe('createSheets() Method', () => {
    it('should create a single sheet', () => {
      const sheetRequest = { title: 'NewSheet1', index: 0 };

      service.createSheets('sheet123', sheetRequest);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({
              addSheet: {
                properties: {
                  title: 'NewSheet1',
                  index: 0
                }
              }
            })
          ])
        }),
        'sheet123'
      );
    });

    it('should create multiple sheets in batch', () => {
      const sheetRequests = [
        { title: 'Sheet1', index: 0 },
        { title: 'Sheet2' },
        { title: 'Sheet3', index: 2 }
      ];

      service.createSheets('sheet123', sheetRequests);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(3);
      expect(calls[0].requests[0].addSheet.properties.title).toBe('Sheet1');
      expect(calls[0].requests[1].addSheet.properties.title).toBe('Sheet2');
    });

    it('should create sheet without index (appends)', () => {
      const sheetRequest = { title: 'AppendedSheet' };

      service.createSheets('sheet123', sheetRequest);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests[0].addSheet.properties.index).toBeUndefined();
    });
  });

  // ===================================================================
  // deleteSheets() METHOD - SHEET DELETION
  // ===================================================================

  describe('deleteSheets() Method', () => {
    it('should delete a single sheet by name', () => {
      service.deleteSheets('sheet123', 'Sheet2');

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requests: expect.arrayContaining([
            expect.objectContaining({
              deleteSheet: {
                sheetId: 1
              }
            })
          ])
        }),
        'sheet123'
      );
    });

    it('should delete a single sheet by ID', () => {
      service.deleteSheets('sheet123', 1);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests[0].deleteSheet.sheetId).toBe(1);
    });

    it('should delete multiple sheets by names', () => {
      service.deleteSheets('sheet123', ['Sheet1', 'Sheet2']);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(2);
      expect(calls[0].requests[0].deleteSheet.sheetId).toBe(0);
      expect(calls[0].requests[1].deleteSheet.sheetId).toBe(1);
    });

    it('should delete multiple sheets by IDs', () => {
      service.deleteSheets('sheet123', [0, 2]);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(2);
      expect(calls[0].requests[0].deleteSheet.sheetId).toBe(0);
      expect(calls[0].requests[1].deleteSheet.sheetId).toBe(2);
    });

    it('should handle mixed sheet names and IDs', () => {
      service.deleteSheets('sheet123', ['Sheet1', 2]);

      const calls = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(calls[0].requests).toHaveLength(2);
    });
  });

  // ===================================================================
  // getSpreadsheetMetadata() METHOD - METADATA RETRIEVAL
  // ===================================================================

  describe('getSpreadsheetMetadata() Method', () => {
    it('should get default metadata', () => {
      const result = service.getSpreadsheetMetadata('sheet123');

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalledWith('sheet123', {
        fields: 'sheets.properties,properties'
      });
      expect(result.spreadsheetId).toBe('sheet123');
      expect(result.properties.title).toBe('Test Spreadsheet');
    });

    it('should get custom fields metadata', () => {
      service.getSpreadsheetMetadata('sheet123', {
        fields: 'properties.title,sheets.properties.title'
      });

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalledWith('sheet123', {
        fields: 'properties.title,sheets.properties.title'
      });
    });

    it('should log metadata retrieval', () => {
      service.getSpreadsheetMetadata('sheet123');

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Retrieved metadata for spreadsheet: sheet123')
      );
    });
  });

  // ===================================================================
  // getSheetInfo() METHOD - SHEET INFORMATION
  // ===================================================================

  describe('getSheetInfo() Method', () => {
    it('should get visible sheets only by default', () => {
      const result = service.getSheetInfo('sheet123');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Sheet1');
      expect(result[0].sheetId).toBe(0);
      expect(result[1].name).toBe('Sheet2');
      expect(result[1].sheetId).toBe(1);
    });

    it('should include hidden sheets when requested', () => {
      const result = service.getSheetInfo('sheet123', { includeHidden: true });

      expect(result).toHaveLength(3);
      expect(result[2].name).toBe('HiddenSheet');
      expect(result[2].hidden).toBe(true);
    });

    it('should return sheet properties correctly', () => {
      const result = service.getSheetInfo('sheet123');

      expect(result[0]).toEqual({
        name: 'Sheet1',
        sheetId: 0,
        index: 0,
        hidden: false,
        gridProperties: {}
      });
    });

    it('should log sheet retrieval', () => {
      service.getSheetInfo('sheet123');

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Retrieved 2 sheet(s) from spreadsheet: sheet123')
      );
    });

    it('should handle spreadsheet with no sheets', () => {
      mockSheets.Spreadsheets.get.mockReturnValueOnce({
        spreadsheetId: 'empty123',
        sheets: []
      });

      const result = service.getSheetInfo('empty123');

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // createSpreadsheet() METHOD - SPREADSHEET CREATION
  // ===================================================================

  describe('createSpreadsheet() Method', () => {
    it('should create a spreadsheet with title', () => {
      const result = service.createSpreadsheet('My Spreadsheet');

      expect(mockSheets.Spreadsheets.create).toHaveBeenCalledWith({
        properties: {
          title: 'My Spreadsheet'
        }
      });
      expect(result.spreadsheetId).toBe('newsheet123');
    });

    it('should create a spreadsheet with custom sheets', () => {
      const options = {
        sheets: [
          { title: 'Sheet1', index: 0 },
          { title: 'Sheet2', index: 1 }
        ]
      };

      service.createSpreadsheet('Custom Sheets', options);

      expect(mockSheets.Spreadsheets.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sheets: [
            { properties: { title: 'Sheet1', index: 0 } },
            { properties: { title: 'Sheet2', index: 1 } }
          ]
        })
      );
    });

    it('should move the created spreadsheet into destinationFolder via Drive API', () => {
      const result = service.createSpreadsheet('Filed Sheet', { destinationFolder: 'folder-1' });

      expect(global.Drive.Files.update).toHaveBeenCalledWith({}, 'newsheet123', null, {
        addParents: 'folder-1'
      });
      expect(result.spreadsheetId).toBe('newsheet123');
    });

    it('should not touch Drive when destinationFolder is not provided', () => {
      service.createSpreadsheet('Root Sheet');

      expect(global.Drive.Files.update).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // HELPER METHODS - _columnToIndex()
  // ===================================================================

  describe('Helper Method: _columnToIndex()', () => {
    it('should convert single letter columns', () => {
      expect(service._columnToIndex('A')).toBe(0);
      expect(service._columnToIndex('B')).toBe(1);
      expect(service._columnToIndex('Z')).toBe(25);
    });

    it('should convert double letter columns', () => {
      expect(service._columnToIndex('AA')).toBe(26);
      expect(service._columnToIndex('AB')).toBe(27);
      expect(service._columnToIndex('AZ')).toBe(51);
      expect(service._columnToIndex('BA')).toBe(52);
    });

    it('should convert triple letter columns', () => {
      expect(service._columnToIndex('AAA')).toBe(702);
      expect(service._columnToIndex('ZZZ')).toBe(18277);
    });
  });

  // ===================================================================
  // HELPER METHODS - _parseCell()
  // ===================================================================

  describe('Helper Method: _parseCell()', () => {
    it('should parse single letter cell references', () => {
      expect(service._parseCell('A1')).toEqual({ row: 0, col: 0 });
      expect(service._parseCell('B5')).toEqual({ row: 4, col: 1 });
      expect(service._parseCell('Z99')).toEqual({ row: 98, col: 25 });
    });

    it('should parse double letter cell references', () => {
      expect(service._parseCell('AA1')).toEqual({ row: 0, col: 26 });
      expect(service._parseCell('AB10')).toEqual({ row: 9, col: 27 });
    });

    it('should throw error for invalid cell reference', () => {
      expect(() => service._parseCell('123')).toThrow('Invalid cell reference');
      expect(() => service._parseCell('A')).toThrow('Invalid cell reference');
      expect(() => service._parseCell('')).toThrow('Invalid cell reference');
    });
  });

  // ===================================================================
  // HELPER METHODS - _parseRangeToGridRange()
  // ===================================================================

  describe('Helper Method: _parseRangeToGridRange()', () => {
    it('should parse single cell range', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!A1', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1
      });
    });

    it('should parse range with start and end cells', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!A1:C5', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 5,
        startColumnIndex: 0,
        endColumnIndex: 3
      });
    });

    it('should parse unbounded column range (C:C)', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!C:C', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startColumnIndex: 2,
        endColumnIndex: 3
        // Note: No startRowIndex or endRowIndex for unbounded ranges
      });
      expect(result.startRowIndex).toBeUndefined();
      expect(result.endRowIndex).toBeUndefined();
    });

    it('should parse unbounded multi-column range (A:D)', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!A:D', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startColumnIndex: 0,
        endColumnIndex: 4
      });
      expect(result.startRowIndex).toBeUndefined();
      expect(result.endRowIndex).toBeUndefined();
    });

    it('should parse unbounded row range (5:5)', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!5:5', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startRowIndex: 4,
        endRowIndex: 5
      });
      expect(result.startColumnIndex).toBeUndefined();
      expect(result.endColumnIndex).toBeUndefined();
    });

    it('should parse unbounded multi-row range (1:10)', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!1:10', sheets);

      expect(result).toEqual({
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10
      });
      expect(result.startColumnIndex).toBeUndefined();
      expect(result.endColumnIndex).toBeUndefined();
    });

    it('should handle sheet names with quotes', () => {
      const sheets = [{ properties: { title: 'My Sheet', sheetId: 5 } }];

      const result = service._parseRangeToGridRange("'My Sheet'!A1:B2", sheets);

      expect(result.sheetId).toBe(5);
    });

    it('should throw error for non-existent sheet', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      expect(() => service._parseRangeToGridRange('Sheet2!A1:B2', sheets)).toThrow(
        'Sheet Sheet2 not found'
      );
    });

    it('should handle range without explicit end (defaults to single cell)', () => {
      const sheets = [{ properties: { title: 'Sheet1', sheetId: 0 } }];

      const result = service._parseRangeToGridRange('Sheet1!', sheets);

      expect(result.startRowIndex).toBe(0);
      expect(result.endRowIndex).toBe(1);
    });
  });

  // ===================================================================
  // PROTECTED RANGE OPERATIONS (ACL)
  // ===================================================================

  describe('getProtectedRanges() Method', () => {
    beforeEach(() => {
      // Mock Sheets.Spreadsheets.get to return protected ranges
      mockSheets.Spreadsheets.get.mockReturnValue({
        spreadsheetId: 'sheet123',
        sheets: [
          {
            properties: { title: 'Sheet1', sheetId: 0 },
            protectedRanges: [
              {
                protectedRangeId: 123,
                range: { sheetId: 0, startColumnIndex: 0, endColumnIndex: 1 },
                description: 'Column A Protected',
                editors: { users: ['admin@example.com'] },
                warningOnly: false
              },
              {
                protectedRangeId: 456,
                range: { sheetId: 0, startColumnIndex: 2, endColumnIndex: 3 },
                description: 'Column C Protected',
                warningOnly: true
              }
            ]
          },
          {
            properties: { title: 'Sheet2', sheetId: 1 },
            protectedRanges: [
              {
                protectedRangeId: 789,
                range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1 },
                description: 'Header Row',
                editors: { users: ['user@example.com'] }
              }
            ]
          }
        ]
      });
    });

    it('should retrieve all protected ranges from all sheets', () => {
      const result = service.getProtectedRanges('sheet123');

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalledWith('sheet123', {
        fields: 'sheets(properties(sheetId,title),protectedRanges)'
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 123,
        description: 'Column A Protected',
        sheetId: 0,
        sheetName: 'Sheet1'
      });
    });

    it('should filter protected ranges by sheet name', () => {
      const result = service.getProtectedRanges('sheet123', 'Sheet1');

      expect(result).toHaveLength(2);
      expect(result[0].sheetName).toBe('Sheet1');
      expect(result[1].sheetName).toBe('Sheet1');
    });

    it('should return empty array when no protected ranges exist', () => {
      mockSheets.Spreadsheets.get.mockReturnValueOnce({
        spreadsheetId: 'sheet123',
        sheets: [
          {
            properties: { title: 'Sheet1', sheetId: 0 },
            protectedRanges: []
          }
        ]
      });

      const result = service.getProtectedRanges('sheet123');

      expect(result).toEqual([]);
    });

    it('should handle sheets without protectedRanges property', () => {
      mockSheets.Spreadsheets.get.mockReturnValueOnce({
        spreadsheetId: 'sheet123',
        sheets: [
          {
            properties: { title: 'Sheet1', sheetId: 0 }
            // No protectedRanges property
          }
        ]
      });

      const result = service.getProtectedRanges('sheet123');

      expect(result).toEqual([]);
    });

    it('should include warningOnly flag', () => {
      const result = service.getProtectedRanges('sheet123');

      expect(result[0].warningOnly).toBe(false);
      expect(result[1].warningOnly).toBe(true);
    });
  });

  describe('deleteProtectedRanges() Method', () => {
    it('should delete a single protected range', () => {
      const result = service.deleteProtectedRanges('sheet123', 123);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        {
          requests: [
            {
              deleteProtectedRange: {
                protectedRangeId: 123
              }
            }
          ]
        },
        'sheet123'
      );

      expect(result.deletedCount).toBe(1);
      expect(result.spreadsheetId).toBe('sheet123');
    });

    it('should delete multiple protected ranges in batch', () => {
      const ids = [123, 456, 789];

      const result = service.deleteProtectedRanges('sheet123', ids);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledWith(
        {
          requests: [
            { deleteProtectedRange: { protectedRangeId: 123 } },
            { deleteProtectedRange: { protectedRangeId: 456 } },
            { deleteProtectedRange: { protectedRangeId: 789 } }
          ]
        },
        'sheet123'
      );

      expect(result.deletedCount).toBe(3);
    });

    it('should use executeWithRetry', () => {
      service.deleteProtectedRanges('sheet123', 123);

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      const call = exceptionService.executeWithRetry.mock.calls[0];
      expect(call[2]).toBe(3); // maxAttempts
    });
  });

  describe('protectRanges() Method', () => {
    beforeEach(() => {
      // Mock batchUpdate to return protected range IDs
      mockSheets.Spreadsheets.batchUpdate.mockReturnValue({
        spreadsheetId: 'sheet123',
        replies: [
          {
            addProtectedRange: {
              protectedRange: {
                protectedRangeId: 999
              }
            }
          }
        ]
      });
    });

    it('should protect a single range with basic config', () => {
      const protectionRequest = {
        range: 'Sheet1!C:C',
        description: 'ID Column',
        editors: { users: ['admin@example.com'] }
      };

      const result = service.protectRanges('sheet123', protectionRequest);

      expect(mockSheets.Spreadsheets.get).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalled();

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      expect(request.addProtectedRange.protectedRange).toMatchObject({
        range: {
          sheetId: 0,
          startColumnIndex: 2,
          endColumnIndex: 3
        },
        description: 'ID Column',
        warningOnly: false,
        requestingUserCanEdit: true,
        editors: {
          users: ['admin@example.com']
        }
      });

      expect(result.protectedCount).toBe(1);
      expect(result.protectedRangeIds).toEqual([999]);
    });

    it('should ALWAYS set requestingUserCanEdit: true (CRITICAL SECURITY)', () => {
      const protectionRequest = {
        range: 'Sheet1!A:A',
        editors: { users: ['other@example.com'] }
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      // CRITICAL: Verify requestingUserCanEdit is ALWAYS true
      expect(request.addProtectedRange.protectedRange.requestingUserCanEdit).toBe(true);
    });

    it('should protect multiple ranges in batch', () => {
      const protectionRequests = [
        { range: 'Sheet1!A:A', description: 'Column A' },
        { range: 'Sheet1!B:B', description: 'Column B' },
        { range: 'Sheet1!C:C', description: 'Column C' }
      ];

      mockSheets.Spreadsheets.batchUpdate.mockReturnValueOnce({
        spreadsheetId: 'sheet123',
        replies: [
          { addProtectedRange: { protectedRange: { protectedRangeId: 111 } } },
          { addProtectedRange: { protectedRange: { protectedRangeId: 222 } } },
          { addProtectedRange: { protectedRange: { protectedRangeId: 333 } } }
        ]
      });

      const result = service.protectRanges('sheet123', protectionRequests);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      expect(call[0].requests).toHaveLength(3);

      expect(result.protectedCount).toBe(3);
      expect(result.protectedRangeIds).toEqual([111, 222, 333]);
    });

    it('should merge specific editors with global editors', () => {
      const protectionRequest = {
        range: 'Sheet1!A:A',
        editors: { users: ['specific@example.com'] }
      };

      const options = {
        globalEditors: {
          users: ['admin@example.com', 'manager@example.com'],
          groups: ['editors@example.com']
        }
      };

      service.protectRanges('sheet123', protectionRequest, options);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      expect(request.addProtectedRange.protectedRange.editors).toEqual({
        users: ['specific@example.com', 'admin@example.com', 'manager@example.com'],
        groups: ['editors@example.com']
      });
    });

    it('should support warningOnly mode', () => {
      const protectionRequest = {
        range: 'Sheet1!A:A',
        warningOnly: true
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      expect(request.addProtectedRange.protectedRange.warningOnly).toBe(true);
    });

    it('should handle bounded ranges (A1:B10)', () => {
      const protectionRequest = {
        range: 'Sheet1!A1:B10',
        description: 'Data Range'
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      expect(request.addProtectedRange.protectedRange.range).toEqual({
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 2
      });
    });

    it('should handle unbounded column ranges (C:C)', () => {
      const protectionRequest = {
        range: 'Sheet1!C:C',
        description: 'Entire Column C'
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];
      const range = request.addProtectedRange.protectedRange.range;

      expect(range.sheetId).toBe(0);
      expect(range.startColumnIndex).toBe(2);
      expect(range.endColumnIndex).toBe(3);
      expect(range.startRowIndex).toBeUndefined();
      expect(range.endRowIndex).toBeUndefined();
    });

    it('should remove empty editor arrays', () => {
      const protectionRequest = {
        range: 'Sheet1!A:A',
        description: 'No specific editors'
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];
      const editors = request.addProtectedRange.protectedRange.editors;

      // Should be undefined when no editors provided
      expect(editors).toBeUndefined();
    });

    it('should support domainUsersCanEdit flag', () => {
      const protectionRequest = {
        range: 'Sheet1!A:A',
        editors: { domainUsersCanEdit: false }
      };

      service.protectRanges('sheet123', protectionRequest);

      const call = mockSheets.Spreadsheets.batchUpdate.mock.calls[0];
      const request = call[0].requests[0];

      expect(request.addProtectedRange.protectedRange.editors.domainUsersCanEdit).toBe(false);
    });

    it('should use executeWithRetry', () => {
      const protectionRequest = { range: 'Sheet1!A:A' };

      service.protectRanges('sheet123', protectionRequest);

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      const call = exceptionService.executeWithRetry.mock.calls[0];
      expect(call[2]).toBe(3); // maxAttempts
    });
  });

  // ===================================================================
  // INTEGRATION SCENARIOS
  // ===================================================================

  describe('Integration Scenarios', () => {
    it('should handle complete report generation workflow', () => {
      // Create spreadsheet
      const created = service.createSpreadsheet('Monthly Report');
      expect(created.spreadsheetId).toBe('newsheet123');

      // Update data
      service.updateRanges(created.spreadsheetId, [
        { range: 'Sheet1!A1:C1', values: [['Name', 'Sales', 'Profit']] },
        {
          range: 'Sheet1!A2:C4',
          values: [
            ['Alice', 100, 50],
            ['Bob', 150, 75],
            ['Carol', 200, 100]
          ]
        }
      ]);

      // Format headers
      service.formatRanges(created.spreadsheetId, {
        range: 'Sheet1!A1:C1',
        format: {
          backgroundColor: { red: 0.2, green: 0.6, blue: 1 },
          textFormat: { bold: true }
        }
      });

      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalled();
      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalled();
    });

    it('should handle bulk data import with clearing', () => {
      // Clear existing data
      service.clearRanges('sheet123', ['Sheet1!A:Z', 'Sheet2!A:Z']);

      // Import new data
      service.updateRanges('sheet123', [
        { range: 'Sheet1!A1:D100', values: Array(100).fill([1, 2, 3, 4]) },
        { range: 'Sheet2!A1:D100', values: Array(100).fill([5, 6, 7, 8]) }
      ]);

      expect(mockSheets.Spreadsheets.Values.batchClear).toHaveBeenCalledTimes(1);
      expect(mockSheets.Spreadsheets.Values.batchUpdate).toHaveBeenCalledTimes(1);
    });

    it('should handle multi-sheet formatting workflow', () => {
      // Format headers across multiple sheets
      service.formatRanges('sheet123', [
        { range: 'Sheet1!A1:Z1', format: { textFormat: { bold: true } } },
        { range: 'Sheet2!A1:Z1', format: { textFormat: { bold: true } } }
      ]);

      // Set column widths
      service.setColumnWidths('sheet123', [
        { sheetName: 'Sheet1', startColumn: 0, endColumn: 10, width: 150 },
        { sheetName: 'Sheet2', startColumn: 0, endColumn: 10, width: 150 }
      ]);

      expect(mockSheets.Spreadsheets.batchUpdate).toHaveBeenCalledTimes(2);
    });

    it('should handle error recovery with retry', () => {
      // Verify that operations use exception service for retry logic
      const update = {
        range: 'Sheet1!A1:B2',
        values: [
          [1, 2],
          [3, 4]
        ]
      };

      service.updateRanges('sheet123', update);

      // Verify executeWithRetry was called
      expect(exceptionService.executeWithRetry).toHaveBeenCalled();

      // Verify it was called with the correct retry count (3 attempts)
      const call = exceptionService.executeWithRetry.mock.calls[0];
      expect(call[2]).toBe(3); // maxAttempts parameter
    });
  });
});
