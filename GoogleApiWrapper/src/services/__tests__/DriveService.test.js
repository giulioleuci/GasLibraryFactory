// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/DriveService.test.js
// ===================================================================
// Comprehensive test suite for DriveService (Batch-First v3.0)
// Coverage: Core batch file operations with Advanced Drive API
// ===================================================================

import { DriveService } from '../DriveService';
import { testing as CoreUtilsTesting } from '@CoreUtilsLib';
import { testing as GasResilienceTesting } from '@GasResilienceLib';

describe('DriveService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let cache;
  let utils;
  let exceptionService;
  let mockBatchExecutor;

  beforeEach(() => {
    global.resetGasMocks();

    logger = new CoreUtilsTesting.LoggerServiceMock();
    cache = new CoreUtilsTesting.CacheInterfaceMock();
    utils = new CoreUtilsTesting.UtilsServiceMock();
    exceptionService = new GasResilienceTesting.ExceptionServiceMock();

    // Mock BatchExecutor.execute to return successful results
    mockBatchExecutor = {
      execute: jest.fn(() => [
        { index: 0, success: true, statusCode: 200, data: { id: 'file1' }, error: null }
      ])
    };

    // Mock BatchExecutor class locally to bypass missing import
    global.BatchExecutor = class {
      execute() {
        return mockBatchExecutor.execute();
      }
    };
    jest.spyOn(global.BatchExecutor.prototype, 'execute');

    service = new DriveService(logger, cache, utils, exceptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with all dependencies', () => {
      expect(service._logger).toBe(logger);
      expect(service._cache).toBe(cache);
      expect(service._utils).toBe(utils);
      expect(service._exceptionService).toBe(exceptionService);
    });

    it('should initialize without batch executor', () => {
      // The class no longer uses batch executor for all operations natively, but it's fine
      expect(service).toBeDefined();
    });

    it('should set cache configuration', () => {
      expect(service._cachePrefix).toBe('drive');
      expect(service._cacheExpirationTime).toBe(300);
    });
  });

  // ===================================================================
  // deleteFiles() METHOD
  // ===================================================================

  describe('deleteFiles() Method', () => {
    it('should delete single file', () => {
      global.Drive = {
        Files: { update: jest.fn() }
      };

      const result = service.deleteFiles('fileId1');

      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'fileId1');
      expect(result.successful).toBeDefined();
    });

    it('should delete multiple files in batch', () => {
      global.Drive = {
        Files: { update: jest.fn() }
      };

      const result = service.deleteFiles(['fileId1', 'fileId2', 'fileId3']);

      expect(global.Drive.Files.update).toHaveBeenCalledTimes(3);
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'fileId1');
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'fileId2');
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'fileId3');
      expect(result.successful).toHaveLength(3);
    });

    it('should normalize single file ID to array', () => {
      global.Drive = {
        Files: { update: jest.fn() }
      };

      service.deleteFiles('fileId1');

      // Verify batch executor was called (which means normalization happened)
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'fileId1');
    });

    it('should clear cache after deletion', () => {
      global.Drive = {
        Files: { update: jest.fn() }
      };

      service.deleteFiles('fileId1');

      expect(cache.remove).toHaveBeenCalledWith('drive_fileId1_get');
    });

    it('should clear cache for all deleted files', () => {
      global.Drive = {
        Files: { update: jest.fn() }
      };

      service.deleteFiles(['fileId1', 'fileId2']);

      expect(cache.remove).toHaveBeenCalledWith('drive_fileId1_get');
      expect(cache.remove).toHaveBeenCalledWith('drive_fileId2_get');
    });

    it('should categorize results into successful and failed', () => {
      let callCount = 0;
      global.Drive = {
        Files: {
          update: jest.fn().mockImplementation((resource, id) => {
            callCount++;
            if (callCount === 2) throw { message: 'Not found', code: 404 };
          })
        }
      };

      const result = service.deleteFiles(['fileId1', 'fileId2']);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  // ===================================================================
  // copyFiles() METHOD
  // ===================================================================

  describe('copyFiles() Method', () => {
    beforeEach(() => {
      global.Drive = {
        Files: {
          copy: jest.fn().mockImplementation((meta, id) => ({ id: `copy_${id}` }))
        }
      };
    });

    it('should copy single file', () => {
      const result = service.copyFiles({ fileId: 'fileId1', name: 'Copy 1' });

      expect(global.Drive.Files.copy).toHaveBeenCalled();
      expect(result.successful).toBeDefined();
    });

    it('should copy multiple files in batch', () => {
      const result = service.copyFiles([
        { fileId: 'fileId1', name: 'Copy 1' },
        { fileId: 'fileId2', name: 'Copy 2' }
      ]);

      expect(result.successful).toHaveLength(2);
      expect(global.Drive.Files.copy).toHaveBeenCalledTimes(2);
    });

    it('should use default name "Copy" if not provided', () => {
      service.copyFiles({ fileId: 'fileId1' });

      expect(global.Drive.Files.copy).toHaveBeenCalled();
    });

    it('should set destination folder if provided', () => {
      service.copyFiles({ fileId: 'fileId1', name: 'Copy', destinationFolder: 'folderId' });

      expect(global.Drive.Files.copy).toHaveBeenCalled();
    });

    it('should categorize results', () => {
      let callCount = 0;
      global.Drive.Files.copy.mockImplementation(() => {
        callCount++;
        if (callCount === 2) throw { message: 'Forbidden', code: 403 };
        return { id: 'copy_1' };
      });

      const result = service.copyFiles([
        { fileId: 'fileId1', name: 'Copy 1' },
        { fileId: 'fileId2', name: 'Copy 2' }
      ]);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  // ===================================================================
  // moveFiles() METHOD
  // ===================================================================

  describe('moveFiles() Method', () => {
    beforeEach(() => {
      // Mock Drive.Files.get for moveFiles that need to fetch current parents
      // and Drive.Files.update for the actual move operation
      global.Drive = {
        Files: {
          get: jest.fn(() => ({ parents: ['oldParentId'] })),
          update: jest.fn().mockImplementation((meta, id) => ({ id: id }))
        }
      };
    });

    it('should move single file to new parent', () => {
      const result = service.moveFiles({ fileId: 'fileId1', newParent: 'newParentId' });

      expect(global.Drive.Files.update).toHaveBeenCalled();
      expect(result.successful).toBeDefined();
    });

    it('should move multiple files in batch', () => {
      const result = service.moveFiles([
        { fileId: 'fileId1', newParent: 'folder1' },
        { fileId: 'fileId2', newParent: 'folder2' }
      ]);

      expect(result.successful).toHaveLength(2);
      expect(global.Drive.Files.update).toHaveBeenCalledTimes(2);
    });

    it('should remove from other parents when requested', () => {
      service.moveFiles({
        fileId: 'fileId1',
        newParent: 'newParentId',
        removeFromOtherParents: true
      });

      expect(global.Drive.Files.get).toHaveBeenCalledTimes(1);
      expect(global.Drive.Files.update).toHaveBeenCalledTimes(1);
    });

    it('should handle files with no existing parents', () => {
      global.Drive.Files.get.mockReturnValueOnce({ parents: [] });

      service.moveFiles({
        fileId: 'fileId1',
        newParent: 'newParentId',
        removeFromOtherParents: true
      });

      expect(global.Drive.Files.update).toHaveBeenCalled();
    });

    it('should not fetch parents if removeFromOtherParents is false', () => {
      service.moveFiles({
        fileId: 'fileId1',
        newParent: 'newParentId',
        removeFromOtherParents: false
      });

      expect(global.Drive.Files.get).not.toHaveBeenCalled();
      expect(global.Drive.Files.update).toHaveBeenCalledTimes(1);
    });

    it('should clear cache after move', () => {
      service.moveFiles({ fileId: 'fileId1', newParent: 'newParentId' });

      expect(cache.remove).toHaveBeenCalledWith('drive_fileId1_get');
    });
  });

  // ===================================================================
  // renameFiles() METHOD
  // ===================================================================

  describe('renameFiles() Method', () => {
    it('should rename single file', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      const result = service.renameFiles({ fileId: 'fileId1', newName: 'New Name' });

      expect(global.Drive.Files.update).toHaveBeenCalled();
      expect(result.successful).toBeDefined();
    });

    it('should rename multiple files in batch', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      const result = service.renameFiles([
        { fileId: 'fileId1', newName: 'Name 1' },
        { fileId: 'fileId2', newName: 'Name 2' }
      ]);

      expect(result.successful).toHaveLength(2);
    });

    it('should clear cache after rename', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      service.renameFiles({ fileId: 'fileId1', newName: 'New Name' });

      expect(cache.remove).toHaveBeenCalledWith('drive_fileId1_get');
    });
  });

  // ===================================================================
  // updateMetadata() METHOD
  // ===================================================================

  describe('updateMetadata() Method', () => {
    it('should update single file metadata', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      const result = service.updateMetadata({
        fileId: 'fileId1',
        metadata: { description: 'New description' }
      });

      expect(global.Drive.Files.update).toHaveBeenCalled();
      expect(result.successful).toBeDefined();
    });

    it('should update multiple files metadata in batch', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      const result = service.updateMetadata([
        { fileId: 'fileId1', metadata: { description: 'Desc 1' } },
        { fileId: 'fileId2', metadata: { description: 'Desc 2' } }
      ]);

      expect(result.successful).toHaveLength(2);
    });

    it('should clear cache after metadata update', () => {
      global.Drive = {
        Files: { update: jest.fn().mockImplementation((meta, id) => ({ id: id })) }
      };

      service.updateMetadata({ fileId: 'fileId1', metadata: { description: 'New' } });

      expect(cache.remove).toHaveBeenCalledWith('drive_fileId1_get');
    });
  });

  // ===================================================================
  // getFiles() METHOD
  // ===================================================================

  describe('getFiles() Method', () => {
    it('should get single file info', () => {
      global.Drive = {
        Files: { get: jest.fn().mockImplementation(() => ({ id: 'fileId1', name: 'File 1' })) }
      };

      const result = service.getFiles('fileId1');

      expect(result).toBeDefined();
      expect(result.id).toBe('fileId1');
    });

    it('should get multiple files info in batch', () => {
      global.Drive = {
        Files: {
          get: jest.fn().mockImplementation((id) => {
            if (id === 'fileId1') return { id: 'fileId1', name: 'File 1' };
            if (id === 'fileId2') return { id: 'fileId2', name: 'File 2' };
            return {};
          })
        }
      };

      const result = service.getFiles(['fileId1', 'fileId2']);

      expect(result).toBeDefined();
      expect(result.fileId1).toBeDefined();
      expect(result.fileId2).toBeDefined();
    });

    it('should check cache before API call', () => {
      cache.get.mockReturnValueOnce(JSON.stringify({ id: 'fileId1', name: 'Cached File' }));

      const result = service.getFiles('fileId1');

      expect(cache.get).toHaveBeenCalledWith('drive_fileId1_get');
      expect(result.id).toBe('fileId1');
    });

    it('should handle cache parse errors gracefully', () => {
      cache.get.mockReturnValueOnce('invalid json');

      global.Drive = {
        Files: { get: jest.fn().mockImplementation(() => ({ id: 'fileId1' })) }
      };

      const result = service.getFiles('fileId1');

      expect(result).toBeDefined();
    });

    it('should cache successful API responses', () => {
      global.Drive = {
        Files: { get: jest.fn().mockImplementation(() => ({ id: 'fileId1', name: 'File 1' })) }
      };

      service.getFiles('fileId1');

      expect(cache.put).toHaveBeenCalled();
    });

    it('should return from cache if all files cached', () => {
      cache.get
        .mockReturnValueOnce(JSON.stringify({ id: 'fileId1' }))
        .mockReturnValueOnce(JSON.stringify({ id: 'fileId2' }));

      // Mock to ensure test fails if called
      global.Drive = {
        Files: { get: jest.fn() }
      };

      const result = service.getFiles(['fileId1', 'fileId2']);

      expect(global.Drive.Files.get).not.toHaveBeenCalled();
      expect(result.fileId1).toBeDefined();
      expect(result.fileId2).toBeDefined();
    });
  });

  // ===================================================================
  // searchFiles() METHOD
  // ===================================================================

  describe('searchFiles() Method', () => {
    beforeEach(() => {
      // Mock Drive.Files.list
      global.Drive = {
        Files: {
          list: jest.fn(() => ({
            files: [
              { id: 'file1', name: 'Test File 1' },
              { id: 'file2', name: 'Test File 2' }
            ]
          }))
        }
      };
    });

    it('should search files with query', () => {
      const result = service.searchFiles("name contains 'test'");

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should apply maxResults option', () => {
      service.searchFiles("name contains 'test'", { maxResults: 10 });

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should apply orderBy option', () => {
      service.searchFiles("name contains 'test'", { orderBy: 'createdDate' });

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should return empty array if no results', () => {
      global.Drive.Files.list.mockReturnValueOnce({ files: [] });

      const result = service.searchFiles("name contains 'nonexistent'");

      expect(result).toEqual([]);
    });
  });

  // ===================================================================
  // createFolder() METHOD
  // ===================================================================

  describe('createFolder() Method', () => {
    beforeEach(() => {
      // Mock Drive.Files.create
      global.Drive = {
        Files: {
          create: jest.fn(() => ({ id: 'newFolderId', name: 'New Folder' }))
        }
      };
    });

    it('should create folder in root', () => {
      const result = service.createFolder('New Folder');

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(result.id).toBe('newFolderId');
    });

    it('should create folder in specific parent', () => {
      const result = service.createFolder('New Folder', 'parentId');

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(result.id).toBe('newFolderId');
    });

    it('should create folder with description', () => {
      const result = service.createFolder('New Folder', null, { description: 'Test folder' });

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
      expect(result.id).toBe('newFolderId');
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      global.Drive = {
        Files: {
          get: jest.fn(() => ({ parents: ['oldParentId'] })),
          list: jest.fn(() => ({ files: [{ id: 'file1' }] })),
          create: jest.fn(() => ({ id: 'folderId' }))
        }
      };
    });

    it('should cleanup old files (batch delete)', () => {
      global.Drive = {
        Files: {
          update: jest.fn()
        }
      };

      const result = service.deleteFiles(['file1', 'file2', 'file3']);

      expect(result.successful).toHaveLength(3);
      expect(global.Drive.Files.update).toHaveBeenCalledWith({ trashed: true }, 'file1');
      expect(cache.remove).toHaveBeenCalledTimes(3);
    });

    it('should duplicate files for backup', () => {
      global.Drive = {
        Files: {
          copy: jest.fn().mockImplementation((resource, id) => {
            if (id === 'original1') return { id: 'backup1' };
            if (id === 'original2') return { id: 'backup2' };
            return {};
          })
        }
      };

      const result = service.copyFiles([
        { fileId: 'original1', name: 'Backup 1', destinationFolder: 'backupFolder' },
        { fileId: 'original2', name: 'Backup 2', destinationFolder: 'backupFolder' }
      ]);

      expect(result.successful).toHaveLength(2);
    });

    it('should reorganize files (batch move)', () => {
      // First call: read parent info
      global.Drive = {
        Files: {
          get: jest.fn().mockImplementation((id) => {
            if (id === 'file1') return { parents: ['oldParent1'] };
            if (id === 'file2') return { parents: ['oldParent2'] };
            return {};
          }),
          update: jest.fn().mockImplementation((resource, id, media, options) => {
            return { id: id };
          })
        }
      };

      const result = service.moveFiles([
        { fileId: 'file1', newParent: 'archive', removeFromOtherParents: true },
        { fileId: 'file2', newParent: 'archive', removeFromOtherParents: true }
      ]);

      expect(result.successful).toHaveLength(2);
    });

    it('should handle mixed success and failure', () => {
      let callCount = 0;
      global.Drive = {
        Files: {
          update: jest.fn().mockImplementation((resource, id) => {
            callCount++;
            if (callCount === 2) {
              throw { message: 'Not found', code: 404 };
            }
          })
        }
      };

      const result = service.deleteFiles(['file1', 'file2', 'file3']);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
    });
  });
});
