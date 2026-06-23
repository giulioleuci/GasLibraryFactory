import { FieldSpecification } from './FieldSpecification.js';

/**
 * Fluent API orchestrator for assembling complex logical specifications through chainable method calls.
 * @class
 */
export class SpecificationBuilder {
  /**
   * Initializes builder with internal logic registries and default join operators.
   * @private
   */
  constructor() {
    this._specifications = [];
    this._currentOperator = 'AND';
  }

  /**
   * Starts building a new specification.
   *
   * @static
   * @returns {SpecificationBuilder} A new builder instance
   */
  static create() {
    return new SpecificationBuilder();
  }

  /**
   * Starts building a field specification.
   *
   * @static
   * @param {string} field - The field name
   * @returns {Object} A field specification builder
   */
  static field(field) {
    return new FieldSpecificationBuilder(field, new SpecificationBuilder());
  }

  /**
   * Transitions to a field-specific building context for relational comparisons.
   * @param {string} field Dot-notation property path.
   * @returns {Object} Scoped builder for the specified attribute.
   */
  field(field) {
    return new FieldSpecificationBuilder(field, this);
  }

  /**
   * Configures the builder to join the next specification using logical AND.
   * @returns {this} Chainable builder instance.
   */
  and() {
    this._currentOperator = 'AND';
    return this;
  }

  /**
   * Configures the builder to join the next specification using logical OR.
   * @returns {this} Chainable builder instance.
   */
  or() {
    this._currentOperator = 'OR';
    return this;
  }

  /**
   * Records a specification instance within the internal assembly pipeline.
   * @private
   * @param {Object} specification Logical unit to include.
   */
  _addSpecification(specification) {
    this._specifications.push({
      spec: specification,
      operator: this._currentOperator
    });
  }

  /**
   * Synthesizes all registered logical units into a single Specification tree.
   * @returns {Object} Fully assembled composite or atomic specification.
   * @throws {Error} If no specifications were added to the builder.
   */
  build() {
    if (this._specifications.length === 0) {
      throw new Error('Cannot build specification - no specifications added');
    }

    if (this._specifications.length === 1) {
      return this._specifications[0].spec;
    }

    // Group specifications by operator
    let result = this._specifications[0].spec;

    for (let i = 1; i < this._specifications.length; i++) {
      const item = this._specifications[i];
      if (item.operator === 'AND') {
        result = result.and(item.spec);
      } else {
        result = result.or(item.spec);
      }
    }

    return result;
  }
}

/**
 * Context-aware builder for relational field comparisons, mapping operators to FieldSpecification instances.
 * @class
 * @private
 */
class FieldSpecificationBuilder {
  /**
   * Initializes relational builder with target attribute and parent coordination context.
   * @param {string} field Domain attribute identifier.
   * @param {SpecificationBuilder} parentBuilder Orchestrating builder for chaining.
   */
  constructor(field, parentBuilder) {
    this._field = field;
    this._parentBuilder = parentBuilder;
  }

  /**
   * Assembles an equality specification (field == value).
   * @param {*} value Comparison target.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  equals(value) {
    const spec = new FieldSpecification(this._field, 'equals', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles an inequality specification (field != value).
   * @param {*} value Comparison target.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  notEquals(value) {
    const spec = new FieldSpecification(this._field, 'notEquals', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a strictly greater-than specification (field > value).
   * @param {*} value Comparison threshold.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  greaterThan(value) {
    const spec = new FieldSpecification(this._field, 'greaterThan', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a strictly less-than specification (field < value).
   * @param {*} value Comparison threshold.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  lessThan(value) {
    const spec = new FieldSpecification(this._field, 'lessThan', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a greater-than-or-equal specification (field >= value).
   * @param {*} value Comparison threshold.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  greaterThanOrEqual(value) {
    const spec = new FieldSpecification(this._field, 'greaterThanOrEqual', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a less-than-or-equal specification (field <= value).
   * @param {*} value Comparison threshold.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  lessThanOrEqual(value) {
    const spec = new FieldSpecification(this._field, 'lessThanOrEqual', value);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a set-inclusion specification (field IN [values]).
   * @param {Array} values Collection of permitted comparison targets.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  in(values) {
    const spec = new FieldSpecification(this._field, 'in', values);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a set-exclusion specification (field NOT IN [values]).
   * @param {Array} values Collection of prohibited comparison targets.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  notIn(values) {
    const spec = new FieldSpecification(this._field, 'notIn', values);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles an inclusive range specification (min <= field <= max).
   * @param {*} min Lower boundary.
   * @param {*} max Upper boundary.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  between(min, max) {
    const spec = new FieldSpecification(this._field, 'between', min, max);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a string pattern-matching specification supporting '%' wildcards.
   * @param {string} pattern Search pattern.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  like(pattern) {
    const spec = new FieldSpecification(this._field, 'like', pattern);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }

  /**
   * Assembles a string pattern-exclusion specification supporting '%' wildcards.
   * @param {string} pattern Prohibited search pattern.
   * @returns {SpecificationBuilder} Orchestrating builder for continued chaining.
   */
  notLike(pattern) {
    const spec = new FieldSpecification(this._field, 'notLike', pattern);
    this._parentBuilder._addSpecification(spec);
    return this._parentBuilder;
  }
}
