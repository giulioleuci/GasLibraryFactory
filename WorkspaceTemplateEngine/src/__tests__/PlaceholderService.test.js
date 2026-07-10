// ===================================================================
// FILE: WorkspaceTemplateEngine/src/__tests__/PlaceholderService.test.js
// ===================================================================
// Comprehensive test suite for PlaceholderService
// Using centralized MockFactory
// ===================================================================

import { PlaceholderService } from '../PlaceholderService';
import { MockFactory } from '../../../test/fakes/MockFactory';
import { DocumentService } from '@GoogleApiWrapper';

// Mock the GoogleApiWrapper
jest.mock('@GoogleApiWrapper', () => ({
  DocumentService: jest.fn(),
  SpreadsheetService: jest.fn(),
  UtilitiesService: jest.fn()
}));

describe('PlaceholderService - Comprehensive Test Suite', () => {
  let service;
  let mocks;
  let mockLogger;
  let mockMustache;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;

    // Setup the DocumentService mock constructor
    DocumentService.mockImplementation(() => mocks.documentService);

    // Create mustache mock compatible with existing tests
    mockMustache = {
      render: jest.fn((template, context) => {
        return template.replace(/{{(\w+)}}/g, (match, key) => (context && context[key]) || match);
      })
    };

    service = new PlaceholderService({
      logger: mockLogger,
      mustache: mockMustache
    });
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with required dependencies', () => {
      const instance = new PlaceholderService({ logger: mockLogger, mustache: mockMustache });
      expect(instance).toBeDefined();
      expect(instance.mustache).toBe(mockMustache);
    });

    it('should throw error if mustache instance is missing', () => {
      expect(() => {
        new PlaceholderService({ logger: mockLogger });
      }).toThrow('requires a MyMustache instance');
    });

    it('should use console as default logger', () => {
      const instance = new PlaceholderService({ mustache: mockMustache });
      expect(instance.logger).toBe(console);
    });
  });

  describe('processString() - Basic Functionality', () => {
    it('should process simple variable substitution', () => {
      const result = service.processString('Hello {{name}}!', { name: 'World' });
      expect(result).toContain('World');
    });

    it('should process multiple variables', () => {
      const result = service.processString('{{first}} {{last}}', {
        first: 'John',
        last: 'Doe'
      });
      expect(result).toContain('John');
      expect(result).toContain('Doe');
    });

    it('should handle empty template', () => {
      const result = service.processString('', { name: 'Test' });
      expect(result).toBe('');
    });

    it('should handle template with no placeholders', () => {
      const result = service.processString('Static text', { name: 'Test' });
      expect(result).toBe('Static text');
    });

    it('should handle empty context', () => {
      const result = service.processString('No {{placeholders}}', {});
      expect(result).toBeDefined();
    });

    it('should allow null context', () => {
      const result = service.processString('template', null);
      expect(result).toBeDefined();
    });
  });

  describe('processString() - Input Validation', () => {
    it('should throw TypeError if template is not a string', () => {
      expect(() => {
        service.processString(123, {});
      }).toThrow(TypeError);
      expect(() => {
        service.processString(123, {});
      }).toThrow('template must be a string');
    });

    it('should throw TypeError if template is null', () => {
      expect(() => {
        service.processString(null, {});
      }).toThrow('template must be a string');
    });

    it('should throw TypeError if template is undefined', () => {
      expect(() => {
        service.processString(undefined, {});
      }).toThrow('template must be a string');
    });

    it('should throw TypeError if context is not an object', () => {
      expect(() => {
        service.processString('template', 'not an object');
      }).toThrow('context must be an object or null');
    });

    it('should throw TypeError if context is an array', () => {
      expect(() => {
        service.processString('template', [1, 2, 3]);
      }).toThrow('context must be an object, not an array');
    });

    it('should throw TypeError if context is a number', () => {
      expect(() => {
        service.processString('template', 42);
      }).toThrow('context must be an object or null');
    });
  });

  describe('processString() - Error Handling', () => {
    it('should return original template on render error', () => {
      mockMustache.render.mockImplementation(() => {
        throw new Error('Render failed');
      });

      const template = '{{invalid}}';
      const result = service.processString(template, {});

      expect(result).toBe(template);
    });

    it('should log error on render failure', () => {
      mockMustache.render.mockImplementation(() => {
        throw new Error('Render failed');
      });

      service.processString('{{invalid}}', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error during placeholder substitution')
      );
    });

    it('should log error stack trace on failure', () => {
      const error = new Error('Render failed');
      mockMustache.render.mockImplementation(() => {
        throw error;
      });

      service.processString('template', {});

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(error.stack));
    });
  });

  describe('resolve() - Alias Method', () => {
    it('should be an alias for processString', () => {
      const template = '{{value}}';
      const context = { value: 'test' };

      const result = service.resolve(template, context);

      expect(result).toBeDefined();
      expect(mockMustache.render).toHaveBeenCalledWith(template, context);
    });

    it('should have same validation as processString', () => {
      expect(() => {
        service.resolve(123, {});
      }).toThrow('template must be a string');
    });

    it('should handle errors like processString', () => {
      mockMustache.render.mockImplementation(() => {
        throw new Error('Error');
      });

      const template = '{{value}}';
      const result = service.resolve(template, {});

      expect(result).toBe(template);
    });
  });

  describe('processDocument() - Basic Functionality', () => {
    let mockDocProcessor;

    beforeEach(() => {
      mockDocProcessor = {
        process: jest.fn()
      };
      service.documentProcessor = mockDocProcessor;
    });

    it('should process document successfully', () => {
      mockDocProcessor.process.mockReturnValue(undefined);

      const result = service.processDocument('doc123', { name: 'Test' });

      expect(result).toBe(true);
      expect(mockDocProcessor.process).toHaveBeenCalledWith('doc123', { name: 'Test' });
    });

    it('should log debug messages', () => {
      mockDocProcessor.process.mockReturnValue(undefined);

      service.processDocument('doc123', {});

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Starting document processing (Facade): doc123'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Document doc123 processed successfully.');
    });

    it('should allow null context', () => {
      mockDocProcessor.process.mockReturnValue(undefined);

      const result = service.processDocument('doc123', null);

      expect(result).toBe(true);
      expect(mockDocProcessor.process).toHaveBeenCalledWith('doc123', null);
    });
  });

  describe('processDocument() - Input Validation', () => {
    it('should throw TypeError if documentId is not a string', () => {
      expect(() => {
        service.processDocument(123, {});
      }).toThrow('documentId must be a non-empty string');
    });

    it('should throw TypeError if documentId is empty', () => {
      expect(() => {
        service.processDocument('', {});
      }).toThrow('documentId must be a non-empty string');
    });

    it('should throw TypeError if documentId is whitespace only', () => {
      expect(() => {
        service.processDocument('   ', {});
      }).toThrow('documentId must be a non-empty string');
    });

    it('should throw TypeError if context is not an object', () => {
      expect(() => {
        service.processDocument('doc123', 'not an object');
      }).toThrow('context must be an object or null');
    });

    it('should throw TypeError if context is an array', () => {
      expect(() => {
        service.processDocument('doc123', [1, 2, 3]);
      }).toThrow('context must be an object, not an array');
    });
  });

  describe('processDocument() - Error Handling', () => {
    let mockDocProcessor;

    beforeEach(() => {
      mockDocProcessor = {
        process: jest.fn()
      };
      service.documentProcessor = mockDocProcessor;
    });

    it('should return false on error', () => {
      mockDocProcessor.process.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      const result = service.processDocument('doc123', {});

      expect(result).toBe(false);
    });

    it('should log error on failure', () => {
      mockDocProcessor.process.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      service.processDocument('doc123', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process document doc123')
      );
    });

    it('should log error details', () => {
      const error = new Error('Processing error');
      mockDocProcessor.process.mockImplementation(() => {
        throw error;
      });

      service.processDocument('doc123', {});

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(error.stack));
    });
  });

  describe('processSheet() - Basic Functionality', () => {
    let mockSheetProcessor;

    beforeEach(() => {
      mockSheetProcessor = {
        process: jest.fn()
      };
      service.sheetProcessor = mockSheetProcessor;
    });

    it('should process sheet successfully without sheetName', () => {
      mockSheetProcessor.process.mockReturnValue(undefined);

      const result = service.processSheet('sheet123', { data: [1, 2, 3] });

      expect(result.success).toBe(true);
      expect(result.layouts).toEqual([]);
      expect(mockSheetProcessor.process).toHaveBeenCalledWith(
        'sheet123',
        { data: [1, 2, 3] },
        null
      );
    });

    it('should process sheet successfully with sheetName', () => {
      mockSheetProcessor.process.mockReturnValue(undefined);

      const result = service.processSheet('sheet123', { data: [1, 2, 3] }, 'Sheet1');

      expect(result.success).toBe(true);
      expect(mockSheetProcessor.process).toHaveBeenCalledWith(
        'sheet123',
        { data: [1, 2, 3] },
        'Sheet1'
      );
    });

    it('should log debug messages', () => {
      mockSheetProcessor.process.mockReturnValue(undefined);

      service.processSheet('sheet123', {});

      expect(mockLogger.debug).toHaveBeenCalledWith('Starting sheet processing (Facade): sheet123');
      expect(mockLogger.debug).toHaveBeenCalledWith('Sheet sheet123 processed successfully.');
    });

    it('should allow null context', () => {
      mockSheetProcessor.process.mockReturnValue(undefined);

      const result = service.processSheet('sheet123', null);

      expect(result.success).toBe(true);
      expect(mockSheetProcessor.process).toHaveBeenCalledWith('sheet123', null, null);
    });

    it('should allow null sheetName', () => {
      mockSheetProcessor.process.mockReturnValue(undefined);

      const result = service.processSheet('sheet123', {}, null);

      expect(result.success).toBe(true);
      expect(mockSheetProcessor.process).toHaveBeenCalledWith('sheet123', {}, null);
    });
  });

  describe('processSheet() - layouts propagation', () => {
    let mockSheetProcessor;

    beforeEach(() => {
      mockSheetProcessor = {
        process: jest.fn()
      };
      service.sheetProcessor = mockSheetProcessor;
    });

    it('surfaces the resolved dynamic_columns layouts on success', () => {
      const layouts = [
        {
          sheetName: 'Sheet1',
          headerRow: 1,
          startColumn: 3,
          columns: [{ header: 'MAT', column: 3, isLabel: false }]
        }
      ];
      mockSheetProcessor.process.mockReturnValue({ layouts });

      const result = service.processSheet('sheet123', { condivise: [{ sigla: 'MAT' }] });

      expect(result).toEqual({ success: true, layouts });
    });

    it('returns success:false and empty layouts (not a thrown error) on failure', () => {
      mockSheetProcessor.process.mockImplementation(() => {
        throw new Error('boom');
      });

      const result = service.processSheet('sheet123', {});

      expect(result).toEqual({ success: false, layouts: [] });
    });
  });

  describe('processSheet() - Input Validation', () => {
    it('should throw TypeError if sheetId is not a string', () => {
      expect(() => {
        service.processSheet(123, {});
      }).toThrow('sheetId must be a non-empty string');
    });

    it('should throw TypeError if sheetId is empty', () => {
      expect(() => {
        service.processSheet('', {});
      }).toThrow('sheetId must be a non-empty string');
    });

    it('should throw TypeError if sheetId is whitespace only', () => {
      expect(() => {
        service.processSheet('   ', {});
      }).toThrow('sheetId must be a non-empty string');
    });

    it('should throw TypeError if context is not an object', () => {
      expect(() => {
        service.processSheet('sheet123', 'not an object');
      }).toThrow('context must be an object or null');
    });

    it('should throw TypeError if context is an array', () => {
      expect(() => {
        service.processSheet('sheet123', [1, 2, 3]);
      }).toThrow('context must be an object, not an array');
    });

    it('should throw TypeError if sheetName is not string or null', () => {
      expect(() => {
        service.processSheet('sheet123', {}, 123);
      }).toThrow('sheetName must be a string or null');
    });
  });

  describe('processSheet() - Error Handling', () => {
    let mockSheetProcessor;

    beforeEach(() => {
      mockSheetProcessor = {
        process: jest.fn()
      };
      service.sheetProcessor = mockSheetProcessor;
    });

    it('should return false on error', () => {
      mockSheetProcessor.process.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      const result = service.processSheet('sheet123', {});

      expect(result.success).toBe(false);
      expect(result.layouts).toEqual([]);
    });

    it('should log error on failure', () => {
      mockSheetProcessor.process.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      service.processSheet('sheet123', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process sheet sheet123')
      );
    });

    it('should log error details', () => {
      const error = new Error('Processing error');
      mockSheetProcessor.process.mockImplementation(() => {
        throw error;
      });

      service.processSheet('sheet123', {});

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(error.stack));
    });
  });

  describe('Integration Tests', () => {
    let mockDocProcessor;
    let mockSheetProcessor;

    beforeEach(() => {
      mockDocProcessor = {
        process: jest.fn()
      };
      mockSheetProcessor = {
        process: jest.fn()
      };
      service.documentProcessor = mockDocProcessor;
      service.sheetProcessor = mockSheetProcessor;
    });

    it('should support all three processing methods', () => {
      mockMustache.render.mockReturnValue('Processed string');
      mockDocProcessor.process.mockReturnValue(undefined);
      mockSheetProcessor.process.mockReturnValue(undefined);

      const stringResult = service.processString('{{value}}', { value: 'test' });
      const docResult = service.processDocument('doc123', { value: 'test' });
      const sheetResult = service.processSheet('sheet123', { value: 'test' });

      expect(stringResult).toBe('Processed string');
      expect(docResult).toBe(true);
      expect(sheetResult.success).toBe(true);
    });

    it('should maintain consistent error handling across methods', () => {
      mockMustache.render.mockImplementation(() => {
        throw new Error('Render error');
      });
      mockDocProcessor.process.mockImplementation(() => {
        throw new Error('Document error');
      });
      mockSheetProcessor.process.mockImplementation(() => {
        throw new Error('Sheet error');
      });

      const stringResult = service.processString('{{value}}', {});
      const docResult = service.processDocument('doc123', {});
      const sheetResult = service.processSheet('sheet123', {});

      expect(stringResult).toBe('{{value}}'); // Returns original template
      expect(docResult).toBe(false);
      expect(sheetResult.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledTimes(3);
    });
  });
});
