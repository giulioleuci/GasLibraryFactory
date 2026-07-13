/**
 * @file CoreUtilsLib/src/utils/DateRange.js
 * @description Generic date-range value object: containment, duration, overlap,
 * and an open-ended sentinel. Extracted as a Code Reuse Initiative item so
 * callers stop hand-rolling `Date.getTime()` arithmetic and magic-number
 * "infinity" sentinels for open-ended periods (ref ALDO_GLF_AUDIT_RESULTS.md B-2).
 */

import { DateUtils } from './DateUtils.js';

/** Sentinel end-of-range value representing "no upper bound" (max safe Date). */
const OPEN_ENDED_SENTINEL_MS = 8640000000000000;

export class DateRange {
  /**
   * @param {Date} start Range start (inclusive).
   * @param {Date|null} [end] Range end (inclusive). Omit or pass `null` for an open-ended range.
   * @throws {TypeError} If `start` (or a provided `end`) is not a valid Date, or if `start` is after `end`.
   */
  constructor(start, end = null) {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new TypeError('DateRange: start must be a valid Date');
    }
    const resolvedEnd = end === null || end === undefined ? new Date(OPEN_ENDED_SENTINEL_MS) : end;
    if (!(resolvedEnd instanceof Date) || isNaN(resolvedEnd.getTime())) {
      throw new TypeError('DateRange: end must be a valid Date or null/undefined');
    }
    if (start.getTime() > resolvedEnd.getTime()) {
      throw new TypeError('DateRange: start must not be after end');
    }
    this.start = start;
    this.end = resolvedEnd;
  }

  /** True if `end` is the open-ended sentinel (no upper bound was supplied). */
  isOpenEnded() {
    return this.end.getTime() === OPEN_ENDED_SENTINEL_MS;
  }

  /** True if `date` falls within `[start, end]` inclusive. */
  contains(date) {
    return date.getTime() >= this.start.getTime() && date.getTime() <= this.end.getTime();
  }

  /** Whole-day span, truncated (uses `DateUtils.daysBetween`). */
  durationInDays() {
    return DateUtils.MILLIS_PER_DAY === 0
      ? 0
      : Math.trunc((this.end.getTime() - this.start.getTime()) / DateUtils.MILLIS_PER_DAY);
  }

  /** True if this range and `other` share at least one instant. */
  overlaps(other) {
    return (
      this.start.getTime() <= other.end.getTime() && other.start.getTime() <= this.end.getTime()
    );
  }
}
