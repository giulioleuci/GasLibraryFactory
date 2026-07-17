/**
 * @file GoogleApiWrapper/src/internal/RateLimiter.js
 * @description Token bucket rate limiter for Google API quota management.
 * @version 1.0
 */

import { RateLimitExceededException } from '@GasResilienceLib';

const DEFAULT_REQUESTS_PER_MINUTE = 60;
const DEFAULT_BURST_CAPACITY = 10;
const DEFAULT_MAX_WAIT_THRESHOLD_MS = 5000;

export class RateLimiter {
  constructor(config = {}, logger = null, utils = null) {
    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('RateLimiter: config must be an object');
    }

    let refillRate;
    if (config.requestsPerSecond !== undefined && config.requestsPerSecond !== 0) {
      refillRate = config.requestsPerSecond;
    } else {
      const rpm = config.requestsPerMinute || DEFAULT_REQUESTS_PER_MINUTE;
      refillRate = rpm / 60;
    }

    if (refillRate <= 0) {
      throw new Error('RateLimiter: refill rate must be greater than 0');
    }

    const burstCapacity = config.burstCapacity || DEFAULT_BURST_CAPACITY;
    if (burstCapacity < 1) {
      throw new Error('RateLimiter: burst capacity must be at least 1');
    }

    const maxWaitThresholdMs =
      config.maxWaitThresholdMs !== undefined
        ? config.maxWaitThresholdMs
        : DEFAULT_MAX_WAIT_THRESHOLD_MS;
    if (maxWaitThresholdMs < 0) {
      throw new Error('RateLimiter: maxWaitThresholdMs must be non-negative');
    }

    if (utils !== null && utils !== undefined) {
      if (typeof utils !== 'object' || typeof utils.sleep !== 'function') {
        throw new Error('RateLimiter: utils must be a valid UtilitiesService with sleep() method');
      }
    }

    this._refillRate = refillRate;
    this._burstCapacity = burstCapacity;
    this._autoRefill = config.autoRefill !== undefined ? Boolean(config.autoRefill) : true;
    this._maxWaitThresholdMs = maxWaitThresholdMs;
    this._logger = logger;
    this._utils = utils;
    this._buckets = {};
    this._stats = {
      totalRequests: 0,
      throttledRequests: 0,
      totalWaitTime: 0
    };
  }

  _validateOpName(method, name) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(`RateLimiter.${method}: operationName must be a non-empty string`);
    }
  }

  _getBucket(operationName) {
    if (!this._buckets[operationName]) {
      this._buckets[operationName] = {
        tokens: this._burstCapacity,
        lastRefillTime: Date.now(),
        requestCount: 0,
        throttledCount: 0
      };
    }
    return this._buckets[operationName];
  }

  _refillTokens(bucket) {
    if (!this._autoRefill) return;
    const now = Date.now();
    const elapsedSec = (now - bucket.lastRefillTime) / 1000;
    if (elapsedSec <= 0) return;
    const refill = elapsedSec * this._refillRate;
    bucket.tokens = Math.min(this._burstCapacity, bucket.tokens + refill);
    bucket.lastRefillTime = now;
  }

  tryAcquire(operationName, tokensRequired = 1) {
    this._validateOpName('tryAcquire', operationName);
    if (typeof tokensRequired !== 'number' || tokensRequired < 1) {
      throw new Error('RateLimiter.tryAcquire: tokensRequired must be at least 1');
    }

    const bucket = this._getBucket(operationName);
    this._refillTokens(bucket);

    bucket.requestCount += 1;
    this._stats.totalRequests += 1;

    if (bucket.tokens >= tokensRequired) {
      bucket.tokens -= tokensRequired;
      return true;
    }

    bucket.throttledCount += 1;
    this._stats.throttledRequests += 1;
    this._log(
      `Rate limit reached for '${operationName}' (need ${tokensRequired}, have ${bucket.tokens.toFixed(2)})`
    );
    return false;
  }

  waitForToken(operationName, tokensRequired = 1, _maxWaitMs = 30000) {
    this._validateOpName('waitForToken', operationName);

    const bucket = this._getBucket(operationName);
    this._refillTokens(bucket);

    if (bucket.tokens >= tokensRequired) {
      bucket.tokens -= tokensRequired;
      bucket.requestCount += 1;
      this._stats.totalRequests += 1;
      return true;
    }

    const tokensNeeded = tokensRequired - bucket.tokens;
    const requiredWaitMs = Math.ceil((tokensNeeded / this._refillRate) * 1000);

    if (requiredWaitMs > this._maxWaitThresholdMs || !this._utils) {
      throw new RateLimitExceededException(operationName, requiredWaitMs);
    }

    this._utils.sleep(requiredWaitMs);
    this._stats.totalWaitTime += requiredWaitMs;

    const bucket2 = this._getBucket(operationName);
    this._refillTokens(bucket2);
    bucket2.tokens = Math.max(0, bucket2.tokens - tokensRequired);
    bucket2.requestCount += 1;
    this._stats.totalRequests += 1;
    return true;
  }

  acquire(operationName, tokensRequired = 1) {
    if (!this.tryAcquire(operationName, tokensRequired)) {
      throw new Error(
        `Rate limit exceeded for operation '${operationName}'. Please try again later.`
      );
    }
  }

  reset(operationName) {
    this._validateOpName('reset', operationName);
    this._buckets[operationName] = {
      tokens: this._burstCapacity,
      lastRefillTime: Date.now(),
      requestCount: 0,
      throttledCount: 0
    };
    this._log(`Rate limiter reset for '${operationName}'`);
  }

  resetAll() {
    for (const name of Object.keys(this._buckets)) {
      this.reset(name);
    }
  }

  getStats(operationName) {
    this._validateOpName('getStats', operationName);
    const bucket = this._getBucket(operationName);
    this._refillTokens(bucket);

    const throttleRate =
      bucket.requestCount === 0
        ? '0%'
        : `${((bucket.throttledCount / bucket.requestCount) * 100).toFixed(2)}%`;

    return {
      tokensAvailable: bucket.tokens,
      maxCapacity: this._burstCapacity,
      requestCount: bucket.requestCount,
      throttledCount: bucket.throttledCount,
      throttleRate
    };
  }

  getGlobalStats() {
    const { totalRequests, throttledRequests, totalWaitTime } = this._stats;
    const throttleRate =
      totalRequests === 0 ? '0%' : `${((throttledRequests / totalRequests) * 100).toFixed(2)}%`;
    const avgWaitTime =
      totalRequests === 0 ? '0ms' : `${(totalWaitTime / totalRequests).toFixed(2)}ms`;

    return {
      totalRequests,
      throttledRequests,
      totalWaitTime,
      throttleRate,
      avgWaitTime
    };
  }

  _log(message) {
    if (this._logger && typeof this._logger.debug === 'function') {
      this._logger.debug(`[RateLimiter] ${message}`);
    }
  }
}
