// Compile-only probe for the native and Advanced Service declarations.
export function googleTypes(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  file: GoogleAppsScript.Drive.File,
  request: GoogleAppsScript.Sheets.Schema.Request
) {
  // @ts-expect-error A Drive file must be a native object, not its ID.
  const invalidFile: GoogleAppsScript.Drive.File = 'file-id';
  return { spreadsheet, file, request, invalidFile };
}
