/**
 * @description Facade for multi-format template processing (String, Google Docs, Google Sheets).
 * Orchestrates Mustache rendering, structural document expansion, and batch spreadsheet updates.
 * @class
 * @example
 * const service = new MyPlaceholderService({ logger, mustache });
 * service.processDocument(docId, { items: [{ name: 'A' }] });
 */
import { DocumentProcessor } from './processors/DocumentProcessor.js';
import { SheetProcessor } from './processors/SheetProcessor.js';

export class MyPlaceholderService {
  /**
   * @description Dependency injection manifest for PlaceholderService.
   * @returns {Object} DI configuration object.
   * @static
   */
  static get di() {
    return {
      name: 'placeholderService',
      dependencies: ['logger', 'mustache'],
      isSingleton: true,
      factory: (logger, mustache) => new MyPlaceholderService({ logger, mustache })
    };
  }

  /**
   * @description Initializes the service with required rendering and logging dependencies.
   * @param {Object} options Configuration options.
   * @param {LoggerService} options.logger Diagnostic logger instance.
   * @param {Mustache} options.mustache Initialized Mustache engine.
   * @param {UtilsService} [options.utils] Optional utility service for formatting.
   * @param {Cache} [options.cache] Optional cache service for template storage.
   * @param {boolean} [options.strictFilters=false] If true, filter errors throw exceptions.
   * @throws {Error} If required mustache dependency is missing.
   */
  constructor(options = {}) {
    // Accept basic dependencies
    this.logger = options.logger || console;
    this.mustache = options.mustache;
    this.utils = options.utils;
    this.cache = options.cache;

    // Validate required dependencies
    if (!this.mustache) {
      throw new Error('MyPlaceholderService requires a MyMustache instance');
    }

    // Initialize processors with filter options (WTE-H006)
    const processorOptions = {
      strictFilters: options.strictFilters || false
    };
    this.documentProcessor = new DocumentProcessor(this, processorOptions);
    this.sheetProcessor = new SheetProcessor(this);

    this.logger.debug('MyPlaceholderService (Facade) initialized.');
  }

  /**
   * @description Processes a string template using Mustache placeholders and filter pipes.
   * Supports standard Mustache syntax plus `{{value | filter:args}}` extensions.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context for resolution.
   * @returns {string} Processed string or original template on failure.
   * @throws {TypeError} If inputs are invalid types.
   */
  processString(template, context = {}) {
    // WTE-M005: Input validation
    if (typeof template !== 'string') {
      throw new TypeError('template must be a string');
    }
    if (context !== null && typeof context !== 'object') {
      throw new TypeError('context must be an object or null');
    }
    if (Array.isArray(context)) {
      throw new TypeError('context must be an object, not an array');
    }

    try {
      return this.mustache.render(template, context);
    } catch (error) {
      this.logger.error(
        `Error during placeholder substitution: ${error.message}\nStack: ${error.stack}`
      );
      return template;
    }
  }

  /**
   * @description Alias for processString() to maintain compatibility with GasExpressionEngineLib.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context.
   * @returns {string} Substituted string.
   */
  resolve(template, context = {}) {
    return this.processString(template, context);
  }

  /**
   * @description Performs in-place processing of a Google Document with structural expansion.
   * Executes reverse-order operations for tables, lists, and placeholders to maintain index integrity.
   * @param {string} documentId Unique Google Document identifier.
   * @param {Object} [context={}] Data context containing arrays for structural loops.
   * @returns {boolean} True if processing completed without errors.
   * @throws {TypeError} If parameters are invalid.
   */
  processDocument(documentId, context = {}) {
    // WTE-M005: Input validation
    if (typeof documentId !== 'string' || documentId.trim() === '') {
      throw new TypeError('documentId must be a non-empty string');
    }
    if (context !== null && typeof context !== 'object') {
      throw new TypeError('context must be an object or null');
    }
    if (Array.isArray(context)) {
      throw new TypeError('context must be an object, not an array');
    }

    try {
      this.logger.debug(`Starting document processing (Facade): ${documentId}`);
      this.documentProcessor.process(documentId, context);
      this.logger.debug(`Document ${documentId} processed successfully.`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process document ${documentId}: ${error.message}\nStack: ${error.stack}`
      );
      return false;
    }
  }

  /**
   * @description Executes batch updates on a Google Spreadsheet with matrix expansion and placeholder substitution.
   *
   * Return shape changed (additively, in intent): callers that previously treated
   * the return value as a plain boolean must now read `.success` — the resolved
   * `dynamic_columns` column layouts (see `SheetProcessor._prepareDynamicColumnRequests`)
   * are surfaced via `.layouts` so a caller can know which spreadsheet column each
   * templated item landed in (e.g. to apply ACLs the directive's own static `acl=`
   * expression can't express).
   *
   * @param {string} sheetId Unique Google Spreadsheet identifier.
   * @param {Object} [context={}] Data context for substitutions and matrix generation.
   * @param {string|null} [sheetName=null] Target sheet name or null to process all sheets.
   * @returns {{success: boolean, layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean}>}>}} `success` is false (and `layouts` empty) on any processing error, matching the pre-existing swallow-and-log behavior.
   * @throws {TypeError} If parameters are invalid.
   */
  processSheet(sheetId, context = {}, sheetName = null) {
    // WTE-M005: Input validation
    if (typeof sheetId !== 'string' || sheetId.trim() === '') {
      throw new TypeError('sheetId must be a non-empty string');
    }
    if (context !== null && typeof context !== 'object') {
      throw new TypeError('context must be an object or null');
    }
    if (Array.isArray(context)) {
      throw new TypeError('context must be an object, not an array');
    }
    if (sheetName !== null && typeof sheetName !== 'string') {
      throw new TypeError('sheetName must be a string or null');
    }

    try {
      this.logger.debug(`Starting sheet processing (Facade): ${sheetId}`);
      const result = this.sheetProcessor.process(sheetId, context, sheetName);
      this.logger.debug(`Sheet ${sheetId} processed successfully.`);
      return { success: true, layouts: (result && result.layouts) || [] };
    } catch (error) {
      this.logger.error(
        `Failed to process sheet ${sheetId}: ${error.message}\nStack: ${error.stack}`
      );
      return { success: false, layouts: [] };
    }
  }
}

// Export alias for backwards compatibility
export { MyPlaceholderService as PlaceholderService };
