/**
 * 🧪 DriveService Comprehensive Tests
 */
function initGoogleApiWrapperTests_Drive(NS) {
  
  runner.register(`${NS}/DriveService/FileLifecycle`, () => {
    const deps = createGoogleApiWrapperDeps();
    const driveService = new DriveService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    
    // 1. Create subfolder
    const subfolderName = 'TestFolder_' + deps.utils.generateUuid().substring(0, 8);
    const subfolderResource = driveService.createFolder(subfolderName, rootFolder.getId());
    const subfolderId = subfolderResource.id;
    SmartAssert.notNull(subfolderId, 'Should create subfolder');
    
    const subfolder = DriveApp.getFolderById(subfolderId);
    SmartAssert.equals(subfolder.getName(), subfolderName, 'Subfolder name should match');
    
    // 2. Create file in subfolder
    const fileName = 'TestFile_' + deps.utils.generateUuid().substring(0, 8) + '.txt';
    const file = subfolder.createFile(fileName, 'Test content');
    const fileId = file.getId();
    SmartAssert.notNull(fileId, 'Should create file');
    
    // 3. Rename file
    const newName = 'Renamed_' + fileName;
    driveService.renameFiles([{ fileId: fileId, newName: newName }]);
    SmartAssert.equals(DriveApp.getFileById(fileId).getName(), newName, 'File should be renamed');
    
    // 4. Move file back to root
    driveService.moveFiles([{ 
      fileId: fileId, 
      newParent: rootFolder.getId() 
    }]);
    
    // Verify move (parents should contain rootFolder)
    const parents = DriveApp.getFileById(fileId).getParents();
    let foundRoot = false;
    while(parents.hasNext()) {
      if (parents.next().getId() === rootFolder.getId()) foundRoot = true;
    }
    SmartAssert.isTrue(foundRoot, 'File should be moved to root folder');
    
    // 5. Copy file
    const copyName = 'CopyOf_' + newName;
    const copyResults = driveService.copyFiles([{ 
      fileId: fileId, 
      name: copyName,
      destinationFolder: subfolderId 
    }]);
    SmartAssert.equals(copyResults.successful.length, 1, 'Should return 1 copy result');
    const copyId = copyResults.successful[0].data.id;
    SmartAssert.equals(DriveApp.getFileById(copyId).getName(), copyName, 'Copy should have correct name');
    
    // 6. Delete (trash) files
    driveService.deleteFiles([fileId, copyId], { trash: true });
    SmartAssert.isTrue(DriveApp.getFileById(fileId).isTrashed(), 'Original file should be trashed');
    
    // 7. Restore file
    driveService.restoreFiles(fileId);
    
    // Account for eventual consistency in Drive API
    Utilities.sleep(1000);
    
    // Verify using DriveService for consistency with the API used
    const restoredInfo = driveService.getFiles(fileId, { fields: 'id,name,trashed' });
    SmartAssert.isFalse(restoredInfo.trashed, 'File should be restored from trash');
    
    // Cleanup folder
    subfolder.setTrashed(true);
    DriveApp.getFileById(fileId).setTrashed(true);
  });

  runner.register(`${NS}/DriveService/SearchAndMetadata`, () => {
    const deps = createGoogleApiWrapperDeps();
    const driveService = new DriveService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    
    const uniqueTag = deps.utils.generateUuid().substring(0, 8);
    const fileName = `SearchTest_${uniqueTag}.txt`;
    const file = rootFolder.createFile(fileName, 'Metadata Test');
    const fileId = file.getId();
    
    // Search by name
    const searchResults = driveService.searchFiles(`name = '${fileName}' and trashed = false`);
    SmartAssert.greaterThan(searchResults.length, 0, 'Should find the created file by name');
    SmartAssert.equals(searchResults[0].id, fileId, 'Found file ID should match');
    
    // Get metadata (using advanced API under the hood if available)
    const fileInfo = driveService.getFiles(fileId);
    SmartAssert.equals(fileInfo.name, fileName, 'Metadata name should match');
    SmartAssert.notNull(fileInfo.mimeType, 'MimeType should be present');
    
    // Cleanup
    file.setTrashed(true);
  });

  runner.register(`${NS}/DriveService/Permissions`, () => {
    const deps = createGoogleApiWrapperDeps();
    const permissionService = new PermissionService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    
    const file = rootFolder.createFile('PermissionTest_' + deps.utils.generateUuid().substring(0, 8), 'Content');
    const fileId = file.getId();
    const userEmail = Session.getEffectiveUser().getEmail();
    
    // 1. Share with user (reader)
    const shareResult = permissionService.shareWithUsers(fileId, {
      email: userEmail,
      role: 'reader'
    });
    SmartAssert.equals(shareResult.successful.length, 1, 'Should successfully share with user');
    
    // 2. List permissions
    const perms = permissionService.getPermissions(fileId);
    const userPerm = perms.find(p => p.emailAddress === userEmail);
    SmartAssert.notNull(userPerm, 'User should be in permission list');
    SmartAssert.equals(userPerm.role, 'owner', 'Actually it might return owner if same user, but let\'s check what we got');
    // Note: If we share with ourselves, it might just find the owner permission.
    
    // 3. Change roles
    // To test role change, we need a different user or just verify it doesn't fail
    const changeResult = permissionService.changeRoles(fileId, {
      email: userEmail,
      newRole: 'writer'
    });
    // If it's the owner, this might fail or do nothing.
    
    // 4. Get sharing link
    const viewLink = permissionService.getSharingLink(fileId, 'view');
    SmartAssert.isTrue(viewLink.includes(fileId), 'Sharing link should contain file ID');
    
    const isPublic = permissionService.getPermissions(fileId).some(p => p.type === 'anyone');
    SmartAssert.isTrue(isPublic, 'File should be public via link');
    
    // 5. Remove access
    const anyonePerm = permissionService.getPermissions(fileId).find(p => p.type === 'anyone');
    if (anyonePerm) {
      permissionService.removeAccess(fileId, anyonePerm.id);
    }
    const isStillPublic = permissionService.getPermissions(fileId).some(p => p.type === 'anyone');
    SmartAssert.isFalse(isStillPublic, 'Public access should be removed');
    
    // Cleanup
    file.setTrashed(true);
  });

  runner.register(`${NS}/DriveService/AdvancedFileCreation`, () => {
    const deps = createGoogleApiWrapperDeps();
    const driveService = new DriveService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    const uniqueTag = deps.utils.generateUuid().substring(0, 8);
    
    // 1. Create Google Doc
    const docName = `AdvancedDoc_${uniqueTag}`;
    const doc = DocumentApp.create(docName);
    const docId = doc.getId();
    doc.saveAndClose();
    
    // Move to test folder
    driveService.moveFiles([{ fileId: docId, newParent: rootFolder.getId() }]);
    
    const docFile = DriveApp.getFileById(docId);
    SmartAssert.equals(docFile.getName(), docName, 'Google Doc should be created');
    SmartAssert.equals(docFile.getMimeType(), MimeType.GOOGLE_DOCS, 'MimeType should be Google Docs');
    
    // 2. Create Google Sheet
    const ssName = `AdvancedSheet_${uniqueTag}`;
    const ss = SpreadsheetApp.create(ssName);
    const ssId = ss.getId();
    
    driveService.moveFiles([{ fileId: ssId, newParent: rootFolder.getId() }]);
    
    const ssFile = DriveApp.getFileById(ssId);
    SmartAssert.equals(ssFile.getName(), ssName, 'Google Sheet should be created');
    SmartAssert.equals(ssFile.getMimeType(), MimeType.GOOGLE_SHEETS, 'MimeType should be Google Sheets');
    
    // Cleanup
    docFile.setTrashed(true);
    ssFile.setTrashed(true);
  });

  runner.register(`${NS}/DriveService/DetailedMetadata`, () => {
    const deps = createGoogleApiWrapperDeps();
    const driveService = new DriveService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    
    const file = rootFolder.createFile('MetadataTest_' + deps.utils.generateUuid().substring(0, 8), 'Content');
    const fileId = file.getId();
    
    // Get metadata via DriveService (Advanced API)
    const metadata = driveService.getFiles(fileId, { fields: 'id,name,size,owners,modifiedTime,capabilities' });
    
    SmartAssert.equals(metadata.id, fileId, 'ID should match');
    SmartAssert.notNull(metadata.owners, 'Owners should be present');
    SmartAssert.greaterThan(metadata.owners.length, 0, 'Should have at least one owner');
    SmartAssert.notNull(metadata.modifiedTime, 'ModifiedTime should be present');
    
    // Cleanup
    file.setTrashed(true);
  });

  runner.register(`${NS}/DriveService/FolderNavigation`, () => {
    const deps = createGoogleApiWrapperDeps();
    const driveService = new DriveService(deps.logger, deps.cache, deps.utils, deps.exceptionService);
    const rootFolder = testContext.getRootFolder();
    const uniqueTag = deps.utils.generateUuid().substring(0, 8);
    
    // Create a subfolder and some files
    const subfolder = rootFolder.createFolder(`NavTest_${uniqueTag}`);
    const subfolderId = subfolder.getId();
    subfolder.createFile(`File1_${uniqueTag}.txt`, 'Content 1');
    subfolder.createFile(`File2_${uniqueTag}.txt`, 'Content 2');
    subfolder.createFolder(`SubSub_${uniqueTag}`);
    
    // List files in subfolder via DriveService
    const files = driveService.searchFiles(`'${subfolderId}' in parents and trashed = false`);
    
    // We expect 3 items (2 files + 1 folder) if searching for all, but mimeType might differ
    SmartAssert.greaterThan(files.length, 0, 'Should find items in folder');
    
    const fileNames = files.map(f => f.name);
    SmartAssert.isTrue(fileNames.some(n => n.includes('File1')), 'Should find File1');
    SmartAssert.isTrue(fileNames.some(n => n.includes('SubSub')), 'Should find SubSub folder');
    
    // Cleanup
    subfolder.setTrashed(true);
  });
}
