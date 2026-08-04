# API Reference: ComposableContentLib

## CLASS: ContentBlockMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new ContentBlockMock();`
**Description:** Centralized high-fidelity mocks for ComposableContentLib services.

/

/**
High-fidelity Jest mock for ContentBlock implementations.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for ComposableContentLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity Jest mock for ContentBlock implementations.
 * @class
 */
```

<br>

## CLASS: BlockRegistryMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new BlockRegistryMock();`
**Description:** Initializes mock with default type ID and Jest spy functions.

### Raw JSDoc Context:
```javascript
/**
   * Initializes mock with default type ID and Jest spy functions.
   * @param {string} [typeId='mock_block'] Mock block type identifier.
   */
  constructor(typeId = 'mock_block') {
    this.typeId = typeId;
    this.getTypeId = jest.fn(() => this.typeId);
    this.execute = jest.fn((context) => ({
      success: true,
      content: `Mock content for ${this.typeId}`,
      format: context.getOutputFormat(),
      metadata: {}
    }));
    this.isVisible = jest.fn(() => true);
    this.validateConfig = jest.fn(() => ({ valid: true }));
  }
}

/**
 * High-fidelity Jest mock for BlockRegistry.
 * @class
 */
```

<br>

## CLASS: RendererRegistryMock
**File Path:** `ComposableContentLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new RendererRegistryMock();`
**Description:** Initializes mock with internal storage and Jest spy functions.
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

/**
High-fidelity Jest mock for RendererRegistry.

### Raw JSDoc Context:
```javascript
/**
   * Initializes mock with internal storage and Jest spy functions.
   */
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

/**
 * High-fidelity Jest mock for RendererRegistry.
 * @class
 */
```

<br>

## CLASS: RendererRegistry
**File Path:** `ComposableContentLib/src/registry/RendererRegistry.js`
**Constructor Usage:** `const instance = new RendererRegistry();`
**Description:** Registry for block renderers by output format.

/

import { RendererNotFoundError } from '../errors/ComposableContentError.js';
import { HtmlRenderer, MarkdownRenderer, PlainTextRenderer } from '../internal/BlockRenderer.js';
import { Registry } from '@CoreUtilsLib';

/**
Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/registry/RendererRegistry.js
 * @description Registry for block renderers by output format.
 * @version 1.0.0
 */

import { RendererNotFoundError } from '../errors/ComposableContentError.js';
import { HtmlRenderer, MarkdownRenderer, PlainTextRenderer } from '../internal/BlockRenderer.js';
import { Registry } from '@CoreUtilsLib';

/**
 * Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').
 * @class
 */
```

<br>

## CLASS: BlockRegistry
**File Path:** `ComposableContentLib/src/registry/BlockRegistry.js`
**Constructor Usage:** `const instance = new BlockRegistry();`
**Description:** Registry for block definitions and factories.

/

import { TypeGuards } from '@CoreUtilsLib';
import { BlockDefinition } from '../core/BlockDefinition.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/registry/BlockRegistry.js
 * @description Registry for block definitions and factories.
 * @version 1.0.0
 */

import { TypeGuards } from '@CoreUtilsLib';
import { BlockDefinition } from '../core/BlockDefinition.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
 * Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.
 * @class
 */
```

<br>

## CLASS: VisibilityEvaluator
**File Path:** `ComposableContentLib/src/internal/VisibilityEvaluator.js`
**Constructor Usage:** `const instance = new VisibilityEvaluator();`
**Description:** Evaluates visibility conditions for content blocks.

/

/**
Engine for resolving block visibility conditions against a data context.
Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.
@class
@example
const evaluator = new VisibilityEvaluator(expressionEngine);
const visible = evaluator.isVisible('{{user.isPremium}} == true', context);

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/composition/VisibilityEvaluator.js
 * @description Evaluates visibility conditions for content blocks.
 * @version 1.0.0
 */

/**
 * @description Engine for resolving block visibility conditions against a data context.
 * Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.
 * @class
 * @example
 * const evaluator = new VisibilityEvaluator(expressionEngine);
 * const visible = evaluator.isVisible('{{user.isPremium}} == true', context);
 */
```

<br>

## CLASS: BlockRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new BlockRenderer();`
**Description:** BlockRenderer base class and implementations.

/

import { TemplateNotFoundError, RenderingError } from '../errors/ComposableContentError.js';
import { ContainerType } from '../core/EmptyBehavior.js';

/**
Abstract base class for block rendering engines. Subclasses must implement format-specific logic.
@class
@abstract

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/rendering/BlockRenderer.js
 * @description BlockRenderer base class and implementations.
 * @version 1.0.0
 */

import { TemplateNotFoundError, RenderingError } from '../errors/ComposableContentError.js';
import { ContainerType } from '../core/EmptyBehavior.js';

/**
 * Abstract base class for block rendering engines. Subclasses must implement format-specific logic.
 * @class
 * @abstract
 */
```

<br>

## CLASS: HtmlRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new HtmlRenderer();`
**Description:** Initializes a new BlockRenderer instance.

### Raw JSDoc Context:
```javascript
/**
   * Initializes a new BlockRenderer instance.
   * @param {Object} [options={}] Renderer configuration.
   * @param {Object} [options.logger=console] Logger implementation for diagnostic output.
   * @param {Object<string, string|Function>} [options.templates={}] Map of template identifiers to strings or functions.
   */
  constructor(options = {}) {
    /**
     * Logger implementation.
     * @type {Object}
     * @protected
     */
    this._logger = options.logger || console;

    /**
     * Internal registry of rendering templates.
     * @type {Map<string, string|Function>}
     * @protected
     */
    this._templates = new Map(Object.entries(options.templates || {}));
  }

  /**
   * Retrieves the target output format identifier.
   * @returns {string} Format ID (e.g., 'html', 'markdown', 'text').
   * @abstract
   * @throws {Error} If called directly on base class.
   */
  getFormat() {
    throw new Error('BlockRenderer.getFormat() must be implemented');
  }

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
  render(templateId, data, options = {}) {
    const template = this._templates.get(templateId);

    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    try {
      let content;

      if (typeof template === 'function') {
        content = template(data, options);
      } else {
        content = this._processTemplate(template, data);
      }

      // Apply container if specified
      if (options.containerType && options.containerType !== ContainerType.NONE) {
        content = this._wrapInContainer(content, options.containerType, options);
      }

      return content;
    } catch (error) {
      throw new RenderingError(
        `Failed to render template ${templateId}`,
        options.blockType || 'unknown',
        this.getFormat(),
        error
      );
    }
  }

  /**
   * Processes template string via regex-based interpolation ({{path.to.value}}).
   * @param {string} template Source template string.
   * @param {Object} data Source data object.
   * @returns {string} Interpolated output.
   * @protected
   */
  _processTemplate(template, data) {
    // Simple {{variable}} substitution
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this._getValueByPath(data, path);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  /**
   * Resolves a value from a nested object using dot-notation.
   * @param {Object} obj Target object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined if path does not exist.
   * @protected
   */
  _getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Wraps rendered content in a format-specific container structure.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type (ContainerType enum).
   * @param {Object} options Original rendering options.
   * @returns {string} Wrapped output.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    return content;
  }

  /**
   * Registers a single template string or function.
   * @param {string} templateId Target template identifier.
   * @param {string|Function} template Template payload.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
  registerTemplate(templateId, template) {
    this._templates.set(templateId, template);
    return this;
  }

  /**
   * Registers multiple templates from a KV map.
   * @param {Object<string, string|Function>} templates Map of template identifiers to payloads.
   * @returns {BlockRenderer} Fluent interface for chaining.
   */
  registerTemplates(templates) {
    for (const [id, template] of Object.entries(templates)) {
      this._templates.set(id, template);
    }
    return this;
  }

  /**
   * Validates presence of a template in the renderer registry.
   * @param {string} templateId Target template identifier.
   * @returns {boolean} True if registered.
   */
  hasTemplate(templateId) {
    return this._templates.has(templateId);
  }

  /**
   * Returns total number of registered templates.
   * @returns {number} Template count.
   */
  templateCount() {
    return this._templates.size;
  }

  /**
   * Returns diagnostic summary string including format and template count.
   * @returns {string} Diagnostic summary.
   */
  toString() {
    return `BlockRenderer[${this.getFormat()}] ${this._templates.size} templates`;
  }
}

/**
 * HTML-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

<br>

## CLASS: MarkdownRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new MarkdownRenderer();`
**Description:** Returns 'html' format identifier.

### Raw JSDoc Context:
```javascript
/**
   * Returns 'html' format identifier.
   * @returns {string}
   */
  getFormat() {
    return 'html';
  }

  /**
   * Wraps content in HTML structural elements (div, section) based on ContainerType.
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} HTML wrapped content.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    const blockType = options.blockType || 'block';

    switch (containerType) {
      case ContainerType.BOX:
        return `<div class="content-block content-block--${blockType}">${content}</div>`;

      case ContainerType.CARD:
        return `<div class="content-card content-card--${blockType}"><div class="content-card__body">${content}</div></div>`;

      case ContainerType.SECTION:
        return `<section class="content-section content-section--${blockType}">${content}</section>`;

      default:
        return content;
    }
  }
}

/**
 * Markdown-specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

<br>

## CLASS: PlainTextRenderer
**File Path:** `ComposableContentLib/src/internal/BlockRenderer.js`
**Constructor Usage:** `const instance = new PlainTextRenderer();`
**Description:** Returns 'markdown' format identifier.

### Raw JSDoc Context:
```javascript
/**
   * Returns 'markdown' format identifier.
   * @returns {string}
   */
  getFormat() {
    return 'markdown';
  }

  /**
   * Wraps content in Markdown block syntax (blockquote, horizontal rules).
   * @param {string} content Rendered payload.
   * @param {string} containerType Target container type.
   * @param {Object} options Rendering options.
   * @returns {string} Markdown wrapped content.
   * @protected
   */
  _wrapInContainer(content, containerType, options) {
    switch (containerType) {
      case ContainerType.BOX:
        return `> ${content.split('\n').join('\n> ')}`;

      case ContainerType.CARD:
        return `---\n${content}\n---`;

      case ContainerType.SECTION:
        return `\n${content}\n`;

      default:
        return content;
    }
  }
}

/**
 * Plain text specialized renderer implementation.
 * @class
 * @extends BlockRenderer
 */
```

<br>

## CLASS: ComposableContentError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new ComposableContentError();`
**Description:** Error classes for ComposableContentLib.

/

import { BaseError } from '@CoreUtilsLib';

/**
Base class for domain-specific exceptions within the composition engine.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
@class
@extends BaseError

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/errors/ComposableContentError.js
 * @description Error classes for ComposableContentLib.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

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
**Constructor Usage:** `const instance = new BlockNotFoundError();`
**Description:** Initializes a generic composition error with structured metadata.
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

/**
Exception thrown when a requested block type is not registered.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a generic composition error with structured metadata.
   * @param {string} message Primary error description.
   * @param {Object} [details={}] Diagnostic payload.
   */
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ComposableContentError';
    this.details = details;
  }
}

/**
 * @description Exception thrown when a requested block type is not registered.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RenderingError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RenderingError();`
**Description:** Initializes a block resolution error.
@param {string} blockType Unresolved block identifier.
/
  constructor(blockType) {
    super(`Block type not found: ${blockType}`, { blockType });
    this.name = 'BlockNotFoundError';
    this.blockType = blockType;
  }
}

/**
Exception thrown when template rendering fails during block execution.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a block resolution error.
   * @param {string} blockType Unresolved block identifier.
   */
  constructor(blockType) {
    super(`Block type not found: ${blockType}`, { blockType });
    this.name = 'BlockNotFoundError';
    this.blockType = blockType;
  }
}

/**
 * @description Exception thrown when template rendering fails during block execution.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: CompositionError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new CompositionError();`
**Description:** Initializes a rendering error with format context.
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

/**
Exception thrown during top-level recipe composition orchestration.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a rendering error with format context.
   * @param {string} message Specific failure reason.
   * @param {string} blockType Target block identifier.
   * @param {string} format Attempted output format.
   * @param {Error} [cause] Original caught exception.
   */
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

/**
 * @description Exception thrown during top-level recipe composition orchestration.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RecipeValidationError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RecipeValidationError();`
**Description:** Initializes an orchestration error.
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

/**
Exception thrown when a Recipe definition manifest fails structural validation.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes an orchestration error.
   * @param {string} message Specific failure reason.
   * @param {string} recipeId Target recipe identifier.
   * @param {Error} [cause] Original caught exception.
   */
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

/**
 * @description Exception thrown when a Recipe definition manifest fails structural validation.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: RendererNotFoundError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new RendererNotFoundError();`
**Description:** Initializes a recipe validation error.
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

/**
Exception thrown when no renderer is registered for a requested output format.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a recipe validation error.
   * @param {string} message Summary of validation failures.
   * @param {string} recipeId Target recipe identifier.
   * @param {string[]} [validationErrors=[]] Collection of specific violation messages.
   */
  constructor(message, recipeId, validationErrors = []) {
    super(message, { recipeId, validationErrors });
    this.name = 'RecipeValidationError';
    this.recipeId = recipeId;
    this.validationErrors = validationErrors;
  }
}

/**
 * @description Exception thrown when no renderer is registered for a requested output format.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: TemplateNotFoundError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new TemplateNotFoundError();`
**Description:** Initializes a renderer resolution error.
@param {string} format Unresolved format string.
/
  constructor(format) {
    super(`Renderer not found for format: ${format}`, { format });
    this.name = 'RendererNotFoundError';
    this.format = format;
  }
}

/**
Exception thrown when a block's required template ID cannot be resolved.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a renderer resolution error.
   * @param {string} format Unresolved format string.
   */
  constructor(format) {
    super(`Renderer not found for format: ${format}`, { format });
    this.name = 'RendererNotFoundError';
    this.format = format;
  }
}

/**
 * @description Exception thrown when a block's required template ID cannot be resolved.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: DataRequirementError
**File Path:** `ComposableContentLib/src/errors/ComposableContentError.js`
**Constructor Usage:** `const instance = new DataRequirementError();`
**Description:** Initializes a template resolution error.
@param {string} templateId Unresolved template identifier.
/
  constructor(templateId) {
    super(`Template not found: ${templateId}`, { templateId });
    this.name = 'TemplateNotFoundError';
    this.templateId = templateId;
  }
}

/**
Exception thrown when a block's defined context data dependencies are unfulfilled.
@class
@extends ComposableContentError

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes a template resolution error.
   * @param {string} templateId Unresolved template identifier.
   */
  constructor(templateId) {
    super(`Template not found: ${templateId}`, { templateId });
    this.name = 'TemplateNotFoundError';
    this.templateId = templateId;
  }
}

/**
 * @description Exception thrown when a block's defined context data dependencies are unfulfilled.
 * @class
 * @extends ComposableContentError
 */
```

<br>

## CLASS: BlockDataContext
**File Path:** `ComposableContentLib/src/data/BlockDataContext.js`
**Constructor Usage:** `const instance = new BlockDataContext();`
**Description:** BlockDataContext for providing data to content blocks.

/

import { cloneDeep, get as lodashGet, set as lodashSet } from '@CoreUtilsLib';

/**
Encapsulated state container for rendering context.
Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.
@class
@example
const context = new BlockDataContext({ user: { name: 'John' } });
const name = context.get('user.name'); // 'John'

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/data/BlockDataContext.js
 * @description BlockDataContext for providing data to content blocks.
 * @version 1.0.0
 */

import { cloneDeep, get as lodashGet, set as lodashSet } from '@CoreUtilsLib';

/**
 * @description Encapsulated state container for rendering context.
 * Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.
 * @class
 * @example
 * const context = new BlockDataContext({ user: { name: 'John' } });
 * const name = context.get('user.name'); // 'John'
 */
```

<br>

## CLASS: ContentBlock
**File Path:** `ComposableContentLib/src/core/ContentBlock.js`
**Constructor Usage:** `const instance = new ContentBlock();`
**Description:** ContentBlock base class for content blocks.

/

import { BlockResult } from './BlockResult.js';

/**
Abstract base class defining the execution contract for content blocks.
Subclasses implement data extraction, empty state evaluation, and template resolution.
@class
@abstract
@example
class HeaderBlock extends ContentBlock {
  getData(ctx) { return { title: ctx.get('title') }; }
  isEmpty(data) { return !data.title; }
  getTemplateId(format) { return `header_${format}`; }
}

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/core/ContentBlock.js
 * @description ContentBlock base class for content blocks.
 * @version 1.0.0
 */

import { BlockResult } from './BlockResult.js';

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

<br>

## CLASS: SimpleContentBlock
**File Path:** `ComposableContentLib/src/core/ContentBlock.js`
**Constructor Usage:** `const instance = new SimpleContentBlock();`
**Description:** Initializes block with its definition blueprint and runtime configuration.
@param {BlockDefinition} definition Immutable type specification.
@param {Object} [config={}] Instance-specific configuration overrides.
@throws {Error} If definition is missing.
/
  constructor(definition, config = {}) {
    if (!definition) {
      throw new Error('ContentBlock requires a definition');
    }

    /**
Block definition.
@type {BlockDefinition}
@readonly
/
    this.definition = definition;

    /**
Instance-specific configuration.
@type {Object}
@readonly
/
    this.config = Object.freeze({ ...config });
  }

  /**
Returns the unique identifier from the block definition.
@returns {string} Block type ID.
/
  getTypeId() {
    return this.definition.id;
  }

  /**
Returns the human-readable name from the block definition.
@returns {string} Block name.
/
  getName() {
    return this.definition.name;
  }

  /**
Extracts required rendering data from the global context.
@param {BlockDataContext} context Current state payload.
@returns {Object} Extracted data dictionary.
@abstract
/
  getData(context) {
    throw new Error('ContentBlock.getData() must be implemented by subclass');
  }

  /**
Evaluates if the extracted data represents an empty state.
@param {Object} data Output from getData().
@returns {boolean} True if empty.
@abstract
/
  isEmpty(data) {
    throw new Error('ContentBlock.isEmpty() must be implemented by subclass');
  }

  /**
Resolves the format-specific template identifier for this block.
@param {string} format Target rendering format.
@returns {string} Template ID.
@abstract
/
  getTemplateId(format) {
    throw new Error('ContentBlock.getTemplateId() must be implemented by subclass');
  }

  /**
Orchestrates the block lifecycle: data extraction, empty state handling, and template rendering.
@param {string} instanceId Unique instance identifier.
@param {BlockDataContext} context Data payload.
@param {string} format Target output format.
@param {BlockRenderer} renderer Engine capable of processing the template.
@returns {BlockResult} Encapsulated execution outcome.
/
  evaluate(instanceId, context, format, renderer) {
    const startTime = Date.now();

    try {
      // 1. Get data from context
      const data = this.getData(context);

      // 2. Check if empty
      const empty = this.isEmpty(data);

      // 3. Handle empty behavior
      if (empty && this.definition.hidesWhenEmpty()) {
        return BlockResult.hidden(instanceId, this.getTypeId(), 'empty');
      }

      // 4. Get template and render
      const templateId = this.getTemplateId(format);
      const content = this.render(data, format, renderer, templateId);

      return new BlockResult({
        instanceId,
        blockType: this.getTypeId(),
        isEmpty: empty,
        isVisible: true,
        content,
        metadata: this._getMetadata(data),
        processingTime: Date.now() - startTime
      });
    } catch (error) {
      return BlockResult.error(instanceId, this.getTypeId(), error);
    }
  }

  /**
Delegates final string generation to the injected renderer.
@param {Object} data Extracted payload.
@param {string} format Output format.
@param {BlockRenderer} renderer Engine instance.
@param {string} templateId Resolved template identifier.
@returns {string} Rendered content string.
@throws {Error} If renderer is not provided.
/
  render(data, format, renderer, templateId) {
    if (!renderer) {
      throw new Error('Renderer is required for rendering');
    }

    return renderer.render(templateId, data, {
      format,
      blockType: this.getTypeId(),
      config: this.config,
      containerType: this.definition.containerType
    });
  }

  /**
Generates diagnostic metadata for the BlockResult.
@param {Object} data Extracted block data.
@returns {Object} Metadata dictionary.
@protected
/
  _getMetadata(data) {
    return {
      blockType: this.getTypeId(),
      blockName: this.getName()
    };
  }

  /**
Verifies format support against the block definition.
@param {string} format Target output format.
@returns {boolean} True if supported.
/
  supportsFormat(format) {
    return this.definition.supportsFormat(format);
  }

  /**
Returns a diagnostic string identifier for the block.
@returns {string} String representation.
/
  toString() {
    return `ContentBlock[${this.getTypeId()}] "${this.getName()}"`;
  }
}

/**
Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.
@class
@extends ContentBlock
@example
const block = new SimpleContentBlock(def, {
  dataExtractor: (ctx) => ({ name: ctx.get('name') }),
  templates: { html: 'tpl_html' }
});

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes block with its definition blueprint and runtime configuration.
   * @param {BlockDefinition} definition Immutable type specification.
   * @param {Object} [config={}] Instance-specific configuration overrides.
   * @throws {Error} If definition is missing.
   */
  constructor(definition, config = {}) {
    if (!definition) {
      throw new Error('ContentBlock requires a definition');
    }

    /**
     * Block definition.
     * @type {BlockDefinition}
     * @readonly
     */
    this.definition = definition;

    /**
     * Instance-specific configuration.
     * @type {Object}
     * @readonly
     */
    this.config = Object.freeze({ ...config });
  }

  /**
   * @description Returns the unique identifier from the block definition.
   * @returns {string} Block type ID.
   */
  getTypeId() {
    return this.definition.id;
  }

  /**
   * @description Returns the human-readable name from the block definition.
   * @returns {string} Block name.
   */
  getName() {
    return this.definition.name;
  }

  /**
   * @description Extracts required rendering data from the global context.
   * @param {BlockDataContext} context Current state payload.
   * @returns {Object} Extracted data dictionary.
   * @abstract
   */
  getData(context) {
    throw new Error('ContentBlock.getData() must be implemented by subclass');
  }

  /**
   * @description Evaluates if the extracted data represents an empty state.
   * @param {Object} data Output from getData().
   * @returns {boolean} True if empty.
   * @abstract
   */
  isEmpty(data) {
    throw new Error('ContentBlock.isEmpty() must be implemented by subclass');
  }

  /**
   * @description Resolves the format-specific template identifier for this block.
   * @param {string} format Target rendering format.
   * @returns {string} Template ID.
   * @abstract
   */
  getTemplateId(format) {
    throw new Error('ContentBlock.getTemplateId() must be implemented by subclass');
  }

  /**
   * @description Orchestrates the block lifecycle: data extraction, empty state handling, and template rendering.
   * @param {string} instanceId Unique instance identifier.
   * @param {BlockDataContext} context Data payload.
   * @param {string} format Target output format.
   * @param {BlockRenderer} renderer Engine capable of processing the template.
   * @returns {BlockResult} Encapsulated execution outcome.
   */
  evaluate(instanceId, context, format, renderer) {
    const startTime = Date.now();

    try {
      // 1. Get data from context
      const data = this.getData(context);

      // 2. Check if empty
      const empty = this.isEmpty(data);

      // 3. Handle empty behavior
      if (empty && this.definition.hidesWhenEmpty()) {
        return BlockResult.hidden(instanceId, this.getTypeId(), 'empty');
      }

      // 4. Get template and render
      const templateId = this.getTemplateId(format);
      const content = this.render(data, format, renderer, templateId);

      return new BlockResult({
        instanceId,
        blockType: this.getTypeId(),
        isEmpty: empty,
        isVisible: true,
        content,
        metadata: this._getMetadata(data),
        processingTime: Date.now() - startTime
      });
    } catch (error) {
      return BlockResult.error(instanceId, this.getTypeId(), error);
    }
  }

  /**
   * @description Delegates final string generation to the injected renderer.
   * @param {Object} data Extracted payload.
   * @param {string} format Output format.
   * @param {BlockRenderer} renderer Engine instance.
   * @param {string} templateId Resolved template identifier.
   * @returns {string} Rendered content string.
   * @throws {Error} If renderer is not provided.
   */
  render(data, format, renderer, templateId) {
    if (!renderer) {
      throw new Error('Renderer is required for rendering');
    }

    return renderer.render(templateId, data, {
      format,
      blockType: this.getTypeId(),
      config: this.config,
      containerType: this.definition.containerType
    });
  }

  /**
   * @description Generates diagnostic metadata for the BlockResult.
   * @param {Object} data Extracted block data.
   * @returns {Object} Metadata dictionary.
   * @protected
   */
  _getMetadata(data) {
    return {
      blockType: this.getTypeId(),
      blockName: this.getName()
    };
  }

  /**
   * @description Verifies format support against the block definition.
   * @param {string} format Target output format.
   * @returns {boolean} True if supported.
   */
  supportsFormat(format) {
    return this.definition.supportsFormat(format);
  }

  /**
   * @description Returns a diagnostic string identifier for the block.
   * @returns {string} String representation.
   */
  toString() {
    return `ContentBlock[${this.getTypeId()}] "${this.getName()}"`;
  }
}

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

<br>

## CLASS: CompositionResult
**File Path:** `ComposableContentLib/src/core/CompositionResult.js`
**Constructor Usage:** `const instance = new CompositionResult();`
**Description:** CompositionResult representing the complete output of content composition.

/

import { cloneDeep } from '@CoreUtilsLib';

/**
Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/core/CompositionResult.js
 * @description CompositionResult representing the complete output of content composition.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.
 * @class
 */
```

<br>

## CLASS: BlockResult
**File Path:** `ComposableContentLib/src/core/BlockResult.js`
**Constructor Usage:** `const instance = new BlockResult();`
**Description:** BlockResult representing the output of block evaluation.

/

import { cloneDeep, Result } from '@CoreUtilsLib';

/**
Immutable data transfer object representing the outcome of a block rendering execution.
Extends the shared {@link Result} base for the success/error contract.
Encapsulates generated content, visibility state, errors, and profiling metrics.
@class
@example
const result = new BlockResult({
  instanceId: 'header-001',
  blockType: 'email_header',
  content: '<div class="header">...</div>',
  isVisible: true
});

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/core/BlockResult.js
 * @description BlockResult representing the output of block evaluation.
 * @version 1.0.0
 */

import { cloneDeep, Result } from '@CoreUtilsLib';

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

<br>

## CLASS: BlockDefinition
**File Path:** `ComposableContentLib/src/core/BlockDefinition.js`
**Constructor Usage:** `const instance = new BlockDefinition();`
**Description:** BlockDefinition for declarative block type definitions.

/

import { cloneDeep } from '@CoreUtilsLib';
import {
  EmptyBehavior,
  ContainerType,
  OutputFormat,
  isValidEmptyBehavior,
  isValidContainerType,
  isValidOutputFormat
} from './EmptyBehavior.js';

/**
Immutable blueprint for a reusable content block type.
Specifies rendering capabilities, context data dependencies, structural containment, and fallback behaviors.
@class
@example
const headerBlock = new BlockDefinition({
  id: 'email_header',
  name: 'Email Header',
  dataRequirements: ['recipient', 'subject'],
  supportedFormats: ['html', 'text'],
  emptyBehavior: EmptyBehavior.HIDE
});

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/core/BlockDefinition.js
 * @description BlockDefinition for declarative block type definitions.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import {
  EmptyBehavior,
  ContainerType,
  OutputFormat,
  isValidEmptyBehavior,
  isValidContainerType,
  isValidOutputFormat
} from './EmptyBehavior.js';

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

<br>

## CLASS: ContentComposer
**File Path:** `ComposableContentLib/src/composition/ContentComposer.js`
**Constructor Usage:** `const instance = new ContentComposer();`
**Description:** Main composition engine for assembling content from blocks.

/

import { CompositionRecipe } from './CompositionRecipe.js';
import { CompositionResult } from '../core/CompositionResult.js';
import { BlockResult } from '../core/BlockResult.js';
import { BlockDataContext } from '../data/BlockDataContext.js';
import { VisibilityEvaluator } from '../internal/VisibilityEvaluator.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
Central orchestration engine for content block resolution and rendering.
Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.
@class
@example
const composer = new ContentComposer({ blockRegistry, rendererRegistry });
const result = composer.compose(recipe, { user: { name: 'Alice' } });

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/composition/ContentComposer.js
 * @description Main composition engine for assembling content from blocks.
 * @version 1.0.0
 */

import { CompositionRecipe } from './CompositionRecipe.js';
import { CompositionResult } from '../core/CompositionResult.js';
import { BlockResult } from '../core/BlockResult.js';
import { BlockDataContext } from '../data/BlockDataContext.js';
import { VisibilityEvaluator } from '../internal/VisibilityEvaluator.js';
import { BlockNotFoundError } from '../errors/ComposableContentError.js';

/**
 * @description Central orchestration engine for content block resolution and rendering.
 * Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.
 * @class
 * @example
 * const composer = new ContentComposer({ blockRegistry, rendererRegistry });
 * const result = composer.compose(recipe, { user: { name: 'Alice' } });
 */
```

<br>

## CLASS: CompositionRecipe
**File Path:** `ComposableContentLib/src/composition/CompositionRecipe.js`
**Constructor Usage:** `const instance = new CompositionRecipe();`
**Description:** CompositionRecipe for defining content composition.

/

import { cloneDeep } from '@CoreUtilsLib';
import { OutputFormat, isValidOutputFormat } from '../core/EmptyBehavior.js';
import { RecipeValidationError } from '../errors/ComposableContentError.js';

/**
BlockInstance - Configuration for a block instance within a recipe.

@typedef {Object} BlockInstance
@property {string} instanceId - Unique instance identifier
@property {string} blockType - Block type ID from registry
@property {string} [visibility='always'] - Visibility expression
@property {number} [order=0] - Display order
@property {Object} [config={}] - Block-specific configuration
/

/**
Immutable model for multi-block content composition.
Defines block selection, execution order, visibility logic, and serialization metadata.
@class
@example
const recipe = new CompositionRecipe({
  id: 'welcome_email',
  name: 'Welcome Email',
  outputFormat: 'html',
  blocks: [
    { instanceId: 'header', blockType: 'email_header', order: 1 },
    { instanceId: 'greeting', blockType: 'greeting_block', order: 2 }
  ]
});

### Raw JSDoc Context:
```javascript
/**
 * @file ComposableContentLib/src/composition/CompositionRecipe.js
 * @description CompositionRecipe for defining content composition.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import { OutputFormat, isValidOutputFormat } from '../core/EmptyBehavior.js';
import { RecipeValidationError } from '../errors/ComposableContentError.js';

/**
 * BlockInstance - Configuration for a block instance within a recipe.
 *
 * @typedef {Object} BlockInstance
 * @property {string} instanceId - Unique instance identifier
 * @property {string} blockType - Block type ID from registry
 * @property {string} [visibility='always'] - Visibility expression
 * @property {number} [order=0] - Display order
 * @property {Object} [config={}] - Block-specific configuration
 */

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

<br>

