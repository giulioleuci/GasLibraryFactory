/**
 * Human Inspection Tests for WorkspaceTemplateEngine
 * Creates 5 Drive files for manual visual inspection and runs automated assertions.
 */

/**
 * Main entry point to run human inspection tests.
 */
function runHumanInspectionTests() {
  initHumanInspectionTests();
  return runner.run('HumanInspection');
}

function initHumanInspectionTests() {
  runner.register('HumanInspection/Full_Suite', () => {

    // ─── Engine setup ───────────────────────────────────────────────────────
    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);
    const sheetProcessor = new SheetProcessor(placeholderService);

    // ─── Step 0 — Run folder ────────────────────────────────────────────────
    const RUN_FOLDER = TestFolderManager.createTimestampedFolder('HumanInspection');

    // ─── Step 1 — SOURCE_TableData ──────────────────────────────────────────
    const sourceDoc = DocumentApp.create('SOURCE_TableData');
    DriveApp.getFileById(sourceDoc.getId()).moveTo(RUN_FOLDER);
    const sourceBody = sourceDoc.getBody();
    const tableData = [
      ['Product',  'Qty', 'Unit Price', 'Total'],
      ['Laptop',   '5',   '1200',       '6000'],
      ['Monitor',  '10',  '350',        '3500'],
      ['Keyboard', '20',  '80',         '1600'],
      ['Mouse',    '20',  '40',         '800']
    ];
    sourceBody.appendTable(tableData);
    sourceDoc.saveAndClose();
    const sourceDocId = sourceDoc.getId();
    Logger.log('[HumanInspection] SOURCE Doc      : ' + DriveApp.getFileById(sourceDocId).getUrl());

    // ─── Step 2 — TEMPLATE_HumanInspection_Doc ──────────────────────────────
    const templateDoc = DocumentApp.create('TEMPLATE_HumanInspection_Doc');
    DriveApp.getFileById(templateDoc.getId()).moveTo(RUN_FOLDER);
    const tbody = templateDoc.getBody();

    // Section A
    tbody.appendParagraph('=== A: SIMPLE & COMPLEX PLACEHOLDERS ===');
    tbody.appendParagraph('Title: {{title}}');
    tbody.appendParagraph('Author: {{author.name}} ({{author.email}})');
    tbody.appendParagraph('Date: {{createdAt | date:dd/MM/yyyy}}');
    tbody.appendParagraph('Amount: {{amount | number}}');
    tbody.appendParagraph('Category: {{category | uppercase}}');
    tbody.appendParagraph('Tags: {{tags | join:", "}}');
    tbody.appendParagraph('Status: {{status | capitalize}}');

    // Section B — tablerow_loop
    tbody.appendParagraph('=== B: TABLEROW_LOOP ===');
    const tableBData = [
      ['Name', 'Role', 'Department'],
      ['{{#tablerow_loop:employees}}{{name}}', '{{role}}', '{{dept}}']
    ];
    tbody.appendTable(tableBData);

    // Section C — tablecol_loop
    tbody.appendParagraph('=== C: TABLECOL_LOOP ===');
    const tableCData = [
      ['Fixed', '{{#tablecol_loop:months}}{{label}}{{/tablecol_loop}}'],
      ['Monthly total', '{{value}}']
    ];
    tbody.appendTable(tableCData);

    // Section D — bullet_list
    tbody.appendParagraph('=== D: BULLET_LIST ===');
    tbody.appendParagraph('Project tasks:');
    tbody.appendListItem('{{#bullet_list:tasks}}{{label}} [priority: {{priority}}]{{/bullet_list}}');

    // Section E — imported table placeholder text
    tbody.appendParagraph('=== E: IMPORTED TABLE ===');
    tbody.appendParagraph('Purchase Report — {{reportTitle}}');
    tbody.appendParagraph('Grand total: {{grandTotal | number}}');

    templateDoc.saveAndClose();
    const templateDocId = templateDoc.getId();
    Logger.log('[HumanInspection] TEMPLATE Doc    : ' + DriveApp.getFileById(templateDocId).getUrl());

    // Copy template → output doc
    const templateDocFile = DriveApp.getFileById(templateDocId);
    const outputDocFile = templateDocFile.makeCopy('OUTPUT_HumanInspection_Doc', RUN_FOLDER);
    const outputDocId = outputDocFile.getId();

    // Step 2a — process output doc
    const docContext = {
      title:     'Annual Report 2025',
      author:    { name: 'Mario Rossi', email: 'mario.rossi@example.com' },
      createdAt: new Date(2025, 11, 31),
      amount:    1234567.89,
      category:  'finance',
      tags:      ['alpha', 'beta', 'gamma'],
      status:    'approved',
      employees: [
        { name: 'Alice Bianchi', role: 'Developer', dept: 'IT' },
        { name: 'Carlo Verdi',   role: 'Designer',  dept: 'UX' },
        { name: 'Elena Neri',    role: 'Manager',   dept: 'HR' }
      ],
      months: [
        { label: 'Jan', value: 1000 },
        { label: 'Feb', value: 1200 },
        { label: 'Mar', value: 900  }
      ],
      tasks: [
        { label: 'Requirements analysis', priority: 'high'   },
        { label: 'Architecture design',   priority: 'high'   },
        { label: 'Frontend development',  priority: 'medium' },
        { label: 'Testing',               priority: 'low'    }
      ],
      reportTitle: 'Q4 2025',
      grandTotal:  11900
    };

    docProcessor.process(outputDocId, docContext);

    // Step 2b — append imported table from SOURCE_TableData
    const srcDoc = DocumentApp.openById(sourceDocId);
    const srcTable = srcDoc.getBody().getTables()[0];
    const importedTableData = [];
    for (let r = 0; r < srcTable.getNumRows(); r++) {
      const row = [];
      for (let c = 0; c < srcTable.getRow(r).getNumCells(); c++) {
        row.push(srcTable.getRow(r).getCell(c).getText());
      }
      importedTableData.push(row);
    }
    const outDoc = DocumentApp.openById(outputDocId);
    outDoc.getBody().appendTable(importedTableData);
    outDoc.saveAndClose();
    Logger.log('[HumanInspection] OUTPUT Doc      : ' + DriveApp.getFileById(outputDocId).getUrl());

    // ─── Step 3 — TEMPLATE_HumanInspection_Sheet ────────────────────────────
    const templateSS = SpreadsheetApp.create('TEMPLATE_HumanInspection_Sheet');
    DriveApp.getFileById(templateSS.getId()).moveTo(RUN_FOLDER);
    const templateSheet = templateSS.getActiveSheet();
    templateSheet.setName('Data');

    // Section F — matrice_dati
    templateSheet.getRange('A1').setValue('=== F: MATRICE_DATI ===');
    templateSheet.getRange('A3').setValue('{{matrice_dati[sorgente=sellers, colonne=name;region;target;achieved;rate, intestazioni=Name;Region;Target;Achieved;%Rate]}}');

    // Section G — dynamic_columns
    templateSheet.getRange('A10').setValue('=== G: DYNAMIC_COLUMNS ===');
    templateSheet.getRange('A12').setValue('Employee');
    templateSheet.getRange('B12').setValue('{{dynamic_columns[source=months, value=label, acl=ownerEmail, scope=column]}}');

    SpreadsheetApp.flush();
    const templateSSId = templateSS.getId();
    Logger.log('[HumanInspection] TEMPLATE Sheet  : ' + DriveApp.getFileById(templateSSId).getUrl());

    // Copy template → output sheet
    const templateSSFile = DriveApp.getFileById(templateSSId);
    const outputSSFile = templateSSFile.makeCopy('OUTPUT_HumanInspection_Sheet', RUN_FOLDER);
    const outputSSId = outputSSFile.getId();

    // Step 3a — process output sheet
    const currentUser = Session.getActiveUser().getEmail();
    const sheetContext = {
      sellers: [
        { name: 'Luca Ferrari', region: 'North',  target: 50000, achieved: 52000, rate: '104%' },
        { name: 'Sara Conti',   region: 'Center', target: 45000, achieved: 41000, rate: '91%'  },
        { name: 'Paolo Marini', region: 'South',  target: 40000, achieved: 43500, rate: '108%' },
        { name: 'Anna Ricci',   region: 'East',   target: 35000, achieved: 34000, rate: '97%'  }
      ],
      months: [
        { label: 'Jan', ownerEmail: currentUser },
        { label: 'Feb', ownerEmail: currentUser },
        { label: 'Mar', ownerEmail: currentUser },
        { label: 'Apr', ownerEmail: currentUser },
        { label: 'May', ownerEmail: currentUser },
        { label: 'Jun', ownerEmail: currentUser }
      ]
    };

    sheetProcessor.process(outputSSId, sheetContext, 'Data');
    SpreadsheetApp.flush();
    Logger.log('[HumanInspection] OUTPUT Sheet    : ' + DriveApp.getFileById(outputSSId).getUrl());

    // ─── Assertions — Doc ───────────────────────────────────────────────────
    const doc = DocumentApp.openById(outputDocId);
    const body = doc.getBody();
    const text = body.getText();

    // Section A
    SmartAssert.isTrue(text.includes('Title: Annual Report 2025'),       'A: simple placeholder title');
    SmartAssert.isTrue(text.includes('Mario Rossi'),                      'A: nested author.name');
    SmartAssert.isTrue(text.includes('mario.rossi@example.com'),          'A: nested author.email');
    SmartAssert.isTrue(text.includes('31/12/2025'),                       'A: filter date');
    SmartAssert.isTrue(text.includes('FINANCE'),                          'A: filter uppercase');
    SmartAssert.isTrue(text.includes('alpha, beta, gamma'),               'A: filter join');
    SmartAssert.isTrue(text.includes('Approved'),                         'A: filter capitalize');

    // Section B
    const tableB = body.getTables()[0];
    SmartAssert.equals(tableB.getNumRows(), 4,                            'B: 1 header + 3 data rows');
    SmartAssert.equals(tableB.getRow(1).getCell(0).getText(), 'Alice Bianchi', 'B: row 1 name');
    SmartAssert.equals(tableB.getRow(3).getCell(1).getText(), 'Manager',  'B: row 3 role');

    // Section C
    const tableC = body.getTables()[1];
    SmartAssert.equals(tableC.getRow(0).getNumCells(), 4,                 'C: 1 fixed + 3 expanded cols');
    SmartAssert.equals(tableC.getRow(0).getCell(1).getText(), 'Jan',      'C: col header 1');
    SmartAssert.equals(tableC.getRow(0).getCell(3).getText(), 'Mar',      'C: col header 3');
    SmartAssert.equals(Number(tableC.getRow(1).getCell(2).getText()), 1200, 'C: col 2 value');

    // Section D
    SmartAssert.isTrue(text.includes('Requirements analysis'),            'D: bullet item 1');
    SmartAssert.isTrue(text.includes('priority: high'),                   'D: interpolation inside bullet');
    SmartAssert.isTrue(text.includes('Testing'),                          'D: bullet item 4');
    SmartAssert.isFalse(text.includes('bullet_list'),                     'D: placeholder removed');
    let listItemCount = 0;
    for (let i = 0; i < body.getNumChildren(); i++) {
      if (body.getChild(i).getType() === DocumentApp.ElementType.LIST_ITEM) listItemCount++;
    }
    SmartAssert.equals(listItemCount, 4,                                  'D: 4 list items total');

    // Section E
    const tableE = body.getTables()[2];
    SmartAssert.equals(tableE.getNumRows(), 5,                            'E: 1 header + 4 data rows');
    SmartAssert.equals(tableE.getRow(0).getCell(0).getText(), 'Product',  'E: header col 0');
    SmartAssert.equals(tableE.getRow(1).getCell(0).getText(), 'Laptop',   'E: data row 1');
    SmartAssert.equals(tableE.getRow(4).getCell(3).getText(), '800',      'E: data row 4 last cell');
    SmartAssert.isTrue(text.includes('Purchase Report — Q4 2025'),        'E: placeholder reportTitle');
    SmartAssert.isFalse(text.includes('{{'),                              'Doc: no unreplaced placeholders');

    // ─── Assertions — Sheet ─────────────────────────────────────────────────
    const ss = SpreadsheetApp.openById(outputSSId);
    const sheet = ss.getSheetByName('Data');
    const v = sheet.getDataRange().getValues();

    // Section F
    SmartAssert.equals(v[2][0], 'Name',         'F: header col 0');
    SmartAssert.equals(v[2][1], 'Region',        'F: header col 1');
    SmartAssert.equals(v[2][4], '%Rate',         'F: header col 4');
    SmartAssert.equals(v[3][0], 'Luca Ferrari',  'F: data row 1 name');
    SmartAssert.equals(v[3][2], 50000,           'F: data row 1 target (numeric)');
    SmartAssert.equals(v[6][0], 'Anna Ricci',    'F: data row 4 name');
    SmartAssert.equals(v[6][4], '97%',           'F: data row 4 rate');

    // Section G
    SmartAssert.equals(sheet.getRange('A12').getValue(), 'Employee', 'G: fixed col header');
    SmartAssert.equals(sheet.getRange('B12').getValue(), 'Jan',      'G: dynamic col 1');
    SmartAssert.equals(sheet.getRange('C12').getValue(), 'Feb',      'G: dynamic col 2');
    SmartAssert.equals(sheet.getRange('G12').getValue(), 'Jun',      'G: dynamic col 6 (last)');

    const flat = v.flat().map(cell => String(cell));
    SmartAssert.isFalse(flat.some(c => c.includes('{{')), 'Sheet: no unreplaced placeholders');
  });
}
