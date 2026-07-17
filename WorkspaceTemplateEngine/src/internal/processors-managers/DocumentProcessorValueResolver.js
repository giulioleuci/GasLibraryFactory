/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorValueResolver.js
 * @description Manager for resolving values, applying filters, and sorting data.
 */

export class DocumentProcessorValueResolver {
  constructor(facade) {
    this.facade = facade;
  }

  _applyFilters(array, filters) {
    if (!Array.isArray(array) || !filters || filters.length === 0) return array;
    let result = array;
    for (const filter of filters) {
      try {
        switch (filter.name) {
          case 'sortBy':
            if (filter.args.length > 0) result = this._sortByProperty(result, filter.args[0]);
            else {
              if (this.facade.strictFilters)
                throw new Error("Filter 'sortBy' requires a property name argument");
              this.facade.logger.warn(
                "Filter 'sortBy' requires a property name argument, filter ignored."
              );
            }
            break;
          case 'reverse':
            result = [...result].reverse();
            break;
          case 'limit':
            if (filter.args.length > 0) {
              const limit = parseInt(filter.args[0], 10);
              if (isNaN(limit) || limit < 0) {
                if (this.facade.strictFilters)
                  throw new Error(
                    `Filter 'limit' requires a valid non-negative integer, got: ${filter.args[0]}`
                  );
                this.facade.logger.warn(
                  `Filter 'limit' requires a valid non-negative integer, got: ${filter.args[0]}, filter ignored.`
                );
              } else result = result.slice(0, limit);
            } else {
              if (this.facade.strictFilters)
                throw new Error("Filter 'limit' requires a number argument");
              this.facade.logger.warn("Filter 'limit' requires a number argument, filter ignored.");
            }
            break;
          case 'filter':
            if (filter.args.length >= 2) {
              const propName = filter.args[0],
                expectedValue = filter.args[1];
              result = result.filter((item) => item[propName] === expectedValue);
            } else {
              if (this.facade.strictFilters)
                throw new Error(
                  `Filter 'filter' requires two arguments (property and value), got ${filter.args.length}`
                );
              this.facade.logger.warn(`Filter 'filter' requires two arguments, filter ignored.`);
            }
            break;
          default:
            if (this.facade.strictFilters) throw new Error(`Filter '${filter.name}' not supported`);
            this.facade.logger.warn(`Filter '${filter.name}' not supported, ignored.`);
        }
      } catch (error) {
        if (this.facade.strictFilters)
          throw new Error(`Error applying filter '${filter.name}': ${error.message}`);
        this.facade.logger.warn(
          `Error applying filter '${filter.name}': ${error.message}, filter ignored.`
        );
      }
    }
    return result;
  }

  _sortByProperty(array, propName) {
    return [...array].sort((a, b) => {
      const valueA = this.facade._getNestedProperty(a, propName);
      const valueB = this.facade._getNestedProperty(b, propName);
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;
      if (typeof valueA === 'string' && typeof valueB === 'string')
        return valueA.localeCompare(valueB, 'en', { sensitivity: 'base' });
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
  }

  _getNestedProperty(obj, path) {
    return this.facade.mustache.getValue(path, obj);
  }
}
