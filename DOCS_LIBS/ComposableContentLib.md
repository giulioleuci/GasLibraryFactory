# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [ComposableContentLib](#composablecontentlib)

---

## ComposableContentLib

ComposableContentLib - Layer 3 library for composing dynamic content from modular blocks.

### CompositionRecipe

CompositionRecipe for defining content composition.

**Initialization:**
```javascript
new CompositionRecipe()
```

**Static Methods:**

- `fromJSON(obj: Object): CompositionRecipe`

**Methods:**

- `getOrderedBlocks(): BlockInstance[]`
  > Recipe identifier.

- `getBlock(instanceId: string): BlockInstance|null`

- `getBlocksByType(blockType: string): BlockInstance[]`

- `getUsedBlockTypes(): string[]`

- `getBlockCount(): number`

- `usesBlockType(blockType: string): boolean`

- `toJSON(): Object`

- `toString(): string`


### ContentComposer

Main composition engine for assembling content from blocks.

**Initialization:**
```javascript
new ContentComposer()
```

**Methods:**

- `compose(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object, options.format: string, options.continueOnError=true: boolean): CompositionResult`
  > Block registry.

- `composeToString(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object): string`

- `validateRecipe(recipe: CompositionRecipe|Object): Object`

- `getBlockRegistry(): BlockRegistry`

- `getRendererRegistry(): RendererRegistry`

- `toString(): string`


### BlockDefinition

BlockDefinition for declarative block type definitions.

**Initialization:**
```javascript
new BlockDefinition()
```

**Static Methods:**

- `fromJSON(obj: Object): BlockDefinition`

**Methods:**

- `supportsFormat(format: string): boolean`
  > Unique block type identifier.

- `requiresData(key: string): boolean`

- `hasDataRequirements(): boolean`

- `hidesWhenEmpty(): boolean`

- `isAlwaysVisible(): boolean`

- `getMetadata(key: string, defaultValue=undefined: *): *`

- `isNeverVisible(): boolean`

- `toJSON(): Object`

- `toString(): string`


### BlockResult

BlockResult representing the output of block evaluation.

**Initialization:**
```javascript
new BlockResult()
```

**Static Methods:**

- `hidden(instanceId: string, blockType: string, reason='hidden': string): BlockResult`

- `error(instanceId: string, blockType: string, error: Error): BlockResult`

**Methods:**

- `hasDisplayableContent(): boolean`
  > Block instance ID.

- `getMetadata(key: string, defaultValue=null: *): *`

- `toJSON(): Object`

- `toString(): string`


### CompositionResult

CompositionResult representing the complete output of content composition.

**Initialization:**
```javascript
new CompositionResult()
```

**Static Methods:**

- `empty(recipeId: string, outputFormat: string, reason='empty': string): CompositionResult`
  > Factory method for standardized empty composition results.

**Methods:**

- `isSuccess(): boolean`
  > Recipe ID used for composition.

- `getBlockResult(instanceId: string): BlockResult|null`
  > Resolves a block result by its instance ID.

- `getVisibleBlocks(): BlockResult[]`
  > Filters results for blocks evaluated as visible.

- `getHiddenBlocks(): BlockResult[]`
  > Filters results for blocks evaluated as hidden.

- `getErrorBlocks(): BlockResult[]`
  > Filters results for blocks that encountered rendering or evaluation errors.

- `hasErrors(): boolean`
  > Checks for presence of top-level composition errors or block-level errors.

- `getBlockById(instanceId: string): BlockResult|null`
  > Resolves a block result by instance ID.

- `getBlocksByType(blockType: string): BlockResult[]`
  > Filters results by block type ID.

- `getContentLength(): number`
  > Returns character count of final concatenated content.

- `getAverageBlockTime(): number`
  > Computes mean execution time across all evaluated blocks.

- `toJSON(): Object`
  > Serializes instance into a deep-cloned JSON-safe object.

- `toString(): string`
  > Returns diagnostic status string including recipe ID, block counts, and performance metrics.


### ContentBlock

ContentBlock base class for content blocks.

**Initialization:**
```javascript
new ContentBlock()
```

**Methods:**

- `getTypeId(): string`
  > Block definition.

- `getName(): string`

- `getData(context: BlockDataContext): Object`

- `isEmpty(data: Object): boolean`

- `getTemplateId(format: string): string`

- `evaluate(instanceId: string, context: BlockDataContext, format: string, renderer: BlockRenderer): BlockResult`

- `render(data: Object, format: string, renderer: BlockRenderer, templateId: string): string`

- `supportsFormat(format: string): boolean`

- `toString(): string`


### SimpleContentBlock

Initializes block with its definition blueprint and runtime configuration.
@param {BlockDefinition} definition Immutable type specification.
@param {Object} [config={}] Instance-specific configuration overrides.
@throws {Error} If definition is missing.
/
  constructor(definition, config = {}) {
    if (!definition) {
      throw new Error('ContentBlock requires a definition');
    }

**Initialization:**
```javascript
new SimpleContentBlock()
```

**Methods:**

- `getData(context: BlockDataContext): Object`
  > Data extractor function.

- `isEmpty(data: Object): boolean`

- `getTemplateId(format: string): string`


### BlockDataContext

BlockDataContext for providing data to content blocks.

**Initialization:**
```javascript
new BlockDataContext()
```

**Static Methods:**

- `fromJSON(obj: Object): BlockDataContext`

**Methods:**

- `has(path: string): boolean`

- `getMultiple(paths: string[]): Object`

- `getAll(): Object`

- `getRawData(): Object`

- `getGlobalContext(): Object`

- `set(path: string, value: *): void`

- `merge(additionalData: Object): void`

- `withData(additionalData: Object): BlockDataContext`

- `withGlobalContext(additionalGlobal: Object): BlockDataContext`

- `scope(path: string): BlockDataContext`
  > Maintains the original global context unmodified.

- `isEmpty(): boolean`

- `keys(): string[]`

- `hasAll(requiredKeys: string[]): boolean`

- `getMissingKeys(requiredKeys: string[]): string[]`

- `toJSON(): Object`

- `toString(): string`


### ComposableContentError

Error classes for ComposableContentLib.

**Initialization:**
```javascript
new ComposableContentError()
```


### BlockNotFoundError

Initializes a generic composition error with structured metadata.
@param {string} message Primary error description.
@param {Object} [details={}] Diagnostic payload.
/
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ComposableContentError';
    this.details = details;
  }
}

**Initialization:**
```javascript
new BlockNotFoundError()
```


### RenderingError

Initializes a block resolution error.
@param {string} blockType Unresolved block identifier.
/
  constructor(blockType) {
    super(`Block type not found: ${blockType}`, { blockType });
    this.name = 'BlockNotFoundError';
    this.blockType = blockType;
  }
}

**Initialization:**
```javascript
new RenderingError()
```


### CompositionError

Initializes a rendering error with format context.
@param {string} message Specific failure reason.
@param {string} blockType Target block identifier.
@param {string} format Attempted output format.
@param {Error} [cause] Original caught exception.
/
  constructor(message, blockType, format, cause = null) {
    super(message, {
      blockType,
      format,
      cause: cause?.message || null
    });
    this.name = 'RenderingError';
    this.blockType = blockType;
    this.format = format;
    this.cause = cause;
  }
}

**Initialization:**
```javascript
new CompositionError()
```


### RecipeValidationError

Initializes an orchestration error.
@param {string} message Specific failure reason.
@param {string} recipeId Target recipe identifier.
@param {Error} [cause] Original caught exception.
/
  constructor(message, recipeId, cause = null) {
    super(message, {
      recipeId,
      cause: cause?.message || null
    });
    this.name = 'CompositionError';
    this.recipeId = recipeId;
    this.cause = cause;
  }
}

**Initialization:**
```javascript
new RecipeValidationError()
```


### RendererNotFoundError

Initializes a recipe validation error.
@param {string} message Summary of validation failures.
@param {string} recipeId Target recipe identifier.
@param {string[]} [validationErrors=[]] Collection of specific violation messages.
/
  constructor(message, recipeId, validationErrors = []) {
    super(message, { recipeId, validationErrors });
    this.name = 'RecipeValidationError';
    this.recipeId = recipeId;
    this.validationErrors = validationErrors;
  }
}

**Initialization:**
```javascript
new RendererNotFoundError()
```


### TemplateNotFoundError

Initializes a renderer resolution error.
@param {string} format Unresolved format string.
/
  constructor(format) {
    super(`Renderer not found for format: ${format}`, { format });
    this.name = 'RendererNotFoundError';
    this.format = format;
  }
}

**Initialization:**
```javascript
new TemplateNotFoundError()
```


### DataRequirementError

Initializes a template resolution error.
@param {string} templateId Unresolved template identifier.
/
  constructor(templateId) {
    super(`Template not found: ${templateId}`, { templateId });
    this.name = 'TemplateNotFoundError';
    this.templateId = templateId;
  }
}

**Initialization:**
```javascript
new DataRequirementError()
```


### BlockRenderer

BlockRenderer base class and implementations.

**Initialization:**
```javascript
new BlockRenderer()
```

**Methods:**

- `getFormat(): string`
  > Logger implementation.

- `render(templateId: string, data: Object, options={}: Object, options.containerType: string, options.blockType: string): string`
  > Executes template rendering with provided data and options.

- `registerTemplate(templateId: string, template: string|Function): BlockRenderer`
  > Registers a single template string or function.

- `registerTemplates(templates: Object<string, string|Function>): BlockRenderer`
  > Registers multiple templates from a KV map.

- `hasTemplate(templateId: string): boolean`
  > Validates presence of a template in the renderer registry.

- `templateCount(): number`
  > Returns total number of registered templates.

- `toString(): string`
  > Returns diagnostic summary string including format and template count.


### HtmlRenderer

Initializes a new BlockRenderer instance.

**Initialization:**
```javascript
new HtmlRenderer()
```

**Methods:**

- `getFormat(): string`
  > Returns 'html' format identifier.


### MarkdownRenderer

Returns 'html' format identifier.

**Methods:**

- `getFormat(): string`
  > Returns 'markdown' format identifier.


### PlainTextRenderer

Returns 'markdown' format identifier.

**Methods:**

- `getFormat(): string`
  > Returns 'text' format identifier.


### VisibilityEvaluator

Evaluates visibility conditions for content blocks.

**Initialization:**
```javascript
new VisibilityEvaluator(expressionEngine=null: Object|null)
```

**Methods:**

- `isVisible(visibility: string, context: BlockDataContext): boolean`
  > Expression engine for complex conditions.

- `hasExpressionEngine(): boolean`

- `toString(): string`


### BlockRegistry

Registry for block definitions and factories.

**Initialization:**
```javascript
new BlockRegistry()
```

**Methods:**

- `register(registration: Object, registration.definition: Object|BlockDefinition, registration.factory: Function): BlockDefinition`
  > Logger implementation.

- `unregister(blockType: string): boolean`
  > Removes a block type and its factory from the registry.

- `getDefinition(blockType: string): BlockDefinition`
  > Retrieves a block definition by ID.

- `getDefinitionOrNull(blockType: string): BlockDefinition|null`
  > Retrieves a block definition or null if unregistered.

- `createBlock(blockType: string, config={}: Object): ContentBlock`
  > Instantiates a block using its registered factory.

- `has(blockType: string): boolean`
  > Validates presence of a block type in the registry.

- `getBlockTypes(): string[]`
  > Retrieves all registered block type identifiers.

- `getAllDefinitions(): BlockDefinition[]`
  > Retrieves all registered block definitions.

- `size(): number`
  > Returns current count of registered block types.

- `clear(): void`
  > Purges all block definitions and factories from the registry.

- `getBlocksForFormat(format: string): BlockDefinition[]`
  > Filters definitions by output format compatibility.

- `toString(): string`
  > Returns diagnostic summary string including current registration count.


### RendererRegistry

Registry for block renderers by output format.

**Initialization:**
```javascript
new RendererRegistry()
```

**Methods:**

- `register(renderer: BlockRenderer): RendererRegistry`
  > Adds a renderer instance to the registry.

- `unregister(format: string): boolean`
  > Removes the renderer associated with the specified format.

- `getOrNull(format: string): BlockRenderer|null`
  > Retrieves a renderer or null if unregistered.

- `has(format: string): boolean`
  > Validates presence of a renderer for the specified format.

- `getFormats(): string[]`
  > Retrieves all registered output format identifiers.

- `getAllRenderers(): BlockRenderer[]`
  > Retrieves all registered renderer instances.

- `size(): number`
  > Returns current count of registered renderers.

- `clear(): void`
  > Purges all renderer registrations.

- `toString(): string`
  > Returns diagnostic summary string including current registration count and supported formats.


### ContentBlockMock

Centralized high-fidelity mocks for ComposableContentLib services.

**Initialization:**
```javascript
new ContentBlockMock(typeId='mock_block': string)
```


### BlockRegistryMock

Initializes mock with default type ID and Jest spy functions.

**Initialization:**
```javascript
new BlockRegistryMock()
```


### RendererRegistryMock

Initializes mock with internal storage and Jest spy functions.
/
  constructor() {
    this._blocks = new Map();
    this.register = jest.fn((registration) => {
      const id = registration.definition.id;
      this._blocks.set(id, registration);
      return registration.definition;
    });
    this.get = jest.fn((id) => this._blocks.get(id));
    this.has = jest.fn((id) => this._blocks.has(id));
    this.getBlockTypes = jest.fn(() => Array.from(this._blocks.keys()));
    this.size = jest.fn(() => this._blocks.size);
  }
}

**Initialization:**
```javascript
new RendererRegistryMock()
```


---

