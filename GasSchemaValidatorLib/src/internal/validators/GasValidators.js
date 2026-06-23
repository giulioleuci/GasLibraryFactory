import { z } from 'zod';

export class GasValidators {
  /** Validates "A1", "A1:B10", "Sheet1!A1:B10", "'Sheet Name'!A1:B" */
  static a1Notation() {
    return z.string().regex(
      /^('?[^']+?'?!)?(\$?[A-Z]{1,3}\$?\d*)(\:\$?[A-Z]{1,3}\$?\d*)?$/,
      'Invalid A1 notation'
    );
  }

  /** Validates 30-60 char alphanumeric Google Spreadsheet IDs */
  static spreadsheetId() {
    return z.string().regex(/^[a-zA-Z0-9_-]{30,60}$/, 'Invalid Spreadsheet ID');
  }

  /** Validates "#FFF" or "#FFFFFF" */
  static hexColor() {
    return z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid HEX color');
  }

  /** Parses JSON string, optionally validates against inner schema */
  static jsonString(innerSchema = z.any()) {
    return z.string().transform((str) => JSON.parse(str)).pipe(innerSchema);
  }
}
