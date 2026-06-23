# GasDataImporter

**Version:** 1.0.0  
**Layer:** Application Orchestration (Layer 3)  
**Dependencies:** SheetDBLib, GoogleApiWrapper, GasExpressionEngineLib, CoreUtilsLib

## 📥 Overview

**GasDataImporter** is a configuration-driven **ETL (Extract, Transform, Load)** engine designed to automate data ingestion into `SheetDBLib` databases.

## 🏗️ File and Folder Structure

Organized around the standard ETL stages:

```text
GasDataImporter/
├── src/
│   ├── ImportEngine.js         # Facade: orchestrates the ETL pipeline
│   ├── ImportConfiguration.js  # Recipe parser and validation logic
│   ├── extract/                # Data Extraction layer
│   │   ├── SourceStrategy.js   # Base interface for data sources
│   │   ├── SheetByIdStrategy.js # Logic for single sheet extraction
│   │   ├── FolderStrategy.js   # Logic for directory-based bulk extraction
│   │   └── SourceStrategyFactory.js # Creates the correct strategy per recipe
│   ├── transform/              # Data Transformation layer
│   │   └── Transformer.js      # Applies mapping and calculated expressions
│   ├── load/                   # Data Loading layer
│   │   └── Loader.js           # Logic for INSERT/UPSERT via SheetDBLib
│   ├── errors/                 # ETL-specific exceptions (TransformError, etc.)
│   └── __tests__/              # Pipeline and strategy unit tests
```

## 🧩 Programming Patterns

1.  **Strategy Pattern**: Extraction uses interchangeable strategies (Sheet, Folder, etc.) to fetch raw data without coupling the engine to a specific format.
2.  **Factory Pattern**: `SourceStrategyFactory` dynamically instantiates the correct extraction strategy based on the recipe's `source.type` field.
3.  **Facade Pattern**: `ImportEngine` provides a simplified `.runImport()` method that hides the complexity of coordinating the extractor, transformer, and loader.
4.  **Pipeline Pattern (Implicit)**: Data flows through three distinct stages (E -> T -> L), where each stage's output is the next stage's input.
5.  **Metadata-Driven Design**: The entire import process is controlled by JSON "recipes" rather than hardcoded logic.

## ✨ Key Features

Instead of writing custom scripts for every data import task, GasDataImporter uses **JSON Recipes**. A recipe defines _where_ to get data (Source), _how_ to modify it (Transform), and _where_ to save it (Load). The engine handles the complexity of reading from external Sheets, normalizing data, calculating derived fields, and managing database conflict resolution (Upsert, Insert-Only, etc.).

## ✨ Key Features

- **Declarative ETL Recipes**: Define import logic in JSON, not code.
- **Flexible Extraction**:
  - **SheetById**: Extract from a specific Google Sheet range.
  - **Folder**: Extract from _all_ spreadsheets in a Drive folder (batch processing).
- **Powerful Transformation**:
  - **Mapping**: Rename columns (e.g., "First Name" -> "first_name").
  - **Normalization**: Auto-trim strings, format dates, change case.
  - **Calculated Fields**: Create new columns using `GasExpressionEngineLib` syntax (e.g., `{{price}} * {{qty}}`).
- **Smart Loading**:
  - **Strategies**: `INSERT_ONLY`, `UPDATE_ONLY`, `UPSERT`, `OVERWRITE`.
  - **Conflict Detection**: Define unique keys to prevent duplicates.
  - **Update-If-Newer**: Only update records if the source timestamp is newer.

## 📦 Installation

```javascript
import { ImportEngine } from '@GasDataImporter';
import { LoggerService, DriveService, SpreadsheetService } from '@GoogleApiWrapper';
import { DatabaseService } from '@SheetDBLib';
```

## 🚀 Quick Start

```javascript
// 1. Initialize Services
const logger = new LoggerService();
const drive = new DriveService(logger, ...);
const sheets = new SpreadsheetService(logger, ...);
const db = new DatabaseService('DB_ID', ...);

// 2. Create Engine
const engine = new ImportEngine(logger, drive, sheets, db);

// 3. Define Recipe
const recipe = {
  name: 'Import Users',
  source: {
    type: 'SheetById',
    config: {
      sheetId: 'SOURCE_SHEET_ID',
      range: 'Data!A1:Z',
      hasHeaders: true
    }
  },
  transform: {
    mapping: {
      'Full Name': 'name',
      'User Email': 'email'
    },
    normalization: {
      trim: true,
      lowercaseColumns: ['email']
    },
    calculated: {
      'status': 'active', // Static value
      'displayName': '{{name}} ({{email}})' // Dynamic template
    }
  },
  load: {
    targetTable: 'Users', // SheetDBLib table name
    conflictResolution: 'UPSERT',
    conflictKey: 'email'
  }
};

// 4. Run Import
const result = engine.runImport(recipe);
console.log(`Imported: ${result.load.inserted} inserted, ${result.load.updated} updated.`);
```

## 📚 Recipe Configuration

### Source Configuration

| Type        | Config Options                | Description                           |
| :---------- | :---------------------------- | :------------------------------------ |
| `SheetById` | `sheetId`, `range`, `tabName` | Reads a specific range.               |
| `Folder`    | `folderId`, `fileNamePattern` | Reads all matching files in a folder. |

### Transform Configuration

- **`mapping`**: Object mapping source headers to destination columns.
- **`normalization`**:
  - `trim`: Boolean.
  - `dateColumns`: Array of columns to parse as dates.
  - `dateFormat`: Output format (e.g., "yyyy-MM-dd").
- **`calculated`**: Object defining new fields. Supports Mustache syntax and math expressions if `GasExpressionEngineLib` is linked.

### Load Configuration

| Strategy      | Description                                                     |
| :------------ | :-------------------------------------------------------------- |
| `INSERT_ONLY` | Adds new records. Skips existing ones (based on `conflictKey`). |
| `UPDATE_ONLY` | Updates existing records. Skips new ones.                       |
| `UPSERT`      | Updates existing records, inserts new ones.                     |
| `OVERWRITE`   | **Destructive**. Deletes matching records and inserts new ones. |

## ⚙️ Architecture

1.  **Extract Phase**: The `SourceStrategyFactory` instantiates the correct strategy (e.g., `SheetByIdStrategy`) to fetch raw data.
2.  **Transform Phase**: The `Transformer` applies mappings, normalization, and calculates derived fields. It uses `GasExpressionEngineLib` for complex logic.
3.  **Load Phase**: The `Loader` interacts with `SheetDBLib`. It queries the destination table to check for existing records (using the `conflictKey`) and applies the chosen resolution strategy.

## 🧪 Testing

Integration tests require valid Source and Destination spreadsheet IDs.

```bash
npm test GasDataImporter
```
