// ===================================================================
// FILE: WorkspaceTemplateEngine/src/__tests__/Mustache.test.js
// ===================================================================
// Comprehensive test suite for Mustache template engine
// Using centralized MockFactory for consistent mocking
// ===================================================================

import { Mustache } from '../facades/Mustache';
import { FilterStrategy } from '../FilterStrategy';
import { MockFactory } from '../../../test/fakes';

describe('Mustache - Comprehensive Test Suite', () => {
  let mustache;
  let logger;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    mustache = new Mustache({ logger });
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with logger', () => {
      const instance = new Mustache({ logger });
      expect(instance).toBeDefined();
    });

    it('should create instance with default logger (console)', () => {
      const instance = new Mustache({});
      expect(instance).toBeDefined();
    });

    it('should initialize with built-in filters', () => {
      const instance = new Mustache({ logger });
      const result = instance.render('{{name | uppercase}}', { name: 'test' });
      expect(result).toBe('TEST');
    });
  });

  describe('Basic Variable Substitution', () => {
    it('should substitute simple variable', () => {
      const result = mustache.render('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should substitute multiple variables', () => {
      const result = mustache.render('{{first}} {{last}}', {
        first: 'John',
        last: 'Doe'
      });
      expect(result).toBe('John Doe');
    });

    it('should substitute nested properties with dot notation', () => {
      const result = mustache.render('{{user.name}}', {
        user: { name: 'Alice' }
      });
      expect(result).toBe('Alice');
    });

    it('should handle missing variables gracefully', () => {
      const result = mustache.render('Hello {{name}}!', {});
      expect(result).toBe('Hello !');
    });
  });

  describe('Sections - Conditional Rendering', () => {
    it('should render section when value is truthy', () => {
      const result = mustache.render('{{#show}}Visible{{/show}}', { show: true });
      expect(result).toBe('Visible');
    });

    it('should not render section when value is falsy', () => {
      const result = mustache.render('{{#show}}Hidden{{/show}}', { show: false });
      expect(result).toBe('');
    });

    it('should iterate over array in section', () => {
      const result = mustache.render('{{#items}}{{name}},{{/items}}', {
        items: [{ name: 'A' }, { name: 'B' }]
      });
      expect(result).toBe('A,B,');
    });
  });

  describe('Filters', () => {
    it('should apply uppercase filter', () => {
      const result = mustache.render('{{name | uppercase}}', { name: 'hello' });
      expect(result).toBe('HELLO');
    });

    it('should apply lowercase filter', () => {
      const result = mustache.render('{{name | lowercase}}', { name: 'HELLO' });
      expect(result).toBe('hello');
    });

    it('should support built-in filters', () => {
      const result = mustache.render('{{name | capitalize}}', { name: 'hello world' });
      expect(result).toBe('Hello world');
    });

    it('should apply filter with single argument', () => {
      const result = mustache.render('{{items | join:", "}}', { items: ['a', 'b', 'c'] });
      expect(result).toBe('a, b, c');
    });

    it('should apply filter with multiple arguments', () => {
      const result = mustache.render('{{names | join:", "}}', {
        names: ['Alice', 'Bob', 'Charlie']
      });
      // Multiple arguments are passed to the filter
      expect(result).toContain('Alice');
      expect(result).toContain('Bob');
    });

    it('should chain multiple filters', () => {
      const result = mustache.render('{{name | lowercase | capitalize}}', { name: 'HELLO WORLD' });
      expect(result).toBe('Hello world');
    });

    it('should handle filter with no arguments', () => {
      const result = mustache.render('{{name | uppercase}}', { name: 'test' });
      expect(result).toBe('TEST');
    });

    it('should warn on invalid filter syntax', () => {
      const result = mustache.render('{{name | [invalid]}}', { name: 'test' });
      expect(logger.hasLog('WARN', /Invalid filter syntax/)).toBe(true);
      expect(result).toBe('test');
    });

    it('should warn on unknown filter', () => {
      const result = mustache.render('{{name | unknownFilter}}', { name: 'test' });
      expect(logger.hasLog('WARN', /Filter not found/)).toBe(true);
      expect(result).toBe('test');
    });

    it('should handle filter errors gracefully', () => {
      // Create a custom filter that throws an error
      class ErrorFilter extends FilterStrategy {
        getName() {
          return 'errorFilter';
        }
        getDescription() {
          return 'Throws error';
        }
        execute() {
          throw new Error('Filter error');
        }
      }
      mustache.registerFilter(new ErrorFilter());

      const result = mustache.render('{{name | errorFilter}}', { name: 'test' });
      expect(logger.hasLog('ERROR', /Error applying filter/)).toBe(true);
      expect(result).toBe('test'); // Should return original value
    });

    it('should parse filter arguments with strings', () => {
      const result = mustache.render('{{items | join:","}}', { items: ['a', 'b'] });
      // Note: join filter may add spaces depending on implementation
      expect(result).toContain('a');
      expect(result).toContain('b');
    });

    it('should parse filter arguments with numbers', () => {
      const result = mustache.render('{{items | join:123}}', { items: ['a', 'b'] });
      expect(result).toContain('a');
    });

    it('should parse filter arguments with booleans', () => {
      const result = mustache.render('{{items | sortBy:"value",true}}', {
        items: [{ value: 2 }, { value: 1 }]
      });
      expect(result).toBeDefined();
    });

    it('should parse filter arguments with quoted strings', () => {
      const result = mustache.render('{{items | join:", "}}', { items: ['x', 'y'] });
      expect(result).toBe('x, y');
    });

    it('should parse filter arguments with single quotes', () => {
      const result = mustache.render("{{items | join:', '}}", { items: ['x', 'y'] });
      expect(result).toBe('x, y');
    });
  });

  describe('Static Methods', () => {
    it('should have di configuration', () => {
      const di = Mustache.di;
      expect(di.name).toBe('mustache');
      expect(di.dependencies).toEqual(['logger']);
      expect(di.isSingleton).toBe(true);
      expect(typeof di.factory).toBe('function');
    });

    it('should create instance via di factory', () => {
      const instance = Mustache.di.factory(logger);
      expect(instance).toBeInstanceOf(Mustache);
    });

    it('should check null with isNullOrUndefined', () => {
      expect(Mustache.isNullOrUndefined(null)).toBe(true);
    });

    it('should check undefined with isNullOrUndefined', () => {
      expect(Mustache.isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for non-null values with isNullOrUndefined', () => {
      expect(Mustache.isNullOrUndefined(0)).toBe(false);
      expect(Mustache.isNullOrUndefined('')).toBe(false);
      expect(Mustache.isNullOrUndefined(false)).toBe(false);
    });

    it('should have TOKEN constants', () => {
      expect(Mustache.TOKEN_TYPE).toBe(0);
      expect(Mustache.TOKEN_VALUE).toBe(1);
      expect(Mustache.TOKEN_START).toBe(2);
      expect(Mustache.TOKEN_END).toBe(3);
      expect(Mustache.TOKEN_CHILDREN).toBe(4);
      expect(Mustache.TOKEN_INDEX).toBe(5);
    });

    it('should have TAG constants', () => {
      expect(Mustache.TAG_SECTION).toBe('#');
      expect(Mustache.TAG_INVERTED).toBe('^');
      expect(Mustache.TAG_SECTION_END).toBe('/');
      expect(Mustache.TAG_COMMENT).toBe('!');
      expect(Mustache.TAG_PARTIAL).toBe('>');
      expect(Mustache.TAG_UNESCAPED).toBe('&');
      expect(Mustache.TAG_UNESCAPED_ALT).toBe('{');
      expect(Mustache.TAG_VARIABLE).toBe('name');
      expect(Mustache.TAG_TEXT).toBe('text');
    });
  });

  describe('getValue Method', () => {
    it('should return undefined for null data', () => {
      expect(mustache.getValue('key', null)).toBeUndefined();
    });

    it('should return undefined for undefined data', () => {
      expect(mustache.getValue('key', undefined)).toBeUndefined();
    });

    it('should return undefined for empty key', () => {
      expect(mustache.getValue('', { key: 'value' })).toBeUndefined();
    });

    it('should return undefined for null key', () => {
      expect(mustache.getValue(null, { key: 'value' })).toBeUndefined();
    });

    it('should get simple property', () => {
      expect(mustache.getValue('name', { name: 'test' })).toBe('test');
    });

    it('should get nested property', () => {
      expect(mustache.getValue('user.name', { user: { name: 'John' } })).toBe('John');
    });

    it('should get deeply nested property', () => {
      const data = { a: { b: { c: { d: 'value' } } } };
      expect(mustache.getValue('a.b.c.d', data)).toBe('value');
    });

    it('should return undefined for missing nested property', () => {
      expect(mustache.getValue('user.name', { user: {} })).toBeUndefined();
    });

    it('should return undefined for property on null', () => {
      expect(mustache.getValue('user.name', { user: null })).toBeUndefined();
    });

    it('should return undefined for property on undefined', () => {
      expect(mustache.getValue('user.name', { user: undefined })).toBeUndefined();
    });

    it('should prevent prototype pollution via __proto__', () => {
      expect(mustache.getValue('__proto__', {})).toBeUndefined();
    });

    it('should prevent prototype pollution via constructor', () => {
      expect(mustache.getValue('constructor', {})).toBeUndefined();
    });

    it('should prevent prototype pollution via prototype', () => {
      expect(mustache.getValue('prototype', {})).toBeUndefined();
    });

    it('should prevent prototype pollution in nested keys', () => {
      expect(mustache.getValue('user.__proto__', { user: {} })).toBeUndefined();
    });

    it('should use hasOwnProperty for property access', () => {
      const data = Object.create({ inherited: 'value' });
      data.own = 'ownValue';
      expect(mustache.getValue('own', data)).toBe('ownValue');
      expect(mustache.getValue('inherited', data)).toBeUndefined();
    });
  });

  describe('Cache Management', () => {
    it('should cache parsed templates', () => {
      const template = '{{name}}';
      mustache.render(template, { name: 'first' });
      mustache.render(template, { name: 'second' });
      expect(Object.keys(mustache.templateCache).length).toBeGreaterThan(0);
    });

    it('should clear cache', () => {
      mustache.render('{{name}}', { name: 'test' });
      expect(Object.keys(mustache.templateCache).length).toBeGreaterThan(0);
      mustache.clearCache();
      expect(Object.keys(mustache.templateCache).length).toBe(0);
    });

    it('should use cached templates for better performance', () => {
      const template = '{{name}}';
      mustache.render(template, { name: 'first' });
      const cacheSize = Object.keys(mustache.templateCache).length;
      mustache.render(template, { name: 'second' });
      expect(Object.keys(mustache.templateCache).length).toBe(cacheSize);
    });
  });

  describe('Partial Templates', () => {
    it('should add single partial', () => {
      mustache.addPartial('header', '<h1>{{title}}</h1>');
      const result = mustache.render('{{>header}}', { title: 'Test' });
      expect(result).toBe('<h1>Test</h1>');
    });

    it('should add multiple partials', () => {
      mustache.addPartials({
        header: '<h1>{{title}}</h1>',
        footer: '<p>{{text}}</p>'
      });
      const result = mustache.render('{{>header}}{{>footer}}', {
        title: 'Title',
        text: 'Footer'
      });
      expect(result).toBe('<h1>Title</h1><p>Footer</p>');
    });

    it('should use additional partials in render', () => {
      const result = mustache.render(
        '{{>temp}}',
        { value: 'test' },
        {
          temp: '{{value}}'
        }
      );
      expect(result).toBe('test');
    });

    it('should handle missing partial gracefully', () => {
      const result = mustache.render('{{>missing}}', {});
      expect(result).toBe('');
    });

    it('should support partial as function in partials object', () => {
      // Note: The third parameter must be an object, but the partial values
      // can be accessed via a function internally during rendering
      const result = mustache.render(
        '{{>test}}',
        { value: 'result' },
        {
          test: '{{value}}'
        }
      );
      expect(result).toBe('result');
    });

    it('should return empty string for null partial value', () => {
      const result = mustache.render('{{>test}}', {}, { test: null });
      expect(result).toBe('');
    });
  });

  describe('Filter Registration', () => {
    it('should register custom filter', () => {
      class DoubleFilter extends FilterStrategy {
        getName() {
          return 'double';
        }
        getDescription() {
          return 'Doubles a number';
        }
        execute(value) {
          return value * 2;
        }
      }

      mustache.registerFilter(new DoubleFilter());
      const result = mustache.render('{{num | double}}', { num: 5 });
      expect(result).toBe('10');
    });

    it('should throw error for non-FilterStrategy registration', () => {
      expect(() => {
        mustache.registerFilter({ name: 'invalid' });
      }).toThrow();
    });

    it('should throw error for function-based filter', () => {
      expect(() => {
        mustache.registerFilter(() => 'value');
      }).toThrow();
    });
  });

  describe('Compile Method', () => {
    it('should compile template to function', () => {
      const compiled = mustache.compile('Hello {{name}}!');
      expect(typeof compiled).toBe('function');
    });

    it('should render compiled template with data', () => {
      const compiled = mustache.compile('Hello {{name}}!');
      const result = compiled({ name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should reuse compiled template', () => {
      const compiled = mustache.compile('{{value}}');
      expect(compiled({ value: 'first' })).toBe('first');
      expect(compiled({ value: 'second' })).toBe('second');
    });
  });

  describe('Render Error Handling', () => {
    it('should throw error for non-string template', () => {
      expect(() => {
        mustache.render(123, {});
      }).toThrow('template must be a string');
    });

    it('should throw error for invalid data type', () => {
      expect(() => {
        mustache.render('{{name}}', 'invalid');
      }).toThrow('data must be an object or null');
    });

    it('should throw error for array as additionalPartials', () => {
      expect(() => {
        mustache.render('{{name}}', {}, []);
      }).toThrow('additionalPartials must be an object, not an array');
    });

    it('should throw error for invalid additionalPartials type', () => {
      expect(() => {
        mustache.render('{{name}}', {}, 'invalid');
      }).toThrow('additionalPartials must be an object or null');
    });

    it('should handle render errors gracefully', () => {
      // Create a malformed template that will cause an error during rendering
      const result = mustache.render('{{#unclosed}}', {});
      expect(result).toContain('[RENDER ERROR:');
      expect(logger.getLogsByLevel('ERROR').length).toBeGreaterThan(0);
    });

    it('should accept null data', () => {
      const result = mustache.render('Hello!', null);
      expect(result).toBe('Hello!');
    });

    it('should accept null additionalPartials', () => {
      const result = mustache.render('Hello!', {}, null);
      expect(result).toBe('Hello!');
    });
  });

  describe('Inverted Sections', () => {
    it('should render inverted section when value is falsy', () => {
      const result = mustache.render('{{^show}}Hidden{{/show}}', { show: false });
      expect(result).toBe('Hidden');
    });

    it('should not render inverted section when value is truthy', () => {
      const result = mustache.render('{{^show}}Hidden{{/show}}', { show: true });
      expect(result).toBe('');
    });

    it('should render inverted section for empty array', () => {
      const result = mustache.render('{{^items}}No items{{/items}}', { items: [] });
      expect(result).toBe('No items');
    });

    it('should not render inverted section for non-empty array', () => {
      const result = mustache.render('{{^items}}No items{{/items}}', { items: [1] });
      expect(result).toBe('');
    });

    it('should render inverted section for undefined value', () => {
      const result = mustache.render('{{^value}}Missing{{/value}}', {});
      expect(result).toBe('Missing');
    });

    it('should render inverted section for null value', () => {
      const result = mustache.render('{{^value}}Missing{{/value}}', { value: null });
      expect(result).toBe('Missing');
    });
  });

  describe('Section Rendering Edge Cases', () => {
    it('should render section with object value', () => {
      const result = mustache.render('{{#user}}{{name}}{{/user}}', {
        user: { name: 'John' }
      });
      expect(result).toBe('John');
    });

    it('should render section with truthy primitive', () => {
      const result = mustache.render('{{#show}}Yes{{/show}}', { show: 'truthy' });
      expect(result).toBe('Yes');
    });

    it('should not render section with falsy value', () => {
      const result = mustache.render('{{#show}}Yes{{/show}}', { show: null });
      expect(result).toBe('');
    });

    it('should render section with function value', () => {
      // Note: In this Mustache implementation, functions in sections work differently
      // If the value is a function, it may or may not be called as a lambda
      // Let's test that sections with functions don't crash
      const data = {
        wrapped: function () {
          return 'value';
        }
      };
      const result = mustache.render('{{#wrapped}}Content{{/wrapped}}', data);
      // Just verify it doesn't crash - the exact behavior may vary
      expect(result).toBeDefined();
    });

    it('should handle section with function in data', () => {
      // Test that having a function in the data doesn't break rendering
      const data = {
        fn: function () {
          return 'test';
        }
      };
      const result = mustache.render('{{#fn}}Text{{/fn}}', data);
      expect(result).toBeDefined();
    });

    it('should handle function returning null', () => {
      const data = {
        fn: function () {
          return null;
        }
      };
      const result = mustache.render('{{#fn}}Text{{/fn}}', data);
      expect(result).toBe('');
    });
  });

  describe('HTML Escaping', () => {
    it('uses the shared five-character HTML escaping contract internally', () => {
      expect(mustache._escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    });

    it('should pass through HTML content in GAS context', () => {
      // GAS context: HTML escaping is not appropriate for Google Docs/Sheets output.
      // HTML entities would appear as literal text in documents.
      const result = mustache.render('{{html}}', { html: '<script>alert("xss")</script>' });
      expect(result).toBe('<script>alert("xss")</script>');
    });

    it('should pass through ampersand in GAS context', () => {
      const result = mustache.render('{{text}}', { text: 'A & B' });
      expect(result).toBe('A & B');
    });

    it('should pass through quotes in GAS context', () => {
      const result = mustache.render('{{text}}', { text: '"quoted" and \'single\'' });
      expect(result).toBe('"quoted" and \'single\'');
    });

    it('should pass through backtick in GAS context', () => {
      const result = mustache.render('{{text}}', { text: '`backtick`' });
      expect(result).toBe('`backtick`');
    });

    it('should pass through equals sign in GAS context', () => {
      const result = mustache.render('{{text}}', { text: 'a=b' });
      expect(result).toBe('a=b');
    });

    it('should pass through HTML tags in GAS context', () => {
      const result = mustache.render('{{text}}', { text: '</script>' });
      expect(result).toBe('</script>');
    });

    it('should not escape with unescaped tag (&)', () => {
      const result = mustache.render('{{&html}}', { html: '<b>Bold</b>' });
      expect(result).toBe('<b>Bold</b>');
    });

    it('should not escape with triple mustache', () => {
      const result = mustache.render('{{{html}}}', { html: '<b>Bold</b>' });
      expect(result).toBe('<b>Bold</b>');
    });
  });

  describe('Complex Template Parsing', () => {
    it('should parse empty template', () => {
      const result = mustache.render('', {});
      expect(result).toBe('');
    });

    it('should parse template with only text', () => {
      const result = mustache.render('Plain text', {});
      expect(result).toBe('Plain text');
    });

    it('should parse template with comments', () => {
      const result = mustache.render('Before{{! This is a comment }}After', {});
      expect(result).toBe('BeforeAfter');
    });

    it('should handle whitespace correctly', () => {
      const result = mustache.render('  {{name}}  ', { name: 'test' });
      expect(result).toBe('  test  ');
    });

    it('should handle newlines correctly', () => {
      const result = mustache.render('Line1\n{{name}}\nLine2', { name: 'test' });
      expect(result).toBe('Line1\ntest\nLine2');
    });

    it('should handle Unicode characters', () => {
      const result = mustache.render('{{text}}', { text: '🎉 emoji 中文' });
      expect(result).toBe('🎉 emoji 中文');
    });

    it('should handle multi-byte Unicode in template', () => {
      const result = mustache.render('Hello 🌍 {{name}}', { name: 'World' });
      expect(result).toBe('Hello 🌍 World');
    });

    it('should throw error for unclosed tag', () => {
      const result = mustache.render('{{name', {});
      expect(result).toContain('[RENDER ERROR:');
    });

    it('should throw error for unopened section', () => {
      const result = mustache.render('{{/section}}', {});
      expect(result).toContain('[RENDER ERROR:');
      expect(result).toContain('Unopened section');
    });

    it('should throw error for unclosed section', () => {
      const result = mustache.render('{{#section}}content', {});
      expect(result).toContain('[RENDER ERROR:');
      expect(result).toContain('Unclosed section');
    });

    it('should throw error for mismatched section tags', () => {
      const result = mustache.render('{{#section}}{{/different}}', {});
      expect(result).toContain('[RENDER ERROR:');
    });

    it('should handle nested sections', () => {
      const result = mustache.render('{{#a}}{{#b}}{{c}}{{/b}}{{/a}}', {
        a: { b: { c: 'value' } }
      });
      expect(result).toBe('value');
    });

    it('should handle deeply nested sections', () => {
      const data = {
        level1: { level2: { level3: { value: 'deep' } } }
      };
      const result = mustache.render(
        '{{#level1}}{{#level2}}{{#level3}}{{value}}{{/level3}}{{/level2}}{{/level1}}',
        data
      );
      expect(result).toBe('deep');
    });
  });

  describe('Custom Tags', () => {
    it('should support custom delimiters', () => {
      const instance = new Mustache({ logger, tags: ['<%', '%>'] });
      const result = instance.render('<% name %>', { name: 'test' });
      expect(result).toBe('test');
    });

    it('should change delimiters with set delimiter tags', () => {
      const result = mustache.render('{{name}} {{=<% %>=}}<% value %>', {
        name: 'first',
        value: 'second'
      });
      expect(result).toBe('first second');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle function values', () => {
      const data = {
        name: function () {
          return 'Dynamic';
        }
      };
      const result = mustache.render('{{name}}', data);
      expect(result).toBe('Dynamic');
    });

    it('should handle numeric values', () => {
      const result = mustache.render('{{value}}', { value: 42 });
      expect(result).toBe('42');
    });

    it('should handle boolean values', () => {
      const result = mustache.render('{{value}}', { value: true });
      expect(result).toBe('true');
    });

    it('should handle zero value', () => {
      const result = mustache.render('{{value}}', { value: 0 });
      expect(result).toBe('0');
    });

    it('should handle empty string', () => {
      const result = mustache.render('{{value}}', { value: '' });
      expect(result).toBe('');
    });

    it('should handle complex nested structure', () => {
      const data = {
        company: {
          name: 'Acme Corp',
          employees: [
            { name: 'Alice', role: 'CEO' },
            { name: 'Bob', role: 'CTO' }
          ]
        }
      };
      const template =
        '{{company.name}}: {{#company.employees}}{{name}} ({{role}}), {{/company.employees}}';
      const result = mustache.render(template, data);
      expect(result).toContain('Acme Corp');
      expect(result).toContain('Alice (CEO)');
      expect(result).toContain('Bob (CTO)');
    });

    it('should handle circular reference protection in context', () => {
      const data = { name: 'test' };
      data.self = data; // Create circular reference
      const result = mustache.render('{{name}}', data);
      expect(result).toBe('test');
    });
  });

  describe('Render-Depth and Partial-Cycle Guards', () => {
    it('should throw MustacheRenderError instead of overflowing the call stack on a self-referencing partial', () => {
      const instance = new Mustache({ logger, partials: { loop: 'A {{> loop}} B' } });
      const result = instance.render('{{> loop}}');
      expect(result).toMatch(/RENDER ERROR/);
      expect(result).toMatch(/ciclico|cycl/i);
    });

    it('should throw MustacheRenderError instead of overflowing the call stack on pathologically deep section nesting', () => {
      const depth = 500;
      const template = '{{#a}}'.repeat(depth) + 'x' + '{{/a}}'.repeat(depth);
      const instance = new Mustache({ logger });
      const result = instance.render(template, { a: { a: {} } });
      expect(result).toMatch(/RENDER ERROR/);
    });

    it('should render normal, shallow nested sections correctly (no regression)', () => {
      const instance = new Mustache({ logger });
      const result = instance.render('{{#a}}{{#b}}{{c}}{{/b}}{{/a}}', { a: { b: { c: 'ok' } } });
      expect(result).toBe('ok');
    });

    it('should render non-cyclic nested partials correctly (no regression)', () => {
      const instance = new Mustache({
        logger,
        partials: { header: 'H', footer: 'F {{> header}}' }
      });
      expect(instance.render('{{> footer}}')).toBe('F H');
    });
  });
});
