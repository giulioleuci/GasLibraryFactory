# WorkspaceTemplateEngine Formatting Test Extension Design

## Goal

Protect the most important formatting-preservation behavior for document
placeholders and prevent `bullet_list` or `number_list` output from degrading
into plain paragraphs.

## Scope

Coverage stays deliberately compact:

- Simple text substitutions: bold, italic, and foreground color.
- Bullet and numbered lists: native list-item structure, original glyph type,
  and bold placeholder text.
- Table row loops: table border, template-cell background, and bold cell text.
- Table column loops: copied column width and bold header text.

Other supported formatting attributes remain covered by existing focused unit
tests. This change does not build an exhaustive online style matrix.

## Test Layers

### Offline tests

Extend existing WorkspaceTemplateEngine Jest tests. Add regression cases that
exercise both `bullet_list` and `number_list` through the native list-item path
and verify insertion uses `Body.insertListItem()`. Verify rendered segments
retain representative text styles.

Production code changes are permitted only after a new regression test fails
for the reported flattening behavior. If current code already passes, retain
the strengthened tests and do not rewrite working implementation.

### Online automated tests

Extend `WorkspaceTemplateEngine/__testOnline__/WorkspaceTemplateEngineTests.gs`
with real-GAS checks for:

- Simple substitution retaining bold, italic, and foreground color.
- Bullet-list output remaining native bullet `ListItem` elements.
- Number-list output remaining native numbered `ListItem` elements.
- List placeholder text retaining bold formatting.
- Row-loop output retaining border, background, and bold cell text.
- Column-loop output retaining width and bold header text.

Assertions inspect rendered text and native `DocumentApp` formatting APIs.

### HumanInspection

Extend `__testOnline__/HumanInspectionTests.gs` so its generated template and
output document visibly demonstrate:

- One styled simple placeholder.
- One bullet-list placeholder.
- One numbered-list placeholder.
- One row-loop table with representative structural and text formatting.
- One column-loop table with representative width and text formatting.

Keep automated assertions in the same suite. Existing logged Drive URLs remain
the manual inspection entry points.

## Bug Investigation

Use the regenerated codebase graph to trace list operations from
`DocumentProcessor.process()` through `_executeListLoopOperation()`,
`_buildStyledSegments()`, and `_retextParagraph()`.

The working hypothesis is that flattening occurs when a copied `ListItem` is
inserted or recreated as a plain `Paragraph`. A regression test must prove this
before any production edit. The minimal fix, if still needed, must preserve the
native element type and original glyph rather than synthesizing textual bullet
characters.

Both bullet and numbered paths must be tested because they share the same
executor.

## Verification

Run focused WorkspaceTemplateEngine and GasOnlineTestFramework Jest tests first,
then the full GasLibraryFactory test, lint, and build commands appropriate to
the repository. Build online artifacts and run the online suite when credentials
and the configured Apps Script project are available. Report online execution
separately from offline verification.

Regenerate and persist the GasLibraryFactory codebase-memory graph after final
source changes so graph contents match the verified code.
