// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/SpecificationQueryTranslation.test.js
// ===================================================================
// Integration Test 3: Specification-Query Translation
// Verifies that Specifications are correctly translated to SheetDBLib queries
// ===================================================================

import { Repository } from '../../Repository.js';
import { Entity } from '../../Entity.js';
import { FieldSpecification } from '../../specifications/FieldSpecification.js';
import { CompositeSpecification } from '../../specifications/CompositeSpecification.js';

/**
 * Test Scenario: Specification-Query Translation
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (Specification, QueryTranslator)
 * - Persistence: SheetDBLib (AdvancedQueryBuilder)
 *
 * Objective:
 * Verify that domain-level Specifications (FieldSpecification, CompositeSpecification)
 * are correctly translated into SheetDBLib query syntax with proper operators,
 * field names, and logical combinations (AND/OR).
 */

describe('Integration Test 3: Specification-Query Translation', () => {
  let mockSpreadsheetService;
  let mockCacheService;
  let mockLogger;
  let mockUtils;
  let databaseService;
  let repository;

  // Simple test entity
  class Product extends Entity {
    constructor(data = {}) {
      super(data);
      this.name = data.name || null;
      this.price = data.price || null;
      this.category = data.category || null;
      this.stock = data.stock || null;
      this.status = data.status || null;
    }

    toData() {
      return {
        id: this.id,
        name: this.name,
        price: this.price,
        category: this.category,
        stock: this.stock,
        status: this.status,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
      };
    }

    static fromData(data) {
      return new Product(data);
    }
  }

  class ProductRepository extends Repository {
    constructor(database, logger, cache) {
      super(database, 'Products', Product, logger, cache, null);
    }
  }

  beforeEach(() => {
    mockSpreadsheetService = global.mockSpreadsheetService();
    mockCacheService = global.mockCacheService();
    mockLogger = global.mockLoggerService();
    mockUtils = {
      sleep: jest.fn((ms) => {}),
      getUuid: jest.fn(() => `test-uuid-${Date.now()}`),
      parseDate: jest.fn((value) => {
        if (value instanceof Date) {
          return value;
        }
        if (typeof value === 'string') {
          return new Date(value);
        }
        return null;
      })
    };

    // Seed test data
    const testData = [
      {
        id: 'prod_1',
        name: 'Widget A',
        price: 10,
        category: 'electronics',
        stock: 100,
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'prod_2',
        name: 'Widget B',
        price: 25,
        category: 'electronics',
        stock: 50,
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'prod_3',
        name: 'Gadget C',
        price: 15,
        category: 'gadgets',
        stock: 75,
        status: 'inactive',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'prod_4',
        name: 'Tool D',
        price: 30,
        category: 'tools',
        stock: 20,
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'prod_5',
        name: 'Part E',
        price: 5,
        category: 'electronics',
        stock: 200,
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    // Create mock database service with in-memory data storage
    databaseService = {
      tables: {
        Products: {
          name: 'Products',
          columns: ['id', 'name', 'price', 'category', 'stock', 'status', 'createdAt', 'updatedAt'],
          getAllRows: jest.fn(() => testData),
          getByPK: jest.fn((id) => testData.find((row) => row.id === id) || null),
          insertRow: jest.fn((data) => {
            const newRow = { ...data, id: data.id || mockUtils.getUuid() };
            testData.push(newRow);
            return newRow;
          }),
          updateRowById: jest.fn((id, data) => {
            const index = testData.findIndex((row) => row.id === id);
            if (index >= 0) {
              testData[index] = { ...testData[index], ...data };
              return testData[index];
            }
            return null;
          }),
          deleteRowById: jest.fn((id) => {
            const index = testData.findIndex((row) => row.id === id);
            if (index >= 0) {
              testData.splice(index, 1);
              return true;
            }
            return false;
          }),
          _testData: testData // For test access
        }
      },
      select: jest.fn((columns) => {
        const andConditions = [];
        const orConditions = [];
        const mockQueryBuilder = {
          tableName: null,
          from: jest.fn((table) => {
            mockQueryBuilder.tableName = table;
            return mockQueryBuilder;
          }),
          where: jest.fn((field, operator, value) => {
            andConditions.push({ field, operator, value });
            return mockQueryBuilder;
          }),
          andWhere: jest.fn((field, operator, value) => {
            andConditions.push({ field, operator, value });
            return mockQueryBuilder;
          }),
          orWhere: jest.fn((field, operator, value) => {
            orConditions.push({ field, operator, value });
            return mockQueryBuilder;
          }),
          whereIn: jest.fn((field, values) => {
            andConditions.push({ field, operator: 'IN', value: values });
            return mockQueryBuilder;
          }),
          whereLike: jest.fn((field, pattern) => {
            andConditions.push({ field, operator: 'LIKE', value: pattern });
            return mockQueryBuilder;
          }),
          execute: jest.fn(() => {
            // Apply filtering based on conditions
            if (andConditions.length === 0 && orConditions.length === 0) {
              return testData;
            }

            return testData.filter((row) => {
              // All AND conditions must match
              const andMatch = andConditions.every((cond) => {
                const fieldValue = row[cond.field];
                switch (cond.operator) {
                  case '>':
                    return fieldValue > cond.value;
                  case '<':
                    return fieldValue < cond.value;
                  case '>=':
                    return fieldValue >= cond.value;
                  case '<=':
                    return fieldValue <= cond.value;
                  case '=':
                    return fieldValue == cond.value;
                  case '==':
                    return fieldValue == cond.value;
                  case '!=':
                    return fieldValue != cond.value;
                  case 'IN':
                    return Array.isArray(cond.value) && cond.value.includes(fieldValue);
                  case 'LIKE': {
                    if (typeof fieldValue !== 'string') {
                      return false;
                    }
                    // Convert SQL LIKE pattern to regex (% = .*)
                    const pattern = cond.value.replace(/%/g, '.*');
                    const regex = new RegExp(`^${pattern}$`, 'i');
                    return regex.test(fieldValue);
                  }
                  default:
                    return true;
                }
              });

              // If there are OR conditions, at least one must match
              const orMatch =
                orConditions.length === 0 ||
                orConditions.some((cond) => {
                  const fieldValue = row[cond.field];
                  switch (cond.operator) {
                    case '>':
                      return fieldValue > cond.value;
                    case '<':
                      return fieldValue < cond.value;
                    case '>=':
                      return fieldValue >= cond.value;
                    case '<=':
                      return fieldValue <= cond.value;
                    case '=':
                      return fieldValue == cond.value;
                    case '==':
                      return fieldValue == cond.value;
                    case '!=':
                      return fieldValue != cond.value;
                    case 'IN':
                      return Array.isArray(cond.value) && cond.value.includes(fieldValue);
                    case 'LIKE': {
                      if (typeof fieldValue !== 'string') {
                        return false;
                      }
                      const pattern = cond.value.replace(/%/g, '.*');
                      const regex = new RegExp(`^${pattern}$`, 'i');
                      return regex.test(fieldValue);
                    }
                    default:
                      return true;
                  }
                });

              // Logic: If only OR conditions, match any. If AND+OR, match (all AND) OR (any OR). If only AND, match all.
              if (andConditions.length === 0) {
                return orMatch;
              } else if (orConditions.length === 0) {
                return andMatch;
              } else {
                // Mixed: (all AND) OR (any OR)
                return andMatch || orMatch;
              }
            });
          })
        };
        return mockQueryBuilder;
      }),
      save: jest.fn(() => true), // Database save method
      _cache: mockCacheService,
      _logger: mockLogger,
      _utils: mockUtils
    };

    repository = new ProductRepository(databaseService, mockLogger, mockCacheService);
  });

  afterEach(() => {
    // Test data is recreated in beforeEach, no need to clear
    mockCacheService._clear();
  });

  describe('Simple Specifications', () => {
    test('should translate FieldSpecification with greaterThan to where clause', () => {
      // Arrange: Create FieldSpecification('price', '>', 18)
      const spec = new FieldSpecification('price', 'greaterThan', 18);

      // Act: Call repository.find(spec)
      const results = repository.find(spec);

      // Assert: Verify correct entities are returned
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((p) => p.price > 18)).toBe(true);
      expect(results).toContainEqual(expect.objectContaining({ name: 'Widget B' })); // price 25
      expect(results).toContainEqual(expect.objectContaining({ name: 'Tool D' })); // price 30
    });

    test('should translate equality specification', () => {
      // Arrange: Test FieldSpecification('status', '==', 'active')
      const spec = new FieldSpecification('status', 'equals', 'active');

      // Act
      const results = repository.find(spec);

      // Assert
      expect(results.length).toBe(4); // prod_1, prod_2, prod_4, prod_5
      expect(results.every((p) => p.status === 'active')).toBe(true);
    });

    test('should translate IN specification', () => {
      // Arrange: Test FieldSpecification('category', 'in', ['electronics', 'tools'])
      const spec = new FieldSpecification('category', 'in', ['electronics', 'tools']);

      // Act
      const results = repository.find(spec);

      // Assert
      expect(results.length).toBe(4); // 3 electronics + 1 tools
      expect(results.every((p) => ['electronics', 'tools'].includes(p.category))).toBe(true);
    });

    test('should translate lessThanOrEqual specification', () => {
      // Arrange
      const spec = new FieldSpecification('price', 'lessThanOrEqual', 15);

      // Act
      const results = repository.find(spec);

      // Assert
      expect(results.every((p) => p.price <= 15)).toBe(true);
      expect(results.length).toBe(3); // Widget A (10), Gadget C (15), Part E (5)
    });

    test('should translate between specification', () => {
      // Arrange
      const spec = new FieldSpecification('price', 'between', [10, 25]);

      // Act
      const results = repository.find(spec);

      // Assert
      expect(results.every((p) => p.price >= 10 && p.price <= 25)).toBe(true);
      expect(results.length).toBe(3); // Widget A (10), Widget B (25), Gadget C (15)
    });
  });

  describe('Composite Specifications', () => {
    test('should translate AND specification to multiple where clauses', () => {
      // Arrange: Create CompositeSpecification with AND logic
      const statusSpec = new FieldSpecification('status', 'equals', 'active');
      const priceSpec = new FieldSpecification('price', 'greaterThan', 10);
      const andSpec = new CompositeSpecification('AND', [statusSpec, priceSpec]);

      // Act
      const results = repository.find(andSpec);

      // Assert: Verify both conditions are met
      expect(results.every((p) => p.status === 'active' && p.price > 10)).toBe(true);
      expect(results.length).toBe(2); // Widget B (25), Tool D (30)
    });

    test('should translate OR specification correctly', () => {
      // Arrange: Test OR logic - high price OR low stock
      const highPriceSpec = new FieldSpecification('price', 'greaterThanOrEqual', 30);
      const lowStockSpec = new FieldSpecification('stock', 'lessThan', 30);

      // Note: OR cannot be translated to SheetDBLib queries, so it will use in-memory filtering
      const orSpec = new CompositeSpecification('OR', [highPriceSpec, lowStockSpec]);

      // Act
      const results = repository.find(orSpec);

      // Assert
      expect(results.every((p) => p.price >= 30 || p.stock < 30)).toBe(true);
      expect(results.length).toBe(1); // Tool D (price 30, stock 20)
    });

    test('should handle nested composite specifications', () => {
      // Arrange: (status == 'active' AND price > 10) AND category == 'electronics'
      const statusSpec = new FieldSpecification('status', 'equals', 'active');
      const priceSpec = new FieldSpecification('price', 'greaterThan', 10);
      const categorySpec = new FieldSpecification('category', 'equals', 'electronics');

      const innerAnd = new CompositeSpecification('AND', [statusSpec, priceSpec]);
      const outerAnd = new CompositeSpecification('AND', [innerAnd, categorySpec]);

      // Act
      const results = repository.find(outerAnd);

      // Assert
      expect(
        results.every((p) => p.status === 'active' && p.price > 10 && p.category === 'electronics')
      ).toBe(true);
      expect(results.length).toBe(1); // Widget B
    });

    test('should combine three specifications with AND', () => {
      // Arrange
      const spec1 = new FieldSpecification('status', 'equals', 'active');
      const spec2 = new FieldSpecification('category', 'equals', 'electronics');
      const spec3 = new FieldSpecification('stock', 'greaterThan', 50);

      const compositeSpec = new CompositeSpecification('AND', [spec1, spec2, spec3]);

      // Act
      const results = repository.find(compositeSpec);

      // Assert
      expect(
        results.every((p) => p.status === 'active' && p.category === 'electronics' && p.stock > 50)
      ).toBe(true);
      expect(results.length).toBe(2); // Widget A (100), Part E (200)
    });
  });

  describe('Query Execution', () => {
    test('should execute query and return matching entities', () => {
      // Arrange: Seed database already has test data
      const spec = new FieldSpecification('category', 'equals', 'electronics');

      // Act: Execute repository.find(spec)
      const results = repository.find(spec);

      // Assert: Verify correct entities are returned
      expect(results).toHaveLength(3); // prod_1, prod_2, prod_5
      expect(results.every((p) => p.category === 'electronics')).toBe(true);
      expect(results[0]).toBeInstanceOf(Product);
    });

    test('should return empty array when no entities match', () => {
      // Arrange
      const spec = new FieldSpecification('price', 'greaterThan', 1000);

      // Act
      const results = repository.find(spec);

      // Assert
      expect(results).toHaveLength(0);
    });

    test('should return single entity with findOne', () => {
      // Arrange
      const spec = new FieldSpecification('price', 'equals', 30);

      // Act
      const result = repository.findOne(spec);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Product);
      expect(result.price).toBe(30);
      expect(result.name).toBe('Tool D');
    });

    test('should count entities matching specification', () => {
      // Arrange
      const spec = new FieldSpecification('status', 'equals', 'active');

      // Act
      const count = repository.count(spec);

      // Assert
      expect(count).toBe(4);
    });

    test('should check if entities exist matching specification', () => {
      // Arrange
      const existsSpec = new FieldSpecification('category', 'equals', 'gadgets');
      const notExistsSpec = new FieldSpecification('category', 'equals', 'unknown');

      // Act & Assert
      expect(repository.exists(existsSpec)).toBe(true);
      expect(repository.exists(notExistsSpec)).toBe(false);
    });
  });

  describe('Specification Chaining with Fluent API', () => {
    test('should use .and() method for chaining specifications', () => {
      // Arrange
      const spec1 = new FieldSpecification('status', 'equals', 'active');
      const spec2 = new FieldSpecification('price', 'lessThan', 20);

      // Act: Use fluent API
      const chainedSpec = spec1.and(spec2);
      const results = repository.find(chainedSpec);

      // Assert
      expect(results.every((p) => p.status === 'active' && p.price < 20)).toBe(true);
      expect(results.length).toBe(2); // Widget A (10), Part E (5)
    });

    test('should use .or() method for chaining specifications', () => {
      // Arrange
      const spec1 = new FieldSpecification('price', 'lessThanOrEqual', 5);
      const spec2 = new FieldSpecification('price', 'greaterThanOrEqual', 30);

      // Act: Use fluent API
      const chainedSpec = spec1.or(spec2);
      const results = repository.find(chainedSpec);

      // Assert
      expect(results.every((p) => p.price <= 5 || p.price >= 30)).toBe(true);
      expect(results.length).toBe(2); // Part E (5), Tool D (30)
    });
  });
});
