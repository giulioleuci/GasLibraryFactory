# WorkspaceTemplateEngine

**Version:** 1.0.0  
**Layer:** Domain Logic (Layer 2)  
**Language:** TypeScript (strict, ES modules; Babel emits GAS V8 JavaScript)
**Dependencies:** CoreUtilsLib, GoogleApiWrapper

## 🏗️ File and Folder Structure

Organized into specialized components for parsing, filtering, and processing:

```text
WorkspaceTemplateEngine/
├── src/
│   ├── PlaceholderService.ts   # Main facade: scans and processes Docs/Sheets
│   ├── Mustache.ts             # Core interpreter for Mustache-style syntax
│   ├── FilterStrategy.ts       # Base class for all data transformation filters
│   ├── filters/                # Concrete filter implementations
│   │   ├── BuiltInFilters.ts   # Logic for date, case, and number formatting
│   │   └── AdvancedFilters.ts  # Logic for sorting and conditional filtering
│   ├── processors/             # Platform-specific structural expansion logic
│   │   ├── DocumentProcessor.ts # Logic for Google Docs structural manipulation
│   │   └── SheetProcessor.ts   # Logic for Google Sheets matrix expansion
│   └── __tests__/              # Unit and structural expansion tests
```

## 🧩 Programming Patterns

1.  **Strategy Pattern**: `FilterStrategy` and its subclasses define interchangeable algorithms for data transformation, while `DocumentProcessor` and `SheetProcessor` encapsulate platform-specific logic.
2.  **Pipe and Filter Pattern**: The Mustache engine uses Unix-style pipes (`|`) to pass data through a sequence of filters, enabling powerful, composable transformations.
3.  **Interpreter Pattern**: The `Mustache` class parses and evaluates a custom grammar (Mustache tags, pipes, and arguments) against a data context.
4.  **Reverse-Order Strategy**: A crucial, domain-specific pattern for stable Google Docs manipulation. It executes changes from the end of the document to the beginning to keep indices valid.
5.  **Facade Pattern**: `PlaceholderService` provides high-level methods that hide the complexity of scanning, parsing, and batch-executing structural changes.
6.  **Batch Request Builder**: Accumulates multiple changes into single, atomic API calls (via `GoogleApiWrapper`) for optimal performance.

## 📝 Overview

**WorkspaceTemplateEngine** is a specialized templating system designed for the Google Workspace ecosystem. It goes beyond simple string substitution to provide structural manipulation of Google Docs and Sheets based on data.

It implements a custom **Mustache-compatible engine** enhanced with a **Pipe-Filter architecture** (Strategy Pattern) for data transformation. Crucially, it solves the complex problem of modifying Google Docs programmatically without breaking document indices by employing a **Reverse-Order Processing Strategy**.

## ✨ Key Features

- **Reverse-Order Document Processing**: Modifies Google Docs from bottom to top. This ensures that inserting or deleting content (like expanding a table row) does not invalidate the indices of subsequent placeholders, a common crash cause in GAS.
- **Advanced Mustache Engine**:
  - Standard syntax: `{{variable}}`, `{{#section}}`, `{{^inverted}}`.
  - **Filter Support**: `{{value | uppercase | limit:10}}`.
  - **Extensible**: Register custom filters via `FilterRegistry`.
  - **Secure**: Prototype pollution protection and ReDoS limits.
- **Structural Expansion**:
  - **Docs**: Dynamic table rows (`{{#tablerow_loop}}`), dynamic columns (`{{#tablecol_loop}}`), and lists (`{{#bullet_list}}`).
  - **Sheets**: Matrix expansion (`{{matrice_dati}}`) to populate grids from arrays.
- **Performance**: Uses `GoogleApiWrapper` to execute batch updates (`batchUpdate`) for both Docs and Sheets, minimizing round-trips.

## Row loop marker position

`{{#tablerow_loop:path}}` may open **any cell** of the template row (not only the
first). The marker is stripped from that cell and the whole row is repeated per item.

## Filters in Google Docs structural loops

`tablerow_loop`, `tablecol_loop`, `bullet_list`, and `number_list` support
`sortBy`, `reverse`, `limit`, `filter` (property equality), and `exclude`
(property inequality). Separate filter arguments with commas:

```mustache
{{#tablerow_loop:items | exclude:'sigla','SOS'}}{{sigla}}
```

`exclude` reuses the ordinary placeholder filter: it keeps only objects with
an own property whose value differs by strict comparison, and blocks unsafe
property names. Missing arguments warn and leave the array unchanged, or throw
with `strictFilters: true`.

## 📦 Installation

```typescript
import { PlaceholderService, Mustache, FilterStrategy } from '@WorkspaceTemplateEngine';
import { LoggerService } from '@GoogleApiWrapper';
```

## 🚀 Quick Start

```typescript
// 1. Initialize
const logger = new LoggerService();
const mustache = new Mustache({ logger });
const service = new PlaceholderService({ logger, mustache });

// 2. Prepare Data
const context = {
  project: 'Apollo',
  team: [
    { name: 'Neil', role: 'Commander' },
    { name: 'Buzz', role: 'Pilot' }
  ]
};

// 3. Process a Document
service.processDocument('DOC_ID', context);

// 4. Process a String
const text = service.processString('Project: {{project | uppercase}}', context);
// Output: "Project: APOLLO"
```

## 📚 API Reference

### 1. PlaceholderService (Facade)

The main entry point for all operations.

- **`processString(template, context)`**: Renders a string template.
- **`processDocument(docId, context)`**: Scans a Google Doc, expands loops/tables, and replaces placeholders in-place.
- **`processSheet(sheetId, context, [sheetName])`**: Scans a Google Sheet and expands matrix placeholders.

### 2. Mustache Engine & Filters

The engine supports Unix-style pipes for filtering data.

**Built-in Filters:**

- `uppercase`, `lowercase`, `capitalize`
- `date`: Formats dates (e.g., `{{created_at | date}}`).
- `number`: Localized number formatting.
- `join`: Joins arrays (`{{tags | join:', '}}`).
- `sortBy`: Sorts arrays of objects (`{{users | sortBy:'lastName'}}`).
- `where`: Filters arrays (`{{users | where:'active',true}}`).

**Custom Filters (Strategy Pattern):**
You can extend the engine by creating custom filter strategies.

```typescript
class ReverseFilter extends FilterStrategy {
  getName() {
    return 'reverse';
  }
  getDescription() {
    return 'Reverses a string';
  }
  execute(value) {
    return String(value).split('').reverse().join('');
  }
}

mustache.registerFilter(new ReverseFilter());
// Usage: {{ name | reverse }}
```

### 3. Document Syntax (Google Docs)

Use these special tags inside your Google Doc templates:

| Feature         | Syntax                                           | Description                                                                 |
| :-------------- | :----------------------------------------------- | :-------------------------------------------------------------------------- |
| **Text**        | `{{variable}}`                                   | Simple substitution.                                                        |
| **Row Loop**    | `{{#tablerow_loop:items}}`                       | Place in the first cell of a row. Repeats the row for each item in `items`. |
| **Col Loop**    | `{{#tablecol_loop:items}}`                       | Place in a header cell. Repeats the column for each item.                   |
| **Bullet List** | `{{#bullet_list:items}}{{name}}{{/bullet_list}}` | Generates a bulleted list.                                                  |
| **Num List**    | `{{#number_list:items}}...{{/number_list}}`      | Generates a numbered list.                                                  |

**Example (Doc Table):**

```text
| Name | Role |
| {{#tablerow_loop:team}}{{name}} | {{role}} |
```

_Result: The row repeats for every team member._

### 4. Sheet Syntax (Google Sheets)

Use this syntax in a cell to expand an array into a grid.

**Syntax:**
`{{matrice_dati[sorgente=path.to.array, colonne=prop1;prop2, intestazioni=Header1;Header2]}}`

**Example:**
`{{matrice_dati[sorgente=team, colonne=name;role, intestazioni=Name;Role]}}`

_Result:_

| A        | B         |
| :------- | :-------- |
| **Name** | **Role**  |
| Neil     | Commander |
| Buzz     | Pilot     |

## ⚙️ Architecture Details

### Reverse-Order Strategy (Docs)

When `DocumentProcessor` scans a document, it builds a map of all operations (replacements, loops). It then sorts these operations by their index in **descending order**.
By executing changes from the end of the document to the beginning, the engine ensures that an insertion at index 100 does not shift the target of an operation pending at index 50. This guarantees stability even for complex, nested document structures.

### Batch Processing

Both `DocumentProcessor` and `SheetProcessor` do not make individual API calls for every cell or paragraph. They accumulate all calculated changes into a `batchUpdate` request payload and send it to Google's servers in one go via `GoogleApiWrapper`.

## 🧪 Testing

Unit tests mock the Google API responses to verify template logic.

```bash
npm test WorkspaceTemplateEngine
```
