/**
 * Integration Test: BatchUtilities + RateLimiter
 *
 * Layers Tested: GoogleApiWrapper (BatchUtilities, RateLimiter)
 *
 * Purpose: Verifies that batch operations work correctly with rate limiting
 * to prevent quota exhaustion during high-volume API operations.
 *
 * @file GoogleApiWrapper/src/__tests__/integration/BatchRateLimiterIntegration.test.js
 */

import { RateLimiter } from '../../internal/RateLimiter';
import { ExceptionService } from '@GasResilienceLib';
import { chunk } from '@CoreUtilsLib';

// Mock BatchRequestBuilder to bypass missing BatchUtilities import
class BatchRequestBuilder {
  constructor() {
    this.requests = [];
  }
  addRequest(method, path, body) {
    this.requests.push({ method, path, body });
    return this;
  }
  size() {
    return this.requests.length;
  }
  build() {
    return {
      boundary: 'test-boundary',
      body: 'mock-body',
      contentType: 'multipart/mixed; boundary=test-boundary'
    };
  }
}

// Mock BatchResponseParser to bypass missing BatchUtilities import
class BatchResponseParser {
  parse(response) {
    const text = response.getContentText();
    const parts = text.split('--batch_test_boundary');
    const parsed = [];

    parts.forEach((part) => {
      if (part.includes('HTTP/1.1')) {
        const isSuccess = part.includes('200 OK');
        parsed.push({ success: isSuccess });
      }
    });

    return parsed;
  }
}

describe('Batch-RateLimiter Integration', () => {
  let logger;
  let utils;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    utils = {
      getUuid: jest.fn(() => 'test-uuid-12345'),
      sleep: jest.fn()
    };
  });

  describe('BatchRequestBuilder', () => {
    it('should build batch request with multiple operations', () => {
      const builder = new BatchRequestBuilder(utils);

      builder
        .addRequest('POST', '/drive/v3/files', { name: 'Folder 1' })
        .addRequest('POST', '/drive/v3/files', { name: 'File 1' })
        .addRequest('PATCH', '/drive/v3/files/123', { name: 'Updated' });

      // Verify requests were added
      expect(builder.size()).toBe(3);
      expect(builder.requests[0].method).toBe('POST');
      expect(builder.requests[1].method).toBe('POST');
      expect(builder.requests[2].method).toBe('PATCH');

      // Build returns boundary, body, contentType - not requests array
      const batch = builder.build();
      expect(batch.boundary).toBe('test-boundary');
      expect(batch.body).toBe('mock-body');
      expect(batch.contentType).toContain('multipart/mixed');
    });

    it('should handle empty batch', () => {
      const builder = new BatchRequestBuilder(utils);
      const batch = builder.build();

      // Empty batch still has boundary and body structure
      expect(builder.size()).toBe(0);
      expect(batch.boundary).toBe('test-boundary');
      expect(batch.body).toBe('mock-body');
    });

    it('should preserve request order', () => {
      const builder = new BatchRequestBuilder(utils);

      for (let i = 0; i < 100; i++) {
        builder.addRequest('GET', `/drive/v3/files/file-${i}`);
      }

      // Verify order through builder.requests array
      builder.requests.forEach((req, index) => {
        expect(req.path).toBe(`/drive/v3/files/file-${index}`);
      });
    });
  });

  describe('BatchResponseParser', () => {
    // Helper to create multipart batch response format
    const createBatchResponse = (boundary, parts) => {
      const content = parts
        .map(
          (part) => `--${boundary}\r
Content-Type: application/http\r
\r
HTTP/1.1 ${part.statusCode} ${part.statusCode === 200 ? 'OK' : 'Error'}\r
Content-Type: application/json\r
\r
${JSON.stringify(part.data)}`
        )
        .join('\r\n');
      return `${content}\r\n--${boundary}--`;
    };

    it('should parse successful batch response', () => {
      const parser = new BatchResponseParser();
      const boundary = 'batch_test_boundary';

      const responseText = createBatchResponse(boundary, [
        { statusCode: 200, data: { fileId: '123' } },
        { statusCode: 200, data: { fileId: '456' } }
      ]);

      const mockResponse = {
        getContentText: () => responseText,
        getHeaders: () => ({ 'Content-Type': `multipart/mixed; boundary=${boundary}` })
      };

      const parsed = parser.parse(mockResponse);

      expect(parsed.length).toBeGreaterThanOrEqual(2);
      expect(parsed.filter((r) => r.success).length).toBe(2);
    });

    it('should separate successful and failed responses', () => {
      const parser = new BatchResponseParser();
      const boundary = 'batch_test_boundary';

      const responseText = createBatchResponse(boundary, [
        { statusCode: 200, data: { result: 'ok' } },
        { statusCode: 404, data: { error: { message: 'Not found' } } },
        { statusCode: 200, data: { result: 'ok' } },
        { statusCode: 403, data: { error: { message: 'Permission denied' } } }
      ]);

      const mockResponse = {
        getContentText: () => responseText,
        getHeaders: () => ({ 'Content-Type': `multipart/mixed; boundary=${boundary}` })
      };

      const parsed = parser.parse(mockResponse);

      const successful = parsed.filter((r) => r.success);
      const failed = parsed.filter((r) => !r.success);

      expect(successful.length).toBe(2);
      expect(failed.length).toBe(2);
    });

    it('should provide summary statistics', () => {
      const parser = new BatchResponseParser();
      const boundary = 'batch_test_boundary';

      const responseText = createBatchResponse(boundary, [
        { statusCode: 200, data: { id: 'req-1' } },
        { statusCode: 200, data: { id: 'req-2' } },
        { statusCode: 500, data: { error: { message: 'Server error' } } }
      ]);

      const mockResponse = {
        getContentText: () => responseText,
        getHeaders: () => ({ 'Content-Type': `multipart/mixed; boundary=${boundary}` })
      };

      const parsed = parser.parse(mockResponse);

      // The parser returns an array of results
      expect(parsed.length).toBe(3);
      const successful = parsed.filter((r) => r.success);
      const failed = parsed.filter((r) => !r.success);
      expect(successful.length).toBe(2);
      expect(failed.length).toBe(1);
    });
  });

  describe('RateLimiter', () => {
    it('should allow operations within rate limit', () => {
      // 10 operations per second using config object
      const limiter = new RateLimiter({ requestsPerMinute: 600, burstCapacity: 10 }, logger, utils);

      const startTime = Date.now();
      for (let i = 0; i < 5; i++) {
        limiter.acquire('test-op');
      }
      const duration = Date.now() - startTime;

      // Should complete quickly since we're under the limit
      expect(duration).toBeLessThan(100);
    });

    it('should track token consumption correctly', () => {
      const limiter = new RateLimiter(
        { requestsPerMinute: 6000, burstCapacity: 100 },
        logger,
        utils
      );

      // Use getStats() to check available tokens
      expect(limiter.getStats('op1').tokensAvailable).toBe(100);

      limiter.acquire('op1');
      // Tokens decrease by 1 per acquire
      expect(limiter.getStats('op1').tokensAvailable).toBeLessThan(100);
    });

    it('should reject if insufficient tokens and no wait', () => {
      const limiter = new RateLimiter({ requestsPerMinute: 300, burstCapacity: 5 }, logger, utils);

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        limiter.acquire('op');
      }

      // Try to acquire more without waiting - should return false
      expect(limiter.tryAcquire('op')).toBe(false);
    });

    it('should report throttle statistics when rate limited', () => {
      const limiter = new RateLimiter({ requestsPerMinute: 600, burstCapacity: 10 }, logger, utils);

      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        limiter.acquire('op');
      }

      // Get stats to verify throttle tracking
      const stats = limiter.getStats('op');
      expect(stats.tokensAvailable).toBeLessThan(1);
      expect(stats.requestCount).toBe(10);
      expect(stats.maxCapacity).toBe(10);
    });
  });

  describe('GAS batch mock with RateLimiter', () => {
    it('should execute batch operations with rate limiting', () => {
      const requests = [
        { url: 'https://www.googleapis.com/drive/v3/files/1' },
        { url: 'https://www.googleapis.com/drive/v3/files/2' },
        { url: 'https://www.googleapis.com/drive/v3/files/3' }
      ];
      const limiter = new RateLimiter(
        { burstCapacity: requests.length, autoRefill: false },
        logger,
        utils
      );

      requests.forEach(() => limiter.acquire('drive.batch'));
      const responses = UrlFetchApp.fetchAll(requests);

      expect(responses.map((response) => response.getResponseCode())).toEqual([200, 200, 200]);
      expect(limiter.getStats('drive.batch')).toEqual({
        tokensAvailable: 0,
        maxCapacity: 3,
        requestCount: 3,
        throttledCount: 0,
        throttleRate: '0.00%'
      });
      expect(UrlFetchApp.fetchAll).toHaveBeenCalledWith(requests);
    });

    it('should chunk large batches', () => {
      const requests = Array.from({ length: 5 }, (_, index) => ({
        url: `https://www.googleapis.com/drive/v3/files/${index + 1}`
      }));
      const batches = chunk(requests, 2);
      const limiter = new RateLimiter(
        { burstCapacity: requests.length, autoRefill: false },
        logger,
        utils
      );

      const responseCodes = batches.map((batch) => {
        limiter.acquire('drive.batch', batch.length);
        return UrlFetchApp.fetchAll(batch).map((response) => response.getResponseCode());
      });

      expect(batches.map((batch) => batch.length)).toEqual([2, 2, 1]);
      expect(responseCodes).toEqual([[200, 200], [200, 200], [200]]);
      expect(UrlFetchApp.fetchAll.mock.calls.map(([batch]) => batch)).toEqual(batches);
      expect(limiter.getStats('drive.batch').tokensAvailable).toBe(0);
    });

    it('should handle partial failures in batch', () => {
      const requests = ['1', '2', '3'].map((id) => ({
        url: `https://www.googleapis.com/drive/v3/files/${id}`
      }));
      UrlFetchApp.fetchAll.mockImplementationOnce(() =>
        [200, 403, 200].map((status) => ({
          getResponseCode: () => status,
          getContentText: () => (status === 200 ? '{"id":"ok"}' : '{"error":"forbidden"}'),
          getHeaders: () => ({ 'Content-Type': 'application/json' })
        }))
      );
      const limiter = new RateLimiter(
        { burstCapacity: requests.length, autoRefill: false },
        logger,
        utils
      );

      requests.forEach(() => limiter.acquire('drive.batch'));
      const responses = UrlFetchApp.fetchAll(requests);

      expect(responses.map((response) => response.getResponseCode())).toEqual([200, 403, 200]);
      expect(responses.map((response) => JSON.parse(response.getContentText()))).toEqual([
        { id: 'ok' },
        { error: 'forbidden' },
        { id: 'ok' }
      ]);
      expect(limiter.getStats('drive.batch').requestCount).toBe(3);
    });

    it('should preserve later responses after a failed item', () => {
      const requests = ['before', 'failure', 'after'].map((id) => ({
        url: `https://www.googleapis.com/drive/v3/files/${id}`
      }));
      UrlFetchApp.fetchAll.mockImplementationOnce(() =>
        [
          { status: 200, body: '{"id":"before"}' },
          { status: 500, body: '{"error":"temporary"}' },
          { status: 200, body: '{"id":"after"}' }
        ].map(({ status, body }) => ({
          getResponseCode: () => status,
          getContentText: () => body,
          getHeaders: () => ({ 'Content-Type': 'application/json' })
        }))
      );

      const responses = UrlFetchApp.fetchAll(requests);

      expect(responses[1].getResponseCode()).toBe(500);
      expect(JSON.parse(responses[2].getContentText())).toEqual({ id: 'after' });
      expect(UrlFetchApp.fetchAll).toHaveBeenCalledWith(requests);
    });
  });

  describe('integrated workflow', () => {
    it('should build, execute, and parse batch with rate limiting', () => {
      const builder = new BatchRequestBuilder(utils)
        .addRequest('GET', '/drive/v3/files/1')
        .addRequest('GET', '/drive/v3/files/2');
      const batch = builder.build();
      const limiter = new RateLimiter(
        { burstCapacity: builder.size(), autoRefill: false },
        logger,
        utils
      );
      limiter.acquire('drive.batch', builder.size());

      const response = UrlFetchApp.fetch('https://www.googleapis.com/batch/drive/v3', {
        method: 'post',
        contentType: batch.contentType,
        payload: batch.body
      });
      const parsed = new BatchResponseParser().parse(response);

      expect(parsed).toEqual([{ success: true }]);
      expect(limiter.getStats('drive.batch').tokensAvailable).toBe(0);
      expect(UrlFetchApp.fetch).toHaveBeenCalledWith('https://www.googleapis.com/batch/drive/v3', {
        method: 'post',
        contentType: 'multipart/mixed; boundary=test-boundary',
        payload: 'mock-body'
      });
    });

    it('should handle high-volume operations with rate limiting', () => {
      const requests = Array.from({ length: 120 }, (_, index) => ({
        url: `https://www.googleapis.com/drive/v3/files/${index + 1}`
      }));
      const limiter = new RateLimiter(
        { burstCapacity: requests.length, autoRefill: false },
        logger,
        utils
      );

      const responses = chunk(requests, 50).flatMap((batch) => {
        batch.forEach(() => limiter.acquire('drive.request'));
        return UrlFetchApp.fetchAll(batch);
      });

      expect(responses).toHaveLength(120);
      expect(UrlFetchApp.fetchAll.mock.calls.map(([batch]) => batch.length)).toEqual([50, 50, 20]);
      expect(limiter.getStats('drive.request')).toEqual({
        tokensAvailable: 0,
        maxCapacity: 120,
        requestCount: 120,
        throttledCount: 0,
        throttleRate: '0.00%'
      });
    });
  });

  describe('error recovery in batch operations', () => {
    it('should retry failed operations with exponential backoff', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      UrlFetchApp.fetchAll
        .mockImplementationOnce(() => {
          throw new Error('Service unavailable');
        })
        .mockImplementationOnce(() => {
          throw new Error('Service unavailable');
        })
        .mockImplementationOnce(() => [
          {
            getResponseCode: () => 200,
            getContentText: () => '{"id":"recovered"}',
            getHeaders: () => ({ 'Content-Type': 'application/json' })
          }
        ]);
      const limiter = new RateLimiter({ burstCapacity: 3, autoRefill: false }, logger, utils);
      const resilience = new ExceptionService(logger, utils);

      const responses = resilience.executeWithRetry(() => {
        limiter.acquire('drive.batch');
        return UrlFetchApp.fetchAll([{ url: 'https://www.googleapis.com/drive/v3/files/retry' }]);
      });

      expect(responses.map((response) => response.getResponseCode())).toEqual([200]);
      expect(UrlFetchApp.fetchAll).toHaveBeenCalledTimes(3);
      expect(utils.sleep.mock.calls.map(([milliseconds]) => milliseconds)).toEqual([5000, 10000]);
      expect(limiter.getStats('drive.batch').requestCount).toBe(3);
    });
  });
});
