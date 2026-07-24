# WorkspaceTemplateEngine Formatting Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add compact offline, online, and HumanInspection coverage for important placeholder formatting and prove bullet/number placeholders remain native lists.

**Architecture:** Extend existing test seams without adding new production abstractions. Offline Jest tests protect shared list insertion and style propagation; real-GAS tests validate DocumentApp behavior; HumanInspection produces one visually reviewable document. Current production code already inserts copied `ListItem` objects through `Body.insertListItem()`, so production changes occur only if a new regression test disproves that behavior.

**Tech Stack:** JavaScript ES modules, Jest, Google Apps Script V8, DocumentApp, GasOnlineTestFramework, codebase-memory-mcp.

## Global Constraints

- Test only important styles: bold, italic, foreground color, list glyph, table border/background, and column width.
- Cover both `bullet_list` and `number_list`.
- Preserve native `ListItem` structure; do not synthesize bullet or number characters in text.
- Never edit `dist/*`.
- Keep native GAS globals confined to sanctioned online-test files and GoogleApiWrapper boundaries.
- Use the regenerated codebase-memory graph for discovery and refresh it after final changes.
- Do not alter public WorkspaceTemplateEngine APIs.

---

## File Structure

- `WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js` — offline regression coverage for bullet and numbered native-list insertion and styled segment application.
- `WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs` — automated real-GAS formatting checks for simple, table, bullet, and numbered placeholders.
- `__testOnline__/HumanInspectionTests.gs` — generated visual fixture plus automated checks covering all document placeholder categories.
- `.codebase-memory/artifact.json` and `.codebase-memory/graph.db.zst` — refreshed graph metadata and persisted graph.

### Task 1: Strengthen Offline Native-List Regression Coverage

**Files:**
- Modify: `WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js:1560-1720`
- Test: `WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js`

**Interfaces:**
- Consumes: `DocumentProcessor._executeListLoopOperation(documentId, op)`.
- Produces: regression proof that both list commands insert copied `ListItem` objects with `Body.insertListItem()` and preserve representative text styling.

- [ ] **Step 1: Replace the bullet-only ListItem regression with a bullet/number matrix**

Use one table-driven test so both commands exercise the shared native path:

```js
it.each([
  ['bullet', '{{#bullet_list:items}}{{nome}}{{/bullet_list}}'],
  ['number', '{{#number_list:items}}{{nome}}{{/number_list}}']
])(
  'uses Body.insertListItem() for a real %s ListItem marker',
  (listType, fullMatch) => {
    mockTemplateParagraph.getType = jest.fn(() => 'LIST_ITEM');
    mockBody.insertListItem = jest.fn(() => mockInsertedParagraph);
    const op = {
      type: 'listLoop',
      paragraphIndex: 42,
      listType,
      dataArray: [{ nome: 'Alice' }],
      itemTemplate: '{{nome}}',
      fullMatch,
      sourceRuns: []
    };

    processor._executeListLoopOperation('doc123', op);

    expect(mockBody.insertListItem).toHaveBeenCalledWith(4, mockCopiedParagraph);
    expect(mockBody.insertParagraph).not.toHaveBeenCalled();
  }
);
```

- [ ] **Step 2: Run the focused matrix and establish current behavior**

Run:

```bash
npx jest WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js \
  -t "uses Body.insertListItem"
```

Expected on current `main`: PASS for bullet and number. This confirms commits
`e1f09fd` and `034a22a` already contain the production fix. If either case
fails, stop and preserve the failure output before editing production code.

- [ ] **Step 3: Strengthen the existing style assertion**

Extend `retexts each inserted paragraph with the rendered item and applies
source run styles`:

```js
expect(mockTextElement.setAttributes).toHaveBeenCalledWith(0, 5, { BOLD: true });
```

This checks actual native attribute application, not only text insertion.

- [ ] **Step 4: Run the complete DocumentProcessor test file**

Run:

```bash
npx jest WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js
```

Expected: PASS with zero failures.

- [ ] **Step 5: Commit**

```bash
git add WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js
git commit -m "test(WorkspaceTemplateEngine): cover bullet and numbered native list insertion"
```

### Task 2: Expand Automated Real-GAS Formatting Tests

**Files:**
- Modify: `WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs:148-292`
- Test: `WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs`

**Interfaces:**
- Consumes: public `DocumentProcessor.process(documentId, context)` and native DocumentApp inspection APIs.
- Produces: online regression coverage for key text, table, bullet, and numbered formatting.

- [ ] **Step 1: Expand simple-substitution setup and assertions**

After applying bold to `{{name}}`, add:

```js
text.setItalic(nameStart, nameStart + '{{name}}'.length - 1, true);
text.setForegroundColor(nameStart, nameStart + '{{name}}'.length - 1, '#3366ff');
```

After locating `aliceStart`, add:

```js
SmartAssert.isTrue(updatedText.isItalic(aliceStart), 'Substituted name should keep italic');
SmartAssert.equals(
  updatedText.getForegroundColor(aliceStart),
  '#3366ff',
  'Substituted name should keep foreground color'
);
```

- [ ] **Step 2: Add representative row-loop text formatting**

In `Formatting_TableRowLoop`, bold the template name placeholder:

```js
const nameCellText = templateRow.getCell(0).editAsText();
nameCellText.setBold(0, templateRow.getCell(0).getText().length - 1, true);
```

After rendering, assert:

```js
SmartAssert.isTrue(
  updatedTable.getRow(1).getCell(0).editAsText().isBold(0),
  'Copied row placeholder text should stay bold'
);
```

Keep existing border and yellow-background assertions unchanged.

- [ ] **Step 3: Add representative column-loop text formatting**

In `Formatting_TableColLoop`, bold the first template header cell:

```js
const headerText = table.getRow(0).getCell(0).editAsText();
headerText.setBold(0, table.getRow(0).getCell(0).getText().length - 1, true);
```

After rendering, assert:

```js
SmartAssert.isTrue(
  updatedTable.getRow(0).getCell(1).editAsText().isBold(0),
  'Copied column header should stay bold'
);
```

Keep the existing `120` width assertion.

- [ ] **Step 4: Strengthen bullet-list formatting**

Before closing the source document:

```js
listItem.editAsText().setBold(0, listItem.getText().length - 1, true);
```

After rendering:

```js
SmartAssert.isTrue(listItems[0].editAsText().isBold(0), 'Bullet text should stay bold');
SmartAssert.equals(
  listItems[1].getGlyphType().toString(),
  DocumentApp.GlyphType.BULLET.toString(),
  'Every rendered bullet item should retain bullet glyph'
);
```

- [ ] **Step 5: Add numbered-list online regression**

Register a new test directly after `Formatting_BulletList`:

```js
runner.register(`${NS}/Document/Formatting_NumberList`, () => {
  testContext.resetDocument();
  const doc = testContext.getDocument();
  const listItem = doc
    .getBody()
    .appendListItem('{{#number_list:names}}{{nome}}{{/number_list}}');
  listItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
  listItem.editAsText().setBold(0, listItem.getText().length - 1, true);
  doc.saveAndClose();

  const logger = new LoggerService();
  const mustache = new Mustache({ logger });
  const placeholderService = new PlaceholderService({ logger, mustache });
  const docProcessor = new DocumentProcessor(placeholderService);
  docProcessor.process(doc.getId(), { names: [{ nome: 'Alice' }, { nome: 'Bob' }] });

  const rendered = DocumentApp.openById(doc.getId()).getBody().getListItems();
  SmartAssert.equals(rendered.length, 2, 'Should have one numbered item per entry');
  SmartAssert.equals(rendered[0].getText(), 'Alice', 'First numbered item text');
  SmartAssert.equals(rendered[1].getText(), 'Bob', 'Second numbered item text');
  SmartAssert.equals(
    rendered[0].getGlyphType().toString(),
    DocumentApp.GlyphType.NUMBER.toString(),
    'Numbered list must not flatten into plain paragraphs'
  );
  SmartAssert.equals(
    rendered[1].getGlyphType().toString(),
    DocumentApp.GlyphType.NUMBER.toString(),
    'Every rendered item should retain numbered glyph'
  );
  SmartAssert.isTrue(rendered[0].editAsText().isBold(0), 'Numbered text should stay bold');
});
```

- [ ] **Step 6: Format-check the edited online suite**

Run:

```bash
npx prettier --check WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs
```

Expected: exit 0. If Prettier reports drift, run:

```bash
npx prettier --write WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs
```

Then rerun the check.

- [ ] **Step 7: Build the online bundle**

Run:

```bash
npm run build:testing
```

Expected: exit 0 and no syntax/build errors.

- [ ] **Step 8: Commit**

```bash
git add WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs
git commit -m "test(WorkspaceTemplateEngine): expand online formatting regressions"
```

### Task 3: Extend HumanInspection Fixture and Assertions

**Files:**
- Modify: `__testOnline__/HumanInspectionTests.gs:42-260`
- Test: `__testOnline__/HumanInspectionTests.gs`

**Interfaces:**
- Consumes: existing `HumanInspection/Full_Suite`, `DocumentProcessor.process()`, and logged template/output URLs.
- Produces: one compact visual document showing important formatting for all four placeholder categories and automated assertions matching it.

- [ ] **Step 1: Style the simple title placeholder**

Replace the plain title append with:

```js
const titleParagraph = tbody.appendParagraph('Title: {{title}}');
const titleText = titleParagraph.editAsText();
const titleStart = titleParagraph.getText().indexOf('{{title}}');
titleText.setBold(titleStart, titleStart + '{{title}}'.length - 1, true);
titleText.setItalic(titleStart, titleStart + '{{title}}'.length - 1, true);
titleText.setForegroundColor(titleStart, titleStart + '{{title}}'.length - 1, '#3366ff');
```

- [ ] **Step 2: Style existing row and column loop templates**

After `tbody.appendTable(tableBData)`, retain the returned table and apply:

```js
const tableB = tbody.appendTable(tableBData);
tableB.setBorderWidth(2);
tableB.getRow(1).getCell(1).setBackgroundColor('#fff2cc');
tableB
  .getRow(1)
  .getCell(0)
  .editAsText()
  .setBold(0, tableB.getRow(1).getCell(0).getText().length - 1, true);
```

Remove the original standalone `tbody.appendTable(tableBData)`.

After constructing section C, use:

```js
const tableC = tbody.appendTable(tableCData);
tableC.getRow(0).getCell(1).setWidth(120);
tableC
  .getRow(0)
  .getCell(1)
  .editAsText()
  .setBold(0, tableC.getRow(0).getCell(1).getText().length - 1, true);
```

Remove the original standalone `tbody.appendTable(tableCData)`.

- [ ] **Step 3: Style bullet marker and add numbered marker**

Replace the current bullet append with:

```js
const bulletMarker = tbody.appendListItem(
  '{{#bullet_list:tasks}}{{label}} [priority: {{priority}}]{{/bullet_list}}'
);
bulletMarker.setGlyphType(DocumentApp.GlyphType.BULLET);
bulletMarker.editAsText().setBold(0, bulletMarker.getText().length - 1, true);

tbody.appendParagraph('Approval sequence:');
const numberMarker = tbody.appendListItem(
  '{{#number_list:approvals}}{{label}}{{/number_list}}'
);
numberMarker.setGlyphType(DocumentApp.GlyphType.NUMBER);
numberMarker.editAsText().setBold(0, numberMarker.getText().length - 1, true);
```

Add to `docContext`:

```js
approvals: [{ label: 'Draft' }, { label: 'Review' }, { label: 'Approval' }],
```

- [ ] **Step 4: Add simple and table formatting assertions**

After section A text assertions:

```js
const titleOutput = body
  .getParagraphs()
  .find((paragraph) => paragraph.getText().includes('Title: Annual Report 2025'));
const titleOutputText = titleOutput.editAsText();
const renderedTitleStart = titleOutput.getText().indexOf('Annual Report 2025');
SmartAssert.isTrue(titleOutputText.isBold(renderedTitleStart), 'A: title stays bold');
SmartAssert.isTrue(titleOutputText.isItalic(renderedTitleStart), 'A: title stays italic');
SmartAssert.equals(
  titleOutputText.getForegroundColor(renderedTitleStart),
  '#3366ff',
  'A: title keeps color'
);
```

After row-loop assertions:

```js
SmartAssert.equals(tableB.getBorderWidth(), 2, 'B: border preserved');
SmartAssert.equals(
  tableB.getRow(1).getCell(1).getBackgroundColor(),
  '#fff2cc',
  'B: cell background preserved'
);
SmartAssert.isTrue(
  tableB.getRow(1).getCell(0).editAsText().isBold(0),
  'B: row placeholder text stays bold'
);
```

After column-loop assertions:

```js
SmartAssert.equals(tableC.getRow(0).getCell(1).getWidth(), 120, 'C: width preserved');
SmartAssert.isTrue(
  tableC.getRow(0).getCell(1).editAsText().isBold(0),
  'C: column header stays bold'
);
```

- [ ] **Step 5: Replace count-only list checks with structure and glyph checks**

Keep existing text assertions, then use:

```js
const renderedListItems = body.getListItems();
SmartAssert.equals(renderedListItems.length, 7, 'D: 4 bullets + 3 numbered items');
for (let i = 0; i < 4; i++) {
  SmartAssert.equals(
    renderedListItems[i].getGlyphType().toString(),
    DocumentApp.GlyphType.BULLET.toString(),
    `D: bullet ${i + 1} keeps bullet glyph`
  );
}
for (let i = 4; i < 7; i++) {
  SmartAssert.equals(
    renderedListItems[i].getGlyphType().toString(),
    DocumentApp.GlyphType.NUMBER.toString(),
    `D: numbered item ${i - 3} keeps number glyph`
  );
}
SmartAssert.isTrue(renderedListItems[0].editAsText().isBold(0), 'D: bullet text stays bold');
SmartAssert.isTrue(renderedListItems[4].editAsText().isBold(0), 'D: numbered text stays bold');
```

- [ ] **Step 6: Format-check and build**

Run:

```bash
npx prettier --check __testOnline__/HumanInspectionTests.gs
npm run build:testing
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit**

```bash
git add __testOnline__/HumanInspectionTests.gs
git commit -m "test: add formatting matrix to HumanInspection"
```

### Task 4: Full Verification and Graph Refresh

**Files:**
- Modify: `.codebase-memory/artifact.json`
- Modify: `.codebase-memory/graph.db.zst`

**Interfaces:**
- Consumes: all test changes from Tasks 1-3.
- Produces: verified repository and fresh persisted GLF graph.

- [ ] **Step 1: Run focused and full offline verification**

Run:

```bash
npx jest WorkspaceTemplateEngine/src/processors/__tests__/DocumentProcessor.test.js
npm test
npm run lint
npm run format:check
npm run build:testing
```

Expected: every command exits 0; Jest reports zero failures.

- [ ] **Step 2: Build and run online tests when configured credentials are available**

Run:

```bash
npm run push:testing
```

Then execute these GAS entry points:

```text
runTests("WorkspaceTemplateEngine")
runHumanInspectionTests
```

Expected:

- `Formatting_SimpleSubstitution`, `Formatting_TableRowLoop`,
  `Formatting_TableColLoop`, `Formatting_BulletList`, and
  `Formatting_NumberList` pass.
- `HumanInspection/Full_Suite` passes and logs template/output Drive URLs.
- Output document visibly shows bullet dots and numbered-list numerals.

If online credentials or execution authority are unavailable, do not claim
online success; report build/offline evidence and exact unrun entry points.

- [ ] **Step 3: Regenerate persisted graph**

Call codebase-memory-mcp `index_repository` with:

```json
{
  "repo_path": "/home/giulio/Desktop/ALDO implementing/GasLibraryFactory",
  "name": "home-giulio-Desktop-ALDO-implementing-GasLibraryFactory",
  "mode": "full",
  "persistence": true
}
```

Expected: status `indexed`, nonzero node/edge counts, and updated persisted artifact.

- [ ] **Step 4: Re-query list path**

Use `search_graph` and `trace_path` to confirm:

```text
DocumentProcessor.process
  calls _executeListLoopOperation
  calls _buildStyledSegments and _retextParagraph
```

Confirm `_executeListLoopOperation` still dispatches real `LIST_ITEM` copies to
`Body.insertListItem()`.

- [ ] **Step 5: Commit graph refresh**

```bash
git add .codebase-memory/artifact.json .codebase-memory/graph.db.zst
git commit -m "chore: refresh GasLibraryFactory codebase graph"
```

- [ ] **Step 6: Inspect final repository state**

Run:

```bash
git status --short
git log -5 --oneline
```

Expected: only pre-existing unrelated untracked files remain; all task-owned
changes are committed.
