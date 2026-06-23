/**
 * @file WorkspaceTemplateEngine/src/FilterStrategy.js
 * @description Base class and registry for template filters using Strategy pattern.
 *              WTE-HIGH-001: Refactored from inline filter implementations for better
 *              extensibility, testability, and maintainability.
 * @version 2.0.0
 */

/**
 * @description Abstract base for Mustache template filters using the Strategy pattern.
 * Enables value transformations via pipe syntax: `{{value | filterName:args}}`.
 * @abstract
 * @class
 * @example
 * class UppercaseFilter extends FilterStrategy {
 *   getName() { return 'uppercase'; }
 *   execute(v) { return String(v).toUpperCase(); }
 * }
 */
export class FilterStrategy {
  /**
   * @description Returns the unique identifier for the filter used in template expressions.
   * @returns {string} Unique filter name (e.g., 'uppercase').
   * @abstract
   */
  getName() {
    throw new Error('FilterStrategy.getName() must be implemented by subclass');
  }

  /**
   * @description Returns a technical description of the filter transformation logic.
   * @returns {string} Human-readable functional summary.
   * @abstract
   */
  getDescription() {
    throw new Error('FilterStrategy.getDescription() must be implemented by subclass');
  }

  /**
   * @description Performs the core value transformation.
   * @param {*} value Input value to be transformed.
   * @param {...*} args Optional arguments passed from the template expression.
   * @returns {*} The transformed value.
   * @abstract
   */
  execute(_value, ..._args) {
    throw new Error('FilterStrategy.execute() must be implemented by subclass');
  }

  /**
   * @description Validates filter arguments before execution.
   * @param {*} value The input value.
   * @param {Array<*>} args Array of arguments passed to the filter.
   * @throws {Error} If argument validation fails.
   */
  validate(_value, _args) {
    // Default: no validation
    // Subclasses can override to add specific validation
  }
}

/**
 * @description Centralized registry for managing and resolving FilterStrategy instances.
 * @class
 */
export class FilterRegistry {
  /**
   * @description Initializes the registry with an optional diagnostic logger.
   * @param {Object} [logger=console] Logger instance for internal tracking.
   */
  constructor(logger) {
    this._logger = logger || console;
    this._filters = new Map();
  }

  /**
   * @description Registers a new filter strategy.
   * @param {FilterStrategy} filterStrategy Instance of a FilterStrategy subclass.
   * @throws {Error} If filterStrategy is invalid or name collisions occur.
   */
  register(filterStrategy) {
    if (!(filterStrategy instanceof FilterStrategy)) {
      throw new Error('FilterRegistry.register: filterStrategy must be a FilterStrategy instance');
    }

    const name = filterStrategy.getName();
    if (this._filters.has(name)) {
      this._logger.warn(`FilterRegistry: Overwriting existing filter '${name}'`);
    }

    this._filters.set(name, filterStrategy);
    this._logger.debug(`FilterRegistry: Registered filter '${name}'`);
  }

  /**
   * @description Batch registers multiple filter strategies.
   * @param {FilterStrategy[]} filterStrategies Array of filter instances.
   * @throws {Error} If input is not an array.
   */
  registerAll(filterStrategies) {
    if (!Array.isArray(filterStrategies)) {
      throw new Error('FilterRegistry.registerAll: filterStrategies must be an array');
    }

    filterStrategies.forEach((filter) => this.register(filter));
  }

  /**
   * @description Resolves a filter strategy by its unique name.
   * @param {string} name Unique identifier of the filter.
   * @returns {FilterStrategy|null} Filter instance or null if not registered.
   */
  get(name) {
    return this._filters.get(name) || null;
  }

  /**
   * @description Checks if a filter name is currently registered.
   * @param {string} name Filter identifier.
   * @returns {boolean} True if registered.
   */
  has(name) {
    return this._filters.has(name);
  }

  /**
   * @description Removes a filter registration by name.
   * @param {string} name Filter identifier.
   * @returns {boolean} True if the filter was successfully removed.
   */
  unregister(name) {
    const existed = this._filters.delete(name);
    if (existed) {
      this._logger.debug(`FilterRegistry: Unregistered filter '${name}'`);
    }
    return existed;
  }

  /**
   * @description Returns all registered filter identifiers.
   * @returns {string[]} Collection of registered filter names.
   */
  getAllNames() {
    return Array.from(this._filters.keys());
  }

  /**
   * @description Returns all registered filter instances.
   * @returns {FilterStrategy[]} Collection of filter strategies.
   */
  getAll() {
    return Array.from(this._filters.values());
  }

  /**
   * @description Purges all filter registrations from the registry.
   */
  clear() {
    this._filters.clear();
    this._logger.debug('FilterRegistry: Cleared all filters');
  }

  /**
   * @description Returns the current registration count.
   * @returns {number} Total number of active filters.
   */
  count() {
    return this._filters.size;
  }
}
