import {
  groupBy,
  keyBy,
  orderBy,
  uniqBy,
  differenceBy,
  maxBy,
  minBy,
  sumBy,
  meanBy
} from 'es-toolkit/compat';

export const unique = (a) => (Array.isArray(a) ? [...new Set(a)] : []);
export const compact = (a) => (Array.isArray(a) ? a.filter(Boolean) : []);
export const flatten = (a, depth = 1) => (Array.isArray(a) ? a.flat(depth) : []);
export const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

export { groupBy, keyBy, orderBy, uniqBy, differenceBy, maxBy, minBy, sumBy, meanBy };
