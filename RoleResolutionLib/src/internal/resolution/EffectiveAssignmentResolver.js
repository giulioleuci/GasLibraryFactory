import { AssignmentCandidate } from '../../core/AssignmentCandidate.js';
import { DelegationChain } from '../delegation/DelegationChain.js';
import { EffectiveAssignmentResult } from '../../core/EffectiveAssignmentResult.js';
import { ResolutionPolicy } from './ResolutionPolicy.js';
import { ResolutionTrace } from './ResolutionTrace.js';
import { RoutingResolver } from '../routing/RoutingResolver.js';
import { matchesContextDimensions } from '../../registry/EffectiveAssignmentSource.js';
import {
  AmbiguousAssignmentOverrideError,
  AssignmentActorNotFoundError,
  CircularDelegationError,
  DelegationDepthExceededError,
  InconsistentAssignmentOverrideError,
  OverlappingDelegationError,
  RoleValidationError
} from '../errors/RoleResolutionError.js';

function append(trace, stage, decision, candidateId, actorId, reason, metadata = {}) {
  return trace.append({ stage, decision, candidateId, actorId, reason, metadata });
}

function withTrace(error, trace) {
  error.resolutionTrace = trace;
  return error;
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
    if (
      !delegationSource ||
      (typeof delegationSource.getDelegations !== 'function' &&
        typeof delegationSource.getActiveDelegationsForPrincipal !== 'function')
    ) {
      throw new RoleValidationError(
        'delegationSource.getDelegations or getActiveDelegationsForPrincipal is required'
      );
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
    this._validateOverrides(candidates, overrides, asOfDate);
    return candidates
      .filter((candidate) => candidate.isValidAt(asOfDate))
      .map((candidate) =>
        this._resolveCandidate(candidate, context, asOfDate, overrides, routingPolicy)
      );
  }

  _resolveCandidate(candidate, context, asOfDate, overrides, routingPolicy) {
    let trace = append(
      new ResolutionTrace(),
      'BASE',
      'CONSIDERED',
      candidate.id,
      candidate.actorId,
      'candidate loaded'
    );
    const baseActor = this._getActor(candidate.actorId, candidate.id, trace, 'BASE');
    trace = append(
      trace,
      'BASE',
      'SELECTED',
      candidate.id,
      baseActor && baseActor.id,
      'valid base candidate selected'
    );

    const overrideSelection = this._selectOverride(candidate, overrides, asOfDate, trace);
    trace = overrideSelection.trace;
    const selectedOverride = overrideSelection.override;
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
      permanentActor = this._getActor(
        selectedOverride.nextActorId,
        candidate.id,
        trace,
        'OVERRIDE'
      );
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
        if (!candidates.some((candidate) => override.matches(candidate, asOfDate))) {
          let trace = append(
            new ResolutionTrace(),
            'OVERRIDE',
            'CONSIDERED',
            null,
            override.previousActorId,
            'effective override validated',
            { overrideId: override.id }
          );
          trace = append(
            trace,
            'OVERRIDE',
            'REJECTED',
            null,
            override.previousActorId,
            'effective override does not match a base candidate',
            { overrideId: override.id }
          );
          throw withTrace(
            new InconsistentAssignmentOverrideError(
              'Applicable override does not match a base actor',
              { overrideId: override.id }
            ),
            trace
          );
        }
      });
  }

  _selectOverride(candidate, overrides, asOfDate, trace) {
    const applicable = [];
    overrides.forEach((override) => {
      trace = append(
        trace,
        'OVERRIDE',
        'CONSIDERED',
        candidate.id,
        candidate.actorId,
        'override evaluated',
        { overrideId: override.id }
      );
      if (!override.matches(candidate, asOfDate)) {
        trace = append(
          trace,
          'OVERRIDE',
          'REJECTED',
          candidate.id,
          candidate.actorId,
          'override does not match candidate',
          { overrideId: override.id }
        );
        return;
      }
      applicable.push(override);
    });
    if (applicable.length === 0) {
      return { override: null, trace };
    }
    const latest = Math.max(...applicable.map((override) => override.effectiveFrom.getTime()));
    const finalists = applicable.filter((override) => override.effectiveFrom.getTime() === latest);
    if (finalists.length > 1) {
      trace = append(
        trace,
        'OVERRIDE',
        'REJECTED',
        candidate.id,
        candidate.actorId,
        'ambiguous latest overrides',
        { overrideIds: finalists.map((override) => override.id) }
      );
      throw withTrace(
        new AmbiguousAssignmentOverrideError(
          candidate.id,
          finalists.map((override) => override.id)
        ),
        trace
      );
    }
    applicable
      .filter((override) => override !== finalists[0])
      .forEach((override) => {
        trace = append(
          trace,
          'OVERRIDE',
          'REJECTED',
          candidate.id,
          candidate.actorId,
          'superseded by a later override',
          { overrideId: override.id }
        );
      });
    return { override: finalists[0], trace };
  }

  _resolveDelegations(permanentActor, candidate, context, asOfDate, trace) {
    let chain = DelegationChain.empty();
    let current = permanentActor;
    while (current) {
      const outgoing = this._getOutgoingDelegations(current.id, context, asOfDate).filter(
        (delegation) =>
          delegation.principalId === current.id &&
          delegation.isValidAt(asOfDate) &&
          matchesContextDimensions(context, delegation.metadata.scope)
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
        trace = append(
          trace,
          'DELEGATION',
          'REJECTED',
          candidate.id,
          current.id,
          'overlapping outgoing delegations',
          { delegationIds: outgoing.map((item) => item.id) }
        );
        throw withTrace(
          new OverlappingDelegationError(current.id, {
            delegationIds: outgoing.map((item) => item.id)
          }),
          trace
        );
      }
      const next = outgoing[0];
      if (chain.wouldCreateCycle(next)) {
        trace = append(
          trace,
          'DELEGATION',
          'REJECTED',
          candidate.id,
          next.delegateId,
          'delegation cycle detected',
          { delegationId: next.id }
        );
        throw withTrace(
          new CircularDelegationError(next.delegateId, [
            ...chain.getAllActorIds(),
            next.delegateId
          ]),
          trace
        );
      }
      if (
        this._policy.maxDelegationDepth !== null &&
        chain.getDepth() + 1 > this._policy.maxDelegationDepth
      ) {
        trace = append(
          trace,
          'DELEGATION',
          'REJECTED',
          candidate.id,
          current.id,
          'delegation depth exceeds configured maximum',
          { delegationId: next.id }
        );
        throw withTrace(
          new DelegationDepthExceededError(chain.getDepth() + 1, this._policy.maxDelegationDepth),
          trace
        );
      }
      chain = chain.extend(next);
      current = this._getActor(next.delegateId, candidate.id, trace, 'DELEGATION');
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

  _getOutgoingDelegations(actorId, context, asOfDate) {
    if (typeof this._delegationSource.getDelegations === 'function') {
      return this._delegationSource
        .getDelegations(context, asOfDate)
        .filter((item) => item.principalId === actorId);
    }
    return this._delegationSource.getActiveDelegationsForPrincipal(actorId, asOfDate);
  }

  _getActor(actorId, candidateId, trace, stage) {
    const actor = this._actorSource.getActor(actorId);
    if (actor) {
      return actor;
    }
    if (this._policy.missingActorBehavior === 'NULL') {
      return null;
    }
    const failureTrace = append(
      trace || new ResolutionTrace(),
      stage || 'BASE',
      'REJECTED',
      candidateId,
      actorId,
      'assignment actor not found'
    );
    throw withTrace(new AssignmentActorNotFoundError(actorId, { candidateId }), failureTrace);
  }
}
