import type { ScannedTable, TextMatch, RenderSegment } from '../../types.js';
/**
 * @fileoverview Advanced coverage tests for DocumentProcessor (Reverse-Order Strategy)
 * Focus areas: Complex filter scenarios, edge cases, and integration testing
 */

import { DocumentProcessor } from '../DocumentProcessor.js';
import { DocumentProcessorTagScanner } from '../../internal/processors-managers/DocumentProcessorTagScanner.js';
import { DocumentProcessorInjector } from '../../internal/processors-managers/DocumentProcessorInjector.js';
import { Mustache } from '../../facades/Mustache.js';

// Mock _MustacheContext class used internally by DocumentProcessor
class _MustacheContext {
  declare view: unknown;
  constructor(view: unknown) {
    this.view = view;
  }
}
Object.assign(global, { _MustacheContext: _MustacheContext });

describe('DocumentProcessor - Advanced Coverage Tests (Reverse-Order Strategy)', () => {
  let processor: InstanceType<typeof DocumentProcessor>;
  let mockPlaceholderService: ReturnType<typeof createMockPlaceholderService>;
  function createMockPlaceholderService() {
    return {
      mustache: mockMustache,
      logger: mockLogger
    };
  }

  let mockDocumentService: ReturnType<typeof createMockDocumentService>;
  function createMockDocumentService() {
    return {
      openStandard: jest.fn(() => mockDoc),
      _executeBatchUpdate: jest.fn(),
      scanDocumentStructure: jest.fn((): { tables: ScannedTable[]; textMatches: TextMatch[] } => ({
        tables: [],
        textMatches: []
      })),
      // Standard API methods for table operations
      getTableRow: jest.fn((docId: string, tableIndex: number, rowIndex: number) => ({
        rowIndex,
        cells: ['{{#tablerow_loop:items}}', '{{name}}', '{{value}}']
      })),
      getTableData: jest.fn((docId: string, tableIndex: number) => ({
        tableIndex,
        numRows: 2,
        numColumns: 3,
        data: [
          ['Header1', 'Header2', 'Header3'],
          ['Data1', 'Data2', 'Data3']
        ]
      })),
      insertTableRow: jest.fn(() => ({ success: true })),
      copyTableRow: jest.fn(() => ({ success: true })),
      deleteTableRow: jest.fn(() => ({ success: true })),
      updateTableCell: jest.fn(() => ({ success: true })),
      setCellRunStyles: jest.fn(() => ({ success: true })),
      copyTableColumn: jest.fn(() => ({ success: true })),
      getColumnWidth: jest.fn(() => ({ widthPoints: 150 })),
      setColumnWidth: jest.fn(() => ({ success: true }))
    };
  }

  let mockMustache: ReturnType<typeof createMockMustache>;
  function createMockMustache(): {
    render: jest.Mock<string, [template: string, context?: object | null]>;
    getValue: jest.Mock<unknown, [path: string, context: unknown]>;
    _lookupValue: jest.Mock<unknown, [token: [string, string], context: { view: unknown }]>;
    renderSegments: jest.Mock<RenderSegment[], [template: string, context?: object | null]>;
  } {
    return {
      render: jest.fn((template: string, context: object | null = {}) => {
        return template.replace(/{{(\w+)}}/g, (match: string, key: string) => {
          return (context as Record<string, string>)[key] !== undefined
            ? (context as Record<string, string>)[key]
            : match;
        });
      }),
      getValue: jest.fn((path: string, context: unknown): unknown => {
        const parts = path.split('.');
        let result = context;
        for (const part of parts) {
          if (result == null) {
            return undefined;
          }
          result = (result as Record<string, unknown>)[part];
        }
        return result;
      }),
      _lookupValue: jest.fn((token: [string, string], context: { view: unknown }) => {
        const path = token[1];
        return mockMustache.getValue(path, context.view);
      }),
      renderSegments: jest.fn((template: string, data: object | null = {}) => {
        const segments: RenderSegment[] = [];
        const regex = /{{(\w+)}}/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(template)) !== null) {
          if (match.index > lastIndex) {
            const raw = template.slice(lastIndex, match.index);
            segments.push({
              type: 'text' as const,
              raw,
              rendered: raw,
              rawStart: lastIndex,
              rawEnd: match.index
            });
          }
          const key = match[1];
          const rendered =
            data && (data as Record<string, string>)[key] != null
              ? String((data as Record<string, string>)[key])
              : '';
          segments.push({
            type: 'value' as const,
            raw: match[0],
            rendered,
            rawStart: match.index,
            rawEnd: match.index + match[0].length
          });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < template.length) {
          const raw = template.slice(lastIndex);
          segments.push({
            type: 'text' as const,
            raw,
            rendered: raw,
            rawStart: lastIndex,
            rawEnd: template.length
          });
        }
        return segments;
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

  let mockDoc: ReturnType<typeof createMockDoc>;
  function createMockDoc() {
    return {
      getBody: jest.fn(() => mockBody)
    };
  }

  let mockBody: ReturnType<typeof createMockBody>;
  function createMockBody() {
    return {
      getNumChildren: jest.fn(() => 0),
      getChild: jest.fn(),
      findText: jest.fn<{ getElement: () => object } | null, [pattern: string]>(() => null)
    };
  }

  beforeEach(() => {
    // Mock logger
    mockLogger = createMockLogger();

    // Mock Mustache with comprehensive API
    mockMustache = createMockMustache();

    // Mock Document Body
    mockBody = createMockBody();

    // Mock Document
    mockDoc = createMockDoc();

    // Mock DocumentService
    mockDocumentService = createMockDocumentService();

    // Mock PlaceholderService
    mockPlaceholderService = createMockPlaceholderService();

    // Create processor instance
    processor = new DocumentProcessor(mockPlaceholderService);
    Object.assign(processor, { documentService: mockDocumentService });
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
      expect(result.filters![0].name).toBe('sortBy');
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
  // Filtered List Loop Tests
  // ===================================================================
  describe('Filtered List Loops', () => {
    it.each([
      ['bullet', "{{#bullet_list:items | sortBy:'name'}}{{name}}{{/bullet_list}}"],
      ['number', "{{#number_list:items | filter:'active',true}}{{name}}{{/number_list}}"]
    ])('applies source filters to a %s list loop', (listType, template: string) => {
      const source = [
        { name: 'Beta', active: false },
        { name: 'Alpha', active: true }
      ];
      mockMustache._lookupValue.mockReturnValue(source);
      processor._parseExpression = jest.fn(() => ({
        path: 'items',
        filters:
          listType === 'bullet'
            ? [{ name: 'sortBy', args: ['name'] }]
            : [{ name: 'filter', args: ['active', true] }]
      }));
      processor._applyFilters = jest.fn((_items, filters) =>
        filters![0].name === 'sortBy' ? [source[1], source[0]] : [source[1]]
      );

      const operations = processor._analyzeListLoops(
        [{ elementIndex: 10, text: template, runs: [] }],
        { items: source }
      );

      expect(mockMustache._lookupValue).toHaveBeenCalledWith(['name', 'items'], expect.anything());
      expect(processor._applyFilters).toHaveBeenCalled();
      expect(operations[0].dataArray).toEqual(
        listType === 'bullet' ? [source[1], source[0]] : [source[1]]
      );
    });

    it('filters a list source to active items through the expression pipeline', () => {
      const source = [
        { name: 'Beta', active: false },
        { name: 'Alpha', active: true }
      ];

      const operations = processor._analyzeListLoops(
        [
          {
            elementIndex: 10,
            text: "{{#number_list:items | filter:'active',true}}{{name}}{{/number_list}}",
            runs: []
          }
        ],
        { items: source }
      );

      expect(operations[0].dataArray).toEqual([{ name: 'Alpha', active: true }]);
    });

    it('rejects a filtered list expansion above MAX_ITERATIONS', () => {
      mockMustache._lookupValue.mockReturnValue([{ name: 'x' }]);
      processor._parseExpression = jest.fn(() => ({ path: 'items', filters: [] }));
      processor._applyFilters = jest.fn(() =>
        Array.from({ length: processor.MAX_ITERATIONS + 1 }, () => ({ name: 'x' }))
      );

      expect(() =>
        processor._analyzeListLoops(
          [
            {
              elementIndex: 10,
              text: '{{#bullet_list:items}}{{name}}{{/bullet_list}}',
              runs: []
            }
          ],
          { items: [{ name: 'x' }] }
        )
      ).toThrow(/exceeds maximum allowed/);
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

      mockMustache.getValue.mockImplementation((path: string, obj: unknown) => {
        return path
          .split('.')
          .reduce((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
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
  // _createTextSubstitutionRequests Tests
  // ===================================================================
  describe('_createTextSubstitutionRequests Tests', () => {
    it('should create correct delete and insert requests', () => {
      const op = {
        type: 'textSubstitution' as const,
        index: 50,
        originalText: 'Hello {{name}}',
        newText: 'Hello World'
      };

      const requests = processor._createTextSubstitutionRequests(op);

      expect(requests).toHaveLength(2);
      expect(requests[0].deleteContentRange!.range!.startIndex).toBe(50);
      expect(requests[0].deleteContentRange!.range!.endIndex).toBe(64); // 50 + 14
      expect(requests[1].insertText!.location!.index).toBe(50);
      expect(requests[1].insertText!.text).toBe('Hello World');
    });
  });

  // ===================================================================
  // _createDeleteRowRequests Tests
  // ===================================================================
  describe('_createDeleteRowRequests Tests', () => {
    it('should create correct delete row request', () => {
      const op = {
        type: 'deleteRow' as const,
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

      mockMustache.getValue.mockImplementation((path: string, context: unknown) => {
        return path
          .split('.')
          .reduce((o, k) => (o as Record<string, unknown> | undefined)?.[k], context);
      });

      const result = processor._getNestedProperty(obj, 'user.profile.name');

      expect(result).toBe('John');
      expect(mockMustache.getValue).toHaveBeenCalledWith('user.profile.name', obj);
    });

    it('should handle non-existent nested properties', () => {
      const obj = { user: {} };

      mockMustache.getValue.mockImplementation((path: string, context: unknown) => {
        return path
          .split('.')
          .reduce((o, k) => (o as Record<string, unknown> | undefined)?.[k], context);
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
            type: 'TEXT' as const
          },
          {
            text: 'Hello {{user}}',
            elementIndex: 2,
            startIndex: 150,
            type: 'TEXT' as const
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
      expect(mockLogger.debug).toHaveBeenCalledWith('Batch update completed successfully');
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
      expect(mockLogger.debug).toHaveBeenCalledWith('No batch operations to execute');
    });
  });
});

// bullet_list/number_list sharing a paragraph with other text, and nested lists
const LIST = '{{#bullet_list:docs}}{{nome}}{{/bullet_list}}';
const PARAGRAPH = `{{#has}}Il Consiglio redige:${LIST}{{/has}}{{^has}}Nessun documento.{{/has}}`;

describe('list block sharing a paragraph with other text', () => {
  const mustache = new Mustache();
  const scanner = new DocumentProcessorTagScanner({
    logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    mustache,
    MAX_ITERATIONS: 1000,
    MAX_TEMPLATE_MATCH_SIZE: 100000,
    _parseExpression: (expr: string) => ({ path: expr, filters: [] }),
    _applyFilters: (v: unknown) => v
  } as unknown as DocumentProcessorTagScanner['facade']);
  const match = (text: string): TextMatch[] => [
    { elementIndex: 5, text, type: 'TEXT', runs: [] } as unknown as TextMatch
  ];

  it('keeps the intro text before the list when the enclosing section is true', () => {
    const [op] = scanner._analyzeListLoops(match(PARAGRAPH), {
      has: true,
      docs: [{ nome: 'A' }]
    });
    expect(op.surround?.hasList).toBe(true);
    expect(op.surround?.before.map((s) => s.rendered).join('')).toBe('Il Consiglio redige:');
    expect(op.surround?.after.map((s) => s.rendered).join('')).toBe('');
  });

  it('falls back to the inverted-section text when the list is discarded', () => {
    const [op] = scanner._analyzeListLoops(match(PARAGRAPH), { has: false, docs: [] });
    expect(op.surround?.hasList).toBe(false);
    expect(op.surround?.before.map((s) => s.rendered).join('')).toBe('Nessun documento.');
  });

  it('keeps text after the list', () => {
    const [op] = scanner._analyzeListLoops(match(`Elenco: ${LIST} Fine.`), {
      docs: [{ nome: 'A' }]
    });
    expect(op.surround?.before.map((s) => s.rendered).join('')).toBe('Elenco: ');
    expect(op.surround?.after.map((s) => s.rendered).join('')).toBe(' Fine.');
  });

  it('leaves surround undefined for a paragraph that is only the list block', () => {
    const [op] = scanner._analyzeListLoops(match(LIST), { docs: [{ nome: 'A' }] });
    expect(op.surround).toBeUndefined();
  });
});

describe('_executeListLoopOperation() with surrounding text', () => {
  const seg = (rendered: string) => ({ rendered, style: {} });
  let body: Record<string, jest.Mock>;
  let template: Record<string, jest.Mock>;
  let injector: DocumentProcessorInjector;
  const inserted: Record<string, jest.Mock>[] = [];

  beforeEach(() => {
    Object.assign(global, {
      DocumentApp: { Attribute: {}, GlyphType: { BULLET: 'BULLET', NUMBER: 'NUMBER' } }
    });
    inserted.length = 0;
    const text = { appendText: jest.fn(), setAttributes: jest.fn() };
    const newItem = () => {
      const item = {
        clear: jest.fn(),
        editAsText: jest.fn(() => text),
        setNestingLevel: jest.fn(),
        setGlyphType: jest.fn()
      };
      inserted.push(item);
      return item;
    };
    template = {
      copy: jest.fn(() => ({})),
      getParent: jest.fn(() => body),
      getType: jest.fn(() => 'LIST_ITEM'),
      getNestingLevel: jest.fn(() => 0),
      clear: jest.fn(),
      editAsText: jest.fn(() => text)
    };
    body = {
      findText: jest.fn(() => ({ getElement: () => template })),
      getChildIndex: jest.fn(() => 3),
      insertListItem: jest.fn(),
      insertParagraph: jest.fn(),
      getChild: jest.fn(() => newItem()),
      removeChild: jest.fn(),
      getType: jest.fn(() => 'BODY_SECTION')
    };
    injector = new DocumentProcessorInjector({
      logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      documentService: { openStandard: () => ({ getBody: () => body }) },
      mustache: new Mustache()
    } as unknown as DocumentProcessorInjector['facade']);
  });

  const op = (surround: object) =>
    ({
      paragraphIndex: 1,
      listType: 'bullet',
      dataArray: [{ nome: 'A' }, { nome: 'B' }],
      itemTemplate: '{{nome}}',
      fullMatch: LIST,
      sourceRuns: [],
      surround
    }) as never;

  it('keeps the intro paragraph and nests the bullet items under it', () => {
    injector._executeListLoopOperation(
      'doc',
      op({ before: [seg('Il Consiglio redige:')], after: [], hasList: true })
    );

    expect(body.removeChild).not.toHaveBeenCalled();
    expect(template.clear).toHaveBeenCalled(); // retexted with the intro
    expect(inserted).toHaveLength(2);
    for (const item of inserted) {
      expect(item.setNestingLevel).toHaveBeenCalledWith(1);
      expect(item.setGlyphType).toHaveBeenCalledWith('BULLET');
    }
  });

  it('only retexts the paragraph when the list was discarded by an enclosing section', () => {
    injector._executeListLoopOperation(
      'doc',
      op({ before: [seg('Nessun documento.')], after: [], hasList: false })
    );

    expect(template.copy).not.toHaveBeenCalled();
    expect(body.removeChild).not.toHaveBeenCalled();
    expect(template.clear).toHaveBeenCalled();
  });

  it('inserts trailing text after the items and removes the template when there is no intro', () => {
    injector._executeListLoopOperation(
      'doc',
      op({ before: [seg('')], after: [seg(' Fine.')], hasList: true })
    );

    expect(inserted).toHaveLength(3); // 1 suffix + 2 items
    expect(body.removeChild).toHaveBeenCalledWith(template);
    expect(inserted[1].setNestingLevel).not.toHaveBeenCalled();
  });
});

describe('nested lists (a list inside each item of another list)', () => {
  const mustache = new Mustache();
  const scanner = new DocumentProcessorTagScanner({
    logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    mustache,
    MAX_ITERATIONS: 1000,
    MAX_TEMPLATE_MATCH_SIZE: 100000,
    _parseExpression: (expr: string) => ({ path: expr, filters: [] }),
    _applyFilters: (v: unknown) => v
  } as unknown as DocumentProcessorTagScanner['facade']);
  const analyze = (text: string, ctx: object) =>
    scanner._analyzeListLoops(
      [{ elementIndex: 1, text, type: 'TEXT', runs: [] } as unknown as TextMatch],
      ctx
    )[0];
  const ctx = {
    studenti: [
      { nome: 'Rossi', materie: [{ m: 'Latino' }, { m: 'Greco' }] },
      { nome: 'Bianchi', materie: [] },
      { nome: 'Verdi' }
    ]
  };

  it('resolves the inner list per item and strips it from the item template', () => {
    const op = analyze(
      '{{#number_list:studenti}}{{nome}}{{#bullet_list:materie}}{{m}}{{/bullet_list}}{{/number_list}}',
      ctx
    );
    expect(op.itemTemplate).toBe('{{nome}}');
    expect(op.children?.[0]).toEqual([
      expect.objectContaining({ listType: 'bullet', itemTemplate: '{{m}}' })
    ]);
    expect(op.children?.[0][0].dataArray).toHaveLength(2);
    expect(op.children?.[1][0].dataArray).toEqual([]); // empty: no sub-items
    expect(op.children?.[2]).toEqual([]); // missing: no sub-list at all
  });

  it('matches closing tags by depth when both lists have the same type', () => {
    const op = analyze(
      '{{#bullet_list:studenti}}{{nome}}{{#bullet_list:materie}}{{m}}{{/bullet_list}}{{/bullet_list}}',
      ctx
    );
    expect(op.itemTemplate).toBe('{{nome}}');
    expect(op.fullMatch.endsWith('{{/bullet_list}}{{/bullet_list}}')).toBe(true);
    expect(op.children?.[0][0].dataArray).toHaveLength(2);
  });

  it('supports three levels', () => {
    const deep = { a: [{ n: 'x', b: [{ n: 'y', c: [{ n: 'z' }] }] }] };
    const op = analyze(
      '{{#bullet_list:a}}{{n}}{{#bullet_list:b}}{{n}}{{#bullet_list:c}}{{n}}{{/bullet_list}}{{/bullet_list}}{{/bullet_list}}',
      deep
    );
    expect(op.children?.[0][0].children?.[0][0].dataArray).toEqual([{ n: 'z' }]);
  });

  it('leaves a non-nested block untouched (no children key)', () => {
    const op = analyze('{{#bullet_list:studenti}}{{nome}}{{/bullet_list}}', ctx);
    expect(op.children).toBeUndefined();
  });
});

describe('_executeListLoopOperation() with nested lists', () => {
  it('inserts item, then its sub-items one level deeper, in document order', () => {
    Object.assign(global, {
      DocumentApp: { Attribute: {}, GlyphType: { BULLET: 'BULLET', NUMBER: 'NUMBER' } }
    });
    const order: string[] = [];
    const text = { appendText: jest.fn((t: string) => order.push(t)), setAttributes: jest.fn() };
    const items: Array<Record<string, jest.Mock>> = [];
    const template = {
      copy: jest.fn(() => ({})),
      getParent: jest.fn(() => body),
      getType: jest.fn(() => 'LIST_ITEM'),
      getNestingLevel: jest.fn(() => 0)
    };
    const body: Record<string, jest.Mock> = {
      findText: jest.fn(() => ({ getElement: () => template })),
      getChildIndex: jest.fn(() => 3),
      insertListItem: jest.fn(),
      getChild: jest.fn(() => {
        const item = {
          clear: jest.fn(),
          editAsText: jest.fn(() => text),
          setNestingLevel: jest.fn(),
          setGlyphType: jest.fn()
        };
        items.push(item);
        return item;
      }),
      removeChild: jest.fn(),
      getType: jest.fn(() => 'BODY_SECTION')
    };
    const injector = new DocumentProcessorInjector({
      logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      documentService: { openStandard: () => ({ getBody: () => body }) },
      mustache: new Mustache()
    } as unknown as DocumentProcessorInjector['facade']);

    injector._executeListLoopOperation('doc', {
      paragraphIndex: 1,
      listType: 'number',
      fullMatch: 'x',
      itemTemplate: '{{nome}}',
      sourceRuns: [],
      dataArray: [{ nome: 'Rossi' }, { nome: 'Bianchi' }],
      children: [
        [
          {
            listType: 'bullet',
            itemTemplate: '{{m}}',
            sourceRuns: [],
            dataArray: [{ m: 'Latino' }, { m: 'Greco' }]
          }
        ],
        []
      ]
    } as never);

    // Insertion is reversed at one fixed index, so the LAST inserted is first in the document.
    expect(order.reverse()).toEqual(['Rossi', 'Latino', 'Greco', 'Bianchi']);
    const subItems = items.filter((i) => i.setNestingLevel.mock.calls.length > 0);
    expect(subItems).toHaveLength(2);
    expect(subItems[0].setNestingLevel).toHaveBeenCalledWith(1);
    expect(subItems[0].setGlyphType).toHaveBeenCalledWith('BULLET');
    expect(body.removeChild).toHaveBeenCalledWith(template);
  });
});
