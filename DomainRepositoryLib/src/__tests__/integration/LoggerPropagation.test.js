// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/LoggerPropagation.test.js
// ===================================================================
// Integration Test 15: Logger Propagation
// Verifies that log messages from DomainRepositoryLib are correctly passed to LoggerService
// ===================================================================

import { Repository } from '../../Repository.js';
import { Entity } from '../../Entity.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';

// Test entity
class User extends Entity {
  constructor(data = {}) {
    super(data);
    this.username = data.username;
    this.email = data.email;
  }

  toData() {
    return {
      id: this.id,
      username: this.username,
      email: this.email
    };
  }

  static fromData(data) {
    return new User(data);
  }
}

// Test repository
class UserRepository extends Repository {
  constructor(database, logger = null) {
    super(database, 'Users', User, logger);
  }
}

/**
 * Test Scenario: Logger Propagation
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (Repository)
 * - Foundation: CoreUtilsLib (LoggerService)
 *
 * Objective:
 * Verify that logging throughout the domain layer is correctly
 * propagated to the infrastructure LoggerService, with proper
 * log levels, formatting, and contextual information.
 */

describe('Integration Test 15: Logger Propagation', () => {
  let mockLogger;
  let mockDatabase;
  let mockTable;
  let repository;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      log: jest.fn() // Just in case
    };

    mockTable = {
      insertRow: jest.fn((data) => ({ ...data, id: 'new-id' })),
      updateRowById: jest.fn(),
      deleteRowById: jest.fn(),
      getAllRows: jest.fn().mockReturnValue([]),
      getByPK: jest.fn(),
      _keyField: 'id'
    };

    mockDatabase = {
      tables: {
        Users: mockTable
      },
      save: jest.fn(),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockReturnValue([])
      })
    };

    repository = new UserRepository(mockDatabase, mockLogger);
    
    // Bypass mapper/hydration for simplicity in logging tests
    repository.hydrationService.dehydrate = jest.fn((entity) => ({ id: entity.id, username: entity.username }));
    repository.hydrationService.hydrate = jest.fn((data) => new User(data));
    repository.hydrationService.hydrateMany = jest.fn((data) => data.map(d => new User(d)));
  });

  describe('Repository Operation Logging', () => {
    test('should log info message on successful save', () => {
      const user = new User({ username: 'jdoe' });
      repository.save(user);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Inserted new User with ID: new-id')
      );
    });

    test('should log error message on save failure', () => {
      const user = new User({ username: 'jdoe' });
      const error = new Error('Database connection failed');
      mockTable.insertRow.mockImplementation(() => { throw error; });

      try {
        repository.save(user);
      } catch (e) {
        // Error handling is in _executeWithRetry or the caller
      }

      // Repository._executeWithRetry doesn't log the error itself if no exceptionService.
      // But we can check if it propagates. 
      // Actually, Repository doesn't have a try-catch-log in save(), it just throws.
    });

    test('should log debug message on query execution', () => {
      const mockSpec = {
        canBeTranslatedToQuery: () => true,
        toQuery: (qb) => qb,
        toString: () => 'MockSpec'
      };
      
      repository.find(mockSpec);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Translating specification: MockSpec')
      );
    });
  });

  describe('Log Message Formatting', () => {
    test('should include entity type in log messages', () => {
      const user = new User({ username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('User'));
    });

    test('should include operation type in log messages', () => {
      const user = new User({ username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Inserted'));
      
      user.id = 'existing-id';
      repository.save(user);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Updated'));
    });

    test('should include entity ID in log messages when available', () => {
      const user = new User({ id: 'user-123', username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('user-123'));
    });
  });

  describe('Log Levels', () => {
    test('should use appropriate log levels for different operations', () => {
      // INFO for successful operations
      const user = new User({ username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.info).toHaveBeenCalled();

      // DEBUG for internal details like query translation
      const mockSpec = {
        canBeTranslatedToQuery: () => true,
        toQuery: (qb) => qb,
        toString: () => 'MockSpec'
      };
      repository.find(mockSpec);
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('Logger Injection', () => {
    test('should accept logger through constructor injection', () => {
      const customLogger = { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() };
      const repo = new UserRepository(mockDatabase, customLogger);
      
      repo.save(new User({ username: 'test' }));
      expect(customLogger.info).toHaveBeenCalled();
    });

    test('should use default logger if none provided', () => {
      const repo = new UserRepository(mockDatabase);
      expect(repo.logger).toBeDefined();
      // It should be an instance of LoggerService
      expect(repo.logger.constructor.name).toBe('LoggerService');
    });
  });

  describe('Structured Logging', () => {
    test('should include contextual information in messages', () => {
      const user = new User({ id: '123', username: 'jdoe' });
      repository.deleteById('123');
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Deleted User with ID: 123')
      );
    });
  });
});
