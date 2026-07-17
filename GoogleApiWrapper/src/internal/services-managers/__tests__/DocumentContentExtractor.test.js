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
});
