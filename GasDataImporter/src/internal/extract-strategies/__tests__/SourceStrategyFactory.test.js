/**
 * @fileoverview Tests for SourceStrategyFactory
 * @author GasLibraryFactory
 */

import { SourceStrategy } from '../SourceStrategy.js';
import { SourceError } from '../../errors/SourceError.js';

// Mock the strategy imports before importing the factory
jest.mock('../SheetByIdStrategy.js', () => {
  const { SourceStrategy } = require('../SourceStrategy.js');

  class MockSheetByIdStrategy extends SourceStrategy {
    constructor(logger, spreadsheetService) {
      super(logger);
      this._spreadsheetService = spreadsheetService;
    }
    _extractData(config) {
      return [{ data: 'from sheet' }];
    }
  }

  return { SheetByIdStrategy: MockSheetByIdStrategy };
});

jest.mock('../FolderStrategy.js', () => {
  const { SourceStrategy } = require('../SourceStrategy.js');

  class MockFolderStrategy extends SourceStrategy {
    constructor(logger, driveService) {
      super(logger);
      this._driveService = driveService;
    }
    _extractData(config) {
      return [{ data: 'from folder' }];
    }
  }

  return { FolderStrategy: MockFolderStrategy };
});

import { SourceStrategyFactory } from '../SourceStrategyFactory.js';
import { SheetByIdStrategy } from '../SheetByIdStrategy.js';
import { FolderStrategy } from '../FolderStrategy.js';

// Use the mocked classes
const MockSheetByIdStrategy = SheetByIdStrategy;
const MockFolderStrategy = FolderStrategy;

// Custom test strategy
class CustomTestStrategy extends SourceStrategy {
  constructor(logger, customDeps) {
    super(logger);
    this._customDeps = customDeps;
  }
  _extractData(config) {
    return [{ data: 'custom' }];
  }
}

describe('SourceStrategyFactory - Comprehensive Test Suite', () => {
  let mockLogger;
  let mockDriveService;
  let mockSpreadsheetService;
  let factory;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    mockDriveService = {
      getFile: jest.fn(),
      listFiles: jest.fn()
    };

    mockSpreadsheetService = {
      getRanges: jest.fn(),
      getSpreadsheetMetadata: jest.fn()
    };

    factory = new SourceStrategyFactory(mockLogger, mockDriveService, mockSpreadsheetService);
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with all dependencies', () => {
      expect(factory).toBeInstanceOf(SourceStrategyFactory);
      expect(factory.logger).toBe(mockLogger);
      expect(factory._driveService).toBe(mockDriveService);
      expect(factory._spreadsheetService).toBe(mockSpreadsheetService);
    });

    it('should initialize strategies map', () => {
      expect(factory._strategies).toBeInstanceOf(Map);
    });

    it('should register built-in strategies on construction', () => {
      expect(factory.hasStrategy('SheetById')).toBe(true);
      expect(factory.hasStrategy('Folder')).toBe(true);
    });

    it('should have exactly 2 built-in strategies registered', () => {
      expect(factory.getAvailableStrategies()).toHaveLength(2);
      expect(factory.getAvailableStrategies()).toContain('SheetById');
      expect(factory.getAvailableStrategies()).toContain('Folder');
    });
  });

  // ===================================================================
  // registerStrategy() Method Tests
  // ===================================================================
  describe('registerStrategy() Method', () => {
    it('should register custom strategy successfully', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);

      expect(factory.hasStrategy('CustomSource')).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SourceStrategyFactory] Registered strategy: CustomSource'
      );
    });

    it('should throw SourceError for empty strategy name', () => {
      expect(() => {
        factory.registerStrategy('', CustomTestStrategy);
      }).toThrow(SourceError);

      expect(() => {
        factory.registerStrategy('', CustomTestStrategy);
      }).toThrow('Strategy name must be a non-empty string');
    });

    it('should throw SourceError for null strategy name', () => {
      expect(() => {
        factory.registerStrategy(null, CustomTestStrategy);
      }).toThrow(SourceError);

      expect(() => {
        factory.registerStrategy(null, CustomTestStrategy);
      }).toThrow('Strategy name must be a non-empty string');
    });

    it('should throw SourceError for undefined strategy name', () => {
      expect(() => {
        factory.registerStrategy(undefined, CustomTestStrategy);
      }).toThrow(SourceError);
    });

    it('should throw SourceError for non-string strategy name', () => {
      expect(() => {
        factory.registerStrategy(123, CustomTestStrategy);
      }).toThrow(SourceError);

      expect(() => {
        factory.registerStrategy({ name: 'test' }, CustomTestStrategy);
      }).toThrow('Strategy name must be a non-empty string');
    });

    it('should throw SourceError for non-function strategy class', () => {
      expect(() => {
        factory.registerStrategy('BadStrategy', 'not a function');
      }).toThrow(SourceError);

      expect(() => {
        factory.registerStrategy('BadStrategy', 'not a function');
      }).toThrow('Strategy must be a class constructor');
    });

    it('should throw SourceError for null strategy class', () => {
      expect(() => {
        factory.registerStrategy('BadStrategy', null);
      }).toThrow(SourceError);
    });

    it('should throw SourceError for object instead of class', () => {
      expect(() => {
        factory.registerStrategy('BadStrategy', {});
      }).toThrow('Strategy must be a class constructor');
    });

    it('should include strategy name in error context for invalid class', () => {
      try {
        factory.registerStrategy('TestName', 123);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.code).toBe('INVALID_STRATEGY_CLASS');
        expect(error.context).toEqual({ name: 'TestName' });
      }
    });

    it('should warn when overwriting existing strategy', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);
      mockLogger.warn.mockClear();

      factory.registerStrategy('CustomSource', CustomTestStrategy);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[SourceStrategyFactory] Overwriting existing strategy: CustomSource'
      );
    });

    it('should allow overwriting built-in strategies', () => {
      factory.registerStrategy('SheetById', CustomTestStrategy);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[SourceStrategyFactory] Overwriting existing strategy: SheetById'
      );
      expect(factory.hasStrategy('SheetById')).toBe(true);
    });

    it('should accept arrow function as strategy class', () => {
      const ArrowStrategy = (logger) => ({ logger });

      expect(() => {
        factory.registerStrategy('ArrowStrategy', ArrowStrategy);
      }).not.toThrow();
    });
  });

  // ===================================================================
  // createStrategy() Method Tests
  // ===================================================================
  describe('createStrategy() Method', () => {
    it('should create SheetById strategy instance', () => {
      const strategy = factory.createStrategy('SheetById');

      expect(strategy).toBeInstanceOf(MockSheetByIdStrategy);
      expect(strategy._spreadsheetService).toBe(mockSpreadsheetService);
      expect(strategy.logger).toBe(mockLogger);
    });

    it('should create Folder strategy instance', () => {
      const strategy = factory.createStrategy('Folder');

      expect(strategy).toBeInstanceOf(MockFolderStrategy);
      expect(strategy._driveService).toBe(mockDriveService);
      expect(strategy.logger).toBe(mockLogger);
    });

    it('should create custom strategy with dependencies', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);
      const customDeps = { apiKey: 'test123' };

      const strategy = factory.createStrategy('CustomSource', customDeps);

      expect(strategy).toBeInstanceOf(CustomTestStrategy);
      expect(strategy._customDeps).toEqual(customDeps);
    });

    it('should throw SourceError for unknown strategy type', () => {
      expect(() => {
        factory.createStrategy('UnknownType');
      }).toThrow(SourceError);

      expect(() => {
        factory.createStrategy('UnknownType');
      }).toThrow('Unknown source strategy type: UnknownType');
    });

    it('should include available types in error message', () => {
      try {
        factory.createStrategy('BadType');
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Available types:');
        expect(error.message).toContain('SheetById');
        expect(error.message).toContain('Folder');
      }
    });

    it('should include type and available types in error context', () => {
      try {
        factory.createStrategy('BadType');
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error.code).toBe('UNKNOWN_STRATEGY_TYPE');
        expect(error.context).toHaveProperty('type', 'BadType');
        expect(error.context).toHaveProperty('availableTypes');
        expect(error.context.availableTypes).toContain('SheetById');
        expect(error.context.availableTypes).toContain('Folder');
      }
    });

    it('should handle strategy constructor errors', () => {
      class FailingStrategy extends SourceStrategy {
        constructor(logger) {
          super(logger);
          throw new Error('Constructor failed');
        }
        _extractData(config) {
          return [];
        }
      }

      factory.registerStrategy('FailingStrategy', FailingStrategy);

      expect(() => {
        factory.createStrategy('FailingStrategy');
      }).toThrow(SourceError);
    });

    it('should wrap constructor errors with context', () => {
      class FailingStrategy extends SourceStrategy {
        constructor(logger) {
          super(logger);
          throw new Error('Initialization error');
        }
        _extractData(config) {
          return [];
        }
      }

      factory.registerStrategy('FailingStrategy', FailingStrategy);

      try {
        factory.createStrategy('FailingStrategy');
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Initialization error');
        expect(error.code).toBe('STRATEGY_CREATION_FAILED');
        expect(error.context).toHaveProperty('type', 'FailingStrategy');
        expect(error.context).toHaveProperty('originalError', 'Initialization error');
      }
    });

    it('should log error when strategy creation fails', () => {
      class FailingStrategy extends SourceStrategy {
        constructor(logger) {
          super(logger);
          throw new Error('Failed');
        }
        _extractData(config) {
          return [];
        }
      }

      factory.registerStrategy('FailingStrategy', FailingStrategy);

      try {
        factory.createStrategy('FailingStrategy');
      } catch (error) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[SourceStrategyFactory] Failed to create strategy "FailingStrategy": Failed'
      );
    });

    it('should use empty object as default dependencies', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);

      const strategy = factory.createStrategy('CustomSource');

      expect(strategy._customDeps).toEqual({});
    });

    it('should handle custom dependencies object', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);
      const deps = { key1: 'value1', key2: 'value2' };

      const strategy = factory.createStrategy('CustomSource', deps);

      expect(strategy._customDeps).toEqual(deps);
    });
  });

  // ===================================================================
  // hasStrategy() Method Tests
  // ===================================================================
  describe('hasStrategy() Method', () => {
    it('should return true for registered built-in strategies', () => {
      expect(factory.hasStrategy('SheetById')).toBe(true);
      expect(factory.hasStrategy('Folder')).toBe(true);
    });

    it('should return false for unregistered strategies', () => {
      expect(factory.hasStrategy('UnknownStrategy')).toBe(false);
      expect(factory.hasStrategy('CustomSource')).toBe(false);
    });

    it('should return true after registering custom strategy', () => {
      expect(factory.hasStrategy('CustomSource')).toBe(false);

      factory.registerStrategy('CustomSource', CustomTestStrategy);

      expect(factory.hasStrategy('CustomSource')).toBe(true);
    });

    it('should be case-sensitive', () => {
      expect(factory.hasStrategy('sheetbyid')).toBe(false);
      expect(factory.hasStrategy('SHEETBYID')).toBe(false);
      expect(factory.hasStrategy('SheetById')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(factory.hasStrategy('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(factory.hasStrategy(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(factory.hasStrategy(undefined)).toBe(false);
    });
  });

  // ===================================================================
  // getAvailableStrategies() Method Tests
  // ===================================================================
  describe('getAvailableStrategies() Method', () => {
    it('should return array of built-in strategy names', () => {
      const strategies = factory.getAvailableStrategies();

      expect(strategies).toBeInstanceOf(Array);
      expect(strategies).toHaveLength(2);
      expect(strategies).toContain('SheetById');
      expect(strategies).toContain('Folder');
    });

    it('should include custom strategies after registration', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);

      const strategies = factory.getAvailableStrategies();

      expect(strategies).toHaveLength(3);
      expect(strategies).toContain('SheetById');
      expect(strategies).toContain('Folder');
      expect(strategies).toContain('CustomSource');
    });

    it('should return array that can be modified without affecting factory', () => {
      const strategies = factory.getAvailableStrategies();
      strategies.push('NewStrategy');

      const strategiesAgain = factory.getAvailableStrategies();

      expect(strategiesAgain).toHaveLength(2);
      expect(strategiesAgain).not.toContain('NewStrategy');
    });

    it('should return updated list after overwriting strategy', () => {
      factory.registerStrategy('SheetById', CustomTestStrategy);

      const strategies = factory.getAvailableStrategies();

      expect(strategies).toHaveLength(2);
      expect(strategies).toContain('SheetById');
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should support complete workflow: register and create', () => {
      factory.registerStrategy('CustomSource', CustomTestStrategy);

      expect(factory.hasStrategy('CustomSource')).toBe(true);

      const strategy = factory.createStrategy('CustomSource', { test: 'deps' });

      expect(strategy).toBeInstanceOf(CustomTestStrategy);
    });

    it('should maintain separate instances for multiple creations', () => {
      const strategy1 = factory.createStrategy('SheetById');
      const strategy2 = factory.createStrategy('SheetById');

      expect(strategy1).not.toBe(strategy2);
      expect(strategy1).toBeInstanceOf(MockSheetByIdStrategy);
      expect(strategy2).toBeInstanceOf(MockSheetByIdStrategy);
    });

    it('should support multiple custom strategies', () => {
      class CustomStrategy1 extends SourceStrategy {
        _extractData() {
          return [];
        }
      }
      class CustomStrategy2 extends SourceStrategy {
        _extractData() {
          return [];
        }
      }

      factory.registerStrategy('Custom1', CustomStrategy1);
      factory.registerStrategy('Custom2', CustomStrategy2);

      expect(factory.getAvailableStrategies()).toHaveLength(4);
      expect(factory.createStrategy('Custom1')).toBeInstanceOf(CustomStrategy1);
      expect(factory.createStrategy('Custom2')).toBeInstanceOf(CustomStrategy2);
    });

    it('should handle real-world usage scenario', () => {
      // Simulate application setup
      const appFactory = new SourceStrategyFactory(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService
      );

      // Register custom API strategy
      class ApiStrategy extends SourceStrategy {
        constructor(logger, deps) {
          super(logger);
          this.apiService = deps.apiService;
        }
        _extractData(config) {
          return this.apiService.fetch(config.endpoint);
        }
      }

      appFactory.registerStrategy('ApiSource', ApiStrategy);

      // Create strategies as needed
      const sheetStrategy = appFactory.createStrategy('SheetById');
      const folderStrategy = appFactory.createStrategy('Folder');
      const apiStrategy = appFactory.createStrategy('ApiSource', {
        apiService: { fetch: () => [{ data: 'api' }] }
      });

      expect(sheetStrategy).toBeInstanceOf(MockSheetByIdStrategy);
      expect(folderStrategy).toBeInstanceOf(MockFolderStrategy);
      expect(apiStrategy).toBeInstanceOf(ApiStrategy);
      expect(appFactory.getAvailableStrategies()).toHaveLength(3);
    });
  });
});
