/**
 * Abstract base class for domain value objects, enforcing immutability and value-based equality.
 * @abstract
 * @class
 */
export class ValueObject {
  /**
   * Prevents direct instantiation of the abstract ValueObject class.
   * @throws {TypeError} If attempting to construct this abstract class directly.
   */
  constructor() {
    if (new.target === ValueObject) {
      throw new TypeError('Cannot construct ValueObject instances directly - must use a subclass');
    }
  }

  /**
   * Finalizes the value object by making it immutable via Object.freeze.
   * @protected
   */
  _freeze() {
    Object.freeze(this);
  }

  /**
   * Compares this value object with another instance for deep structural equality.
   * @param {ValueObject} other Comparison target instance.
   * @returns {boolean} True if both instances share the same constructor and deep state.
   */
  equals(other) {
    if (!other || this.constructor !== other.constructor) {
      return false;
    }

    // Deep equality check
    return this._deepEquals(this, other);
  }

  /**
   * Recursively evaluates equality between two values, supporting primitives, arrays, and objects.
   * @private
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {boolean} True if values are deeply equivalent.
   */
  _deepEquals(a, b) {
    // Same reference
    if (a === b) {
      return true;
    }

    // Different types
    if (typeof a !== typeof b) {
      return false;
    }

    // Primitives
    if (typeof a !== 'object' || a === null || b === null) {
      return a === b;
    }

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((item, index) => this._deepEquals(item, b[index]));
    }

    // Objects - compare ALL properties including private ones (underscore-prefixed)
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => {
      if (!keysB.includes(key)) {
        return false;
      }
      return this._deepEquals(a[key], b[key]);
    });
  }

  /**
   * Generates a stringified representation of the value object's public properties.
   * @returns {string} Formatted class name and JSON-serialized state.
   */
  toString() {
    try {
      const props = {};
      Object.keys(this)
        .filter((k) => !k.startsWith('_'))
        .forEach((k) => {
          props[k] = this[k];
        });
      return `${this.constructor.name}(${JSON.stringify(props)})`;
    } catch (_error) {
      return `${this.constructor.name}()`;
    }
  }

  /**
   * Returns the underlying serializable data value represented by the object.
   * @abstract
   * @returns {*} Primitive or plain object representation.
   * @throws {Error} If the subclass fails to implement this method.
   */
  getValue() {
    throw new Error(`${this.constructor.name} must implement getValue() method`);
  }
}
