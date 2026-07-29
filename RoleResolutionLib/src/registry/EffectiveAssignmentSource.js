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

export function splitCsv(value) {
  if (Array.isArray(value)) {
    return value.flatMap(splitCsv);
  }
  if (typeof value !== 'string') {
    return value == null ? [] : [String(value)];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Matches opaque dimensions against literal, CSV, and wildcard values. */
export function matchesContextDimensions(context, dimensions = {}) {
  return Object.entries(dimensions).every(([name, expected]) => {
    const values = splitCsv(expected);
    return values.includes('*') || values.includes(String(context[name]));
  });
}
