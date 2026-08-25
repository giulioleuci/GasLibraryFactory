import * as DomainRepositoryLib from '../../index.js';

test('esporta assertSpecificationContract', () => {
  expect(DomainRepositoryLib.assertSpecificationContract).toEqual(expect.any(Function));
});

test('esporta EqualityFieldSpec', () => {
  expect(DomainRepositoryLib.EqualityFieldSpec).toEqual(expect.any(Function));
});

test('cattura una spec che fa contenimento in memoria e uguaglianza in query', () => {
  const spec = {
    isSatisfiedBy: (entity) => entity.DOCENTE.split(',').includes('a@x.it'),
    toQueryObject: () => ({ DOCENTE: 'a@x.it' })
  };
  const rows = [{ DOCENTE: 'a@x.it' }, { DOCENTE: 'a@x.it,b@x.it' }];

  const result = DomainRepositoryLib.assertSpecificationContract(spec, rows, (row) => row);

  expect(result).toEqual({
    ok: false,
    divergenti: [{ DOCENTE: 'a@x.it,b@x.it' }]
  });
});

test('EqualityFieldSpec mantiene coerenti filtro in memoria e pushdown', () => {
  const spec = new DomainRepositoryLib.EqualityFieldSpec('ATTIVA', (entity) => entity.attiva, true);
  const rows = [{ ATTIVA: true }, { ATTIVA: false }];

  expect(
    DomainRepositoryLib.assertSpecificationContract(spec, rows, (row) => ({
      attiva: row.ATTIVA
    }))
  ).toEqual({ ok: true, divergenti: [] });
  expect(spec.toQueryObject()).toEqual({ ATTIVA: true });
  expect(spec.toString()).toBe('ATTIVA = true');
});
