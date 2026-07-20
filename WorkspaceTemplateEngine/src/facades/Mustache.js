import { FilterRegistry, FilterStrategy } from '../FilterStrategy.js';
import { createBuiltInFilters } from '../internal/filters/BuiltInFilters.js';
import { createAdvancedFilters } from '../internal/filters/AdvancedFilters.js';
import { BaseError, HtmlSanitizer } from '@CoreUtilsLib';

/**
 * @class MustacheRenderError
 * @extends BaseError
 * @description Thrown when template rendering exceeds the maximum nesting depth or
 * detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
 * instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
 * template is malformed (ref analysis_3_structural_errors.md Finding 3).
 */
class MustacheRenderError extends BaseError {}

/**
 * @description State-tracking scanner for incremental Mustache template parsing.
 * @private
 * @class
 */
class _MustacheScanner {
  constructor(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * @description Checks if the scanner has reached the end of the input string.
   * @returns {boolean} True if no characters remain in the tail.
   */
  eos() {
    return this.tail === '';
  }

  /**
   * @description Attempts to match a regular expression at the current position.
   * @param {RegExp} re Regular expression anchored to the start of the tail.
   * @returns {string} The matched string fragment or an empty string if no match.
   */
  scan(re) {
    const match = this.tail.match(re);
    if (!match || match.index !== 0) {
      return '';
    }
    const string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  }

  /**
   * @description Consumes characters from the tail until the specified pattern is encountered.
   * @param {RegExp} re Regular expression pattern to search for.
   * @returns {string} The captured string content preceding the match.
   */
  scanUntil(re) {
    const index = this.tail.search(re);
    let match;
    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
  }
}

/**
 * @description Hierarchical context stack for Mustache variable resolution.
 * Supports parent context navigation ('../') and dot-notation property access.
 * @private
 * @class
 */
class _MustacheContext {
  constructor(view, parentContext) {
    this.view = view;
    // Initialize cache with '.' pointing to view, but check if view has its own '.' property
    // This allows us to wrap primitives with meta-variables: { '.': primitive, '@index': 0, ... }
    const dotValue =
      view != null && typeof view === 'object' && Object.prototype.hasOwnProperty.call(view, '.')
        ? view['.']
        : view;
    this.cache = { '.': dotValue };
    this.parent = parentContext;
  }

  /**
   * @description Creates a child context by pushing a new data view onto the stack.
   * @param {*} view The data object or primitive for the new context level.
   * @returns {_MustacheContext} A new context instance linked to the current one as parent.
   */
  push(view) {
    return new _MustacheContext(view, this);
  }

  /**
   * @description Resolves a value by key name across the current and parent contexts.
   * Supports Handlebars-style '../' navigation and deep property paths.
   * @param {string} name Identifier or path (e.g., 'user.name', '../title').
   * @returns {*} Resolved value or undefined.
   */
  lookup(name) {
    const cache = this.cache;
    let value;
    if (Object.prototype.hasOwnProperty.call(cache, name)) {
      value = cache[name];
    } else {
      let context = this,
        intermediateValue,
        names,
        index,
        lookupHit = false;

      // Handle parent context navigation (../)
      let parentLevels = 0;
      let remainingName = name;

      // Count how many '../' prefixes exist
      while (remainingName.startsWith('../')) {
        parentLevels++;
        remainingName = remainingName.substring(3); // Remove '../'
      }

      // Traverse up the context stack
      let targetContext = context;
      for (let i = 0; i < parentLevels && targetContext; i++) {
        targetContext = targetContext.parent;
      }

      // If we traversed too far up (no parent exists), return undefined
      if (parentLevels > 0 && !targetContext) {
        value = undefined;
      } else {
        // Start lookup from the target context (could be parent or current)
        context = targetContext || this;

        while (context) {
          if (remainingName.indexOf('.') > 0) {
            intermediateValue = context.view;
            names = remainingName.split('.');
            index = 0;
            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1) {
                // SEC-006: Use hasOwnProperty to prevent prototype pollution
                lookupHit =
                  intermediateValue != null &&
                  typeof intermediateValue === 'object' &&
                  Object.prototype.hasOwnProperty.call(intermediateValue, names[index]);
              }
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[remainingName];
            // SEC-006: Use hasOwnProperty to prevent prototype pollution
            lookupHit =
              context.view != null &&
              typeof context.view === 'object' &&
              Object.prototype.hasOwnProperty.call(context.view, remainingName);
          }
          if (lookupHit) {
            value = intermediateValue;
            break;
          }

          // If we explicitly navigated to parent, don't traverse further up
          if (parentLevels > 0) {
            break;
          }

          context = context.parent;
        }
      }

      // SEC-006: Prevent prototype pollution via cache assignment
      if (!this._isDangerousKey(name)) {
        cache[name] = value;
      }
    }
    if (typeof value === 'function') {
      value = value.call(this.view);
    }
    return value;
  }

  /**
   * @description Security guard against prototype pollution during context lookups.
   * @param {string} key Property key to validate.
   * @returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
   * @private
   */
  _isDangerousKey(key) {
    // SEC-006: Prevent prototype pollution
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }
}

/**
 * @description Adapter for converting standard functions into FilterStrategy instances.
 * Enables backward compatibility with functional filter registrations.
 * @private
 * @class
 */
class _FunctionFilterStrategy extends FilterStrategy {
  constructor(name, fn) {
    super();
    this._name = name;
    this._fn = fn;
  }
  getName() {
    return this._name;
  }
  getDescription() {
    return `Custom filter: ${this._name}`;
  }
  execute(value, ...args) {
    return this._fn(value, ...args);
  }
}

/**
 * @description Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
 * Implements template caching, prototype pollution protection, and Strategy-based filter registry.
 * @class
 * @version 2.1.0
 * @example
 * const mustache = new MyMustache({ logger: console });
 * const result = mustache.render('{{items | join:", "}}', { items: [1, 2, 3] });
 */
export class MyMustache {
  /**
   * @description Dependency injection manifest for the Mustache service.
   * @returns {Object} DI configuration object.
   * @static
   */
  static get di() {
    return {
      name: 'mustache',
      dependencies: ['logger'],
      isSingleton: true,
      factory: (logger) => new MyMustache({ logger })
    };
  }

  /**
   * @description Strict null/undefined check for template value resolution.
   * @param {*} value Value to evaluate.
   * @returns {boolean} True if value is null or undefined.
   * @static
   */
  static isNullOrUndefined(value) {
    return value === null || value === undefined;
  }

  /** @description Token array index for type identifier. @static */
  static get TOKEN_TYPE() {
    return 0;
  }
  /** @description Token array index for raw string value. @static */
  static get TOKEN_VALUE() {
    return 1;
  }
  /** @description Token array index for start character position. @static */
  static get TOKEN_START() {
    return 2;
  }
  /** @description Token array index for end character position. @static */
  static get TOKEN_END() {
    return 3;
  }
  /** @description Token array index for child token collection. @static */
  static get TOKEN_CHILDREN() {
    return 4;
  }
  /** @description Token array index for closing tag position. @static */
  static get TOKEN_INDEX() {
    return 5;
  }

  /** @description Section start tag identifier (#). @static */
  static get TAG_SECTION() {
    return '#';
  }
  /** @description Inverted section start tag identifier (^). @static */
  static get TAG_INVERTED() {
    return '^';
  }
  /** @description Section end tag identifier (/). @static */
  static get TAG_SECTION_END() {
    return '/';
  }
  /** @description Comment tag identifier (!). @static */
  static get TAG_COMMENT() {
    return '!';
  }
  /** @description Partial inclusion tag identifier (>). @static */
  static get TAG_PARTIAL() {
    return '>';
  }
  /** @description Unescaped variable tag identifier (&). @static */
  static get TAG_UNESCAPED() {
    return '&';
  }
  /** @description Alternative unescaped variable tag identifier ({). @static */
  static get TAG_UNESCAPED_ALT() {
    return '{';
  }
  /** @description Regular variable token type name. @static */
  static get TAG_VARIABLE() {
    return 'name';
  }
  /** @description Plain text token type name. @static */
  static get TAG_TEXT() {
    return 'text';
  }

  /** @description Maximum combined section/partial nesting depth before render() throws MustacheRenderError. @static */
  static get MAX_RENDER_DEPTH() {
    return 100;
  }

  /**
   * @description Initializes the engine, configures dependencies, and auto-registers built-in filters.
   * @param {Object} [options={}] Configuration options.
   * @param {LoggerService} [options.logger=console] Diagnostic logger.
   * @param {UtilsService} [options.utils] Optional utility service for advanced date formatting.
   * @param {Object.<string, string>} [options.partials={}] Pre-defined partial templates.
   * @param {string[]} [options.tags=['{{', '}}']] Custom tag delimiters.
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.utils = options.utils;
    this.partials = options.partials || {};
    this.tags = options.tags || ['{{', '}}'];
    this.templateCache = {};

    // WTE-HIGH-001: Use FilterRegistry for extensible filter management
    this.filterRegistry = new FilterRegistry(this.logger);

    this._initBuiltInFilters();
  }

  /**
   * @description Security guard against prototype pollution during context lookups.
   * @param {string} key Property key to validate.
   * @returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
   * @private
   */
  _isDangerousKey(key) {
    // SEC-006: Prevent prototype pollution
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  /**
   * @description Resolves a deep property value using dot-notation, with prototype pollution protection.
   * @param {string} key Dot-separated property path (e.g., 'user.profile.name').
   * @param {Object} data Source object for resolution.
   * @returns {*} Resolved value or undefined if path is invalid or blocked.
   */
  getValue(key, data) {
    if (!key || !data) {
      return undefined;
    }
    // If key has no dots, it's direct access
    if (key.indexOf('.') === -1) {
      // GEL-C004: Prevent prototype pollution
      if (this._isDangerousKey(key)) {
        return undefined;
      }
      // Use hasOwnProperty to prevent prototype access
      return typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, key)
        ? data[key]
        : undefined;
    }
    // Otherwise, navigate the object
    const keys = key.split('.');
    let current = data;
    for (let i = 0; i < keys.length; i++) {
      // WTE-M004: Use standardized null checking
      if (MyMustache.isNullOrUndefined(current)) {
        return undefined;
      }
      // GEL-C004: Prevent prototype pollution for each key in the path
      const currentKey = keys[i];
      if (this._isDangerousKey(currentKey)) {
        return undefined;
      }
      // Use hasOwnProperty to prevent prototype access
      if (
        typeof current === 'object' &&
        Object.prototype.hasOwnProperty.call(current, currentKey)
      ) {
        current = current[currentKey];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * @description Internal bootstrap for loading built-in and advanced filter strategies.
   * @private
   */
  _initBuiltInFilters() {
    // Create all built-in filter strategies
    const builtInFilters = createBuiltInFilters(this.utils);

    // Create all advanced filter strategies (Handlebars/Liquid-inspired)
    const advancedFilters = createAdvancedFilters();

    // Register them with the filter registry
    this.filterRegistry.registerAll(builtInFilters);
    this.filterRegistry.registerAll(advancedFilters);
  }

  /**
   * @description Purges the internal template cache to reclaim memory.
   */
  clearCache() {
    this.templateCache = {};
  }

  /**
   * @description Registers a named partial template for global inclusion.
   * @param {string} name Unique partial identifier.
   * @param {string} template Partial template string.
   */
  addPartial(name, template) {
    this.partials[name] = template;
  }

  /**
   * @description Batch registers multiple partial templates.
   * @param {Object.<string, string>} partialsObject Map of names to template strings.
   */
  addPartials(partialsObject) {
    Object.assign(this.partials, partialsObject);
  }

  /**
   * @description Registers a custom filter strategy.
   * @param {FilterStrategy|string} filterStrategyOrName FilterStrategy instance or name for backward compatibility.
   * @param {Function} [fn] Filter function (v1.x compatibility).
   * @throws {Error} If registration fails or invalid types provided.
   */
  registerFilter(filterStrategyOrName, fn) {
    // Support both v2.0 (FilterStrategy instance) and v1.x (name + function) APIs
    if (typeof filterStrategyOrName === 'string' && typeof fn === 'function') {
      // v1.x backward compatibility: wrap function into a FilterStrategy
      const name = filterStrategyOrName;
      const wrappedFilter = new _FunctionFilterStrategy(name, fn);
      this.filterRegistry.register(wrappedFilter);
      return;
    }

    if (!(filterStrategyOrName instanceof FilterStrategy)) {
      throw new Error(
        'registerFilter: Expected a FilterStrategy instance. Create a class extending FilterStrategy.'
      );
    }
    this.filterRegistry.register(filterStrategyOrName);
  }

  /**
   * @description Compiles a template into a reusable execution function.
   * @param {string} template Mustache template string.
   * @returns {function(Object): string} Renderer function bound to this engine instance.
   */
  compile(template) {
    return (data) => this.render(template, data);
  }

  /**
   * @description Executes template rendering with data substitution and partial resolution.
   * @param {string} template Mustache template string.
   * @param {Object} [data={}] View model data.
   * @param {Object} [additionalPartials={}] Render-specific partial overrides.
   * @returns {string} Rendered output or error diagnostic string.
   * @throws {TypeError} If input arguments are invalid.
   */
  render(template, data = {}, additionalPartials = {}) {
    // WTE-M005: Input validation
    if (typeof template !== 'string') {
      throw new TypeError('template must be a string');
    }
    if (data !== null && typeof data !== 'object') {
      throw new TypeError('data must be an object or null');
    }
    if (additionalPartials !== null && typeof additionalPartials !== 'object') {
      throw new TypeError('additionalPartials must be an object or null');
    }
    if (Array.isArray(additionalPartials)) {
      throw new TypeError('additionalPartials must be an object, not an array');
    }

    try {
      const tokens = this._parse(template);
      const context = new _MustacheContext(data);
      const partials = { ...this.partials, ...additionalPartials };
      const state = { depth: 0, partialStack: [] };
      return this._renderTokens(tokens, context, partials, template, state);
    } catch (e) {
      this.logger.error(`MyMustache render error: ${e.message}\n${e.stack}`);
      return `[RENDER ERROR: ${e.message}]`;
    }
  }

  /**
   * @description Escapes characters for use in a literal regular expression.
   * @param {string} string Input string.
   * @returns {string} Regex-safe escaped string.
   * @private
   */
  _escapeRegExp(string) {
    return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * @description Robust HTML entity encoding for XSS prevention.
   * Encodes &, <, >, ", ', `, and = while preserving Unicode/international characters.
   * @param {string} string Raw input string.
   * @returns {string} HTML-encoded safe string.
   * @private
   */
  _escapeHtml(string) {
    return HtmlSanitizer.escapeHtml(string);
  }

  /**
   * @description Orchestrates template parsing with delimiter-aware caching.
   * @param {string} template Raw template string.
   * @param {string[]} [tags] Custom delimiters.
   * @returns {Array[]} Parsed token hierarchy.
   * @private
   */
  _parse(template, tags) {
    tags = tags || this.tags;
    const cacheKey = template + ':' + tags.join(':');
    if (this.templateCache[cacheKey]) {
      return this.templateCache[cacheKey];
    }
    const tokens = this._parseTemplate(template, tags);
    this.templateCache[cacheKey] = tokens;
    return tokens;
  }

  /**
   * @description Recursively renders a token collection into a final string.
   * @param {Array[]} tokens Array of parsed tokens.
   * @param {MustacheContext} context Data resolution context.
   * @param {Object} partials Map of partial templates.
   * @param {string} originalTemplate Source template for section extraction.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string} Partial rendered output.
   * @private
   */
  _renderTokens(tokens, context, partials, originalTemplate, state) {
    // WTE-H007: Use array and join for efficient string concatenation
    const parts = [];
    for (const token of tokens) {
      // WTE-M009: Use named constants for token indices
      const symbol = token[MyMustache.TOKEN_TYPE];
      let value;
      if (symbol === '#') {
        value = this._renderSection(token, context, partials, originalTemplate, state);
      } else if (symbol === '^') {
        value = this._renderInverted(token, context, partials, originalTemplate, state);
      } else if (symbol === '>') {
        value = this._renderPartial(token, context, partials, state);
      } else if (symbol === '&') {
        value = this._unescapedValue(token, context);
      } else if (symbol === 'name') {
        value = this._escapedValue(token, context);
      } else if (symbol === 'text') {
        value = token[MyMustache.TOKEN_VALUE];
      }
      if (value !== undefined) {
        parts.push(value);
      }
    }
    return parts.join('');
  }

  /**
   * @description Parses filter pipe syntax and executes the transformation chain.
   * @param {Array} token Target token containing key and filter string.
   * @param {MustacheContext} context Current data context.
   * @returns {*} Final resolved and transformed value.
   * @private
   */
  _lookupValue(token, context) {
    const parts = token[1].split('|').map((s) => s.trim());
    const key = parts.shift();
    let value = context.lookup(key);

    for (const filterString of parts) {
      const filterMatch = filterString.match(/^(\w+)(?::(.*))?$/);
      if (!filterMatch) {
        this.logger.warn(`Invalid filter syntax: "${filterString}"`);
        continue;
      }

      const [, filterName, filterArgsString] = filterMatch;

      // WTE-HIGH-001: Use FilterRegistry to get filter
      const filter = this.filterRegistry.get(filterName);
      if (!filter) {
        this.logger.warn(`Filter not found: "${filterName}"`);
        continue;
      }

      const args = [];
      if (filterArgsString) {
        const argParts = [];
        let currentArg = '';
        let inString = null;
        for (let i = 0; i < filterArgsString.length; i++) {
          const char = filterArgsString[i];
          if (inString) {
            if (char === inString) {
              inString = null;
            }
            currentArg += char;
          } else {
            if (char === "'" || char === '"') {
              inString = char;
              currentArg += char;
            } else if (char === ',' || char === ':') {
              argParts.push(currentArg.trim());
              currentArg = '';
            } else {
              currentArg += char;
            }
          }
        }
        if (currentArg) {
          argParts.push(currentArg.trim());
        }
        argParts.forEach((arg) => {
          arg = arg.trim();
          if (
            (arg.startsWith("'") && arg.endsWith("'")) ||
            (arg.startsWith('"') && arg.endsWith('"'))
          ) {
            args.push(arg.slice(1, -1));
          } else if (!isNaN(arg)) {
            args.push(Number(arg));
          } else if (arg === 'true') {
            args.push(true);
          } else if (arg === 'false') {
            args.push(false);
          } else {
            args.push(arg);
          }
        });
      }

      try {
        // WTE-HIGH-001: Execute filter using FilterStrategy.execute()
        value = filter.execute(value, ...args);
      } catch (e) {
        this.logger.error(`Error applying filter "${filterName}": ${e.message}`);
        return value;
      }
    }
    return value;
  }

  /**
   * @description Renders a value with default string conversion.
   * @param {Array} token Value token.
   * @param {MustacheContext} context Data context.
   * @returns {string|undefined} Stringified value.
   * @private
   */
  _escapedValue(token, context) {
    const value = this._lookupValue(token, context);
    // WTE-M004: Use standardized null checking
    if (!MyMustache.isNullOrUndefined(value)) {
      // GAS context: HTML escaping is not appropriate for Google Docs/Sheets output.
      // HTML entities (e.g., &quot;) would appear as literal text in documents.
      return String(value);
    }
  }

  /**
   * @description Renders a raw value without escaping.
   * @param {Array} token Value token.
   * @param {MustacheContext} context Data context.
   * @returns {string|undefined} Stringified raw value.
   * @private
   */
  _unescapedValue(token, context) {
    const value = this._lookupValue(token, context);
    // WTE-M004: Use standardized null checking
    if (!MyMustache.isNullOrUndefined(value)) {
      return String(value);
    }
  }

  /**
   * @description Decorates iteration items with Handlebars-style meta-variables (@index, @first, etc.).
   * @param {*} item Array element.
   * @param {number} index Current zero-based index.
   * @param {number} total Total element count.
   * @param {string} [key] Optional map key.
   * @returns {Object|*} Decorated item or original if primitive.
   * @private
   */
  _createLoopContext(item, index, total, key) {
    // Check if item is a primitive type
    const isPrimitive =
      item === null ||
      item === undefined ||
      (typeof item !== 'object' && typeof item !== 'function');

    // For primitive values, we cannot add meta-variables without breaking {{.}} syntax
    // So we return the primitive as-is. Meta-variables won't be available for primitive arrays.
    if (isPrimitive) {
      return item;
    }

    let decoratedView;
    if (Array.isArray(item)) {
      // For arrays, create a shallow copy and add meta-variables
      decoratedView = [...item];
      decoratedView['@index'] = index;
      decoratedView['@number'] = index + 1;
      decoratedView['@first'] = index === 0;
      decoratedView['@last'] = index === total - 1;
      decoratedView['@odd'] = index % 2 === 1;
      decoratedView['@even'] = index % 2 === 0;
      decoratedView['@total'] = total;
    } else {
      // For objects, create a shallow copy with meta-variables
      // Use spread operator to copy all enumerable properties
      // This ensures hasOwnProperty checks work correctly
      decoratedView = {
        ...item,
        '@index': index,
        '@number': index + 1,
        '@first': index === 0,
        '@last': index === total - 1,
        '@odd': index % 2 === 1,
        '@even': index % 2 === 0,
        '@total': total
      };
    }

    if (key !== undefined) {
      decoratedView['@key'] = key;
    }

    return decoratedView;
  }

  /**
   * @description Renders a conditional or iterative section with meta-variable support.
   * @param {Array} token Section token hierarchy.
   * @param {MustacheContext} context Parent context.
   * @param {Object} partials Map of partial templates.
   * @param {string} originalTemplate Source template.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered section content.
   * @private
   */
  _renderSection(token, context, partials, originalTemplate, state) {
    if (state.depth >= MyMustache.MAX_RENDER_DEPTH) {
      throw new MustacheRenderError(
        `Superata la profondità massima di annidamento (${MyMustache.MAX_RENDER_DEPTH}) nella sezione "${token[1]}"`
      );
    }
    const childState = { depth: state.depth + 1, partialStack: state.partialStack };
    // WTE-H007: Use array and join for efficient string concatenation
    const parts = [];
    const self = this;
    const value = this._lookupValue(token, context);
    function subRender(template) {
      return self.render(template, context, partials);
    }
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      // Enhanced array iteration with meta-variables
      const total = value.length;
      for (let i = 0; i < total; i++) {
        const item = value[i];
        // Create decorated view with meta-variables
        const decoratedItem = this._createLoopContext(item, i, total);
        parts.push(
          this._renderTokens(
            token[4],
            context.push(decoratedItem),
            partials,
            originalTemplate,
            childState
          )
        );
      }
    } else if (typeof value === 'object') {
      // For non-array objects, just push onto context stack (standard Mustache behavior)
      // Note: Object key iteration is not supported in standard Mustache
      // Users should convert objects to arrays if they need iteration with @key
      parts.push(
        this._renderTokens(token[4], context.push(value), partials, originalTemplate, childState)
      );
    } else if (typeof value === 'function') {
      const text = originalTemplate.slice(token[3], token[5]);
      const result = value.call(context.view, text, subRender);
      if (result != null) {
        parts.push(result);
      }
    } else {
      parts.push(this._renderTokens(token[4], context, partials, originalTemplate, childState));
    }
    return parts.join('');
  }

  /**
   * @description Renders content if a key is falsy or an empty array.
   * @param {Array} token Inverted section token.
   * @param {MustacheContext} context Current context.
   * @param {Object} partials Partial definitions.
   * @param {string} originalTemplate Source template.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered content.
   * @private
   */
  _renderInverted(token, context, partials, originalTemplate, state) {
    if (state.depth >= MyMustache.MAX_RENDER_DEPTH) {
      throw new MustacheRenderError(
        `Superata la profondità massima di annidamento (${MyMustache.MAX_RENDER_DEPTH}) nella sezione invertita "${token[1]}"`
      );
    }
    const value = this._lookupValue(token, context);
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return this._renderTokens(token[4], context, partials, originalTemplate, {
        depth: state.depth + 1,
        partialStack: state.partialStack
      });
    }
  }

  /**
   * @description Resolves and renders a partial template inclusion.
   * @param {Array} token Partial token.
   * @param {MustacheContext} context Current context.
   * @param {Object|function} partials Partial source.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered partial output.
   * @private
   */
  _renderPartial(token, context, partials, state) {
    if (!partials) {
      return;
    }
    const partialName = token[1];
    if (state.depth >= MyMustache.MAX_RENDER_DEPTH) {
      throw new MustacheRenderError(
        `Superata la profondità massima di annidamento (${MyMustache.MAX_RENDER_DEPTH}) nel partial "${partialName}"`
      );
    }
    if (state.partialStack.includes(partialName)) {
      throw new MustacheRenderError(
        `Riferimento ciclico nel partial "${partialName}" (catena: ${state.partialStack.join(' > ')} > ${partialName})`
      );
    }
    const value = typeof partials === 'function' ? partials(partialName) : partials[partialName];
    if (value != null) {
      const tokens = this._parse(String(value));
      state.partialStack.push(partialName);
      try {
        return this._renderTokens(tokens, context, partials, String(value), {
          depth: state.depth + 1,
          partialStack: state.partialStack
        });
      } finally {
        state.partialStack.pop();
      }
    }
  }

  /**
   * @description Optimizes token stream by merging adjacent text fragments.
   * @param {Array[]} tokens Raw token sequence.
   * @returns {Array[]} Optimized token sequence.
   * @private
   */
  _squashTokens(tokens) {
    const squashedTokens = [];
    let token, lastToken;
    for (let i = 0; i < tokens.length; i++) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }
    return squashedTokens;
  }

  /**
   * @description Transforms flat token stream into a nested section hierarchy.
   * @param {Array[]} tokens Linear token sequence.
   * @returns {Array[]} Hierarchical token tree.
   * @private
   */
  _nestTokens(tokens) {
    const nestedTokens = [];
    let collector = nestedTokens;
    const sections = [];
    for (const token of tokens) {
      // WTE-M010: Use centralized tag constants instead of hardcoded values
      switch (token[MyMustache.TOKEN_TYPE]) {
        case MyMustache.TAG_SECTION:
        case MyMustache.TAG_INVERTED:
          collector.push(token);
          sections.push(token);
          collector = token[MyMustache.TOKEN_CHILDREN] = [];
          break;
        case MyMustache.TAG_SECTION_END: {
          const section = sections.pop();
          section[MyMustache.TOKEN_INDEX] = token[MyMustache.TOKEN_START];
          collector =
            sections.length > 0
              ? sections[sections.length - 1][MyMustache.TOKEN_CHILDREN]
              : nestedTokens;
          break;
        }
        default:
          collector.push(token);
      }
    }
    return nestedTokens;
  }

  /**
   * @description Lexical analyzer that converts a template string into tokens.
   * @param {string} template Raw template.
   * @param {string[]} tags Delimiters.
   * @returns {Array[]} Token tree.
   * @throws {Error} On unclosed tags or sections.
   * @private
   */
  _parseTemplate(template, tags) {
    if (!template) {
      return [];
    }
    const sections = [],
      tokens = [];
    let spaces = [],
      hasTag = false,
      nonSpace = false;

    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }
      hasTag = false;
      nonSpace = false;
    }

    let openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tagsToCompile) {
      if (typeof tagsToCompile === 'string') {
        tagsToCompile = tagsToCompile.split(/\s+/, 2);
      }
      if (!Array.isArray(tagsToCompile) || tagsToCompile.length !== 2) {
        throw new Error('Invalid tags: ' + tagsToCompile);
      }
      openingTagRe = new RegExp(this._escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + this._escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + this._escapeRegExp('}' + tagsToCompile[1]));
    }
    compileTags.call(this, tags);

    const scanner = new _MustacheScanner(template);
    let start, type, value, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;
      value = scanner.scanUntil(openingTagRe);
      if (value) {
        // WTE-M007: Fix Unicode handling - use for...of for proper Unicode iteration
        for (const chr of value) {
          if (/\s/.test(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }
          const chrLength = chr.length; // Handles multi-byte characters correctly
          tokens.push(['text', chr, start, start + chrLength]);
          start += chrLength;
          if (chr === '\n') {
            stripSpace();
          }
        }
      }
      if (!scanner.scan(openingTagRe)) {
        break;
      }
      hasTag = true;
      type = scanner.scan(/#|\^|\/|>|\{|&|=|!/) || 'name';
      scanner.scan(/\s*/);
      if (type === '=') {
        value = scanner.scanUntil(/=/).trim();
        scanner.scan(/=/);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(/\s*\}/);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }
      if (!scanner.scan(closingTagRe)) {
        throw new Error('Unclosed tag at ' + scanner.pos);
      }
      token = [type, value.trim(), start, scanner.pos];
      tokens.push(token);
      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        openSection = sections.pop();
        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }

        // Extract base variable name (before '|') for comparison
        // This allows filters on section tags: {{#items | sort}}...{{/items}}
        const openSectionName = openSection[1].split('|')[0].trim();
        const closeSectionName = value.trim();

        if (openSectionName !== closeSectionName) {
          throw new Error('Unclosed section "' + openSectionName + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        compileTags.call(this, value);
      }
    }
    openSection = sections.pop();
    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }
    return this._nestTokens(this._squashTokens(tokens));
  }
}

// Export alias for backwards compatibility
export { MyMustache as Mustache, _MustacheContext as MustacheContext, MustacheRenderError };
