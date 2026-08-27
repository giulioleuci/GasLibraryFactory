import * as DomainRepositoryLib from '../../index.js';

test('esporta assertSpecificationContract', () => {
  const { name, length } = DomainRepositoryLib.assertSpecificationContract;
  expect({ name, length }).toEqual({ name: 'assertSpecificationContract', length: 3 });
});

test('esporta EqualityFieldSpec', () => {
  const { name, length } = DomainRepositoryLib.EqualityFieldSpec;
  expect({ name, length }).toEqual({ name: 'EqualityFieldSpec', length: 3 });
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
