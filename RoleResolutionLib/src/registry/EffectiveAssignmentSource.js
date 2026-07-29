/** Generic persistence contracts for effective-assignment resolution. */
export class AssignmentSource {
  getAssignments(_context, _asOfDate) {
    throw new Error('AssignmentSource.getAssignments() must be implemented');
  }
}

export class OverrideSource {
  getOverrides(_context, _asOfDate) {
    throw new Error('OverrideSource.getOverrides() must be implemented');
  }
}

export class ActorSource {
  getActor(_actorId) {
    throw new Error('ActorSource.getActor() must be implemented');
  }
}
