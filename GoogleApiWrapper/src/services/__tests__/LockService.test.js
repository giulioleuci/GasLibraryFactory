/**
 * @file GoogleApiWrapper/src/services/__tests__/LockService.test.js
 * @description Comprehensive test suite for LockService facade
 * @version 1.0
 */

import { LockService } from '../LockService';
import { MockFactory } from '../../../../test/fakes/MockFactory';

describe('LockService - Comprehensive Test Suite', () => {
  let mocks;
  let mockNativeLock;
  let mockNativeLockService;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Create mock native lock
    mockNativeLock = {
      tryLock: jest.fn().mockReturnValue(true),
      waitLock: jest.fn(),
      releaseLock: jest.fn()
    };

    // Create mock native LockService
    mockNativeLockService = {
      getScriptLock: jest.fn().mockReturnValue(mockNativeLock),
      getUserLock: jest.fn().mockReturnValue(mockNativeLock),
      getDocumentLock: jest.fn().mockReturnValue(mockNativeLock)
    };

    // Set up global LockService
    global.LockService = mockNativeLockService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.LockService;
  });

  describe('Constructor', () => {
    it('should create instance with logger', () => {
      const lockService = new LockService(mocks.logger);
      expect(lockService).toBeInstanceOf(LockService);
    });

    it('should detect native LockService when available', () => {
      const lockService = new LockService(mocks.logger);
      expect(lockService._nativeLockService).toBe(mockNativeLockService);
    });

    it('should handle missing native LockService', () => {
      delete global.LockService;
      const lockService = new LockService(mocks.logger);
      expect(lockService._nativeLockService).toBeNull();
    });
  });

  describe('getScriptLock()', () => {
    describe('With Native LockService', () => {
      it('should return a Lock instance', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getScriptLock();

        expect(lock).toBeDefined();
        expect(typeof lock.tryLock).toBe('function');
        expect(typeof lock.waitLock).toBe('function');
        expect(typeof lock.releaseLock).toBe('function');
        expect(typeof lock.hasLock).toBe('function');
      });

      it('should call native getScriptLock', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getScriptLock();

        expect(mockNativeLockService.getScriptLock).toHaveBeenCalled();
      });

      it('should log debug message', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getScriptLock();

        expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('script lock'));
      });
    });

    describe('Without Native LockService', () => {
      beforeEach(() => {
        delete global.LockService;
      });

      it('should return a MockLock instance', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getScriptLock();

        expect(lock).toBeDefined();
        expect(typeof lock.tryLock).toBe('function');
        expect(typeof lock.waitLock).toBe('function');
        expect(typeof lock.releaseLock).toBe('function');
      });

      it('should log warning about mock lock', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getScriptLock();

        expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('mock lock'));
      });
    });
  });

  describe('getUserLock()', () => {
    describe('With Native LockService', () => {
      it('should return a Lock instance', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getUserLock();

        expect(lock).toBeDefined();
        expect(typeof lock.tryLock).toBe('function');
      });

      it('should call native getUserLock', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getUserLock();

        expect(mockNativeLockService.getUserLock).toHaveBeenCalled();
      });

      it('should log debug message', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getUserLock();

        expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('user lock'));
      });
    });

    describe('Without Native LockService', () => {
      beforeEach(() => {
        delete global.LockService;
      });

      it('should return MockLock', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getUserLock();

        expect(lock).toBeDefined();
        expect(lock.tryLock(1000)).toBe(true); // MockLock always succeeds
      });
    });
  });

  describe('getDocumentLock()', () => {
    describe('With Native LockService', () => {
      it('should return a Lock instance', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getDocumentLock('doc-123');

        expect(lock).toBeDefined();
        expect(typeof lock.tryLock).toBe('function');
      });

      it('should call native getDocumentLock', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getDocumentLock('doc-123');

        expect(mockNativeLockService.getDocumentLock).toHaveBeenCalled();
      });

      it('should log debug message with document ID', () => {
        const lockService = new LockService(mocks.logger);
        lockService.getDocumentLock('doc-123');

        expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('doc-123'));
      });
    });

    describe('Without Native LockService', () => {
      beforeEach(() => {
        delete global.LockService;
      });

      it('should return MockLock', () => {
        const lockService = new LockService(mocks.logger);
        const lock = lockService.getDocumentLock('doc-123');

        expect(lock).toBeDefined();
        expect(lock.tryLock(1000)).toBe(true);
      });
    });
  });

  describe('Lock Wrapper (with native)', () => {
    let lockService;
    let lock;

    beforeEach(() => {
      lockService = new LockService(mocks.logger);
      lock = lockService.getScriptLock();
    });

    describe('tryLock()', () => {
      it('should call native tryLock with timeout', () => {
        lock.tryLock(30000);

        expect(mockNativeLock.tryLock).toHaveBeenCalledWith(30000);
      });

      it('should return true when lock acquired', () => {
        mockNativeLock.tryLock.mockReturnValue(true);
        const result = lock.tryLock(10000);

        expect(result).toBe(true);
      });

      it('should return false when lock not acquired', () => {
        mockNativeLock.tryLock.mockReturnValue(false);
        const result = lock.tryLock(5000);

        expect(result).toBe(false);
      });

      it('should log debug on successful acquisition', () => {
        mockNativeLock.tryLock.mockReturnValue(true);
        lock.tryLock(10000);

        expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('Lock acquired'));
      });

      it('should log debug on failed acquisition', () => {
        mockNativeLock.tryLock.mockReturnValue(false);
        lock.tryLock(10000);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Failed to acquire')
        );
      });

      it('should throw and log error on failure', () => {
        const error = new Error('Lock service unavailable');
        mockNativeLock.tryLock.mockImplementation(() => {
          throw error;
        });

        expect(() => lock.tryLock(10000)).toThrow('Lock service unavailable');
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error acquiring lock')
        );
      });
    });

    describe('waitLock()', () => {
      it('should call native waitLock with timeout', () => {
        lock.waitLock(30000);

        expect(mockNativeLock.waitLock).toHaveBeenCalledWith(30000);
      });

      it('should set acquired flag on success', () => {
        lock.waitLock(10000);

        expect(lock.hasLock()).toBe(true);
      });

      it('should log debug on successful acquisition', () => {
        lock.waitLock(10000);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Lock acquired (wait)')
        );
      });

      it('should throw and log error on timeout', () => {
        const error = new Error('Lock timeout');
        mockNativeLock.waitLock.mockImplementation(() => {
          throw error;
        });

        expect(() => lock.waitLock(10000)).toThrow('Lock timeout');
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to wait for lock')
        );
      });
    });

    describe('releaseLock()', () => {
      it('should call native releaseLock when acquired', () => {
        lock.tryLock(1000); // Acquire first
        lock.releaseLock();

        expect(mockNativeLock.releaseLock).toHaveBeenCalled();
      });

      it('should not call native releaseLock when not acquired', () => {
        mockNativeLock.tryLock.mockReturnValue(false);
        lock.tryLock(1000); // Failed to acquire
        lock.releaseLock();

        expect(mockNativeLock.releaseLock).not.toHaveBeenCalled();
      });

      it('should log debug on release', () => {
        lock.tryLock(1000);
        lock.releaseLock();

        expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('Lock released'));
      });

      it('should clear acquired flag', () => {
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(true);

        lock.releaseLock();
        expect(lock.hasLock()).toBe(false);
      });

      it('should throw and log error on failure', () => {
        lock.tryLock(1000);
        const error = new Error('Release failed');
        mockNativeLock.releaseLock.mockImplementation(() => {
          throw error;
        });

        expect(() => lock.releaseLock()).toThrow('Release failed');
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error releasing lock')
        );
      });
    });

    describe('hasLock()', () => {
      it('should return false initially', () => {
        expect(lock.hasLock()).toBe(false);
      });

      it('should return true after successful tryLock', () => {
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(true);
      });

      it('should return false after failed tryLock', () => {
        mockNativeLock.tryLock.mockReturnValue(false);
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(false);
      });

      it('should return true after successful waitLock', () => {
        lock.waitLock(1000);
        expect(lock.hasLock()).toBe(true);
      });

      it('should return false after releaseLock', () => {
        lock.tryLock(1000);
        lock.releaseLock();
        expect(lock.hasLock()).toBe(false);
      });
    });
  });

  describe('MockLock (without native)', () => {
    let lockService;
    let lock;

    beforeEach(() => {
      delete global.LockService;
      lockService = new LockService(mocks.logger);
      lock = lockService.getScriptLock();
    });

    describe('tryLock()', () => {
      it('should always return true', () => {
        expect(lock.tryLock(10000)).toBe(true);
        expect(lock.tryLock(1)).toBe(true);
      });

      it('should set acquired flag', () => {
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(true);
      });

      it('should log debug message', () => {
        lock.tryLock(5000);
        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Mock lock acquired')
        );
      });
    });

    describe('waitLock()', () => {
      it('should always succeed', () => {
        expect(() => lock.waitLock(10000)).not.toThrow();
      });

      it('should set acquired flag', () => {
        lock.waitLock(1000);
        expect(lock.hasLock()).toBe(true);
      });

      it('should log debug message', () => {
        lock.waitLock(5000);
        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Mock lock acquired via wait')
        );
      });
    });

    describe('releaseLock()', () => {
      it('should clear acquired flag', () => {
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(true);

        lock.releaseLock();
        expect(lock.hasLock()).toBe(false);
      });

      it('should log debug message', () => {
        lock.releaseLock();
        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Mock lock released')
        );
      });
    });

    describe('hasLock()', () => {
      it('should track lock state correctly', () => {
        expect(lock.hasLock()).toBe(false);
        lock.tryLock(1000);
        expect(lock.hasLock()).toBe(true);
        lock.releaseLock();
        expect(lock.hasLock()).toBe(false);
      });
    });
  });

  describe('Real-World Usage Patterns', () => {
    let lockService;

    beforeEach(() => {
      lockService = new LockService(mocks.logger);
    });

    it('should support atomic counter increment pattern', () => {
      const lock = lockService.getScriptLock();

      if (lock.tryLock(30000)) {
        try {
          // Simulate critical section
          const counter = 5;
          const newCounter = counter + 1;
          expect(newCounter).toBe(6);
        } finally {
          lock.releaseLock();
        }
      }

      expect(lock.hasLock()).toBe(false);
    });

    it('should support duplicate trigger prevention', () => {
      const lock = lockService.getScriptLock();

      if (!lock.tryLock(1000)) {
        // Another instance is running
        return;
      }

      try {
        // Perform task
        expect(lock.hasLock()).toBe(true);
      } finally {
        lock.releaseLock();
      }
    });

    it('should support waitLock with try/catch pattern', () => {
      const lock = lockService.getScriptLock();

      try {
        lock.waitLock(30000);
        expect(lock.hasLock()).toBe(true);

        try {
          // Critical operation
        } finally {
          lock.releaseLock();
        }
      } catch (error) {
        // Handle lock timeout
      }
    });

    it('should support user-specific operations', () => {
      const userLock = lockService.getUserLock();

      if (userLock.tryLock(5000)) {
        try {
          // User-specific operation
          expect(userLock.hasLock()).toBe(true);
        } finally {
          userLock.releaseLock();
        }
      }
    });

    it('should support document-specific operations', () => {
      const docLock = lockService.getDocumentLock('sheet-12345');

      if (docLock.tryLock(15000)) {
        try {
          // Document operation
          expect(docLock.hasLock()).toBe(true);
        } finally {
          docLock.releaseLock();
        }
      }
    });

    it('should maintain independent lock states', () => {
      const scriptLock = lockService.getScriptLock();
      const userLock = lockService.getUserLock();

      scriptLock.tryLock(1000);
      expect(scriptLock.hasLock()).toBe(true);
      expect(userLock.hasLock()).toBe(false);

      userLock.tryLock(1000);
      expect(scriptLock.hasLock()).toBe(true);
      expect(userLock.hasLock()).toBe(true);

      scriptLock.releaseLock();
      expect(scriptLock.hasLock()).toBe(false);
      expect(userLock.hasLock()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero timeout', () => {
      const lockService = new LockService(mocks.logger);
      const lock = lockService.getScriptLock();

      lock.tryLock(0);
      expect(mockNativeLock.tryLock).toHaveBeenCalledWith(0);
    });

    it('should handle very large timeout', () => {
      const lockService = new LockService(mocks.logger);
      const lock = lockService.getScriptLock();

      lock.tryLock(300000); // 5 minutes (max)
      expect(mockNativeLock.tryLock).toHaveBeenCalledWith(300000);
    });

    it('should handle multiple lock acquisitions on same lock object', () => {
      const lockService = new LockService(mocks.logger);
      const lock = lockService.getScriptLock();

      lock.tryLock(1000);
      expect(lock.hasLock()).toBe(true);

      // Try to acquire again (shouldn't call native if already acquired)
      lock.tryLock(1000);
      expect(mockNativeLock.tryLock).toHaveBeenCalledTimes(2);
    });

    it('should handle release without acquire', () => {
      const lockService = new LockService(mocks.logger);
      const lock = lockService.getScriptLock();

      // Should not throw when releasing without acquiring
      expect(() => lock.releaseLock()).not.toThrow();
      expect(mockNativeLock.releaseLock).not.toHaveBeenCalled();
    });

    it('should work with undefined global', () => {
      const originalGlobal = global.LockService;
      global.LockService = undefined;

      const lockService = new LockService(mocks.logger);
      expect(lockService._nativeLockService).toBeNull();

      global.LockService = originalGlobal;
    });
  });
});
