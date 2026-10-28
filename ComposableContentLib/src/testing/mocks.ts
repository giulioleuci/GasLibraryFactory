/**
 * @file ComposableContentLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for ComposableContentLib services.
 * @version 1.0.0
 */

import type { Mock } from 'jest-mock';
declare const jest: Pick<typeof import('jest-mock'), 'fn'>;

interface MockRegistration<Definition extends { id: string }> {
  definition: Definition;
  [key: string]: unknown;
}

/**
 * High-fidelity Jest mock for ContentBlock implementations.
 * @class
 */
export class ContentBlockMock {
  declare typeId: string;
  declare getTypeId: Mock<() => string>;
  declare execute: Mock<
    (context: { getOutputFormat(): string }) => {
      success: boolean;
      content: string;
      format: string;
      metadata: object;
    }
  >;
  declare isVisible: Mock<() => boolean>;
  declare validateConfig: Mock<() => { valid: boolean }>;
  /**
   * Initializes mock with default type ID and Jest spy functions.
   * @param {string} [typeId='mock_block'] Mock block type identifier.
   */
  constructor(typeId = 'mock_block') {
    this.typeId = typeId;
    this.getTypeId = jest.fn(() => this.typeId);
    this.execute = jest.fn((context: { getOutputFormat(): string }) => ({
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
export class BlockRegistryMock<Definition extends { id: string } = { id: string; name?: string }> {
  declare _blocks: Map<string, MockRegistration<Definition>>;
  declare register: Mock<(registration: MockRegistration<Definition>) => Definition>;
  declare get: Mock<(id: string) => MockRegistration<Definition> | undefined>;
  declare has: Mock<(id: string) => boolean>;
  declare getBlockTypes: Mock<() => string[]>;
  declare size: Mock<() => number>;
  /**
   * Initializes mock with internal storage and Jest spy functions.
   */
  constructor() {
    this._blocks = new Map();
    this.register = jest.fn((registration: MockRegistration<Definition>) => {
      const id = registration.definition.id;
      this._blocks.set(id, registration);
      return registration.definition;
    });
    this.get = jest.fn((id: string) => this._blocks.get(id));
    this.has = jest.fn((id: string) => this._blocks.has(id));
    this.getBlockTypes = jest.fn(() => Array.from(this._blocks.keys()));
    this.size = jest.fn(() => this._blocks.size);
  }
}
