/**
 * @fileoverview Tests for DocumentProcessor's {{table[source=...]}} directive (ref REPORT_GLF.md B7)
 * @author GasLibraryFactory
 */

import { DocumentProcessor } from '../DocumentProcessor.js';

class _MustacheContext {
  constructor(view) {
    this.view = view;
  }
}
global._MustacheContext = _MustacheContext;

describe('DocumentProcessor - {{table[source=...]}} directive', () => {
  let processor;
  let mockDocumentService;
  let mockMustache;
  let mockLogger;

  function getValueFromPath(path, context) {
    const parts = path.split('.');
    let result = context;
    for (const part of parts) {
      if (result == null) {
        return undefined;
      }
      result = result[part];
    }
    return result;
  }

  beforeEach(() => {
    mockLogger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    mockMustache = {
      render: jest.fn((template) => template),
      getValue: jest.fn((path, context) => getValueFromPath(path, context)),
      _lookupValue: jest.fn((token, context) => getValueFromPath(token[1], context.view))
    };

    mockDocumentService = {
      scanDocumentStructure: jest.fn(() => ({ tables: [], textMatches: [] })),
      _executeBatchUpdate: jest.fn(),
      insertTableAtMarker: jest.fn(() => ({
        success: true,
        rows: 2,
        columns: 2,
        foundElementIndex: 0
      })),
      batchReplaceText: jest.fn(() => ({ successful: [], failed: [] })),
      openStandard: jest.fn(() => null) // no saveAndClose => _flushDocumentChanges no-ops safely
    };

    const mockPlaceholderService = { mustache: mockMustache, logger: mockLogger };
    processor = new DocumentProcessor(mockPlaceholderService);
    processor.documentService = mockDocumentService;
  });

  describe('_analyzeTableInsertions()', () => {
    it('resolves a single table directive against a 2D-array context path', () => {
      const context = {
        tabella: [
          ['A', 'B'],
          ['1', '2']
        ]
      };
      const textMatches = [{ type: 'TEXT', elementIndex: 3, text: '{{table[source=tabella]}}' }];

      const ops = processor._analyzeTableInsertions(textMatches, context);

      expect(ops).toEqual([
        {
          type: 'tableInsert',
          placeholder: '{{table[source=tabella]}}',
          data: [
            ['A', 'B'],
            ['1', '2']
          ],
          options: { headerRow: true }
        }
      ]);
    });

    it('honors headerRow=false', () => {
      const context = { tabella: [['1', '2']] };
      const textMatches = [
        { type: 'TEXT', elementIndex: 1, text: '{{table[source=tabella, headerRow=false]}}' }
      ];

      const ops = processor._analyzeTableInsertions(textMatches, context);

      expect(ops[0].options).toEqual({ headerRow: false });
    });

    it('skips (and warns) when source is missing', () => {
      const textMatches = [{ type: 'TEXT', elementIndex: 1, text: '{{table[headerRow=false]}}' }];

      const ops = processor._analyzeTableInsertions(textMatches, {});

      expect(ops).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Missing 'source'"));
    });

    it('skips (and warns) when the source does not resolve to a non-empty 2D array', () => {
      const cases = [
        { tabella: undefined },
        { tabella: [] },
        { tabella: ['not-a-row'] },
        { tabella: 'not-an-array' }
      ];
      for (const context of cases) {
        const textMatches = [{ type: 'TEXT', elementIndex: 1, text: '{{table[source=tabella]}}' }];
        expect(processor._analyzeTableInsertions(textMatches, context)).toEqual([]);
      }
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('ignores text runs with no {{table[ directive', () => {
      const textMatches = [{ type: 'TEXT', elementIndex: 1, text: 'plain text {{other}}' }];
      expect(processor._analyzeTableInsertions(textMatches, {})).toEqual([]);
    });

    it('resolves multiple distinct table directives in one document', () => {
      const context = { a: [['1']], b: [['2']] };
      const textMatches = [
        { type: 'TEXT', elementIndex: 1, text: '{{table[source=a]}}' },
        { type: 'TEXT', elementIndex: 5, text: '{{table[source=b]}}' }
      ];

      const ops = processor._analyzeTableInsertions(textMatches, context);

      expect(ops.map((o) => o.placeholder)).toEqual(['{{table[source=a]}}', '{{table[source=b]}}']);
    });
  });

  describe('_executeTableInsertOperation()', () => {
    it('inserts the table at the marker, flushes, then removes the marker text', () => {
      const op = {
        placeholder: '{{table[source=tabella]}}',
        data: [
          ['A', 'B'],
          ['1', '2']
        ],
        options: { headerRow: true }
      };

      processor._executeTableInsertOperation('doc1', op);

      expect(mockDocumentService.insertTableAtMarker).toHaveBeenCalledWith(
        'doc1',
        '{{table[source=tabella]}}',
        [
          ['A', 'B'],
          ['1', '2']
        ],
        { headerRow: true }
      );
      expect(mockDocumentService.batchReplaceText).toHaveBeenCalledWith(
        'doc1',
        '{{table[source=tabella]}}',
        ''
      );
      // Insertion must happen before marker removal (removal target is native-API state).
      const insertOrder = mockDocumentService.insertTableAtMarker.mock.invocationCallOrder[0];
      const removeOrder = mockDocumentService.batchReplaceText.mock.invocationCallOrder[0];
      expect(insertOrder).toBeLessThan(removeOrder);
    });

    it('propagates errors from insertTableAtMarker (e.g. marker not found)', () => {
      mockDocumentService.insertTableAtMarker.mockImplementation(() => {
        throw new Error('Marker text not found');
      });
      const op = { placeholder: '{{table[source=x]}}', data: [['1']], options: {} };

      expect(() => processor._executeTableInsertOperation('doc1', op)).toThrow(
        'Marker text not found'
      );
      expect(mockDocumentService.batchReplaceText).not.toHaveBeenCalled();
    });
  });

  describe('process() integration', () => {
    it('expands a {{table[...]}} directive end-to-end and rescans afterward', () => {
      const context = {
        righe: [
          ['X', 'Y'],
          ['1', '2']
        ]
      };
      mockDocumentService.scanDocumentStructure
        .mockReturnValueOnce({
          tables: [],
          textMatches: [{ type: 'TEXT', elementIndex: 2, text: '{{table[source=righe]}}' }]
        })
        .mockReturnValueOnce({ tables: [], textMatches: [] }); // post-insert rescan

      processor.process('doc1', context);

      expect(mockDocumentService.insertTableAtMarker).toHaveBeenCalledWith(
        'doc1',
        '{{table[source=righe]}}',
        [
          ['X', 'Y'],
          ['1', '2']
        ],
        { headerRow: true }
      );
      expect(mockDocumentService.batchReplaceText).toHaveBeenCalledWith(
        'doc1',
        '{{table[source=righe]}}',
        ''
      );
      expect(mockDocumentService.scanDocumentStructure).toHaveBeenCalledTimes(2);
    });

    it('a {{table[...]}} directive is excluded from the generic text-substitution pass', () => {
      const context = { righe: [['X']] };
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [{ type: 'TEXT', elementIndex: 2, text: '{{table[source=righe]}}' }]
      });

      processor.process('doc1', context);

      // mustache.render (generic substitution) must never see the table directive text.
      expect(mockMustache.render).not.toHaveBeenCalledWith('{{table[source=righe]}}', context);
    });

    it('does nothing extra when no {{table[...]}} directive is present', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({ tables: [], textMatches: [] });

      processor.process('doc1', {});

      expect(mockDocumentService.insertTableAtMarker).not.toHaveBeenCalled();
      expect(mockDocumentService.scanDocumentStructure).toHaveBeenCalledTimes(1);
    });
  });
});
