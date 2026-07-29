import { AssignmentCandidate } from '../core/AssignmentCandidate.js';
import { AssignmentOverride } from '../core/AssignmentOverride.js';
import { AssignmentSlot } from '../core/AssignmentSlot.js';
import { Delegation } from '../internal/delegation/Delegation.js';
import { AssignmentSource, OverrideSource } from './EffectiveAssignmentSource.js';

export { AssignmentSource, OverrideSource, ActorSource } from './EffectiveAssignmentSource.js';

function getPath(value, path) {
  if (typeof path !== 'string' || !path.trim()) {
    return undefined;
  }
  return path
    .split('.')
    .reduce((current, part) => (current == null ? undefined : current[part]), value);
}

function csv(value) {
  if (Array.isArray(value)) {
    return value.flatMap(csv);
  }
  if (typeof value !== 'string') {
    return value == null ? [] : [String(value)];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapped(row, definition) {
  if (
    definition &&
    typeof definition === 'object' &&
    !Array.isArray(definition) &&
    'from' in definition
  ) {
    const value = getPath(row, definition.from);
    return definition.parse === 'csv' ? csv(value) : value;
  }
  return definition;
}

function mapDimensions(row, dimensions = {}) {
  return Object.entries(dimensions).reduce((result, [name, definition]) => {
    result[name] = mapped(row, definition);
    return result;
  }, {});
}

function expandDimensions(dimensions) {
  return Object.entries(dimensions).reduce(
    (combinations, [name, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return combinations.flatMap((combination) =>
        values.map((item) => ({ ...combination, [name]: item }))
      );
    },
    [{}]
  );
}

function matches(context, dimensions) {
  return Object.entries(dimensions).every(([name, expected]) => {
    const values = Array.isArray(expected) ? expected : csv(expected);
    return values.includes('*') || values.includes(String(context[name]));
  });
}

function rowsFor(rows, context) {
  const resolved = typeof rows === 'function' ? rows(context) : rows;
  return Array.isArray(resolved) ? resolved : [];
}

/** Maps wide, tabular rows to opaque assignment candidates. */
export class WideRowAssignmentSource extends AssignmentSource {
  constructor({ rows, rowIdentityPath, actorSource, columns, csv: useCsv = true } = {}) {
    super();
    this._rows = rows;
    this._rowIdentityPath = rowIdentityPath;
    this._actorSource = actorSource;
    this._columns = columns || [];
    this._csv = useCsv;
  }

  getAssignments(context, _asOfDate) {
    const candidates = [];
    rowsFor(this._rows, context).forEach((row) => {
      const rowId = getPath(row, this._rowIdentityPath);
      this._columns.forEach((column) => {
        const contextDimensions = mapDimensions(row, column.contextDimensions);
        if (!matches(context, contextDimensions)) {
          return;
        }
        const ids = this._csv
          ? csv(getPath(row, column.name))
          : [getPath(row, column.name)].filter(Boolean);
        ids.forEach((actorId) => {
          candidates.push(
            new AssignmentCandidate({
              id: `${rowId}:${column.name}:${actorId}`,
              actorId,
              slot: new AssignmentSlot({ dimensions: mapDimensions(row, column.slotDimensions) }),
              source: 'wide-row',
              metadata: { rowIdentity: rowId, column: column.name, contextDimensions }
            })
          );
        });
      });
    });
    return candidates;
  }
}

/** Maps generic rows to dated, opaque assignment overrides. */
export class MappedOverrideSource extends OverrideSource {
  constructor({ rows, mapping } = {}) {
    super();
    this._rows = rows;
    this._mapping = mapping || {};
  }
  getOverrides(context, _asOfDate) {
    return rowsFor(this._rows, context)
      .flatMap((row) => {
        const slotScope = mapDimensions(row, this._mapping.scope);
        return expandDimensions(slotScope).map((scope) => ({ row, slotScope: scope }));
      })
      .filter(({ slotScope }) => matches(context, slotScope))
      .map(
        ({ row, slotScope }) =>
          new AssignmentOverride({
            id: mapped(row, this._mapping.id),
            previousActorId: mapped(row, this._mapping.previousActorId),
            nextActorId: mapped(row, this._mapping.nextActorId),
            effectiveFrom: mapped(row, this._mapping.effectiveFrom),
            slotScope,
            source: 'mapped-override'
          })
      );
  }
}

/** Maps generic rows to context-scoped delegation values. */
export class MappedDelegationSource {
  constructor({ rows, mapping } = {}) {
    this._rows = rows;
    this._mapping = mapping || {};
  }
  getDelegations(context, asOfDate) {
    return rowsFor(this._rows, context)
      .map((row) => {
        const scope = mapDimensions(row, this._mapping.scope);
        return { row, scope };
      })
      .filter(({ scope }) => matches(context, scope))
      .map(
        ({ row, scope }) =>
          new Delegation({
            id: mapped(row, this._mapping.id),
            principalId: mapped(row, this._mapping.principalId),
            delegateId: mapped(row, this._mapping.delegateId),
            validFrom: mapped(row, this._mapping.validFrom),
            validTo: mapped(row, this._mapping.validTo),
            routingPolicy: mapped(row, this._mapping.routingPolicy) || undefined,
            metadata: { scope }
          })
      )
      .filter((delegation) => delegation.isValidAt(asOfDate));
  }
}

/** Combines independent candidate sources with a deterministic identity. */
export class CompositeAssignmentSource extends AssignmentSource {
  constructor({
    sources,
    identity = ['slot.key', 'actorId'],
    mergeMetadata = (left, right) => ({ ...left, ...right })
  } = {}) {
    super();
    this._sources = sources || [];
    this._identity = identity;
    this._mergeMetadata = mergeMetadata;
  }
  getAssignments(context, asOfDate) {
    const byIdentity = new Map();
    this._sources.forEach((source) =>
      source.getAssignments(context, asOfDate).forEach((candidate) => {
        const key = this._identity.map((path) => getPath(candidate, path)).join('\u0000');
        const existing = byIdentity.get(key);
        if (!existing) {
          byIdentity.set(key, candidate);
          return;
        }
        byIdentity.set(key, {
          ...existing,
          metadata: this._mergeMetadata(existing.metadata || {}, candidate.metadata || {})
        });
      })
    );
    return [...byIdentity.values()];
  }
}
