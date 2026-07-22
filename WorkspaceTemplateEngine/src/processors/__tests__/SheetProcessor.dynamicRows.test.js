/**
 * @fileoverview Tests for SheetProcessor dynamic_rows expansion (vertical mirror of dynamic_columns)
 */

import { SheetProcessor } from '../SheetProcessor.js';

describe('SheetProcessor - Dynamic Rows Tests', () => {
  let processor;
  let mockPlaceholderService;
  let mockSpreadsheetService;
  let mockMustache;
  let mockLogger;

  beforeEach(() => {
    mockLogger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockMustache = {
      render: jest.fn((template, context) => {
        return template.replace(/{{(\w+)}}/g, (match, key) => context[key] || match);
      }),
      getValue: jest.fn((path, context) => {
        if (!context) return undefined;
        return context[path];
      })
    };
    mockSpreadsheetService = {
      getSheetInfo: jest.fn(),
      getRanges: jest.fn(),
      updateRanges: jest.fn(),
      expandSheetGrid: jest.fn(),
      getProtectedRanges: jest.fn(),
      deleteProtectedRanges: jest.fn(),
      protectRanges: jest.fn()
    };
    mockPlaceholderService = { mustache: mockMustache, logger: mockLogger };
    processor = new SheetProcessor(mockPlaceholderService);
    processor.spreadsheetService = mockSpreadsheetService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_prepareDynamicRowRequests()', () => {
    it('expands one row per array item, downward from the placeholder cell', () => {
      const context = {
        studenti: [{ nome: 'Alice' }, { nome: 'Bob' }, { nome: 'Carla' }]
      };
      const placeholder = '{{dynamic_rows[source=studenti, value=nome]}}';
      mockMustache.getValue.mockImplementation((path, ctx) => (ctx ? ctx[path] : undefined));

      const { valueRequests } = processor._prepareDynamicRowRequests(
        'Sheet1',
        5,
        2,
        placeholder,
        context // starts at row 5, column 2 (B5)
      );

      expect(valueRequests).toHaveLength(4); // clear + 3 students
      expect(valueRequests[0]).toEqual({ range: "'Sheet1'!B5", values: [['']] }); // clear placeholder
      expect(valueRequests[1]).toEqual({ range: "'Sheet1'!B5", values: [['Alice']] });
      expect(valueRequests[2]).toEqual({ range: "'Sheet1'!B6", values: [['Bob']] });
      expect(valueRequests[3]).toEqual({ range: "'Sheet1'!B7", values: [['Carla']] });
    });

    it('handles a non-array data source: no requests, a warning, no clear-cell request', () => {
      const context = { studenti: 'not an array' };
      const placeholder = '{{dynamic_rows[source=studenti, value=nome]}}';

      const { valueRequests } = processor._prepareDynamicRowRequests(
        'Sheet1',
        5,
        2,
        placeholder,
        context
      );

      expect(valueRequests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Data source 'studenti' for dynamic_rows is not an array."
      );
    });

    it('handles an empty array: clear the placeholder, no data rows', () => {
      const context = { studenti: [] };
      const placeholder = '{{dynamic_rows[source=studenti, value=nome]}}';
      mockMustache.getValue.mockImplementation((path, ctx) => (ctx ? ctx[path] : undefined));

      const { valueRequests } = processor._prepareDynamicRowRequests(
        'Sheet1',
        5,
        2,
        placeholder,
        context
      );

      expect(valueRequests).toEqual([{ range: "'Sheet1'!B5", values: [['']] }]);
    });

    it('handles an invalid placeholder string: no requests, a warning', () => {
      const { valueRequests } = processor._prepareDynamicRowRequests(
        'Sheet1',
        1,
        1,
        '{{dynamic_rows[not valid}}',
        {}
      );
      expect(valueRequests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid dynamic_rows placeholder: {{dynamic_rows[not valid}}'
      );
    });

    it('writes an ERROR cell instead of throwing when getValue throws', () => {
      mockMustache.getValue.mockImplementation(() => {
        throw new Error('boom');
      });
      const placeholder = '{{dynamic_rows[source=studenti, value=nome]}}';

      const { valueRequests } = processor._prepareDynamicRowRequests(
        'Sheet1',
        1,
        1,
        placeholder,
        { studenti: [] }
      );

      expect(valueRequests).toEqual([{ range: "'Sheet1'!A1", values: [['ERROR: boom']] }]);
    });
  });

  describe('process() Integration', () => {
    it('dispatches a {{dynamic_rows[...]}} cell to _prepareDynamicRowRequests and applies it in the batch update', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['{{dynamic_rows[source=s, value=v]}}']
      ]);

      const context = { s: [{ v: 'Row1' }, { v: 'Row2' }] };
      mockMustache.getValue.mockImplementation((path, ctx) => (ctx ? ctx[path] : undefined));

      processor.process('sheetId123', context, null);

      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalledWith(
        'sheetId123',
        expect.arrayContaining([
          { range: "'Sheet1'!A1", values: [['Row1']] },
          { range: "'Sheet1'!A2", values: [['Row2']] }
        ])
      );
    });
  });
});
