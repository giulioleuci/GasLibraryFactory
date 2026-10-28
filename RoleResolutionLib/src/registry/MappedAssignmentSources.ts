import type {
  RoleContext,
  RowProvider,
  DimensionMapping,
  WideRowSourceOptions,
  MappedSourceOptions,
  CompositeSourceOptions,
  AssignmentCandidateRecord
} from '../types.js';
import type { RoutingPolicyValue as RoutingPolicy } from '../internal/routing/RoutingPolicy.js';
import { get } from '@CoreUtilsLib';
import { AssignmentCandidate } from '../core/AssignmentCandidate.js';
import { AssignmentOverride } from '../core/AssignmentOverride.js';
import { AssignmentSlot } from '../core/AssignmentSlot.js';
import { Delegation } from '../internal/delegation/Delegation.js';
import {
  EffectiveAssignmentSource,
  OverrideSource,
  matchesContextDimensions,
  splitCsv
} from './EffectiveAssignmentSource.js';

export {
  EffectiveAssignmentSource,
  OverrideSource,
  ActorSource
} from './EffectiveAssignmentSource.js';

function getPath(value: unknown, path: unknown): unknown {
  if (typeof path !== 'string' || !path.trim()) {
    return undefined;
  }
  return get(value, path);
}

function mapped(row: object, definition: unknown): unknown {
  if (
    definition &&
    typeof definition === 'object' &&
    !Array.isArray(definition) &&
    'from' in definition
  ) {
    const value = getPath(row, definition.from);
    return (definition as { parse?: unknown }).parse === 'csv' ? splitCsv(value) : value;
  }
  return definition;
}

function mapDimensions(row: object, dimensions: DimensionMapping = {}): Record<string, unknown> {
  return Object.entries(dimensions).reduce(
    (result, [name, definition]) => {
      result[name] = mapped(row, definition);
      return result;
    },
    {} as Record<string, unknown>
  );
}

function expandDimensions(dimensions: Record<string, unknown>): Record<string, unknown>[] {
  return Object.entries(dimensions).reduce(
    (combinations, [name, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return combinations.flatMap((combination) =>
        values.map((item) => ({ ...combination, [name]: item }))
      );
    },
    [{}] as Record<string, unknown>[]
  );
}

function rowsFor<Row extends object, C extends object>(
  rows: RowProvider<Row, C>,
  context: C
): Row[] {
  const resolved = typeof rows === 'function' ? rows(context) : rows;
  return Array.isArray(resolved) ? resolved : [];
}

/** Maps wide, tabular rows to opaque assignment candidates. */
export class WideRowAssignmentSource<
  Row extends object = RoleContext,
  C extends object = RoleContext
> extends EffectiveAssignmentSource<C> {
  declare _rows: WideRowSourceOptions<Row, C>['rows'];
  declare _rowIdentityPath: string | undefined;
  declare _actorSource: WideRowSourceOptions<Row, C>['actorSource'];
  declare _columns: NonNullable<WideRowSourceOptions<Row, C>['columns']>;
  declare _csv: boolean;

  constructor({
    rows,
    rowIdentityPath,
    actorSource,
    columns,
    csv: useCsv = true
  }: WideRowSourceOptions<Row, C> = {}) {
    super();
    this._rows = rows;
    this._rowIdentityPath = rowIdentityPath;
    this._actorSource = actorSource;
    this._columns = columns || [];
    this._csv = useCsv;
  }

  getAssignments(context: C, _asOfDate: Date): AssignmentCandidate[] {
    const candidates: AssignmentCandidate[] = [];
    rowsFor(this._rows, context).forEach((row) => {
      const rowId = getPath(row, this._rowIdentityPath);
      this._columns.forEach((column) => {
        const contextDimensions = mapDimensions(row, column.contextDimensions);
        if (!matchesContextDimensions(context, contextDimensions)) {
          return;
        }
        const ids = this._csv
          ? splitCsv(getPath(row, column.name))
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
export class MappedOverrideSource<
  Row extends object = RoleContext,
  C extends object = RoleContext
> extends OverrideSource<C> {
  declare _rows: MappedSourceOptions<Row, C>['rows'];
  declare _mapping: NonNullable<MappedSourceOptions<Row, C>['mapping']>;

  constructor({ rows, mapping }: MappedSourceOptions<Row, C> = {}) {
    super();
    this._rows = rows;
    this._mapping = mapping || {};
  }
  getOverrides(context: C, _asOfDate: Date): AssignmentOverride[] {
    return rowsFor(this._rows, context)
      .flatMap((row) => {
        const slotScope = mapDimensions(row, this._mapping.scope);
        return expandDimensions(slotScope).map((scope) => ({ row, slotScope: scope }));
      })
      .filter(({ slotScope }) => matchesContextDimensions(context, slotScope))
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
export class MappedDelegationSource<
  Row extends object = RoleContext,
  C extends object = RoleContext
> {
  declare _rows: MappedSourceOptions<Row, C>['rows'];
  declare _mapping: NonNullable<MappedSourceOptions<Row, C>['mapping']>;

  constructor({ rows, mapping }: MappedSourceOptions<Row, C> = {}) {
    this._rows = rows;
    this._mapping = mapping || {};
  }
  getDelegations(context: C, asOfDate: Date): Delegation[] {
    return rowsFor(this._rows, context)
      .map((row) => {
        const scope = mapDimensions(row, this._mapping.scope);
        return { row, scope };
      })
      .filter(({ scope }) => matchesContextDimensions(context, scope))
      .map(
        ({ row, scope }) =>
          new Delegation({
            id: mapped(row, this._mapping.id),
            principalId: mapped(row, this._mapping.principalId),
            delegateId: mapped(row, this._mapping.delegateId),
            validFrom: mapped(row, this._mapping.validFrom),
            validTo: mapped(row, this._mapping.validTo),
            routingPolicy: (mapped(row, this._mapping.routingPolicy) || undefined) as
              RoutingPolicy | undefined,
            metadata: { scope }
          })
      )
      .filter((delegation) => delegation.isValidAt(asOfDate));
  }
}

/** Combines independent candidate sources with a deterministic identity. */
export class CompositeAssignmentSource<
  C extends object = RoleContext,
  T extends AssignmentCandidateRecord = AssignmentCandidate
> extends EffectiveAssignmentSource<C, T | AssignmentCandidate> {
  declare _sources: NonNullable<CompositeSourceOptions<C, T>['sources']>;
  declare _identity: string[];
  declare _mergeMetadata: NonNullable<CompositeSourceOptions<C, T>['mergeMetadata']>;

  constructor({
    sources,
    identity = ['slot.key', 'actorId'],
    mergeMetadata = (left, right) => ({ ...left, ...right })
  }: CompositeSourceOptions<C, T> = {}) {
    super();
    this._sources = sources || [];
    this._identity = identity;
    this._mergeMetadata = mergeMetadata;
  }
  getAssignments(context: C, asOfDate: Date): (T | AssignmentCandidate)[] {
    const byIdentity = new Map<string, T | AssignmentCandidate>();
    this._sources.forEach((source) =>
      source.getAssignments(context, asOfDate).forEach((candidate) => {
        const key = this._identity.map((path) => getPath(candidate, path)).join('\u0000');
        const existing = byIdentity.get(key);
        if (!existing) {
          byIdentity.set(key, candidate);
          return;
        }
        const metadata = this._mergeMetadata(existing.metadata || {}, candidate.metadata || {});
        byIdentity.set(
          key,
          existing instanceof AssignmentCandidate
            ? new AssignmentCandidate({ ...existing.toJSON(), metadata })
            : { ...existing, metadata }
        );
      })
    );
    return [...byIdentity.values()];
  }
}
