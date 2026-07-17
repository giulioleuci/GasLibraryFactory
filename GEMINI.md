# GasLibraryFactory Monorepo: Gemini CLI Context

This project is a high-performance, enterprise-grade monorepo for developing 16 interconnected **Google Apps Script (GAS)** libraries. It uses modern JavaScript (ES Modules, classes) and a sophisticated build pipeline to ensure compatibility with the GAS V8 runtime.

## 🏗️ Project Architecture

The project follows a **Clean Architecture** approach with a strictly layered dependency model (L0 Foundation to L4 Context/Domain engines).

- **L0: Foundation** (`CoreUtilsLib`)
- **L1: Infrastructure** (`GasResilienceLib`, `GoogleApiWrapper`, `GasSchemaValidatorLib`)
- **L2: Persistence** (`SheetDBLib`)
- **L3: Orchestration** (`JobRunnerLib`, `PipelineFramework`, `WorkspaceTemplateEngine`, `DomainRepositoryLib`)
- **L4: Context & Domain** (`ContextEngine`, `RoleResolutionLib`, `ComposableContentLib`, `GasExpressionEngineLib`, `GasDataImporter`)

### Key Components

- **CoreUtilsLib**: Foundational stateless utilities.
- **GasResilienceLib**: Implements retries, exponential backoff, and Circuit Breaker patterns.
- **GasSchemaValidatorLib**: Zod-based validation engine for robust runtime type-checking.
- **SheetDBLib**: ORM-lite for treating Google Sheets as a relational database.
- **JobRunnerLib**: Manages long-running jobs via the Recursive Trigger Pattern.
- **WorkspaceTemplateEngine**: Document generation for Google Docs and Sheets.
- **ContextEngine**: Dependency injection and interceptor framework.
- **GasOnlineTestFramework**: Native GAS testing framework.

## 🛠️ Technology Stack

- **Language**: Modern JavaScript (ES2022+ / ES Modules).
- **Bundler**: Webpack 5 with tree-shaking and library-target optimization.
- **Transpiler**: Babel targeting Chrome 80 (GAS V8 baseline).
- **Local Testing**: Jest with extensive mocks for Google services.
- **Deployment**: CLASP (Command Line Apps Script Projects).
- **Linting/Formatting**: ESLint & Prettier.

## 🚀 Build and Deployment Workflow

The source files are bundled into a single `dist/Code.js` file, which is then post-processed for GAS compatibility.

### Key Build Commands

- `npm run build:production`: Production build (minified, optimized).
- `npm run build:testing`: Testing build (readable code, includes online tests).
- `npm run build:testoffline`: Runs full Jest suite against source + bundle.

### Deployment Commands

- `npm run push:production`: Build and push to the production GAS script.
- `npm run push:testing`: Build and push to the testing GAS script.

### Testing Commands

- `npm test`: Run local Jest tests (mocked environment). **Warning: Run tests one at a time to avoid RAM saturation (e.g., using `--runInBand` or targeting specific files).**
- `npm run test:watch`: Run Jest in watch mode.
- `npm run test:coverage`: Generate test coverage reports.
- `npm run test:integration`: Run integration tests.

## ⚠️ Critical Development Rules

1. **GAS V8 Compatibility**: Always write code compatible with the Google Apps Script V8 runtime. Prefer synchronous code and avoid Node-specific or unsupported browser APIs.
2. **Never Edit `dist/`**: The `dist/` directory is automatically generated. Only modify source modules within the library directories (e.g., `CoreUtilsLib/src/`).
3. **Build Script Transformations**: The `scripts/build-and-prepare.cjs` script performs critical transformations (polyfills, regex safety, etc.). If runtime behavior differs from source, verify this script.
4. **Debugging Workflow**:
   - Locate errors in the compiled `dist/Code.js`.
   - Use `dist/source-map-index.json` or source maps to map back to source modules.
   - Propose minimal fixes in the **source** code.
5. **Dependency Management**: Do not introduce circular dependencies between libraries. Follow the established layered architecture.

## 📂 Key Directory Mapping

- `CoreUtilsLib`, `GasResilienceLib`, etc.: Individual library source code.
- `dist/`: Bundled and GAS-compatible output for deployment.
- `scripts/`: Build and utility scripts.
- `test/`: Local test setup and mocks.
- `__testOnline__/`: Online GAS test runners and utilities.
- `docs/`: API reference and documentation.
