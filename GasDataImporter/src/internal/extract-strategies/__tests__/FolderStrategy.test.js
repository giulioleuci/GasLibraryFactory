/**
 * @fileoverview Tests for FolderStrategy
 * @author GasLibraryFactory
 */

import { FolderStrategy } from '../FolderStrategy.js';
import { SourceStrategy } from '../SourceStrategy.js';
import { SourceError } from '../../errors/SourceError.js';

describe('FolderStrategy - Comprehensive Test Suite', () => {
  let mockLogger;
  let mockDriveService;
  let mockSpreadsheetService;
  let strategy;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    // Mock DriveService - searchFiles returns array of file metadata
    mockDriveService = {
      searchFiles: jest.fn().mockReturnValue([
        { id: 'file1', name: 'Users.xlsx' },
        { id: 'file2', name: 'Employees.xlsx' }
      ])
    };

    // Mock SpreadsheetService - getSheetInfo and getRanges
    mockSpreadsheetService = {
      getSheetInfo: jest.fn().mockReturnValue([{ name: 'Sheet1', rowCount: 3, columnCount: 3 }]),
      getRanges: jest.fn().mockReturnValue([
        ['Name', 'Age', 'Email'],
        ['John', 30, 'john@example.com'],
        ['Jane', 25, 'jane@example.com']
      ])
    };

    strategy = new FolderStrategy(mockLogger, mockDriveService, mockSpreadsheetService);
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with logger, driveService, and spreadsheetService', () => {
      expect(strategy).toBeInstanceOf(FolderStrategy);
      expect(strategy).toBeInstanceOf(SourceStrategy);
      expect(strategy.logger).toBe(mockLogger);
      expect(strategy._driveService).toBe(mockDriveService);
      expect(strategy._spreadsheetService).toBe(mockSpreadsheetService);
    });

    it('should extend SourceStrategy', () => {
      expect(strategy instanceof SourceStrategy).toBe(true);
    });
  });

  // ===================================================================
  // extract() Method - Basic Functionality
  // ===================================================================
  describe('extract() Method - Basic Functionality', () => {
    it('should extract and merge data from multiple files', () => {
      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(4); // 2 rows per file x 2 files
      expect(mockDriveService.searchFiles).toHaveBeenCalledWith(
        "'folder123' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        { maxResults: 1000 }
      );
      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledTimes(2);
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledTimes(2);
    });

    it('should log folder processing', () => {
      const config = { folderId: 'test123' };

      strategy.extract(config);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Searching for spreadsheets in folder: test123'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('[FolderStrategy] Processing file: Users.xlsx');
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Processing file: Employees.xlsx'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Processed 2 files, extracted 4 total rows'
      );
    });

    it('should use hasHeaders=true by default', () => {
      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      // Should use first row as headers
      expect(result[0]).toHaveProperty('Name');
      expect(result[0]).toHaveProperty('Age');
      expect(result[0]).toHaveProperty('Email');
    });

    it('should handle hasHeaders=false', () => {
      const config = {
        folderId: 'folder123',
        hasHeaders: false
      };

      const result = strategy.extract(config);

      // Should generate Col_0, Col_1, Col_2
      expect(result[0]).toHaveProperty('Col_0');
      expect(result[0]).toHaveProperty('Col_1');
      expect(result[0]).toHaveProperty('Col_2');
      expect(result).toHaveLength(6); // 3 rows per file x 2 files (all rows included)
    });
  });

  // ===================================================================
  // mergeData Option Tests
  // ===================================================================
  describe('mergeData Option', () => {
    it('should merge data from all files by default', () => {
      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('Name');
    });

    it('should merge data when mergeData=true', () => {
      const config = {
        folderId: 'folder123',
        mergeData: true
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(4);
      expect(result[0]).not.toHaveProperty('fileName');
    });

    it('should nest data by file when mergeData=false', () => {
      const config = {
        folderId: 'folder123',
        mergeData: false
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2); // One entry per file
      expect(result[0]).toHaveProperty('fileName', 'Users.xlsx');
      expect(result[0]).toHaveProperty('fileId', 'file1');
      expect(result[0]).toHaveProperty('data');
      expect(result[0].data).toHaveLength(2);
      expect(result[1]).toHaveProperty('fileName', 'Employees.xlsx');
      expect(result[1]).toHaveProperty('fileId', 'file2');
    });
  });

  // ===================================================================
  // includeSourceFile Option Tests
  // ===================================================================
  describe('includeSourceFile Option', () => {
    it('should not include source file metadata by default', () => {
      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result[0]).not.toHaveProperty('_sourceFileName');
      expect(result[0]).not.toHaveProperty('_sourceFileId');
    });

    it('should include source file metadata when includeSourceFile=true', () => {
      const config = {
        folderId: 'folder123',
        includeSourceFile: true
      };

      const result = strategy.extract(config);

      expect(result[0]).toHaveProperty('_sourceFileName', 'Users.xlsx');
      expect(result[0]).toHaveProperty('_sourceFileId', 'file1');
      expect(result[2]).toHaveProperty('_sourceFileName', 'Employees.xlsx');
      expect(result[2]).toHaveProperty('_sourceFileId', 'file2');
    });

    it('should add source metadata to all rows', () => {
      const config = {
        folderId: 'folder123',
        includeSourceFile: true
      };

      const result = strategy.extract(config);

      result.forEach((row) => {
        expect(row).toHaveProperty('_sourceFileName');
        expect(row).toHaveProperty('_sourceFileId');
      });
    });
  });

  // ===================================================================
  // fileNamePattern Option Tests
  // ===================================================================
  describe('fileNamePattern Option', () => {
    it('should process all files when no pattern specified', () => {
      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(4); // Both files processed
    });

    it('should filter files by regex pattern', () => {
      const config = {
        folderId: 'folder123',
        fileNamePattern: '^Users'
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2); // Only Users.xlsx matches
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Skipping file (pattern mismatch): Employees.xlsx'
      );
    });

    it('should handle complex regex patterns', () => {
      const config = {
        folderId: 'folder123',
        fileNamePattern: '.*\\.xlsx$'
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(4); // Both files match .xlsx extension
    });

    it('should throw SourceError for invalid regex', () => {
      const config = {
        folderId: 'folder123',
        fileNamePattern: '[' // Invalid regex
      };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Invalid file name pattern regex');
        expect(error.code).toBe('INVALID_REGEX');
        expect(error.context).toHaveProperty('fileNamePattern', '[');
      }
    });

    it('should log pattern mismatches', () => {
      const config = {
        folderId: 'folder123',
        fileNamePattern: 'NonExistent'
      };

      strategy.extract(config);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Skipping file (pattern mismatch): Users.xlsx'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[FolderStrategy] Skipping file (pattern mismatch): Employees.xlsx'
      );
    });
  });

  // ===================================================================
  // Range and Tab Handling Tests
  // ===================================================================
  describe('Range and Tab Handling', () => {
    it('should use specified range for all files', () => {
      const config = {
        folderId: 'folder123',
        range: 'A1:C10'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file1', 'Sheet1!A1:C10');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file2', 'Sheet1!A1:C10');
    });

    it('should use specified tab name for all files', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Data', rowCount: 3, columnCount: 3 },
        { name: 'Sheet1', rowCount: 3, columnCount: 3 }
      ]);

      const config = {
        folderId: 'folder123',
        tabName: 'Data'
      };

      strategy.extract(config);

      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledTimes(2);
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file1', 'Data!A1:C3');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file2', 'Data!A1:C3');
    });

    it('should get all data when no range specified', () => {
      const config = { folderId: 'folder123' };

      strategy.extract(config);

      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalled();
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file1', 'Sheet1!A1:C3');
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledWith('file2', 'Sheet1!A1:C3');
    });
  });

  // ===================================================================
  // Error Handling Tests
  // ===================================================================
  describe('Error Handling', () => {
    it('should throw SourceError when folderId is missing', () => {
      const config = {};

      expect(() => {
        strategy.extract(config);
      }).toThrow(SourceError);

      expect(() => {
        strategy.extract(config);
      }).toThrow('Missing required configuration fields: folderId');
    });

    it('should return empty array when folder has no spreadsheets', () => {
      mockDriveService.searchFiles.mockReturnValue([]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[FolderStrategy] No spreadsheet files found in folder'
      );
    });

    it('should continue processing after file error', () => {
      // Make first file fail
      mockSpreadsheetService.getSheetInfo
        .mockReturnValueOnce([]) // First file fails (no sheets)
        .mockReturnValueOnce([{ name: 'Sheet1', rowCount: 3, columnCount: 3 }]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2); // Only second file's data
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process file Users.xlsx')
      );
    });

    it('should log individual file errors without stopping', () => {
      mockSpreadsheetService.getSheetInfo.mockImplementation((id) => {
        if (id === 'file1') {
          throw new Error('Permission denied');
        }
        return [{ name: 'Sheet1', rowCount: 3, columnCount: 3 }];
      });

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2); // Second file processed
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process file Users.xlsx')
      );
    });

    it('should wrap generic errors in SourceError', () => {
      mockDriveService.searchFiles.mockImplementation(() => {
        throw new Error('Network error');
      });

      const config = { folderId: 'folder123' };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Network error');
        expect(error.code).toBe('FOLDER_EXTRACTION_FAILED');
        expect(error.context).toHaveProperty('folderId', 'folder123');
        expect(error.context).toHaveProperty('originalError', 'Network error');
      }
    });

    it('should re-throw SourceError without wrapping', () => {
      const sourceError = new SourceError('Custom error', 'CUSTOM_CODE');
      mockDriveService.searchFiles.mockImplementation(() => {
        throw sourceError;
      });

      const config = { folderId: 'folder123' };

      expect(() => {
        strategy.extract(config);
      }).toThrow(sourceError);
    });
  });

  // ===================================================================
  // _extractFromFile() Helper Method Tests
  // ===================================================================
  describe('_extractFromFile() Helper Method', () => {
    it('should throw SourceError when spreadsheet has no sheets', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      // Should continue after error
      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledTimes(2); // Both files fail
    });

    it('should throw SourceError when tab not found', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'DifferentSheet', rowCount: 3, columnCount: 3 }
      ]);

      const config = {
        folderId: 'folder123',
        tabName: 'NonExistentTab'
      };

      const result = strategy.extract(config);

      // Should continue after error
      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledTimes(2); // Both files fail
    });

    it('should return empty array for empty sheet', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: 0, columnCount: 0 }
      ]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Sheet is empty in file')
      );
    });

    it('should return empty array when no data in range', () => {
      mockSpreadsheetService.getRanges.mockReturnValue([]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No data found in range')
      );
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should handle complete workflow with all options', () => {
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Data', rowCount: 3, columnCount: 3 }
      ]);

      const config = {
        folderId: 'folder123',
        range: 'A1:C',
        tabName: 'Data',
        hasHeaders: true,
        mergeData: true,
        includeSourceFile: true,
        fileNamePattern: '.*\\.xlsx$'
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('Name');
      expect(result[0]).toHaveProperty('_sourceFileName');
      expect(result[0]).toHaveProperty('_sourceFileId');
    });

    it('should handle single file in folder', () => {
      mockDriveService.searchFiles.mockReturnValue([{ id: 'file1', name: 'Only.xlsx' }]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2);
    });

    it('should handle large number of files efficiently', () => {
      const files = [];
      for (let i = 0; i < 10; i++) {
        files.push({ id: `file${i}`, name: `File${i}.xlsx` });
      }
      mockDriveService.searchFiles.mockReturnValue(files);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toHaveLength(20); // 2 rows per file x 10 files
      expect(mockSpreadsheetService.getSheetInfo).toHaveBeenCalledTimes(10);
      expect(mockSpreadsheetService.getRanges).toHaveBeenCalledTimes(10);
    });

    it('should work with mergeData=false and includeSourceFile=true', () => {
      const config = {
        folderId: 'folder123',
        mergeData: false,
        includeSourceFile: true
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2); // Two file objects
      expect(result[0].data[0]).toHaveProperty('_sourceFileName');
      expect(result[1].data[0]).toHaveProperty('_sourceFileId');
    });
  });

  // ===================================================================
  // Edge Cases
  // ===================================================================
  describe('Edge Cases', () => {
    it('should handle folder with mixed file types (only process sheets)', () => {
      // This is handled by searchFiles with mimeType filter
      const config = { folderId: 'folder123' };

      strategy.extract(config);

      expect(mockDriveService.searchFiles).toHaveBeenCalledWith(
        expect.stringContaining("mimeType='application/vnd.google-apps.spreadsheet'"),
        { maxResults: 1000 }
      );
    });

    it('should handle files with special characters in names', () => {
      mockDriveService.searchFiles.mockReturnValue([
        { id: 'file1', name: 'File (Copy) [2024].xlsx' }
      ]);

      const config = {
        folderId: 'folder123',
        includeSourceFile: true
      };

      const result = strategy.extract(config);

      expect(result[0]._sourceFileName).toBe('File (Copy) [2024].xlsx');
    });

    it('should handle files with very long names', () => {
      const longName = 'A'.repeat(200) + '.xlsx';
      mockDriveService.searchFiles.mockReturnValue([{ id: 'file1', name: longName }]);

      const config = {
        folderId: 'folder123',
        includeSourceFile: true
      };

      const result = strategy.extract(config);

      expect(result[0]._sourceFileName).toBe(longName);
    });

    it('should handle empty folder (no files at all)', () => {
      mockDriveService.searchFiles.mockReturnValue([]);

      const config = { folderId: 'folder123' };

      const result = strategy.extract(config);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[FolderStrategy] No spreadsheet files found in folder'
      );
    });
  });
});
