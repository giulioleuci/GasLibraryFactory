import { Specification } from './Specification.js';

/**
 * Specification di uguaglianza in cui isSatisfiedBy e toQueryObject sono
 * coerenti per costruzione: il valore letto dall'entità e quello confrontato
 * nella query sono lo stesso.
 */
export class EqualityFieldSpec extends Specification {
  /**
   * @param {string} column Nome colonna DB per il pushdown.
   * @param {Function} read Legge dall'entità il valore da confrontare.
   * @param {*} expected Valore atteso.
   */
  constructor(column, read, expected) {
    super();
    this._column = column;
    this._read = read;
    this._expected = expected;
  }

  isSatisfiedBy(entity) {
    return this._read(entity) === this._expected;
  }

  toQueryObject() {
    return { [this._column]: this._expected };
  }

  toString() {
    return `${this._column} = ${String(this._expected)}`;
  }
}
