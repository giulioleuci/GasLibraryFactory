import type { TableService } from '@SheetDBLib';
import type { Entity, Repository } from '@DomainRepositoryLib';
import type { Loader, LoadConfig, Transformer } from '@GasDataImporter';
import type { JobExecutor } from '@JobRunnerLib/src/JobQueue.js';

interface PersonRow {
  id: string;
  name: string;
  count: number;
  enabled: boolean;
  createdAt: Date | null;
}
declare const table: TableService<PersonRow>;
const rows: PersonRow[] = table.getRows();
const row: PersonRow | null = table.getByPK('person-1');
const blankRows: Partial<PersonRow>[] = table.getRows({ preserveEmptyRows: true });
table.patchRow('person-1', { count: 0, enabled: false, createdAt: null });
// @ts-expect-error Known numeric fields cannot receive strings.
table.patchRow('person-1', { count: '0' });
// @ts-expect-error The existing loader flag is boolean.
table.getRows({ preserveEmptyRows: 'yes' });

interface PersonEntity extends Entity {
  count: number;
}
declare const repository: Repository<PersonEntity>;
const entities: PersonEntity[] = repository.findAll();
const entity: PersonEntity | null = repository.findById('person-1');
repository.patchById('person-1', { count: 0 });
// @ts-expect-error Repository reads preserve the caller's entity fields.
const wrongCount: string = repository.findByIdOrFail('person-1').count;
// @ts-expect-error Patches preserve known entity field types.
repository.patchById('person-1', { count: '0' });
void [rows, row, blankRows, entities, entity, wrongCount];

const loadConfig: LoadConfig<PersonRow> = {
  targetTable: 'People',
  conflictResolution: 'UPSERT',
  conflictKey: 'id',
  updateIfNewer: { enabled: false }
};
declare const loader: Loader<PersonRow>;
loader.load(rows, loadConfig);
// @ts-expect-error Conflict keys must belong to the known row.
const wrongKey: LoadConfig<PersonRow> = { ...loadConfig, conflictKey: 'missing' };
// @ts-expect-error Only existing conflict resolution modes are supported.
const wrongMode: LoadConfig<PersonRow> = { ...loadConfig, conflictResolution: 'REPLACE' };
declare const transformer: Transformer;
const transformed: PersonRow[] = transformer.transform(rows);
void [wrongKey, wrongMode, transformed];

export function jobResultContract(executor: JobExecutor) {
  const result = executor.execute(
    function* () {
      yield { count: 1, percentage: 50 };
      return { count: 2 };
    },
    {},
    0,
    1000
  );
  const count: number | undefined = result.value?.count;
  // @ts-expect-error Generator checkpoint and return values preserve numeric fields.
  const wrong: string = result.value!.count;
  return { count, wrong };
}
