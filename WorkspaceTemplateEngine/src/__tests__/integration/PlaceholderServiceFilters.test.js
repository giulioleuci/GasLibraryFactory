/**
 * Integration Test: PlaceholderService + Mustache + Filters
 *
 * Layers Tested: WorkspaceTemplateEngine (PlaceholderService, Mustache, FilterStrategy, BuiltInFilters)
 *
 * Purpose: Verifies that PlaceholderService correctly integrates with the
 * Mustache engine and filter system for template processing.
 *
 * @file WorkspaceTemplateEngine/src/__tests__/integration/PlaceholderServiceFilters.test.js
 */

import { PlaceholderService } from '../../PlaceholderService';
import { Mustache } from '../../facades/Mustache';
import { FilterStrategy } from '../../FilterStrategy';

describe('PlaceholderService + Mustache + Filters Integration', () => {
  let logger;
  let mustache;
  let service;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mustache = new Mustache({ logger });
    service = new PlaceholderService({ logger, mustache });
  });

  describe('basic template processing', () => {
    it('should process simple variable substitution', () => {
      const result = service.processString('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should handle multiple variables', () => {
      const result = service.processString('{{greeting}}, {{name}}! Welcome to {{place}}.', {
        greeting: 'Hello',
        name: 'Alice',
        place: 'Wonderland'
      });
      expect(result).toBe('Hello, Alice! Welcome to Wonderland.');
    });

    it('should handle nested object access', () => {
      const result = service.processString('User: {{user.name}}, Email: {{user.email}}', {
        user: { name: 'John', email: 'john@example.com' }
      });
      expect(result).toBe('User: John, Email: john@example.com');
    });

    it('should handle missing variables gracefully', () => {
      const result = service.processString('Name: {{name}}, Age: {{age}}', { name: 'Alice' });
      expect(result).toBe('Name: Alice, Age: ');
    });
  });

  describe('built-in string filters', () => {
    it('should apply uppercase filter', () => {
      const result = service.processString('{{name | uppercase}}', { name: 'hello world' });
      expect(result).toBe('HELLO WORLD');
    });

    it('should apply lowercase filter', () => {
      const result = service.processString('{{name | lowercase}}', { name: 'HELLO WORLD' });
      expect(result).toBe('hello world');
    });

    it('should apply capitalize filter', () => {
      const result = service.processString('{{name | capitalize}}', { name: 'hello world' });
      expect(result).toBe('Hello world');
    });
  });

  describe('built-in array filters', () => {
    it('should apply join filter with default separator', () => {
      // join filter uses default separator ", " when no separator is provided
      // For simple arrays without objects, the "key" argument is used as separator
      const result = service.processString('{{items | join}}', {
        items: ['apple', 'banana', 'cherry']
      });
      expect(result).toBe('apple, banana, cherry');
    });

    it('should apply join filter with property', () => {
      // Use comma to separate key and separator arguments
      const result = service.processString('{{users | join:name,", "}}', {
        users: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }]
      });
      expect(result).toBe('Alice, Bob, Carol');
    });

    it('should apply sortBy filter', () => {
      const data = {
        items: [
          { name: 'Zebra', value: 3 },
          { name: 'Apple', value: 1 },
          { name: 'Mango', value: 2 }
        ]
      };

      // Use comma to separate key and separator arguments in join filter
      const result = service.processString('{{items | sortBy:name | join:name,", "}}', data);
      expect(result).toBe('Apple, Mango, Zebra');
    });

    it('should apply where filter', () => {
      const data = {
        users: [
          { name: 'Alice', status: 'active' },
          { name: 'Bob', status: 'inactive' },
          { name: 'Carol', status: 'active' }
        ]
      };

      // where filter returns filtered array, then join extracts name property
      // Note: use comma (not colon) to separate filter arguments: join:name,", "
      const result = service.processString(
        '{{users | where:status,active | join:name,", "}}',
        data
      );
      expect(result).toBe('Alice, Carol');
    });

    it('should apply exclude filter', () => {
      const data = {
        users: [
          { name: 'Alice', role: 'admin' },
          { name: 'Bob', role: 'user' },
          { name: 'Carol', role: 'admin' }
        ]
      };

      // exclude filter uses comma to separate arguments
      // Note: use comma (not colon) to separate filter arguments: join:name,", "
      const result = service.processString('{{users | exclude:role,admin | join:name,", "}}', data);
      expect(result).toBe('Bob');
    });

    it('should apply pluralize filter', () => {
      // pluralize filter uses comma to separate singular and plural forms
      const result1 = service.processString('{{count | pluralize:item,items}}', { count: 1 });
      expect(result1).toBe('item');

      const result2 = service.processString('{{count | pluralize:item,items}}', { count: 5 });
      expect(result2).toBe('items');

      const result0 = service.processString('{{count | pluralize:item,items}}', { count: 0 });
      expect(result0).toBe('items');
    });
  });

  describe('filter chaining', () => {
    it('should chain multiple filters', () => {
      const result = service.processString('{{name | lowercase | capitalize}}', {
        name: 'HELLO WORLD'
      });
      expect(result).toBe('Hello world');
    });

    it('should chain array filters with string filters', () => {
      const data = {
        items: [{ name: 'zebra' }, { name: 'apple' }, { name: 'mango' }]
      };

      // sortBy sorts the array, join extracts name and joins, then uppercase transforms the result
      const result = service.processString(
        '{{items | sortBy:name | join:name,", " | uppercase}}',
        data
      );
      expect(result).toBe('APPLE, MANGO, ZEBRA');
    });
  });

  describe('Mustache sections', () => {
    it('should handle truthy sections', () => {
      const result = service.processString('{{#showWelcome}}Welcome!{{/showWelcome}}', {
        showWelcome: true
      });
      expect(result).toBe('Welcome!');
    });

    it('should handle falsy sections', () => {
      const result = service.processString('{{#showWelcome}}Welcome!{{/showWelcome}}', {
        showWelcome: false
      });
      expect(result).toBe('');
    });

    it('should handle inverted sections', () => {
      const result = service.processString('{{^hasItems}}No items{{/hasItems}}', {
        hasItems: false
      });
      expect(result).toBe('No items');
    });

    it('should iterate over arrays in sections', () => {
      const result = service.processString('{{#items}}{{name}}, {{/items}}', {
        items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
      });
      expect(result).toBe('A, B, C, ');
    });
  });

  describe('custom filter registration', () => {
    it('should support custom filters', () => {
      // Create custom filter
      class CurrencyFilter extends FilterStrategy {
        getName() {
          return 'currency';
        }
        execute(value, symbol = '$') {
          return `${symbol}${Number(value).toFixed(2)}`;
        }
      }

      // Register with Mustache
      mustache.registerFilter(new CurrencyFilter());

      const result = service.processString('Price: {{amount | currency}}', { amount: 99.5 });
      expect(result).toBe('Price: $99.50');
    });

    it('should support custom filters with arguments', () => {
      class FormatFilter extends FilterStrategy {
        getName() {
          return 'format';
        }
        execute(value, prefix = '', suffix = '') {
          return `${prefix}${value}${suffix}`;
        }
      }

      mustache.registerFilter(new FormatFilter());

      // Use comma to separate arguments, and quotes for values containing special chars
      const result = service.processString('{{code | format:"SKU-","-XL"}}', { code: '12345' });
      expect(result).toBe('SKU-12345-XL');
    });

    it('should chain custom and built-in filters', () => {
      class TruncateFilter extends FilterStrategy {
        getName() {
          return 'truncate';
        }
        execute(value, length = 10) {
          const str = String(value);
          return str.length > length ? str.slice(0, length) + '...' : str;
        }
      }

      mustache.registerFilter(new TruncateFilter());

      const result = service.processString('{{text | truncate:20 | uppercase}}', {
        text: 'This is a very long text that should be truncated'
      });
      expect(result).toBe('THIS IS A VERY LONG ...');
    });
  });

  describe('complex template scenarios', () => {
    it('should process invoice template', () => {
      const invoiceData = {
        company: 'Acme Corp',
        invoiceNumber: 'INV-2025-001',
        items: [
          { name: 'Widget A', quantity: 2, price: 10.0 },
          { name: 'Widget B', quantity: 1, price: 25.0 },
          { name: 'Widget C', quantity: 3, price: 5.0 }
        ],
        total: 60.0
      };

      // Note: Use regular string to avoid JS template literal $ interpolation issues
      const template = [
        'INVOICE: {{invoiceNumber}}',
        'Company: {{company | uppercase}}',
        '',
        'Items:',
        '{{#items}}',
        '- {{name}}: {{quantity}} x ${{price}}',
        '{{/items}}',
        '',
        'Total: ${{total}}'
      ].join('\n');

      const result = service.processString(template, invoiceData);

      expect(result).toContain('INVOICE: INV-2025-001');
      expect(result).toContain('Company: ACME CORP');
      expect(result).toContain('Widget A: 2 x $10');
      expect(result).toContain('Widget B: 1 x $25');
      expect(result).toContain('Widget C: 3 x $5');
      expect(result).toContain('Total: $60');
    });

    it('should process report with filtering and sorting', () => {
      const reportData = {
        title: 'active users report',
        users: [
          { name: 'Carol', status: 'active', score: 85 },
          { name: 'Alice', status: 'active', score: 95 },
          { name: 'Bob', status: 'inactive', score: 75 },
          { name: 'Dave', status: 'active', score: 90 }
        ]
      };

      // Use comma to separate filter arguments
      const template = `
Report: {{title | capitalize}}
Active Users: {{users | where:status,active | sortBy:name | join:name,", "}}
      `.trim();

      const result = service.processString(template, reportData);

      expect(result).toContain('Report: Active users report');
      expect(result).toContain('Active Users: Alice, Carol, Dave');
    });

    it('should handle conditional content', () => {
      const template = `
{{#isPremium}}
Premium features:
{{#features}}
- {{name}}
{{/features}}
{{/isPremium}}
{{^isPremium}}
Upgrade to access premium features!
{{/isPremium}}
      `.trim();

      const premiumUser = service.processString(template, {
        isPremium: true,
        features: [{ name: 'Analytics' }, { name: 'API Access' }]
      });

      const freeUser = service.processString(template, {
        isPremium: false,
        features: []
      });

      expect(premiumUser).toContain('Premium features:');
      expect(premiumUser).toContain('- Analytics');
      expect(freeUser).toContain('Upgrade to access premium features!');
    });
  });

  describe('error handling', () => {
    it('should handle undefined filter gracefully', () => {
      // Unknown filters should not crash the template engine
      const result = service.processString('{{name | unknownFilter}}', { name: 'test' });
      // Behavior depends on implementation - could return original value or empty
      expect(typeof result).toBe('string');
    });

    it('should handle invalid filter arguments gracefully', () => {
      const result = service.processString(
        '{{items | sortBy}}', // Missing property argument
        { items: [{ name: 'A' }] }
      );
      expect(typeof result).toBe('string');
    });

    it('should handle null values in filters', () => {
      const result = service.processString('{{value | uppercase}}', { value: null });
      expect(typeof result).toBe('string');
    });
  });

  describe('security considerations', () => {
    it('should prevent prototype pollution in where filter', () => {
      const maliciousData = {
        items: [
          { name: 'safe', __proto__: 'malicious' },
          { name: 'test', constructor: 'bad' }
        ]
      };

      // Should not throw or allow access to prototype properties
      // Use comma (not colon) to separate filter arguments: join:name,", "
      const result = service.processString(
        '{{items | where:name,safe | join:name,", "}}',
        maliciousData
      );
      expect(result).toBe('safe');
    });

    it('should handle HTML-like content in GAS context', () => {
      const data = {
        content: '<script>alert("xss")</script>'
      };

      // GAS context: HTML escaping is not appropriate for Google Docs/Sheets output.
      // Both {{}} and {{{}}} return raw output since GAS doesn't render HTML.
      const escapedResult = service.processString('{{content}}', data);
      expect(escapedResult).toBe('<script>alert("xss")</script>');

      // Triple braces also return raw output (same behavior in GAS context)
      const unescapedResult = service.processString('{{{content}}}', data);
      expect(unescapedResult).toBe('<script>alert("xss")</script>');
    });
  });
});
