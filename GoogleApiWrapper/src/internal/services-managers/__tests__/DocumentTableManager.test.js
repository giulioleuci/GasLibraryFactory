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
});
