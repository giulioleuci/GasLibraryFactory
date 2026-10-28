import type { Mock } from 'jest-mock';
import type { DomainLogger, DomainRecord, RepositoryCache } from '../internal/contracts.js';

export interface QueryFixture<Row extends object = DomainRecord> {
  from: Mock<(table: string) => QueryFixture<Row>>;
  where: Mock<(field: string, operator: string, value: unknown) => QueryFixture<Row>>;
  andWhere?: Mock<(field: string, operator: string, value: unknown) => QueryFixture<Row>>;
  orWhere?: Mock<(field: string, operator: string, value: unknown) => QueryFixture<Row>>;
  whereIn?: Mock<(field: string, values: unknown) => QueryFixture<Row>>;
  whereLike?: Mock<(field: string, pattern: unknown) => QueryFixture<Row>>;
  execute: Mock<() => Row[]>;
  tableName?: string | null;
}
export interface TableFixture<Row extends object> {
  name: string;
  columns: string[];
  getAllRows: Mock<() => Row[]>;
  getByPK: Mock<(id: unknown) => Row | null>;
  insertRow: Mock<(data: Row) => Row>;
  insertRows: Mock<(rows: Row[]) => Row[]>;
  updateRowById: Mock<(id: unknown, data: Partial<Row>) => Row | null>;
  patchRow: Mock<(id: unknown, data: Partial<Row>) => Row | null>;
  deleteRowById: Mock<(id: unknown) => boolean>;
  _testData: Row[];
}
export interface DatabaseFixture<Row extends object, TableName extends string> {
  tables: Record<TableName, TableFixture<Row>>;
  select: Mock<(columns: string[]) => QueryFixture<Row>>;
  save: Mock<() => boolean>;
  _cache: RepositoryCache;
  _logger: DomainLogger;
  _utils: { sleep(ms: number): unknown; getUuid(): string; parseDate(value: unknown): Date | null };
}
