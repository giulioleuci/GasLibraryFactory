/**
 * @fileoverview Tests for SheetProcessor dynamic_columns expansion
 * @author GasLibraryFactory
 */

import { SheetProcessor } from '../SheetProcessor.js';

describe('SheetProcessor - Dynamic Columns Tests', () => {
  let processor: InstanceType<typeof SheetProcessor>;
  let mockPlaceholderService: ReturnType<typeof createMockPlaceholderService>;
  function createMockPlaceholderService() {
    return {
      mustache: mockMustache,
      logger: mockLogger
    };
  }

  let mockSpreadsheetService: ReturnType<typeof createMockSpreadsheetService>;
  function createMockSpreadsheetService() {
    return {
      getSheetInfo: jest.fn(),
      getRanges: jest.fn(),
      updateRanges: jest.fn(),
      expandSheetGrid: jest.fn(),
      getProtectedRanges: jest.fn(),
      deleteProtectedRanges: jest.fn(),
      protectRanges: jest.fn()
    };
  }

  let mockMustache: ReturnType<typeof createMockMustache>;
  function createMockMustache() {
    return {
      renderSegments: jest.fn(() => []),
      _lookupValue: jest.fn(),
      render: jest.fn((template: string, context: object | null = {}) => {
        return template.replace(
          /{{(\w+)}}/g,
          (match: string, key: string) => (context as Record<string, string>)[key] || match
        );
      }),
      getValue: jest.fn((path: string, context: unknown): unknown => {
        if (!context) {
          return undefined;
        }
        return (context as Record<string, string>)[path];
      })
    };
  }

  let mockLogger: ReturnType<typeof createMockLogger>;
  function createMockLogger() {
    return {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  }

  beforeEach(() => {
    // Mock logger
    mockLogger = createMockLogger();

    // Mock Mustache
    mockMustache = createMockMustache();

    // Mock SpreadsheetService
    mockSpreadsheetService = createMockSpreadsheetService();

    // Mock PlaceholderService
    mockPlaceholderService = createMockPlaceholderService();

    // Create processor instance
    processor = new SheetProcessor(mockPlaceholderService);

    // Replace spreadsheetService with mock
    Object.assign(processor, { spreadsheetService: mockSpreadsheetService });
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
      mockMustache.getValue.mockImplementation(
        (path: string, context: unknown) => (context as Record<string, string>)[path]
      );

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
      mockMustache.getValue.mockImplementation(
        (path: string, context: unknown) => (context as Record<string, string>)[path]
      );

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
      mockMustache.getValue.mockImplementation(
        (path: string, context: unknown) => (context as Record<string, string>)[path]
      );

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

      mockMustache.getValue.mockImplementation((path: string, ctx) =>
        ctx ? (ctx as Record<string, unknown>)[path] : undefined
      );

      const placeholder =
        '{{dynamic_columns[source=condivise,value=sigla,source2=gruppo1,value2=sigla,label2=partner1,source3=gruppo2,value3=sigla,label3=partner2]}}';

      const result = processor._prepareDynamicColumnRequests('Sheet1', 1, 3, placeholder, context);

      const headers = result.valueRequests.slice(1).map((r) => r.values[0][0]);
      expect(headers).toEqual(['MAT', 'ITA', 'Gruppo A', 'FIS', 'Gruppo B', 'CHI', 'BIO']);
      expect(result.layout!.columns.map((c) => c.isLabel)).toEqual([
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
      mockMustache.getValue.mockImplementation((path: string, ctx) =>
        ctx ? (ctx as Record<string, unknown>)[path] : undefined
      );

      const placeholder = '{{dynamic_columns[source=students, value=id]}}';
      const result = processor._prepareDynamicColumnRequests('Sheet1', 1, 3, placeholder, context);

      expect(result.valueRequests).toHaveLength(3); // clear + 2 items
      expect(result.protectionRequests).toHaveLength(0);
      expect(result.layout).toEqual({
        sheetName: 'Sheet1',
        headerRow: 1,
        startColumn: 3,
        columns: [
          { header: 1, column: 3, isLabel: false, item: { id: 1 } },
          { header: 2, column: 4, isLabel: false, item: { id: 2 } }
        ]
      });
    });

    // REPORT_GLF.md B5: `item` lets a caller correlate a rendered column back
    // to its own business key without reconstructing item order positionally.
    it('carries the raw source item on each data column, and null on label columns', () => {
      const context = {
        shared: [{ sigla: 'MAT' }],
        groupB: [{ sigla: 'FIS' }],
        partnerLabel: 'Gruppo B'
      };
      mockMustache.getValue.mockImplementation((path: string, ctx) => {
        if (path === 'header') {
          return (ctx as { sigla: string }).sigla;
        }
        return ctx ? (ctx as Record<string, unknown>)[path] : undefined;
      });

      const placeholder =
        '{{dynamic_columns[source=shared, value=header, source2=groupB, value2=header, label2=partnerLabel]}}';
      const result = processor._prepareDynamicColumnRequests('Sheet1', 1, 3, placeholder, context);

      expect(result.layout!.columns).toEqual([
        { header: 'MAT', column: 3, isLabel: false, item: { sigla: 'MAT' } },
        { header: 'Gruppo B', column: 4, isLabel: true, item: null },
        { header: 'FIS', column: 5, isLabel: false, item: { sigla: 'FIS' } }
      ]);
      // The business key is directly readable — no positional reconstruction needed.
      expect(
        result
          .layout!.columns.filter((c) => !c.isLabel)
          .map((c) => (c.item as { sigla: string }).sigla)
      ).toEqual(['MAT', 'FIS']);
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
      mockMustache.getValue.mockImplementation(
        (path: string, context: unknown) => (context as Record<string, string>)[path]
      );

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
