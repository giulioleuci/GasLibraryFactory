/**
 * @file GasSchemaValidatorLib/src/DatasetValidator.js
 * @description Declarative cross-table dataset validation. Complements
 * SchemaValidator (single-entity Zod shape validation) with the checks a
 * sheet-backed relational store needs and Zod cannot express: referential
 * integrity across tables, CSV foreign keys, dynamic column names, and
 * caller-supplied row predicates.
 *
 * Domain-agnostic by construction: rule ids, vocabulary and user-facing
 * messages belong to the caller; this engine only reports machine-readable
 * violations.
 */

const WILDCARD = '*';

function cellToString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function splitCsv(value) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function rowIsEmpty(row) {
  const values = Object.values(row);
  if (values.length === 0) return true;
  return values.every((v) => cellToString(v) === '');
}

export class DatasetValidator {
  /**
   * @param {{logger?: object}} [deps]
   */
  constructor(deps = {}) {
    this._logger = deps.logger || null;
    this._indexes = new Map();
  }

  /**
   * @param {Record<string, Array<Record<string, unknown>>>} datasets
   * @param {Array<object>} rules
   * @returns {{violations: Array<object>}}
   */
  validate(datasets, rules) {
    this._indexes = new Map();
    const context = {
      datasets,
      index: (table, column) => this._index(datasets, table, column)
    };
    const violations = [];
    (rules || []).forEach((rule) => {
      const rows = datasets[rule.table];
      if (!Array.isArray(rows)) {
        if (this._logger) {
          this._logger.warn(`DatasetValidator: tabella "${rule.table}" assente`);
        }
        return;
      }
      const nonEmptyRows = rows.filter((r) => !rowIsEmpty(r));
      violations.push(...this._applyRule(rule, nonEmptyRows, datasets, context));
    });
    return { violations };
  }

  _applyRule(rule, rows, datasets, context) {
    switch (rule.type) {
      case 'required':
        return this._required(rule, rows);
      case 'enum':
        return this._enum(rule, rows);
      case 'json':
        return this._json(rule, rows);
      case 'foreignKey':
        return this._foreignKey(rule, rows, datasets);
      case 'columnName':
        return this._columnName(rule, rows, datasets);
      case 'rowPredicate':
        return this._rowPredicate(rule, rows, context);
      default:
        throw new Error(`DatasetValidator: tipo di regola non supportato "${rule.type}"`);
    }
  }

  _violation(rule, rowIndex, column, value, details) {
    return {
      ruleId: rule.id,
      type: rule.type,
      table: rule.table,
      rowIndex,
      column,
      value,
      details: details || {}
    };
  }

  _index(datasets, table, column) {
    const key = `${table}::${column}`;
    let set = this._indexes.get(key);
    if (set) {
      return set;
    }
    set = new Set();
    (datasets[table] || []).forEach((row) => {
      const value = cellToString(row[column]);
      if (value !== '') {
        set.add(value);
      }
    });
    this._indexes.set(key, set);
    return set;
  }

  _required(rule, rows) {
    const out = [];
    rows.forEach((row, rowIndex) => {
      rule.columns.forEach((column) => {
        if (cellToString(row[column]) === '') {
          out.push(this._violation(rule, rowIndex, column, ''));
        }
      });
    });
    return out;
  }

  _enum(rule, rows) {
    const allowEmpty = rule.allowEmpty !== false;
    const allowed = new Set(rule.values);
    const out = [];
    rows.forEach((row, rowIndex) => {
      const value = cellToString(row[rule.column]);
      if (value === '' && allowEmpty) {
        return;
      }
      if (allowed.has(value)) {
        return;
      }
      out.push(this._violation(rule, rowIndex, rule.column, value, { values: rule.values }));
    });
    return out;
  }

  _json(rule, rows) {
    const out = [];
    rows.forEach((row, rowIndex) => {
      const raw = row[rule.column];
      if (raw === null || raw === undefined) {
        return;
      }
      if (typeof raw === 'object') {
        return;
      }
      const value = cellToString(raw);
      if (value === '') {
        return;
      }
      try {
        JSON.parse(value);
      } catch (error) {
        out.push(this._violation(rule, rowIndex, rule.column, value, { reason: error.message }));
      }
    });
    return out;
  }

  _foreignKey(rule, rows, datasets) {
    const target = this._index(datasets, rule.targetTable, rule.targetColumn);
    const allowEmpty = rule.allowEmpty !== false;
    const details = { targetTable: rule.targetTable, targetColumn: rule.targetColumn };
    const out = [];
    rows.forEach((row, rowIndex) => {
      const raw = cellToString(row[rule.column]);
      if (raw === '') {
        if (!allowEmpty) {
          out.push(this._violation(rule, rowIndex, rule.column, '', details));
        }
        return;
      }
      const tokens = rule.csv ? splitCsv(raw) : [raw];
      tokens.forEach((token) => {
        if (rule.allowWildcard && token === WILDCARD) {
          return;
        }
        if (target.has(token)) {
          return;
        }
        out.push(this._violation(rule, rowIndex, rule.column, token, details));
      });
    });
    return out;
  }

  _columnName(rule, rows, datasets) {
    const target = this._index(datasets, rule.targetTable, rule.targetColumn);
    const known = new Set(rule.knownColumns || []);
    const ignore = new Set(rule.ignore || []);
    const normalize = rule.normalize || ((name) => name);
    const details = { targetTable: rule.targetTable, targetColumn: rule.targetColumn };
    const seen = new Set();
    const out = [];
    rows.forEach((row) => {
      Object.keys(row).forEach((column) => {
        if (known.has(column) || ignore.has(column) || seen.has(column)) {
          return;
        }
        seen.add(column);
        if (target.has(normalize(column))) {
          return;
        }
        out.push(this._violation(rule, 0, column, column, details));
      });
    });
    return out;
  }

  _rowPredicate(rule, rows, context) {
    const out = [];
    rows.forEach((row, rowIndex) => {
      const hit = rule.check(row, context);
      if (!hit) {
        return;
      }
      out.push(this._violation(rule, rowIndex, hit.column, cellToString(hit.value), hit.details));
    });
    return out;
  }
}
