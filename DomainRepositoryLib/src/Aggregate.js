import { Entity } from './Entity.js';
import { InvariantViolationException } from './internal/errors/InvariantViolationException.js';

/**
 * Abstract base class for domain aggregates, managing child entities and cross-entity invariants.
 * @abstract
 * @class
 * @extends Entity
 */
export class Aggregate extends Entity {
  /**
   * Initializes aggregate state with children and violation registries.
   * @param {Object} [data={}] Initial aggregate attribute data.
   * @throws {TypeError} If attempting to instantiate the abstract class directly.
   */
  constructor(data = {}) {
    super(data);
    if (new.target === Aggregate) {
      throw new TypeError('Cannot construct Aggregate instances directly - must use a subclass');
    }

    this._children = [];
    this._invariantViolations = [];
  }

  /**
   * Retrieves a shallow copy of the current child entity collection.
   * @returns {Array<Entity>} List of managed child entities.
   */
  getChildren() {
    return [...this._children];
  }

  /**
   * Appends a child entity to the aggregate and marks the structure as dirty.
   * @protected
   * @param {Entity} child Entity instance to include in the aggregate.
   */
  addChild(child) {
    if (child && !this._children.includes(child)) {
      this._children.push(child);
      this.markDirty('_children');
    }
  }

  /**
   * Removes a child entity from the aggregate and marks the structure as dirty.
   * @protected
   * @param {Entity} child Entity instance to remove.
   */
  removeChild(child) {
    const index = this._children.indexOf(child);
    if (index > -1) {
      this._children.splice(index, 1);
      this.markDirty('_children');
    }
  }

  /**
   * Evaluates domain-specific invariants across the aggregate boundary.
   * @abstract
   * @returns {boolean} True if all aggregate-level business rules are satisfied.
   */
  validateInvariants() {
    this._invariantViolations = [];
    return true;
  }

  /**
   * Records a business rule violation message during the validation process.
   * @protected
   * @param {string} message Description of the invariant violation.
   */
  addInvariantViolation(message) {
    this._invariantViolations.push(message);
  }

  /**
   * Retrieves all recorded invariant violation messages.
   * @returns {string[]} Collection of violation descriptions.
   */
  getInvariantViolations() {
    return [...this._invariantViolations];
  }

  /**
   * Checks for the presence of any recorded invariant violations.
   * @returns {boolean} True if violations registry is non-empty.
   */
  hasInvariantViolations() {
    return this._invariantViolations.length > 0;
  }

  /**
   * Performs comprehensive validation including base entity checks and aggregate invariants.
   * @returns {boolean} True if both structural and domain-level rules are satisfied.
   */
  validate() {
    // Call parent validation
    const entityValid = super.validate();

    // Validate invariants
    const invariantsValid = this.validateInvariants();

    return entityValid && invariantsValid && !this.hasInvariantViolations();
  }

  /**
   * Ensures domain invariants are satisfied, throwing an exception upon failure.
   * @throws {InvariantViolationException} If any aggregate invariants are violated.
   */
  validateInvariantsOrThrow() {
    if (!this.validateInvariants() || this.hasInvariantViolations()) {
      throw new InvariantViolationException(
        this.constructor.name,
        Array.from(this._invariantViolations)
      );
    }
  }

  /**
   * Executes full validation lifecycle and throws on any structural or invariant failure.
   * @throws {ValidationException} If base entity validation fails.
   * @throws {InvariantViolationException} If aggregate invariants are violated.
   */
  validateOrThrow() {
    // Validate entity
    super.validateOrThrow();

    // Validate invariants
    this.validateInvariantsOrThrow();
  }

  /**
   * Returns the total count of entities currently managed by this aggregate.
   * @returns {number} Child entity count.
   */
  getChildCount() {
    return this._children.length;
  }

  /**
   * Checks if the aggregate currently contains any child entities.
   * @returns {boolean} True if children registry is non-empty.
   */
  hasChildren() {
    return this._children.length > 0;
  }

  /**
   * Removes all child entities from the aggregate and marks the structure as dirty.
   * @protected
   */
  clearChildren() {
    this._children = [];
    this.markDirty('_children');
  }
}
