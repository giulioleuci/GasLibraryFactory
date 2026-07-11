// ===================================================================
// FILE: RoleResolutionLib/src/internal/resolution/__tests__/PriorityChainResolver.test.js
// ===================================================================

import { PriorityChainResolver } from '../../../internal/resolution/PriorityChainResolver';

describe('PriorityChainResolver (ref REPORT_GLF.md B3)', () => {
  it('throws when constructed with no resolvers', () => {
    expect(() => new PriorityChainResolver([])).toThrow(TypeError);
    expect(() => new PriorityChainResolver(null)).toThrow(TypeError);
  });

  it('returns the first resolver that produces a non-null/non-undefined result', () => {
    const resolver = new PriorityChainResolver([
      () => null,
      () => 'from-second',
      () => 'from-third'
    ]);

    expect(resolver.resolve()).toBe('from-second');
  });

  it('returns null when every resolver defers', () => {
    const resolver = new PriorityChainResolver([() => null, () => undefined]);

    expect(resolver.resolve()).toBeNull();
  });

  it('treats an empty array as a match, not a defer (distinguishes "applies, empty" from "does not apply")', () => {
    const resolver = new PriorityChainResolver([() => [], () => ['should-not-run']]);

    expect(resolver.resolve()).toEqual([]);
  });

  it('forwards all arguments to every resolver until one matches', () => {
    const calls = [];
    const resolver = new PriorityChainResolver([
      (a, b) => {
        calls.push(['first', a, b]);
        return null;
      },
      (a, b) => {
        calls.push(['second', a, b]);
        return a + b;
      }
    ]);

    const result = resolver.resolve(2, 3);

    expect(result).toBe(5);
    expect(calls).toEqual([
      ['first', 2, 3],
      ['second', 2, 3]
    ]);
  });

  it('does not invoke resolvers after the first match (short-circuits)', () => {
    const secondResolver = jest.fn(() => 'unused');
    const resolver = new PriorityChainResolver([() => 'hit', secondResolver]);

    resolver.resolve();

    expect(secondResolver).not.toHaveBeenCalled();
  });

  it('models a 3-tier SGSA-style priority hierarchy over heterogeneous sources', () => {
    // SUPPLENZE (1) -> VARIAZIONI_CATTEDRA (2) -> CLASSI (3, nominal fallback).
    const supplenze = new Map([['5A|MATE', 'supplente@x.it']]);
    const variazioni = new Map();
    const classi = new Map([
      ['5A|MATE', 'titolare@x.it'],
      ['3B|FISI', 'nominale@x.it']
    ]);

    const resolver = new PriorityChainResolver([
      (classe, materia) => supplenze.get(`${classe}|${materia}`) ?? null,
      (classe, materia) => variazioni.get(`${classe}|${materia}`) ?? null,
      (classe, materia) => classi.get(`${classe}|${materia}`) ?? null
    ]);

    expect(resolver.resolve('5A', 'MATE')).toBe('supplente@x.it'); // Priority 1 hit
    expect(resolver.resolve('3B', 'FISI')).toBe('nominale@x.it'); // falls through to Priority 3
    expect(resolver.resolve('9Z', 'GRECO')).toBeNull(); // no source matches
  });
});
