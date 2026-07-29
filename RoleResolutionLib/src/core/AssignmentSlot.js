import { MalformedAssignmentSlotError } from '../internal/errors/RoleResolutionError.js';

function isDimensionValue(value) {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

/** Immutable, opaque set of dimensions identifying an assignment slot. */
export class AssignmentSlot {
  constructor({ dimensions } = {}) {
    if (!dimensions || typeof dimensions !== 'object' || Array.isArray(dimensions)) {
      throw new MalformedAssignmentSlotError('Assignment slot dimensions must be an object');
    }

    const entries = Object.entries(dimensions);
    if (entries.length === 0) {
      throw new MalformedAssignmentSlotError('Assignment slot dimensions must not be empty');
    }
    entries.forEach(([name, value]) => {
      if (!name.trim() || !isDimensionValue(value)) {
        throw new MalformedAssignmentSlotError(
          'Assignment slot dimensions contain an invalid value',
          {
            name,
            value
          }
        );
      }
    });

    this.dimensions = Object.freeze({ ...dimensions });
    this.key = JSON.stringify(
      entries
        .sort(([left], [right]) => left.localeCompare(right))
        .reduce((result, [name, value]) => {
          result[name] = value;
          return result;
        }, {})
    );
    Object.freeze(this);
  }

  get(name) {
    return Object.prototype.hasOwnProperty.call(this.dimensions, name)
      ? this.dimensions[name]
      : null;
  }

  matches(scopeDimensions = {}) {
    if (!scopeDimensions || typeof scopeDimensions !== 'object' || Array.isArray(scopeDimensions)) {
      return false;
    }
    return Object.entries(scopeDimensions).every(([name, expected]) => {
      return expected === '*' || this.get(name) === expected;
    });
  }

  toJSON() {
    return { dimensions: { ...this.dimensions } };
  }
}
