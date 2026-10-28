import type { Mock } from 'jest-mock';

export type HarnessLogger = {
  [K in 'debug' | 'info' | 'warn' | 'error' | 'log']: Mock<(...args: unknown[]) => unknown>;
} & {
  getLogs?: Mock<() => { level: string; message: unknown }[]>;
  clearLogs?: Mock<() => void>;
};
export interface HarnessUtilities {
  sleep(milliseconds?: unknown): unknown;
  getUuid(): string;
  computeDigest(algorithm: string, value: unknown, charset?: string): number[];
  newBlob?(data: unknown, contentType?: string, name?: string): object;
  formatDate?(date: Date, timezone?: string, format?: string): string;
  base64Encode?(data: string): string;
  base64Decode?(encoded: string): string;
  base64EncodeWebSafe?(data: string): string;
  jsonParse?(jsonString: string): unknown;
  jsonStringify?(value: unknown): string | undefined;
  parseCsv?(csv: string, delimiter?: string): string[][];
  DigestAlgorithm: {
    MD5: string;
    SHA_1: string;
    SHA_256: string;
    SHA_384: string;
    SHA_512: string;
  };
  Charset: { US_ASCII: string; UTF_8: string };
}
export interface HarnessResource {
  title?: string;
  name?: string;
  mimeType?: string;
  role?: string;
  type?: string;
  properties?: object;
  values?: unknown[][];
  ranges?: string[];
  addLabelIds?: string[];
  message?: object;
}
export interface HarnessRequestOptions {
  contentType?: string;
  ranges?: string[];
}
export interface HarnessTestUtils {
  generateId(): string;
  generateEntity(overrides?: Record<string, unknown>): Record<string, unknown>;
  generateEntities(count: number, generator?: ((index: number) => unknown) | null): unknown[];
  waitFor(
    condition: () => unknown | Promise<unknown>,
    timeout?: number,
    interval?: number
  ): Promise<boolean>;
}
export interface HarnessGlobals {
  Utilities: HarnessUtilities;
  LockService: object;
  Session: object;
  Logger: object;
  CacheService: object;
  PropertiesService: object;
  ScriptApp: object;
  DriveApp: object;
  Drive: object;
  Sheets: object;
  Gmail: object;
  SpreadsheetApp: object;
  DocumentApp: object;
  GmailApp: object;
  ContentService: object;
  HtmlService: object;
  UrlFetchApp: object;
  CalendarApp: object;
  resetGasMocks(): void;
  mockLoggerService(): HarnessLogger;
  mockCacheService(): object;
  mockSpreadsheetService(): object;
  mockPropertiesService(): object;
  mockDriveService(): object;
  testUtils: HarnessTestUtils;
}
