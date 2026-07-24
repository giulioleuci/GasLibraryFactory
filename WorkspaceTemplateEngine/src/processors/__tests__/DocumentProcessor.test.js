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
      }),
      renderSegments: jest.fn((template, data) => {
        const segments = [];
        const regex = /{{(\w+)}}/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(template)) !== null) {
          if (match.index > lastIndex) {
            const raw = template.slice(lastIndex, match.index);
            segments.push({
              type: 'text',
              raw,
              rendered: raw,
              rawStart: lastIndex,
              rawEnd: match.index
            });
          }
          const key = match[1];
          const rendered = data && data[key] != null ? String(data[key]) : '';
          segments.push({
            type: 'value',
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
            type: 'text',
            raw,
            rendered: raw,
            rawStart: lastIndex,
            rawEnd: template.length
          });
        }
        return segments;
      })
    };

    // Mock DocumentService
    mockDocumentService = {
      openStandard: jest.fn(),
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
      copyTableRow: jest.fn((docId, tableIndex, sourceRowIndex, targetRowIndex) => ({
        success: true,
        tableIndex,
        sourceRowIndex,
        insertedRowIndex: targetRowIndex
      })),
      setCellRunStyles: jest.fn(() => ({ success: true })),
      deleteTableRow: jest.fn(() => ({ success: true })),
      updateTableCell: jest.fn(() => ({ success: true })),
      // Column manipulation methods
      insertTableColumn: jest.fn(() => ({ success: true, affectedRows: 2 })),
      copyTableColumn: jest.fn((docId, tableIndex, sourceColumnIndex, targetColumnIndex) => ({
        success: true,
        tableIndex,
        sourceColumnIndex,
        insertedColumnIndex: targetColumnIndex,
        numRows: 2
      })),
      getColumnWidth: jest.fn(() => ({ widthPoints: 150 })),
      setColumnWidth: jest.fn(() => ({ success: true })),
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
  // _createTextSubstitutionRequests() — run-style preservation Tests
  // ===================================================================
  describe('_createTextSubstitutionRequests() — run-style preservation', () => {
    it('emits an updateTextStyle request for a segment whose source run had a style', () => {
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: 'Dear {{name}},',
        newText: 'Dear Alice,',
        segments: [
          { type: 'text', raw: 'Dear ', rendered: 'Dear ', rawStart: 0, rawEnd: 5 },
          { type: 'value', raw: '{{name}}', rendered: 'Alice', rawStart: 5, rawEnd: 13 },
          { type: 'text', raw: ',', rendered: ',', rawStart: 13, rawEnd: 14 }
        ],
        sourceRuns: [{ text: '{{name}}', start: 5, end: 13, style: { bold: true } }]
      };

      const requests = processor._createTextSubstitutionRequests(op);

      const styleRequests = requests.filter((r) => r.updateTextStyle);
      expect(styleRequests).toHaveLength(1);
      expect(styleRequests[0].updateTextStyle).toEqual({
        range: { startIndex: 105, endIndex: 110 },
        textStyle: { bold: true },
        fields: 'bold'
      });
    });

    it('emits no updateTextStyle request when no segment overlaps a styled source run', () => {
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: 'Hi {{name}}',
        newText: 'Hi Bob',
        segments: [
          { type: 'text', raw: 'Hi ', rendered: 'Hi ', rawStart: 0, rawEnd: 3 },
          { type: 'value', raw: '{{name}}', rendered: 'Bob', rawStart: 3, rawEnd: 11 }
        ],
        sourceRuns: []
      };

      const requests = processor._createTextSubstitutionRequests(op);
      expect(requests.some((r) => r.updateTextStyle)).toBe(false);
    });

    it('does not attempt style requests when the whole substitution collapsed to a zero-width space', () => {
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: '{{missing}}',
        newText: '​',
        segments: [{ type: 'value', raw: '{{missing}}', rendered: '', rawStart: 0, rawEnd: 11 }],
        sourceRuns: [{ text: '{{missing}}', start: 0, end: 11, style: { italic: true } }]
      };

      const requests = processor._createTextSubstitutionRequests(op);
      expect(requests.some((r) => r.updateTextStyle)).toBe(false);
    });

    it('preserves existing behavior when the op carries no segments (backward compatibility)', () => {
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: 'Hi {{name}}',
        newText: 'Hi Bob'
      };
      const requests = processor._createTextSubstitutionRequests(op);
      expect(requests).toEqual([
        { deleteContentRange: { range: { startIndex: 100, endIndex: 111 } } },
        { insertText: { location: { index: 100 }, text: 'Hi Bob' } }
      ]);
    });

    it('does not let a trailing styled segment extend past the preserved paragraph newline (originalText and newText both end in \\n)', () => {
      // Reviewer repro: 'Dear {{name}},\n' -> 'Dear Alice,\n'. The existing
      // trailing-\n trim (top of _createTextSubstitutionRequests) drops the
      // final \n from BOTH originalText and newText before building the
      // delete/insert requests, so the actually-inserted text is 'Dear Alice,'
      // (11 chars, op.index=100 -> 111). op.segments/op.sourceRuns, however,
      // were captured by the scanner against the UNTRIMMED originalText/newText
      // (still 12 chars, ending in \n) - here modeled by a source run that
      // covers the tag AND the trailing ',\n' (as it would if that whole run
      // shared one style in the source document), so the last segment
      // (',\n') also carries a style and its updateTextStyle request must be
      // clamped to the real inserted length, not the untrimmed segment length.
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: 'Dear {{name}},\n',
        newText: 'Dear Alice,\n',
        segments: [
          { type: 'text', raw: 'Dear ', rendered: 'Dear ', rawStart: 0, rawEnd: 5 },
          { type: 'value', raw: '{{name}}', rendered: 'Alice', rawStart: 5, rawEnd: 13 },
          { type: 'text', raw: ',\n', rendered: ',\n', rawStart: 13, rawEnd: 15 }
        ],
        sourceRuns: [{ text: '{{name}},\n', start: 5, end: 15, style: { bold: true } }]
      };

      const requests = processor._createTextSubstitutionRequests(op);

      expect(requests).toEqual([
        { deleteContentRange: { range: { startIndex: 100, endIndex: 114 } } },
        { insertText: { location: { index: 100 }, text: 'Dear Alice,' } },
        {
          updateTextStyle: {
            range: { startIndex: 105, endIndex: 110 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        },
        {
          updateTextStyle: {
            range: { startIndex: 110, endIndex: 111 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        }
      ]);

      const styleRequests = requests.filter((r) => r.updateTextStyle);
      const insertedEnd = 100 + 'Dear Alice,'.length; // 111 - the real content boundary
      for (const r of styleRequests) {
        expect(r.updateTextStyle.range.endIndex).toBeLessThanOrEqual(insertedEnd);
      }
    });

    it('does not clamp the segment walk when newText does not itself end in \\n (originalText ends in \\n but the rendered value does not)', () => {
      // When originalText ends in \n but the rendered newText does NOT (e.g. the
      // trailing \n was only rendered inside a section that was not taken), the
      // existing trim logic leaves newText untouched - the full untrimmed
      // newText is what actually gets inserted, so the segment walk must NOT
      // be truncated in this case.
      const op = {
        type: 'textSubstitution',
        index: 100,
        originalText: 'Dear {{name}}\n',
        newText: 'Dear Alice',
        segments: [
          { type: 'text', raw: 'Dear ', rendered: 'Dear ', rawStart: 0, rawEnd: 5 },
          { type: 'value', raw: '{{name}}', rendered: 'Alice', rawStart: 5, rawEnd: 13 }
        ],
        sourceRuns: [{ text: '{{name}}', start: 5, end: 13, style: { bold: true } }]
      };

      const requests = processor._createTextSubstitutionRequests(op);

      const styleRequests = requests.filter((r) => r.updateTextStyle);
      expect(styleRequests).toHaveLength(1);
      expect(styleRequests[0].updateTextStyle).toEqual({
        range: { startIndex: 105, endIndex: 110 },
        textStyle: { bold: true },
        fields: 'bold'
      });
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

      // Should copy the template row in reverse order (2 items), not insert blank rows
      expect(mockDocumentService.copyTableRow).toHaveBeenCalledTimes(2);
      expect(mockDocumentService.insertTableRow).not.toHaveBeenCalled();

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

      // First cell template should have its control marker stripped before
      // being rendered (verified against the copied row, not a blank insert)
      expect(mockMustache.renderSegments).toHaveBeenCalledWith(
        '{{id}}',
        expect.objectContaining({ id: '1' })
      );
      expect(mockDocumentService.copyTableRow).toHaveBeenCalledWith(
        'doc123',
        0,
        1,
        2 // rowIndex + 1
      );
    });

    it('copies the template row instead of inserting a blank one, preserving cell formatting', () => {
      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice', value: '100' }],
        sourceRuns: [
          [{ text: '{{name}}', start: 0, end: 8, style: {} }],
          [{ text: '{{value}}', start: 0, end: 9, style: { bold: true } }]
        ]
      };

      processor._executeRowLoopOperation('doc123', operation);

      expect(mockDocumentService.copyTableRow).toHaveBeenCalledWith('doc123', 0, 1, 2);
      expect(mockDocumentService.insertTableRow).not.toHaveBeenCalled();
      expect(mockDocumentService.deleteTableRow).toHaveBeenCalledWith('doc123', 0, 1);
    });

    it("applies setCellRunStyles once per cell of each inserted row, with the source run's style", () => {
      // sourceRuns are captured relative to the RAW cell text (matching
      // DocumentContentExtractor._extractCellRuns), so cell 0's run for
      // '{{name}}' is offset by the marker prefix's own length, not 0-based.
      const markerText = '{{#tablerow_loop:items}}';
      const nameText = '{{name}}';
      mockDocumentService.getTableRow.mockReturnValue({
        rowIndex: 1,
        cells: [markerText + nameText, '{{value}}']
      });

      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice', value: '100' }],
        sourceRuns: [
          [
            {
              text: nameText,
              start: markerText.length,
              end: markerText.length + nameText.length,
              style: { italic: true }
            }
          ],
          [{ text: '{{value}}', start: 0, end: 9, style: { bold: true } }]
        ]
      };

      mockMustache.render.mockImplementation((template, data) =>
        template.replace('{{name}}', data.name).replace('{{value}}', data.value)
      );

      processor._executeRowLoopOperation('doc123', operation);

      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledTimes(2);
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        2,
        0,
        expect.arrayContaining([expect.objectContaining({ style: { italic: true } })])
      );
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        2,
        1,
        expect.arrayContaining([expect.objectContaining({ style: { bold: true } })])
      );
    });

    it('falls back to empty sourceRuns (no style applied) when the op carries none', () => {
      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice', value: '100' }]
      };

      expect(() => processor._executeRowLoopOperation('doc123', operation)).not.toThrow();
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalled();
    });

    it('rebases cell-0 sourceRuns past the stripped marker prefix so its style does not leak onto the placeholder (regression)', () => {
      // Regression for the offset bug: cell.runs are captured relative to the
      // RAW cell text (marker included), but cellTemplates[0] is built by
      // stripping the marker off before rendering. Without rebasing,
      // offset 0 into the stripped '{{name}}' template would incorrectly
      // resolve to the marker's own (different) captured style.
      const markerText = '{{#tablerow_loop:items}}';
      const nameText = '{{name}}';
      mockDocumentService.getTableRow.mockReturnValue({
        rowIndex: 1,
        cells: [markerText + nameText, '{{value}}']
      });

      const operation = {
        type: 'rowLoop',
        tableIndex: 0,
        rowIndex: 1,
        dataArray: [{ name: 'Alice', value: '100' }],
        sourceRuns: [
          [
            { text: markerText, start: 0, end: markerText.length, style: {} },
            {
              text: nameText,
              start: markerText.length,
              end: markerText.length + nameText.length,
              style: { bold: true }
            }
          ],
          [{ text: '{{value}}', start: 0, end: 9, style: {} }]
        ]
      };

      mockMustache.render.mockImplementation((template, data) =>
        template.replace('{{name}}', data.name).replace('{{value}}', data.value)
      );

      processor._executeRowLoopOperation('doc123', operation);

      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        2,
        0,
        expect.arrayContaining([
          expect.objectContaining({ rendered: 'Alice', style: { bold: true } })
        ])
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

      processor._executeColumnLoopOperation('doc123', operation);

      // Should get table data
      expect(mockDocumentService.getTableData).toHaveBeenCalledWith('doc123', 0);

      // Should restyle the header cell with first item (via setCellRunStyles,
      // not a plain updateTableCell, so captured formatting survives)
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        1,
        expect.arrayContaining([expect.objectContaining({ rendered: 'January' })])
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

      processor._executeColumnLoopOperation('doc123', operation);

      // Should restyle the first (original) cell in place
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        1,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Jan' })])
      );

      // Should copy the source column for the 2 additional items (Feb and Mar),
      // never insertTableColumn (formatting-preserving path)
      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledTimes(2);
      expect(mockDocumentService.insertTableColumn).not.toHaveBeenCalled();

      // First copy targets column 2 (cellIndex + 1)
      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledWith('doc123', 0, 1, 2);
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        2,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Feb' })])
      );

      // Second copy targets column 3 (cellIndex + 2)
      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledWith('doc123', 0, 1, 3);
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        3,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Mar' })])
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

      // Original column: header row + value row both restyled for the first item.
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        1,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Jan' })])
      );
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        1,
        1,
        expect.arrayContaining([expect.objectContaining({ rendered: '1000' })])
      );

      // Copied columns carry the value row too, not an empty string.
      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledWith('doc123', 0, 1, 2);
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        2,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Feb' })])
      );
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        1,
        2,
        expect.arrayContaining([expect.objectContaining({ rendered: '1200' })])
      );

      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledWith('doc123', 0, 1, 3);
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        3,
        expect.arrayContaining([expect.objectContaining({ rendered: 'Mar' })])
      );
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        1,
        3,
        expect.arrayContaining([expect.objectContaining({ rendered: '900' })])
      );
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

    it('copies the source column instead of inserting a blank one for each additional data item', () => {
      mockDocumentService.getTableData.mockReturnValue({
        tableIndex: 0,
        numRows: 2,
        numColumns: 2,
        data: [
          ['Header', 'ignored'],
          ['{{value}}', 'ignored']
        ]
      });

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 0,
        dataArray: [
          { label: 'A', value: 1 },
          { label: 'B', value: 2 }
        ],
        templateContent: '{{label}}{{/tablecol_loop}}',
        sourceRuns: [{ text: '{{label}}', start: 0, end: 9, style: { bold: true } }]
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockDocumentService.copyTableColumn).toHaveBeenCalledWith('doc123', 0, 0, 1);
      expect(mockDocumentService.insertTableColumn).not.toHaveBeenCalled();
    });

    it('preserves column width by copying getColumnWidth onto each newly inserted column', () => {
      mockDocumentService.getTableData.mockReturnValue({
        tableIndex: 0,
        numRows: 1,
        numColumns: 2,
        data: [['{{label}}', 'ignored']]
      });

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 0,
        dataArray: [{ label: 'A' }, { label: 'B' }],
        templateContent: '{{label}}{{/tablecol_loop}}',
        sourceRuns: []
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockDocumentService.getColumnWidth).toHaveBeenCalledWith('doc123', 0, 0);
      expect(mockDocumentService.setColumnWidth).toHaveBeenCalledWith('doc123', 0, 1, 150);
    });

    it("applies the header segment's source style via setCellRunStyles for row 0", () => {
      mockDocumentService.getTableData.mockReturnValue({
        tableIndex: 0,
        numRows: 1,
        numColumns: 1,
        data: [['{{label}}']]
      });

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 0,
        dataArray: [{ label: 'A' }],
        templateContent: '{{label}}{{/tablecol_loop}}',
        sourceRuns: [{ text: '{{label}}', start: 0, end: 9, style: { bold: true } }]
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        0,
        expect.arrayContaining([expect.objectContaining({ style: { bold: true } })])
      );
    });

    it('rebases header sourceRuns past the stripped marker prefix so its style does not leak onto the placeholder (regression, full scan+execute pipeline)', () => {
      // Regression for the offset bug: cell.runs are captured relative to the
      // RAW header cell text (marker included), while the header template
      // rendered here is marker-stripped. Exercise the real pipeline
      // (_analyzeColumnLoops -> _executeColumnLoopOperation) so both the
      // scanner's marker-prefix rebase and the injector's own trim rebase
      // are covered end to end.
      const markerText = '{{#tablecol_loop:items}}';
      const placeholderText = '{{name}}';
      const closeText = '{{/tablecol_loop}}';
      const cellText = markerText + placeholderText + closeText;

      const mockTable = {
        index: 0,
        rows: [
          {
            index: 0,
            cells: [
              {
                index: 0,
                text: cellText,
                runs: [
                  { text: markerText, start: 0, end: markerText.length, style: {} },
                  {
                    text: placeholderText,
                    start: markerText.length,
                    end: markerText.length + placeholderText.length,
                    style: { bold: true }
                  },
                  {
                    text: closeText,
                    start: markerText.length + placeholderText.length,
                    end: cellText.length,
                    style: {}
                  }
                ]
              }
            ]
          }
        ]
      };

      mockMustache._lookupValue.mockReturnValue([{ name: 'Test' }]);

      const ops = processor._analyzeColumnLoops(mockTable, { items: [{ name: 'Test' }] });
      expect(ops).toHaveLength(1);

      mockDocumentService.getTableData.mockReturnValue({
        tableIndex: 0,
        numRows: 1,
        numColumns: 1,
        data: [[cellText]]
      });

      processor._executeColumnLoopOperation('doc123', ops[0]);

      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        0,
        expect.arrayContaining([
          expect.objectContaining({ rendered: 'Test', style: { bold: true } })
        ])
      );
    });

    it('rebases header sourceRuns past leading whitespace that .trim() strips from the header template (regression, trim-induced offset)', () => {
      // Regression for the "additional trim-induced offset beyond just the
      // marker-prefix length" case: templateContent (already marker-stripped
      // by the scanner) puts the placeholder after some leading whitespace
      // (e.g. marker and placeholder on separate lines), which
      // _executeColumnLoopOperation's own `.trim()` then strips when
      // building `template` — sourceRuns must be rebased by that additional
      // amount too, not just the marker-prefix length.
      const leadingWs = '  ';
      const placeholderText = '{{label}}';
      const closeText = '{{/tablecol_loop}}';
      const templateContent = leadingWs + placeholderText + closeText;

      mockDocumentService.getTableData.mockReturnValue({
        tableIndex: 0,
        numRows: 1,
        numColumns: 1,
        data: [['{{label}}']]
      });

      const operation = {
        type: 'columnLoop',
        tableIndex: 0,
        cellIndex: 0,
        dataArray: [{ label: 'A' }],
        templateContent,
        sourceRuns: [
          { text: leadingWs, start: 0, end: leadingWs.length, style: {} },
          {
            text: placeholderText,
            start: leadingWs.length,
            end: leadingWs.length + placeholderText.length,
            style: { bold: true }
          },
          {
            text: closeText,
            start: leadingWs.length + placeholderText.length,
            end: templateContent.length,
            style: {}
          }
        ]
      };

      processor._executeColumnLoopOperation('doc123', operation);

      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalledWith(
        'doc123',
        0,
        0,
        0,
        expect.arrayContaining([expect.objectContaining({ style: { bold: true } })])
      );
    });
  });

  // ===================================================================
  // _executeListLoopOperation() Tests (Native paragraph-copy)
  // ===================================================================
  describe('_executeListLoopOperation()', () => {
    let mockTemplateParagraph,
      mockCopiedParagraph,
      mockInsertedParagraph,
      mockTextElement,
      mockBody,
      mockDoc;

    beforeEach(() => {
      mockTextElement = { appendText: jest.fn(), setAttributes: jest.fn() };
      mockInsertedParagraph = { editAsText: jest.fn(() => mockTextElement), clear: jest.fn() };
      mockCopiedParagraph = { __copy: true };
      mockTemplateParagraph = {
        copy: jest.fn(() => mockCopiedParagraph),
        getParent: jest.fn(() => mockBody)
      };
      mockBody = {
        findText: jest.fn(() => ({ getElement: () => mockTemplateParagraph })),
        getChildIndex: jest.fn(() => 3),
        insertParagraph: jest.fn(() => mockInsertedParagraph),
        getChild: jest.fn(() => mockInsertedParagraph),
        removeChild: jest.fn()
      };
      mockDoc = { getBody: jest.fn(() => mockBody) };
      mockDocumentService.openStandard.mockReturnValue(mockDoc);
      // TextStyleMapper.toNativeAttributes() reads DocumentApp.Attribute.* natively;
      // the shared test/setup.js DocumentApp mock doesn't define Attribute (only
      // ElementType/GlyphType), so provide it locally — same precedent as
      // GoogleApiWrapper/.../DocumentTableManager.test.js's copyTableColumn() suite.
      global.DocumentApp = { Attribute: { BOLD: 'BOLD' } };
    });

    it('locates the template paragraph via findText and removes it after expansion', () => {
      const op = {
        type: 'listLoop',
        paragraphIndex: 42,
        listType: 'bullet',
        dataArray: [{ nome: 'Alice' }],
        itemTemplate: '{{nome}}',
        fullMatch: '{{#bullet_list:items}}{{nome}}{{/bullet_list}}',
        sourceRuns: []
      };

      processor._executeListLoopOperation('doc123', op);

      expect(mockBody.findText).toHaveBeenCalledWith(op.fullMatch);
      expect(mockTemplateParagraph.copy).toHaveBeenCalledTimes(1);
      expect(mockBody.insertParagraph).toHaveBeenCalledWith(4, mockCopiedParagraph);
      expect(mockBody.removeChild).toHaveBeenCalledWith(mockTemplateParagraph);
    });

    it('inserts one copied paragraph per data item, in reverse order at the same fixed position', () => {
      const op = {
        type: 'listLoop',
        paragraphIndex: 42,
        listType: 'number',
        dataArray: [{ nome: 'Alice' }, { nome: 'Bob' }],
        itemTemplate: '{{nome}}',
        fullMatch: '{{#number_list:items}}{{nome}}{{/number_list}}',
        sourceRuns: []
      };

      processor._executeListLoopOperation('doc123', op);

      expect(mockTemplateParagraph.copy).toHaveBeenCalledTimes(2);
      expect(mockBody.insertParagraph).toHaveBeenNthCalledWith(1, 4, mockCopiedParagraph);
      expect(mockBody.insertParagraph).toHaveBeenNthCalledWith(2, 4, mockCopiedParagraph);
    });

    it('retexts each inserted paragraph with the rendered item and applies source run styles', () => {
      const op = {
        type: 'listLoop',
        paragraphIndex: 42,
        listType: 'bullet',
        dataArray: [{ nome: 'Alice' }],
        itemTemplate: '{{nome}}',
        fullMatch: '{{#bullet_list:items}}{{nome}}{{/bullet_list}}',
        sourceRuns: [{ text: '{{nome}}', start: 0, end: 8, style: { bold: true } }]
      };
      mockMustache.render.mockImplementation((tpl, data) => tpl.replace('{{nome}}', data.nome));

      processor._executeListLoopOperation('doc123', op);

      expect(mockInsertedParagraph.clear).toHaveBeenCalled();
      expect(mockTextElement.appendText).toHaveBeenCalledWith('Alice');
    });

    it('warns and returns without mutating when the template paragraph cannot be found', () => {
      mockBody.findText.mockReturnValue(null);
      const op = {
        type: 'listLoop',
        paragraphIndex: 42,
        listType: 'bullet',
        dataArray: [{ nome: 'Alice' }],
        itemTemplate: '{{nome}}',
        fullMatch: '{{#bullet_list:items}}{{nome}}{{/bullet_list}}',
        sourceRuns: []
      };

      processor._executeListLoopOperation('doc123', op);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not find template paragraph')
      );
      expect(mockBody.removeChild).not.toHaveBeenCalled();
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
      expect(mockDocumentService.copyTableRow).toHaveBeenCalled();
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
      expect(mockDocumentService.setCellRunStyles).toHaveBeenCalled();
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

      expect(mockDocumentService.copyTableRow).toHaveBeenCalled();
      // The stale TABLE_TEXT match belongs to the already row-looped table
      // (tableIndex 0) and must be excluded — no batch corruption request.
      expect(mockDocumentService._executeBatchUpdate).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });
  });
});
