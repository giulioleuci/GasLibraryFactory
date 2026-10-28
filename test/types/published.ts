import { Registry } from '@CoreUtilsLib';
import { SpreadsheetService } from '@GoogleApiWrapper';
import type { TableService } from '@SheetDBLib/src/TableService.js';
import type { Entity, Repository } from '@DomainRepositoryLib';
import { DataProvider, ProviderRegistry } from '@ContextEngine';
import { Pipeline, Step } from '@PipelineFramework';
import type { PipelineContext } from '@PipelineFramework';
import {
  BlockDataContext,
  BlockDefinition,
  HtmlRenderer,
  SimpleContentBlock
} from '@ComposableContentLib';

// Resolve every public entry through the emitted declaration aliases.
type PublishedLibraries = [
  typeof import('@CoreUtilsLib'),
  typeof import('@GasProcessMonitorLib'),
  typeof import('@GasResilienceLib'),
  typeof import('@GasSchemaValidatorLib'),
  typeof import('@GoogleApiWrapper'),
  typeof import('@GasOnlineTestFramework'),
  typeof import('@SheetDBLib'),
  typeof import('@DomainRepositoryLib'),
  typeof import('@GasDataImporter'),
  typeof import('@JobRunnerLib'),
  typeof import('@WorkspaceTemplateEngine'),
  typeof import('@GasExpressionEngineLib'),
  typeof import('@PipelineFramework'),
  typeof import('@ContextEngine'),
  typeof import('@ComposableContentLib'),
  typeof import('@RoleResolutionLib')
];
declare const published: PublishedLibraries;

const logger = { debug() {}, info() {}, warn() {}, error() {} };
const cache = { get: (_key: string) => null, put() {}, remove() {} };
const retry = { executeWithRetry: <Value>(operation: () => Value): Value => operation() };
const sheets = new SpreadsheetService(logger, cache, {}, retry);
const nativeSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = sheets.openStandard('sheet-id');
const nativeSheet: GoogleAppsScript.Spreadsheet.Sheet | null =
  nativeSpreadsheet.getSheetByName('People');
// @ts-expect-error Emitted native methods retain the upstream string ID contract.
sheets.openStandard(123);

interface PersonRow {
  id: string;
  count: number;
  active: boolean;
}
declare const table: TableService<PersonRow>;
const rows: PersonRow[] = table.getRows();
table.patchRow('person-1', { count: 0, active: false });
// @ts-expect-error Emitted data contracts reject strings in a known numeric field.
table.patchRow('person-1', { count: '0' });

interface PersonEntity extends Entity {
  count: number;
}
declare const repository: Repository<PersonEntity>;
const person: PersonEntity | null = repository.findById('person-1');
// @ts-expect-error Repository generics survive declaration emission.
repository.patchById('person-1', { count: '0' });

class PeopleProvider extends DataProvider<{ id: string }, PersonRow[]> {
  _fetchData(parameters: { id: string }) {
    return table.getRows().filter((row) => row.id === parameters.id);
  }
}
const provider = new PeopleProvider(logger);
const providers = new ProviderRegistry<PeopleProvider>(logger).registerSingleton(
  'people',
  provider
);
const people: PersonRow[] = providers.get('people').provide('people', { id: 'person-1' });
// @ts-expect-error Custom provider parameter types survive declaration emission.
provider.provide('people', { id: 1 });

interface Payload {
  people: PersonRow[];
  count: number;
}
class CountStep extends Step<Payload> {
  _executeLogic(context: PipelineContext<Payload>) {
    this.setResult(context, 'count', (context.get('people') ?? []).length);
  }
}
const pipeline = new Pipeline<Payload>(logger).addStep(new CountStep('count', logger));
const execution: PipelineContext<Payload> = pipeline.execute({ people });
const count: number | null | undefined = execution.get('count');
// @ts-expect-error Known payload types survive declaration emission.
execution.set('count', 'one');

const context = new BlockDataContext({ count: 1 });
const renderer = new HtmlRenderer<{ count: number }>();
renderer.registerTemplate('count', (data) => String(data.count));
// @ts-expect-error Synchronous rendering callbacks must return a string.
renderer.registerTemplate('bad', (data) => data.count);
const block = new SimpleContentBlock<{ count: number }, BlockDataContext<{ count: number }>>(
  new BlockDefinition({ id: 'count', name: 'Count' }),
  {
    dataExtractor: (data) => ({ count: data.get('count', 0) }),
    templates: { html: 'count' }
  }
);
const extracted: number = block.getData(context).count;
const registry = new Registry<string, number>();
registry.set('count', extracted);
const registered: number | null | undefined = registry.get('count');

// @ts-expect-error A published GAS consumer has no Node process global.
process.cwd();
// @ts-expect-error A published GAS consumer has no browser DOM.
document.createElement('div');
void [published, nativeSheet, rows, person, count, registered];
