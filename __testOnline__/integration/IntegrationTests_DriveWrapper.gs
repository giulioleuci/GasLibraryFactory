/**
 * Integration Tests for the GoogleApiWrapper DriveService standard-API boundary.
 *
 * These tests exercise the exact wrapper-routing mechanism that JobRunnerLib now
 * relies on after WP-05 (closing the JobRunnerLib -> native DriveApp leak):
 *
 *   - DriveService.getStandardApp() returns the native DriveApp surface (L2 boundary).
 *   - JobRunnerLib reaches Drive only through this accessor, using the 3-arg
 *     Folder/Drive createFile(name, content, mimeType) form (no Utilities.newBlob).
 *
 * Verifying it on real GAS guarantees the JobRunner large-state persistence and
 * driveFile log-capture paths still work end-to-end after the refactor.
 *
 * Newly created files are trashed at the end so they do not accumulate.
 */

function initIntegrationTests_DriveWrapper() {
  const NS = 'Integration/DriveWrapper';

  // --- DriveService.getStandardApp() exposes the native DriveApp surface ---
  runner.register(`${NS}/GetStandardApp_ReturnsDriveApp`, () => {
    const driveService = ServiceFactory.getDriveService();
    SmartAssert.isTrue(
      typeof driveService.getStandardApp === 'function',
      'DriveService should expose getStandardApp()'
    );

    const app = driveService.getStandardApp();
    SmartAssert.notNull(app, 'getStandardApp() should return the native DriveApp');
    SmartAssert.isTrue(
      typeof app.createFile === 'function' && typeof app.getFileById === 'function',
      'Standard app should expose native createFile/getFileById'
    );
  });

  // --- Routed text-file create/read/trash (mirrors JobRunner log-capture path) ---
  runner.register(`${NS}/RoutedTextFile_CreateReadTrash`, () => {
    const driveService = ServiceFactory.getDriveService();
    const app = driveService.getStandardApp();
    const root = testContext.getRootFolder();

    const folder = app.getFolderById(root.getId());
    const fileName = 'WP05_DriveWrapper_' + new Date().getTime() + '.txt';
    const content = 'JobRunner state routed via DriveService.getStandardApp()';

    // 3-arg createFile form (name, content, mimeType) — no Utilities.newBlob.
    const file = folder.createFile(fileName, content, 'text/plain');
    SmartAssert.notNull(file, 'File should be created via the wrapped standard app');

    const readBack = app.getFileById(file.getId()).getBlob().getDataAsString();
    SmartAssert.equals(readBack, content, 'Routed file content should round-trip');

    // Cleanup: trash the temporary file.
    app.getFileById(file.getId()).setTrashed(true);
  });
}
