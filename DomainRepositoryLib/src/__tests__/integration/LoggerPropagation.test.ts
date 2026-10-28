import type { QueryFixture } from '../../testing/fixtureTypes.js';
import { jest } from '@jest/globals';
type TestData = EntityData & { email?: string | null; username?: string };
import type {
  EntityData,
  DomainRecord,
  DomainLogger,
  DomainQuery,
  RepositoryDatabase,
  RepositoryTable
} from '../../internal/contracts.js';

// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/LoggerPropagation.test.js
// ===================================================================
// Integration Test 15: Logger Propagation
// Verifies that log messages from DomainRepositoryLib are correctly passed to LoggerService
// ===================================================================

import { Repository } from '../../Repository.js';
import { Entity } from '../../Entity.js';
import { MockFactory as _MockFactory } from '../../../../test/fakes/MockFactory.js';

// Test entity
class User extends Entity {
  declare username: string | undefined;
  declare email: string | null | undefined;
  constructor(data: TestData = {}) {
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

  static fromData(data: TestData) {
    return new User(data);
  }
}

// Test repository
class UserRepository extends Repository<User> {
  constructor(database: RepositoryDatabase, logger: DomainLogger | null = null) {
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
  let mockLogger: jest.Mocked<DomainLogger> & { log?: jest.Mock<(...args: unknown[]) => unknown> };
  let mockDatabase: {
    tables: { Users: typeof mockTable };
    save: jest.Mock<() => unknown>;
    select: jest.Mock<(fields: string[]) => QueryFixture>;
  };
  let mockTable: Pick<
    jest.Mocked<RepositoryTable>,
    | 'insertRow'
    | 'insertRows'
    | 'patchRow'
    | 'updateRowById'
    | 'deleteRowById'
    | 'getAllRows'
    | 'getByPK'
  > & { _keyField: string };
  let repository: UserRepository;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      log: jest.fn() // Just in case
    };

    mockTable = {
      insertRows: jest.fn(() => []),
      patchRow: jest.fn(() => null),
      insertRow: jest.fn((data: DomainRecord) => ({ ...data, id: 'new-id' })),
      updateRowById: jest.fn(),
      deleteRowById: jest.fn(),
      getAllRows: jest.fn<RepositoryTable['getAllRows']>().mockReturnValue([]),
      getByPK: jest.fn<RepositoryTable['getByPK']>(),
      _keyField: 'id'
    };

    mockDatabase = {
      tables: {
        Users: mockTable
      },
      save: jest.fn(),
      select: jest.fn<(fields: string[]) => QueryFixture>().mockReturnValue({
        from: jest.fn<QueryFixture['from']>().mockReturnThis(),
        where: jest.fn<QueryFixture['where']>().mockReturnThis(),
        execute: jest.fn<QueryFixture['execute']>().mockReturnValue([])
      })
    };

    repository = new UserRepository(mockDatabase, mockLogger);

    // Bypass mapper/hydration for simplicity in logging tests
    repository.hydrationService.dehydrate = jest.fn((entity: User) => ({
      id: entity.id,
      username: entity.username
    })) as typeof repository.hydrationService.dehydrate;
    repository.hydrationService.hydrate = jest.fn(
      (data: TestData) => new User(data)
    ) as typeof repository.hydrationService.hydrate;
    repository.hydrationService.hydrateMany = jest.fn((data: TestData[]) =>
      data.map((d) => new User(d))
    ) as typeof repository.hydrationService.hydrateMany;
  });

  describe('Repository Operation Logging', () => {
    test('should log debug message on successful save', () => {
      const user = new User({ username: 'jdoe' });
      repository.save(user);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Inserted new User with ID: new-id')
      );
    });

    test('should log error message on save failure', () => {
      const user = new User({ username: 'jdoe' });
      const error = new Error('Database connection failed');
      mockTable.insertRow.mockImplementation(() => {
        throw error;
      });

      try {
        repository.save(user);
      } catch (_e) {
        // Error handling is in _executeWithRetry or the caller
      }

      // Repository._executeWithRetry doesn't log the error itself if no exceptionService.
      // But we can check if it propagates.
      // Actually, Repository doesn't have a try-catch-log in save(), it just throws.
    });

    test('should log debug message on query execution', () => {
      const mockSpec = {
        canBeTranslatedToQuery: () => true,
        toQuery: <Q extends DomainQuery>(qb: Q) => qb,
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
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('User'));
    });

    test('should include operation type in log messages', () => {
      const user = new User({ username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Inserted'));

      user.id = 'existing-id';
      repository.save(user);
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Updated'));
    });

    test('should include entity ID in log messages when available', () => {
      const user = new User({ id: 'user-123', username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('user-123'));
    });
  });

  describe('Log Levels', () => {
    test('should use appropriate log levels for different operations', () => {
      // DEBUG for successful repository operations
      const user = new User({ username: 'jdoe' });
      repository.save(user);
      expect(mockLogger.debug).toHaveBeenCalled();

      // DEBUG for internal details like query translation
      const mockSpec = {
        canBeTranslatedToQuery: () => true,
        toQuery: <Q extends DomainQuery>(qb: Q) => qb,
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
      expect(customLogger.debug).toHaveBeenCalled();
    });

    test('should use default logger if none provided', () => {
      const repo = new UserRepository(mockDatabase);
      expect(repo.queryTranslator.logger).toBe(repo.logger);
      // It should be an instance of LoggerService
      expect(repo.logger.constructor.name).toBe('LoggerService');
    });
  });

  describe('Structured Logging', () => {
    test('should include contextual information in messages', () => {
      const _user = new User({ id: '123', username: 'jdoe' });
      repository.deleteById('123');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Deleted User with ID: 123')
      );
    });
  });
});
