/**
 * 🧪 DocumentService Comprehensive Tests
 */
function initGoogleApiWrapperTests_Docs(NS) {
  runner.register(`${NS}/DocumentService/ContentManipulation`, () => {
    const deps = createGoogleApiWrapperDeps();
    const docService = new DocumentService(
      deps.logger,
      deps.cache,
      deps.utils,
      deps.exceptionService
    );

    // Create a new document for testing
    const docName = 'TestDoc_' + deps.utils.generateUuid().substring(0, 8);
    const createResult = docService.createDocument(docName);
    const docId = createResult.documentId;
    SmartAssert.notNull(docId, 'Should create document');

    const builder = docService.document(docId);

    // 1. Test Paragraphs and Formatting
    builder
      .setText('Initial Content\n')
      .appendParagraph('Heading 1', { heading: 1 })
      .appendParagraph('Centered Text', { alignment: 'center' })
      .appendParagraph('Right Aligned', { alignment: 'right' });

    // 2. Test Tables with formatting
    const tableData = [
      ['Product', 'Price', 'Qty'],
      ['Widget A', '$10.00', '5'],
      ['Widget B', '$20.00', '2'],
      ['Total', '$90.00', '7']
    ];
    builder.createTable(tableData, {
      headerRow: true,
      alternatingRows: true,
      columnWidths: [200, 100, 100]
    });

    // 3. Test Replace Text
    builder.appendParagraph('Replace me: {{TAG}}');
    builder.replaceText('{{TAG}}', 'SUCCESS');

    // 4. Test Header/Footer
    builder.addHeader('Test Document Header');
    builder.addFooter('Page 1 - Footer');

    // Execute all batch operations
    const executeResult = builder.execute();
    SmartAssert.isTrue(executeResult.success, 'Batch execution should succeed');

    // Verify results via DocumentApp
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const text = body.getText();

    SmartAssert.isTrue(text.includes('Heading 1'), 'Should contain appended heading');
    SmartAssert.isTrue(text.includes('SUCCESS'), 'Should have replaced the tag');
    SmartAssert.isTrue(text.includes('Widget A'), 'Should contain table data');

    SmartAssert.notNull(doc.getHeader(), 'Should have a header');
    SmartAssert.isTrue(doc.getHeader().getText().includes('Header'), 'Header text should match');

    SmartAssert.notNull(doc.getFooter(), 'Should have a footer');
    SmartAssert.isTrue(doc.getFooter().getText().includes('Footer'), 'Footer text should match');

    // Force sync before Advanced API call
    doc.saveAndClose();

    // 5. Test Table Structure extraction (POJO architecture)
    const tables = docService.getDocumentTables(docId);
    SmartAssert.equals(tables.length, 1, 'Should find 1 table');
    SmartAssert.equals(tables[0].rows, 4, 'Table should have 4 rows');

    // Cleanup
    DriveApp.getFileById(docId).setTrashed(true);
  });

  runner.register(`${NS}/DocumentService/AdvancedContent`, () => {
    const deps = createGoogleApiWrapperDeps();
    const docService = new DocumentService(
      deps.logger,
      deps.cache,
      deps.utils,
      deps.exceptionService
    );

    // Create a new document
    const docName = 'AdvancedDoc_' + deps.utils.generateUuid().substring(0, 8);
    const { documentId } = docService.createDocument(docName);

    const doc = DocumentApp.openById(documentId);
    const body = doc.getBody();

    // 1. Lists (Bulleted and Numbered)
    body.appendListItem('Item 1').setGlyphType(DocumentApp.GlyphType.BULLET);
    body.appendListItem('Item 2').setGlyphType(DocumentApp.GlyphType.BULLET);
    body.appendListItem('First Number').setGlyphType(DocumentApp.GlyphType.NUMBER);
    body.appendListItem('Second Number').setGlyphType(DocumentApp.GlyphType.NUMBER);

    doc.saveAndClose();

    // Verify lists
    const freshDoc = DocumentApp.openById(documentId);
    const listItems = freshDoc.getBody().getListItems();
    SmartAssert.equals(listItems.length, 4, 'Should have 4 list items');
    SmartAssert.equals(listItems[0].getText(), 'Item 1', 'First item text should match');

    // 2. Images
    // We'll use a 1x1 pixel transparent PNG as a placeholder if possible,
    // or just use a dummy blob from a string (might fail if not valid image data)
    // Actually, let's create a real small image blob
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      ),
      'image/png',
      'dot.png'
    );
    freshDoc.getBody().appendImage(imageBlob);
    freshDoc.saveAndClose();

    // Verify image
    const finalDoc = DocumentApp.openById(documentId);
    const images = finalDoc.getBody().getImages();
    SmartAssert.equals(images.length, 1, 'Should have 1 image');

    // 3. Clear Content
    // Test builder.setText('') as a way to clear
    docService.document(documentId).setText('').execute();

    // Use the service itself to verify to avoid DocumentApp caching issues
    const docStructure = docService.getRawDocumentStructure(documentId);
    const bodyText = (docStructure.body.content || [])
      .filter((e) => e.type === 'PARAGRAPH')
      .map((e) => e.text || '')
      .join('')
      .trim();

    SmartAssert.equals(bodyText, '', 'Document body should be cleared');

    // Cleanup
    DriveApp.getFileById(documentId).setTrashed(true);
  });
}
