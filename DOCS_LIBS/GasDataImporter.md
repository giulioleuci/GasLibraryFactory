# API Reference: GasDataImporter

## CLASS: for
**File Path:** `GasDataImporter/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: for
**File Path:** `GasDataImporter/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ApiSourceStrategy
**File Path:** `GasDataImporter/index.js`
**Constructor Usage:** `const instance = new ApiSourceStrategy();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ImportDataProvider
**File Path:** `GasDataImporter/index.js`
**Constructor Usage:** `const instance = new ImportDataProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ImportStep
**File Path:** `GasDataImporter/index.js`
**Constructor Usage:** `const instance = new ImportStep();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ImportStep

#### METHOD: ImportStep.execute
- **Scope:** instance
- **LLM Call Syntax:** `importStep.execute(context);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: cannot
**File Path:** `GasDataImporter/Tests.gs`
**Constructor Usage:** `const instance = new cannot();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: instantiation
**File Path:** `GasDataImporter/Tests.gs`
**Constructor Usage:** `const instance = new instantiation();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: TestStrategy
**File Path:** `GasDataImporter/Tests.gs`
**Constructor Usage:** `const instance = new TestStrategy();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: CustomStrategy
**File Path:** `GasDataImporter/Tests.gs`
**Constructor Usage:** `const instance = new CustomStrategy();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ImportStrategyRegistry
**File Path:** `GasDataImporter/src/ImportStrategyRegistry.js`
**Constructor Usage:** `const instance = new ImportStrategyRegistry();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ImportStrategyRegistry

#### METHOD: ImportStrategyRegistry.registerCustomSource
- **Scope:** instance
- **LLM Call Syntax:** `importStrategyRegistry.registerCustomSource(name, strategyClass);`
- **Pure JSDoc:**
```javascript
/** Method registerCustomSource */
```
---
#### METHOD: ImportStrategyRegistry.getAvailableSourceTypes
- **Scope:** instance
- **LLM Call Syntax:** `importStrategyRegistry.getAvailableSourceTypes();`
- **Pure JSDoc:**
```javascript
/** Method getAvailableSourceTypes */
```
---
#### METHOD: ImportStrategyRegistry.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `importStrategyRegistry.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/** Method getConfigSummary */
```
---
<br>

## CLASS: ImportRecipeValidator
**File Path:** `GasDataImporter/src/ImportRecipeValidator.js`
**Constructor Usage:** `const instance = new ImportRecipeValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ImportRecipeValidator

#### METHOD: ImportRecipeValidator.validateRecipe
- **Scope:** instance
- **LLM Call Syntax:** `importRecipeValidator.validateRecipe(recipe);`
- **Pure JSDoc:**
```javascript
/** Method validateRecipe */
```
---
#### METHOD: ImportRecipeValidator.catch
- **Scope:** instance
- **LLM Call Syntax:** `importRecipeValidator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: ImportEngine
**File Path:** `GasDataImporter/src/ImportEngine.js`
**Constructor Usage:** `const instance = new ImportEngine();`
**Description:** @fileoverview Main facade for the GasDataImporter ETL pipeline
@author GasLibraryFactory
/

import { ImportConfiguration } from './ImportConfiguration.js';
import { SourceStrategyFactory } from './internal/extract-strategies/SourceStrategyFactory.js';
import { Transformer } from './pipeline/Transformer.js';
import { Loader } from './internal/load/Loader.js';
import { ImportError } from './internal/errors/ImportError.js';
import { ImportPipelineExecutor } from './pipeline/ImportPipelineExecutor.js';
import { ImportStrategyRegistry } from './ImportStrategyRegistry.js';
import { ImportRecipeValidator } from './ImportRecipeValidator.js';

/**
Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Main facade for the GasDataImporter ETL pipeline
 * @author GasLibraryFactory
 */

import { ImportConfiguration } from './ImportConfiguration.js';
import { SourceStrategyFactory } from './internal/extract-strategies/SourceStrategyFactory.js';
import { Transformer } from './pipeline/Transformer.js';
import { Loader } from './internal/load/Loader.js';
import { ImportError } from './internal/errors/ImportError.js';
import { ImportPipelineExecutor } from './pipeline/ImportPipelineExecutor.js';
import { ImportStrategyRegistry } from './ImportStrategyRegistry.js';
import { ImportRecipeValidator } from './ImportRecipeValidator.js';

/**
 * Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
 * @class
 */
```

<br>

## CLASS: ImportConfiguration
**File Path:** `GasDataImporter/src/ImportConfiguration.js`
**Constructor Usage:** `const instance = new ImportConfiguration();`
**Description:** @fileoverview Import configuration validator and value object
@author GasLibraryFactory
/

import { ConfigurationError } from './internal/errors/ConfigurationError.js';

/**
Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Import configuration validator and value object
 * @author GasLibraryFactory
 */

import { ConfigurationError } from './internal/errors/ConfigurationError.js';

/**
 * Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.
 * @class
 */
```

<br>

## CLASS: ImportCheckpoint
**File Path:** `GasDataImporter/src/ImportCheckpoint.js`
**Constructor Usage:** `const instance = new ImportCheckpoint();`
**Description:** @fileoverview Serializable checkpoint contract for resumable imports.
@author GasLibraryFactory
/

/** @typedef {'EXTRACT'|'LOAD'|'DONE'} ImportStage */

/**
Plain, JSON-serializable checkpoint describing progress through a single
recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
during EXTRACT on each bounded chunk). Designed to
be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
windows and resumed with `ImportEngine.runImportChunk`.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Serializable checkpoint contract for resumable imports.
 * @author GasLibraryFactory
 */

/** @typedef {'EXTRACT'|'LOAD'|'DONE'} ImportStage */

/**
 * Plain, JSON-serializable checkpoint describing progress through a single
 * recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
 * during EXTRACT on each bounded chunk). Designed to
 * be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
 * windows and resumed with `ImportEngine.runImportChunk`.
 * @class
 */
```

<br>

## CLASS: Transformer
**File Path:** `GasDataImporter/src/pipeline/Transformer.js`
**Constructor Usage:** `const instance = new Transformer();`
**Description:** @fileoverview Data transformation engine for the ETL pipeline (Transform phase)

/

import { TransformError } from '../internal/errors/TransformError.js';
import { Delegation, UtilsService } from '@CoreUtilsLib';
import { TransformerMappingEngine } from '../internal/transform-managers/TransformerMappingEngine.js';
import { TransformerDateStyler } from '../internal/transform-managers/TransformerDateStyler.js';
import { TransformerNumberSanitizer } from '../internal/transform-managers/TransformerNumberSanitizer.js';
import { TransformerValidationGuard } from '../internal/transform-managers/TransformerValidationGuard.js';

/**
Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Data transformation engine for the ETL pipeline (Transform phase)
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { TransformError } from '../internal/errors/TransformError.js';
import { Delegation, UtilsService } from '@CoreUtilsLib';
import { TransformerMappingEngine } from '../internal/transform-managers/TransformerMappingEngine.js';
import { TransformerDateStyler } from '../internal/transform-managers/TransformerDateStyler.js';
import { TransformerNumberSanitizer } from '../internal/transform-managers/TransformerNumberSanitizer.js';
import { TransformerValidationGuard } from '../internal/transform-managers/TransformerValidationGuard.js';

/**
 * Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
 * @class
 */
```

<br>

## CLASS: ImportPipelineExecutor
**File Path:** `GasDataImporter/src/pipeline/ImportPipelineExecutor.js`
**Constructor Usage:** `const instance = new ImportPipelineExecutor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ImportPipelineExecutor

#### METHOD: ImportPipelineExecutor.startImport
- **Scope:** instance
- **LLM Call Syntax:** `const result = importPipelineExecutor.startImport(recipe, _options);`
- **Pure JSDoc:**
```javascript
/**
   * Creates the initial checkpoint for a resumable/checkpointed import run,
   * without executing any pipeline phase yet. Pair with `runImportChunk` in
   * a loop (persisting the checkpoint to `PropertiesService` between GAS
   * execution windows via `JobRunnerLib`) to drive the recipe to completion
   * across multiple bounded chunks instead of one synchronous `runImport`.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @param {Object} [_options={}] Reserved for future use.
   * @returns {ImportCheckpoint} Initial checkpoint at the EXTRACT stage.
   * @throws {ConfigurationError} If the recipe fails validation.
   */
```
---
#### METHOD: ImportPipelineExecutor.runImportChunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = importPipelineExecutor.runImportChunk(recipe, checkpoint, budget, budget.maxRows);`
- **Pure JSDoc:**
```javascript
/**
   * Advances a checkpoint by one bounded unit of work. The recipe must be
   * re-passed on every call — it is intentionally not part of the
   * serializable checkpoint, to keep checkpoints small (`PropertiesService`
   * has per-key size limits) and because the recipe is normally already
   * available to the caller (e.g. `JobHandlerParams` in ALDO's `JobRunnerLib`
   * integration).
   *
   * Unlike the original design (extract everything into the buffer, then
   * transform the whole buffer, then load the whole buffer), each call now
   * does bounded work and `checkpoint.buffer` never holds more than roughly
   * one `maxRows`-sized batch at rest between calls (for the cursor-aware
   * case) — otherwise `checkpoint.buffer` could grow to the size of the
   * entire dataset, which won't fit in `PropertiesService` (~9KB per key,
   * ~500KB total), and TRANSFORM/LOAD would each still run unbounded in one
   * call, defeating the point of chunking:
   *
   * - **`EXTRACT`** (entered when `checkpoint.buffer` is empty and
   *   extraction isn't exhausted): pulls one bounded window of rows (see
   *   "Cursor-aware extraction" below), immediately transforms *that chunk*
   *   (`Transformer.transform` is a pure per-row mapping, so transforming a
   *   bounded slice is safe), and stores the transformed, load-ready rows as
   *   `checkpoint.buffer`. Moves to `LOAD`. Whether the source is now fully
   *   consumed is remembered in `checkpoint.rowOffset` (repurposed as a 0/1
   *   "extraction exhausted" flag — the field was previously reserved and
   *   unused) so the `LOAD` branch below can decide, without re-extracting,
   *   whether there is more to pull after this buffer is loaded.
   * - **`LOAD`** (entered when `checkpoint.buffer` has pending rows): loads
   *   the buffer via `Loader.loadChunk` (already handles arbitrary-size
   *   input, since it's already one bounded chunk) and clears the buffer.
   *   `isFirstChunk` is true only on the very first `LOAD` call of the
   *   entire run that actually carries a non-empty buffer
   *   (`checkpoint.loadOffset === 0`); `loadOffset` only increments when the
   *   chunk being loaded is non-empty — an empty chunk (e.g. a leading block
   *   of rows that were all rejected by transform validation, or a genuinely
   *   empty extracted window) does NOT consume the "first chunk" slot,
   *   because `Loader.loadChunk` short-circuits on `data.length === 0`
   *   before OVERWRITE's purge-then-insert logic ever runs — if `loadOffset`
   *   advanced anyway, the table would never get purged for a run whose
   *   first real data happened to arrive after an empty chunk. If
   *   extraction was already exhausted, moves to `DONE`; otherwise moves
   *   back to `EXTRACT` to pull the next bounded chunk.
   *
   * There is no standalone `TRANSFORM` stage: an earlier design produced one
   * (transforming the whole accumulated buffer in its own step), but that
   * design was replaced before ever shipping — transform now happens inline
   * during `EXTRACT`, on the bounded chunk — so no checkpoint constructed by
   * this pipeline (`startImport`, or any transition below) ever carries
   * `stage: 'TRANSFORM'`. A checkpoint whose `stage` isn't `EXTRACT`, `LOAD`,
   * or `DONE` is therefore foreign/corrupt and `runImportChunk` throws
   * rather than silently treating it as complete.
   *
   * Extract-phase behavior depends on `SourceStrategy.supportsCursor()`:
   * cursor-aware strategies (currently only `SheetByIdStrategy`) extract one
   * bounded window per call via `extractChunk`, so the streaming/
   * bounded-buffer guarantee above holds for them. Strategies that don't
   * support cursors fall back to a compatibility path: the entire source is
   * extracted (and, in this call, transformed) in a single call, reported as
   * immediately exhausted — so the bounded-buffer guarantee does NOT hold
   * for non-cursor sources; only `SheetById` truly streams.
   * @param {Object} recipe Import configuration — must match `checkpoint.recipeName`.
   * @param {ImportCheckpoint} checkpoint Checkpoint to resume from.
   * @param {Object} [budget={}] Per-call work limits.
   * @param {number} [budget.maxRows=500] Maximum rows to extract in this call.
   * @returns {{checkpoint: ImportCheckpoint, done: boolean}} Advanced checkpoint and completion flag.
   * @throws {ConfigurationError} If the recipe fails validation.
   * @throws {Error} If `checkpoint.recipeName` doesn't match the recipe being resumed.
   * @throws {ImportError} `UNRECOGNIZED_CHECKPOINT_STAGE` if `checkpoint.stage` isn't
   *   one of `EXTRACT`, `LOAD`, or `DONE` (a foreign/corrupt checkpoint).
   */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(checkpoint.stage);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(checkpoint.stage);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(extractionExhausted);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(checkpoint.stage);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.runImport
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.runImport(recipe, options);`
- **Pure JSDoc:**
```javascript
/** Method runImport */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(error instanceof ImportError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(this.facade._monitor && jobId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.if(postTransform);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ImportPipelineExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: TransformerValidationGuard
**File Path:** `GasDataImporter/src/internal/transform-managers/TransformerValidationGuard.js`
**Constructor Usage:** `const instance = new TransformerValidationGuard();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of TransformerValidationGuard

#### METHOD: TransformerValidationGuard.for
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.for(const rule of rules);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TransformerValidationGuard.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.if(isValid);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerValidationGuard.catch
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TransformerValidationGuard.validateConfig
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformerValidationGuard.validateConfig(config);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces structural integrity of the transformation configuration segment.
   * @param {Object} config target transformation rules.
   * @returns {boolean} Always true if no errors are thrown.
   * @throws {TransformError} If mapping, calculated fields, or normalization blocks are malformed.
   */
```
---
#### METHOD: TransformerValidationGuard.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.if(config.mapping && typeof config.mapping !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerValidationGuard.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.if(config.calculated && typeof config.calculated !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerValidationGuard.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.if(config.normalization && typeof config.normalization !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerValidationGuard.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerValidationGuard.if(config.validation);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TransformerNumberSanitizer
**File Path:** `GasDataImporter/src/internal/transform-managers/TransformerNumberSanitizer.js`
**Constructor Usage:** `const instance = new TransformerNumberSanitizer();`
**Description:** Manager for data normalization (trimming, case conversion, and sanitization).

### Raw JSDoc Context:
```javascript
/**
 * @file GasDataImporter/src/transform/managers/TransformerNumberSanitizer.js
 * @description Manager for data normalization (trimming, case conversion, and sanitization).
 */
```

### Methods of TransformerNumberSanitizer

#### METHOD: TransformerNumberSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.if(normalization.trim);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerNumberSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerNumberSanitizer.for
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.for(const col of normalization.dateColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TransformerNumberSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.if(normalized[col]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerNumberSanitizer.for
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.for(const col of normalization.uppercaseColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TransformerNumberSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.if(normalized[col] && typeof normalized[col]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerNumberSanitizer.for
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.for(const col of normalization.lowercaseColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TransformerNumberSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerNumberSanitizer.if(normalized[col] && typeof normalized[col]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TransformerMappingEngine
**File Path:** `GasDataImporter/src/internal/transform-managers/TransformerMappingEngine.js`
**Constructor Usage:** `const instance = new TransformerMappingEngine();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of TransformerMappingEngine

#### METHOD: TransformerMappingEngine.for
- **Scope:** instance
- **LLM Call Syntax:** `transformerMappingEngine.for(const fieldName of executionOrder);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TransformerMappingEngine.catch
- **Scope:** instance
- **LLM Call Syntax:** `transformerMappingEngine.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: TransformerDateStyler
**File Path:** `GasDataImporter/src/internal/transform-managers/TransformerDateStyler.js`
**Constructor Usage:** `const instance = new TransformerDateStyler();`
**Description:** Manager for date parsing and formatting transformations.

### Raw JSDoc Context:
```javascript
/**
 * @file GasDataImporter/src/transform/managers/TransformerDateStyler.js
 * @description Manager for date parsing and formatting transformations.
 */
```

### Methods of TransformerDateStyler

#### METHOD: TransformerDateStyler.if
- **Scope:** instance
- **LLM Call Syntax:** `transformerDateStyler.if(!date);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TransformerDateStyler.catch
- **Scope:** instance
- **LLM Call Syntax:** `transformerDateStyler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: Loader
**File Path:** `GasDataImporter/src/internal/load/Loader.js`
**Constructor Usage:** `const instance = new Loader();`
**Description:** @fileoverview Data loading engine with conflict resolution for the ETL pipeline (Load phase)
@author GasLibraryFactory
/

import { LoadError } from '../errors/LoadError.js';

/**
Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Data loading engine with conflict resolution for the ETL pipeline (Load phase)
 * @author GasLibraryFactory
 */

import { LoadError } from '../errors/LoadError.js';

/**
 * Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
 * @class
 */
```

<br>

## CLASS: SourceStrategyFactory
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.js`
**Constructor Usage:** `const instance = new SourceStrategyFactory();`
**Description:** @fileoverview Factory for creating source strategy instances
@author GasLibraryFactory
/

import { SheetByIdStrategy } from './SheetByIdStrategy.js';
import { FolderStrategy } from './FolderStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Factory for creating source strategy instances
 * @author GasLibraryFactory
 */

import { SheetByIdStrategy } from './SheetByIdStrategy.js';
import { FolderStrategy } from './FolderStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.
 * @class
 */
```

<br>

## CLASS: is
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.js`
**Constructor Usage:** `const instance = new is();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of is

#### METHOD: is.if
- **Scope:** instance
- **LLM Call Syntax:** `is.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: is.if
- **Scope:** instance
- **LLM Call Syntax:** `is.if(typeof strategyClass !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: constructor
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.js`
**Constructor Usage:** `const instance = new constructor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: SourceStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new SourceStrategy();`
**Description:** @fileoverview Abstract base class for data source extraction strategies
@author GasLibraryFactory
/

import { CellValueCoercion } from '@CoreUtilsLib';
import { SourceError } from '../errors/SourceError.js';

/**
Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.
@abstract
@class

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Abstract base class for data source extraction strategies
 * @author GasLibraryFactory
 */

import { CellValueCoercion } from '@CoreUtilsLib';
import { SourceError } from '../errors/SourceError.js';

/**
 * Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.
 * @abstract
 * @class
 */
```

<br>

## CLASS: directly
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new directly();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of directly

#### METHOD: directly.if
- **Scope:** instance
- **LLM Call Syntax:** `directly.if(this.constructor);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SourceStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new SourceStrategy();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: execution
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new execution();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: fails
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new fails();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: SheetByIdStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/SheetByIdStrategy.js`
**Constructor Usage:** `const instance = new SheetByIdStrategy();`
**Description:** @fileoverview Source strategy for extracting data from a Google Sheet by ID
@author GasLibraryFactory
/

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.
@class
@extends SourceStrategy

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Source strategy for extracting data from a Google Sheet by ID
 * @author GasLibraryFactory
 */

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.
 * @class
 * @extends SourceStrategy
 */
```

<br>

## CLASS: FolderStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/FolderStrategy.js`
**Constructor Usage:** `const instance = new FolderStrategy();`
**Description:** @fileoverview Source strategy for extracting data from all Google Sheets in a folder
@author GasLibraryFactory
/

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.
@class
@extends SourceStrategy

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Source strategy for extracting data from all Google Sheets in a folder
 * @author GasLibraryFactory
 */

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.
 * @class
 * @extends SourceStrategy
 */
```

<br>

## CLASS: TransformError
**File Path:** `GasDataImporter/src/internal/errors/TransformError.js`
**Constructor Usage:** `const instance = new TransformError();`
**Description:** @fileoverview Error class for data transformation errors (Transform phase)
@author GasLibraryFactory
/

import { ImportError } from './ImportError.js';

/**
Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.
@class
@extends ImportError

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Error class for data transformation errors (Transform phase)
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.
 * @class
 * @extends ImportError
 */
```

<br>

## CLASS: SourceError
**File Path:** `GasDataImporter/src/internal/errors/SourceError.js`
**Constructor Usage:** `const instance = new SourceError();`
**Description:** @fileoverview Error class for data source extraction errors (Extract phase)
@author GasLibraryFactory
/

import { ImportError } from './ImportError.js';

/**
Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.
@class
@extends ImportError

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Error class for data source extraction errors (Extract phase)
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.
 * @class
 * @extends ImportError
 */
```

<br>

## CLASS: LoadError
**File Path:** `GasDataImporter/src/internal/errors/LoadError.js`
**Constructor Usage:** `const instance = new LoadError();`
**Description:** @fileoverview Error class for data loading/persistence errors (Load phase)
@author GasLibraryFactory
/

import { ImportError } from './ImportError.js';

/**
Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.
@class
@extends ImportError

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Error class for data loading/persistence errors (Load phase)
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.
 * @class
 * @extends ImportError
 */
```

<br>

## CLASS: ImportError
**File Path:** `GasDataImporter/src/internal/errors/ImportError.js`
**Constructor Usage:** `const instance = new ImportError();`
**Description:** @fileoverview Base error class for GasDataImporter library
@author GasLibraryFactory
/

import { BaseError } from '@CoreUtilsLib';

/**
Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
@class
@extends BaseError

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Base error class for GasDataImporter library
 * @author GasLibraryFactory
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
```

<br>

## CLASS: ConfigurationError
**File Path:** `GasDataImporter/src/internal/errors/ConfigurationError.js`
**Constructor Usage:** `const instance = new ConfigurationError();`
**Description:** @fileoverview Error class for import configuration validation errors
@author GasLibraryFactory
/

import { ImportError } from './ImportError.js';

/**
Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.
@class
@extends ImportError

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Error class for import configuration validation errors
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.
 * @class
 * @extends ImportError
 */
```

<br>

