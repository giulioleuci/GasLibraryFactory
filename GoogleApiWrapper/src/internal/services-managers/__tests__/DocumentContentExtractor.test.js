// ===================================================================
// FILE: GoogleApiWrapper/src/internal/services-managers/__tests__/DocumentContentExtractor.test.js
// ===================================================================
// Test suite for DocumentContentExtractor
// Coverage: scanDocumentStructure Phase 1 iteration cap (tables)
// ===================================================================

import { DocumentContentExtractor } from '../DocumentContentExtractor';

describe('DocumentContentExtractor', () => {
  let extractor;
  let facade;
  let logger;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    facade = {
      _logger: logger,
      _cache: {},
      _utils: {},
      _exceptionService: { executeWithRetry: jest.fn((fn) => fn()) },
      _executeWithRetry: jest.fn((fn) => fn()),
      getRawDocumentStructure: jest.fn()
    };

    extractor = new DocumentContentExtractor(facade);
  });

  describe('scanDocumentStructure', () => {
    it('should extract tables from document structure', () => {
      facade.getRawDocumentStructure.mockReturnValue({
        body: {
          content: [
            {
              type: 'TABLE',
              startIndex: 1,
              tableRows: [
                {
                  rowIndex: 0,
                  cells: [{ rowIndex: 0, columnIndex: 0, text: 'Cell 1' }]
                }
              ]
            },
            {
              type: 'PARAGRAPH',
              startIndex: 100,
              text: 'Some text'
            }
          ]
        }
      });

      const result = extractor.scanDocumentStructure('doc-1', []);

      expect(result.tables).toHaveLength(1);
      expect(result.tables[0].index).toBe(0);
      expect(result.tables[0].startIndex).toBe(1);
    });

    it('scanDocumentStructure caps Phase 1 table extraction at MAX_ITERATIONS and logs a warning', () => {
      const hugeContent = Array.from({ length: 10005 }, (_, i) => ({
        type: 'TABLE',
        startIndex: i,
        tableRows: []
      }));
      facade.getRawDocumentStructure.mockReturnValue({ body: { content: hugeContent } });

      const result = extractor.scanDocumentStructure('doc-1', []);

      expect(result.tables.length).toBeLessThanOrEqual(10000);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('maximum iteration limit'));
    });

    it('should scan text patterns for matches', () => {
      facade.getRawDocumentStructure.mockReturnValue({
        body: {
          content: [
            {
              type: 'PARAGRAPH',
              startIndex: 1,
              text: 'Hello {{name}} world'
            }
          ]
        }
      });

      const result = extractor.scanDocumentStructure('doc-1', ['{{']);

      expect(result.textMatches).toHaveLength(1);
      expect(result.textMatches[0].text).toBe('Hello {{name}} world');
      expect(result.textMatches[0].type).toBe('TEXT');
    });

    it('should handle empty content gracefully', () => {
      facade.getRawDocumentStructure.mockReturnValue({
        body: {
          content: []
        }
      });

      const result = extractor.scanDocumentStructure('doc-1', []);

      expect(result.tables).toEqual([]);
      expect(result.textMatches).toEqual([]);
    });

    it('should throw error and log on API failure', () => {
      facade.getRawDocumentStructure.mockImplementation(() => {
        throw new Error('API Error');
      });

      expect(() => {
        extractor.scanDocumentStructure('doc-1', []);
      }).toThrow('API Error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to scan document structure')
      );
    });
  });

  describe('_extractParagraphRuns / run capture', () => {
    it('extracts one run per textRun element, with paragraph-relative offsets', () => {
      const paragraph = {
        elements: [
          { textRun: { content: 'Dear ', textStyle: {} } },
          { textRun: { content: 'Alice', textStyle: { bold: true } } },
          { textRun: { content: ',', textStyle: {} } }
        ]
      };
      const runs = extractor._extractParagraphRuns(paragraph);
      expect(runs).toEqual([
        { text: 'Dear ', start: 0, end: 5, style: {} },
        { text: 'Alice', start: 5, end: 10, style: { bold: true } },
        { text: ',', start: 10, end: 11, style: {} }
      ]);
    });

    it('returns an empty array for a paragraph with no elements', () => {
      expect(extractor._extractParagraphRuns({})).toEqual([]);
      expect(extractor._extractParagraphRuns(null)).toEqual([]);
    });

    it('threads runs into scanDocumentStructure TEXT matches', () => {
      facade.getRawDocumentStructure.mockReturnValue({
        body: {
          content: [
            {
              type: 'PARAGRAPH',
              startIndex: 1,
              text: 'Hello {{name}}',
              runs: [
                { text: 'Hello ', start: 0, end: 6, style: {} },
                { text: '{{name}}', start: 6, end: 14, style: { italic: true } }
              ]
            }
          ]
        }
      });
      const result = extractor.scanDocumentStructure('doc-1', ['{{']);
      expect(result.textMatches[0].runs).toEqual([
        { text: 'Hello ', start: 0, end: 6, style: {} },
        { text: '{{name}}', start: 6, end: 14, style: { italic: true } }
      ]);
    });

    it('threads per-cell runs into table cells (Phase 1 tables[]) and TABLE_TEXT matches', () => {
      facade.getRawDocumentStructure.mockReturnValue({
        body: {
          content: [
            {
              type: 'TABLE',
              startIndex: 1,
              tableRows: [
                {
                  rowIndex: 0,
                  cells: [
                    {
                      rowIndex: 0,
                      columnIndex: 0,
                      text: '{{score}}',
                      runs: [{ text: '{{score}}', start: 0, end: 9, style: { bold: true } }],
                      content: [{ startIndex: 2, paragraph: {} }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      });
      const result = extractor.scanDocumentStructure('doc-1', ['{{']);
      expect(result.tables[0].rows[0].cells[0].runs).toEqual([
        { text: '{{score}}', start: 0, end: 9, style: { bold: true } }
      ]);
      expect(result.textMatches[0].type).toBe('TABLE_TEXT');
      expect(result.textMatches[0].runs).toEqual([
        { text: '{{score}}', start: 0, end: 9, style: { bold: true } }
      ]);
    });
  });

  describe('_extractCellRuns', () => {
    it('concatenates runs across multiple paragraphs in one cell, with cell-relative offsets', () => {
      const cell = {
        content: [
          {
            paragraph: {
              elements: [{ textRun: { content: 'Line1', textStyle: {} } }]
            }
          },
          {
            paragraph: {
              elements: [{ textRun: { content: 'Line2', textStyle: { bold: true } } }]
            }
          }
        ]
      };
      const runs = extractor._extractCellRuns(cell);
      expect(runs).toEqual([
        { text: 'Line1', start: 0, end: 5, style: {} },
        { text: 'Line2', start: 5, end: 10, style: { bold: true } }
      ]);
    });

    it('returns an empty array when the cell has no content', () => {
      expect(extractor._extractCellRuns({})).toEqual([]);
      expect(extractor._extractCellRuns(null)).toEqual([]);
    });
  });
});
