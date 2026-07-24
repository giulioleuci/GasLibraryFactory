// ===================================================================
// FILE: GoogleApiWrapper/src/internal/services-managers/__tests__/DocumentTableManager.test.js
// ===================================================================
// Coverage: insertTableAtMarker() positional table insertion, plus a
// regression-safety check that _createTableWithStandardAPI (append-at-end)
// keeps working unchanged after the styling logic was extracted into a
// shared helper.
// ===================================================================

import { DocumentTableManager } from '../DocumentTableManager';

describe('DocumentTableManager', () => {
  let manager;
  let facade;
  let logger;

  /**
   * Builds a fake table object compatible with the subset of the native
   * DocumentApp `Table` API that `_applyTableStyling` touches
   * (getRow/getNumRows -> Row.getNumCells/getCell -> Cell.editAsText/setBackgroundColor/setWidth).
   */
  function makeFakeTable(data) {
    const rows = data.map((rowValues) => {
      const cells = rowValues.map(() => {
        const cell = {
          bold: false,
          backgroundColor: null,
          width: null,
          editAsText: jest.fn(() => ({
            setBold: jest.fn((value) => {
              cell.bold = value;
            })
          })),
          setBackgroundColor: jest.fn((color) => {
            cell.backgroundColor = color;
          }),
          setWidth: jest.fn((width) => {
            cell.width = width;
          })
        };
        return cell;
      });

      return {
        getNumCells: jest.fn(() => cells.length),
        getCell: jest.fn((i) => cells[i])
      };
    });

    return {
      getNumRows: jest.fn(() => rows.length),
      getRow: jest.fn((i) => rows[i])
    };
  }

  /** Builds a fake body supporting findText/getChildIndex/insertTable/appendTable. */
  function makeFakeBody({ findTextResult = undefined, childIndex = 2 } = {}) {
    const insertedTable = makeFakeTable([]);
    const appendedTable = makeFakeTable([]);

    const body = {
      findText: jest.fn(() => findTextResult),
      getChildIndex: jest.fn(() => childIndex),
      insertTable: jest.fn((index, data) => {
        insertedTable.__insertedAt = index;
        insertedTable.__insertedData = data;
        return makeFakeTable(data);
      }),
      appendTable: jest.fn((data) => makeFakeTable(data))
    };

    return { body, insertedTable, appendedTable };
  }

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    facade = {
      _logger: logger,
      _cache: {},
      _utils: {},
      _exceptionService: {},
      openStandard: jest.fn()
    };

    manager = new DocumentTableManager(facade);
  });

  describe('insertTableAtMarker()', () => {
    it('inserts the table immediately after the marker (not at document end)', () => {
      const paragraphElement = { getParent: jest.fn() };
      const foundElement = {
        getParent: jest.fn(() => paragraphElement)
      };
      const rangeElement = { getElement: jest.fn(() => foundElement) };

      const insertedTableResult = makeFakeTable([['A', 'B']]);
      const body = {
        findText: jest.fn(() => rangeElement),
        getChildIndex: jest.fn(() => 4),
        insertTable: jest.fn(() => insertedTableResult),
        appendTable: jest.fn()
      };
      // Marker text run's containing paragraph IS the top-level child of body.
      paragraphElement.getParent.mockReturnValue(body);

      const doc = { getBody: jest.fn(() => body) };
      facade.openStandard.mockReturnValue(doc);

      const data = [['A', 'B']];
      const result = manager.insertTableAtMarker('doc123', '{{TABELLA:sheet1}}', data);

      expect(facade.openStandard).toHaveBeenCalledWith('doc123');
      expect(body.findText).toHaveBeenCalledWith('{{TABELLA:sheet1}}');
      // Walked up from the text run to the top-level paragraph child of body.
      expect(body.getChildIndex).toHaveBeenCalledWith(paragraphElement);
      // Inserted right after the marker's paragraph (childIndex + 1), NOT appended at the end.
      expect(body.insertTable).toHaveBeenCalledWith(5, data);
      expect(body.appendTable).not.toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.rows).toBe(1);
      expect(result.columns).toBe(2);
      expect(result.foundElementIndex).toBe(4);
    });

    it('throws a clear error and does not fall back to append when marker is not found', () => {
      const { body } = makeFakeBody({ findTextResult: null });
      const doc = { getBody: jest.fn(() => body) };
      facade.openStandard.mockReturnValue(doc);

      expect(() => {
        manager.insertTableAtMarker('doc123', '{{TABELLA:missing}}', [['x']]);
      }).toThrow(/{{TABELLA:missing}}/);

      expect(body.insertTable).not.toHaveBeenCalled();
      expect(body.appendTable).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('applies header-row bold styling on the positional path', () => {
      const paragraphElement = { getParent: jest.fn(() => 'BODY_MARKER') };
      const foundElement = { getParent: jest.fn(() => paragraphElement) };
      const rangeElement = { getElement: jest.fn(() => foundElement) };

      const data = [
        ['H1', 'H2'],
        ['r1', 'r2']
      ];
      const insertedTableResult = makeFakeTable(data);

      const body = {
        findText: jest.fn(() => rangeElement),
        getChildIndex: jest.fn(() => 0),
        insertTable: jest.fn(() => insertedTableResult),
        appendTable: jest.fn()
      };
      paragraphElement.getParent.mockReturnValue(body);

      const doc = { getBody: jest.fn(() => body) };
      facade.openStandard.mockReturnValue(doc);

      manager.insertTableAtMarker('doc123', '{{TABELLA:sheet1}}', data, {
        headerRow: true,
        alternatingRows: true
      });

      const headerRow = insertedTableResult.getRow(0);
      expect(headerRow.getCell(0).bold).toBe(true);
      expect(headerRow.getCell(1).bold).toBe(true);

      const secondRow = insertedTableResult.getRow(1);
      expect(secondRow.getCell(0).backgroundColor).toBe('#f3f3f3');
    });
  });

  describe('appendTable / _createTableWithStandardAPI (backward compatibility)', () => {
    it('still appends the table at the end of the document body (no marker path)', () => {
      const data = [['A', 'B']];
      const appendedTableResult = makeFakeTable(data);
      const body = {
        appendTable: jest.fn(() => appendedTableResult),
        findText: jest.fn(),
        insertTable: jest.fn()
      };
      const doc = { getBody: jest.fn(() => body) };
      facade.openStandard.mockReturnValue(doc);

      const result = manager._createTableWithStandardAPI('doc123', { data, options: {} });

      expect(body.appendTable).toHaveBeenCalledWith(data);
      expect(body.insertTable).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.rows).toBe(1);
      expect(result.columns).toBe(2);
    });

    it('still applies header/alternating-row styling on the append path', () => {
      const data = [
        ['H1', 'H2'],
        ['r1', 'r2'],
        ['r3', 'r4']
      ];
      const appendedTableResult = makeFakeTable(data);
      const body = {
        appendTable: jest.fn(() => appendedTableResult),
        findText: jest.fn(),
        insertTable: jest.fn()
      };
      const doc = { getBody: jest.fn(() => body) };
      facade.openStandard.mockReturnValue(doc);

      manager._createTableWithStandardAPI('doc123', {
        data,
        options: { headerRow: true, alternatingRows: true, columnWidths: [100, 200] }
      });

      const headerRow = appendedTableResult.getRow(0);
      expect(headerRow.getCell(0).bold).toBe(true);
      expect(headerRow.getCell(0).width).toBe(100);
      expect(headerRow.getCell(1).width).toBe(200);

      const row1 = appendedTableResult.getRow(1);
      expect(row1.getCell(0).backgroundColor).toBe('#f3f3f3');
    });
  });

  describe('copyTableColumn()', () => {
    let mockCell, mockCopiedCell, mockRow, mockTable2, mockBody2, mockDoc2;

    beforeEach(() => {
      global.DocumentApp = { Attribute: { BOLD: 'BOLD' } };
      mockCopiedCell = { __copied: true };
      mockCell = { copy: jest.fn(() => mockCopiedCell) };
      mockRow = {
        getCell: jest.fn(() => mockCell),
        getNumCells: jest.fn(() => 3),
        insertTableCell: jest.fn()
      };
      mockTable2 = {
        getNumRows: jest.fn(() => 3),
        getRow: jest.fn(() => mockRow)
      };
      mockBody2 = { getTables: jest.fn(() => [mockTable2]) };
      mockDoc2 = { getBody: jest.fn(() => mockBody2) };
      facade.openStandard = jest.fn(() => mockDoc2);
    });

    it("copies each row's source cell and inserts it at the target column", () => {
      const result = manager.copyTableColumn('doc123', 0, 0, 2);

      // 1 call for the upfront firstRow bounds check + 3 calls in the copy loop.
      expect(mockTable2.getRow).toHaveBeenCalledTimes(4);
      expect(mockRow.getCell).toHaveBeenCalledWith(0);
      expect(mockCell.copy).toHaveBeenCalledTimes(3);
      expect(mockRow.insertTableCell).toHaveBeenCalledWith(2, mockCopiedCell);
      expect(mockRow.insertTableCell).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        success: true,
        tableIndex: 0,
        sourceColumnIndex: 0,
        insertedColumnIndex: 2,
        numRows: 3
      });
    });

    it('throws for an out-of-bounds table index', () => {
      expect(() => manager.copyTableColumn('doc123', 5, 0, 1)).toThrow(
        'Table index 5 out of bounds'
      );
    });

    it('throws for an out-of-bounds sourceColumnIndex without touching any row', () => {
      // mockRow.getNumCells() === 3, so index 3 is already past the last valid cell (0-2).
      expect(() => manager.copyTableColumn('doc123', 0, 3, 1)).toThrow(
        'Source column index 3 out of bounds'
      );
      expect(mockCell.copy).not.toHaveBeenCalled();
      expect(mockRow.insertTableCell).not.toHaveBeenCalled();
    });

    it('throws for an out-of-bounds targetColumnIndex', () => {
      // numCells === 3, so 4 is out of bounds, but 3 (append-at-end) is allowed.
      expect(() => manager.copyTableColumn('doc123', 0, 0, 4)).toThrow(
        'Target column index 4 out of bounds (max: 3)'
      );
      expect(mockCell.copy).not.toHaveBeenCalled();
      expect(mockRow.insertTableCell).not.toHaveBeenCalled();
    });

    it('allows targetColumnIndex equal to the cell count (append as new last column)', () => {
      const result = manager.copyTableColumn('doc123', 0, 0, 3);

      expect(mockRow.insertTableCell).toHaveBeenCalledWith(3, mockCopiedCell);
      expect(result.insertedColumnIndex).toBe(3);
    });

    it('throws a clean error when the table has no rows', () => {
      mockTable2.getNumRows = jest.fn(() => 0);

      expect(() => manager.copyTableColumn('doc123', 0, 0, 0)).toThrow('Table has no rows');
      expect(mockTable2.getRow).not.toHaveBeenCalled();
    });
  });

  describe('setCellRunStyles()', () => {
    let mockTextElement, mockCell, mockRow, mockTable2, mockBody2, mockDoc2;

    beforeEach(() => {
      global.DocumentApp = { Attribute: { BOLD: 'BOLD', FONT_SIZE: 'FONT_SIZE' } };
      mockTextElement = {
        appendText: jest.fn(),
        setAttributes: jest.fn()
      };
      mockCell = {
        clear: jest.fn(),
        editAsText: jest.fn(() => mockTextElement)
      };
      mockRow = { getNumCells: jest.fn(() => 2), getCell: jest.fn(() => mockCell) };
      mockTable2 = { getNumRows: jest.fn(() => 1), getRow: jest.fn(() => mockRow) };
      mockBody2 = { getTables: jest.fn(() => [mockTable2]) };
      mockDoc2 = { getBody: jest.fn(() => mockBody2) };
      facade.openStandard = jest.fn(() => mockDoc2);
    });

    it("clears the cell, appends each segment's text, and applies its native style", () => {
      const segments = [
        { rendered: 'Mario ', style: {} },
        { rendered: 'Rossi', style: { bold: true } }
      ];

      const result = manager.setCellRunStyles('doc123', 0, 0, 0, segments);

      expect(mockCell.clear).toHaveBeenCalled();
      expect(mockTextElement.appendText).toHaveBeenCalledWith('Mario ');
      expect(mockTextElement.appendText).toHaveBeenCalledWith('Rossi');
      expect(mockTextElement.setAttributes).toHaveBeenCalledWith(6, 10, { BOLD: true });
      expect(result).toEqual({
        success: true,
        tableIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        runsApplied: 2
      });
    });

    it('skips setAttributes for a segment whose style maps to no attributes', () => {
      manager.setCellRunStyles('doc123', 0, 0, 0, [{ rendered: 'plain', style: {} }]);
      expect(mockTextElement.setAttributes).not.toHaveBeenCalled();
    });

    it('skips appendText/setAttributes entirely for an empty rendered segment', () => {
      manager.setCellRunStyles('doc123', 0, 0, 0, [{ rendered: '', style: { bold: true } }]);
      expect(mockTextElement.appendText).not.toHaveBeenCalled();
      expect(mockTextElement.setAttributes).not.toHaveBeenCalled();
    });
  });
});
