/**
 * @fileoverview Tests for DocumentProcessor class (Reverse-Order Strategy)
 * @author GasLibraryFactory
 */

import { DocumentProcessor } from '../DocumentProcessor.js';

// Mock _MustacheContext class used internally by DocumentProcessor
class _MustacheContext {
  constructor(view) {
    this.view = view;
  }
}
global._MustacheContext = _MustacheContext;

describe('DocumentProcessor - Core Functionality Tests (Reverse-Order Strategy)', () => {
  let processor;
  let mockPlaceholderService;
  let mockDocumentService;
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
        // Simple mock implementation
        return template.replace(/{{(\w+)}}/g, (match, key) => context[key] || match);
      }),
      getValue: jest.fn((path, context) => {
        const parts = path.split('.');
        let result = context;
        for (const part of parts) {
          if (result == null) {
            return undefined;
          }
          result = result[part];
        }
        return result;
      }),
      _lookupValue: jest.fn((token, context) => {
        const path = token[1];
        return mockMustache.getValue(path, context.view);
      })
    };

    // Mock DocumentService
    mockDocumentService = {
      scanDocumentStructure: jest.fn(() => ({
        tables: [],
        textMatches: []
      })),
      _executeBatchUpdate: jest.fn(),
      // Standard API methods for table operations
      getTableRow: jest.fn((docId, tableIndex, rowIndex) => ({
        rowIndex,
        cells: ['{{#tablerow_loop:items}}', '{{name}}', '{{value}}']
      })),
      getTableData: jest.fn((docId, tableIndex) => ({
        tableIndex,
        numRows: 2,
        numColumns: 3,
        data: [
          ['Header1', 'Header2', 'Header3'],
          ['Data1', 'Data2', 'Data3']
        ]
      })),
      insertTableRow: jest.fn(() => ({ success: true })),
      deleteTableRow: jest.fn(() => ({ success: true })),
      updateTableCell: jest.fn(() => ({ success: true })),
      // Column manipulation methods
      insertTableColumn: jest.fn(() => ({ success: true, affectedRows: 2 })),
      deleteTableColumn: jest.fn(() => ({ success: true, affectedRows: 2 })),
      appendTableColumn: jest.fn(() => ({ success: true, affectedRows: 2 }))
    };

    // Mock PlaceholderService
    mockPlaceholderService = {
      mustache: mockMustache,
      logger: mockLogger
    };

    // Create processor instance
    processor = new DocumentProcessor(mockPlaceholderService);

    // Replace documentService with mock
    processor.documentService = mockDocumentService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with default options', () => {
      expect(processor).toBeInstanceOf(DocumentProcessor);
      expect(processor.mustache).toBe(mockMustache);
      expect(processor.logger).toBe(mockLogger);
      expect(processor.strictFilters).toBe(false);
    });

    it('should set security limits', () => {
      expect(processor.MAX_TEMPLATE_SIZE).toBe(1000000);
      expect(processor.MAX_NESTING_DEPTH).toBe(100);
      expect(processor.MAX_ITERATIONS).toBe(10000);
      expect(processor.MAX_TEMPLATE_MATCH_SIZE).toBe(100000);
    });

    it('should accept strictFilters option', () => {
      const strictProcessor = new DocumentProcessor(mockPlaceholderService, {
        strictFilters: true
      });

      expect(strictProcessor.strictFilters).toBe(true);
    });

    it('should initialize recursion depth tracker', () => {
      expect(processor._currentDepth).toBe(0);
    });
  });

  // ===================================================================
  // process() Method Tests
  // ===================================================================
  describe('process() Method', () => {
    it('should process document with no operations', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: []
      });

      processor.process('doc123', {});

      expect(mockDocumentService.scanDocumentStructure).toHaveBeenCalledWith('doc123', ['{{']);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting document processing with Reverse-Order Strategy for document: doc123'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });

    it('should collect and execute operations in reverse order', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [
          {
            elementIndex: 10,
            text: 'Hello {{name}}',
            type: 'TEXT'
          }
        ]
      });

      mockMustache.render.mockReturnValue('Hello World');

      processor.process('doc123', { name: 'World' });

      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalled();
      const calls = mockDocumentService._executeBatchUpdate.mock.calls;
      expect(calls[0][0]).toBe('doc123');
      expect(calls[0][1]).toBeInstanceOf(Array);
      expect(calls[0][1].length).toBeGreaterThan(0);
    });

    it('should process tables with column loops', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [
          {
            index: 10,
            rows: [
              {
                index: 15,
                cells: [
                  {
                    index: 20,
                    text: '{{#tablecol_loop:items}}{{name}}'
                  }
                ]
              }
            ]
          }
        ],
        textMatches: []
      });

      mockMustache._lookupValue.mockReturnValue([{ name: 'Item 1' }, { name: 'Item 2' }]);

      processor.process('doc123', { items: [{ name: 'Item 1' }, { name: 'Item 2' }] });

      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // _analyzeColumnLoops() Tests
  // ===================================================================
  describe('_analyzeColumnLoops()', () => {
    it('should return empty array for table with no rows', () => {
      const mockTable = {
        index: 10,
        rows: []
      };

      const result = processor._analyzeColumnLoops(mockTable, {});

      expect(result).toEqual([]);
    });

    it('should detect column loop markers', () => {
      const mockTable = {
        index: 10,
        rows: [
          {
            index: 15,
            cells: [
              {
                index: 20,
                text: '{{#tablecol_loop:items}}{{name}}'
              }
            ]
          }
        ]
      };

      mockMustache._lookupValue.mockReturnValue([{ name: 'Test' }]);

      const result = processor._analyzeColumnLoops(mockTable, { items: [{ name: 'Test' }] });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('columnLoop');
      expect(result[0].dataArray).toEqual([{ name: 'Test' }]);
    });

    it('should warn if data is not an array', () => {
      const mockTable = {
        index: 10,
        rows: [
          {
            index: 15,
            cells: [
              {
                index: 20,
                text: '{{#tablecol_loop:notAnArray}}content'
              }
            ]
          }
        ]
      };

      mockMustache._lookupValue.mockReturnValue('not an array');

      const result = processor._analyzeColumnLoops(mockTable, { notAnArray: 'string' });

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // _analyzeRowLoops() Tests
  // ===================================================================
  describe('_analyzeRowLoops()', () => {
    it('should detect row loop markers', () => {
      const mockTable = {
        index: 10,
        rows: [
          {
            index: 20,
            cells: [
              {
                index: 25,
                text: '{{#tablerow_loop:items}}'
              }
            ]
          }
        ]
      };

      mockMustache._lookupValue.mockReturnValue([{ id: 1 }, { id: 2 }]);

      const result = processor._analyzeRowLoops(mockTable, { items: [{ id: 1 }, { id: 2 }] });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('rowLoop');
      expect(result[0].dataArray).toHaveLength(2);
    });

    it('should create deleteRow operation when data is not an array', () => {
      const mockTable = {
        index: 10,
        rows: [
          {
            index: 20,
            cells: [
              {
                index: 25,
                text: '{{#tablerow_loop:notAnArray}}'
              }
            ]
          }
        ]
      };

      mockMustache._lookupValue.mockReturnValue('not an array');

      const result = processor._analyzeRowLoops(mockTable, {});

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('deleteRow');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw error if row count exceeds MAX_ITERATIONS', () => {
      const mockTable = {
        index: 10,
        rows: [
          {
            index: 20,
            cells: [
              {
                index: 25,
                text: '{{#tablerow_loop:items}}'
              }
            ]
          }
        ]
      };

      const tooManyItems = Array(processor.MAX_ITERATIONS + 1).fill({ id: 1 });
      mockMustache._lookupValue.mockReturnValue(tooManyItems);

      expect(() => {
        processor._analyzeRowLoops(mockTable, { items: tooManyItems });
      }).toThrow(/exceeds maximum allowed/);
    });
  });

  // ===================================================================
  // _analyzeListLoops() Tests
  // ===================================================================
  describe('_analyzeListLoops()', () => {
    it('should return empty array when no list templates found', () => {
      const textMatches = [];

      const result = processor._analyzeListLoops(textMatches, {});

      expect(result).toEqual([]);
    });

    it('should detect bullet list templates', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: '{{#bullet_list:items}}{{name}}{{/bullet_list}}',
          type: 'TEXT'
        }
      ];

      mockMustache.getValue.mockReturnValue([{ name: 'Item 1' }, { name: 'Item 2' }]);

      const result = processor._analyzeListLoops(textMatches, { items: [{ name: 'Item 1' }] });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('listLoop');
      expect(result[0].listType).toBe('bullet');
    });

    it('should detect number list templates', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: '{{#number_list:items}}{{name}}{{/number_list}}',
          type: 'TEXT'
        }
      ];

      mockMustache.getValue.mockReturnValue([{ name: 'Item 1' }]);

      const result = processor._analyzeListLoops(textMatches, { items: [{ name: 'Item 1' }] });

      expect(result[0].listType).toBe('number');
    });

    it('should skip text without list loop patterns', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: 'Regular text {{placeholder}}',
          type: 'TEXT'
        }
      ];

      const result = processor._analyzeListLoops(textMatches, {});

      expect(result).toEqual([]);
    });

    it('should throw error if template text exceeds MAX_TEMPLATE_MATCH_SIZE', () => {
      const longText =
        '{{#bullet_list:items}}test{{/bullet_list}}' +
        'x'.repeat(processor.MAX_TEMPLATE_MATCH_SIZE);

      const textMatches = [
        {
          elementIndex: 10,
          text: longText,
          type: 'TEXT'
        }
      ];

      expect(() => {
        processor._analyzeListLoops(textMatches, {});
      }).toThrow(/Template text size.*exceeds maximum/);
    });
  });

  // ===================================================================
  // _analyzeTextSubstitutions() Tests
  // ===================================================================
  describe('_analyzeTextSubstitutions()', () => {
    it('should detect simple placeholders', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: 'Hello {{name}}',
          type: 'TEXT'
        }
      ];

      mockMustache.render.mockReturnValue('Hello World');

      const result = processor._analyzeTextSubstitutions(textMatches, { name: 'World' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('textSubstitution');
      expect(result[0].newText).toBe('Hello World');
    });

    it('should skip template control structures', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: '{{#tablerow_loop:items}}content{{/tablerow_loop}}',
          type: 'TEXT'
        }
      ];

      const result = processor._analyzeTextSubstitutions(textMatches, {});

      expect(result).toEqual([]);
    });

    it('should insert zero-width space for empty substitutions', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: '{{empty}}',
          type: 'TEXT'
        }
      ];

      mockMustache.render.mockReturnValue('');

      const result = processor._analyzeTextSubstitutions(textMatches, { empty: '' });

      expect(result[0].newText).toBe('\u200B');
    });

    it('should skip non-TEXT type elements', () => {
      const textMatches = [
        {
          elementIndex: 10,
          text: 'Some {{placeholder}}',
          type: 'PARAGRAPH'
        }
      ];

      const result = processor._analyzeTextSubstitutions(textMatches, {});

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // _parseExpression() Helper Tests
  // ===================================================================
  describe('_parseExpression() Helper', () => {
    it('should parse simple path without filters', () => {
      const result = processor._parseExpression('items');

      expect(result).toEqual({
        path: 'items',
        filters: []
      });
    });

    it('should parse path with single filter', () => {
      const result = processor._parseExpression('items | sortBy:name');

      expect(result).toEqual({
        path: 'items',
        filters: [{ name: 'sortBy', args: ['name'] }]
      });
    });

    it('should parse path with multiple filters', () => {
      const result = processor._parseExpression('items | sortBy:name | limit:5');

      expect(result.path).toBe('items');
      expect(result.filters).toHaveLength(2);
      expect(result.filters[0]).toEqual({ name: 'sortBy', args: ['name'] });
      expect(result.filters[1]).toEqual({ name: 'limit', args: [5] }); // Numbers are parsed as numbers
    });

    it('should handle filter without arguments', () => {
      const result = processor._parseExpression('items | reverse');

      expect(result.filters[0]).toEqual({ name: 'reverse', args: [] });
    });

    it('should handle null expression', () => {
      const result = processor._parseExpression(null);

      expect(result).toEqual({ path: '', filters: [] });
    });
  });

  // ===================================================================
  // _parseFilterArgs() Tests
  // ===================================================================
  describe('_parseFilterArgs()', () => {
    it('should parse single argument', () => {
      const result = processor._parseFilterArgs('name');

      expect(result).toEqual(['name']);
    });

    it('should parse multiple arguments', () => {
      const result = processor._parseFilterArgs('name,value');

      expect(result).toEqual(['name', 'value']);
    });

    it('should parse quoted strings', () => {
      const result = processor._parseFilterArgs('"first name","last name"');

      expect(result).toEqual(['first name', 'last name']);
    });

    it('should parse numbers', () => {
      const result = processor._parseFilterArgs('5,10.5');

      expect(result).toEqual([5, 10.5]);
    });

    it('should parse booleans', () => {
      const result = processor._parseFilterArgs('true,false');

      expect(result).toEqual([true, false]);
    });

    it('should handle empty string', () => {
      const result = processor._parseFilterArgs('');

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // _applyFilters() Tests
  // ===================================================================
  describe('_applyFilters()', () => {
    it('should return array unchanged if no filters', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = processor._applyFilters(data, []);

      expect(result).toEqual(data);
    });

    it('should apply sortBy filter', () => {
      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      const filters = [{ name: 'sortBy', args: ['name'] }];

      const result = processor._applyFilters(data, filters);

      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });

    it('should apply reverse filter', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const filters = [{ name: 'reverse', args: [] }];

      const result = processor._applyFilters(data, filters);

      expect(result[0].id).toBe(3);
      expect(result[2].id).toBe(1);
    });

    it('should apply limit filter', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const filters = [{ name: 'limit', args: ['2'] }];

      const result = processor._applyFilters(data, filters);

      expect(result).toHaveLength(2);
    });

    it('should apply filter by property', () => {
      const data = [
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
        { name: 'Charlie', active: true }
      ];
      const filters = [{ name: 'filter', args: ['active', true] }];

      const result = processor._applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Charlie');
    });

    it('should warn for unknown filter in non-strict mode', () => {
      const data = [{ id: 1 }];
      const filters = [{ name: 'unknownFilter', args: [] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'unknownFilter' not supported")
      );
      expect(result).toEqual(data);
    });

    it('should throw for unknown filter in strict mode', () => {
      processor.strictFilters = true;
      const data = [{ id: 1 }];
      const filters = [{ name: 'unknownFilter', args: [] }];

      expect(() => {
        processor._applyFilters(data, filters);
      }).toThrow("Filter 'unknownFilter' not supported");
    });
  });

  // ===================================================================
  // Integration Scenarios
  // ===================================================================
  describe('Integration Scenarios', () => {
    it('should handle complete document processing workflow', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [
          {
            elementIndex: 10,
            text: 'Hello {{name}}',
            type: 'TEXT'
          }
        ]
      });

      mockMustache.render.mockReturnValue('Hello World');

      processor.process('doc123', { name: 'World' });

      expect(mockDocumentService.scanDocumentStructure).toHaveBeenCalledWith('doc123', ['{{']);
      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Batch update completed successfully');
    });

    it('should respect all security limits', () => {
      expect(processor.MAX_TEMPLATE_SIZE).toBeGreaterThan(0);
      expect(processor.MAX_NESTING_DEPTH).toBeGreaterThan(0);
      expect(processor.MAX_ITERATIONS).toBeGreaterThan(0);
      expect(processor.MAX_TEMPLATE_MATCH_SIZE).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // _executeRowLoopOperation() Tests (Standard API)
  // ===================================================================
  describe('_executeRowLoopOperation()', () => {
    it('should execute row loop using DocumentService standard API methods', () => {
      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [
          { name: 'Alice', value: '100' },
          { name: 'Bob', value: '200' }
        ]
      };

      mockMustache.render.mockImplementation((template, data) => {
        return template.replace('{{name}}', data.name).replace('{{value}}', data.value);
      });

      processor._executeRowLoopOperation('doc123', operation);

      // Should get template row
      expect(mockDocumentService.getTableRow).toHaveBeenCalledWith('doc123', 0, 1);

      // Should insert rows in reverse order (2 items)
      expect(mockDocumentService.insertTableRow).toHaveBeenCalledTimes(2);

      // Should delete template row
      expect(mockDocumentService.deleteTableRow).toHaveBeenCalledWith('doc123', 0, 1);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Executing row loop: 2 items')
      );
    });

    it('should warn if template row cannot be retrieved', () => {
      mockDocumentService.getTableRow.mockReturnValue(null);

      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice' }]
      };

      processor._executeRowLoopOperation('doc123', operation);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not get template row data')
      );
      expect(mockDocumentService.insertTableRow).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      mockDocumentService.getTableRow.mockImplementation(() => {
        throw new Error('Access denied');
      });

      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice' }]
      };

      expect(() => {
        processor._executeRowLoopOperation('doc123', operation);
      }).toThrow('Access denied');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to execute row loop')
      );
    });

    it('should process cell templates correctly', () => {
      mockDocumentService.getTableRow.mockReturnValue({
        rowIndex: 1,
        cells: ['{{#tablerow_loop:items}}{{id}}', '{{name}}', '{{score}}']
      });

      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ id: '1', name: 'Test', score: '95' }]
      };

      mockMustache.render.mockImplementation((template, data) => {
        return template
          .replace('{{id}}', data.id || '')
          .replace('{{name}}', data.name || '')
          .replace('{{score}}', data.score || '');
      });

      processor._executeRowLoopOperation('doc123', operation);

      // First cell template should have control marker removed
      expect(mockDocumentService.insertTableRow).toHaveBeenCalledWith(
        'doc123',
        0,
        2, // rowIndex + 1
        expect.any(Array)
      );
    });
  });

  // ===================================================================
  // _executeColumnLoopOperation() Tests (Standard API)
  // ===================================================================
  describe('_executeColumnLoopOperation()', () => {
    it('should execute column loop using DocumentService standard API methods', () => {
      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [{ name: 'January' }, { name: 'February' }],
        templateContent: '{{name}}{{/tablecol_loop}}'
      };

      mockMustache.render.mockReturnValue('January');

      processor._executeColumnLoopOperation('doc123', operation);

      // Should get table data
      expect(mockDocumentService.getTableData).toHaveBeenCalledWith('doc123', 0);

      // Should update the header cell with first item
      expect(mockDocumentService.updateTableCell).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        1,
        'January'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Executing column loop: 2 items')
      );
    });

    it('should clear cell when dataArray is empty', () => {
      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [],
        templateContent: '{{name}}{{/tablecol_loop}}'
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockDocumentService.updateTableCell).toHaveBeenCalledWith('doc123', 0, 0, 1, '');
    });

    it('should insert additional columns for multiple items', () => {
      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [{ name: 'Jan' }, { name: 'Feb' }, { name: 'Mar' }],
        templateContent: '{{name}}{{/tablecol_loop}}'
      };

      mockMustache.render.mockReturnValue('Rendered');

      processor._executeColumnLoopOperation('doc123', operation);

      // Should update the first cell
      expect(mockDocumentService.updateTableCell).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        1,
        'Rendered'
      );

      // Should insert 2 additional columns (for Feb and Mar)
      expect(mockDocumentService.insertTableColumn).toHaveBeenCalledTimes(2);

      // First insertion at column 2 (cellIndex + 1)
      expect(mockDocumentService.insertTableColumn).toHaveBeenCalledWith(
        'doc123',
        0,
        2,
        expect.any(Array)
      );

      // Second insertion at column 3 (cellIndex + 2)
      expect(mockDocumentService.insertTableColumn).toHaveBeenCalledWith(
        'doc123',
        0,
        3,
        expect.any(Array)
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Inserted 2 additional columns')
      );
    });

    it('should render the full column (every row) for each data item', () => {
      // Two-row table: header carries the loop marker, second row carries {{value}}.
      mockDocumentService.getTableData.mockReturnValueOnce({
        tableIndex: 0,
        numRows: 2,
        numColumns: 2,
        data: [
          ['Fixed', '{{#tablecol_loop:months}}{{label}}{{/tablecol_loop}}'],
          ['Monthly total', '{{value}}']
        ]
      });
      mockMustache.render.mockImplementation((tpl, item) =>
        tpl.replace('{{label}}', item.label).replace('{{value}}', String(item.value))
      );

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [
          { label: 'Jan', value: 1000 },
          { label: 'Feb', value: 1200 },
          { label: 'Mar', value: 900 }
        ],
        templateContent: '{{label}}{{/tablecol_loop}}'
      };

      processor._executeColumnLoopOperation('doc123', operation);

      // Original column: header row + value row both rendered for the first item.
      expect(mockDocumentService.updateTableCell).toHaveBeenCalledWith('doc123', 0, 0, 1, 'Jan');
      expect(mockDocumentService.updateTableCell).toHaveBeenCalledWith('doc123', 0, 1, 1, '1000');

      // Inserted columns carry the value row, not an empty string.
      expect(mockDocumentService.insertTableColumn).toHaveBeenCalledWith('doc123', 0, 2, [
        'Feb',
        '1200'
      ]);
      expect(mockDocumentService.insertTableColumn).toHaveBeenCalledWith('doc123', 0, 3, [
        'Mar',
        '900'
      ]);
    });

    it('should warn if table data cannot be retrieved', () => {
      mockDocumentService.getTableData.mockReturnValue(null);

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [{ name: 'Test' }],
        templateContent: '{{name}}'
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not get table data')
      );
    });

    it('should handle errors gracefully', () => {
      mockDocumentService.getTableData.mockImplementation(() => {
        throw new Error('Table not found');
      });

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 1,
        dataArray: [{ name: 'Test' }],
        templateContent: '{{name}}'
      };

      expect(() => {
        processor._executeColumnLoopOperation('doc123', operation);
      }).toThrow('Table not found');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to execute column loop')
      );
    });
  });

  // ===================================================================
  // process() with Table Operations (Standard API Integration)
  // ===================================================================
  describe('process() with Standard API Table Operations', () => {
    it('should execute row loop operations using Standard API', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [
          {
            index: 10,
            rows: [
              {
                index: 20,
                cells: [{ index: 25, text: '{{#tablerow_loop:students}}' }]
              }
            ]
          }
        ],
        textMatches: []
      });

      mockMustache._lookupValue.mockReturnValue([{ name: 'Alice' }, { name: 'Bob' }]);

      processor.process('doc123', { students: [{ name: 'Alice' }, { name: 'Bob' }] });

      // Row loop should use Standard API methods
      expect(mockDocumentService.getTableRow).toHaveBeenCalled();
      expect(mockDocumentService.insertTableRow).toHaveBeenCalled();
      expect(mockDocumentService.deleteTableRow).toHaveBeenCalled();

      // No batch update for table operations (they're executed immediately)
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });

    it('should execute column loop operations using Standard API', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [
          {
            index: 10,
            rows: [
              {
                index: 15,
                cells: [
                  {
                    index: 20,
                    text: '{{#tablecol_loop:months}}{{name}}{{/tablecol_loop}}'
                  }
                ]
              }
            ]
          }
        ],
        textMatches: []
      });

      mockMustache._lookupValue.mockReturnValue([{ name: 'January' }, { name: 'February' }]);

      processor.process('doc123', { months: [{ name: 'January' }] });

      // Column loop should use Standard API methods
      expect(mockDocumentService.getTableData).toHaveBeenCalled();
      expect(mockDocumentService.updateTableCell).toHaveBeenCalled();
    });

    it('should handle mixed operations (table + text)', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [
          {
            index: 10,
            rows: [
              {
                index: 20,
                cells: [{ index: 25, text: '{{#tablerow_loop:items}}' }]
              }
            ]
          }
        ],
        textMatches: [
          {
            elementIndex: 100,
            text: 'Title: {{title}}',
            type: 'TEXT'
          }
        ]
      });

      mockMustache._lookupValue.mockReturnValue([{ name: 'Item 1' }]);
      mockMustache.render.mockReturnValue('Title: My Document');

      processor.process('doc123', { items: [{ name: 'Item 1' }], title: 'My Document' });

      // Table operations use Standard API
      expect(mockDocumentService.getTableRow).toHaveBeenCalled();

      // Text operations use batch update
      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalled();
    });

    it("should not re-substitute a row-looped table's own cells even if the post-flush rescan is stale", () => {
      // scanDocumentStructure returns the SAME snapshot on every call (default
      // jest mockReturnValue behavior) — simulating the Advanced Docs API not
      // yet observing the native DocumentApp row-loop mutations. The table's
      // other cells (columns 1/2, never touched by _analyzeRowLoops itself)
      // still read as unresolved `{{...}}` placeholders in that stale snapshot.
      // Without the tableIndex-based exclusion, these would be picked up by
      // the generic substitution pass, evaluated against the wrong (root)
      // context, and blanked to a zero-width space — silently corrupting the
      // real, already-rendered row-loop output.
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [
          {
            index: 0,
            rows: [
              { index: 0, cells: [{ index: 0, text: 'Header' }] },
              {
                index: 1,
                cells: [
                  { index: 1000, text: '{{#tablerow_loop:items}}{{name}}' },
                  { index: 1001, text: '{{score}}' }
                ]
              }
            ]
          }
        ],
        textMatches: [{ elementIndex: 1001, text: '{{score}}', type: 'TABLE_TEXT', tableIndex: 0 }]
      });

      mockMustache._lookupValue.mockReturnValue([{ name: 'Alice', score: '95' }]);
      mockDocumentService.getTableRow.mockReturnValue({
        rowIndex: 1,
        cells: ['{{#tablerow_loop:items}}{{name}}', '{{score}}']
      });
      // Real Mustache resolves an unknown path to '' (not the literal
      // template text) — reproduce that so a leaked TABLE_TEXT match against
      // the root context (which has no top-level `score`) actually triggers
      // the blanking bug this test guards against, instead of being a no-op
      // because the naive default mock leaves unresolved placeholders as-is.
      mockMustache.render.mockImplementation((template, data) =>
        template.replace(/{{(\w+)}}/g, (match, key) =>
          data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : ''
        )
      );

      processor.process('doc123', { items: [{ name: 'Alice', score: '95' }] });

      expect(mockDocumentService.insertTableRow).toHaveBeenCalled();
      // The stale TABLE_TEXT match belongs to the already row-looped table
      // (tableIndex 0) and must be excluded — no batch corruption request.
      expect(mockDocumentService._executeBatchUpdate).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });
  });
});
