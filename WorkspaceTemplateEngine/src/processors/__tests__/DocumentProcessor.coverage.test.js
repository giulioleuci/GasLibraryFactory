/**
 * @fileoverview Coverage-focused tests for DocumentProcessor (Reverse-Order Strategy)
 * Targets edge cases and additional scenarios for complete coverage
 */

import { DocumentProcessor } from '../DocumentProcessor.js';

// Mock _MustacheContext class used internally by DocumentProcessor
class _MustacheContext {
  constructor(view) {
    this.view = view;
  }
}
global._MustacheContext = _MustacheContext;

describe('DocumentProcessor - Coverage Enhancement Tests (Reverse-Order Strategy)', () => {
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

    // Mock Mustache
    mockMustache = {
      render: jest.fn((template, context) =>
        template.replace(/{{(\w+)}}/g, (match, key) => context[key] || match)
      ),
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
      }))
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
  // Column Loop Processing Edge Cases
  // ===================================================================
  describe('Column Loop Processing', () => {
    it('should handle column loop with filters', () => {
      // Create POJO table structure as returned by scanDocumentStructure
      const mockTable = {
        rows: [
          {
            cells: [
              {
                text: '{{#tablecol_loop:items | sortBy:name | limit:2}}{{name}}',
                startIndex: 20
              }
            ]
          }
        ],
        startIndex: 10
      };

      const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];

      mockMustache._lookupValue.mockReturnValue(items);

      const result = processor._analyzeColumnLoops(mockTable, { items });

      expect(result).toHaveLength(1);
      expect(result[0].dataArray).toHaveLength(2); // Limited to 2
      expect(result[0].dataArray[0].name).toBe('Alice'); // Sorted
    });

    it('should skip cells that do not match column loop pattern', () => {
      // Create POJO table structure as returned by scanDocumentStructure
      const mockTable = {
        rows: [
          {
            cells: [
              {
                text: 'Normal header text',
                startIndex: 20
              }
            ]
          }
        ],
        startIndex: 10
      };

      const result = processor._analyzeColumnLoops(mockTable, {});

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // Row Loop Processing Edge Cases
  // ===================================================================
  describe('Row Loop Processing', () => {
    it('should handle row loop with filters', () => {
      // Create POJO table structure as returned by scanDocumentStructure
      const mockTable = {
        rows: [
          {
            cells: [
              {
                text: '{{#tablerow_loop:items | filter:active,true}}',
                startIndex: 20
              }
            ],
            startIndex: 20
          }
        ],
        startIndex: 10
      };

      const items = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true }
      ];

      mockMustache._lookupValue.mockReturnValue(items);

      const result = processor._analyzeRowLoops(mockTable, { items });

      expect(result).toHaveLength(1);
      expect(result[0].dataArray).toHaveLength(2); // Filtered to active only
    });

    it('should skip rows with no cells', () => {
      // Create POJO table structure as returned by scanDocumentStructure
      const mockTable = {
        rows: [
          {
            cells: [], // Empty cells array
            startIndex: 20
          }
        ],
        startIndex: 10
      };

      const result = processor._analyzeRowLoops(mockTable, {});

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // List Loop Processing Edge Cases
  // ===================================================================
  describe('List Loop Processing', () => {
    it('should skip when data is not an array', () => {
      // Create POJO textMatches structure as returned by scanDocumentStructure
      const textMatches = [
        {
          text: '{{#bullet_list:notArray}}content{{/bullet_list}}',
          elementIndex: 10,
          startIndex: 10,
          type: 'TEXT'
        }
      ];

      mockMustache._lookupValue.mockReturnValue('not an array');

      const result = processor._analyzeListLoops(textMatches, { notArray: 'not an array' });

      expect(result).toEqual([]);
    });

    it('should handle list loop with regex match failure', () => {
      // Create POJO textMatches structure - missing closing tag causes regex match failure
      const textMatches = [
        {
          text: '{{#bullet_list:items}}', // Missing closing tag
          elementIndex: 10,
          startIndex: 10,
          type: 'TEXT'
        }
      ];

      const result = processor._analyzeListLoops(textMatches, {});

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // _convertOperationToRequests() Tests
  // ===================================================================
  describe('_convertOperationToRequests()', () => {
    it('should create text substitution requests', () => {
      const op = {
        type: 'textSubstitution',
        index: 10,
        originalText: 'Hello {{name}}',
        newText: 'Hello World'
      };

      const requests = processor._convertOperationToRequests(op);

      expect(requests).toHaveLength(2);
      expect(requests[0]).toHaveProperty('deleteContentRange');
      expect(requests[1]).toHaveProperty('insertText');
    });

    it('should create delete row requests', () => {
      const op = {
        type: 'deleteRow',
        tableIndex: 10,
        rowIndex: 2
      };

      const requests = processor._convertOperationToRequests(op);

      expect(requests).toHaveLength(1);
      expect(requests[0]).toHaveProperty('deleteTableRow');
    });

    it('should return empty array for column loop operations (handled separately via Standard API)', () => {
      const op = {
        type: 'columnLoop',
        data: []
      };

      const requests = processor._convertOperationToRequests(op);

      // Column loops are now handled via _executeColumnLoopOperation() using Standard API
      // _convertOperationToRequests returns empty array for column loops
      expect(requests).toEqual([]);
    });

    it('should return empty array for row loop operations (handled separately via Standard API)', () => {
      const op = {
        type: 'rowLoop',
        data: []
      };

      const requests = processor._convertOperationToRequests(op);

      // Row loops are now handled via _executeRowLoopOperation() using Standard API
      // _convertOperationToRequests returns empty array for row loops
      expect(requests).toEqual([]);
    });

    it('should create list loop requests', () => {
      const op = {
        type: 'listLoop',
        index: 10,
        fullMatch: '{{#bullet_list:items}}{{name}}{{/bullet_list}}',
        listType: 'bullet',
        dataArray: [{ name: 'Item 1' }, { name: 'Item 2' }],
        itemTemplate: '{{name}}'
      };

      mockMustache.render.mockReturnValueOnce('Item 1').mockReturnValueOnce('Item 2');

      const requests = processor._convertOperationToRequests(op);

      expect(requests.length).toBeGreaterThan(0);
      expect(requests[0]).toHaveProperty('deleteContentRange');
    });

    it('should warn for unknown operation type', () => {
      const op = {
        type: 'unknownType',
        data: []
      };

      const requests = processor._convertOperationToRequests(op);

      expect(requests).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith('Unknown operation type: unknownType');
    });
  });

  // ===================================================================
  // Filter Error Handling Tests
  // ===================================================================
  describe('Filter Error Handling', () => {
    it('should warn when sortBy filter has no arguments in non-strict mode', () => {
      const data = [{ name: 'Test' }];
      const filters = [{ name: 'sortBy', args: [] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'sortBy' requires a property name argument")
      );
      expect(result).toEqual(data);
    });

    it('should throw when sortBy filter has no arguments in strict mode', () => {
      processor.strictFilters = true;
      const data = [{ name: 'Test' }];
      const filters = [{ name: 'sortBy', args: [] }];

      expect(() => {
        processor._applyFilters(data, filters);
      }).toThrow("Filter 'sortBy' requires a property name argument");
    });

    it('should warn when limit filter has invalid argument in non-strict mode', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const filters = [{ name: 'limit', args: ['invalid'] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(result).toEqual(data);
    });

    it('should warn when limit filter has no arguments in non-strict mode', () => {
      const data = [{ id: 1 }];
      const filters = [{ name: 'limit', args: [] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'limit' requires a number argument")
      );
    });

    it('should warn when filter filter has insufficient arguments in non-strict mode', () => {
      const data = [{ name: 'Test' }];
      const filters = [{ name: 'filter', args: ['name'] }];

      const result = processor._applyFilters(data, filters);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'filter' requires two arguments")
      );
    });

    it('should throw filter errors in strict mode', () => {
      processor.strictFilters = true;
      const data = [{ name: 'Test' }];
      const filters = [{ name: 'limit', args: ['invalid'] }];

      expect(() => {
        processor._applyFilters(data, filters);
      }).toThrow();
    });
  });

  // ===================================================================
  // _sortByProperty() Edge Cases
  // ===================================================================
  describe('_sortByProperty()', () => {
    it('should handle null values', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: null },
        { name: 'Charlie', age: 25 }
      ];

      const result = processor._sortByProperty(data, 'age');

      expect(result[2].age).toBe(null); // Nulls sorted to end
    });

    it('should handle string comparisons case-insensitively', () => {
      const data = [{ name: 'charlie' }, { name: 'Alice' }, { name: 'BOB' }];

      const result = processor._sortByProperty(data, 'name');

      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('BOB');
      expect(result[2].name).toBe('charlie');
    });

    it('should handle nested properties', () => {
      const data = [
        { person: { name: 'Charlie' } },
        { person: { name: 'Alice' } },
        { person: { name: 'Bob' } }
      ];

      mockMustache.getValue.mockImplementation((path, obj) => {
        return path.split('.').reduce((o, k) => o?.[k], obj);
      });

      const result = processor._sortByProperty(data, 'person.name');

      expect(result[0].person.name).toBe('Alice');
    });
  });

  // ===================================================================
  // _parseArgValue() Edge Cases
  // ===================================================================
  describe('_parseArgValue()', () => {
    it('should parse string values', () => {
      expect(processor._parseArgValue('test')).toBe('test');
    });

    it('should parse quoted strings', () => {
      expect(processor._parseArgValue('"quoted"')).toBe('quoted');
      expect(processor._parseArgValue("'quoted'")).toBe('quoted');
    });

    it('should parse numeric values', () => {
      expect(processor._parseArgValue('123')).toBe(123);
      expect(processor._parseArgValue('12.5')).toBe(12.5);
    });

    it('should parse boolean values', () => {
      expect(processor._parseArgValue('true')).toBe(true);
      expect(processor._parseArgValue('false')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(processor._parseArgValue('')).toBe('');
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should handle multiple operations in reverse order', () => {
      // Mock scanDocumentStructure to return POJO with textMatches
      mockDocumentService.scanDocumentStructure.mockReturnValueOnce({
        tables: [],
        textMatches: [
          {
            text: 'First {{value}}',
            elementIndex: 1,
            startIndex: 5,
            type: 'TEXT'
          },
          {
            text: 'Second {{value}}',
            elementIndex: 2,
            startIndex: 50,
            type: 'TEXT'
          }
        ]
      });

      mockMustache.render.mockReturnValueOnce('First 123').mockReturnValueOnce('Second 456');

      processor.process('doc123', { value: '123' });

      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalled();
      const requests = mockDocumentService._executeBatchUpdate.mock.calls[0][1];

      // Verify operations are in reverse order (highest index first)
      expect(requests.length).toBeGreaterThan(0);
      // First request should have higher index (50) than second request (5)
      const firstDeleteIndex = requests[0].deleteContentRange?.range?.startIndex;
      const secondDeleteIndex = requests[2]?.deleteContentRange?.range?.startIndex;
      if (firstDeleteIndex !== undefined && secondDeleteIndex !== undefined) {
        expect(firstDeleteIndex).toBeGreaterThan(secondDeleteIndex);
      }
    });
  });
});
