import { AssignmentSlot } from './AssignmentSlot.js';
import { parseDate } from '../internal/DateParsing.js';
import { cloneAndFreeze } from '../internal/ImmutableValue.js';
import { RoleValidationError } from '../internal/errors/RoleResolutionError.js';

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RoleValidationError(`${field} is required and must be a non-blank string`);
  }
  return value;
}

function parseRequiredDate(value, field) {
  const parsed = parseDate(value);
  if (value !== null && value !== undefined && parsed === null) {
    throw new RoleValidationError(`${field} must be a valid ISO-safe date`);
  }
  return parsed;
}

/** Immutable candidate assignment that can become effective at a point in time. */
export class AssignmentCandidate {
  constructor({
    id,
    actorId,
    slot,
    validFrom = null,
    validTo = null,
    source = 'base',
    priority = 0,
    metadata = {}
  } = {}) {
    this.id = requiredString(id, 'Assignment candidate id');
    this.actorId = requiredString(actorId, 'Assignment candidate actorId');
    this.slot = slot instanceof AssignmentSlot ? slot : new AssignmentSlot(slot);
    this.validFrom = parseRequiredDate(validFrom, 'Assignment candidate validFrom');
    this.validTo = parseRequiredDate(validTo, 'Assignment candidate validTo');
    if (this.validFrom && this.validTo && this.validFrom > this.validTo) {
      throw new RoleValidationError('Assignment candidate validFrom must not be after validTo');
    }
    this.source = requiredString(source, 'Assignment candidate source');
    if (typeof priority !== 'number' || !Number.isFinite(priority)) {
      throw new RoleValidationError('Assignment candidate priority must be a finite number');
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new RoleValidationError('Assignment candidate metadata must be an object');
    }
    this.priority = priority;
    this.metadata = cloneAndFreeze(metadata);
    Object.freeze(this);
  }

  isValidAt(date = new Date()) {
    const asOf = parseDate(date);
    if (asOf === null) {
      throw new RoleValidationError('Assignment candidate validity date must be valid');
    }
    return (!this.validFrom || asOf >= this.validFrom) && (!this.validTo || asOf <= this.validTo);
  }

  toJSON() {
    return {
      id: this.id,
      actorId: this.actorId,
      slot: this.slot.toJSON(),
      validFrom: this.validFrom ? this.validFrom.toISOString() : null,
      validTo: this.validTo ? this.validTo.toISOString() : null,
      source: this.source,
      priority: this.priority,
      metadata: { ...this.metadata }
    };
  }
}
