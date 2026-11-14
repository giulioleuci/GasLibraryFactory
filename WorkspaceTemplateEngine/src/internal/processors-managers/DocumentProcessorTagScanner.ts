import type { DocumentProcessor } from '../../processors/DocumentProcessor.js';
import type {
  ScannedTable,
  TextMatch,
  ColumnLoop,
  RowLoop,
  DeleteRow,
  ListLoop,
  ListLoopChild,
  ListLoopSurround,
  StyledSegment,
  TextRun,
  ConditionalDelete,
  TextSubstitution,
  TableInsert,
  ConditionalNode,
  ParsedFilter,
  ParsedArgument
} from '../../types.js';
/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorTagScanner.js
 * @description Manager for scanning and analyzing document structure for template tags.
 */

import { MustacheContext as _MustacheContext } from '../../facades/Mustache.js';

interface ListBlockNode {
  tagName: string;
  listType: string;
  expr: string;
  start: number;
  bodyStart: number;
  bodyEnd: number;
  end: number;
  children: ListBlockNode[];
}

const ROW_LOOP_MARKER = /^{{#(tablerow_loop):([^}]+)}}/;

export class DocumentProcessorTagScanner {
  declare facade: Pick<
    DocumentProcessor,
    | 'logger'
    | 'mustache'
    | 'MAX_ITERATIONS'
    | 'MAX_TEMPLATE_MATCH_SIZE'
    | '_parseExpression'
    | '_applyFilters'
    | '_parseFilterArgs'
    | '_parseArgValue'
  >;

  constructor(facade: DocumentProcessorTagScanner['facade']) {
    this.facade = facade;
  }

  _analyzeColumnLoops(table: ScannedTable, context: object | null): ColumnLoop[] {
    const operations: ColumnLoop[] = [];
    if (table.rows.length < 1) {
      return operations;
    }
    const headerRow = table.rows[0];
    const numCells = headerRow.cells.length;

    for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
      const cell = headerRow.cells[cellIndex];
      const cellText = cell.text;
      const match = cellText.match(/^{{#tablecol_loop:([^}]+)}}(.*)/s);

      if (match) {
        const [fullMatchText, fullExpression, templateContent] = match;
        const { path, filters } = this.facade._parseExpression(fullExpression.trim());
        const dummyToken: [string, string] = ['name', path];
        const mustacheContext = new _MustacheContext(context);
        let dataArray = this.facade.mustache._lookupValue!(dummyToken, mustacheContext);

        if (!Array.isArray(dataArray)) {
          this.facade.logger.warn(
            `Expression '${fullExpression.trim()}' (path: '${path}') for column ${cellIndex} is not valid. Column will be ignored.`
          );
          continue;
        }

        dataArray = this.facade._applyFilters(dataArray as unknown[], filters);
        // cell.runs is captured relative to the RAW cell text (including the
        // `{{#tablecol_loop:...}}` marker prefix), but templateContent above
        // is already marker-stripped — rebase runs onto templateContent's
        // own offsets before storing, so downstream consumers
        // (_buildStyledSegments/_styleAt in DocumentProcessorInjector) compare
        // like-for-like. Any further offset introduced by `.trim()`-ing
        // templateContent down to the final template is rebased separately,
        // at the point that template is finalized (see
        // _executeColumnLoopOperation).
        const markerPrefixLength = fullMatchText.length - templateContent.length;
        const rawSourceRuns = cell.runs || [];
        const sourceRuns =
          markerPrefixLength > 0
            ? rawSourceRuns
                .filter((r) => r.end > markerPrefixLength)
                .map((r) => ({
                  text: r.text,
                  start: Math.max(r.start, markerPrefixLength) - markerPrefixLength,
                  end: r.end - markerPrefixLength,
                  style: r.style
                }))
            : rawSourceRuns;

        operations.push({
          type: 'columnLoop',
          index: cell.index!,
          tableIndex: table.index!,
          cellIndex: cellIndex,
          dataArray: dataArray as unknown[],
          templateContent: templateContent,
          sourceRuns: sourceRuns
        });
      }
    }
    return operations;
  }

  _analyzeRowLoops(table: ScannedTable, context: object | null): (RowLoop | DeleteRow)[] {
    const operations: (RowLoop | DeleteRow)[] = [];
    const numRows = table.rows.length;

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const row = table.rows[rowIndex];
      if (row.cells.length === 0) {
        continue;
      }
      // The marker may open any cell of the row; the whole row is the repeated template.
      const markerCell = row.cells.findIndex((c) => ROW_LOOP_MARKER.test(c.text || ''));
      const match = markerCell >= 0 ? row.cells[markerCell].text.match(ROW_LOOP_MARKER) : null;

      if (match) {
        const fullExpression = match[2].trim();
        const { path, filters } = this.facade._parseExpression(fullExpression);
        const dummyToken: [string, string] = ['name', path];
        let dataArray = this.facade.mustache._lookupValue!(
          dummyToken,
          new _MustacheContext(context)
        );

        if (!Array.isArray(dataArray)) {
          this.facade.logger.warn(
            `Expression '${fullExpression}' (path: '${path}') did not return a valid array. Template row will be removed.`
          );
          operations.push({
            type: 'deleteRow',
            index: row.index!,
            tableIndex: table.index!,
            rowIndex: rowIndex
          });
          continue;
        }

        dataArray = this.facade._applyFilters(dataArray as unknown[], filters);
        if ((dataArray as unknown[]).length > this.facade.MAX_ITERATIONS) {
          throw new Error(
            `Row expansion count (${(dataArray as unknown[]).length}) exceeds maximum allowed (${this.facade.MAX_ITERATIONS})`
          );
        }

        operations.push({
          type: 'rowLoop',
          index: row.index!,
          tableIndex: table.index!,
          rowIndex: rowIndex,
          dataArray: dataArray as unknown[],
          controlText: match[0],
          markerCell: markerCell,
          sourceRuns: row.cells.map((c) => c.runs || [])
        });
      }
    }
    return operations;
  }

  _analyzeListLoops(textMatches: TextMatch[], context: object | null): ListLoop[] {
    const operations: ListLoop[] = [];
    const searchPattern = /{{#(?:bullet|number)_list:/;
    const seenIndices = new Set();

    for (const textMatch of textMatches) {
      const fullText = textMatch.text;
      if (!searchPattern.test(fullText)) {
        continue;
      }
      if (seenIndices.has(textMatch.elementIndex)) {
        continue;
      }
      seenIndices.add(textMatch.elementIndex);

      if (fullText.length > this.facade.MAX_TEMPLATE_MATCH_SIZE) {
        throw new Error(
          `Template text size (${fullText.length}) exceeds maximum allowed (${this.facade.MAX_TEMPLATE_MATCH_SIZE})`
        );
      }

      const node = this._parseListBlock(fullText, fullText.search(searchPattern));
      if (!node) {
        continue;
      }
      const rootContext = new _MustacheContext(context);
      const dataArray = this._resolveListData(node.expr, rootContext);
      if (!dataArray) {
        continue;
      }
      const runs = textMatch.runs || [];
      const { itemTemplate, sourceRuns } = this._listItemTemplate(fullText, node, runs);
      const fullMatch = fullText.slice(node.start, node.end);
      const hasSurroundingText =
        fullText.slice(0, node.start).trim() !== '' || fullText.slice(node.end).trim() !== '';
      operations.push({
        type: 'listLoop',
        index: textMatch.elementIndex!,
        paragraphIndex: textMatch.elementIndex!,
        listType: node.listType,
        dataArray,
        itemTemplate,
        fullMatch,
        sourceRuns,
        ...(node.children.length > 0 && {
          children: this._buildListChildren(node, dataArray, fullText, runs, rootContext)
        }),
        ...(hasSurroundingText && {
          surround: this._renderListSurround(fullText, node.start, fullMatch.length, context, runs)
        })
      });
    }
    return operations;
  }

  /**
   * @description Parses the `{{#bullet_list:expr}}...{{/bullet_list}}` /
   * `{{#number_list:expr}}...{{/number_list}}` block opening at `start`,
   * matching each closing tag to its own opener (depth-aware, so a list of the
   * same type can nest).
   * @param {string} text Raw paragraph text.
   * @param {number} start Offset of the outermost opening tag.
   * @returns {Object|null} Block tree, or null when the block is never closed.
   * @private
   */
  _parseListBlock(text: string, start: number): ListBlockNode | null {
    const tag = /{{#((?:bullet|number)_list):([^}]+)}}|{{\/((?:bullet|number)_list)}}/g;
    tag.lastIndex = start;
    const stack: ListBlockNode[] = [];
    for (let m = tag.exec(text); m; m = tag.exec(text)) {
      if (m[1]) {
        const node: ListBlockNode = {
          tagName: m[1],
          listType: m[1].startsWith('bullet') ? 'bullet' : 'number',
          expr: m[2].trim(),
          start: m.index,
          bodyStart: m.index + m[0].length,
          bodyEnd: 0,
          end: 0,
          children: []
        };
        stack[stack.length - 1]?.children.push(node);
        stack.push(node);
      } else if (stack.length > 0 && stack[stack.length - 1].tagName === m[3]) {
        const node = stack.pop()!;
        node.bodyEnd = m.index;
        node.end = m.index + m[0].length;
        if (stack.length === 0) {
          return node;
        }
      }
    }
    return null;
  }

  /**
   * @description Resolves a list data source against `context` (applying pipe
   * filters) and enforces MAX_ITERATIONS.
   * @returns {Array|null} The array, or null when the path is not an array.
   * @private
   */
  _resolveListData(expr: string, context: _MustacheContext): unknown[] | null {
    const { path, filters } = this.facade._parseExpression(expr);
    const value = this.facade.mustache._lookupValue!(['name', path], context);
    if (!Array.isArray(value)) {
      return null;
    }
    const filtered = this.facade._applyFilters(value as unknown[], filters) as unknown[];
    if (filtered.length > this.facade.MAX_ITERATIONS) {
      throw new Error(
        `List expansion count (${filtered.length}) exceeds maximum allowed (${this.facade.MAX_ITERATIONS})`
      );
    }
    return filtered;
  }

  /**
   * @description Item template of one list block: its body with any nested list
   * blocks cut out, trimmed. `runs` (captured relative to the RAW paragraph text)
   * are rebased onto the template's own offsets so downstream style lookups
   * (_buildStyledSegments/_styleAt) compare like-for-like.
   * @private
   */
  _listItemTemplate(text: string, node: ListBlockNode, runs: TextRun[]) {
    const pieces: Array<[number, number]> = [];
    let pos = node.bodyStart;
    for (const child of node.children) {
      pieces.push([pos, child.start]);
      pos = child.end;
    }
    pieces.push([pos, node.bodyEnd]);
    const raw = pieces.map(([a, b]) => text.slice(a, b)).join('');
    const lead = raw.length - raw.trimStart().length;
    const itemTemplate = raw.trim();
    const sourceRuns: TextRun[] = [];
    let out = 0;
    for (const [a, b] of pieces) {
      for (const r of runs) {
        if (r.end > a && r.start < b) {
          const start = Math.max(Math.max(r.start, a) - a + out - lead, 0);
          const end = Math.min(Math.min(r.end, b) - a + out - lead, itemTemplate.length);
          if (end > start) {
            sourceRuns.push({ text: r.text, start, end, style: r.style });
          }
        }
      }
      out += b - a;
    }
    return { itemTemplate, sourceRuns };
  }

  /**
   * @description For every item of `dataArray`, resolves the lists nested inside
   * `node` against that item (falling back to the outer contexts). A nested list
   * whose data is missing or not an array yields no entry — that item simply
   * has no sub-list.
   * @returns {Array<Array<Object>>} One array of sub-lists per item, aligned with `dataArray`.
   * @private
   */
  _buildListChildren(
    node: ListBlockNode,
    dataArray: unknown[],
    text: string,
    runs: TextRun[],
    context: _MustacheContext
  ): ListLoopChild[][] {
    return dataArray.map((item) => {
      const itemContext = new _MustacheContext(item, context);
      const lists: ListLoopChild[] = [];
      for (const child of node.children) {
        const data = this._resolveListData(child.expr, itemContext);
        if (!data) {
          continue;
        }
        const { itemTemplate, sourceRuns } = this._listItemTemplate(text, child, runs);
        lists.push({
          listType: child.listType,
          dataArray: data,
          itemTemplate,
          sourceRuns,
          ...(child.children.length > 0 && {
            children: this._buildListChildren(child, data, text, runs, itemContext)
          })
        });
      }
      return lists;
    });
  }

  /**
   * @description Renders a paragraph that holds text besides its
   * `{{#bullet_list:...}}...{{/bullet_list}}` block. The block is swapped for a
   * same-length run of U+E000 (so captured run offsets stay valid) and the whole
   * paragraph is rendered once: that evaluates any enclosing inline
   * `{{#x}}...{{/x}}` / `{{^x}}...{{/x}}` section, then the rendered text is
   * split at the surviving run into the part before and after the list. If no
   * run survives, an enclosing section discarded the list (`hasList: false`) and
   * `before` is the whole rendered paragraph.
   * @param {string} fullText Raw paragraph text.
   * @param {number} start Offset of the list block in `fullText`.
   * @param {number} length Length of the list block.
   * @param {Object|null} context Data context.
   * @param {Array<Object>} runs Captured paragraph runs (raw-text offsets).
   * @returns {{before: Array<Object>, after: Array<Object>, hasList: boolean}}
   * @private
   */
  _renderListSurround(
    fullText: string,
    start: number,
    length: number,
    context: object | null,
    runs: TextRun[]
  ): ListLoopSurround {
    const MARK = '';
    const template =
      fullText.slice(0, start) + MARK.repeat(length) + fullText.slice(start + length);
    const styleAt = (offset: number) =>
      runs.find((r) => offset >= r.start && offset < r.end)?.style;
    const clean = (s: string) => s.split('￼').join('');
    const before: StyledSegment[] = [];
    const after: StyledSegment[] = [];
    let hasList = false;

    for (const seg of this.facade.mustache.renderSegments!(template, context)) {
      const rendered = clean(seg.rendered != null ? String(seg.rendered) : '');
      const markAt = hasList ? -1 : rendered.indexOf(MARK);
      if (markAt === -1) {
        (hasList ? after : before).push({
          rendered: rendered.split(MARK).join(''),
          style: styleAt(seg.rawStart) || {}
        });
        continue;
      }
      hasList = true;
      let markEnd = markAt;
      while (rendered[markEnd] === MARK) {
        markEnd++;
      }
      before.push({ rendered: rendered.slice(0, markAt), style: styleAt(seg.rawStart) || {} });
      after.push({
        rendered: rendered.slice(markEnd).split(MARK).join(''),
        style: styleAt(seg.rawStart + markEnd) || {}
      });
    }
    return { before, after, hasList };
  }

  /**
   * @description Scans paragraph-level text matches for the generic
   * `{{#expr}}...{{/expr}}` / `{{^expr}}...{{/expr}}` conditional-section
   * directive and builds a nesting-aware tree of matched open/close marker
   * pairs (a paragraph whose entire, whitespace-trimmed text is exactly an
   * opening marker is paired with the next matching `{{/expr}}` closing
   * marker at the SAME nesting depth; any pair fully between them becomes a
   * child of that pair, not a sibling). Reserved directive names
   * (`tablerow_loop:`/`tablecol_loop:`/`bullet_list:`/`number_list:`) are
   * left untouched here — they are handled by their own dedicated
   * `_analyze*` methods.
   * @param {Array<Object>} textMatches Scanned text runs (`scanDocumentStructure().textMatches`).
   * @param {Object} context Data context.
   * @returns {Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'}>}
   *   One `deleteContentRange`-shaped op per removed span, in document order,
   *   produced by resolving the tree top-down via `_resolveConditionalSectionNode`
   *   (see there for the false-vs-true/overlap-avoidance rules).
   */
  _analyzeConditionalSections(
    textMatches: TextMatch[],
    context: object | null
  ): ConditionalDelete[] {
    const RESERVED_PREFIXES = ['tablerow_loop:', 'tablecol_loop:', 'bullet_list:', 'number_list:'];
    const openRe = /^{{([#^])([^}]+)}}\s*$/;
    const closeRe = /^{{\/([^}]+)}}\s*$/;
    const stack: ConditionalNode[] = [];
    const roots: ConditionalNode[] = [];

    for (const textMatch of textMatches) {
      if (textMatch.type !== 'TEXT' && textMatch.type !== 'TABLE_TEXT') {
        continue;
      }
      const text = textMatch.text || '';

      const openMatch = text.match(openRe);
      if (openMatch) {
        const expr = openMatch[2].trim();
        if (RESERVED_PREFIXES.some((prefix) => expr.startsWith(prefix))) {
          continue;
        }
        stack.push({
          symbol: openMatch[1],
          expr,
          openIndex: textMatch.elementIndex!,
          openLength: text.length,
          children: []
        });
        continue;
      }

      const closeMatch = text.match(closeRe);
      if (!closeMatch || stack.length === 0) {
        continue;
      }
      const closeExpr = closeMatch[1].trim();
      const top = stack[stack.length - 1];
      if (closeExpr !== top.expr) {
        continue;
      }
      stack.pop();
      top.closeIndex = textMatch.elementIndex;
      top.closeLength = text.length;

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(top);
      } else {
        roots.push(top);
      }
    }

    const operations: ConditionalDelete[] = [];
    for (const root of roots) {
      operations.push(...this._resolveConditionalSectionNode(root, context));
    }
    return operations;
  }

  /**
   * @description Resolves one matched `{{#expr}}`/`{{^expr}}` node (and,
   * recursively, its nested children) against `context` with standard
   * Mustache truthiness (falsy/`null`/empty array => section false), exactly
   * like `_renderSection`/`_renderInverted` in the Mustache facade.
   *
   * The false/discarded branch NEVER recurses into `node.children`: the one
   * `kind: 'section'` op it emits already spans
   * `[node.openIndex, node.closeIndex! + node.closeLength!)`, which fully
   * contains any nested conditional's own range — recursing would emit a
   * second, overlapping `deleteContentRange` request for a sub-span already
   * covered by this one, breaking the "Reverse-Order Strategy"'s
   * non-overlapping-ranges invariant (deleting the inner, higher-index range
   * first would shift/invalidate the outer op's stale `endIndex`). The
   * true/kept branch only removes its own two marker paragraphs
   * (`kind: 'marker'`, each a single disjoint paragraph span that can never
   * overlap a nested op), so it's safe — and necessary, since the reserved-4
   * directives gate in `DocumentProcessor.process()` only skip content inside
   * a `kind: 'section'` range — to resolve nested children independently.
   * @param {{symbol: '#'|'^', expr: string, openIndex: number, openLength: number, closeIndex: number, closeLength: number, children: Array<Object>}} node
   * @param {Object} context Data context.
   * @returns {Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'}>}
   * @private
   */
  _resolveConditionalSectionNode(
    node: ConditionalNode,
    context: object | null
  ): ConditionalDelete[] {
    const dummyToken: [string, string] = ['name', node.expr];
    const value = this.facade.mustache._lookupValue!(dummyToken, new _MustacheContext(context));
    const isTruthy = Boolean(value) && !(Array.isArray(value) && value.length === 0);
    const showContent = node.symbol === '#' ? isTruthy : !isTruthy;

    if (!showContent) {
      return [
        {
          type: 'conditionalDelete',
          index: node.openIndex,
          length: node.closeIndex! + node.closeLength! - node.openIndex,
          kind: 'section'
        }
      ];
    }

    const operations: ConditionalDelete[] = [
      { type: 'conditionalDelete', index: node.openIndex, length: node.openLength, kind: 'marker' },
      {
        type: 'conditionalDelete',
        index: node.closeIndex!,
        length: node.closeLength!,
        kind: 'marker'
      }
    ];
    for (const child of node.children) {
      operations.push(...this._resolveConditionalSectionNode(child, context));
    }
    return operations;
  }

  _analyzeTextSubstitutions(textMatches: TextMatch[], context: object | null): TextSubstitution[] {
    const operations: TextSubstitution[] = [];
    const seenIndices = new Set();

    for (const textMatch of textMatches) {
      if (textMatch.type !== 'TEXT' && textMatch.type !== 'TABLE_TEXT') {
        continue;
      }
      if (seenIndices.has(textMatch.elementIndex)) {
        continue;
      }
      seenIndices.add(textMatch.elementIndex);

      const originalText = textMatch.text;
      const directive = [
        '{{#tablerow_loop:',
        '{{#tablecol_loop:',
        '{{#bullet_list:',
        '{{#number_list:',
        '{{table['
      ].find((d) => originalText.includes(d));
      if (directive) {
        // Structural directive no loop/list/table pass expanded: it is left verbatim in the output.
        const escaped = originalText.replace(
          /[^\x20-\x7e]/g,
          (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
        );
        this.facade.logger.warn(
          `Unexpanded '${directive}' directive left verbatim (${textMatch.type} @${textMatch.elementIndex}, tableIndex=${textMatch.tableIndex}): "${escaped}"`
        );
      } else {
        if (originalText.includes('{{')) {
          const newText = this.facade.mustache.render(originalText, context);
          if (originalText !== newText) {
            const segments = this.facade.mustache.renderSegments!(originalText, context);
            operations.push({
              type: 'textSubstitution',
              index: textMatch.elementIndex!,
              originalText: originalText,
              newText: newText === '' ? '\u200B' : newText,
              segments: segments,
              sourceRuns: textMatch.runs || []
            });
          }
        }
      }
    }
    return operations;
  }

  /**
   * @description Scans text runs for `{{table[source=<contextPath>, headerRow=<bool>]}}`
   * directives (ref REPORT_GLF.md B7) — the Docs-side analogue of the Sheets
   * `{{dynamic_columns[...]}}` directive: expands a data-driven table in place
   * at the marker's position. `source` must resolve to a non-empty 2D array
   * (`Array<Array<*>>`) already shaped as table rows/cells — unlike
   * `dynamic_columns`, which resolves a flat array item-by-item, a Docs table
   * has no per-cell Mustache expression of its own; the caller pre-shapes the
   * grid (e.g. via a Sheet read) before placing it on the context.
   * @param {Array<Object>} textMatches Scanned text runs (`scanDocumentStructure().textMatches`).
   * @param {Object} context Data context.
   * @returns {Array<{type: 'tableInsert', placeholder: string, data: Array<Array<*>>, options: Object}>} Resolved table-insert operations, in encounter order.
   */
  _analyzeTableInsertions(textMatches: TextMatch[], context: object | null): TableInsert[] {
    const operations: TableInsert[] = [];
    const seenIndices = new Set();
    const placeholderPattern = /{{table\[(.*?)\]}}/g;

    for (const textMatch of textMatches) {
      if (textMatch.type !== 'TEXT' && textMatch.type !== 'TABLE_TEXT') {
        continue;
      }
      const fullText = textMatch.text;
      if (!fullText.includes('{{table[')) {
        continue;
      }
      if (seenIndices.has(textMatch.elementIndex)) {
        continue;
      }
      seenIndices.add(textMatch.elementIndex);

      placeholderPattern.lastIndex = 0;
      let match;
      while ((match = placeholderPattern.exec(fullText)) !== null) {
        const placeholder = match[0];
        const params = this._parseTableParams(match[1]);

        if (!params.source) {
          this.facade.logger.warn(`Missing 'source' parameter in table directive: ${placeholder}`);
          continue;
        }

        const data = this.facade.mustache.getValue!(params.source, context);
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
          this.facade.logger.warn(
            `Data source '${params.source}' for table directive is not a non-empty 2D array.`
          );
          continue;
        }

        operations.push({
          type: 'tableInsert',
          placeholder,
          data,
          options: { headerRow: params.headerRow !== 'false' }
        });
      }
    }
    return operations;
  }

  /**
   * @description Parses the flat `key=value,key=value` param body of a
   * `{{table[...]}}` directive into a plain object.
   * @param {string} paramsStr Raw content between the placeholder's brackets.
   * @returns {Object<string,string>} Parsed key/value map (values are trimmed strings).
   * @private
   */
  _parseTableParams(paramsStr: string): Record<string, string> {
    const params: Record<string, string> = {};
    paramsStr.split(',').forEach((p) => {
      const parts = p.split('=');
      if (parts.length === 2) {
        params[parts[0].trim()] = parts[1].trim();
      }
    });
    return params;
  }

  _parseExpression(expression: string | null | undefined): {
    path: string;
    filters: ParsedFilter[];
  } {
    if (!expression || typeof expression !== 'string') {
      return { path: '', filters: [] };
    }
    const parts = expression.split('|').map((p) => p.trim());
    const path = parts[0];
    const filters: ParsedFilter[] = [];
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

  _parseFilterArgs(argsString: string): ParsedArgument[] {
    if (!argsString) {
      return [];
    }
    const args: ParsedArgument[] = [];
    let currentArg = '',
      inQuotes = false,
      quoteChar: string | null = null;
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = null;
      } else if (char === ',' && !inQuotes) {
        if (currentArg.trim()) {
          args.push(this.facade._parseArgValue(currentArg.trim()));
        }
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    if (currentArg.trim()) {
      args.push(this.facade._parseArgValue(currentArg.trim()));
    }
    return args;
  }

  _parseArgValue(value: string): ParsedArgument {
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.substring(1, value.length - 1);
    }
    if (!(isNaN as (value: unknown) => boolean)(value) && value !== '') {
      return parseFloat(value);
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  }
}
