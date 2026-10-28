# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [ComposableContentLib](#composablecontentlib)

---

## ComposableContentLib

ComposableContentLib - Layer 3 library for composing dynamic content from modular blocks.

### CompositionRecipe

**Source:** `ComposableContentLib/src/composition/CompositionRecipe.ts`

Immutable model for multi-block content composition.
Defines block selection, execution order, visibility logic, and serialization metadata.

**Initialization:**
```javascript
new CompositionRecipe()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): CompositionRecipe` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOrderedBlocks` | `getOrderedBlocks(): BlockInstance[]` |
| `getBlock` | `getBlock(instanceId: string): BlockInstance|null` |
| `getBlocksByType` | `getBlocksByType(blockType: string): BlockInstance[]` |
| `getUsedBlockTypes` | `getUsedBlockTypes(): string[]` |
| `getBlockCount` | `getBlockCount(): number` |
| `usesBlockType` | `usesBlockType(blockType: string): boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ContentComposer

**Source:** `ComposableContentLib/src/composition/ContentComposer.ts`

Central orchestration engine for content block resolution and rendering.
Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.

**Initialization:**
```javascript
new ContentComposer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `compose` | `compose(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object, options.format: string, options.continueOnError=true: boolean): CompositionResult` |
| `composeToString` | `composeToString(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object): string` |
| `_evaluateBlock` | `_evaluateBlock(blockInstance: Object, context: BlockDataContext, format: string, renderer: BlockRenderer): BlockResult` |
| `validateRecipe` | `validateRecipe(recipe: CompositionRecipe|Object): Object` |
| `getBlockRegistry` | `getBlockRegistry(): BlockRegistry` |
| `getRendererRegistry` | `getRendererRegistry(): RendererRegistry` |
| `toString` | `toString(): string` |


### BlockDefinition

**Source:** `ComposableContentLib/src/core/BlockDefinition.ts`

Immutable blueprint for a reusable content block type.
Specifies rendering capabilities, structural containment, and fallback behaviors.

**Initialization:**
```javascript
new BlockDefinition()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): BlockDefinition` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `supportsFormat` | `supportsFormat(format: string): boolean` |
| `hidesWhenEmpty` | `hidesWhenEmpty(): boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### BlockResult

**Source:** `ComposableContentLib/src/core/BlockResult.ts`

Immutable data transfer object representing the outcome of a block rendering execution.
Extends the shared {@link Result} base for the success/error contract.
Encapsulates generated content, visibility state, errors, and profiling metrics.

**Initialization:**
```javascript
new BlockResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `hidden` | `hidden(instanceId: string, blockType: string, reason='hidden': string): BlockResult` |
| `error` | `error(instanceId: string, blockType: string, error: Error): BlockResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `hasDisplayableContent` | `hasDisplayableContent(): boolean` |
| `getMetadata` | `getMetadata(key: string, defaultValue=null: *): *` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### CompositionResult

**Source:** `ComposableContentLib/src/core/CompositionResult.ts`

Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.

**Initialization:**
```javascript
new CompositionResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(recipeId: string, outputFormat: string, reason='empty': string): CompositionResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSuccess` | `isSuccess(): boolean` |
| `getVisibleBlocks` | `getVisibleBlocks(): BlockResult[]` |
| `getHiddenBlocks` | `getHiddenBlocks(): BlockResult[]` |
| `getErrorBlocks` | `getErrorBlocks(): BlockResult[]` |
| `hasErrors` | `hasErrors(): boolean` |
| `getBlockById` | `getBlockById(instanceId: string): BlockResult|null` |
| `getBlocksByType` | `getBlocksByType(blockType: string): BlockResult[]` |
| `getContentLength` | `getContentLength(): number` |
| `getAverageBlockTime` | `getAverageBlockTime(): number` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ContentBlock

**Source:** `ComposableContentLib/src/core/ContentBlock.ts`

Abstract base class defining the execution contract for content blocks.
Subclasses implement data extraction and template resolution and may customize empty-state
evaluation.

**Initialization:**
```javascript
new ContentBlock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getTypeId` | `getTypeId(): string` |
| `getName` | `getName(): string` |
| `getData` | `getData(context: BlockDataContext): Object` |
| `isEmpty` | `isEmpty(data: *): boolean` |
| `getTemplateId` | `getTemplateId(format: string): string` |
| `evaluate` | `evaluate(instanceId: string, context: BlockDataContext, format: string, renderer: BlockRenderer): BlockResult` |
| `render` | `render(data: Object, format: string, renderer: BlockRenderer, templateId: string): string` |
| `_getMetadata` | `_getMetadata(data: Object): Object` |
| `supportsFormat` | `supportsFormat(format: string): boolean` |
| `toString` | `toString(): string` |


### SimpleContentBlock

**Source:** `ComposableContentLib/src/core/ContentBlock.ts`

Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.

**Initialization:**
```javascript
new SimpleContentBlock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getData` | `getData(context: BlockDataContext): Object` |
| `isEmpty` | `isEmpty(data: *): boolean` |
| `getTemplateId` | `getTemplateId(format: string): string` |


### BlockDataContext

**Source:** `ComposableContentLib/src/data/BlockDataContext.ts`

Encapsulated state container for rendering context.
Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.

**Initialization:**
```javascript
new BlockDataContext()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): BlockDataContext` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(path: string, defaultValue=null: *): *` |
| `has` | `has(path: string): boolean` |
| `getAll` | `getAll(): Object` |
| `set` | `set(path: string, value: *): void` |
| `merge` | `merge(additionalData: Object): void` |
| `isEmpty` | `isEmpty(): boolean` |
| `keys` | `keys(): string[]` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ComposableContentError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Base class for domain-specific exceptions within the composition engine.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ComposableContentError()
```


### BlockNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a requested block type is not registered.

**Initialization:**
```javascript
new BlockNotFoundError()
```


### RenderingError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when template rendering fails during block execution.

**Initialization:**
```javascript
new RenderingError()
```


### RecipeValidationError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a Recipe definition manifest fails structural validation.

**Initialization:**
```javascript
new RecipeValidationError()
```


### RendererNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when no renderer is registered for a requested output format.

**Initialization:**
```javascript
new RendererNotFoundError()
```


### TemplateNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a block's required template ID cannot be resolved.

**Initialization:**
```javascript
new TemplateNotFoundError()
```


### DataRequirementError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a block's defined context data dependencies are unfulfilled.

**Initialization:**
```javascript
new DataRequirementError()
```


### BlockRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Abstract base class for block rendering engines. Subclasses must implement format-specific logic.

**Initialization:**
```javascript
new BlockRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `render` | `render(templateId: string, data: Object, options={}: Object, options.containerType: string, options.blockType: string): string` |
| `_processTemplate` | `_processTemplate(template: string, data: Object): string` |
| `_getValueByPath` | `_getValueByPath(obj: Object, path: string): *` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |
| `registerTemplate` | `registerTemplate(templateId: string, template: string|Function): BlockRenderer` |
| `registerTemplates` | `registerTemplates(templates: Object<string, string|Function>): BlockRenderer` |
| `hasTemplate` | `hasTemplate(templateId: string): boolean` |
| `templateCount` | `templateCount(): number` |
| `toString` | `toString(): string` |


### MarkdownRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Markdown-specialized renderer implementation.

**Initialization:**
```javascript
new MarkdownRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### PlainTextRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Plain text specialized renderer implementation.

**Initialization:**
```javascript
new PlainTextRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### HtmlRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

HTML-specialized renderer implementation.

**Initialization:**
```javascript
new HtmlRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### VisibilityEvaluator

**Source:** `ComposableContentLib/src/internal/VisibilityEvaluator.ts`

Engine for resolving block visibility conditions against a data context.
Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.

**Initialization:**
```javascript
new VisibilityEvaluator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isVisible` | `isVisible(visibility: string, context: BlockDataContext): boolean` |
| `_evaluateExpression` | `_evaluateExpression(expression: string, context: BlockDataContext): boolean` |
| `_evaluateSimpleCondition` | `_evaluateSimpleCondition(condition: string, context: BlockDataContext): boolean` |
| `_getByPath` | `_getByPath(obj: Object, path: string): *` |
| `_isTruthy` | `_isTruthy(value: *): boolean` |
| `hasExpressionEngine` | `hasExpressionEngine(): boolean` |
| `toString` | `toString(): string` |


### BlockRegistry

**Source:** `ComposableContentLib/src/registry/BlockRegistry.ts`

Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.

**Initialization:**
```javascript
new BlockRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(registration: Object, registration.definition: Object|BlockDefinition, registration.factory: Function): BlockDefinition` |
| `unregister` | `unregister(blockType: string): boolean` |
| `getDefinition` | `getDefinition(blockType: string): BlockDefinition` |
| `getDefinitionOrNull` | `getDefinitionOrNull(blockType: string): BlockDefinition|null` |
| `createBlock` | `createBlock(blockType: string, config={}: Object): ContentBlock` |
| `has` | `has(blockType: string): boolean` |
| `getBlockTypes` | `getBlockTypes(): string[]` |
| `getAllDefinitions` | `getAllDefinitions(): BlockDefinition[]` |
| `size` | `size(): number` |
| `clear` | `clear(): void` |
| `getBlocksForFormat` | `getBlocksForFormat(format: string): BlockDefinition[]` |
| `toString` | `toString(): string` |


### RendererRegistry

**Source:** `ComposableContentLib/src/registry/RendererRegistry.ts`

Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').

**Initialization:**
```javascript
new RendererRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_registerDefaults` | `_registerDefaults(): void` |
| `register` | `register(renderer: BlockRenderer): RendererRegistry` |
| `unregister` | `unregister(format: string): boolean` |
| `get` | `get(format: string): BlockRenderer` |
| `getOrNull` | `getOrNull(format: string): BlockRenderer|null` |
| `has` | `has(format: string): boolean` |
| `getFormats` | `getFormats(): string[]` |
| `getAllRenderers` | `getAllRenderers(): BlockRenderer[]` |
| `size` | `size(): number` |
| `clear` | `clear(): void` |
| `toString` | `toString(): string` |


### ContentBlockMock

**Source:** `ComposableContentLib/src/testing/mocks.ts`

High-fidelity Jest mock for ContentBlock implementations.

**Initialization:**
```javascript
new ContentBlockMock()
```


### BlockRegistryMock

**Source:** `ComposableContentLib/src/testing/mocks.ts`

High-fidelity Jest mock for BlockRegistry.

**Initialization:**
```javascript
new BlockRegistryMock()
```


---

