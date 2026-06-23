# ComposableContentLib

**Version:** 1.0.0  
**Layer:** Domain Logic (Layer 2)  
**Dependencies:** CoreUtilsLib

## 🧩 Overview

**ComposableContentLib** is a flexible engine for dynamic content generation and rendering in Google Apps Script. It allows developers to build complex documents, emails, or messages by composing smaller, reusable "Content Blocks" according to declarative "Composition Recipes."

The library handles the orchestration of block evaluation, visibility rules (e.g., "only show this block if the user is an admin"), and format-specific rendering, ensuring a strict separation between data, logic, and presentation.

## 🏗️ File and Folder Structure

A highly structured architecture focused on the composition lifecycle:

```text
ComposableContentLib/
├── src/
│   ├── composition/        # Orchestration layer
│   │   ├── ContentComposer.js # The main engine for assembling blocks
│   │   ├── CompositionRecipe.js # Parser and validator for recipes
│   │   └── VisibilityEvaluator.js # Evaluates whether a block should be shown
│   ├── core/               # Domain primitives
│   │   ├── ContentBlock.js    # Abstract base for all content units
│   │   ├── BlockDefinition.js # Metadata and capabilities of a block type
│   │   ├── BlockResult.js     # Output of a single block's evaluation
│   │   └── CompositionResult.js # The final aggregated content and metadata
│   ├── data/               # Context management
│   │   └── BlockDataContext.js # Shared data container for block evaluation
│   ├── registry/           # Extensibility points
│   │   ├── BlockRegistry.js   # Catalog of available block types
│   │   └── RendererRegistry.js # Catalog of output format renderers
│   ├── rendering/          # Presentation layer
│   │   └── BlockRenderer.js   # Base interface for format-specific rendering
│   └── errors/             # Domain exceptions
```

## 🧩 Programming Patterns

1.  **Composite Pattern**: The core concept of the library. Content is composed of blocks, which can themselves be composed of other blocks, forming a tree structure that is flattened during assembly.
2.  **Strategy Pattern**: `BlockRenderer` and `VisibilityEvaluator` use interchangeable strategies to handle different output formats (HTML, Markdown, Text) and visibility logic.
3.  **Registry Pattern**: `BlockRegistry` and `RendererRegistry` allow for a "plugin-like" architecture where new block types and output formats can be added without modifying the core composer.
4.  **Template Method Pattern**: The `ContentBlock` base class defines the evaluation lifecycle, while subclasses implement specific logic for data extraction and template selection.
5.  **Recipe Pattern**: The entire composition is driven by a declarative JSON "recipe," decoupling the structure of the content from the code that generates it.
6.  **Facade Pattern**: `ContentComposer` provides a single `.compose()` method that orchestrates the entire complex process of evaluation, filtering, and rendering.

## 🚀 Quick Start

### 1. Define a Block

```javascript
import { ContentBlock } from '@ComposableContentLib';

class GreetingBlock extends ContentBlock {
  getData(context) {
    return { name: context.get('user.name') || 'Guest' };
  }

  isEmpty(data) {
    return false;
  }

  getTemplateId(format) {
    return `greeting_${format}`;
  }
}
```

### 2. Register Components

```javascript
import { ContentComposer, BlockRegistry, RendererRegistry } from '@ComposableContentLib';

const blockRegistry = new BlockRegistry();
blockRegistry.register({
  definition: { id: 'greeting', name: 'User Greeting' },
  factory: (def, config) => new GreetingBlock(def, config)
});

const rendererRegistry = new RendererRegistry();
rendererRegistry.register('html', new HtmlRenderer());

const composer = new ContentComposer({ blockRegistry, rendererRegistry });
```

### 3. Compose Content

```javascript
const recipe = {
  id: 'welcome_email',
  outputFormat: 'html',
  blocks: [
    { type: 'greeting', instanceId: 'hdr_1' },
    { 
      type: 'promo', 
      instanceId: 'p_1',
      visibility: { condition: '{{user.isNew}} == true' }
    }
  ]
};

const result = composer.compose(recipe, { user: { name: 'Alice', isNew: true } });
console.log(result.content);
```

## 🧪 Testing

The library includes comprehensive unit tests for the composition logic and registry management.

```bash
npm test ComposableContentLib
```
