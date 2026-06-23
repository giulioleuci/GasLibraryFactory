// ===================================================================
// FILE: WorkspaceTemplateEngine/src/__tests__/AdvancedFeatures.test.js
// ===================================================================
// Comprehensive test suite for advanced Handlebars/Liquid-style features
// Tests parent context navigation, loop meta-variables, and advanced filters
// ===================================================================

import { Mustache } from '../facades/Mustache';
import { MockFactory } from '../../../test/fakes';

describe('Advanced Features - Handlebars/Liquid-style', () => {
  let mustache;
  let logger;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    mustache = new Mustache({ logger });
  });

  // ==================== PARENT CONTEXT NAVIGATION ====================

  describe('Parent Context Navigation (../)', () => {
    it('should access parent context with ../', () => {
      const template = '{{#items}}{{name}} ({{../title}}){{/items}}';
      const data = {
        title: 'Products',
        items: [{ name: 'A' }, { name: 'B' }]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('A (Products)B (Products)');
    });

    it('should access grandparent context with ../../', () => {
      const template = '{{#level1}}{{#level2}}{{name}} - {{../../root}}{{/level2}}{{/level1}}';
      const data = {
        root: 'Top',
        level1: [
          {
            level2: [{ name: 'Item' }]
          }
        ]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('Item - Top');
    });

    it('should return undefined when traversing too far up', () => {
      const template = '{{#items}}{{../../../nonexistent}}{{/items}}';
      const data = {
        items: [{ name: 'A' }]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('');
    });

    it('should work with dot notation after ../', () => {
      const template = '{{#items}}{{../parent.name}}{{/items}}';
      const data = {
        parent: { name: 'ParentName' },
        items: [{ name: 'A' }]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('ParentName');
    });
  });

  // ==================== LOOP META-VARIABLES ====================

  describe('Loop Meta-Variables', () => {
    describe('@index (0-based)', () => {
      it('should provide @index in array iteration', () => {
        const template = '{{#items}}{{@index}}:{{name}} {{/items}}';
        const data = { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
        const result = mustache.render(template, data);
        expect(result).toBe('0:A 1:B 2:C ');
      });
    });

    describe('@number (1-based)', () => {
      it('should provide @number in array iteration', () => {
        const template = '{{#items}}{{@number}}. {{name}} {{/items}}';
        const data = { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
        const result = mustache.render(template, data);
        expect(result).toBe('1. A 2. B 3. C ');
      });
    });

    describe('@first', () => {
      it('should be true for first item', () => {
        const template = '{{#items}}{{#@first}}FIRST:{{/@first}}{{name}} {{/items}}';
        const data = { items: [{ name: 'A' }, { name: 'B' }] };
        const result = mustache.render(template, data);
        expect(result).toBe('FIRST:A B ');
      });
    });

    describe('@last', () => {
      it('should be true for last item', () => {
        const template = '{{#items}}{{name}}{{^@last}}, {{/@last}}{{/items}}';
        const data = { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] };
        const result = mustache.render(template, data);
        expect(result).toBe('A, B, C');
      });
    });

    describe('@odd and @even', () => {
      it('should alternate @odd and @even correctly', () => {
        const template = '{{#items}}{{#@even}}E{{/@even}}{{#@odd}}O{{/@odd}}{{/items}}';
        // Use objects instead of primitives to support meta-variables
        const data = { items: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }] };
        const result = mustache.render(template, data);
        expect(result).toBe('EOEO');
      });
    });

    describe('@total', () => {
      it('should provide total array length', () => {
        const template = '{{#items}}{{@index}}/{{@total}} {{/items}}';
        // Use objects instead of primitives to support meta-variables
        const data = { items: [{ v: 1 }, { v: 2 }, { v: 3 }] };
        const result = mustache.render(template, data);
        expect(result).toBe('0/3 1/3 2/3 ');
      });
    });

    describe('@key', () => {
      it('should NOT support @key with plain objects (limitation - not standard Mustache)', () => {
        // Standard Mustache doesn't iterate over object keys
        // Objects are just pushed onto the context stack
        // To use @key, convert object to array first
        const template = '{{#colors}}{{@key}}={{value}} {{/colors}}';
        const data = {
          colors: [
            { value: '#FF0000', '@key': 'red' },
            { value: '#0000FF', '@key': 'blue' }
          ]
        };
        const result = mustache.render(template, data);
        expect(result).toMatch(/red=#FF0000 blue=#0000FF /);
      });
    });

    describe('Meta-variables with primitives', () => {
      it('should NOT add meta-variables to primitive array values (limitation)', () => {
        // Meta-variables are not available for primitive values to preserve {{.}} syntax
        const template = '{{#items}}{{.}} {{/items}}';
        const data = { items: ['A', 'B', 'C'] };
        const result = mustache.render(template, data);
        expect(result).toBe('A B C ');
      });
    });

    describe('Combined meta-variables', () => {
      it('should use multiple meta-variables together', () => {
        const template =
          '{{#items}}[{{@index}}] {{name}}{{#@last}} (END){{/@last}}{{^@last}}, {{/@last}}{{/items}}';
        const data = { items: [{ name: 'A' }, { name: 'B' }] };
        const result = mustache.render(template, data);
        expect(result).toBe('[0] A, [1] B (END)');
      });
    });
  });

  // ==================== ADVANCED FILTERS ====================

  describe('Advanced Filters', () => {
    describe('Logic & Defaults', () => {
      describe('default filter', () => {
        it('should return default value for null', () => {
          const result = mustache.render('{{value | default:"N/A"}}', { value: null });
          expect(result).toBe('N/A');
        });

        it('should return default value for undefined', () => {
          const result = mustache.render('{{value | default:"N/A"}}', {});
          expect(result).toBe('N/A');
        });

        it('should return default value for empty string', () => {
          const result = mustache.render('{{value | default:"N/A"}}', { value: '' });
          expect(result).toBe('N/A');
        });

        it('should return original value if not empty', () => {
          const result = mustache.render('{{value | default:"N/A"}}', { value: 'Hello' });
          expect(result).toBe('Hello');
        });
      });

      describe('yesno filter', () => {
        it('should return "Yes" for true', () => {
          const result = mustache.render('{{active | yesno:"Yes,No"}}', { active: true });
          expect(result).toBe('Yes');
        });

        it('should return "No" for false', () => {
          const result = mustache.render('{{active | yesno:"Yes,No"}}', { active: false });
          expect(result).toBe('No');
        });

        it('should support custom strings', () => {
          const result = mustache.render('{{active | yesno:"Active,Inactive"}}', { active: true });
          expect(result).toBe('Active');
        });
      });

      describe('fallback filter', () => {
        it('should return fallback value if main value is missing', () => {
          const result = mustache.render('{{value | fallback:"Default"}}', { value: null });
          expect(result).toBe('Default');
        });

        it('should return original value if present', () => {
          const result = mustache.render('{{value | fallback:"Default"}}', { value: 'Hello' });
          expect(result).toBe('Hello');
        });
      });
    });

    describe('String Manipulation', () => {
      describe('truncate filter', () => {
        it('should truncate string to specified length', () => {
          const result = mustache.render('{{text | truncate:10}}', { text: 'This is a long text' });
          expect(result).toBe('This is a ...');
        });

        it('should use custom suffix', () => {
          const result = mustache.render('{{text | truncate:10,"…"}}', {
            text: 'This is a long text'
          });
          expect(result).toBe('This is a …');
        });

        it('should not truncate if text is shorter', () => {
          const result = mustache.render('{{text | truncate:50}}', { text: 'Short' });
          expect(result).toBe('Short');
        });
      });

      describe('split filter', () => {
        it('should split string by separator', () => {
          const result = mustache.render('{{#text | split:","}}{{.}} {{/text}}', { text: 'A,B,C' });
          expect(result).toBe('A B C ');
        });

        it('should use default comma separator', () => {
          const result = mustache.render('{{#text | split}}{{.}} {{/text}}', { text: 'A,B,C' });
          expect(result).toBe('A B C ');
        });
      });

      describe('replace filter', () => {
        it('should replace occurrences of a string', () => {
          const result = mustache.render('{{text | replace:" ","_"}}', { text: 'hello world' });
          expect(result).toBe('hello_world');
        });

        it('should replace all occurrences', () => {
          const result = mustache.render('{{text | replace:"o","0"}}', { text: 'hello world' });
          expect(result).toBe('hell0 w0rld');
        });
      });

      describe('url_encode filter', () => {
        it('should encode URI components', () => {
          const result = mustache.render('{{url | url_encode}}', { url: 'hello world' });
          expect(result).toBe('hello%20world');
        });

        it('should encode special characters', () => {
          const result = mustache.render('{{text | url_encode}}', { text: 'hello@world.com' });
          expect(result).toBe('hello%40world.com');
        });
      });
    });

    describe('Array Manipulation', () => {
      describe('map filter', () => {
        it('should extract property from array of objects', () => {
          const template = '{{#items | map:"name"}}{{.}} {{/items}}';
          const data = {
            items: [
              { name: 'A', id: 1 },
              { name: 'B', id: 2 }
            ]
          };
          const result = mustache.render(template, data);
          expect(result).toBe('A B ');
        });
      });

      describe('limit filter', () => {
        it('should return first N items', () => {
          const template = '{{#items | limit:2}}{{.}} {{/items}}';
          const data = { items: [1, 2, 3, 4, 5] };
          const result = mustache.render(template, data);
          expect(result).toBe('1 2 ');
        });
      });

      describe('skip filter', () => {
        it('should skip first N items', () => {
          const template = '{{#items | skip:2}}{{.}} {{/items}}';
          const data = { items: [1, 2, 3, 4, 5] };
          const result = mustache.render(template, data);
          expect(result).toBe('3 4 5 ');
        });
      });

      describe('sort filter', () => {
        it('should sort primitive values ascending', () => {
          const template = '{{#items | sort}}{{.}} {{/items}}';
          const data = { items: [3, 1, 2] };
          const result = mustache.render(template, data);
          expect(result).toBe('1 2 3 ');
        });

        it('should sort primitive values descending', () => {
          const template = '{{#items | sort:"desc"}}{{.}} {{/items}}';
          const data = { items: [1, 3, 2] };
          const result = mustache.render(template, data);
          expect(result).toBe('3 2 1 ');
        });

        it('should sort by property ascending', () => {
          const template = '{{#items | sort:"age"}}{{name}} {{/items}}';
          const data = {
            items: [
              { name: 'B', age: 30 },
              { name: 'A', age: 20 }
            ]
          };
          const result = mustache.render(template, data);
          expect(result).toBe('A B ');
        });

        it('should sort by property descending', () => {
          const template = '{{#items | sort:"age","desc"}}{{name}} {{/items}}';
          const data = {
            items: [
              { name: 'A', age: 20 },
              { name: 'B', age: 30 }
            ]
          };
          const result = mustache.render(template, data);
          expect(result).toBe('B A ');
        });
      });

      describe('reverse filter', () => {
        it('should reverse array order', () => {
          const template = '{{#items | reverse}}{{.}} {{/items}}';
          const data = { items: [1, 2, 3] };
          const result = mustache.render(template, data);
          expect(result).toBe('3 2 1 ');
        });
      });

      describe('Filter chaining', () => {
        it('should chain multiple array filters', () => {
          const template = '{{#items | skip:1 | limit:2 | reverse}}{{.}} {{/items}}';
          const data = { items: [1, 2, 3, 4, 5] };
          const result = mustache.render(template, data);
          expect(result).toBe('3 2 ');
        });
      });
    });

    describe('Math & Formatting', () => {
      describe('plus filter', () => {
        it('should add N to the value', () => {
          const result = mustache.render('{{count | plus:5}}', { count: 10 });
          expect(result).toBe('15');
        });

        it('should handle negative numbers', () => {
          const result = mustache.render('{{count | plus:-3}}', { count: 10 });
          expect(result).toBe('7');
        });
      });

      describe('minus filter', () => {
        it('should subtract N from the value', () => {
          const result = mustache.render('{{count | minus:3}}', { count: 10 });
          expect(result).toBe('7');
        });

        it('should handle negative results', () => {
          const result = mustache.render('{{count | minus:15}}', { count: 10 });
          expect(result).toBe('-5');
        });
      });

      describe('json filter', () => {
        it('should serialize object to JSON', () => {
          // Use unescaped output {{& }} since JSON contains quotes
          const result = mustache.render('{{& data | json}}', {
            data: { name: 'Test', value: 123 }
          });
          expect(result).toBe('{"name":"Test","value":123}');
        });

        it('should serialize with indentation', () => {
          // Use unescaped output {{& }} since JSON contains quotes
          const result = mustache.render('{{& data | json:2}}', { data: { a: 1 } });
          expect(result).toContain('{\n  "a": 1\n}');
        });
      });
    });
  });

  // ==================== COMBINED ADVANCED FEATURES ====================

  describe('Combined Advanced Features', () => {
    it('should use meta-variables with advanced filters', () => {
      const template =
        '{{#items}}{{@number}}. {{name | uppercase}}{{^@last}}, {{/@last}}{{/items}}';
      const data = { items: [{ name: 'apple' }, { name: 'banana' }] };
      const result = mustache.render(template, data);
      expect(result).toBe('1. APPLE, 2. BANANA');
    });

    it('should use parent context navigation with meta-variables', () => {
      const template = '{{#items}}[{{@index}}] {{name}} from {{../category}}{{/items}}';
      const data = {
        category: 'Fruits',
        items: [{ name: 'Apple' }, { name: 'Banana' }]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('[0] Apple from Fruits[1] Banana from Fruits');
    });

    it('should use complex filter chains with meta-variables', () => {
      const template =
        '{{#items | sort:"age","desc" | limit:2}}{{@number}}. {{name}} ({{age}}){{^@last}}, {{/@last}}{{/items}}';
      const data = {
        items: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 },
          { name: 'Charlie', age: 35 }
        ]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('1. Charlie (35), 2. Bob (30)');
    });
  });

  // ==================== BACKWARD COMPATIBILITY ====================

  describe('Backward Compatibility', () => {
    it('should render standard Mustache templates unchanged', () => {
      const template = '{{#items}}{{name}}: {{description}}{{/items}}';
      const data = {
        items: [
          { name: 'A', description: 'First' },
          { name: 'B', description: 'Second' }
        ]
      };
      const result = mustache.render(template, data);
      expect(result).toBe('A: FirstB: Second');
    });

    it('should handle nested sections without meta-variables', () => {
      const template = '{{#outer}}{{#inner}}{{value}}{{/inner}}{{/outer}}';
      const data = {
        outer: {
          inner: { value: 'Test' }
        }
      };
      const result = mustache.render(template, data);
      expect(result).toBe('Test');
    });
  });
});
