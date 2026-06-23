/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorTagScanner.js
 * @description Manager for scanning and analyzing document structure for template tags.
 */

import { MustacheContext as _MustacheContext } from '../../facades/Mustache.js';

export class DocumentProcessorTagScanner {
  constructor(facade) {
    this.facade = facade;
  }

  _analyzeColumnLoops(table, context) {
    const operations = [];
    if (table.rows.length < 1) return operations;
    const headerRow = table.rows[0];
    const numCells = headerRow.cells.length;

    for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
      const cell = headerRow.cells[cellIndex];
      const cellText = cell.text;
      const match = cellText.match(/^{{#tablecol_loop:([^}]+)}}(.*)/s);

      if (match) {
        const [, fullExpression, templateContent] = match;
        const { path, filters } = this.facade._parseExpression(fullExpression.trim());
        const dummyToken = ['name', path];
        const mustacheContext = new _MustacheContext(context);
        let dataArray = this.facade.mustache._lookupValue(dummyToken, mustacheContext);

        if (!Array.isArray(dataArray)) {
          this.facade.logger.warn(`Expression '${fullExpression.trim()}' (path: '${path}') for column ${cellIndex} is not valid. Column will be ignored.`);
          continue;
        }

        dataArray = this.facade._applyFilters(dataArray, filters);
        operations.push({
          type: 'columnLoop',
          index: cell.index,
          tableIndex: table.index,
          cellIndex: cellIndex,
          dataArray: dataArray,
          templateContent: templateContent
        });
      }
    }
    return operations;
  }

  _analyzeRowLoops(table, context) {
    const operations = [];
    const numRows = table.rows.length;

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const row = table.rows[rowIndex];
      if (row.cells.length === 0) continue;
      const firstCell = row.cells[0];
      const cellText = firstCell.text;
      const match = cellText.match(/^{{#(tablerow_loop):([^}]+)}}/);

      if (match) {
        const fullExpression = match[2].trim();
        const { path, filters } = this.facade._parseExpression(fullExpression);
        const dummyToken = ['name', path];
        let dataArray = this.facade.mustache._lookupValue(dummyToken, new _MustacheContext(context));

        if (!Array.isArray(dataArray)) {
          this.facade.logger.warn(`Expression '${fullExpression}' (path: '${path}') did not return a valid array. Template row will be removed.`);
          operations.push({ type: 'deleteRow', index: row.index, tableIndex: table.index, rowIndex: rowIndex });
          continue;
        }

        dataArray = this.facade._applyFilters(dataArray, filters);
        if (dataArray.length > this.facade.MAX_ITERATIONS) {
          throw new Error(`Row expansion count (${dataArray.length}) exceeds maximum allowed (${this.facade.MAX_ITERATIONS})`);
        }

        operations.push({
          type: 'rowLoop',
          index: row.index,
          tableIndex: table.index,
          rowIndex: rowIndex,
          dataArray: dataArray,
          controlText: match[0]
        });
      }
    }
    return operations;
  }

  _analyzeListLoops(textMatches, context) {
    const operations = [];
    const regexParser = /{{#((?:bullet|number)_list):([^}]+)}}([^]*?){{\/\1}}/gs;
    const searchPattern = /{{#(?:bullet|number)_list:/;
    const seenIndices = new Set();

    for (const textMatch of textMatches) {
      const fullText = textMatch.text;
      if (!searchPattern.test(fullText)) continue;
      if (seenIndices.has(textMatch.elementIndex)) continue;
      seenIndices.add(textMatch.elementIndex);

      if (fullText.length > this.facade.MAX_TEMPLATE_MATCH_SIZE) {
        throw new Error(`Template text size (${fullText.length}) exceeds maximum allowed (${this.facade.MAX_TEMPLATE_MATCH_SIZE})`);
      }

      regexParser.lastIndex = 0;
      const match = regexParser.exec(fullText);
      if (match) {
        const [fullMatch, command, dataSource, itemTemplate] = match;
        const listType = command.startsWith('bullet') ? 'bullet' : 'number';
        const dataArray = this.facade.mustache.getValue(dataSource, context);
        if (Array.isArray(dataArray)) {
          operations.push({
            type: 'listLoop',
            index: textMatch.elementIndex,
            paragraphIndex: textMatch.elementIndex,
            listType: listType,
            dataArray: dataArray,
            itemTemplate: itemTemplate.trim(),
            fullMatch: fullMatch
          });
        }
      }
    }
    return operations;
  }

  _analyzeTextSubstitutions(textMatches, context) {
    const operations = [];
    const seenIndices = new Set();

    for (const textMatch of textMatches) {
      if (textMatch.type !== 'TEXT' && textMatch.type !== 'TABLE_TEXT') continue;
      if (seenIndices.has(textMatch.elementIndex)) continue;
      seenIndices.add(textMatch.elementIndex);

      const originalText = textMatch.text;
      if (!originalText.includes('{{#tablerow_loop:') && !originalText.includes('{{#tablecol_loop:') && 
          !originalText.includes('{{#bullet_list:') && !originalText.includes('{{#number_list:')) {
        if (originalText.includes('{{')) {
          const newText = this.facade.mustache.render(originalText, context);
          if (originalText !== newText) {
            operations.push({
              type: 'textSubstitution',
              index: textMatch.elementIndex,
              originalText: originalText,
              newText: newText === '' ? '\u200B' : newText
            });
          }
        }
      }
    }
    return operations;
  }

  _parseExpression(expression) {
    if (!expression || typeof expression !== 'string') return { path: '', filters: [] };
    const parts = expression.split('|').map((p) => p.trim());
    const path = parts[0];
    const filters = [];
    for (let i = 1; i < parts.length; i++) {
      const filterPart = parts[i];
      const colonIndex = filterPart.indexOf(':');
      if (colonIndex === -1) {
        filters.push({ name: filterPart, args: [] });
      } else {
        const filterName = filterPart.substring(0, colonIndex).trim();
        const argsString = filterPart.substring(colonIndex + 1).trim();
        const args = this.facade._parseFilterArgs(argsString);
        filters.push({ name: filterName, args });
      }
    }
    return { path, filters };
  }

  _parseFilterArgs(argsString) {
    if (!argsString) return [];
    const args = [];
    let currentArg = '', inQuotes = false, quoteChar = null;
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = null;
      } else if (char === ',' && !inQuotes) {
        if (currentArg.trim()) args.push(this.facade._parseArgValue(currentArg.trim()));
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    if (currentArg.trim()) args.push(this.facade._parseArgValue(currentArg.trim()));
    return args;
  }

  _parseArgValue(value) {
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.substring(1, value.length - 1);
    }
    if (!isNaN(value) && value !== '') return parseFloat(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
}
