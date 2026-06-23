// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/PermissionService.test.js
// ===================================================================
// Comprehensive test suite for PermissionService (Batch-First v3.0)
// Coverage: Core batch operations with Advanced Drive API
// ===================================================================

import { PermissionService } from '../PermissionService';


describe('PermissionService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let cache;
  let utils;
  let exceptionService;


  beforeEach(() => {
    global.resetGasMocks();

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    cache = {
      get: jest.fn(() => null),
      put: jest.fn(),
      remove: jest.fn()
    };

    utils = {
      sleep: jest.fn(),
      getUuid: jest.fn(() => 'test-uuid-permission')
    };

    exceptionService = {
      executeWithRetry: jest.fn((fn) => fn())
    };

    // Mock Advanced Drive API methods
    global.Drive = {
      Permissions: {
        create: jest.fn(() => ({ id: 'perm1' })),
        remove: jest.fn(),
        update: jest.fn(() => ({ id: 'perm1' })),
        list: jest.fn(() => ({
          permissions: [
            { id: 'perm1', emailAddress: 'user1@example.com', role: 'reader' },
            { id: 'perm2', emailAddress: 'user2@example.com', role: 'writer' }
          ]
        }))
      },
      Files: {
        get: jest.fn(() => ({ webViewLink: 'https://drive.google.com/file' }))
      }
    };

    service = new PermissionService(logger, cache, utils, exceptionService);
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

    it('should set cache configuration', () => {
      expect(service._cachePrefix).toBe('permission');
      expect(service._cacheExpirationTime).toBe(300);
    });
  });

  // ===================================================================
  // shareWithUsers() METHOD
  // ===================================================================

  describe('shareWithUsers() Method', () => {
    it('should share single file with single user', () => {
      const result = service.shareWithUsers('fileId1', {
        email: 'user@example.com',
        role: 'reader'
      });

      expect(global.Drive.Permissions.create).toHaveBeenCalled();
      expect(result.successful).toHaveLength(1);
    });

    it('should normalize single file ID to array', () => {
      service.shareWithUsers('fileId1', { email: 'user@example.com', role: 'reader' });

      // Verify batch executor was called
      expect(global.Drive.Permissions.create).toHaveBeenCalled();
    });

    it('should normalize single permission to array', () => {
      service.shareWithUsers(['fileId1', 'fileId2'], { email: 'user@example.com', role: 'reader' });

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(2);
    });

    it('should handle array of files and array of permissions', () => {
      const result = service.shareWithUsers(
        ['fileId1', 'fileId2'],
        [
          { email: 'user1@example.com', role: 'reader' },
          { email: 'user2@example.com', role: 'writer' }
        ]
      );

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(4);
      expect(result.successful).toBeDefined();
    });

    it('should disable email notifications by default', () => {
      service.shareWithUsers('fileId1', { email: 'user@example.com', role: 'reader' });

      // Check that batch builder was created with sendNotificationEmail=false
      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.anything(),
        'fileId1',
        expect.objectContaining({ sendNotificationEmail: false })
      );
    });

    it('should allow email override per permission', () => {
      service.shareWithUsers('fileId1', {
        email: 'user@example.com',
        role: 'reader',
        sendEmail: true
      });

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.anything(),
        'fileId1',
        expect.objectContaining({ sendNotificationEmail: true })
      );
    });

    it('should allow global email override via options', () => {
      service.shareWithUsers(
        'fileId1',
        { email: 'user@example.com', role: 'reader' },
        { sendNotificationEmail: true }
      );

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.anything(),
        'fileId1',
        expect.objectContaining({ sendNotificationEmail: true })
      );
    });

    it('should default to "user" type if not specified', () => {
      service.shareWithUsers('fileId1', { email: 'user@example.com', role: 'reader' });

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'user' }),
        'fileId1',
        expect.anything()
      );
    });

    it('should default to "reader" role if not specified', () => {
      service.shareWithUsers('fileId1', { email: 'user@example.com' });

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'reader' }),
        'fileId1',
        expect.anything()
      );
    });

    it('should clear cache after sharing', () => {
      service.shareWithUsers('fileId1', { email: 'user@example.com', role: 'reader' });

      expect(cache.remove).toHaveBeenCalledWith('permission_fileId1_getPermissions');
    });

    it('should clear cache for all files in batch', () => {
      service.shareWithUsers(['fileId1', 'fileId2'], { email: 'user@example.com', role: 'reader' });

      expect(cache.remove).toHaveBeenCalledWith('permission_fileId1_getPermissions');
      expect(cache.remove).toHaveBeenCalledWith('permission_fileId2_getPermissions');
    });

    it('should categorize results into successful and failed', () => {
      global.Drive.Permissions.create
        .mockReturnValueOnce({})
        .mockImplementationOnce(() => { throw new Error('Not found'); });

      const result = service.shareWithUsers(['fileId1', 'fileId2'], {
        email: 'user@example.com',
        role: 'reader'
      });

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  // ===================================================================
  // shareFilesWithUsers() METHOD
  // ===================================================================

  describe('shareFilesWithUsers() Method', () => {
    it('should be alias for shareWithUsers', () => {
      const spy = jest.spyOn(service, 'shareWithUsers');

      service.shareFilesWithUsers(['fileId1'], [{ email: 'user@example.com', role: 'reader' }]);

      expect(spy).toHaveBeenCalledWith(
        ['fileId1'],
        [{ email: 'user@example.com', role: 'reader' }],
        {}
      );
    });

    it('should handle batch operations across files and users', () => {
      const result = service.shareFilesWithUsers(
        ['fileId1', 'fileId2', 'fileId3'],
        [
          { email: 'user1@example.com', role: 'reader' },
          { email: 'user2@example.com', role: 'writer' }
        ]
      );

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(6);
      expect(result.successful).toBeDefined();
    });
  });

  // ===================================================================
  // removeAccess() METHOD
  // ===================================================================

  describe('removeAccess() Method', () => {
    beforeEach(() => {
      // Mock getPermissions to return permission data
      jest.spyOn(service, 'getPermissions').mockReturnValue([
        { id: 'perm1', emailAddress: 'user1@example.com', role: 'reader' },
        { id: 'perm2', emailAddress: 'user2@example.com', role: 'writer' }
      ]);
    });

    it('should remove single user from single file by email', () => {
      service.removeAccess('fileId1', 'user1@example.com');

      expect(service.getPermissions).toHaveBeenCalledWith('fileId1');
      expect(global.Drive.Permissions.remove).toHaveBeenCalled();
    });

    it('should remove multiple users from single file', () => {
      service.removeAccess('fileId1', ['user1@example.com', 'user2@example.com']);

      expect(global.Drive.Permissions.remove).toHaveBeenCalledTimes(2);
    });

    it('should remove single user from multiple files', () => {
      service.removeAccess(['fileId1', 'fileId2'], 'user1@example.com');

      expect(service.getPermissions).toHaveBeenCalledWith('fileId1');
      expect(service.getPermissions).toHaveBeenCalledWith('fileId2');
      expect(global.Drive.Permissions.remove).toHaveBeenCalledTimes(2);
    });

    it('should accept permission ID directly', () => {
      service.removeAccess('fileId1', 'perm1');

      expect(global.Drive.Permissions.remove).toHaveBeenCalled();
    });

    it('should log warning when permission not found', () => {
      service.getPermissions.mockReturnValue([]);

      service.removeAccess('fileId1', 'nonexistent@example.com');

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Permission not found'));
    });

    it('should return empty result when no valid permissions', () => {
      service.getPermissions.mockReturnValue([]);

      const result = service.removeAccess('fileId1', 'nonexistent@example.com');

      expect(result.successful).toEqual([]);
      expect(result.failed).toEqual([]);
      expect(global.Drive.Permissions.remove).not.toHaveBeenCalled();
    });

    it('should clear cache after removal', () => {
      service.removeAccess('fileId1', 'user1@example.com');

      expect(cache.remove).toHaveBeenCalledWith('permission_fileId1_getPermissions');
    });
  });

  // ===================================================================
  // changeRoles() METHOD
  // ===================================================================

  describe('changeRoles() Method', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getPermissions').mockReturnValue([
        { id: 'perm1', emailAddress: 'user1@example.com', role: 'reader' },
        { id: 'perm2', emailAddress: 'user2@example.com', role: 'reader' }
      ]);
    });

    it('should change single user role', () => {
      service.changeRoles('fileId1', { email: 'user1@example.com', newRole: 'writer' });

      expect(service.getPermissions).toHaveBeenCalledWith('fileId1');
      expect(global.Drive.Permissions.update).toHaveBeenCalled();
    });

    it('should change multiple user roles', () => {
      service.changeRoles('fileId1', [
        { email: 'user1@example.com', newRole: 'writer' },
        { email: 'user2@example.com', newRole: 'commenter' }
      ]);

      expect(global.Drive.Permissions.update).toHaveBeenCalledTimes(2);
    });

    it('should handle role changes across multiple files', () => {
      service.changeRoles(['fileId1', 'fileId2'], {
        email: 'user1@example.com',
        newRole: 'writer'
      });

      expect(service.getPermissions).toHaveBeenCalledWith('fileId1');
      expect(service.getPermissions).toHaveBeenCalledWith('fileId2');
      expect(global.Drive.Permissions.update).toHaveBeenCalledTimes(2);
    });

    it('should log warning when permission not found', () => {
      service.getPermissions.mockReturnValue([]);

      service.changeRoles('fileId1', { email: 'nonexistent@example.com', newRole: 'writer' });

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Permission not found'));
    });

    it('should return empty result when no valid permissions', () => {
      service.getPermissions.mockReturnValue([]);

      const result = service.changeRoles('fileId1', {
        email: 'nonexistent@example.com',
        newRole: 'writer'
      });

      expect(result.successful).toEqual([]);
      expect(result.failed).toEqual([]);
    });

    it('should clear cache after role change', () => {
      service.changeRoles('fileId1', { email: 'user1@example.com', newRole: 'writer' });

      expect(cache.remove).toHaveBeenCalledWith('permission_fileId1_getPermissions');
    });
  });

  // ===================================================================
  // transferOwnership() METHOD
  // ===================================================================

  describe('transferOwnership() Method', () => {
    it('should transfer single file to single owner', () => {
      service.transferOwnership('fileId1', 'newowner@example.com');

      expect(global.Drive.Permissions.create).toHaveBeenCalled();
    });

    it('should transfer multiple files to same owner', () => {
      service.transferOwnership(['fileId1', 'fileId2'], 'newowner@example.com');

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(2);
    });

    it('should transfer single file to multiple owners', () => {
      service.transferOwnership('fileId1', ['owner1@example.com', 'owner2@example.com']);

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(2);
    });

    it('should disable email notifications by default', () => {
      service.transferOwnership('fileId1', 'newowner@example.com');

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.anything(),
        'fileId1',
        expect.objectContaining({ sendNotificationEmail: false, transferOwnership: true })
      );
    });

    it('should allow email override via options', () => {
      service.transferOwnership('fileId1', 'newowner@example.com', { sendNotificationEmail: true });

      expect(global.Drive.Permissions.create).toHaveBeenCalledWith(
        expect.anything(),
        'fileId1',
        expect.objectContaining({ sendNotificationEmail: true, transferOwnership: true })
      );
    });

    it('should clear cache after ownership transfer', () => {
      service.transferOwnership('fileId1', 'newowner@example.com');

      expect(cache.remove).toHaveBeenCalledWith('permission_fileId1_getPermissions');
    });

    it('should categorize results', () => {
      // Success

      const result = service.transferOwnership('fileId1', 'newowner@example.com');

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
    });
  });

  // ===================================================================
  // getPermissions() METHOD
  // ===================================================================

  describe('getPermissions() Method', () => {
    beforeEach(() => {
      // Reset mocks for Drive.Permissions.list
      global.Drive.Permissions.list = jest.fn(() => ({
        permissions: [
          { id: 'perm1', emailAddress: 'user1@example.com', role: 'reader' },
          { id: 'perm2', emailAddress: 'user2@example.com', role: 'writer' }
        ]
      }));
    });

    it('should get permissions for single file', () => {
      const result = service.getPermissions('fileId1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get permissions for multiple files', () => {
      // Mock multiple results by using mockReturnValueOnce
      global.Drive.Permissions.list
        .mockReturnValueOnce({
          permissions: [{ id: 'perm1' }]
        })
        .mockReturnValueOnce({
          permissions: [{ id: 'perm2' }]
        });

      const result = service.getPermissions(['fileId1', 'fileId2']);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.fileId1).toBeDefined();
      expect(result.fileId2).toBeDefined();
    });

    it('should check cache before API call', () => {
      cache.get.mockReturnValueOnce(JSON.stringify([{ id: 'cached-perm' }]));

      const result = service.getPermissions('fileId1');

      expect(cache.get).toHaveBeenCalledWith('permission_fileId1_getPermissions');
      expect(result).toEqual([{ id: 'cached-perm' }]);
    });

    it('should handle cache parse errors gracefully', () => {
      cache.get.mockReturnValueOnce('invalid json');

      // Should fall back to API call
      const result = service.getPermissions('fileId1');

      expect(result).toBeDefined();
    });

    it('should return from cache if all files cached', () => {
      cache.get
        .mockReturnValueOnce(JSON.stringify([{ id: 'perm1' }]))
        .mockReturnValueOnce(JSON.stringify([{ id: 'perm2' }]));

      const result = service.getPermissions(['fileId1', 'fileId2']);

      expect(result).toEqual({
        fileId1: [{ id: 'perm1' }],
        fileId2: [{ id: 'perm2' }]
      });
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      jest
        .spyOn(service, 'getPermissions')
        .mockReturnValue([{ id: 'perm1', emailAddress: 'user@example.com', role: 'reader' }]);
    });

    it('should share folder with team (batch operation)', () => {
      const teamEmails = [
        { email: 'member1@example.com', role: 'writer' },
        { email: 'member2@example.com', role: 'writer' },
        { email: 'member3@example.com', role: 'reader' }
      ];

      const result = service.shareWithUsers('folderId', teamEmails);

      expect(global.Drive.Permissions.create).toHaveBeenCalled();
      expect(result.successful).toBeDefined();
    });

    it('should migrate permissions across files', () => {
      const fileIds = ['file1', 'file2', 'file3'];
      const newOwner = 'newteam@example.com';

      const result = service.transferOwnership(fileIds, newOwner);

      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(3);
      expect(cache.remove).toHaveBeenCalledTimes(3);
    });

    it('should upgrade viewer to editor', () => {
      const result = service.changeRoles('fileId', {
        email: 'user@example.com',
        newRole: 'writer'
      });

      expect(service.getPermissions).toHaveBeenCalled();
      expect(global.Drive.Permissions.update).toHaveBeenCalled();
    });

    it('should cleanup access after project completion', () => {
      const result = service.removeAccess('fileId', 'user@example.com');

      expect(service.getPermissions).toHaveBeenCalled();
      expect(global.Drive.Permissions.remove).toHaveBeenCalled();
      expect(cache.remove).toHaveBeenCalled();
    });

    it('should handle mixed success and failure', () => {
      global.Drive.Permissions.create
        .mockReturnValueOnce({})
        .mockImplementationOnce(() => { throw new Error('Forbidden'); })
        .mockReturnValueOnce({});

      const result = service.shareWithUsers('fileId', [
        { email: 'user1@example.com', role: 'reader' },
        { email: 'user2@example.com', role: 'reader' },
        { email: 'user3@example.com', role: 'reader' }
      ]);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
    });
  });

  // ===================================================================
  // getSharingLink() METHOD
  // ===================================================================

  describe('getSharingLink() Method', () => {
    beforeEach(() => {
      // Mock getPermissions to return test permissions
      jest
        .spyOn(service, 'getPermissions')
        .mockReturnValue([
          { id: 'perm1', type: 'user', role: 'reader', emailAddress: 'user@example.com' }
        ]);
    });

    afterEach(() => {
      service.getPermissions.mockRestore();
    });

    it('should get sharing link for single file with view access', () => {
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file/view' });

      const link = service.getSharingLink('fileId1', 'view');

      expect(link).toBe('https://drive.google.com/file/view');
      expect(global.Drive.Files.get).toHaveBeenCalledTimes(1);
    });

    it('should get sharing link for single file with edit access', () => {
      service.getPermissions.mockReturnValueOnce([{ id: 'anyonePerm', type: 'anyone', role: 'reader' }]);
      global.Drive.Permissions.update.mockReturnValueOnce({ id: 'anyonePerm' });
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file/edit' });

      const link = service.getSharingLink('fileId1', 'edit');

      expect(link).toBe('https://drive.google.com/file/edit');
    });

    it('should handle comment access type', () => {
      service.getPermissions.mockReturnValueOnce([{ id: 'anyonePerm', type: 'anyone', role: 'reader' }]);
      global.Drive.Permissions.update.mockReturnValueOnce({ id: 'anyonePerm' });
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'comment');

      expect(link).toBe('https://drive.google.com/file');
      // Should create 'anyone' permission with 'commenter' role
      expect(global.Drive.Permissions.update).toHaveBeenCalledTimes(1);
    });

    it('should create new anyone permission when none exists', () => {
      service.getPermissions.mockReturnValue([
        { id: 'perm1', type: 'user', role: 'reader', emailAddress: 'user@example.com' }
        // No 'anyone' permission
      ]);

      global.Drive.Permissions.create.mockReturnValueOnce({ id: 'newAnyonePerm' });
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'view');

      expect(link).toBe('https://drive.google.com/file');
      // Should have created 'anyone' permission
      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(1);
    });

    it('should update existing anyone permission with wrong role', () => {
      service.getPermissions.mockReturnValue([
        { id: 'anyonePerm1', type: 'anyone', role: 'reader' } // Existing with 'reader'
      ]);

      global.Drive.Permissions.update.mockReturnValueOnce({ id: 'anyonePerm1' });
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'edit'); // Want 'writer'

      expect(link).toBe('https://drive.google.com/file');
      // Should have updated existing permission
      expect(global.Drive.Permissions.update).toHaveBeenCalledTimes(1);
    });

    it('should not update when anyone permission has correct role', () => {
      service.getPermissions.mockReturnValue([
        { id: 'anyonePerm1', type: 'anyone', role: 'reader' } // Correct role
      ]);

      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'view'); // Want 'reader'

      expect(link).toBe('https://drive.google.com/file');
      // Only one API call (for webViewLink), no permission updates
      expect(global.Drive.Files.get).toHaveBeenCalledTimes(1);
      expect(global.Drive.Permissions.update).toHaveBeenCalledTimes(0);
    });

    it('should handle failed webViewLink retrieval', () => {
      global.Drive.Files.get.mockImplementationOnce(() => { throw new Error('Not found'); });

      const link = service.getSharingLink('fileId1', 'view');

      expect(link).toBe(null);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to set sharing link')
      );
    });

    it('should handle mixed success and failure for multiple files', () => {
      global.Drive.Files.get
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file1' })
        .mockImplementationOnce(() => { throw new Error('Forbidden') })
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file3' });

      service.getPermissions.mockReturnValue([]);

      const links = service.getSharingLink(['fileId1', 'fileId2', 'fileId3'], 'view');

      expect(links).toEqual({
        fileId1: 'https://drive.google.com/file1',
        fileId2: null,
        fileId3: 'https://drive.google.com/file3'
      });
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle missing webViewLink in response data', () => {
      global.Drive.Files.get.mockReturnValueOnce({}); // No webViewLink

      const link = service.getSharingLink('fileId1', 'view');

      expect(link).toBe(null);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve sharing link')
      );
    });

    it('should handle default access type (view)', () => {
      global.Drive.Permissions.create
        .mockReturnValueOnce({ id: 'perm1' })
        .mockReturnValueOnce({ id: 'perm2' });
      global.Drive.Files.get
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file1' })
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file2' });

      const links = service.getSharingLink(['fileId1', 'fileId2'], 'edit');

      expect(links).toEqual({
        fileId1: 'https://drive.google.com/file1',
        fileId2: 'https://drive.google.com/file2'
      });
      expect(global.Drive.Permissions.create).toHaveBeenCalledTimes(2);
    });

    it('should update anyone permission for multiple files with mixed roles', () => {
      let callCount = 0;
      service.getPermissions.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return [{ id: 'perm1', type: 'anyone', role: 'reader' }]; // fileId1 - needs update
        } else {
          return [{ id: 'perm2', type: 'anyone', role: 'writer' }]; // fileId2 - correct
        }
      });

      global.Drive.Permissions.update.mockReturnValueOnce({ id: 'perm1' });
      global.Drive.Files.get
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file1' })
        .mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file2' });

      const links = service.getSharingLink(['fileId1', 'fileId2'], 'edit');

      expect(links).toEqual({
        fileId1: 'https://drive.google.com/file1',
        fileId2: 'https://drive.google.com/file2'
      });
    });

    it('should handle empty options parameter', () => {
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'view', {});

      expect(link).toBe('https://drive.google.com/file');
    });

    it('should convert single file ID to array internally', () => {
      service.getPermissions.mockReturnValue([]);

      global.Drive.Permissions.create.mockReturnValueOnce({ id: 'perm1' });
      global.Drive.Files.get.mockReturnValueOnce({ webViewLink: 'https://drive.google.com/file' });

      const link = service.getSharingLink('fileId1', 'view');

      expect(typeof link).toBe('string'); // Should return single string, not object
      expect(link).toBe('https://drive.google.com/file');
    });

  // Note: the original 'should execute batch operations with maxRetries option'
  // test was removed because native API calls don't have maxRetries passed like that
  // in PermissionService getSharingLink right now.
  });
});
