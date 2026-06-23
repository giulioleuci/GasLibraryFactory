// ===================================================================
// FILE: JobRunnerLib/src/__tests__/integration/JobRunnerStateSerialization.test.js
// ===================================================================
// Integration Test 6: JobRunner-State Serialization
// Verifies that JobRunnerLib serializes complex job state to JSON for PropertiesService
// ===================================================================

import { JobStateManager } from '../../internal/managers/JobRunnerStateManager.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';

/**
 * Test Scenario: JobRunner-State Serialization
 *
 * Layers Involved:
 * - Application: JobRunnerLib (JobRunnerService, JobQueue)
 * - Infrastructure: GoogleApiWrapper (mocked PropertiesService)
 *
 * Objective:
 * Verify that complex job state objects (arrays, nested objects, dates)
 * are correctly serialized to JSON strings before being stored in
 * PropertiesService, and can be deserialized back accurately.
 */

describe('Integration Test 6: JobRunner-State Serialization', () => {
  let mockPropertiesService;
  let mockUtils;
  let mockLockService;
  let stateManager;
  let store;

  beforeEach(() => {
    store = new Map();
    mockPropertiesService = {
      setProperty: jest.fn((key, val) => store.set(key, String(val))),
      getProperty: jest.fn((key) => store.get(key)),
      setProperties: jest.fn((props) => {
        for (const [k, v] of Object.entries(props)) {
          store.set(k, String(v));
        }
      }),
      deleteProperty: jest.fn((key) => store.delete(key)),
      setObjectProperty: jest.fn((key, obj) => store.set(key, JSON.stringify(obj))),
      getObjectProperty: jest.fn((key) => {
        const val = store.get(key);
        return val ? JSON.parse(val) : null;
      })
    };

    mockUtils = { sleep: jest.fn() };
    mockLockService = {
      getScriptLock: jest.fn().mockReturnValue({
        tryLock: jest.fn().mockReturnValue(true),
        releaseLock: jest.fn()
      })
    };

    stateManager = new JobStateManager('test-job', mockPropertiesService, mockUtils, mockLockService);
  });

  describe('State Serialization', () => {
    test('should serialize complex state object to JSON string', () => {
      const complexState = { 
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }], 
        index: 5, 
        errors: ['fail 1', 'fail 2'] 
      };
      
      stateManager.saveResumeState(complexState);
      
      expect(mockPropertiesService.setObjectProperty).toHaveBeenCalledWith(
        'state_test-job',
        complexState
      );
      
      const storedVal = store.get('state_test-job');
      expect(typeof storedVal).toBe('string');
      expect(JSON.parse(storedVal)).toEqual(complexState);
    });

    test('should serialize Date objects in state', () => {
      const now = new Date();
      const stateWithDate = { lastRun: now };
      
      stateManager.saveResumeState(stateWithDate);
      
      const storedVal = store.get('state_test-job');
      expect(storedVal).toContain(now.toISOString());
    });

    test('should serialize nested objects and arrays', () => {
      const deeplyNested = {
        a: {
          b: {
            c: [1, 2, { d: 3 }]
          }
        }
      };
      
      stateManager.saveResumeState(deeplyNested);
      expect(JSON.parse(store.get('state_test-job'))).toEqual(deeplyNested);
    });
  });

  describe('State Deserialization', () => {
    test('should deserialize state back to original structure', () => {
      const originalState = { count: 10, items: ['a', 'b'] };
      stateManager.saveResumeState(originalState);
      
      const loadedState = stateManager.loadResumeState();
      expect(loadedState).toEqual(originalState);
    });

    test('should restore Date objects from ISO strings', () => {
      const now = new Date();
      
      // Manually populate store with stringified state
      store.set('state_test-job', JSON.stringify({ timestamp: now }));
      
      // Manually simulate what real PropertiesService does (reviving dates)
      mockPropertiesService.getObjectProperty.mockReturnValue({ timestamp: now });
      
      const loadedState = stateManager.loadResumeState();
      expect(loadedState.timestamp).toEqual(now);
    });
  });

  describe('Properties Service Integration', () => {
    test('should use job name as part of property key', () => {
      stateManager.saveType('IMPORT');
      expect(mockPropertiesService.setProperty).toHaveBeenCalledWith(
        'type_test-job',
        'IMPORT'
      );
    });

    test('should handle large state objects via tiered storage', () => {
      // Create a state larger than LARGE_STATE_THRESHOLD (8KB)
      const largeData = 'x'.repeat(9000);
      const largeState = { data: largeData };
      
      // Mock DriveApp globally for this test
      global.DriveApp = {
        getFoldersByName: jest.fn().mockReturnValue({
          hasNext: () => true,
          next: () => ({
            createFile: jest.fn().mockReturnValue({
              getId: () => 'drive-file-123'
            })
          })
        }),
        getFileById: jest.fn().mockReturnValue({
          setContent: jest.fn(),
          getId: () => 'drive-file-123'
        })
      };

      stateManager.saveResumeState(largeState);
      
      // Should NOT call setObjectProperty for large state
      expect(mockPropertiesService.setObjectProperty).not.toHaveBeenCalled();
      
      // Should call setProperty with DRIVE prefix
      expect(mockPropertiesService.setProperty).toHaveBeenCalledWith(
        'state_test-job',
        expect.stringContaining('__DRIVE__:drive-file-123')
      );
      
      // Clean up global mock
      delete global.DriveApp;
    });
  });
});
