import { CacheService, MailService, UserService, UtilitiesService } from '@GoogleApiWrapper';
import type { RendererLike } from '../../ComposableContentLib/src/types.js';
import type { SourceAdapter, ImportTable } from '../../GasDataImporter/src/types.js';
import type { QueryTable } from '../../SheetDBLib/src/types.js';
import type { RepositoryTable } from '../../DomainRepositoryLib/src/internal/contracts.js';
import type { ProcessorHost } from '../../WorkspaceTemplateEngine/src/types.js';
import type { DocumentTableFacade } from '../../GoogleApiWrapper/src/internal/services-managers/DocumentContracts.js';
import type {
  ProviderLookup,
  InterceptorLookup
} from '../../ContextEngine/src/internal/contracts.js';
import type { RoutingChain } from '../../RoleResolutionLib/src/types.js';
import type { JobLogger } from '../../JobRunnerLib/src/types.js';

// @ts-expect-error Cache operations always log debug messages.
new CacheService({ warn() {}, error() {} });
// @ts-expect-error Mail delivery always logs debug messages.
new MailService({ error() {} }, { sleep() {} });
// @ts-expect-error User operations always log debug messages.
new UserService({ error() {} });
// @ts-expect-error Utility operations always log debug messages.
new UtilitiesService({ error() {} });
// @ts-expect-error Rendering requires a renderer implementation.
const renderer: Pick<RendererLike, 'render'> = {};
// @ts-expect-error Chunk extraction always asks whether the source supports cursors.
const source: Pick<SourceAdapter, 'supportsCursor'> = {};
// @ts-expect-error Table queries read rows and initialize/query indices.
const table: Pick<
  QueryTable,
  'getRows' | '_indices' | '_ensureDataLoaded' | 'getRowById' | 'fuzzySearchRows'
> = {};
// @ts-expect-error Repository bulk/patch operations require these methods.
const repository: Pick<RepositoryTable, 'insertRows' | 'patchRow'> = {};
// @ts-expect-error Update/delete loading strategies require these methods.
const loadTable: Pick<ImportTable, 'updateRowById' | 'deleteRowById'> = {};
// @ts-expect-error Document processing consumes the lookup and segment helpers.
const mustache: Pick<ProcessorHost['mustache'], 'getValue' | 'renderSegments' | '_lookupValue'> =
  {};
// @ts-expect-error Document table operations require retry and table lookup.
const document: Pick<DocumentTableFacade, '_executeWithRetry' | 'getDocumentTables'> = {};
// @ts-expect-error Dependency summaries enumerate providers.
const providers: Pick<ProviderLookup, 'getRegisteredTypes'> = {};
// @ts-expect-error Dependency summaries enumerate interceptors.
const interceptors: Pick<InterceptorLookup, 'getRegisteredTypes'> = {};
// @ts-expect-error Routing reads the chain endpoints and actors.
const chain: Pick<RoutingChain, 'getLast' | 'getAllActorIds'> = {};
// @ts-expect-error CapturingLogger forwards programmatic logs.
const logger: Pick<JobLogger, 'log'> = {};
void [
  renderer,
  source,
  table,
  repository,
  loadTable,
  mustache,
  document,
  providers,
  interceptors,
  chain,
  logger
];
