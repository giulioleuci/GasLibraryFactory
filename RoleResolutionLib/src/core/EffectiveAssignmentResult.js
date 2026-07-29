import { Actor } from './Actor.js';
import { AssignmentSlot } from './AssignmentSlot.js';
import { DelegationChain } from '../internal/delegation/DelegationChain.js';
import { ResolutionTrace } from '../internal/resolution/ResolutionTrace.js';
import { RoleValidationError } from '../internal/errors/RoleResolutionError.js';

function freezeCopy(value) {
  if (!value || typeof value !== 'object' || value instanceof Date) {
    return value;
  }
  const copy = Array.isArray(value) ? value.map(freezeCopy) : {};
  if (!Array.isArray(value)) {
    Object.keys(value).forEach((key) => {
      copy[key] = freezeCopy(value[key]);
    });
  }
  return Object.freeze(copy);
}

function actorOrNull(value, field) {
  if (value !== null && !(value instanceof Actor)) {
    throw new RoleValidationError(`${field} must be an Actor or null`);
  }
  return value;
}

function serialize(value) {
  return value && typeof value.toJSON === 'function' ? value.toJSON() : value;
}

/** Immutable outcome of resolving a base assignment through overrides and delegation. */
export class EffectiveAssignmentResult {
  constructor({
    slot,
    baseActor = null,
    permanentActor = null,
    effectiveActor = null,
    delegationChain = DelegationChain.empty(),
    routing = null,
    trace = new ResolutionTrace(),
    metadata = {}
  } = {}) {
    if (!(slot instanceof AssignmentSlot)) {
      throw new RoleValidationError('Effective assignment result slot must be an AssignmentSlot');
    }
    if (!(delegationChain instanceof DelegationChain)) {
      throw new RoleValidationError(
        'Effective assignment result delegationChain must be a DelegationChain'
      );
    }
    if (!(trace instanceof ResolutionTrace)) {
      throw new RoleValidationError('Effective assignment result trace must be a ResolutionTrace');
    }
    if (routing !== null && (!routing || typeof routing !== 'object' || Array.isArray(routing))) {
      throw new RoleValidationError(
        'Effective assignment result routing must be an object or null'
      );
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new RoleValidationError('Effective assignment result metadata must be an object');
    }

    this.slot = slot;
    this.baseActor = actorOrNull(baseActor, 'baseActor');
    this.permanentActor = actorOrNull(permanentActor, 'permanentActor');
    this.effectiveActor = actorOrNull(effectiveActor, 'effectiveActor');
    this.delegationChain = delegationChain;
    this.routing = freezeCopy(routing);
    this.trace = trace;
    this.metadata = freezeCopy(metadata);
    Object.freeze(this);
  }

  toJSON() {
    return {
      slot: this.slot.toJSON(),
      baseActor: serialize(this.baseActor),
      permanentActor: serialize(this.permanentActor),
      effectiveActor: serialize(this.effectiveActor),
      delegationChain: this.delegationChain.toJSON(),
      routing: serialize(this.routing),
      trace: this.trace.toJSON(),
      metadata: { ...this.metadata }
    };
  }
}
