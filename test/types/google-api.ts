import type { DriveService, UtilitiesService } from '@GoogleApiWrapper';
import { initializeServices } from '../../src/index.js';
import { ServiceFactory } from '@GoogleApiWrapper';

export function googleApiContracts(
  drive: DriveService,
  file: GoogleAppsScript.Drive.File,
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  range: GoogleAppsScript.Spreadsheet.Range,
  document: GoogleAppsScript.Document.Document,
  cache: GoogleAppsScript.Cache.Cache,
  properties: GoogleAppsScript.Properties.Properties,
  lock: GoogleAppsScript.Lock.Lock,
  trigger: GoogleAppsScript.Script.Trigger,
  request: GoogleAppsScript.Sheets.Schema.Request,
  documentRequest: GoogleAppsScript.Docs.Schema.Request
) {
  const app: GoogleAppsScript.Drive.DriveApp = drive.getStandardApp();
  // @ts-expect-error Native Drive file IDs are strings.
  drive.getStandardApp().getFileById(123);
  const services = initializeServices();
  const utils: UtilitiesService = services.utils;
  // @ts-expect-error Factory log levels are string identifiers.
  ServiceFactory.configure({ logLevel: 123 });
  const callbackValue: number = drive._executeWithRetry(({ value }) => value, { value: 123 });
  services.spreadsheetService.getRanges('sheet-id', ['Sheet1!A1'], {
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER'
  });
  // @ts-expect-error Native value rendering options are string identifiers.
  services.spreadsheetService.getRanges('sheet-id', 'Sheet1!A1', { valueRenderOption: 123 });
  return {
    app,
    file,
    spreadsheet,
    range,
    document,
    cache,
    properties,
    lock,
    trigger,
    request,
    documentRequest,
    utils,
    callbackValue
  };
}
