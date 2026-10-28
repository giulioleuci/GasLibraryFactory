import { jest } from '@jest/globals';
import type { DomainQuery } from '../internal/contracts.js';

import { Specification } from '../specifications/Specification.js';
import { FieldSpecification } from '../specifications/FieldSpecification.js';

class InMemoryOnly extends Specification {
  isSatisfiedBy(e: { x: number }) {
    return e.x > 3;
  }
}

class Pushdown extends Specification {
  isSatisfiedBy(e: { ATTIVA: boolean }) {
    return e.ATTIVA === true;
  }

  toQueryObject() {
    return { ATTIVA: true };
  }
}

test('la base restituisce null di default', () => {
  expect(new InMemoryOnly().toQueryObject()).toBeNull();
});

test('canBeTranslatedToQuery non lancia per le spec in memoria', () => {
  const spec = new InMemoryOnly();
  const throwSpy = jest.spyOn(Specification.prototype, 'toQuery');
  expect(spec.canBeTranslatedToQuery()).toBe(false);
  expect(throwSpy).not.toHaveBeenCalled();
  throwSpy.mockRestore();
});

test('una spec con toQueryObject è traducibile senza passare da toQuery', () => {
  expect(new Pushdown().canBeTranslatedToQuery()).toBe(true);
});

test('le spec toQuery-based restano sul percorso toQuery', () => {
  const spec = new FieldSpecification('ANNO', 'greaterThan', 3);
  const calls: unknown[][] = [];
  const builder = {
    where: (...args: unknown[]) => {
      calls.push(args);
      return builder;
    }
  };

  spec.toQuery(builder);

  expect(calls).toEqual([['ANNO', '>', 3]]);
  expect(spec.canBeTranslatedToQuery()).toBe(true);
});

test('riconosce un override toQuery assegnato come proprietà di istanza', () => {
  class InstanceQuerySpecification extends InMemoryOnly {
    declare toQuery: <Q extends DomainQuery>(builder: Q) => Q;
    constructor() {
      super();
      this.toQuery = (builder) => builder.where('X', '>', 3);
    }
  }

  expect(new InstanceQuerySpecification().canBeTranslatedToQuery()).toBe(true);
});
