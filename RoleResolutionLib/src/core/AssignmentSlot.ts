import type { AssignmentSlotDefinition, DimensionValue, SlotDimensions } from '../types.js';
import { MalformedAssignmentSlotError } from '../internal/errors/RoleResolutionError.js';

function isDimensionValue(value: unknown): value is DimensionValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

/** Immutable, opaque set of dimensions identifying an assignment slot. */
export class AssignmentSlot {
  declare readonly dimensions: Readonly<SlotDimensions>;
  declare readonly key: string;

  constructor({ dimensions }: AssignmentSlotDefinition = {}) {
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

    this.dimensions = Object.freeze({ ...dimensions }) as SlotDimensions;
    this.key = JSON.stringify(
      entries
        .sort(([left], [right]) => left.localeCompare(right))
        .reduce(
          (result, [name, value]) => {
            result[name] = value;
            return result;
          },
          {} as Record<string, unknown>
        )
    );
    Object.freeze(this);
  }

  get(name: string) {
    return Object.prototype.hasOwnProperty.call(this.dimensions, name)
      ? this.dimensions[name]
      : null;
  }

  matches(scopeDimensions: Record<string, unknown> = {}) {
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
