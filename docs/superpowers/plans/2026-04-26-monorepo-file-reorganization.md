# Monorepo File Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize all 16 GAS libraries by moving implementation details into dedicated subfolders (internal/, facades/, builders/, etc.) while maintaining 100% backward compatibility via index.js re-exports.

**Architecture:** File-movement refactoring executed library-by-library. Each library phase: (1) create subdirectories, (2) move files, (3) update imports systematically, (4) verify index.js exports, (5) run tests, (6) commit.

**Tech Stack:** JavaScript (ES Modules), Webpack 5, Jest (4,300+ tests), Google Apps Script V8

---

## Phase 1: CoreUtilsLib (Layer 0 Foundation)

**Files:**
- Create: `CoreUtilsLib/src/{facades,errors,internal,builders,utils}/`
- Move: 6 files to internal/, 1 to facades/, 1 to errors/, 3 to builders/
- Update: `CoreUtilsLib/src/__tests__/**/*.js`, `CoreUtilsLib/index.js`

### Task 1.1: Create Directory Structure

- [ ] **Step 1: Create facades/, errors/, internal/, builders/ subdirectories**

```bash
cd CoreUtilsLib/src
mkdir -p facades errors internal builders utils
ls -la | grep "^d"
```

Expected: Four new directories created.

- [ ] **Step 2: Verify utils/ already exists**

```bash
ls -la utils/
```

Expected: DateUtils.js, IdGenerator.js, StringUtils.js, etc. already present.

### Task 1.2: Move Files – Facades

- [ ] **Step 1: Move LodashFacade.js to facades/**

```bash
mv CoreUtilsLib/src/LodashFacade.js CoreUtilsLib/src/facades/LodashFacade.js
```

- [ ] **Step 2: Find all imports of LodashFacade**

```bash
grep -r "from '[./]*\.\./\?LodashFacade'" CoreUtilsLib/ --include="*.js" | grep -v node_modules
grep -r "from '[./]*facades/LodashFacade'" CoreUtilsLib/ --include="*.js" | head -20
```

Expected: Shows all current imports.

- [ ] **Step 3: Update imports in source files**

For each file that imports LodashFacade:
- Change `from './LodashFacade'` → `from './facades/LodashFacade'`
- Change `from '../LodashFacade'` → `from '../facades/LodashFacade'`
- Change `from '../../LodashFacade'` → `from '../../facades/LodashFacade'`

Example files to update:
- `CoreUtilsLib/src/LoggerService.js` (if it imports LodashFacade)
- `CoreUtilsLib/src/UtilsService.js` (if it imports LodashFacade)

Use find/replace:
```bash
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/facades/*" -exec sed -i "s|from '\\.\\./LodashFacade'|from '../facades/LodashFacade'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/facades/*" -exec sed -i "s|from '\\.\\./\\.\\.LodashFacade'|from '../../facades/LodashFacade'|g" {} \;
```

### Task 1.3: Move Files – Errors

- [ ] **Step 1: Move BaseError.js to errors/**

```bash
mv CoreUtilsLib/src/BaseError.js CoreUtilsLib/src/errors/BaseError.js
```

- [ ] **Step 2: Update all BaseError imports**

```bash
grep -r "from '[./]*\.\./\?BaseError'" CoreUtilsLib/ --include="*.js" | grep -v node_modules
```

Use find/replace:
```bash
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/errors/*" -exec sed -i "s|from '\\.\\./BaseError'|from '../errors/BaseError'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/errors/*" -exec sed -i "s|from '\\.\\./\\.\\.BaseError'|from '../../errors/BaseError'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/errors/*" -exec sed -i "s|from '\\.\\./\\.\\.\\./BaseError'|from '../../../errors/BaseError'|g" {} \;
```

### Task 1.4: Move Files – Internal Utilities

- [ ] **Step 1: Move 6 utility files to internal/**

```bash
mv CoreUtilsLib/src/BoundedMap.js CoreUtilsLib/src/internal/BoundedMap.js
mv CoreUtilsLib/src/CacheUtils.js CoreUtilsLib/src/internal/CacheUtils.js
mv CoreUtilsLib/src/HashUtils.js CoreUtilsLib/src/internal/HashUtils.js
mv CoreUtilsLib/src/PiiRedactor.js CoreUtilsLib/src/internal/PiiRedactor.js
mv CoreUtilsLib/src/PlaceholderUtils.js CoreUtilsLib/src/internal/PlaceholderUtils.js
mv CoreUtilsLib/src/RegexUtils.js CoreUtilsLib/src/internal/RegexUtils.js
```

- [ ] **Step 2: Update imports for each moved file**

For BoundedMap:
```bash
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./BoundedMap'|from '../internal/BoundedMap'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./\\.\\.BoundedMap'|from '../../internal/BoundedMap'|g" {} \;
```

Repeat for CacheUtils, HashUtils, PiiRedactor, PlaceholderUtils, RegexUtils (exact same pattern, different filename).

### Task 1.5: Move Files – Configuration Builder

- [ ] **Step 1: Move ConfigurationBuilder.js to builders/**

```bash
mv CoreUtilsLib/src/ConfigurationBuilder.js CoreUtilsLib/src/builders/ConfigurationBuilder.js
```

- [ ] **Step 2: Move config/ files to builders/**

```bash
mv CoreUtilsLib/src/config/ConfigMergeStrategy.js CoreUtilsLib/src/builders/ConfigMergeStrategy.js
mv CoreUtilsLib/src/config/ConfigValidator.js CoreUtilsLib/src/builders/ConfigValidator.js
rmdir CoreUtilsLib/src/config
```

- [ ] **Step 3: Update all imports of ConfigurationBuilder**

```bash
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/builders/*" -exec sed -i "s|from '\\.\\./ConfigurationBuilder'|from '../builders/ConfigurationBuilder'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/builders/*" -exec sed -i "s|from '\\.\\./config/ConfigMergeStrategy'|from '../builders/ConfigMergeStrategy'|g" {} \;
find CoreUtilsLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/builders/*" -exec sed -i "s|from '\\.\\./config/ConfigValidator'|from '../builders/ConfigValidator'|g" {} \;
```

### Task 1.6: Update CoreUtilsLib index.js

- [ ] **Step 1: Read current index.js**

```bash
cat CoreUtilsLib/index.js
```

- [ ] **Step 2: Update all internal exports to reflect new paths**

Update these exports in `CoreUtilsLib/index.js`:

```javascript
// Public API (unchanged names)
export { default as LoggerService } from './src/LoggerService.js';
export { default as UtilsService, UtilsService as MyUtilsService } from './src/UtilsService.js';
export { default as ValidationUtils } from './src/ValidationUtils.js';
export { default as ServiceValidator } from './src/ServiceValidator.js';
export { default as TypeGuards } from './src/TypeGuards.js';
export { default as interfaces } from './src/interfaces.js';

// Re-export error classes for backward compatibility
export { default as BaseError } from './src/errors/BaseError.js';

// Re-export facades
export { default as LodashFacade } from './src/facades/LodashFacade.js';

// Re-export internal utilities (for backward compatibility)
export { default as BoundedMap } from './src/internal/BoundedMap.js';
export { default as CacheUtils } from './src/internal/CacheUtils.js';
export { default as HashUtils } from './src/internal/HashUtils.js';
export { default as PiiRedactor } from './src/internal/PiiRedactor.js';
export { default as PlaceholderUtils } from './src/internal/PlaceholderUtils.js';
export { default as RegexUtils } from './src/internal/RegexUtils.js';

// Re-export builders
export { default as ConfigurationBuilder } from './src/builders/ConfigurationBuilder.js';
export { default as ConfigMergeStrategy } from './src/builders/ConfigMergeStrategy.js';
export { default as ConfigValidator } from './src/builders/ConfigValidator.js';

// Re-export utils (unchanged location)
export { default as DateUtils } from './src/utils/DateUtils.js';
export { default as IdGenerator } from './src/utils/IdGenerator.js';
export { default as StringUtils } from './src/utils/StringUtils.js';
export { default as SystemEnvironmentUtils } from './src/utils/SystemEnvironmentUtils.js';
export { default as SystemQuotaManager } from './src/utils/SystemQuotaManager.js';
export { default as SystemScriptSettings } from './src/utils/SystemScriptSettings.js';
export { default as SystemUtils } from './src/utils/SystemUtils.js';
```

### Task 1.7: Update Test File Imports

- [ ] **Step 1: Find all test files**

```bash
find CoreUtilsLib/src/__tests__ -name "*.js" -type f
```

- [ ] **Step 2: Update test imports for moved files**

For each test file, update imports:
- `from '../LodashFacade'` → `from '../facades/LodashFacade'`
- `from '../BaseError'` → `from '../errors/BaseError'`
- `from '../BoundedMap'` → `from '../internal/BoundedMap'`
- etc.

Use bulk find/replace:
```bash
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./LodashFacade'|from '../facades/LodashFacade'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./BaseError'|from '../errors/BaseError'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./BoundedMap'|from '../internal/BoundedMap'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./CacheUtils'|from '../internal/CacheUtils'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./HashUtils'|from '../internal/HashUtils'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./PiiRedactor'|from '../internal/PiiRedactor'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./PlaceholderUtils'|from '../internal/PlaceholderUtils'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./RegexUtils'|from '../internal/RegexUtils'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./ConfigurationBuilder'|from '../builders/ConfigurationBuilder'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./config/ConfigMergeStrategy'|from '../builders/ConfigMergeStrategy'|g" {} \;
find CoreUtilsLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./config/ConfigValidator'|from '../builders/ConfigValidator'|g" {} \;
```

### Task 1.8: Test CoreUtilsLib

- [ ] **Step 1: Run CoreUtilsLib tests**

```bash
npm test -- CoreUtilsLib
```

Expected: All tests pass (0 failures).

- [ ] **Step 2: Verify no import errors**

Check output for any "Cannot find module" or "import not found" messages. If present, diagnose and fix import paths.

### Task 1.9: Commit Phase 1

- [ ] **Step 1: Stage all changes**

```bash
git add CoreUtilsLib/
```

- [ ] **Step 2: Create commit**

```bash
git commit -m "refactor(CoreUtilsLib): reorganize files into facades/, errors/, internal/, builders/"
```

Expected: Commit succeeds with message showing files moved/modified.

---

## Phase 2: GasResilienceLib (Layer 1 Resilience)

**Files:**
- Create: `GasResilienceLib/src/{internal,handlers}/`
- Move: 2 exception files, 3 manager files
- Update: handler imports, index.js

### Task 2.1: Create Directory Structure

- [ ] **Step 1: Create internal/ and handlers/ (if not exist)**

```bash
cd GasResilienceLib/src
mkdir -p internal/exceptions handlers/internal
```

### Task 2.2: Move Exception Files to internal/exceptions/

- [ ] **Step 1: Move exceptions**

```bash
mv GasResilienceLib/src/exceptions/RateLimitExceededException.js GasResilienceLib/src/internal/exceptions/RateLimitExceededException.js
mv GasResilienceLib/src/exceptions/TimeoutException.js GasResilienceLib/src/internal/exceptions/TimeoutException.js
rmdir GasResilienceLib/src/exceptions
```

- [ ] **Step 2: Update all exception imports**

```bash
find GasResilienceLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./exceptions/|from '../internal/exceptions/|g" {} \;
find GasResilienceLib/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./\\.\\.exceptions/|from '../../internal/exceptions/|g" {} \;
```

### Task 2.3: Move Handler Managers to handlers/internal/

- [ ] **Step 1: Move manager files**

```bash
mv GasResilienceLib/src/handlers/managers/ErrorReporterRecorder.js GasResilienceLib/src/handlers/internal/ErrorReporterRecorder.js
mv GasResilienceLib/src/handlers/managers/ErrorReporterSanitizer.js GasResilienceLib/src/handlers/internal/ErrorReporterSanitizer.js
mv GasResilienceLib/src/handlers/managers/ErrorReporterStatistics.js GasResilienceLib/src/handlers/internal/ErrorReporterStatistics.js
rmdir GasResilienceLib/src/handlers/managers
```

- [ ] **Step 2: Update imports in handler files**

In files like `ErrorReporter.js`:
```bash
find GasResilienceLib/src/handlers -name "*.js" -type f ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./managers/ErrorReporterRecorder'|from './internal/ErrorReporterRecorder'|g" {} \;
find GasResilienceLib/src/handlers -name "*.js" -type f ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./managers/ErrorReporterSanitizer'|from './internal/ErrorReporterSanitizer'|g" {} \;
find GasResilienceLib/src/handlers -name "*.js" -type f ! -path "*/internal/*" -exec sed -i "s|from '\\.\\./managers/ErrorReporterStatistics'|from './internal/ErrorReporterStatistics'|g" {} \;
```

### Task 2.4: Update Test Imports

- [ ] **Step 1: Update test file imports**

```bash
find GasResilienceLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./exceptions/|from '../internal/exceptions/|g" {} \;
find GasResilienceLib/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./handlers/managers/|from '../handlers/internal/|g" {} \;
```

### Task 2.5: Update GasResilienceLib index.js

- [ ] **Step 1: Read current index.js**

```bash
cat GasResilienceLib/index.js
```

- [ ] **Step 2: Update exports for moved files**

Update exception and manager exports to use new paths:

```javascript
// Public API (unchanged)
export { default as Configuration } from './src/Configuration.js';
export { default as ExceptionService } from './src/ExceptionService.js';
export { default as CircuitBreaker } from './src/handlers/CircuitBreaker.js';
export { default as ErrorClassifier } from './src/handlers/ErrorClassifier.js';
export { default as ErrorReporter } from './src/handlers/ErrorReporter.js';
export { default as RecoveryManager } from './src/handlers/RecoveryManager.js';
export { default as ResilienceExecutionHandler } from './src/handlers/ResilienceExecutionHandler.js';
export { default as ResilienceStatsTracker } from './src/handlers/ResilienceStatsTracker.js';

// Re-export exceptions for backward compatibility
export { default as RateLimitExceededException } from './src/internal/exceptions/RateLimitExceededException.js';
export { default as TimeoutException } from './src/internal/exceptions/TimeoutException.js';

// Re-export internal managers for backward compatibility (if exported before)
export { default as ErrorReporterRecorder } from './src/handlers/internal/ErrorReporterRecorder.js';
export { default as ErrorReporterSanitizer } from './src/handlers/internal/ErrorReporterSanitizer.js';
export { default as ErrorReporterStatistics } from './src/handlers/internal/ErrorReporterStatistics.js';
```

### Task 2.6: Test GasResilienceLib

- [ ] **Step 1: Run tests**

```bash
npm test -- GasResilienceLib
```

Expected: All tests pass.

### Task 2.7: Commit Phase 2

- [ ] **Step 1: Stage and commit**

```bash
git add GasResilienceLib/
git commit -m "refactor(GasResilienceLib): move exceptions and managers to internal/"
```

---

## Phase 3–16: Remaining Libraries

For libraries 3–16 (GasSchemaValidatorLib, GoogleApiWrapper, WorkspaceTemplateEngine, GasExpressionEngineLib, ContextEngine, SheetDBLib, DomainRepositoryLib, GasDataImporter, RoleResolutionLib, ComposableContentLib, JobRunnerLib, PipelineFramework, GasOnlineTestFramework, GasProcessMonitorLib), follow the same pattern as Phases 1–2:

**Standard template for each library:**

### Task N.1: Create Directory Structure
- Create all required subdirectories (internal/, facades/, builders/, etc.)

### Task N.2–N.M: Move Files by Category
- Move files to appropriate subfolders
- Update imports (find/replace patterns)
- Update test imports
- Update index.js exports

### Task N.Final: Test & Commit
- Run `npm test -- LibraryName`
- Commit with message: `refactor(LibraryName): reorganize files into internal/, {facades,builders,handlers,etc.}/`

**Key principles for all phases:**
- Update imports systematically using find/replace before running tests
- Maintain all index.js exports for backward compatibility
- Always run tests after a library is reorganized
- Commit frequently (one commit per library, not per file)

---

## Phase 17: Cross-Library Integration Testing

### Task 17.1: Full Test Suite

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: 4,300+ tests pass (0 failures).

### Task 17.2: Verify Build Pipeline

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: `dist/Code.js` generated without errors.

### Task 17.3: Verify No Circular Dependencies

- [ ] **Step 1: Check for circular dependencies**

```bash
npm run check:circular
```

Expected: No circular dependency warnings.

### Task 17.4: Verify Source Maps

- [ ] **Step 1: Verify source map exists**

```bash
ls -la dist/Code.js.map
ls -la dist/source-map-index.json
```

Expected: Both files present and valid.

### Task 17.5: Final Commit

- [ ] **Step 1: Create final integration commit**

```bash
git add -A
git commit -m "refactor: complete monorepo file reorganization - all 16 libraries reorganized"
```

---

## Implementation Notes

### For Each Library Phase:

**1. Directory Creation Pattern:**
```bash
cd LibraryName/src
mkdir -p internal facades builders handlers managers errors utils
```

**2. File Movement Pattern:**
```bash
mv LibraryName/src/OldLocation/File.js LibraryName/src/NewLocation/File.js
```

**3. Import Update Pattern (find/replace):**
```bash
find LibraryName/src -name "*.js" -type f ! -path "*/__tests__/*" ! -path "*/NewLocation/*" -exec sed -i "s|from '\\.\\./OldLocation/FileName'|from '../NewLocation/FileName'|g" {} \;
```

**4. Test Import Update Pattern:**
```bash
find LibraryName/src/__tests__ -name "*.js" -type f -exec sed -i "s|from '\\.\\./FileName'|from '../NewLocation/FileName'|g" {} \;
```

**5. Index.js Export Update Pattern:**
Verify all previous exports exist; update paths for moved files:
```javascript
export { default as ClassName } from './src/NewLocation/FileName.js';
```

### Verification Checklist After Each Library:

- [ ] All source files moved to correct locations
- [ ] All import statements updated (check for "Cannot find module" errors)
- [ ] index.js exports maintained and paths updated
- [ ] Test file imports updated
- [ ] `npm test -- LibraryName` passes
- [ ] No import errors in build output
- [ ] Commit created with descriptive message

---

## Success Criteria

✅ All 16 libraries reorganized according to LIST_FOR_SUBFOLDER.md

✅ 100% backward compatibility maintained (all exports in index.js)

✅ All 4,300+ tests passing (`npm test`)

✅ Build pipeline functional (`npm run build`)

✅ No circular dependencies introduced

✅ No broken imports across monorepo

✅ Code structure logically organized:
   - Public APIs at root level or marked folders
   - Internal implementations in `internal/` subfolders
   - Managers/handlers grouped logically
   - Facade patterns isolated
   - Error types organized together
