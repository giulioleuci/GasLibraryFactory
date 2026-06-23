// ===================================================================
// FILE: SheetDBLib/src/query/__tests__/AdvancedQueryBuilder_Joins.test.js
// ===================================================================
// Comprehensive test suite for JOIN operations in AdvancedQueryBuilder
// Tests INNER, LEFT, RIGHT, and FULL OUTER joins
// ===================================================================

import { AdvancedQueryBuilder } from '../AdvancedQueryBuilder';
import { MockFactory } from '../../../../test/fakes';

describe('AdvancedQueryBuilder - JOIN Operations', () => {
  let mockDatabase;
  let mockLogger;

  beforeEach(() => {
    mockLogger = MockFactory.createJestLogger();

    // Mock database with related tables
    mockDatabase = {
      tables: {
        Authors: {
          getRows: jest.fn(() => [
            { id: '1', name: 'John Doe', country: 'USA' },
            { id: '2', name: 'Jane Smith', country: 'UK' },
            { id: '3', name: 'Bob Johnson', country: 'Canada' }
          ]),
          _keyField: 'id',
          _indices: {}
        },
        Books: {
          getRows: jest.fn(() => [
            { id: 'b1', title: 'Book One', author_id: '1', price: 10 },
            { id: 'b2', title: 'Book Two', author_id: '1', price: 15 },
            { id: 'b3', title: 'Book Three', author_id: '2', price: 20 },
            { id: 'b4', title: 'Book Four', author_id: '99', price: 25 } // Orphan book
          ]),
          _keyField: 'id',
          _indices: {}
        },
        Reviews: {
          getRows: jest.fn(() => [
            { id: 'r1', book_id: 'b1', rating: 5, comment: 'Great!' },
            { id: 'r2', book_id: 'b2', rating: 4, comment: 'Good' }
          ]),
          _keyField: 'id',
          _indices: {}
        }
      },
      _logger: mockLogger
    };
  });

  // ===================================================================
  // INNER JOIN
  // ===================================================================

  describe('INNER JOIN', () => {
    it('should perform basic INNER JOIN', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Should only include authors with books
      expect(results.length).toBe(3); // John has 2 books, Jane has 1 book
      expect(results[0]['Authors.name']).toBe('John Doe');
      expect(results[0]['Books.title']).toBe('Book One');
      expect(results[1]['Authors.name']).toBe('John Doe');
      expect(results[1]['Books.title']).toBe('Book Two');
      expect(results[2]['Authors.name']).toBe('Jane Smith');
      expect(results[2]['Books.title']).toBe('Book Three');
    });

    it('should exclude non-matching rows in INNER JOIN', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Bob Johnson (id: 3) has no books, should not appear
      const bobResults = results.filter((r) => r['Authors.name'] === 'Bob Johnson');
      expect(bobResults.length).toBe(0);

      // Book Four (author_id: 99) has no matching author, should not appear
      const orphanBooks = results.filter((r) => r['Books.title'] === 'Book Four');
      expect(orphanBooks.length).toBe(0);
    });

    it('should default operator to = when not specified', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', 'Books.author_id') // No operator
        .execute();

      expect(results.length).toBe(3);
    });
  });

  // ===================================================================
  // LEFT JOIN
  // ===================================================================

  describe('LEFT JOIN', () => {
    it('should perform LEFT JOIN and include unmatched left rows', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .leftJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Should include all 3 authors plus their books
      // John: 2 books, Jane: 1 book, Bob: 0 books (but still included with null)
      expect(results.length).toBe(4);

      // Find Bob Johnson (no books)
      const bobResults = results.filter((r) => r['Authors.name'] === 'Bob Johnson');
      expect(bobResults.length).toBe(1);
      expect(bobResults[0]['Books.title']).toBeNull();
      expect(bobResults[0]['Books.author_id']).toBeNull();
    });

    it('should fill right columns with null for unmatched left rows', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .leftJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      const bobRow = results.find((r) => r['Authors.name'] === 'Bob Johnson');
      expect(bobRow).toBeDefined();
      expect(bobRow['Authors.id']).toBe('3');
      expect(bobRow['Books.id']).toBeNull();
      expect(bobRow['Books.title']).toBeNull();
      expect(bobRow['Books.author_id']).toBeNull();
      expect(bobRow['Books.price']).toBeNull();
    });
  });

  // ===================================================================
  // RIGHT JOIN
  // ===================================================================

  describe('RIGHT JOIN', () => {
    it('should perform RIGHT JOIN and include unmatched right rows', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .rightJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Should include all 4 books
      // Book One, Two, Three have authors; Book Four has no author
      expect(results.length).toBe(4);

      // Find Book Four (orphan book with author_id: 99)
      const orphanBook = results.find((r) => r['Books.title'] === 'Book Four');
      expect(orphanBook).toBeDefined();
      expect(orphanBook['Authors.name']).toBeNull();
      expect(orphanBook['Authors.id']).toBeNull();
      expect(orphanBook['Books.id']).toBe('b4');
    });

    it('should fill left columns with null for unmatched right rows', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .rightJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      const orphanBook = results.find((r) => r['Books.title'] === 'Book Four');
      expect(orphanBook).toBeDefined();
      expect(orphanBook['Books.author_id']).toBe('99');
      expect(orphanBook['Authors.id']).toBeNull();
      expect(orphanBook['Authors.name']).toBeNull();
      expect(orphanBook['Authors.country']).toBeNull();
    });
  });

  // ===================================================================
  // FULL OUTER JOIN
  // ===================================================================

  describe('FULL OUTER JOIN', () => {
    it('should perform FULL OUTER JOIN and include all rows from both tables', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .fullOuterJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Should include:
      // - John with 2 books (2 rows)
      // - Jane with 1 book (1 row)
      // - Bob with no books (1 row with null books)
      // - Book Four with no author (1 row with null author)
      expect(results.length).toBe(5);
    });

    it('should include unmatched rows from both sides', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .fullOuterJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Check for Bob (unmatched left)
      const bobRow = results.find((r) => r['Authors.name'] === 'Bob Johnson');
      expect(bobRow).toBeDefined();
      expect(bobRow['Books.title']).toBeNull();

      // Check for Book Four (unmatched right)
      const orphanBook = results.find((r) => r['Books.title'] === 'Book Four');
      expect(orphanBook).toBeDefined();
      expect(orphanBook['Authors.name']).toBeNull();
    });
  });

  // ===================================================================
  // MULTIPLE JOINS
  // ===================================================================

  describe('Multiple JOINs', () => {
    it('should chain multiple joins (A join B join C)', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .join('Reviews', 'Books.id', '=', 'Reviews.book_id')
        .execute();

      // Only books with reviews should appear
      // Book One has 1 review, Book Two has 1 review
      expect(results.length).toBe(2);

      // Verify all three tables are joined
      expect(results[0]['Authors.name']).toBeDefined();
      expect(results[0]['Books.title']).toBeDefined();
      expect(results[0]['Reviews.rating']).toBeDefined();
    });

    it('should handle mixed join types', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .leftJoin('Books', 'Authors.id', '=', 'Books.author_id')
        .leftJoin('Reviews', 'Books.id', '=', 'Reviews.book_id')
        .execute();

      // All authors should be included
      const uniqueAuthors = new Set(results.map((r) => r['Authors.id']));
      expect(uniqueAuthors.size).toBe(3); // All 3 authors
    });
  });

  // ===================================================================
  // WHERE CLAUSES WITH JOINS
  // ===================================================================

  describe('WHERE clauses with JOINs', () => {
    it('should apply WHERE clause on prefixed fields after join', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .where('Authors.name', '=', 'John Doe')
        .execute();

      expect(results.length).toBe(2); // John's 2 books
      expect(results.every((r) => r['Authors.name'] === 'John Doe')).toBe(true);
    });

    it('should filter on joined table fields', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .where('Books.price', '>', 12)
        .execute();

      // Book Two (15) and Book Three (20) have price > 12
      expect(results.length).toBe(2);
      expect(results.every((r) => r['Books.price'] > 12)).toBe(true);
    });

    it('should support complex WHERE conditions with joins', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .where('Authors.country', '=', 'USA')
        .where('Books.price', '>=', 15)
        .execute();

      // John (USA) has Book Two (15)
      expect(results.length).toBe(1);
      expect(results[0]['Authors.name']).toBe('John Doe');
      expect(results[0]['Books.title']).toBe('Book Two');
    });
  });

  // ===================================================================
  // COLUMN SELECTION WITH JOINS
  // ===================================================================

  describe('Column selection with JOINs', () => {
    it('should select specific columns from joined tables', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['Authors.name', 'Books.title'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      expect(results.length).toBe(3);
      expect(Object.keys(results[0])).toContain('Authors.name');
      expect(Object.keys(results[0])).toContain('Books.title');
      expect(Object.keys(results[0])).not.toContain('Authors.country');
      expect(Object.keys(results[0])).not.toContain('Books.price');
    });
  });

  // ===================================================================
  // SORTING WITH JOINS
  // ===================================================================

  describe('Sorting with JOINs', () => {
    it('should sort by joined table columns', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .orderBy('Books.price', 'DESC')
        .execute();

      expect(results.length).toBe(3);
      expect(results[0]['Books.price']).toBe(20); // Book Three
      expect(results[1]['Books.price']).toBe(15); // Book Two
      expect(results[2]['Books.price']).toBe(10); // Book One
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error handling', () => {
    it('should throw error for non-existent join table', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);

      expect(() => {
        qb.from('Authors').join('NonExistent', 'Authors.id', '=', 'NonExistent.id');
      }).toThrow('JOIN target table NonExistent not found in database');
    });

    it('should throw error for non-existent left join table', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);

      expect(() => {
        qb.from('Authors').leftJoin('NonExistent', 'Authors.id', '=', 'NonExistent.id');
      }).toThrow('LEFT JOIN target table NonExistent not found in database');
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle empty left table in INNER JOIN', () => {
      const emptyDb = {
        tables: {
          EmptyAuthors: {
            getRows: jest.fn(() => []),
            _keyField: 'id',
            _indices: {}
          },
          Books: {
            getRows: jest.fn(() => [{ id: 'b1', title: 'Book One', author_id: '1', price: 10 }]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(emptyDb);
      const results = qb
        .select(['*'])
        .from('EmptyAuthors')
        .join('Books', 'EmptyAuthors.id', '=', 'Books.author_id')
        .execute();

      expect(results.length).toBe(0);
    });

    it('should handle empty right table in INNER JOIN', () => {
      const emptyDb = {
        tables: {
          Authors: {
            getRows: jest.fn(() => [{ id: '1', name: 'John Doe', country: 'USA' }]),
            _keyField: 'id',
            _indices: {}
          },
          EmptyBooks: {
            getRows: jest.fn(() => []),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(emptyDb);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('EmptyBooks', 'Authors.id', '=', 'EmptyBooks.author_id')
        .execute();

      expect(results.length).toBe(0);
    });

    it('should handle empty right table in LEFT JOIN', () => {
      const emptyDb = {
        tables: {
          Authors: {
            getRows: jest.fn(() => [
              { id: '1', name: 'John Doe', country: 'USA' },
              { id: '2', name: 'Jane Smith', country: 'UK' }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          EmptyBooks: {
            getRows: jest.fn(() => []),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(emptyDb);
      const results = qb
        .select(['*'])
        .from('Authors')
        .leftJoin('EmptyBooks', 'Authors.id', '=', 'EmptyBooks.author_id')
        .execute();

      // Should still include all authors with null book fields
      expect(results.length).toBe(2);
      expect(results[0]['Authors.name']).toBe('John Doe');
      expect(results[1]['Authors.name']).toBe('Jane Smith');
    });

    it('should handle null join keys', () => {
      const nullDb = {
        tables: {
          Authors: {
            getRows: jest.fn(() => [
              { id: '1', name: 'John Doe', country: 'USA' },
              { id: null, name: 'Anonymous', country: 'Unknown' }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          Books: {
            getRows: jest.fn(() => [
              { id: 'b1', title: 'Book One', author_id: '1', price: 10 },
              { id: 'b2', title: 'Book Two', author_id: null, price: 15 }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(nullDb);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .execute();

      // Should match John's book, and null should match null
      expect(results.length).toBe(2);
      const johnBooks = results.filter((r) => r['Authors.name'] === 'John Doe');
      expect(johnBooks.length).toBe(1);

      const anonymousBooks = results.filter((r) => r['Authors.name'] === 'Anonymous');
      expect(anonymousBooks.length).toBe(1);
    });

    it('should handle one-to-many relationships correctly', () => {
      const oneToManyDb = {
        tables: {
          Categories: {
            getRows: jest.fn(() => [{ id: 'cat1', name: 'Fiction' }]),
            _keyField: 'id',
            _indices: {}
          },
          Products: {
            getRows: jest.fn(() => [
              { id: 'p1', title: 'Product 1', category_id: 'cat1', price: 10 },
              { id: 'p2', title: 'Product 2', category_id: 'cat1', price: 20 },
              { id: 'p3', title: 'Product 3', category_id: 'cat1', price: 30 },
              { id: 'p4', title: 'Product 4', category_id: 'cat1', price: 40 }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(oneToManyDb);
      const results = qb
        .select(['*'])
        .from('Categories')
        .join('Products', 'Categories.id', '=', 'Products.category_id')
        .execute();

      // One category should join with 4 products
      expect(results.length).toBe(4);
      expect(results.every((r) => r['Categories.name'] === 'Fiction')).toBe(true);
    });

    it('should handle non-equality operators in joins', () => {
      const rangeDb = {
        tables: {
          PriceRanges: {
            getRows: jest.fn(() => [
              { id: 'r1', name: 'Budget', max_price: 20 },
              { id: 'r2', name: 'Premium', max_price: 100 }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          Items: {
            getRows: jest.fn(() => [
              { id: 'i1', name: 'Item 1', price: 10 },
              { id: 'i2', name: 'Item 2', price: 25 },
              { id: 'i3', name: 'Item 3', price: 50 }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(rangeDb);
      const results = qb
        .select(['*'])
        .from('Items')
        .join('PriceRanges', 'Items.price', '<=', 'PriceRanges.max_price')
        .execute();

      // Item 1 (10) should match both ranges
      // Item 2 (25) should match Premium only
      // Item 3 (50) should match Premium only
      expect(results.length).toBe(4);

      const item1Results = results.filter((r) => r['Items.name'] === 'Item 1');
      expect(item1Results.length).toBe(2); // Matches both ranges

      const item2Results = results.filter((r) => r['Items.name'] === 'Item 2');
      expect(item2Results.length).toBe(1); // Matches Premium only
      expect(item2Results[0]['PriceRanges.name']).toBe('Premium');
    });

    it('should handle mixed data types in join keys', () => {
      const mixedDb = {
        tables: {
          StringKeys: {
            getRows: jest.fn(() => [
              { id: '1', name: 'String One' },
              { id: '2', name: 'String Two' }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          NumberKeys: {
            getRows: jest.fn(() => [
              { id: 'n1', ref: 1, value: 'Number One' },
              { id: 'n2', ref: 2, value: 'Number Two' }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(mixedDb);
      const results = qb
        .select(['*'])
        .from('StringKeys')
        .join('NumberKeys', 'StringKeys.id', '=', 'NumberKeys.ref')
        .execute();

      // String '1' should NOT match number 1 with strict equality
      expect(results.length).toBe(0);
    });

    it('should handle duplicate keys in both tables', () => {
      const duplicateDb = {
        tables: {
          TableA: {
            getRows: jest.fn(() => [
              { id: 'a1', key: 'dup', value: 'A1' },
              { id: 'a2', key: 'dup', value: 'A2' }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          TableB: {
            getRows: jest.fn(() => [
              { id: 'b1', key: 'dup', data: 'B1' },
              { id: 'b2', key: 'dup', data: 'B2' }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(duplicateDb);
      const results = qb
        .select(['*'])
        .from('TableA')
        .join('TableB', 'TableA.key', '=', 'TableB.key')
        .execute();

      // Should produce cartesian product: 2 x 2 = 4 results
      expect(results.length).toBe(4);

      // Verify all combinations exist
      expect(
        results.filter((r) => r['TableA.value'] === 'A1' && r['TableB.data'] === 'B1').length
      ).toBe(1);
      expect(
        results.filter((r) => r['TableA.value'] === 'A1' && r['TableB.data'] === 'B2').length
      ).toBe(1);
      expect(
        results.filter((r) => r['TableA.value'] === 'A2' && r['TableB.data'] === 'B1').length
      ).toBe(1);
      expect(
        results.filter((r) => r['TableA.value'] === 'A2' && r['TableB.data'] === 'B2').length
      ).toBe(1);
    });

    it('should handle LIMIT with joins', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .limit(2)
        .execute();

      expect(results.length).toBe(2);
    });

    it('should handle OFFSET with joins', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .orderBy('Books.id', 'ASC')
        .offset(1)
        .execute();

      // Should skip first result
      expect(results.length).toBe(2);
      expect(results[0]['Books.id']).toBe('b2');
    });

    it('should handle pagination with joins', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .orderBy('Books.id', 'ASC')
        .paginate(2, 1) // Page 2, 1 item per page
        .execute();

      expect(results.length).toBe(1);
      expect(results[0]['Books.id']).toBe('b2');
    });

    it('should handle self-join', () => {
      const employeeDb = {
        tables: {
          Employees: {
            getRows: jest.fn(() => [
              { id: 'e1', name: 'Alice', manager_id: null },
              { id: 'e2', name: 'Bob', manager_id: 'e1' },
              { id: 'e3', name: 'Charlie', manager_id: 'e1' }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(employeeDb);
      const results = qb
        .select(['*'])
        .from('Employees')
        .join('Employees', 'Employees.manager_id', '=', 'Employees.id')
        .execute();

      // Bob and Charlie report to Alice
      expect(results.length).toBe(2);
      expect(results.every((r) => r['Employees.id'] === 'e1')).toBe(true);
    });

    it('should preserve data types in joined results', () => {
      const typedDb = {
        tables: {
          Numbers: {
            getRows: jest.fn(() => [{ id: 1, value: 100 }]),
            _keyField: 'id',
            _indices: {}
          },
          Strings: {
            getRows: jest.fn(() => [{ id: 's1', num_ref: 1, text: 'hello' }]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(typedDb);
      const results = qb
        .select(['*'])
        .from('Numbers')
        .join('Strings', 'Numbers.id', '=', 'Strings.num_ref')
        .execute();

      expect(results.length).toBe(1);
      expect(typeof results[0]['Numbers.value']).toBe('number');
      expect(typeof results[0]['Strings.text']).toBe('string');
      expect(results[0]['Numbers.value']).toBe(100);
    });

    it('should handle WHERE with OR conditions on joined tables', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['*'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .where('Books.price', '=', 10)
        .orWhere('Books.price', '=', 20)
        .execute();

      expect(results.length).toBe(2); // Book One (10) and Book Three (20)
      expect(results.filter((r) => r['Books.price'] === 10).length).toBe(1);
      expect(results.filter((r) => r['Books.price'] === 20).length).toBe(1);
    });

    it('should handle complex nested join chains (A->B->C)', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const results = qb
        .select(['Authors.name', 'Books.title', 'Reviews.rating'])
        .from('Authors')
        .join('Books', 'Authors.id', '=', 'Books.author_id')
        .join('Reviews', 'Books.id', '=', 'Reviews.book_id')
        .where('Reviews.rating', '>=', 4)
        .execute();

      expect(results.length).toBe(2); // Both reviews have rating >= 4
      expect(results.every((r) => r['Reviews.rating'] >= 4)).toBe(true);
    });

    it('should handle joins with all rows having unique keys', () => {
      const uniqueDb = {
        tables: {
          Users: {
            getRows: jest.fn(() => [
              { id: 'u1', username: 'user1' },
              { id: 'u2', username: 'user2' },
              { id: 'u3', username: 'user3' }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          Profiles: {
            getRows: jest.fn(() => [
              { id: 'p1', user_id: 'u1', bio: 'Bio 1' },
              { id: 'p2', user_id: 'u2', bio: 'Bio 2' },
              { id: 'p3', user_id: 'u3', bio: 'Bio 3' }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(uniqueDb);
      const results = qb
        .select(['*'])
        .from('Users')
        .join('Profiles', 'Users.id', '=', 'Profiles.user_id')
        .execute();

      // Perfect 1:1 mapping
      expect(results.length).toBe(3);
      expect(results.every((r) => r['Users.id'] && r['Profiles.user_id'])).toBe(true);
    });

    it('should handle LEFT JOIN with all rows matching', () => {
      const allMatchDb = {
        tables: {
          Orders: {
            getRows: jest.fn(() => [
              { id: 'o1', customer_id: 'c1', total: 100 },
              { id: 'o2', customer_id: 'c2', total: 200 }
            ]),
            _keyField: 'id',
            _indices: {}
          },
          Customers: {
            getRows: jest.fn(() => [
              { id: 'c1', name: 'Customer 1' },
              { id: 'c2', name: 'Customer 2' }
            ]),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(allMatchDb);
      const results = qb
        .select(['*'])
        .from('Orders')
        .leftJoin('Customers', 'Orders.customer_id', '=', 'Customers.id')
        .execute();

      expect(results.length).toBe(2);
      expect(results.every((r) => r['Customers.name'] !== null)).toBe(true);
    });

    it('should handle joins with large cardinality difference', () => {
      const largeDb = {
        tables: {
          SingleRow: {
            getRows: jest.fn(() => [{ id: '1', name: 'Single' }]),
            _keyField: 'id',
            _indices: {}
          },
          ManyRows: {
            getRows: jest.fn(() =>
              Array.from({ length: 10 }, (_, i) => ({
                id: `r${i}`,
                ref: '1',
                value: i
              }))
            ),
            _keyField: 'id',
            _indices: {}
          }
        },
        _logger: mockLogger
      };

      const qb = new AdvancedQueryBuilder(largeDb);
      const results = qb
        .select(['*'])
        .from('SingleRow')
        .join('ManyRows', 'SingleRow.id', '=', 'ManyRows.ref')
        .execute();

      expect(results.length).toBe(10);
      expect(results.every((r) => r['SingleRow.name'] === 'Single')).toBe(true);
    });
  });

  // ===================================================================
  // FLUENT API
  // ===================================================================

  describe('Fluent API', () => {
    it('should support method chaining for join()', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const result = qb.from('Authors').join('Books', 'Authors.id', '=', 'Books.author_id');

      expect(result).toBe(qb);
    });

    it('should support method chaining for leftJoin()', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const result = qb.from('Authors').leftJoin('Books', 'Authors.id', '=', 'Books.author_id');

      expect(result).toBe(qb);
    });

    it('should support method chaining for rightJoin()', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const result = qb.from('Authors').rightJoin('Books', 'Authors.id', '=', 'Books.author_id');

      expect(result).toBe(qb);
    });

    it('should support method chaining for fullOuterJoin()', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);
      const result = qb
        .from('Authors')
        .fullOuterJoin('Books', 'Authors.id', '=', 'Books.author_id');

      expect(result).toBe(qb);
    });
  });
});
