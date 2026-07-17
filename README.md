# GasLibraryFactory Monorepo

[![GAS V8 Compatibility](https://img.shields.io/badge/GAS-V8--Compatible-green.svg)](https://developers.google.com/apps-script/guides/v8)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Build: Webpack 5](https://img.shields.io/badge/Build-Webpack%205-blue.svg)](https://webpack.js.org/)

A high-performance, enterprise-grade monorepo for **Google Apps Script (GAS)** development. This project implements a modern development lifecycle for 16 interconnected libraries, utilizing **ES Modules**, **Webpack bundling**, and advanced **GAS V8 compatibility transformations**.

---

## 🏗️ Architectural Overview

The project follows a **Clean Architecture** approach with a strictly layered dependency model (L0 to L4). This ensures high modularity, testability, and separation of concerns.

### Dependency Hierarchy

1.  **L0: Foundation** (`CoreUtilsLib`)
2.  **L1: Infrastructure** (`GasResilienceLib`, `GoogleApiWrapper`, `GasSchemaValidatorLib`)
3.  **L2: Persistence** (`SheetDBLib`)
4.  **L3: Orchestration** (`JobRunnerLib`, `PipelineFramework`, `WorkspaceTemplateEngine`, `DomainRepositoryLib`)
5.  **L4: Context & Domain** (`ContextEngine`, `RoleResolutionLib`, `ComposableContentLib`, `GasExpressionEngineLib`, `GasDataImporter`)

---

## 📚 The 16 Libraries

### Layer 0-1: Core & Infrastructure

- **CoreUtilsLib**: Foundational stateless utilities (logging, hashing, PII redaction, regex safety, date manipulation).
- **GasResilienceLib**: The "stability backbone." Implements intelligent retries, exponential backoff, error classification, and **Circuit Breaker** patterns for GAS.
- **GoogleApiWrapper**: A **batch-first** wrapper for Google Workspace APIs (Drive, Sheets, Docs, Gmail). Optimized for high-volume operations using Advanced REST APIs.
- **GasSchemaValidatorLib**: A Zod-powered validation engine for GAS. Provides robust runtime type-checking and schema enforcement for data ingestion and API responses.

### Layer 2: Data Persistence

- **SheetDBLib**: A powerful **ORM-lite** that treats Google Sheets as a relational database. Supports SQL-like queries, ACID-like transactions, joins (O(n+m)), and schema validation.

### Layer 3-4: Application & Domain

- **JobRunnerLib**: Overcomes GAS execution limits (6/30 mins) using the **Recursive Trigger Pattern**. Automatically suspends and resumes long-running jobs via generators.
- **WorkspaceTemplateEngine**: Advanced document generation for Google Docs and Sheets with support for complex nested loops and conditions.
- **ContextEngine**: A sophisticated dependency injection and interceptor framework for dynamic behavior resolution.
- **PipelineFramework**: An ETL engine for managing data flows between external sources and Google Workspace.
- **GasExpressionEngineLib**: A high-speed expression evaluator used by the template and database engines.
- **DomainRepositoryLib**: Implementation of the Repository pattern to decouple domain logic from data access.
- **RoleResolutionLib**: Logic for resolving complex permission and role-based access control (RBAC) in Workspace apps.
- **ComposableContentLib**: A framework for building modular, reusable UI components and dynamic content.
- **GasDataImporter**: Specialized logic for handling large-scale data ingestion and validation.

### Testing & Monitoring

- **GasOnlineTestFramework**: A native, lightweight testing framework designed to run **directly inside the GAS environment**.
- **GasProcessMonitorLib**: Telemetry and monitoring for tracking execution health across complex script chains.

---

## 🛠️ Technology Stack

- **Language**: Modern JavaScript (ES2022+ / ES Modules).
- **Bundler**: **Webpack 5** with tree-shaking and library-target optimization.
- **Transpiler**: **Babel** targeting Chrome 80 (GAS V8 baseline).
- **Local Testing**: **Jest** with extensive mocks for Google services.
- **Deployment**: **CLASP** (Command Line Apps Script Projects).
- **Linting/Formatting**: **ESLint** & **Prettier**.

---

## 🚀 GAS V8 Compatibility & Transformations

Google Apps Script's V8 engine lacks support for certain modern JS features and has specific performance constraints. Our build pipeline (`scripts/build-and-prepare.cjs`) automatically patches the bundle:

### 1. Feature Polyfills & Shims

- **`Object.hasOwn` → `Object.prototype.hasOwnProperty.call`**: Patched for backward compatibility.
- **`.replaceAll()` → `.split().join()`**: Ensures string replacement works in all GAS environments.
- **`URL` Constructor Shim**: Injects a custom `URL` parser for environments where the native constructor is missing or inconsistent.

### 2. Regular Expression Safety

- **Unicode Property Escapes**: Automatically replaces `\p{L}` and emoji regex patterns (common in libraries like `zod` or `es-toolkit`) with GAS-compatible Unicode ranges to prevent runtime syntax errors.

### 3. Static Analysis & Warnings

The build script scans for unsupported or risky patterns:

- `crypto.getRandomValues()` (Not available in GAS).
- `structuredClone()` (ES2022+, requires polyfill).
- `Array.prototype.at()` / `findLast()` / `findLastIndex()`.
- **Size Guard**: Warns if the bundle approaches the GAS 6MB per-file limit.

---

## 💻 Development Workflow

### Prerequisites

```bash
npm install
clasp login
```

### Build Modes

- **Production**: `npm run build:production` (Minified, optimized for deployment).
- **Testing**: `npm run build:testing` (Readable code, includes online test files).
- **Offline Verification**: `npm run build:testoffline` (Runs full Jest suite against source + bundle).

### Testing

- **Local**: `npm test` (Fast, mocked environment).
- **Online**: `npm run push:testing` (Deploys to a test script for live environment verification).

### Deployment

```bash
# Build and push to Google
npm run push:production
```

---

## 🔍 Debugging & Source Maps

Because the code is bundled into a single `dist/Code.js`, the project generates a custom **Source Map Index** (`dist/source-map-index.json`). This allows you to map stack traces from GAS execution logs back to the exact module and line in the original source code.

---

## 📄 License

This project is licensed under the **GNU General Public License v3** - see the [LICENSE](LICENSE) file for details.

---

Created with ❤️ by **GasLibraryFactory**
