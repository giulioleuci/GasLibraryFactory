import { AssignmentCandidate } from '../../core/AssignmentCandidate.js';
import { DelegationChain } from '../delegation/DelegationChain.js';
import { EffectiveAssignmentResult } from '../../core/EffectiveAssignmentResult.js';
import { ResolutionPolicy } from './ResolutionPolicy.js';
import { ResolutionTrace } from './ResolutionTrace.js';
import { RoutingResolver } from '../routing/RoutingResolver.js';
import {
  AmbiguousAssignmentOverrideError,
  AssignmentActorNotFoundError,
  CircularDelegationError,
  DelegationDepthExceededError,
  InconsistentAssignmentOverrideError,
  OverlappingDelegationError,
  RoleValidationError
} from '../errors/RoleResolutionError.js';

function contextMatches(context, scope = {}) {
  return Object.entries(scope).every(([name, expected]) => {
    const values = Array.isArray(expected)
      ? expected
      : String(expected)
          .split(',')
          .map((item) => item.trim());
    return values.includes('*') || values.includes(String(context[name]));
  });
}

function append(trace, stage, decision, candidateId, actorId, reason, metadata = {}) {
  return trace.append({ stage, decision, candidateId, actorId, reason, metadata });
}

/** Resolves generic candidates through temporal overrides, delegation, and routing. */
export class EffectiveAssignmentResolver {
  constructor({
    actorSource,
    assignmentSource,
    overrideSource,
    delegationSource,
    policy = new ResolutionPolicy(),
    routingResolver = new RoutingResolver()
  } = {}) {
    if (!actorSource || typeof actorSource.getActor !== 'function') {
      throw new RoleValidationError('actorSource.getActor is required');
    }
    if (!assignmentSource || typeof assignmentSource.getAssignments !== 'function') {
      throw new RoleValidationError('assignmentSource.getAssignments is required');
    }
    if (!overrideSource || typeof overrideSource.getOverrides !== 'function') {
      throw new RoleValidationError('overrideSource.getOverrides is required');
    }
    if (!delegationSource || typeof delegationSource.getDelegations !== 'function') {
      throw new RoleValidationError('delegationSource.getDelegations is required');
    }
    if (!(policy instanceof ResolutionPolicy)) {
      throw new RoleValidationError('policy must be a ResolutionPolicy');
    }
    this._actorSource = actorSource;
    this._assignmentSource = assignmentSource;
    this._overrideSource = overrideSource;
    this._delegationSource = delegationSource;
    this._policy = policy;
    this._routingResolver = routingResolver;
  }

  resolve({ context = {}, asOfDate, routingPolicy = null } = {}) {
    if (!(asOfDate instanceof Date) || Number.isNaN(asOfDate.getTime())) {
      throw new RoleValidationError('asOfDate must be a valid Date');
    }
    const candidates = this._assignmentSource
      .getAssignments(context, asOfDate)
      .filter((candidate) => candidate instanceof AssignmentCandidate)
      .sort(
        (left, right) =>
          left.slot.key.localeCompare(right.slot.key) || left.actorId.localeCompare(right.actorId)
      );
    const overrides = this._overrideSource.getOverrides(context, asOfDate);
    const delegations = this._delegationSource.getDelegations(context, asOfDate);
    this._validateOverrides(candidates, overrides, asOfDate);
    return candidates
      .filter((candidate) => candidate.isValidAt(asOfDate))
      .map((candidate) =>
        this._resolveCandidate(candidate, context, asOfDate, overrides, delegations, routingPolicy)
      );
  }

  _resolveCandidate(candidate, context, asOfDate, overrides, delegations, routingPolicy) {
    let trace = append(
      new ResolutionTrace(),
      'BASE',
      'CONSIDERED',
      candidate.id,
      candidate.actorId,
      'candidate loaded'
    );
    const baseActor = this._getActor(candidate.actorId, candidate.id);
    trace = append(
      trace,
      'BASE',
      'SELECTED',
      candidate.id,
      baseActor && baseActor.id,
      'valid base candidate selected'
    );

    const selectedOverride = this._selectOverride(candidate, overrides, asOfDate);
    let permanentActor = baseActor;
    if (selectedOverride) {
      trace = append(
        trace,
        'OVERRIDE',
        'APPLIED',
        candidate.id,
        selectedOverride.nextActorId,
        'latest matching override applied',
        { overrideId: selectedOverride.id }
      );
      permanentActor = this._getActor(selectedOverride.nextActorId, candidate.id);
    } else {
      trace = append(
        trace,
        'OVERRIDE',
        'REJECTED',
        candidate.id,
        candidate.actorId,
        'no applicable override'
      );
    }

    const delegation = this._resolveDelegations(
      permanentActor,
      candidate,
      context,
      asOfDate,
      delegations,
      trace
    );
    trace = delegation.trace;
    const routing = this._routingResolver.resolve({
      principalActor: permanentActor,
      effectiveActor: delegation.effectiveActor,
      delegationChain: delegation.chain,
      routingPolicy: routingPolicy || this._policy.routingPolicy
    });
    trace = append(
      trace,
      'ROUTING',
      'SELECTED',
      candidate.id,
      delegation.effectiveActor && delegation.effectiveActor.id,
      'routing resolved',
      { policy: routingPolicy || this._policy.routingPolicy }
    );
    return new EffectiveAssignmentResult({
      slot: candidate.slot,
      baseActor,
      permanentActor,
      effectiveActor: delegation.effectiveActor,
      delegationChain: delegation.chain,
      routing,
      trace,
      metadata: { candidateId: candidate.id }
    });
  }

  _validateOverrides(candidates, overrides, asOfDate) {
    overrides
      .filter((override) => asOfDate >= override.effectiveFrom)
      .forEach((override) => {
        const matchesSlot = candidates.filter((candidate) =>
          candidate.slot.matches(override.slotScope)
        );
        if (
          matchesSlot.length > 0 &&
          !matchesSlot.some((candidate) => candidate.actorId === override.previousActorId)
        ) {
          throw new InconsistentAssignmentOverrideError(
            'Applicable override does not match a base actor',
            { overrideId: override.id }
          );
        }
      });
  }

  _selectOverride(candidate, overrides, asOfDate) {
    const applicable = overrides.filter((override) => override.matches(candidate, asOfDate));
    if (applicable.length === 0) {
      return null;
    }
    const latest = Math.max(...applicable.map((override) => override.effectiveFrom.getTime()));
    const finalists = applicable.filter((override) => override.effectiveFrom.getTime() === latest);
    if (finalists.length > 1) {
      throw new AmbiguousAssignmentOverrideError(
        candidate.id,
        finalists.map((override) => override.id)
      );
    }
    return finalists[0];
  }

  _resolveDelegations(permanentActor, candidate, context, asOfDate, delegations, trace) {
    let chain = DelegationChain.empty();
    let current = permanentActor;
    while (current) {
      const outgoing = delegations.filter(
        (delegation) =>
          delegation.principalId === current.id &&
          delegation.isValidAt(asOfDate) &&
          contextMatches(context, delegation.metadata.scope)
      );
      if (outgoing.length === 0) {
        trace = append(
          trace,
          'DELEGATION',
          'REJECTED',
          candidate.id,
          current.id,
          'no outgoing delegation'
        );
        return { chain, effectiveActor: current, trace };
      }
      if (outgoing.length > 1) {
        throw new OverlappingDelegationError(current.id, {
          delegationIds: outgoing.map((item) => item.id)
        });
      }
      const next = outgoing[0];
      if (chain.wouldCreateCycle(next)) {
        throw new CircularDelegationError(next.delegateId, [
          ...chain.getAllActorIds(),
          next.delegateId
        ]);
      }
      if (
        this._policy.maxDelegationDepth !== null &&
        chain.getDepth() + 1 > this._policy.maxDelegationDepth
      ) {
        throw new DelegationDepthExceededError(
          chain.getDepth() + 1,
          this._policy.maxDelegationDepth
        );
      }
      chain = chain.extend(next);
      current = this._getActor(next.delegateId, candidate.id);
      trace = append(
        trace,
        'DELEGATION',
        'APPLIED',
        candidate.id,
        current && current.id,
        'delegation applied',
        { delegationId: next.id }
      );
    }
    return { chain, effectiveActor: current, trace };
  }

  _getActor(actorId, candidateId) {
    const actor = this._actorSource.getActor(actorId);
    if (actor) {
      return actor;
    }
    if (this._policy.missingActorBehavior === 'NULL') {
      return null;
    }
    throw new AssignmentActorNotFoundError(actorId, { candidateId });
  }
}
