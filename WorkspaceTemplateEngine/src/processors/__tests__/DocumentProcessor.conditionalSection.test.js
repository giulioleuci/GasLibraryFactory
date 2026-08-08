/**
 * @fileoverview Tests for DocumentProcessor's generic {{#expr}}...{{/expr}} /
 * {{^expr}}...{{/expr}} conditional-section directive: a 5th structural
 * directive (alongside tablerow_loop/tablecol_loop/bullet_list/number_list)
 * that physically deletes/keeps Google Doc paragraphs based on standard
 * Mustache truthiness (falsy/null/empty array => section false) evaluated
 * against the render context, for any `expr` that isn't one of the 4
 * reserved directive names.
 * @author GasLibraryFactory
 */

import { DocumentProcessor } from '../DocumentProcessor.js';

class _MustacheContext {
  constructor(view) {
    this.view = view;
  }
}
global._MustacheContext = _MustacheContext;

describe('DocumentProcessor - {{#expr}}/{{^expr}} conditional-section directive', () => {
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
      // Simple {{key}} substitution (no dot-paths) - sufficient for the
      // content-paragraph substitution assertions below.
      render: jest.fn((template, context) =>
        template.replace(/{{(\w+)}}/g, (match, key) => (context && context[key] != null ? context[key] : match))
      ),
      getValue: jest.fn((path, context) => getValueFromPath(path, context)),
      _lookupValue: jest.fn((token, context) => getValueFromPath(token[1], context.view)),
      renderSegments: jest.fn((template) => [
        { type: 'text', raw: template, rendered: template, rawStart: 0, rawEnd: template.length }
      ])
    };

    mockDocumentService = {
      scanDocumentStructure: jest.fn(() => ({ tables: [], textMatches: [] })),
      _executeBatchUpdate: jest.fn(),
      openStandard: jest.fn(() => null)
    };

    const mockPlaceholderService = { mustache: mockMustache, logger: mockLogger };
    processor = new DocumentProcessor(mockPlaceholderService);
    processor.documentService = mockDocumentService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_analyzeConditionalSections()', () => {
    it('produces a single delete-range op spanning the whole block when {{#expr}} is falsy', () => {
      const openText = '{{#focus.classe.isArticolata}}\n';
      const closeText = '{{/focus.classe.isArticolata}}\n';
      const textMatches = [
        { type: 'TEXT', elementIndex: 0, text: 'Prima del blocco\n' },
        { type: 'TEXT', elementIndex: 18, text: openText },
        { type: 'TEXT', elementIndex: 50, text: closeText }
      ];
      const context = { focus: { classe: { isArticolata: false } } };

      const ops = processor._analyzeConditionalSections(textMatches, context);

      expect(ops).toEqual([
        { type: 'conditionalDelete', index: 18, length: 50 + closeText.length - 18 }
      ]);
    });

    it('produces two marker-only delete ops when {{#expr}} is truthy, preserving the content paragraph', () => {
      const openText = '{{#focus.classe.isArticolata}}\n';
      const closeText = '{{/focus.classe.isArticolata}}\n';
      const textMatches = [
        { type: 'TEXT', elementIndex: 18, text: openText },
        { type: 'TEXT', elementIndex: 50, text: closeText }
      ];
      const context = { focus: { classe: { isArticolata: true } } };

      const ops = processor._analyzeConditionalSections(textMatches, context);

      expect(ops).toEqual([
        { type: 'conditionalDelete', index: 18, length: openText.length },
        { type: 'conditionalDelete', index: 50, length: closeText.length }
      ]);
    });

    it('treats an empty array as falsy for {{#expr}}', () => {
      const openText = '{{#items}}\n';
      const closeText = '{{/items}}\n';
      const textMatches = [
        { type: 'TEXT', elementIndex: 5, text: openText },
        { type: 'TEXT', elementIndex: 30, text: closeText }
      ];

      const ops = processor._analyzeConditionalSections(textMatches, { items: [] });

      expect(ops).toEqual([{ type: 'conditionalDelete', index: 5, length: 30 + closeText.length - 5 }]);
    });

    it('handles negated {{^expr}}: removes the whole block when expr is truthy', () => {
      const openText = '{{^focus.classe.isTerminale}}\n';
      const closeText = '{{/focus.classe.isTerminale}}\n';
      const textMatches = [
        { type: 'TEXT', elementIndex: 12, text: openText },
        { type: 'TEXT', elementIndex: 60, text: closeText }
      ];
      const context = { focus: { classe: { isTerminale: true } } };

      const ops = processor._analyzeConditionalSections(textMatches, context);

      expect(ops).toEqual([
        { type: 'conditionalDelete', index: 12, length: 60 + closeText.length - 12 }
      ]);
    });

    it('handles negated {{^expr}}: keeps the content (marker-only removal) when expr is falsy', () => {
      const openText = '{{^focus.classe.isTerminale}}\n';
      const closeText = '{{/focus.classe.isTerminale}}\n';
      const textMatches = [
        { type: 'TEXT', elementIndex: 12, text: openText },
        { type: 'TEXT', elementIndex: 60, text: closeText }
      ];
      const context = { focus: { classe: { isTerminale: false } } };

      const ops = processor._analyzeConditionalSections(textMatches, context);

      expect(ops).toEqual([
        { type: 'conditionalDelete', index: 12, length: openText.length },
        { type: 'conditionalDelete', index: 60, length: closeText.length }
      ]);
    });

    it('ignores the 4 reserved structural directive names (does not treat them as conditional sections)', () => {
      const textMatches = [
        { type: 'TEXT', elementIndex: 0, text: '{{#tablerow_loop:items}}\n' },
        { type: 'TEXT', elementIndex: 30, text: '{{/tablerow_loop}}\n' },
        { type: 'TEXT', elementIndex: 50, text: '{{#tablecol_loop:items}}\n' },
        { type: 'TEXT', elementIndex: 80, text: '{{/tablecol_loop}}\n' },
        { type: 'TEXT', elementIndex: 100, text: '{{#bullet_list:items}}\n' },
        { type: 'TEXT', elementIndex: 130, text: '{{/bullet_list}}\n' },
        { type: 'TEXT', elementIndex: 150, text: '{{#number_list:items}}\n' },
        { type: 'TEXT', elementIndex: 180, text: '{{/number_list}}\n' }
      ];

      const ops = processor._analyzeConditionalSections(textMatches, { items: [1] });

      expect(ops).toEqual([]);
    });

    it('ignores an unclosed opening marker (no matching close paragraph found)', () => {
      const textMatches = [{ type: 'TEXT', elementIndex: 0, text: '{{#someExpr}}\n' }];

      const ops = processor._analyzeConditionalSections(textMatches, { someExpr: true });

      expect(ops).toEqual([]);
    });

    it('ignores paragraphs with no marker syntax at all', () => {
      const textMatches = [{ type: 'TEXT', elementIndex: 0, text: 'Just a normal paragraph {{x}}\n' }];

      const ops = processor._analyzeConditionalSections(textMatches, { x: 1 });

      expect(ops).toEqual([]);
    });
  });

  describe('process() integration', () => {
    it('structurally removes the entire block (markers + content) when {{#expr}} is falsy', () => {
      const openText = '{{#focus.classe.isArticolata}}\n';
      const closeText = '{{/focus.classe.isArticolata}}\n';
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [
          { type: 'TEXT', elementIndex: 18, text: openText },
          { type: 'TEXT', elementIndex: 50, text: closeText }
        ]
      });

      processor.process('doc1', { focus: { classe: { isArticolata: false } } });

      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalledWith('doc1', [
        { deleteContentRange: { range: { startIndex: 18, endIndex: 50 + closeText.length } } }
      ]);
    });

    it('preserves and normally substitutes a content paragraph inside a truthy {{#expr}} block, removing only the marker paragraphs', () => {
      const openText = '{{#focus.classe.isArticolata}}\n';
      const contentText = 'Solo se {{nome}}\n';
      const closeText = '{{/focus.classe.isArticolata}}\n';
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [
          { type: 'TEXT', elementIndex: 18, text: openText },
          { type: 'TEXT', elementIndex: 50, text: contentText },
          { type: 'TEXT', elementIndex: 68, text: closeText }
        ]
      });

      processor.process('doc1', { focus: { classe: { isArticolata: true } }, nome: 'Mario' });

      // Content paragraph goes through the normal substitution pass...
      expect(mockMustache.render).toHaveBeenCalledWith(contentText, expect.anything());
      // ...but the marker paragraphs are never handed to the generic renderer
      // (a bare/unclosed section tag by itself would not render sensibly).
      expect(mockMustache.render).not.toHaveBeenCalledWith(openText, expect.anything());
      expect(mockMustache.render).not.toHaveBeenCalledWith(closeText, expect.anything());
      // ...and both marker paragraphs are structurally removed.
      const requests = mockDocumentService._executeBatchUpdate.mock.calls[0][1];
      expect(requests).toEqual(
        expect.arrayContaining([
          { deleteContentRange: { range: { startIndex: 18, endIndex: 18 + openText.length } } },
          { deleteContentRange: { range: { startIndex: 68, endIndex: 68 + closeText.length } } }
        ])
      );
    });

    it('handles negated {{^expr}}...{{/expr}} blocks end-to-end', () => {
      const openText = '{{^focus.classe.isTerminale}}\n';
      const closeText = '{{/focus.classe.isTerminale}}\n';
      mockDocumentService.scanDocumentStructure.mockReturnValue({
        tables: [],
        textMatches: [
          { type: 'TEXT', elementIndex: 18, text: openText },
          { type: 'TEXT', elementIndex: 50, text: closeText }
        ]
      });

      processor.process('doc1', { focus: { classe: { isTerminale: true } } });

      expect(mockDocumentService._executeBatchUpdate).toHaveBeenCalledWith('doc1', [
        { deleteContentRange: { range: { startIndex: 18, endIndex: 50 + closeText.length } } }
      ]);
    });

    it('does nothing extra when no conditional-section marker is present', () => {
      mockDocumentService.scanDocumentStructure.mockReturnValue({ tables: [], textMatches: [] });

      processor.process('doc1', {});

      expect(mockDocumentService._executeBatchUpdate).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('No batch operations to execute');
    });
  });
});
