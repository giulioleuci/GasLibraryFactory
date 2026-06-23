/**
 * @file ComposableContentLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for ComposableContentLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity Jest mock for ContentBlock implementations.
 * @class
 */
export class ContentBlockMock {
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
export class BlockRegistryMock {
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
export class RendererRegistryMock {
  /**
   * Initializes mock with internal storage and Jest spy functions.
   */
  constructor() {
    this._renderers = new Map();
    this.registerRenderer = jest.fn((format, renderer) => {
      this._renderers.set(format, renderer);
      return this;
    });
    this.getRenderer = jest.fn((format) => this._renderers.get(format));
    this.hasRenderer = jest.fn((format) => this._renderers.has(format));
  }
}

