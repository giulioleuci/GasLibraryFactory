// ===================================================================
// FILE: JobRunnerLib/src/__tests__/QueuePersistenceHandler.test.js
// ===================================================================
// Direct unit tests for QueuePersistenceHandler: resume-state
// serialization/deserialization, the small-state-in-ScriptProperties vs
// large-state-on-Drive tiering (JobRunnerLib/src/internal/QueuePersistenceHandler.js
// @ LARGE_STATE_THRESHOLD), configuration/type persistence, and reset/cleanup.
// This is the exact checkpoint/resume mechanism ALDO's long-running jobs rely
// on to survive GAS's 6/30 min execution caps, so corruption or mishandling
// here is silent data loss for resumed jobs.
// ===================================================================

import { QueuePersistenceHandler } from '../internal/QueuePersistenceHandler';
import { QueueStateManager } from '../QueueStateManager';
import { MockFactory } from '../../../test/fakes/MockFactory';

/** Minimal in-memory fake Drive, independent of GoogleApiWrapper's ServiceFactory wiring. */
function createFakeDriveApp() {
  const files = new Map();
  let nextId = 1;
  const folders = new Map();

  const makeFile = (id, content) => ({
    id,
    content,
    getId: () => id,
    setContent: jest.fn(function (c) {
      this.content = c;
      files.set(id, this);
    }),
    getBlob: () => ({
      getDataAsString: () => files.get(id).content
    }),
    setTrashed: jest.fn()
  });

  const makeFolder = (name) => ({
    name,
    createFile: jest.fn((fileName, content) => {
      const id = `file-${nextId++}`;
      const file = makeFile(id, content);
      files.set(id, file);
      return file;
    })
  });

  return {
    _files: files,
    getFileById: jest.fn((id) => {
      const f = files.get(id);
      if (!f) {
        throw new Error(`No such file: ${id}`);
      }
      return f;
    }),
    getFoldersByName: jest.fn((name) => {
      const existing = folders.get(name);
      const list = existing ? [existing] : [];
      let idx = 0;
      return {
        hasNext: () => idx < list.length,
        next: () => list[idx++]
      };
    }),
    createFolder: jest.fn((name) => {
      const folder = makeFolder(name);
      folders.set(name, folder);
      return folder;
    })
  };
}

function createFakeDriveService(driveApp) {
  return { getStandardApp: jest.fn(() => driveApp) };
}

describe('QueuePersistenceHandler', () => {
  let propertiesService;
  let utils;
  let lockService;
  let stateManager;
  let driveApp;
  let driveService;
  let handler;

  beforeEach(() => {
    const mocks = MockFactory.createAllJest();
    propertiesService = mocks.propertiesService;
    utils = mocks.utils;
    lockService = mocks.lockService;
    stateManager = new QueueStateManager('job-a', propertiesService, utils, lockService);
    driveApp = createFakeDriveApp();
    driveService = createFakeDriveService(driveApp);
    handler = new QueuePersistenceHandler('job-a', propertiesService, stateManager, driveService);
  });

  describe('constructor validation', () => {
    it('throws when jobName missing', () => {
      expect(() => new QueuePersistenceHandler('', propertiesService, stateManager)).toThrow(
        'jobName is required'
      );
    });

    it('throws when propertiesService missing', () => {
      expect(() => new QueuePersistenceHandler('job-a', null, stateManager)).toThrow(
        'propertiesService is required'
      );
    });
  });

  describe('resume state: small-state round-trip (ScriptProperties tier)', () => {
    it('returns null when nothing was ever saved', () => {
      expect(handler.loadResumeState()).toBeNull();
    });

    it('saves and loads a small object as-is via ScriptProperties JSON', () => {
      const state = { position: 42, items: ['a', 'b'] };
      handler.saveResumeState(state);
      expect(handler.loadResumeState()).toEqual(state);
      // Confirms tier: stored inline, not routed to Drive.
      expect(propertiesService.getProperty('state_size_job-a')).toBeNull();
    });

    it('overwrites a previous small state on subsequent checkpoints (resume from latest)', () => {
      handler.saveResumeState({ position: 1 });
      handler.saveResumeState({ position: 2 });
      expect(handler.loadResumeState()).toEqual({ position: 2 });
    });

    it('keeps distinct jobs isolated in ScriptProperties', () => {
      const other = new QueuePersistenceHandler(
        'job-b',
        propertiesService,
        stateManager,
        driveService
      );
      handler.saveResumeState({ position: 1 });
      other.saveResumeState({ position: 999 });
      expect(handler.loadResumeState()).toEqual({ position: 1 });
      expect(other.loadResumeState()).toEqual({ position: 999 });
    });
  });

  describe('resume state: large-state tiering to Drive', () => {
    it('routes state above LARGE_STATE_THRESHOLD to Drive and stores a pointer', () => {
      const bigArray = new Array(QueuePersistenceHandler.LARGE_STATE_THRESHOLD).fill('x');
      const bigState = { blob: bigArray.join('') };

      handler.saveResumeState(bigState);

      const pointer = propertiesService.getProperty('state_job-a');
      expect(pointer).toMatch(/^__DRIVE__:/);
      expect(propertiesService.getProperty('state_size_job-a')).not.toBeNull();
      expect(driveApp.createFolder).toHaveBeenCalledWith('JobRunnerStates');
    });

    it('loads large state back from Drive transparently through loadResumeState', () => {
      const bigState = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      handler.saveResumeState(bigState);

      const loaded = handler.loadResumeState();
      expect(loaded).toEqual(bigState);
    });

    it('reuses (overwrites) the same Drive file on repeated large-state checkpoints', () => {
      const bigState1 = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      const bigState2 = { blob: 'z'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };

      handler.saveResumeState(bigState1);
      const fileIdAfterFirst = propertiesService.getProperty('state_file_id_job-a');

      handler.saveResumeState(bigState2);
      const fileIdAfterSecond = propertiesService.getProperty('state_file_id_job-a');

      expect(fileIdAfterSecond).toBe(fileIdAfterFirst);
      expect(handler.loadResumeState()).toEqual(bigState2);
      // Exactly one createFile call across two large checkpoints -> in-place update, not duplication.
      expect(driveApp.getFoldersByName('JobRunnerStates').next().createFile).toHaveBeenCalledTimes(
        1
      );
    });

    it('transitioning from a large checkpoint back to a small one switches tiers cleanly', () => {
      const bigState = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      handler.saveResumeState(bigState);
      expect(propertiesService.getProperty('state_job-a')).toMatch(/^__DRIVE__:/);

      handler.saveResumeState({ position: 1 });
      expect(propertiesService.getProperty('state_job-a')).not.toMatch(/^__DRIVE__:/);
      expect(propertiesService.getProperty('state_size_job-a')).toBeNull();
      expect(handler.loadResumeState()).toEqual({ position: 1 });
    });

    it('throws a clear error when Drive is unavailable and a large state must be saved', () => {
      const handlerNoDrive = new QueuePersistenceHandler('job-a', propertiesService, stateManager, {
        getStandardApp: () => undefined
      });
      const bigState = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      expect(() => handlerNoDrive.saveResumeState(bigState)).toThrow(
        'DriveApp not available - cannot save large state'
      );
    });

    it('throws a clear error when the pointed-to Drive file cannot be loaded (corrupted/missing pointer)', () => {
      propertiesService.setProperty('state_job-a', '__DRIVE__:does-not-exist');
      expect(() => handler.loadResumeState()).toThrow(/Failed to load state from Drive file/);
    });
  });

  describe('resume state: malformed / missing stored state', () => {
    it('propagates a parse error for corrupted JSON in the small-state slot (caller must handle)', () => {
      propertiesService.setProperty('state_job-a', '{not-valid-json');
      expect(() => handler.loadResumeState()).toThrow();
    });

    it('treats an empty-string stored value the same as missing state', () => {
      propertiesService.setProperty('state_job-a', '');
      expect(handler.loadResumeState()).toBeNull();
    });
  });

  describe('batchSave', () => {
    it('writes only the provided keys, leaving others untouched', () => {
      handler.batchSave({ progress: { pct: 10 } });
      expect(propertiesService.getProperty('progress_job-a')).toBe(JSON.stringify({ pct: 10 }));
      expect(propertiesService.getProperty('state_job-a')).toBeNull();
      expect(propertiesService.getProperty('type_job-a')).toBeNull();
    });

    it('is a no-op (does not call setProperties) for an empty updates object', () => {
      handler.batchSave({});
      expect(propertiesService.setProperties).not.toHaveBeenCalled();
    });

    it('bumps the version key based on the injected stateManager when state is included', () => {
      stateManager.setState('running'); // version -> 1
      handler.batchSave({ state: 'completed' });
      expect(propertiesService.getProperty('job_job-a')).toBe('completed');
      expect(propertiesService.getProperty('version_job-a')).toBe('2');
    });

    it('defaults to version 0 basis when constructed without a stateManager', () => {
      const bare = new QueuePersistenceHandler('job-c', propertiesService);
      bare.batchSave({ state: 'running' });
      expect(propertiesService.getProperty('version_job-c')).toBe('1');
    });

    it('can persist resumeState, progress, config, type, and state together in one call', () => {
      handler.batchSave({
        resumeState: { position: 5 },
        progress: { pct: 50 },
        config: { maxRetries: 2 },
        type: 'importJob',
        state: 'running'
      });

      expect(handler.loadResumeState()).toEqual({ position: 5 });
      expect(propertiesService.getProperty('progress_job-a')).toBe(JSON.stringify({ pct: 50 }));
      expect(handler.loadConfiguration()).toEqual({ maxRetries: 2 });
      expect(handler.loadType()).toBe('importJob');
      expect(propertiesService.getProperty('job_job-a')).toBe('running');
    });
  });

  describe('configuration and type persistence', () => {
    it('round-trips configuration objects', () => {
      handler.saveConfiguration({ maxRetries: 3, batchSize: 100 });
      expect(handler.loadConfiguration()).toEqual({ maxRetries: 3, batchSize: 100 });
    });

    it('returns an empty object when no configuration was ever saved', () => {
      expect(handler.loadConfiguration()).toEqual({});
    });

    it('round-trips job type', () => {
      handler.saveType('importJob');
      expect(handler.loadType()).toBe('importJob');
    });

    it('returns null/undefined type when none saved', () => {
      expect(handler.loadType()).toBeFalsy();
    });
  });

  describe('reset', () => {
    it('clears state, type, config, and tiering metadata keys', () => {
      handler.saveResumeState({ position: 1 });
      handler.saveType('importJob');
      handler.saveConfiguration({ maxRetries: 1 });

      handler.reset();

      expect(handler.loadResumeState()).toBeNull();
      expect(handler.loadType()).toBeFalsy();
      expect(handler.loadConfiguration()).toEqual({});
    });

    it('trashes the backing Drive file when the state was tiered to Drive', () => {
      const bigState = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      handler.saveResumeState(bigState);
      const fileId = propertiesService.getProperty('state_file_id_job-a');

      handler.reset();

      const trashedFile = driveApp.getFileById(fileId);
      expect(trashedFile.setTrashed).toHaveBeenCalledWith(true);
    });

    it('does not throw when reset is called with no prior state at all', () => {
      expect(() => handler.reset()).not.toThrow();
    });

    it('does not throw even if the Drive cleanup itself fails (best-effort)', () => {
      const bigState = { blob: 'y'.repeat(QueuePersistenceHandler.LARGE_STATE_THRESHOLD) };
      handler.saveResumeState(bigState);
      driveApp.getFileById.mockImplementationOnce(() => {
        throw new Error('drive down');
      });
      expect(() => handler.reset()).not.toThrow();
    });
  });
});
