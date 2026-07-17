# PLAN: Extend Online Tests for Google Workspace Lifecycle

## 1. Objective

Add comprehensive online tests to verify the entire lifecycle of Google Docs and Google Sheets, including template copying, placeholder-based renaming, content processing (table loops, bullet lists, data matrices), permission management, and database persistence. Newly created files must not be deleted so that the user can verify their contents. Take inspiration from existing online tests. For these new tests, create a new file.

## 2. Involved Libraries & Services

- **WorkspaceTemplateEngine**: `PlaceholderService`, `DocumentProcessor`, `SheetProcessor`.
- **GoogleApiWrapper**: `DriveFileManager` (copying/moving), `PermissionService` (sharing).
- **SheetDBLib**: `DatabaseService`, `TableService` (persistence).
- **CoreUtilsLib**: `LoggerService`, `UtilsService`.

## 3. Test Environment Setup

The tests will run in the `__testOnline__` environment and require:

1. **Template Folder**: A dedicated folder for template files.
2. **Output Folder**: A dedicated folder for generated files.
3. **Database Spreadsheet**: A spreadsheet acting as a registry for generated files.
4. **Template Doc**: A Google Doc with:
   - Header: `{{title}}`
   - Bullet List: `{{#bullet_list:items}}{{name}}{{/bullet_list}}`
   - Table Row Loop: `{{#tablerow_loop:rows}}{{col1}} | {{col2}}{{/tablerow_loop}}`
5. **Template Sheet**: A Google Sheet with:
   - Cell: `{{title}}`
   - Data Matrix: `{{matrice_dati[sorgente=data, colonne=c1;c2, intestazioni=Col1;Col2]}}`
   - Dynamic Columns: `{{dynamic_columns[source=cols, value=name, acl=email]}}`

## 4. Scenario 1: Google Doc Full Lifecycle

- **Step 1: Context Preparation**
  - Define data context with title, bullet items, and table rows.
- **Step 2: Dynamic Renaming**
  - Use `PlaceholderService.processString` to generate a filename like `"Contract - {{title}}"`.
- **Step 3: Copy Template**
  - Use `DriveFileManager.copyFiles` to copy the Template Doc to the Output Folder with the dynamic name.
- **Step 4: Content Processing**
  - Use `PlaceholderService.processDocument` on the new Doc ID.
- **Step 5: Permission Assignment**
  - Use `PermissionService.shareWithUsers` to grant 'reader' access to a test email.
- **Step 6: Database Persistence**
  - Use `SheetDBLib` to insert a row in the `GeneratedFiles` table: `[ID, Name, Type, FolderID, CreatedAt]`.
- **Step 7: Verification**
  - Assert the file exists in the destination folder.
  - Assert the file name matches the processed string.
  - Assert the content contains the substituted values.
  - Assert the database contains the correct record.

## 5. Scenario 2: Google Sheet Full Lifecycle

- **Step 1: Context Preparation**
  - Define data context with title, matrix data, and dynamic column configurations (including ACLs).
- **Step 2: Dynamic Renaming**
  - Generate filename like `"Budget - {{title}}"`.
- **Step 3: Copy Template**
  - Copy Template Sheet to Output Folder.
- **Step 4: Content & Permission Processing**
  - Use `PlaceholderService.processSheet`.
  - Verify `dynamic_columns` correctly expanded and applied column-level protections (ACL).
- **Step 5: File-Level Permissions**
  - Add a 'writer' using `PermissionService`.
- **Step 6: Database Persistence**
  - Save file metadata to the `GeneratedFiles` table.
- **Step 7: Verification**
  - Assert file existence and name.
  - Assert matrix data expansion.
  - Assert dynamic columns and protections are applied.
  - Assert DB record.

## 6. Implementation Strategy

- Create a new file `__testOnline__/integration/IntegrationTests_Lifecycle.gs`.
- Add a setup function `createLifecycleTemplates()` to programmatically create the templates if they don't exist in the test context.
- Register the tests in `initIntegrationTests_Lifecycle()`.
- Ensure `testContext` provides the necessary folder IDs and spreadsheet IDs.

## 7. Expected Results

- Successfully automated generation of personalized documents.
- Validated "Batch-First" operations across multiple services.
- Confirmed integration between Templating, Security, and Persistence layers.
