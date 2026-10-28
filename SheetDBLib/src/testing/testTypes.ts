import type { Mock, Mocked } from 'jest-mock';
import type { testing as CoreTesting } from '@CoreUtilsLib';
import type { testing as ResilienceTesting } from '@GasResilienceLib';
type Fn<R = unknown, A extends unknown[] = unknown[]> = Mock<(...args: A) => R>;
import type {
  GoogleLogger,
  SheetStorage,
  RowRecord,
  QueryDatabase,
  QueryTable,
  QueryCacheService
} from '../types.js';

export type TestLogger = Mocked<GoogleLogger>;
export type TestSpreadsheet = {
  getRanges: Fn<
    unknown,
    [spreadsheetId: string, ranges: string | string[], options?: Record<string, unknown>]
  > &
    SheetStorage['getRanges'];
  getSheetInfo: Fn<
    { name: string }[],
    [spreadsheetId: string, options?: { includeHidden?: boolean }]
  >;
  updateRanges: Fn<unknown, unknown[]>;
  appendRows: Fn<unknown, [spreadsheetId: string, data: Parameters<SheetStorage['appendRows']>[1]]>;
  insertRow: Fn<unknown, unknown[]>;
  deleteRows: Fn<unknown, unknown[]>;
  deleteRow: Fn<unknown, unknown[]>;
  getLastError: Fn<unknown, unknown[]>;
  flushBatch: Fn<unknown, unknown[]>;
  _batchUpdates?: unknown[];
  _clearAll(): void;
};
export interface TestMocks {
  logger: InstanceType<typeof CoreTesting.LoggerServiceMock>;
  utils: InstanceType<typeof CoreTesting.UtilsServiceMock>;
  cache: InstanceType<typeof CoreTesting.CacheInterfaceMock>;
  exceptionService: InstanceType<typeof ResilienceTesting.ExceptionServiceMock>;
  spreadsheetService: TestSpreadsheet;
}
export interface TestCache extends Mocked<QueryCacheService> {
  _clear(): void;
  removeAll: Fn<unknown, []>;
}
export interface TestGlobals {
  resetGasMocks(): void;
  mockSpreadsheetService(): TestSpreadsheet;
  mockLoggerService(): TestLogger;
  mockCacheService(): TestCache;
}
export type TestQueryTable = QueryTable & {
  getRows?: Fn<RowRecord[], []>;
  _indices: NonNullable<QueryTable['_indices']>;
};
export type TestDatabase = QueryDatabase & { tables: Record<string, TestQueryTable> };
