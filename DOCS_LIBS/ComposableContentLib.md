# API Reference: ComposableContentLib

## CLASS: ContentBlockMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new ContentBlockMock(typeId);`
**Description:** High-fidelity Jest mock for ContentBlock implementations.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity Jest mock for ContentBlock implementations.
 * @class
 */
```

<br>

## CLASS: BlockRegistryMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new BlockRegistryMock();`
**Description:** High-fidelity Jest mock for BlockRegistry.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity Jest mock for BlockRegistry.
 * @class
 */
```

<br>

## CLASS: RendererRegistryMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new RendererRegistryMock();`
**Description:** High-fidelity Jest mock for RendererRegistry.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity Jest mock for RendererRegistry.
 * @class
 */
```

<br>

## CLASS: RendererRegistry
**File Path:** `ComposableContentLib/src/registry/RendererRegistry.js`
**Constructor Usage:** `const instance = new RendererRegistry(options, options.registerDefaults, options.logger);`
**Description:** Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').

### Raw JSDoc Context:
```javascript
/**
 * Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').
 * @class
 */
```

### Methods of RendererRegistry

#### METHOD: RendererRegistry._registerDefaults
- **Scope:** instance
- **LLM Call Syntax:** `rendererRegistry._registerDefaults();`
- **Pure JSDoc:**
```javascript
/**
   * Instantiates and registers the built-in HTML, Markdown, and PlainText renderers.
   * @private
   */
```
---
#### METHOD: RendererRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.register(renderer);`
- **Pure JSDoc:**
```javascript
/**
   * Adds a renderer instance to the registry.
   * @param {BlockRenderer} renderer Renderer instance to register.
   * @returns {RendererRegistry} Fluent interface for chaining.
   * @throws {Error} If renderer is null or lacks the required getFormat() method.
   */
```
---
#### METHOD: RendererRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.unregister(format);`
- **Pure JSDoc:**
```javascript
/**
   * Removes the renderer associated with the specified format.
   * @param {string} format Target output format ID.
   * @returns {boolean} True if the renderer was successfully removed.
   */
```
---
#### METHOD: RendererRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.get(format);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a renderer by output format.
   * @param {string} format Target output format ID.
   * @returns {BlockRenderer} The associated renderer instance.
   * @throws {RendererNotFoundError} If no renderer is registered for the specified format.
   */
```
---
#### METHOD: RendererRegistry.getOrNull
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.getOrNull(format);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a renderer or null if unregistered.
   * @param {string} format Target output format ID.
   * @returns {BlockRenderer|null} The renderer instance or null.
   */
```
---
#### METHOD: RendererRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.has(format);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a renderer for the specified format.
   * @param {string} format Target output format ID.
   * @returns {boolean} True if a renderer exists.
   */
```
---
#### METHOD: RendererRegistry.getFormats
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.getFormats();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered output format identifiers.
   * @returns {string[]} Collection of format IDs.
   */
```
---
#### METHOD: RendererRegistry.getAllRenderers
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.getAllRenderers();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered renderer instances.
   * @returns {BlockRenderer[]} Collection of renderer instances.
   */
```
---
#### METHOD: RendererRegistry.size
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.size();`
- **Pure JSDoc:**
```javascript
/**
   * Returns current count of registered renderers.
   * @returns {number} Registration count.
   */
```
---
#### METHOD: RendererRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `rendererRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all renderer registrations.
   */
```
---
#### METHOD: RendererRegistry.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = rendererRegistry.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including current registration count and supported formats.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: BlockRegistry
**File Path:** `ComposableContentLib/src/registry/BlockRegistry.js`
**Constructor Usage:** `const instance = new BlockRegistry(options, options.logger);`
**Description:** Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.

### Raw JSDoc Context:
```javascript
/**
 * Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.
 * @class
 */
```

### Methods of BlockRegistry

#### METHOD: BlockRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.register(registration, registration.definition, registration.factory);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a block type definition and its associated factory function.
   * @param {Object} registration Registration payload.
   * @param {Object|BlockDefinition} registration.definition Block configuration or definition instance.
   * @param {Function} registration.factory Factory function with signature (definition, config) => ContentBlock.
   * @returns {BlockDefinition} The registered definition instance.
   * @throws {Error} If registration payload, definition, or factory function is missing/invalid.
   */
```
---
#### METHOD: BlockRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.unregister(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Removes a block type and its factory from the registry.
   * @param {string} blockType Target block type ID.
   * @returns {boolean} True if the block type existed and was successfully removed.
   */
```
---
#### METHOD: BlockRegistry.getDefinition
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.getDefinition(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a block definition by ID.
   * @param {string} blockType Target block type ID.
   * @returns {BlockDefinition} The associated definition instance.
   * @throws {BlockNotFoundError} If the block type is not registered.
   */
```
---
#### METHOD: BlockRegistry.getDefinitionOrNull
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.getDefinitionOrNull(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a block definition or null if unregistered.
   * @param {string} blockType Target block type ID.
   * @returns {BlockDefinition|null} The definition instance or null.
   */
```
---
#### METHOD: BlockRegistry.createBlock
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.createBlock(blockType, config);`
- **Pure JSDoc:**
```javascript
/**
   * Instantiates a block using its registered factory.
   * @param {string} blockType Target block type ID.
   * @param {Object} [config={}] Instance-specific configuration.
   * @returns {ContentBlock} The instantiated content block.
   * @throws {BlockNotFoundError} If the block type factory is not registered.
   */
```
---
#### METHOD: BlockRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.has(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a block type in the registry.
   * @param {string} blockType Target block type ID.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: BlockRegistry.getBlockTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.getBlockTypes();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered block type identifiers.
   * @returns {string[]} Collection of block IDs.
   */
```
---
#### METHOD: BlockRegistry.getAllDefinitions
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.getAllDefinitions();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered block definitions.
   * @returns {BlockDefinition[]} Collection of definition instances.
   */
```
---
#### METHOD: BlockRegistry.size
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.size();`
- **Pure JSDoc:**
```javascript
/**
   * Returns current count of registered block types.
   * @returns {number} Registration count.
   */
```
---
#### METHOD: BlockRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `blockRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all block definitions and factories from the registry.
   */
```
---
#### METHOD: BlockRegistry.getBlocksForFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.getBlocksForFormat(format);`
- **Pure JSDoc:**
```javascript
/**
   * Filters definitions by output format compatibility.
   * @param {string} format Target output format.
   * @returns {BlockDefinition[]} Subset of definitions supporting the format.
   */
```
---
#### METHOD: BlockRegistry.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRegistry.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including current registration count.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: VisibilityEvaluator
**File Path:** `ComposableContentLib/src/internal/VisibilityEvaluator.js`
**Constructor Usage:** `const instance = new VisibilityEvaluator(expressionEngine);`
**Description:** Engine for resolving block visibility conditions against a data context.
Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.

### Raw JSDoc Context:
```javascript
/**
 * @description Engine for resolving block visibility conditions against a data context.
 * Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.
 * @class
 * @example
 * const evaluator = new VisibilityEvaluator(expressionEngine);
 * const visible = evaluator.isVisible('{{user.isPremium}} == true', context);
 */
```

### Methods of VisibilityEvaluator

#### METHOD: VisibilityEvaluator.isVisible
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator.isVisible(visibility, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Determines block visibility based on a condition string and the current context.
   * Resolves static values first, then delegates to the expression engine or falls back to simple path evaluation.
   * @param {string} visibility Raw condition expression or keyword.
   * @param {BlockDataContext} context Data payload for evaluation.
   * @returns {boolean} True if the block should be rendered.
   */
```
---
#### METHOD: VisibilityEvaluator._evaluateExpression
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator._evaluateExpression(expression, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Delegates condition evaluation to the injected expression engine.
   * @param {string} expression Complex logic string.
   * @param {BlockDataContext} context Target data context.
   * @returns {boolean} Evaluated result, defaulting to false on error.
   * @private
   */
```
---
#### METHOD: VisibilityEvaluator._evaluateSimpleCondition
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator._evaluateSimpleCondition(condition, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates simple property paths or negations (e.g., 'user.name', '!user.isGuest') using strict truthiness.
   * @param {string} condition Simple path condition.
   * @param {BlockDataContext} context Target data context.
   * @returns {boolean} Evaluated result.
   * @private
   */
```
---
#### METHOD: VisibilityEvaluator._getByPath
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator._getByPath(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * @description Recursively resolves a dot-notation path against an object structure.
   * @param {Object} obj Source object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined.
   * @private
   */
```
---
#### METHOD: VisibilityEvaluator._isTruthy
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator._isTruthy(value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Applies strict business-logic truthiness to a value.
   * Evaluates empty strings, arrays, and objects as falsy.
   * @param {*} value Value to evaluate.
   * @returns {boolean} Truthy state.
   * @private
   */
```
---
#### METHOD: VisibilityEvaluator.hasExpressionEngine
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator.hasExpressionEngine();`
- **Pure JSDoc:**
```javascript
/**
   * @description Verifies if an external expression engine is bound to this evaluator.
   * @returns {boolean} True if available.
   */
```
---
#### METHOD: VisibilityEvaluator.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = visibilityEvaluator.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a diagnostic summary including the active evaluation mode.
   * @returns {string} Debug string representation.
   */
```
---
<br>

## CLASS: BlockRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new BlockRenderer(options, options.logger, options.templates);`
**Description:** Abstract base class for block rendering engines. Subclasses must implement format-specific logic.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for block rendering engines. Subclasses must implement format-specific logic.
 * @class
 * @abstract
 */
```

### Methods of BlockRenderer

#### METHOD: BlockRenderer.getFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.getFormat();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the target output format identifier.
   * @returns {string} Format ID (e.g., 'html', 'markdown', 'text').
   * @abstract
   * @throws {Error} If called directly on base class.
   */
```
---
#### METHOD: BlockRenderer.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.render(templateId, data, options, options.containerType, options.blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Executes template rendering with provided data and options.
   * @param {string} templateId Target template identifier.
   * @param {Object} data Source data for interpolation.
   * @param {Object} [options={}] Rendering configuration.
   * @param {string} [options.containerType] Optional container wrapping (ContainerType enum).
   * @param {string} [options.blockType] Block type ID for class name generation.
   * @returns {string} Fully rendered content string.
   * @throws {TemplateNotFoundError} If templateId is not registered.
   * @throws {RenderingError} If rendering logic or interpolation fails.
   */
```
---
#### METHOD: BlockRenderer._processTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer._processTemplate(template, data);`
- **Pure JSDoc:**
```javascript
/**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
```
---
#### METHOD: BlockRenderer._getValueByPath
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer._getValueByPath(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
```
---
#### METHOD: BlockRenderer._wrapInContainer
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer._wrapInContainer(content, containerType, options);`
- **Pure JSDoc:**
```javascript
/**
   * Wraps rendered content in a format-specific container structure.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type (ContainerType enum).
   * @param {Object} options Original rendering options.
   * @returns {string} Wrapped output.
   * @protected
   */
```
---
#### METHOD: BlockRenderer.registerTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.registerTemplate(templateId, template);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: BlockRenderer.registerTemplates
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.registerTemplates(templates);`
- **Pure JSDoc:**
```javascript
/**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: BlockRenderer.hasTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.hasTemplate(templateId);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: BlockRenderer.templateCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.templateCount();`
- **Pure JSDoc:**
```javascript
/**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
```
---
#### METHOD: BlockRenderer.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockRenderer.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: HtmlRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new HtmlRenderer();`
**Description:** HTML-specialized renderer implementation.

### Raw JSDoc Context:
```javascript
/**
 * HTML-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

### Methods of HtmlRenderer

#### METHOD: HtmlRenderer.getFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.getFormat();`
- **Pure JSDoc:**
```javascript
/**
   * Returns 'html' format identifier.
   * @returns {string}
   */
```
---
#### METHOD: HtmlRenderer._wrapInContainer
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer._wrapInContainer(content, containerType, options);`
- **Pure JSDoc:**
```javascript
/**
   * Wraps content in HTML structural elements (div, section) based on ContainerType.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} HTML wrapped content.
   * @protected
   */
```
---
#### METHOD: HtmlRenderer.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.render(templateId, data, options, options.containerType, options.blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Executes template rendering with provided data and options.
   * @param {string} templateId Target template identifier.
   * @param {Object} data Source data for interpolation.
   * @param {Object} [options={}] Rendering configuration.
   * @param {string} [options.containerType] Optional container wrapping (ContainerType enum).
   * @param {string} [options.blockType] Block type ID for class name generation.
   * @returns {string} Fully rendered content string.
   * @throws {TemplateNotFoundError} If templateId is not registered.
   * @throws {RenderingError} If rendering logic or interpolation fails.
   */
```
---
#### METHOD: HtmlRenderer._processTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer._processTemplate(template, data);`
- **Pure JSDoc:**
```javascript
/**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
```
---
#### METHOD: HtmlRenderer._getValueByPath
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer._getValueByPath(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
```
---
#### METHOD: HtmlRenderer.registerTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.registerTemplate(templateId, template);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: HtmlRenderer.registerTemplates
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.registerTemplates(templates);`
- **Pure JSDoc:**
```javascript
/**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: HtmlRenderer.hasTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.hasTemplate(templateId);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: HtmlRenderer.templateCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.templateCount();`
- **Pure JSDoc:**
```javascript
/**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
```
---
#### METHOD: HtmlRenderer.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = htmlRenderer.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: MarkdownRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new MarkdownRenderer();`
**Description:** Markdown-specialized renderer implementation.

### Raw JSDoc Context:
```javascript
/**
 * Markdown-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

### Methods of MarkdownRenderer

#### METHOD: MarkdownRenderer.getFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.getFormat();`
- **Pure JSDoc:**
```javascript
/**
   * Returns 'markdown' format identifier.
   * @returns {string}
   */
```
---
#### METHOD: MarkdownRenderer._wrapInContainer
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer._wrapInContainer(content, containerType, options);`
- **Pure JSDoc:**
```javascript
/**
   * Wraps content in Markdown block syntax (blockquote, horizontal rules).
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} Markdown wrapped content.
   * @protected
   */
```
---
#### METHOD: MarkdownRenderer.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.render(templateId, data, options, options.containerType, options.blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Executes template rendering with provided data and options.
   * @param {string} templateId Target template identifier.
   * @param {Object} data Source data for interpolation.
   * @param {Object} [options={}] Rendering configuration.
   * @param {string} [options.containerType] Optional container wrapping (ContainerType enum).
   * @param {string} [options.blockType] Block type ID for class name generation.
   * @returns {string} Fully rendered content string.
   * @throws {TemplateNotFoundError} If templateId is not registered.
   * @throws {RenderingError} If rendering logic or interpolation fails.
   */
```
---
#### METHOD: MarkdownRenderer._processTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer._processTemplate(template, data);`
- **Pure JSDoc:**
```javascript
/**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
```
---
#### METHOD: MarkdownRenderer._getValueByPath
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer._getValueByPath(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
```
---
#### METHOD: MarkdownRenderer.registerTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.registerTemplate(templateId, template);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: MarkdownRenderer.registerTemplates
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.registerTemplates(templates);`
- **Pure JSDoc:**
```javascript
/**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: MarkdownRenderer.hasTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.hasTemplate(templateId);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: MarkdownRenderer.templateCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.templateCount();`
- **Pure JSDoc:**
```javascript
/**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
```
---
#### METHOD: MarkdownRenderer.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = markdownRenderer.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: PlainTextRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new PlainTextRenderer();`
**Description:** Plain text specialized renderer implementation.

### Raw JSDoc Context:
```javascript
/**
 * Plain text specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

### Methods of PlainTextRenderer

#### METHOD: PlainTextRenderer.getFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.getFormat();`
- **Pure JSDoc:**
```javascript
/**
   * Returns 'text' format identifier.
   * @returns {string}
   */
```
---
#### METHOD: PlainTextRenderer._wrapInContainer
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer._wrapInContainer(content, containerType, options);`
- **Pure JSDoc:**
```javascript
/**
   * Wraps content in basic text delimiters.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} Text wrapped content.
   * @protected
   */
```
---
#### METHOD: PlainTextRenderer.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.render(templateId, data, options, options.containerType, options.blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Executes template rendering with provided data and options.
   * @param {string} templateId Target template identifier.
   * @param {Object} data Source data for interpolation.
   * @param {Object} [options={}] Rendering configuration.
   * @param {string} [options.containerType] Optional container wrapping (ContainerType enum).
   * @param {string} [options.blockType] Block type ID for class name generation.
   * @returns {string} Fully rendered content string.
   * @throws {TemplateNotFoundError} If templateId is not registered.
   * @throws {RenderingError} If rendering logic or interpolation fails.
   */
```
---
#### METHOD: PlainTextRenderer._processTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer._processTemplate(template, data);`
- **Pure JSDoc:**
```javascript
/**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
```
---
#### METHOD: PlainTextRenderer._getValueByPath
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer._getValueByPath(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
```
---
#### METHOD: PlainTextRenderer.registerTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.registerTemplate(templateId, template);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: PlainTextRenderer.registerTemplates
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.registerTemplates(templates);`
- **Pure JSDoc:**
```javascript
/**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
```
---
#### METHOD: PlainTextRenderer.hasTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.hasTemplate(templateId);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: PlainTextRenderer.templateCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.templateCount();`
- **Pure JSDoc:**
```javascript
/**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
```
---
#### METHOD: PlainTextRenderer.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = plainTextRenderer.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: ComposableContentError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new ComposableContentError(message, details);`
**Description:** Base class for domain-specific exceptions within the composition engine.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

### Raw JSDoc Context:
```javascript
/**
 * @description Base class for domain-specific exceptions within the composition engine.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
```

<br>

## CLASS: BlockNotFoundError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new BlockNotFoundError(blockType);`
**Description:** Exception thrown when a requested block type is not registered.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when a requested block type is not registered.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RenderingError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RenderingError(message, blockType, format, cause);`
**Description:** Exception thrown when template rendering fails during block execution.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when template rendering fails during block execution.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: CompositionError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new CompositionError(message, recipeId, cause);`
**Description:** Exception thrown during top-level recipe composition orchestration.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown during top-level recipe composition orchestration.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RecipeValidationError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RecipeValidationError(message, recipeId, validationErrors);`
**Description:** Exception thrown when a Recipe definition manifest fails structural validation.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when a Recipe definition manifest fails structural validation.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RendererNotFoundError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RendererNotFoundError(format);`
**Description:** Exception thrown when no renderer is registered for a requested output format.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when no renderer is registered for a requested output format.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: TemplateNotFoundError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new TemplateNotFoundError(templateId);`
**Description:** Exception thrown when a block's required template ID cannot be resolved.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when a block's required template ID cannot be resolved.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: DataRequirementError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new DataRequirementError(blockType, missingKeys);`
**Description:** Exception thrown when a block's defined context data dependencies are unfulfilled.

### Raw JSDoc Context:
```javascript
/**
 * @description Exception thrown when a block's defined context data dependencies are unfulfilled.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: BlockDataContext
**File Path:** `ComposableContentLib/src/data/BlockDataContext.js`
**Constructor Usage:** `const instance = new BlockDataContext(data, globalContext);`
**Description:** Encapsulated state container for rendering context.
Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.

### Raw JSDoc Context:
```javascript
/**
 * @description Encapsulated state container for rendering context.
 * Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.
 * @class
 * @example
 * const context = new BlockDataContext({ user: { name: 'John' } });
 * const name = context.get('user.name'); // 'John'
 */
```

### Methods of BlockDataContext

#### METHOD: BlockDataContext.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.get(path, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Safely resolves a nested property using dot notation from the unified state.
   * @param {string} path Target property path.
   * @param {*} [defaultValue=null] Fallback if path is unresolvable.
   * @returns {*} Resolved value or default.
   */
```
---
#### METHOD: BlockDataContext.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.has(path);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates the existence of a nested property path.
   * @param {string} path Target property path.
   * @returns {boolean} True if the path resolves to a defined value.
   */
```
---
#### METHOD: BlockDataContext.getMultiple
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.getMultiple(paths);`
- **Pure JSDoc:**
```javascript
/**
   * @description Batch resolves multiple property paths into a single mapping object.
   * @param {string[]} paths Array of target paths.
   * @returns {Object} Key-value map of path to resolved value.
   */
```
---
#### METHOD: BlockDataContext.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.getAll();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a deep clone of the fully unified context state (local + global).
   * @returns {Object} Unified data clone.
   */
```
---
#### METHOD: BlockDataContext.getRawData
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.getRawData();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a deep clone of the block-specific data payload, excluding global state.
   * @returns {Object} Local data clone.
   */
```
---
#### METHOD: BlockDataContext.getGlobalContext
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.getGlobalContext();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a deep clone of the shared global state payload.
   * @returns {Object} Global data clone.
   */
```
---
#### METHOD: BlockDataContext.set
- **Scope:** instance
- **LLM Call Syntax:** `blockDataContext.set(path, value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Mutates the local block data payload and recalculates unified state.
   * @param {string} path Target dot-notation path.
   * @param {*} value Value to apply.
   */
```
---
#### METHOD: BlockDataContext.merge
- **Scope:** instance
- **LLM Call Syntax:** `blockDataContext.merge(additionalData);`
- **Pure JSDoc:**
```javascript
/**
   * @description Deeply merges an external object into the local block data and recalculates state.
   * @param {Object} additionalData Payload to overlay.
   */
```
---
#### METHOD: BlockDataContext.withData
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.withData(additionalData);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method generating a new context instance with augmented local data.
   * @param {Object} additionalData Payload to overlay on the clone.
   * @returns {BlockDataContext} New immutable context.
   */
```
---
#### METHOD: BlockDataContext.withGlobalContext
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.withGlobalContext(additionalGlobal);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method generating a new context instance with augmented global data.
   * @param {Object} additionalGlobal Payload to overlay on the global clone.
   * @returns {BlockDataContext} New immutable context.
   */
```
---
#### METHOD: BlockDataContext.scope
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.scope(path);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method generating a new context scoped to a specific property subtree.
   * Maintains the original global context unmodified.
   * @param {string} path Root path for the new scope.
   * @returns {BlockDataContext} Scoped context instance.
   */
```
---
#### METHOD: BlockDataContext.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.isEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates if the unified context state contains zero enumerable keys.
   * @returns {boolean} True if entirely empty.
   */
```
---
#### METHOD: BlockDataContext.keys
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.keys();`
- **Pure JSDoc:**
```javascript
/**
   * @description Extracts all top-level keys from the unified context state.
   * @returns {string[]} Collection of root keys.
   */
```
---
#### METHOD: BlockDataContext.hasAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.hasAll(requiredKeys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates that the context satisfies an array of required keys.
   * @param {string[]} requiredKeys Expected top-level keys.
   * @returns {boolean} True if all exist.
   */
```
---
#### METHOD: BlockDataContext.getMissingKeys
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.getMissingKeys(requiredKeys);`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the subset of required keys that are missing from the context.
   * @param {string[]} requiredKeys Expected top-level keys.
   * @returns {string[]} Unfulfilled dependencies.
   */
```
---
#### METHOD: BlockDataContext.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes both data and globalContext into a clean object representation.
   * @returns {Object} JSON-safe snapshot.
   */
```
---
#### METHOD: BlockDataContext.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = BlockDataContext.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @description Reconstitutes a BlockDataContext instance from a serialized snapshot.
   * @param {Object} obj Target JSON payload.
   * @returns {BlockDataContext} Restored instance.
   * @static
   */
```
---
#### METHOD: BlockDataContext.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDataContext.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a diagnostic summary of the unified state footprint.
   * @returns {string} Summary string.
   */
```
---
<br>

## CLASS: ContentBlock
**File Path:** `ComposableContentLib/src/core/ContentBlock.js`
**Constructor Usage:** `const instance = new ContentBlock(definition, config);`
**Description:** Abstract base class defining the execution contract for content blocks.
Subclasses implement data extraction, empty state evaluation, and template resolution.

### Raw JSDoc Context:
```javascript
/**
 * @description Abstract base class defining the execution contract for content blocks.
 * Subclasses implement data extraction, empty state evaluation, and template resolution.
 * @class
 * @abstract
 * @example
 * class HeaderBlock extends ContentBlock {
 *   getData(ctx) { return { title: ctx.get('title') }; }
 *   isEmpty(data) { return !data.title; }
 *   getTemplateId(format) { return `header_${format}`; }
 * }
 */
```

### Methods of ContentBlock

#### METHOD: ContentBlock.getTypeId
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.getTypeId();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the unique identifier from the block definition.
   * @returns {string} Block type ID.
   */
```
---
#### METHOD: ContentBlock.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.getName();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the human-readable name from the block definition.
   * @returns {string} Block name.
   */
```
---
#### METHOD: ContentBlock.getData
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.getData(context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Extracts required rendering data from the global context.
   * @param {BlockDataContext} context Current state payload.
   * @returns {Object} Extracted data dictionary.
   * @abstract
   */
```
---
#### METHOD: ContentBlock.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.isEmpty(data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates if the extracted data represents an empty state.
   * @param {Object} data Output from getData().
   * @returns {boolean} True if empty.
   * @abstract
   */
```
---
#### METHOD: ContentBlock.getTemplateId
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.getTemplateId(format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves the format-specific template identifier for this block.
   * @param {string} format Target rendering format.
   * @returns {string} Template ID.
   * @abstract
   */
```
---
#### METHOD: ContentBlock.evaluate
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.evaluate(instanceId, context, format, renderer);`
- **Pure JSDoc:**
```javascript
/**
   * @description Orchestrates the block lifecycle: data extraction, empty state handling, and template rendering.
   * @param {string} instanceId Unique instance identifier.
   * @param {BlockDataContext} context Data payload.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Engine capable of processing the template.
   * @returns {BlockResult} Encapsulated execution outcome.
   */
```
---
#### METHOD: ContentBlock.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.render(data, format, renderer, templateId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Delegates final string generation to the injected renderer.
   * @param {Object} data Extracted payload.
   * @param {string} format Output format.
   * @param {BlockRenderer} renderer Engine instance.
   * @param {string} templateId Resolved template identifier.
   * @returns {string} Rendered content string.
   * @throws {Error} If renderer is not provided.
   */
```
---
#### METHOD: ContentBlock._getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock._getMetadata(data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates diagnostic metadata for the BlockResult.
   * @param {Object} data Extracted block data.
   * @returns {Object} Metadata dictionary.
   * @protected
   */
```
---
#### METHOD: ContentBlock.supportsFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.supportsFormat(format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Verifies format support against the block definition.
   * @param {string} format Target output format.
   * @returns {boolean} True if supported.
   */
```
---
#### METHOD: ContentBlock.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentBlock.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a diagnostic string identifier for the block.
   * @returns {string} String representation.
   */
```
---
<br>

## CLASS: SimpleContentBlock
**File Path:** `ComposableContentLib/src/core/ContentBlock.js`
**Constructor Usage:** `const instance = new SimpleContentBlock(definition, config, config.dataExtractor, config.emptyChecker, config.templates);`
**Description:** Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.

### Raw JSDoc Context:
```javascript
/**
 * @description Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.
 * @class
 * @extends ContentBlock
 * @example
 * const block = new SimpleContentBlock(def, {
 *   dataExtractor: (ctx) => ({ name: ctx.get('name') }),
 *   templates: { html: 'tpl_html' }
 * });
 */
```

### Methods of SimpleContentBlock

#### METHOD: SimpleContentBlock.getData
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.getData(context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes the injected data extractor function.
   * @param {BlockDataContext} context Target data context.
   * @returns {Object} Extracted data.
   */
```
---
#### METHOD: SimpleContentBlock.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.isEmpty(data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes the injected empty checker function.
   * @param {Object} data Extracted payload.
   * @returns {boolean} True if empty.
   */
```
---
#### METHOD: SimpleContentBlock.getTemplateId
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.getTemplateId(format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves the template ID from the injected format mapping.
   * @param {string} format Target format.
   * @returns {string} Mapped template ID.
   * @throws {Error} If no template is mapped for the format.
   */
```
---
#### METHOD: SimpleContentBlock.getTypeId
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.getTypeId();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the unique identifier from the block definition.
   * @returns {string} Block type ID.
   */
```
---
#### METHOD: SimpleContentBlock.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.getName();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the human-readable name from the block definition.
   * @returns {string} Block name.
   */
```
---
#### METHOD: SimpleContentBlock.evaluate
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.evaluate(instanceId, context, format, renderer);`
- **Pure JSDoc:**
```javascript
/**
   * @description Orchestrates the block lifecycle: data extraction, empty state handling, and template rendering.
   * @param {string} instanceId Unique instance identifier.
   * @param {BlockDataContext} context Data payload.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Engine capable of processing the template.
   * @returns {BlockResult} Encapsulated execution outcome.
   */
```
---
#### METHOD: SimpleContentBlock.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.render(data, format, renderer, templateId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Delegates final string generation to the injected renderer.
   * @param {Object} data Extracted payload.
   * @param {string} format Output format.
   * @param {BlockRenderer} renderer Engine instance.
   * @param {string} templateId Resolved template identifier.
   * @returns {string} Rendered content string.
   * @throws {Error} If renderer is not provided.
   */
```
---
#### METHOD: SimpleContentBlock._getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock._getMetadata(data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates diagnostic metadata for the BlockResult.
   * @param {Object} data Extracted block data.
   * @returns {Object} Metadata dictionary.
   * @protected
   */
```
---
#### METHOD: SimpleContentBlock.supportsFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.supportsFormat(format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Verifies format support against the block definition.
   * @param {string} format Target output format.
   * @returns {boolean} True if supported.
   */
```
---
#### METHOD: SimpleContentBlock.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = simpleContentBlock.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a diagnostic string identifier for the block.
   * @returns {string} String representation.
   */
```
---
<br>

## CLASS: CompositionResult
**File Path:** `ComposableContentLib/src/core/CompositionResult.js`
**Constructor Usage:** `const instance = new CompositionResult(result, result.recipeId, result.outputFormat, result.format, result.content, result.blocks, result.blockResults, result.errors, result.processingTime, result.metadata);`
**Description:** Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.

### Raw JSDoc Context:
```javascript
/**
 * Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.
 * @class
 */
```

### Methods of CompositionResult

#### METHOD: CompositionResult.isSuccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.isSuccess();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if composition completed without top-level or block-level errors.
   * @returns {boolean} True if errors array is empty and all blocks are success states.
   */
```
---
#### METHOD: CompositionResult.getBlockResult
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getBlockResult(instanceId);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a block result by its instance ID.
   * @param {string} instanceId Target instance identifier.
   * @returns {BlockResult|null} Matched block result or null.
   */
```
---
#### METHOD: CompositionResult.getVisibleBlocks
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getVisibleBlocks();`
- **Pure JSDoc:**
```javascript
/**
   * Filters results for blocks evaluated as visible.
   * @returns {BlockResult[]} Visible block results.
   */
```
---
#### METHOD: CompositionResult.getHiddenBlocks
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getHiddenBlocks();`
- **Pure JSDoc:**
```javascript
/**
   * Filters results for blocks evaluated as hidden.
   * @returns {BlockResult[]} Hidden block results.
   */
```
---
#### METHOD: CompositionResult.getErrorBlocks
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getErrorBlocks();`
- **Pure JSDoc:**
```javascript
/**
   * Filters results for blocks that encountered rendering or evaluation errors.
   * @returns {BlockResult[]} Erroneous block results.
   */
```
---
#### METHOD: CompositionResult.hasErrors
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.hasErrors();`
- **Pure JSDoc:**
```javascript
/**
   * Checks for presence of top-level composition errors or block-level errors.
   * @returns {boolean} True if errors exist.
   */
```
---
#### METHOD: CompositionResult.getBlockById
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getBlockById(instanceId);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a block result by instance ID.
   * @param {string} instanceId Target instance identifier.
   * @returns {BlockResult|null} Matched block result or null.
   */
```
---
#### METHOD: CompositionResult.getBlocksByType
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getBlocksByType(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * Filters results by block type ID.
   * @param {string} blockType Target block type ID.
   * @returns {BlockResult[]} Matching block results.
   */
```
---
#### METHOD: CompositionResult.getContentLength
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getContentLength();`
- **Pure JSDoc:**
```javascript
/**
   * Returns character count of final concatenated content.
   * @returns {number} Character length.
   */
```
---
#### METHOD: CompositionResult.getAverageBlockTime
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.getAverageBlockTime();`
- **Pure JSDoc:**
```javascript
/**
   * Computes mean execution time across all evaluated blocks.
   * @returns {number} Average duration in ms.
   */
```
---
#### METHOD: CompositionResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes instance into a deep-cloned JSON-safe object.
   * @returns {Object} Serialized composition state.
   */
```
---
#### METHOD: CompositionResult.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = CompositionResult.empty(recipeId, outputFormat, reason);`
- **Pure JSDoc:**
```javascript
/**
   * Factory method for standardized empty composition results.
   * @param {string} recipeId Target recipe ID.
   * @param {string} outputFormat Target output format.
   * @param {string} [reason='empty'] Contextual reason for empty state.
   * @returns {CompositionResult} Frozen instance with empty content/blocks.
   * @static
   */
```
---
#### METHOD: CompositionResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionResult.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Returns diagnostic status string including recipe ID, block counts, and performance metrics.
   * @returns {string} Diagnostic summary.
   */
```
---
<br>

## CLASS: BlockResult
**File Path:** `ComposableContentLib/src/core/BlockResult.js`
**Constructor Usage:** `const instance = new BlockResult(result, result.instanceId, result.blockType, result.isEmpty, result.isVisible, result.content, result.metadata, result.processingTime, result.error);`
**Description:** Immutable data transfer object representing the outcome of a block rendering execution.
Extends the shared {@link Result} base for the success/error contract.
Encapsulates generated content, visibility state, errors, and profiling metrics.

### Raw JSDoc Context:
```javascript
/**
 * @description Immutable data transfer object representing the outcome of a block rendering execution.
 * Extends the shared {@link Result} base for the success/error contract.
 * Encapsulates generated content, visibility state, errors, and profiling metrics.
 * @class
 * @example
 * const result = new BlockResult({
 *   instanceId: 'header-001',
 *   blockType: 'email_header',
 *   content: '<div class="header">...</div>',
 *   isVisible: true
 * });
 */
```

### Methods of BlockResult

#### METHOD: BlockResult.hasDisplayableContent
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockResult.hasDisplayableContent();`
- **Pure JSDoc:**
```javascript
/**
   * @description Assesses if the result contains renderable output.
   * @returns {boolean} True if the block is visible, not empty, and has a non-zero length content string.
   */
```
---
#### METHOD: BlockResult.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockResult.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a specific key from the result's metadata payload.
   * @param {string} key Target metadata key.
   * @param {*} [defaultValue=null] Fallback if key is missing.
   * @returns {*} Metadata value or default.
   */
```
---
#### METHOD: BlockResult.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockResult.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes the result into a plain, deep-cloned object. Errors are mapped to their message strings.
   * @returns {Object} JSON-safe representation.
   */
```
---
#### METHOD: BlockResult.hidden
- **Scope:** static
- **LLM Call Syntax:** `const result = BlockResult.hidden(instanceId, blockType, reason);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method generating a standardized hidden state result.
   * @param {string} instanceId Block instance ID.
   * @param {string} blockType Block type ID.
   * @param {string} [reason='hidden'] Description of why the block is suppressed.
   * @returns {BlockResult} Frozen instance marked invisible and empty.
   * @static
   */
```
---
#### METHOD: BlockResult.error
- **Scope:** static
- **LLM Call Syntax:** `const result = BlockResult.error(instanceId, blockType, error);`
- **Pure JSDoc:**
```javascript
/**
   * @description Factory method generating a standardized error state result.
   * @param {string} instanceId Target instance ID.
   * @param {string} blockType Target block type ID.
   * @param {Error} error Caught exception.
   * @returns {BlockResult} Frozen instance encapsulating the failure state.
   * @static
   */
```
---
#### METHOD: BlockResult.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockResult.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Provides a brief diagnostic status string.
   * @returns {string} Summary string (e.g., "BlockResult[id] VISIBLE (5ms)").
   */
```
---
<br>

## CLASS: BlockDefinition
**File Path:** `ComposableContentLib/src/core/BlockDefinition.js`
**Constructor Usage:** `const instance = new BlockDefinition(definition, definition.id, definition.name, definition.description, definition.dataRequirements, definition.defaultVisibility, definition.defaultOrder, definition.supportedFormats, definition.emptyBehavior, definition.containerType, definition.metadata);`
**Description:** Immutable blueprint for a reusable content block type.
Specifies rendering capabilities, context data dependencies, structural containment, and fallback behaviors.

### Raw JSDoc Context:
```javascript
/**
 * @description Immutable blueprint for a reusable content block type.
 * Specifies rendering capabilities, context data dependencies, structural containment, and fallback behaviors.
 * @class
 * @example
 * const headerBlock = new BlockDefinition({
 *   id: 'email_header',
 *   name: 'Email Header',
 *   dataRequirements: ['recipient', 'subject'],
 *   supportedFormats: ['html', 'text'],
 *   emptyBehavior: EmptyBehavior.HIDE
 * });
 */
```

### Methods of BlockDefinition

#### METHOD: BlockDefinition.supportsFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.supportsFormat(format);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates if the block type can render to the requested output format.
   * @param {string} format Target format (e.g., 'html').
   * @returns {boolean} True if supported.
   */
```
---
#### METHOD: BlockDefinition.requiresData
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.requiresData(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if a specific data key is mandated by this block type.
   * @param {string} key Context data property name.
   * @returns {boolean} True if explicitly required.
   */
```
---
#### METHOD: BlockDefinition.hasDataRequirements
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.hasDataRequirements();`
- **Pure JSDoc:**
```javascript
/**
   * @description Determines if the block has any strictly defined context data dependencies.
   * @returns {boolean} True if requirements array is non-empty.
   */
```
---
#### METHOD: BlockDefinition.hidesWhenEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.hidesWhenEmpty();`
- **Pure JSDoc:**
```javascript
/**
   * @description Evaluates if the block should be omitted from output when its resolved content is empty.
   * @returns {boolean} True if behavior is EmptyBehavior.HIDE.
   */
```
---
#### METHOD: BlockDefinition.isAlwaysVisible
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.isAlwaysVisible();`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if the block bypasses conditional visibility checks by default.
   * @returns {boolean} True if defaultVisibility is 'always'.
   */
```
---
#### METHOD: BlockDefinition.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.getMetadata(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a custom configuration value from the definition's metadata block.
   * @param {string} key Target metadata property.
   * @param {*} [defaultValue=undefined] Fallback if key is absent.
   * @returns {*} Stored value or fallback.
   */
```
---
#### METHOD: BlockDefinition.isNeverVisible
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.isNeverVisible();`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if the block is disabled by default.
   * @returns {boolean} True if defaultVisibility is 'never'.
   */
```
---
#### METHOD: BlockDefinition.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes the definition into a plain, deep-cloned state object.
   * @returns {Object} JSON-safe representation.
   */
```
---
#### METHOD: BlockDefinition.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = BlockDefinition.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @description Rehydrates a BlockDefinition instance from a serialized state object.
   * @param {Object} obj Valid definition payload.
   * @returns {BlockDefinition} Restored definition model.
   * @static
   */
```
---
#### METHOD: BlockDefinition.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = blockDefinition.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a diagnostic summary string for logging and debugging.
   * @returns {string} String identifier.
   */
```
---
<br>

## CLASS: ContentComposer
**File Path:** `ComposableContentLib/src/composition/ContentComposer.js`
**Constructor Usage:** `const instance = new ContentComposer(options, options.blockRegistry, options.rendererRegistry, options.logger, options.expressionEngine);`
**Description:** Central orchestration engine for content block resolution and rendering.
Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.

### Raw JSDoc Context:
```javascript
/**
 * @description Central orchestration engine for content block resolution and rendering.
 * Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.
 * @class
 * @example
 * const composer = new ContentComposer({ blockRegistry, rendererRegistry });
 * const result = composer.compose(recipe, { user: { name: 'Alice' } });
 */
```

### Methods of ContentComposer

#### METHOD: ContentComposer.compose
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.compose(recipe, context, options, options.format, options.continueOnError);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes a composition recipe against a data context to generate a final result.
   * Processes blocks sequentially, handling errors based on the `continueOnError` flag, and aggregates visible content.
   * @param {CompositionRecipe|Object} recipe The recipe defining the composition structure.
   * @param {Object|BlockDataContext} context The data payload for block evaluation.
   * @param {Object} [options={}] Execution modifiers.
   * @param {string} [options.format] Output format override (defaults to recipe format).
   * @param {boolean} [options.continueOnError=true] If false, halts execution on first block failure.
   * @returns {CompositionResult} Detailed execution report including aggregated content and block-level metadata.
   */
```
---
#### METHOD: ContentComposer.composeToString
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.composeToString(recipe, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Convenience method for composition that returns only the aggregated string content.
   * @param {CompositionRecipe|Object} recipe Composition manifest.
   * @param {Object|BlockDataContext} context Data payload.
   * @param {Object} [options={}] Execution modifiers.
   * @returns {string} Fully rendered and joined content string.
   */
```
---
#### METHOD: ContentComposer._evaluateBlock
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer._evaluateBlock(blockInstance, context, format, renderer);`
- **Pure JSDoc:**
```javascript
/**
   * @description Internal evaluator for a single block instance.
   * Handles visibility checks, registry resolution, format validation, and block execution.
   * @param {Object} blockInstance Recipe block configuration.
   * @param {BlockDataContext} context Data context.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Format-specific renderer.
   * @returns {BlockResult} Execution outcome for the block.
   * @throws {BlockNotFoundError} If the requested block type is unregistered.
   * @private
   */
```
---
#### METHOD: ContentComposer.validateRecipe
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.validateRecipe(recipe);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates a recipe against current registry states to ensure all dependencies are met.
   * @param {CompositionRecipe|Object} recipe Recipe to validate.
   * @returns {Object} Validation summary containing `{ valid: boolean, errors: string[] }`.
   */
```
---
#### METHOD: ContentComposer.getBlockRegistry
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.getBlockRegistry();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured block registry instance.
   * @returns {BlockRegistry} Active block repository.
   */
```
---
#### METHOD: ContentComposer.getRendererRegistry
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.getRendererRegistry();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the configured renderer registry instance.
   * @returns {RendererRegistry} Active renderer repository.
   */
```
---
#### METHOD: ContentComposer.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = contentComposer.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a technical summary of the composer's registry states.
   * @returns {string} Debug string representation.
   */
```
---
<br>

## CLASS: CompositionRecipe
**File Path:** `ComposableContentLib/src/composition/CompositionRecipe.js`
**Constructor Usage:** `const instance = new CompositionRecipe(definition, definition.id, definition.name, definition.description, definition.outputFormat, definition.blocks, definition.separator, definition.metadata);`
**Description:** Immutable model for multi-block content composition.
Defines block selection, execution order, visibility logic, and serialization metadata.

### Raw JSDoc Context:
```javascript
/**
 * @description Immutable model for multi-block content composition.
 * Defines block selection, execution order, visibility logic, and serialization metadata.
 * @class
 * @example
 * const recipe = new CompositionRecipe({
 *   id: 'welcome_email',
 *   name: 'Welcome Email',
 *   outputFormat: 'html',
 *   blocks: [
 *     { instanceId: 'header', blockType: 'email_header', order: 1 },
 *     { instanceId: 'greeting', blockType: 'greeting_block', order: 2 }
 *   ]
 * });
 */
```

### Methods of CompositionRecipe

#### METHOD: CompositionRecipe.getOrderedBlocks
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.getOrderedBlocks();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a collection of blocks sorted by their numeric execution order.
   * @returns {BlockInstance[]} Array of blocks in rendering sequence.
   */
```
---
#### METHOD: CompositionRecipe.getBlock
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.getBlock(instanceId);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a specific block configuration by its instance ID.
   * @param {string} instanceId Unique instance identifier.
   * @returns {BlockInstance|null} The resolved block or null if not found.
   */
```
---
#### METHOD: CompositionRecipe.getBlocksByType
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.getBlocksByType(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all instances of a specific block type registered in the recipe.
   * @param {string} blockType Registered block type identifier.
   * @returns {BlockInstance[]} Matching block configurations.
   */
```
---
#### METHOD: CompositionRecipe.getUsedBlockTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.getUsedBlockTypes();`
- **Pure JSDoc:**
```javascript
/**
   * @description Extracts all unique block types utilized in this recipe.
   * @returns {string[]} Collection of unique block type IDs.
   */
```
---
#### METHOD: CompositionRecipe.getBlockCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.getBlockCount();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the total number of blocks defined in the recipe.
   * @returns {number} Total block count.
   */
```
---
#### METHOD: CompositionRecipe.usesBlockType
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.usesBlockType(blockType);`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if any instance of the specified block type exists in the recipe.
   * @param {string} blockType Registered block type identifier.
   * @returns {boolean} True if the type is utilized.
   */
```
---
#### METHOD: CompositionRecipe.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @description Serializes the recipe into a plain data object for storage or transmission.
   * @returns {Object} Deep-cloned plain object representation.
   */
```
---
#### METHOD: CompositionRecipe.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = CompositionRecipe.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * @description Hydrates a new CompositionRecipe from a plain data object.
   * @param {Object} obj Recipe definition data.
   * @returns {CompositionRecipe} Reconstituted immutable recipe instance.
   * @static
   */
```
---
#### METHOD: CompositionRecipe.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = compositionRecipe.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a technical summary string for diagnostics and logging.
   * @returns {string} Debug string representation.
   */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: isValidEmptyBehavior
- **Source:** `ComposableContentLib/src/core/EmptyBehavior.js`
- **LLM Call Syntax:** `const result = isValidEmptyBehavior(value);`
- **Pure JSDoc:**
```javascript
/**
 * @description Validates if a string strictly matches an EmptyBehavior enum value.
 * @param {string} value Value to evaluate.
 * @returns {boolean} True if present in EmptyBehavior.
 */
```

---
### FUNCTION: isValidContainerType
- **Source:** `ComposableContentLib/src/core/EmptyBehavior.js`
- **LLM Call Syntax:** `const result = isValidContainerType(value);`
- **Pure JSDoc:**
```javascript
/**
 * @description Validates and normalizes a string against ContainerType enum values.
 * @param {string} value Value to evaluate (case-insensitive).
 * @returns {boolean} True if matched.
 */
```

---
### FUNCTION: isValidOutputFormat
- **Source:** `ComposableContentLib/src/core/EmptyBehavior.js`
- **LLM Call Syntax:** `const result = isValidOutputFormat(value);`
- **Pure JSDoc:**
```javascript
/**
 * @description Validates if a string strictly matches an OutputFormat enum value.
 * @param {string} value Value to evaluate.
 * @returns {boolean} True if present in OutputFormat.
 */
```

---
