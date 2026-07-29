import { RoleValidationError } from '../errors/RoleResolutionError.js';
import { RoutingPolicy, isValidRoutingPolicy } from '../routing/RoutingPolicy.js';

const TIE_BEHAVIORS = Object.freeze(['THROW', 'FIRST']);
const MISSING_ACTOR_BEHAVIORS = Object.freeze(['THROW', 'NULL']);

/** Immutable policy options for effective-assignment resolution. */
export class ResolutionPolicy {
  constructor({
    tieBehavior = 'THROW',
    missingActorBehavior = 'THROW',
    maxDelegationDepth = null,
    routingPolicy = RoutingPolicy.DELEGATE_OR_PRINCIPAL,
    resultIdentity = ['slot', 'principalActor']
  } = {}) {
    if (!TIE_BEHAVIORS.includes(tieBehavior)) {
      throw new RoleValidationError(`Invalid tie behavior: ${tieBehavior}`);
    }
    if (!MISSING_ACTOR_BEHAVIORS.includes(missingActorBehavior)) {
      throw new RoleValidationError(`Invalid missing actor behavior: ${missingActorBehavior}`);
    }
    if (
      maxDelegationDepth !== null &&
      (!Number.isInteger(maxDelegationDepth) || maxDelegationDepth < 1)
    ) {
      throw new RoleValidationError('maxDelegationDepth must be null or a positive integer');
    }
    if (!isValidRoutingPolicy(routingPolicy)) {
      throw new RoleValidationError(`Invalid routing policy: ${routingPolicy}`);
    }
    if (
      !Array.isArray(resultIdentity) ||
      resultIdentity.length === 0 ||
      resultIdentity.some((field) => typeof field !== 'string' || !field.trim())
    ) {
      throw new RoleValidationError(
        'resultIdentity must be a non-empty array of non-blank strings'
      );
    }

    this.tieBehavior = tieBehavior;
    this.missingActorBehavior = missingActorBehavior;
    this.maxDelegationDepth = maxDelegationDepth;
    this.routingPolicy = routingPolicy;
    this.resultIdentity = Object.freeze([...resultIdentity]);
    Object.freeze(this);
  }

  toJSON() {
    return {
      tieBehavior: this.tieBehavior,
      missingActorBehavior: this.missingActorBehavior,
      maxDelegationDepth: this.maxDelegationDepth,
      routingPolicy: this.routingPolicy,
      resultIdentity: [...this.resultIdentity]
    };
  }
}
