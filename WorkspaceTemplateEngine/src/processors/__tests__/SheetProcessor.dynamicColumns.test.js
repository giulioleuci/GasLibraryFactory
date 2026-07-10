/**
 * @fileoverview Tests for SheetProcessor dynamic_columns expansion
 * @author GasLibraryFactory
 */

import { SheetProcessor } from '../SheetProcessor.js';

describe('SheetProcessor - Dynamic Columns Tests', () => {
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
      getValue: jest.fn((path, context) => {
        if (!context) {
          return undefined;
        }
        return context[path];
      })
    };

    // Mock SpreadsheetService
    mockSpreadsheetService = {
      getSheetInfo: jest.fn(),
      getRanges: jest.fn(),
      updateRanges: jest.fn(),
      expandSheetGrid: jest.fn(),
      getProtectedRanges: jest.fn(),
      deleteProtectedRanges: jest.fn(),
      protectRanges: jest.fn()
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

  describe('_prepareDynamicColumnRequests()', () => {
    it('should generate requests for dynamic columns with headers and protections', () => {
      const context = {
        students: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
        ]
      };

      const placeholder =
        '{{dynamic_columns[source=students, value=name, acl=email, scope=column]}}';

      // Mock getValue for nested access
      mockMustache.getValue.mockImplementation((path, context) => context[path]);

      const { valueRequests, protectionRequests } = processor._prepareDynamicColumnRequests(
        'Sheet1',
        1,
        3,
        placeholder,
        context // Start at C1 (1, 3)
      );

      expect(valueRequests).toHaveLength(3); // clear + 2 students
      expect(protectionRequests).toHaveLength(2); // 2 students

      // Clear cell
      expect(valueRequests[0]).toEqual({
        range: "'Sheet1'!C1",
        values: [['']]
      });

      // Headers
      expect(valueRequests[1]).toEqual({
        range: "'Sheet1'!C1",
        values: [['Alice']]
      });
      expect(valueRequests[2]).toEqual({
        range: "'Sheet1'!D1",
        values: [['Bob']]
      });

      // Protections
      expect(protectionRequests[0]).toEqual({
        range: "'Sheet1'!C:C",
        description: '[WTE] Dynamic Column: students',
        editors: { users: ['alice@example.com'] }
      });
      expect(protectionRequests[1]).toEqual({
        range: "'Sheet1'!D:D",
        description: '[WTE] Dynamic Column: students',
        editors: { users: ['bob@example.com'] }
      });
    });

    it('should support scope=range for protections', () => {
      const context = {
        students: [{ name: 'Alice', email: 'alice@example.com' }]
      };

      const placeholder =
        '{{dynamic_columns[source=students, value=name, acl=email, scope=range]}}';
      mockMustache.getValue.mockImplementation((path, context) => context[path]);

      const { protectionRequests } = processor._prepareDynamicColumnRequests(
        'Sheet1',
        1,
        3,
        placeholder,
        context
      );

      expect(protectionRequests[0].range).toBe("'Sheet1'!C1");
    });

    it('should handle missing acl parameter', () => {
      const context = {
        students: [{ name: 'Alice' }]
      };

      const placeholder = '{{dynamic_columns[source=students, value=name]}}';
      mockMustache.getValue.mockImplementation((path, context) => context[path]);

      const { protectionRequests } = processor._prepareDynamicColumnRequests(
        'Sheet1',
        1,
        3,
        placeholder,
        context
      );

      expect(protectionRequests).toHaveLength(0);
    });

    it('should handle non-array data source', () => {
      const context = { students: 'not an array' };
      const placeholder = '{{dynamic_columns[source=students, value=name]}}';

      const { valueRequests } = processor._prepareDynamicColumnRequests(
        'Sheet1',
        1,
        3,
        placeholder,
        context
      );

      expect(valueRequests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Data source 'students' for dynamic_columns is not an array."
      );
    });

    it('lays out multiple sequential groups with label columns between them, from one placeholder', () => {
      const context = {
        condivise: [{ sigla: 'MAT' }, { sigla: 'ITA' }],
        gruppo1: [{ sigla: 'FIS' }],
        gruppo2: [{ sigla: 'CHI' }, { sigla: 'BIO' }],
        partner1: 'Gruppo A',
        partner2: 'Gruppo B'
      };

      mockMustache.getValue.mockImplementation((path, ctx) => (ctx ? ctx[path] : undefined));

      const placeholder =
        '{{dynamic_columns[source=condivise,value=sigla,source2=gruppo1,value2=sigla,label2=partner1,source3=gruppo2,value3=sigla,label3=partner2]}}';

      const result = processor._prepareDynamicColumnRequests('Sheet1', 1, 3, placeholder, context);

      const headers = result.valueRequests.slice(1).map((r) => r.values[0][0]);
      expect(headers).toEqual(['MAT', 'ITA', 'Gruppo A', 'FIS', 'Gruppo B', 'CHI', 'BIO']);
      expect(result.layout.columns.map((c) => c.isLabel)).toEqual([
        false,
        false,
        true,
        false,
        true,
        false,
        false
      ]);
      expect(result.protectionRequests).toEqual([]);
    });

    it('keeps single-group behavior byte-identical when no numbered group keys are present (adds layout field)', () => {
      const context = { students: [{ id: 1 }, { id: 2 }] };
      mockMustache.getValue.mockImplementation((path, ctx) => (ctx ? ctx[path] : undefined));

      const placeholder = '{{dynamic_columns[source=students, value=id]}}';
      const result = processor._prepareDynamicColumnRequests('Sheet1', 1, 3, placeholder, context);

      expect(result.valueRequests).toHaveLength(3); // clear + 2 items
      expect(result.protectionRequests).toHaveLength(0);
      expect(result.layout).toEqual({
        sheetName: 'Sheet1',
        headerRow: 1,
        startColumn: 3,
        columns: [
          { header: 1, column: 3, isLabel: false },
          { header: 2, column: 4, isLabel: false }
        ]
      });
    });
  });

  describe('_applyProtections()', () => {
    it('should clean up existing protections before applying new ones', () => {
      const protectionRequests = [
        {
          range: "'Sheet1'!C:C",
          description: '[WTE] Dynamic Column: students',
          editors: { users: ['a@a.com'] }
        }
      ];

      mockSpreadsheetService.getProtectedRanges.mockReturnValue([
        { id: 101, description: '[WTE] Dynamic Column: students' },
        { id: 102, description: 'Other protection' }
      ]);

      processor._applyProtections('sheetId123', protectionRequests);

      // Verify cleanup
      expect(mockSpreadsheetService.deleteProtectedRanges).toHaveBeenCalledWith(
        'sheetId123',
        [101]
      );

      // Verify new application
      expect(mockSpreadsheetService.protectRanges).toHaveBeenCalledWith(
        'sheetId123',
        protectionRequests
      );
    });

    it('should not delete anything if no matching protections found', () => {
      const protectionRequests = [
        {
          range: "'Sheet1'!C:C",
          description: '[WTE] Dynamic Column: students',
          editors: { users: ['a@a.com'] }
        }
      ];

      mockSpreadsheetService.getProtectedRanges.mockReturnValue([
        { id: 102, description: 'Other protection' }
      ]);

      processor._applyProtections('sheetId123', protectionRequests);

      expect(mockSpreadsheetService.deleteProtectedRanges).not.toHaveBeenCalled();
      expect(mockSpreadsheetService.protectRanges).toHaveBeenCalledWith(
        'sheetId123',
        protectionRequests
      );
    });
  });

  describe('process() Integration', () => {
    it('should coordinate value updates and protections', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1', id: 1 }]);
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['{{dynamic_columns[source=s, value=v, acl=a]}}']
      ]);
      mockSpreadsheetService.getProtectedRanges.mockReturnValue([]);

      const context = {
        s: [{ v: 'Col1', a: 'user@test.com' }]
      };

      // Mock getValue for our context structure
      mockMustache.getValue.mockImplementation((path, context) => context[path]);

      processor.process('sheetId123', context, null);

      // Verify values updated
      expect(mockSpreadsheetService.updateRanges).toHaveBeenCalled();

      // Verify protections applied
      expect(mockSpreadsheetService.protectRanges).toHaveBeenCalledWith(
        'sheetId123',
        expect.arrayContaining([
          expect.objectContaining({
            range: "'Sheet1'!A:A",
            description: '[WTE] Dynamic Column: s'
          })
        ])
      );
    });
  });
});
