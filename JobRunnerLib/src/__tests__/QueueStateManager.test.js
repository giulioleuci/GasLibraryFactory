// ===================================================================
// FILE: JobRunnerLib/src/__tests__/QueueStateManager.test.js
// ===================================================================
// Direct unit tests for QueueStateManager (ScriptProperties-based state
// tracking, optimistic-concurrency versioning, lock acquisition, retry
// counters, failure-info persistence). This is the low-level mechanism
// ALDO's long-job checkpointing relies on, so serialization/deserialization
// and resume semantics are exercised directly here (JobQueue.execute's own
// 173-line orchestration is already covered by JobQueue.test.js).
// ===================================================================

import { QueueStateManager } from '../QueueStateManager';
import { MockFactory } from '../../../test/fakes/MockFactory';

describe('QueueStateManager', () => {
  let propertiesService;
  let utils;
  let lockService;
  let manager;

  beforeEach(() => {
    const mocks = MockFactory.createAllJest();
    propertiesService = mocks.propertiesService;
    utils = mocks.utils;
    lockService = mocks.lockService;
    manager = new QueueStateManager('job-a', propertiesService, utils, lockService);
  });

  describe('constructor validation', () => {
    it('throws when jobName missing', () => {
      expect(() => new QueueStateManager('', propertiesService, utils, lockService)).toThrow(
        'jobName is required'
      );
    });

    it('throws when propertiesService missing', () => {
      expect(() => new QueueStateManager('job-a', null, utils, lockService)).toThrow(
        'propertiesService is required'
      );
    });

    it('throws when propertiesService lacks getProperty/setProperty', () => {
      expect(() => new QueueStateManager('job-a', {}, utils, lockService)).toThrow(
        'propertiesService must have getProperty and setProperty methods'
      );
    });

    it('throws when utils missing', () => {
      expect(() => new QueueStateManager('job-a', propertiesService, null, lockService)).toThrow(
        'utils is required'
      );
    });

    it('throws when utils lacks sleep', () => {
      expect(() => new QueueStateManager('job-a', propertiesService, {}, lockService)).toThrow(
        'utils must have a sleep method'
      );
    });

    it('throws when lockService missing', () => {
      expect(() => new QueueStateManager('job-a', propertiesService, utils, null)).toThrow(
        'lockService is required'
      );
    });

    it('throws when lockService lacks getScriptLock', () => {
      expect(() => new QueueStateManager('job-a', propertiesService, utils, {})).toThrow(
        'lockService must have a getScriptLock method'
      );
    });
  });

  describe('key namespacing', () => {
    it('scopes ScriptProperties keys by jobName so two jobs never collide', () => {
      const other = new QueueStateManager('job-b', propertiesService, utils, lockService);

      manager.setState('running');
      other.setState('failed');

      expect(manager.getState()).toBe('running');
      expect(other.getState()).toBe('failed');
      expect(propertiesService.getProperty('job_job-a')).toBe('running');
      expect(propertiesService.getProperty('job_job-b')).toBe('failed');
    });
  });

  describe('state get/set round-trip', () => {
    it('returns null before any state is set', () => {
      expect(manager.getState()).toBeNull();
    });

    it('persists and returns the state that was set', () => {
      manager.setState(QueueStateManager.STATE_RUNNING);
      expect(manager.getState()).toBe('running');
    });

    it('isCancelled reflects the cancelled state only', () => {
      expect(manager.isCancelled()).toBe(false);
      manager.setState(QueueStateManager.STATE_CANCELLED);
      expect(manager.isCancelled()).toBe(true);
    });
  });

  describe('versioning / optimistic concurrency', () => {
    it('starts at version 0', () => {
      expect(manager.getStateVersion()).toBe(0);
    });

    it('increments version on every unconditional setState', () => {
      manager.setState('running');
      expect(manager.getStateVersion()).toBe(1);
      manager.setState('completed');
      expect(manager.getStateVersion()).toBe(2);
    });

    it('rejects a write when expectedVersion does not match current version (no data changed)', () => {
      manager.setState('running'); // version -> 1
      const ok = manager.setState('completed', 0); // stale expectation
      expect(ok).toBe(false);
      expect(manager.getState()).toBe('running');
      expect(manager.getStateVersion()).toBe(1);
    });

    it('accepts a write when expectedVersion matches current version', () => {
      manager.setState('running'); // version -> 1
      const ok = manager.setState('completed', 1);
      expect(ok).toBe(true);
      expect(manager.getState()).toBe('completed');
      expect(manager.getStateVersion()).toBe(2);
    });

    it('getStateWithVersion returns a consistent snapshot', () => {
      manager.setState('running');
      expect(manager.getStateWithVersion()).toEqual({ state: 'running', version: 1 });
    });

    it('simulates concurrent-writer detection: second writer using a stale version loses', () => {
      manager.setState('running'); // v1, simulates writer A's checkpoint
      const { version: writerBBaseVersion } = manager.getStateWithVersion();

      // Writer A checkpoints again, moving version forward without B's knowledge
      manager.setState('running'); // v2

      // Writer B now tries to commit based on the stale version it read
      const writerBResult = manager.setState('completed', writerBBaseVersion);
      expect(writerBResult).toBe(false);
      expect(manager.getState()).toBe('running');
    });
  });

  describe('tryAcquireRunning / releaseLock', () => {
    it('acquires the running lock on first attempt and records a timestamp', () => {
      const ok = manager.tryAcquireRunning();
      expect(ok).toBe(true);
      expect(manager.getState()).toBe('running');
      expect(propertiesService.getProperty('lock_timestamp_job-a')).not.toBeNull();
    });

    it('fails to acquire when already running and lock is fresh', () => {
      manager.tryAcquireRunning();
      const second = manager.tryAcquireRunning();
      expect(second).toBe(false);
    });

    it('allows re-acquisition once the previous lock timestamp is stale (> 1h)', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      propertiesService.setProperty('job_job-a', 'running');
      propertiesService.setProperty('lock_timestamp_job-a', String(twoHoursAgo));

      const ok = manager.tryAcquireRunning();
      expect(ok).toBe(true);
    });

    it('treats a running state with no timestamp as immediately re-acquirable', () => {
      propertiesService.setProperty('job_job-a', 'running');
      const ok = manager.tryAcquireRunning();
      expect(ok).toBe(true);
    });

    it('returns false when the script lock cannot be obtained (contention)', () => {
      lockService.getScriptLock.mockReturnValueOnce({
        tryLock: jest.fn(() => false),
        releaseLock: jest.fn()
      });
      const ok = manager.tryAcquireRunning();
      expect(ok).toBe(false);
    });

    it('always releases the script lock, even though it holds it only during the check', () => {
      manager.tryAcquireRunning();
      expect(lockService._lock.releaseLock).toHaveBeenCalled();
    });

    it('releaseLock clears the lock timestamp so a fresh acquire is possible again', () => {
      manager.tryAcquireRunning();
      manager.releaseLock();
      expect(propertiesService.getProperty('lock_timestamp_job-a')).toBeNull();
    });
  });

  describe('retry counter', () => {
    it('starts at 0', () => {
      expect(manager.getRetryCount()).toBe(0);
    });

    it('increments and persists the retry count', () => {
      expect(manager.incrementRetryCount()).toBe(1);
      expect(manager.incrementRetryCount()).toBe(2);
      expect(manager.getRetryCount()).toBe(2);
    });

    it('resets the retry count', () => {
      manager.incrementRetryCount();
      manager.resetRetryCount();
      expect(manager.getRetryCount()).toBe(0);
    });
  });

  describe('failure info persistence', () => {
    it('returns undefined/null when nothing saved yet', () => {
      expect(manager.getFailureInfo()).toBeFalsy();
    });

    it('round-trips a failure info object', () => {
      const info = { reason: 'FATAL_ERROR', error: 'boom', retryCount: 3, timestamp: 12345 };
      manager.saveFailureInfo(info);
      expect(manager.getFailureInfo()).toEqual(info);
    });
  });

  describe('reset', () => {
    it('clears state, lock timestamp, retry count, failure info, and version', () => {
      manager.setState('running');
      manager.tryAcquireRunning();
      manager.incrementRetryCount();
      manager.saveFailureInfo({ reason: 'x' });

      manager.reset();

      expect(manager.getState()).toBeNull();
      expect(manager.getStateVersion()).toBe(0);
      expect(manager.getRetryCount()).toBe(0);
      expect(manager.getFailureInfo()).toBeFalsy();
      expect(propertiesService.getProperty('lock_timestamp_job-a')).toBeNull();
    });

    it('does not disturb a differently-named job sharing the same PropertiesService', () => {
      const other = new QueueStateManager('job-b', propertiesService, utils, lockService);
      other.setState('running');

      manager.setState('running');
      manager.reset();

      expect(other.getState()).toBe('running');
    });
  });
});
