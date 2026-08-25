/**
 * Verifica che le due metà di una specification concordino. Se toQueryObject()
 * è non-null, il filtro di uguaglianza deve selezionare ESATTAMENTE le stesse
 * righe di isSatisfiedBy().
 *
 * @param {Object} spec Specification da verificare.
 * @param {Array<Object>} rows Righe grezze rappresentative — positive E negative.
 * @param {Function} hydrate Trasforma una riga nell'entità valutata dalla spec.
 * @returns {{ok: boolean, divergenti: Array<Object>}}
 */
export function assertSpecificationContract(spec, rows, hydrate) {
  const criteria = spec.toQueryObject();
  if (criteria === null) {
    return { ok: true, divergenti: [] };
  }

  const divergenti = rows.filter((row) => {
    const viaQuery = Object.entries(criteria).every(([column, value]) => row[column] === value);
    const viaMemory = spec.isSatisfiedBy(hydrate(row));
    return viaQuery !== viaMemory;
  });

  return { ok: divergenti.length === 0, divergenti };
}
