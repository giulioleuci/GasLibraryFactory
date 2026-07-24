/**
 * 🧪 WorkspaceTemplateEngine Online Tests
 */

function initWorkspaceTemplateEngineTests() {
  const NS = 'WorkspaceTemplateEngine';

  runner.register(`${NS}/Document/Substitution`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendParagraph('Hello {{name}}! Welcome to {{place}}.');
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), { name: 'Alice', place: 'Wonderland' });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const text = updatedDoc.getBody().getText();
    SmartAssert.isTrue(text.includes('Hello Alice'), 'Should substitute name');
    SmartAssert.isTrue(text.includes('Welcome to Wonderland'), 'Should substitute place');
  });

  runner.register(`${NS}/Document/Table_Iteration`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendTable([
      ['Name', 'Age'],
      ['{{#tablerow_loop:students}}{{name}}', '{{age}}']
    ]);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    const data = {
      students: [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ]
    };

    docProcessor.process(doc.getId(), data);

    const updatedDoc = DocumentApp.openById(doc.getId());
    const table = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(table.getNumRows(), 3, 'Table should have 3 rows');
    SmartAssert.equals(table.getRow(1).getCell(0).getText(), 'Alice');
    SmartAssert.equals(table.getRow(2).getCell(0).getText(), 'Bob');
  });

  // Mirrors ALDO's RIEPILOGO_CLASSE table exactly: 4 columns, nested dotted
  // paths in every non-marker cell (not just the marker cell), 5+ rows.
  // Table_Iteration above only ever checks column 0 with flat top-level keys
  // ({{age}}) — it would pass even if columns 1..N were silently blanked or
  // never resolved (e.g. by the Advanced-API/DocumentApp rescan race). This
  // test checks every column of every row to catch exactly that class of bug.
  runner.register(`${NS}/Document/Table_Iteration_NestedFields`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendTable([
      ['Alunno', 'Religione', 'Email', 'Piani'],
      [
        '{{#tablerow_loop:studenti}}{{anagrafica.nomeCompleto}}',
        '{{status.religione}}',
        '{{anagrafica.email}}',
        '{{didattica.piani.hasPiani}}'
      ]
    ]);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    const studenti = [
      {
        anagrafica: { nomeCompleto: 'Mario Rossi', email: 'mario.rossi@example.com' },
        status: { religione: 'SI' },
        didattica: { piani: { hasPiani: true } }
      },
      {
        anagrafica: { nomeCompleto: 'Luca Bianchi', email: 'luca.bianchi@example.com' },
        status: { religione: 'NO' },
        didattica: { piani: { hasPiani: false } }
      },
      {
        anagrafica: { nomeCompleto: 'Anna Verdi', email: 'anna.verdi@example.com' },
        status: { religione: 'ALT' },
        didattica: { piani: { hasPiani: true } }
      },
      {
        anagrafica: { nomeCompleto: 'Giulia Neri', email: 'giulia.neri@example.com' },
        status: { religione: 'SI' },
        didattica: { piani: { hasPiani: false } }
      },
      {
        anagrafica: { nomeCompleto: 'Paolo Blu', email: 'paolo.blu@example.com' },
        status: { religione: 'NO' },
        didattica: { piani: { hasPiani: true } }
      }
    ];

    docProcessor.process(doc.getId(), { studenti });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const table = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(table.getNumRows(), studenti.length + 1, 'Header + one row per student');

    for (let i = 0; i < studenti.length; i++) {
      const s = studenti[i];
      const row = table.getRow(i + 1);
      SmartAssert.equals(
        row.getCell(0).getText(),
        s.anagrafica.nomeCompleto,
        `Row ${i + 1} col 0 (nomeCompleto) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(1).getText(),
        s.status.religione,
        `Row ${i + 1} col 1 (religione) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(2).getText(),
        s.anagrafica.email,
        `Row ${i + 1} col 2 (email) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(3).getText(),
        String(s.didattica.piani.hasPiani),
        `Row ${i + 1} col 3 (hasPiani) should not be blank`
      );
    }
  });

  runner.register(`${NS}/Document/Formatting_SimpleSubstitution`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    const paragraph = body.appendParagraph('Dear {{name}}, welcome.');
    const text = paragraph.editAsText();
    const nameStart = paragraph.getText().indexOf('{{name}}');
    text.setBold(nameStart, nameStart + '{{name}}'.length - 1, true);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), { name: 'Alice' });

    const updatedDoc = DocumentApp.openById(doc.getId());
    // resetDocument() clears the body via Body.clear(), but a Docs body can
    // never have zero paragraphs — clear() always leaves one empty paragraph
    // behind, and appendParagraph() above added ours right after it. So the
    // target paragraph is the LAST one, not [0] (which is that leftover
    // empty paragraph — reading it made this assertion fail deterministically
    // regardless of whether the substitution actually worked).
    const updatedParagraphs = updatedDoc.getBody().getParagraphs();
    const updatedParagraph = updatedParagraphs[updatedParagraphs.length - 1];
    const updatedText = updatedParagraph.editAsText();
    const fullText = updatedParagraph.getText();
    SmartAssert.isTrue(fullText.includes('Dear Alice, welcome.'), 'Text should be substituted');

    const aliceStart = fullText.indexOf('Alice');
    SmartAssert.isTrue(updatedText.isBold(aliceStart), 'Substituted name should keep its bold formatting');
    SmartAssert.isFalse(
      updatedText.isBold(fullText.indexOf('Dear')),
      'Surrounding plain text should stay non-bold'
    );
  });

  runner.register(`${NS}/Document/Formatting_TableRowLoop`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    const table = body.appendTable([
      ['Name', 'Score'],
      ['{{#tablerow_loop:students}}{{name}}', '{{score}}']
    ]);
    table.setBorderWidth(2);
    const templateRow = table.getRow(1);
    templateRow.getCell(1).setBackgroundColor('#ffff00');
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), {
      students: [
        { name: 'Alice', score: 90 },
        { name: 'Bob', score: 80 }
      ]
    });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const updatedTable = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(updatedTable.getNumRows(), 3, 'Header + 2 data rows');
    SmartAssert.equals(updatedTable.getBorderWidth(), 2, 'Table border width should survive row expansion');
    SmartAssert.equals(
      updatedTable.getRow(1).getCell(1).getBackgroundColor(),
      '#ffff00',
      'Row 1 score cell background should be preserved from the template row'
    );
    SmartAssert.equals(
      updatedTable.getRow(2).getCell(1).getBackgroundColor(),
      '#ffff00',
      'Row 2 score cell background should also be preserved (copied from template)'
    );
  });

  runner.register(`${NS}/Document/Formatting_TableColLoop`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    const table = body.appendTable([['{{#tablecol_loop:subjects}}{{label}}{{/tablecol_loop}}'], ['{{value}}']]);
    table.getRow(0).getCell(0).setWidth(120);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), {
      subjects: [
        { label: 'Math', value: 'A' },
        { label: 'Science', value: 'B' }
      ]
    });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const updatedTable = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(updatedTable.getRow(0).getNumCells(), 2, 'Should have 2 columns after expansion');
    SmartAssert.equals(
      updatedTable.getRow(0).getCell(1).getWidth(),
      120,
      'Newly inserted column should copy the original column width'
    );
  });

  runner.register(`${NS}/Document/Formatting_BulletList`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    const listItem = body.appendListItem('{{#bullet_list:names}}{{nome}}{{/bullet_list}}');
    listItem.setGlyphType(DocumentApp.GlyphType.BULLET);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), { names: [{ nome: 'Alice' }, { nome: 'Bob' }] });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const listItems = updatedDoc.getBody().getListItems();
    SmartAssert.equals(listItems.length, 2, 'Should have one list item per data entry');
    SmartAssert.equals(listItems[0].getText(), 'Alice', 'First item should render Alice');
    SmartAssert.equals(listItems[1].getText(), 'Bob', 'Second item should render Bob');
    SmartAssert.equals(
      listItems[0].getGlyphType().toString(),
      DocumentApp.GlyphType.BULLET.toString(),
      'Copied list items should keep the original glyph type, not a hardcoded preset'
    );
  });

  // Same as Table_Iteration_NestedFields, but the template is *provisioned*
  // through DocumentService.createDocument()/DocumentBuilder (appendParagraph
  // x N + createTable + one execute() call) — the exact stack ALDO's
  // GasArtifactFactory.createDocument uses — instead of a raw
  // body.appendTable() call. Isolates whether the CREATION path (Advanced-API
  // paragraph batch + native table styling in one builder.execute()) corrupts
  // the marker row, as opposed to the GENERATION path already covered above.
  runner.register(`${NS}/Document/Table_Iteration_ViaDocumentBuilder`, () => {
    const deps = createGoogleApiWrapperDeps();
    const docService = new DocumentService(deps.logger, deps.cache, deps.utils, deps.exceptionService);

    const docName = 'RiepilogoBuilderTest_' + deps.utils.generateUuid().substring(0, 8);
    const { documentId, builder } = docService.createDocument(docName);

    const paragraphs = [
      'Riepilogo Classe 1A',
      'Elenco studenti:',
      'Numero totale studenti: 5',
      'Rappresentanti degli studenti:',
      '{{#bullet_list:rappresentantiStudenti}}{{nomeCompleto}}{{/bullet_list}}',
      'Rappresentanti dei genitori:',
      '{{#bullet_list:rappresentantiGenitori}}{{nomeCompleto}}{{/bullet_list}}'
    ];
    for (const p of paragraphs) builder.appendParagraph(p);

    builder.createTable(
      [
        ['Alunno', 'Religione', 'Email', 'Piani'],
        [
          '{{#tablerow_loop:studenti}}{{anagrafica.nomeCompleto}}',
          '{{status.religione}}',
          '{{anagrafica.email}}',
          '{{didattica.piani.hasPiani}}'
        ]
      ],
      { headerRow: true, alternatingRows: true }
    );

    const execResult = builder.execute();
    SmartAssert.isTrue(execResult.success, 'Builder execute should succeed');

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    const studenti = [
      {
        anagrafica: { nomeCompleto: 'Mario Rossi', email: 'mario.rossi@example.com' },
        status: { religione: 'SI' },
        didattica: { piani: { hasPiani: true } }
      },
      {
        anagrafica: { nomeCompleto: 'Luca Bianchi', email: 'luca.bianchi@example.com' },
        status: { religione: 'NO' },
        didattica: { piani: { hasPiani: false } }
      },
      {
        anagrafica: { nomeCompleto: 'Anna Verdi', email: 'anna.verdi@example.com' },
        status: { religione: 'ALT' },
        didattica: { piani: { hasPiani: true } }
      }
    ];

    docProcessor.process(documentId, {
      studenti,
      rappresentantiStudenti: [],
      rappresentantiGenitori: []
    });

    const updatedDoc = DocumentApp.openById(documentId);
    const bodyText = updatedDoc.getBody().getText();
    Logger.log('Table_Iteration_ViaDocumentBuilder final body text:\n' + bodyText);

    const table = updatedDoc.getBody().getTables()[0];
    SmartAssert.notNull(table, 'Table should exist');
    SmartAssert.equals(table.getNumRows(), studenti.length + 1, 'Header + one row per student');

    for (let i = 0; i < studenti.length; i++) {
      const s = studenti[i];
      const row = table.getRow(i + 1);
      SmartAssert.equals(
        row.getCell(0).getText(),
        s.anagrafica.nomeCompleto,
        `Row ${i + 1} col 0 (nomeCompleto) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(1).getText(),
        s.status.religione,
        `Row ${i + 1} col 1 (religione) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(2).getText(),
        s.anagrafica.email,
        `Row ${i + 1} col 2 (email) should not be blank`
      );
      SmartAssert.equals(
        row.getCell(3).getText(),
        String(s.didattica.piani.hasPiani),
        `Row ${i + 1} col 3 (hasPiani) should not be blank`
      );
    }
  });

  runner.register(`${NS}/Sheet/Matrix_Expansion`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];

    sheet
      .getRange('A1')
      .setValue('{{matrice_dati[sorgente=users, colonne=name;email, intestazioni=Name;Email]}}');
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const sheetProcessor = new SheetProcessor(placeholderService);

    const data = {
      users: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ]
    };

    sheetProcessor.process(ss.getId(), data);
    SpreadsheetApp.flush();

    const values = sheet.getDataRange().getValues();
    SmartAssert.equals(values[0][0], 'Name', 'Header Name should be present');
    SmartAssert.equals(values[1][0], 'Alice', 'First data row should be Alice');
    SmartAssert.equals(values[2][0], 'Bob', 'Second data row should be Bob');
  });
}
