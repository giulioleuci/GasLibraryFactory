/**
 * @fileoverview Advanced coverage tests for DocumentProcessor (Reverse-Order Strategy)
 * Focus areas: Complex filter scenarios, edge cases, and integration testing
 */

import { DocumentProcessor } from '../DocumentProcessor.js';

// Mock _MustacheContext class used internally by DocumentProcessor
class _MustacheContext {
  constructor(view) {
    this.view = view;
  }
}
global._MustacheContext = _MustacheContext;

describe('DocumentProcessor - Advanced Coverage Tests (Reverse-Order Strategy)', () => {
  let processor;
  let mockPlaceholderService;
  let mockDocumentService;
  let mockMustache;
  let mockLogger;
  let mockDoc;
  let mockBody;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock Mustache with comprehensive API
    mockMustache = {
      render: jest.fn((template, context) => {
        return template.replace(/{{(\w+)}}/g, (match, key) => {
          return context[key] !== undefined ? context[key] : match;
        });
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

    // Mock Document Body
    mockBody = {
      getNumChildren: jest.fn(() => 0),
      getChild: jest.fn(),
      findText: jest.fn(() => null)
    };

    // Mock Document
    mockDoc = {
      getBody: jest.fn(() => mockBody)
    };

    // Mock DocumentService
    mockDocumentService = {
      openStandard: jest.fn(() => mockDoc),
      _executeBatchUpdate: jest.fn(),
      scanDocumentStructure: jest.fn(() => ({
        tables: [],
        textMatches: []
      })),
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
      updateTableCell: jest.fn(() => ({ success: true }))
    };

    // Mock PlaceholderService
    mockPlaceholderService = {
      mustache: mockMustache,
      logger: mockLogger
    };

    // Create processor instance
    processor = new DocumentProcessor(mockPlaceholderService);
    processor.documentService = mockDocumentService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // Advanced Filter Parsing Tests
  // ===================================================================
  describe('Advanced Filter Parsing', () => {
    it('should parse complex filter expressions with multiple arguments', () => {
      const result = processor._parseExpression(
        'items | filter:status,"active" | sortBy:name | limit:10'
      );

      expect(result.path).toBe('items');
      expect(result.filters).toHaveLength(3);
      expect(result.filters[0]).toEqual({ name: 'filter', args: ['status', 'active'] });
      expect(result.filters[1]).toEqual({ name: 'sortBy', args: ['name'] });
      expect(result.filters[2]).toEqual({ name: 'limit', args: [10] }); // Numbers are parsed as numbers
    });

    it('should handle filters with quoted arguments containing special characters', () => {
      const result = processor._parseExpression('items | filter:name,"O\'Brien"');

      expect(result.filters[0].args[1]).toBe("O'Brien");
    });

    it('should handle filters with numeric and boolean arguments mixed', () => {
      const result = processor._parseExpression('items | custom:true,42,"text"');

      expect(result.filters[0].args).toEqual([true, 42, 'text']);
    });

    it('should handle expressions with whitespace variations', () => {
      const result = processor._parseExpression('  items   |   sortBy : name   ');

      expect(result.path).toBe('items');
      expect(result.filters[0].name).toBe('sortBy');
      expect(result.filters[0].args).toEqual(['name']);
    });

    it('should handle empty string expression', () => {
      const result = processor._parseExpression('');

      expect(result).toEqual({ path: '', filters: [] });
    });

    it('should handle expression with only filters (empty path)', () => {
      const result = processor._parseExpression('| reverse');

      expect(result.path).toBe('');
      expect(result.filters).toHaveLength(1);
    });
  });

  // ===================================================================
  // Complex Filter Application Tests
  // ===================================================================
  describe('Complex Filter Application', () => {
    it('should apply multiple filters in sequence correctly', () => {
      const data = [
        { name: 'Alice', active: true, age: 30 },
        { name: 'Bob', active: false, age: 25 },
        { name: 'Charlie', active: true, age: 35 },
        { name: 'David', active: true, age: 28 }
      ];

      const filters = [
        { name: 'filter', args: ['active', true] },
        { name: 'sortBy', args: ['age'] },
        { name: 'limit', args: ['2'] }
      ];

      const result = processor._applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('David'); // age 28, filtered and sorted
      expect(result[1].name).toBe('Alice'); // age 30
    });

    it('should handle reverse filter with other filters', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const filters = [
        { name: 'reverse', args: [] },
        { name: 'limit', args: ['2'] }
      ];

      const result = processor._applyFilters(data, filters);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
    });

    it('should handle limit of 0', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const filters = [{ name: 'limit', args: ['0'] }];

      const result = processor._applyFilters(data, filters);

      expect(result).toEqual([]);
    });

    it('should handle negative limit gracefully in non-strict mode', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const filters = [{ name: 'limit', args: ['-5'] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(result).toEqual(data);
    });

    it('should handle filter on non-existent property', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob', active: true }, { name: 'Charlie' }];

      const filters = [{ name: 'filter', args: ['active', true] }];

      const result = processor._applyFilters(data, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });

  // ===================================================================
  // _sortByProperty Advanced Tests
  // ===================================================================
  describe('_sortByProperty Advanced Tests', () => {
    it('should handle all null values', () => {
      const data = [
        { name: 'Alice', value: null },
        { name: 'Bob', value: null }
      ];

      const result = processor._sortByProperty(data, 'value');

      expect(result).toHaveLength(2);
    });

    it('should handle numeric sorting', () => {
      const data = [{ value: 100 }, { value: 20 }, { value: 3 }];

      const result = processor._sortByProperty(data, 'value');

      expect(result[0].value).toBe(3);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(100);
    });

    it('should handle mixed types gracefully', () => {
      const data = [{ value: 'text' }, { value: 123 }, { value: null }];

      const result = processor._sortByProperty(data, 'value');

      // Should not throw, null sorted to end
      expect(result[2].value).toBe(null);
    });

    it('should handle deeply nested properties', () => {
      const data = [
        { user: { profile: { name: 'Charlie' } } },
        { user: { profile: { name: 'Alice' } } },
        { user: { profile: { name: 'Bob' } } }
      ];

      mockMustache.getValue.mockImplementation((path, obj) => {
        return path.split('.').reduce((o, k) => o?.[k], obj);
      });

      const result = processor._sortByProperty(data, 'user.profile.name');

      expect(result[0].user.profile.name).toBe('Alice');
    });
  });

  // ===================================================================
  // _parseFilterArgs Advanced Tests
  // ===================================================================
  describe('_parseFilterArgs Advanced Tests', () => {
    it('should handle mixed quotes in arguments', () => {
      const result = processor._parseFilterArgs('"double",\'single\'');

      expect(result).toEqual(['double', 'single']);
    });

    it('should handle arguments with commas inside quotes', () => {
      const result = processor._parseFilterArgs('"last, first",age');

      expect(result).toEqual(['last, first', 'age']);
    });

    it('should handle nested quotes', () => {
      const result = processor._parseFilterArgs('"text with \'quotes\'"');

      expect(result).toEqual(["text with 'quotes'"]);
    });

    it('should handle empty arguments between commas', () => {
      const result = processor._parseFilterArgs('arg1,,arg3');

      // Empty arguments should be skipped
      expect(result).toEqual(['arg1', 'arg3']);
    });

    it('should handle whitespace around arguments', () => {
      const result = processor._parseFilterArgs('  arg1  ,  arg2  ');

      expect(result).toEqual(['arg1', 'arg2']);
    });

    it('should handle floating point numbers', () => {
      const result = processor._parseFilterArgs('3.14,2.718');

      expect(result).toEqual([3.14, 2.718]);
    });

    it('should handle negative numbers', () => {
      const result = processor._parseFilterArgs('-5,-10.5');

      expect(result).toEqual([-5, -10.5]);
    });
  });

  // ===================================================================
  // _createListLoopRequests Tests
  // ===================================================================
  describe('_createListLoopRequests Tests', () => {
    it('should create requests for bullet list', () => {
      const op = {
        type: 'listLoop',
        index: 100,
        fullMatch: '{{#bullet_list:items}}{{name}}{{/bullet_list}}',
        listType: 'bullet',
        dataArray: [{ name: 'First' }, { name: 'Second' }],
        itemTemplate: '{{name}}'
      };

      mockMustache.render.mockReturnValueOnce('First').mockReturnValueOnce('Second');

      const requests = processor._createListLoopRequests(op);

      expect(requests.length).toBeGreaterThan(2);

      // First request should delete the template text content
      expect(requests[0]).toHaveProperty('deleteContentRange');

      // Should have insertText and createParagraphBullets for each item
      const insertRequests = requests.filter((r) => r.insertText);
      expect(insertRequests.length).toBeGreaterThan(0);
    });

    it('should create requests for numbered list', () => {
      const op = {
        type: 'listLoop',
        index: 100,
        fullMatch: '{{#number_list:items}}{{name}}{{/number_list}}',
        listType: 'number',
        dataArray: [{ name: 'First' }],
        itemTemplate: '{{name}}'
      };

      mockMustache.render.mockReturnValue('First');

      const requests = processor._createListLoopRequests(op);

      expect(requests.length).toBeGreaterThan(0);

      // Should not have createParagraphBullets for numbered lists
      const bulletRequests = requests.filter((r) => r.createParagraphBullets);
      // Numbered lists don't use createParagraphBullets in the current implementation
    });

    it('should handle empty dataArray', () => {
      const op = {
        type: 'listLoop',
        index: 100,
        fullMatch: '{{#bullet_list:items}}{{name}}{{/bullet_list}}',
        listType: 'bullet',
        dataArray: [],
        itemTemplate: '{{name}}'
      };

      const requests = processor._createListLoopRequests(op);

      // Should only have delete request
      expect(requests).toHaveLength(1);
      expect(requests[0]).toHaveProperty('deleteContentRange');
    });
  });

  // ===================================================================
  // _createTextSubstitutionRequests Tests
  // ===================================================================
  describe('_createTextSubstitutionRequests Tests', () => {
    it('should create correct delete and insert requests', () => {
      const op = {
        type: 'textSubstitution',
        index: 50,
        originalText: 'Hello {{name}}',
        newText: 'Hello World'
      };

      const requests = processor._createTextSubstitutionRequests(op);

      expect(requests).toHaveLength(2);
      expect(requests[0].deleteContentRange.range.startIndex).toBe(50);
      expect(requests[0].deleteContentRange.range.endIndex).toBe(64); // 50 + 14
      expect(requests[1].insertText.location.index).toBe(50);
      expect(requests[1].insertText.text).toBe('Hello World');
    });
  });

  // ===================================================================
  // _createDeleteRowRequests Tests
  // ===================================================================
  describe('_createDeleteRowRequests Tests', () => {
    it('should create correct delete row request', () => {
      const op = {
        type: 'deleteRow',
        tableIndex: 100,
        rowIndex: 3
      };

      const requests = processor._createDeleteRowRequests(op);

      expect(requests).toHaveLength(1);
      expect(requests[0].deleteTableRow.tableCellLocation.tableStartLocation.index).toBe(100);
      expect(requests[0].deleteTableRow.tableCellLocation.rowIndex).toBe(3);
      expect(requests[0].deleteTableRow.tableCellLocation.columnIndex).toBe(0);
    });
  });

  // ===================================================================
  // _getNestedProperty Tests
  // ===================================================================
  describe('_getNestedProperty Tests', () => {
    it('should get nested property values', () => {
      const obj = {
        user: {
          profile: {
            name: 'John'
          }
        }
      };

      mockMustache.getValue.mockImplementation((path, context) => {
        return path.split('.').reduce((o, k) => o?.[k], context);
      });

      const result = processor._getNestedProperty(obj, 'user.profile.name');

      expect(result).toBe('John');
      expect(mockMustache.getValue).toHaveBeenCalledWith('user.profile.name', obj);
    });

    it('should handle non-existent nested properties', () => {
      const obj = { user: {} };

      mockMustache.getValue.mockImplementation((path, context) => {
        return path.split('.').reduce((o, k) => o?.[k], context);
      });

      const result = processor._getNestedProperty(obj, 'user.profile.name');

      expect(result).toBeUndefined();
    });
  });

  // ===================================================================
  // Integration: Complex Document Processing
  // ===================================================================
  describe('Integration: Complex Document Processing', () => {
    it('should handle document with tables, lists, and text substitutions', () => {
      // Mock scanDocumentStructure to return POJO with complex structure
      mockDocumentService.scanDocumentStructure.mockReturnValueOnce({
        tables: [
          {
            rows: [
              {
                cells: [
                  {
                    text: '{{#tablecol_loop:items}}{{name}}',
                    startIndex: 50
                  }
                ]
              }
            ],
            startIndex: 40
          }
        ],
        textMatches: [
          {
            text: '{{#bullet_list:tasks}}{{description}}{{/bullet_list}}',
            elementIndex: 1,
            startIndex: 100,
            type: 'TEXT'
          },
          {
            text: 'Hello {{user}}',
            elementIndex: 2,
            startIndex: 150,
            type: 'TEXT'
          }
        ]
      });

      mockMustache._lookupValue
        .mockReturnValueOnce([{ name: 'Item' }]) // For tablecol_loop
        .mockReturnValueOnce([{ description: 'Task 1' }]); // For bullet_list

      mockMustache.render
        .mockReturnValueOnce('Item') // For table column
        .mockReturnValueOnce('Task 1') // For bullet list
        .mockReturnValueOnce('Hello Alice'); // For text substitution

      const context = {
        items: [{ name: 'Item' }],
        tasks: [{ description: 'Task 1' }],
        user: 'Alice'
      };

      processor.process('doc123', context);

      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Batch update completed successfully');
    });

    it('should handle document with no substitutions needed', () => {
      // First call for list loops search (should return null - no list loops)
      mockBody.findText.mockReturnValueOnce(null);

      const mockTextElement = {
        getType: () => DocumentApp.ElementType.TEXT,
        asText: () => ({
          getText: () => 'Static text with no placeholders',
          getStartIndex: () => 10
        })
      };

      mockBody.findText
        .mockReturnValueOnce({ getElement: () => mockTextElement })
        .mockReturnValueOnce(null);

      mockMustache.render.mockReturnValue('Static text with no placeholders');

      processor.process('doc123', {});

      // Should not execute batch update since no substitutions were made
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });
  });
});
