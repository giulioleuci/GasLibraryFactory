import { DateRange } from '../utils/DateRange.js';

describe('DateRange constructor', () => {
  test('throws TypeError for invalid start', () => {
    expect(() => new DateRange(new Date('not-a-date'))).toThrow(TypeError);
    expect(() => new DateRange('2026-01-01')).toThrow(TypeError);
  });

  test('throws TypeError for invalid end', () => {
    expect(() => new DateRange(new Date('2026-01-01'), new Date('not-a-date'))).toThrow(TypeError);
  });

  test('throws TypeError when start is after end', () => {
    expect(() => new DateRange(new Date('2026-01-10'), new Date('2026-01-01'))).toThrow(TypeError);
  });

  test('accepts start === end', () => {
    const d = new Date('2026-01-01');
    expect(() => new DateRange(d, d)).not.toThrow();
  });

  test('defaults to an open-ended range when end is omitted or null', () => {
    const range = new DateRange(new Date('2026-01-01'));
    expect(range.isOpenEnded()).toBe(true);
    const range2 = new DateRange(new Date('2026-01-01'), null);
    expect(range2.isOpenEnded()).toBe(true);
  });
});

describe('DateRange.isOpenEnded', () => {
  test('false for a bounded range', () => {
    const range = new DateRange(new Date('2026-01-01'), new Date('2026-01-31'));
    expect(range.isOpenEnded()).toBe(false);
  });
});

describe('DateRange.contains', () => {
  const range = new DateRange(new Date('2026-01-10'), new Date('2026-01-20'));

  test('true for a date inside the range', () => {
    expect(range.contains(new Date('2026-01-15'))).toBe(true);
  });

  test('true at the inclusive boundaries', () => {
    expect(range.contains(new Date('2026-01-10'))).toBe(true);
    expect(range.contains(new Date('2026-01-20'))).toBe(true);
  });

  test('false for a date outside the range', () => {
    expect(range.contains(new Date('2026-01-09'))).toBe(false);
    expect(range.contains(new Date('2026-01-21'))).toBe(false);
  });

  test('open-ended range contains any future date', () => {
    const openRange = new DateRange(new Date('2026-01-01'));
    expect(openRange.contains(new Date('2099-12-31'))).toBe(true);
  });
});

describe('DateRange.durationInDays', () => {
  test('computes the truncated whole-day span', () => {
    const range = new DateRange(new Date('2026-01-01'), new Date('2026-01-11'));
    expect(range.durationInDays()).toBe(10);
  });

  test('is 0 for a single-instant range', () => {
    const d = new Date('2026-01-01');
    const range = new DateRange(d, d);
    expect(range.durationInDays()).toBe(0);
  });
});

describe('DateRange.overlaps', () => {
  test('true when ranges intersect', () => {
    const a = new DateRange(new Date('2026-01-01'), new Date('2026-01-10'));
    const b = new DateRange(new Date('2026-01-05'), new Date('2026-01-15'));
    expect(a.overlaps(b)).toBe(true);
    expect(b.overlaps(a)).toBe(true);
  });

  test('true when one range is nested in the other', () => {
    const a = new DateRange(new Date('2026-01-01'), new Date('2026-01-31'));
    const b = new DateRange(new Date('2026-01-10'), new Date('2026-01-20'));
    expect(a.overlaps(b)).toBe(true);
  });

  test('true when ranges touch at a single boundary instant', () => {
    const a = new DateRange(new Date('2026-01-01'), new Date('2026-01-10'));
    const b = new DateRange(new Date('2026-01-10'), new Date('2026-01-20'));
    expect(a.overlaps(b)).toBe(true);
  });

  test('false when ranges are disjoint', () => {
    const a = new DateRange(new Date('2026-01-01'), new Date('2026-01-10'));
    const b = new DateRange(new Date('2026-01-11'), new Date('2026-01-20'));
    expect(a.overlaps(b)).toBe(false);
  });

  test('two open-ended ranges always overlap', () => {
    const a = new DateRange(new Date('2026-01-01'));
    const b = new DateRange(new Date('2099-01-01'));
    expect(a.overlaps(b)).toBe(true);
  });
});
