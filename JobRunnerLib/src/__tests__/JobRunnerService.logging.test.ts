type LogFileStub = { getId(): string };
interface NativeLogDriveMock {
  createFile: Mock<(name: string, content: string, mimeType: string) => LogFileStub>;
  getFolderById: Mock<(id: string) => ReturnType<typeof createMockFolderForLogs>>;
}
declare const global: { DriveApp: NativeLogDriveMock };

import type { LoggingConfig } from '../types.js';
import type { JobQueue } from '../JobQueue.js';
import { jest } from '@jest/globals';
import type { MockedFunction, Mock } from 'jest-mock';
import type { JobLogger, LogSidebar } from '../types.js';
// ===================================================================
// FILE: JobRunnerLib/src/__tests__/JobRunnerService.logging.test.js
// ===================================================================
// Comprehensive test suite for JobRunnerService logging features
// Coverage: Post-execution logging with sidebar and Drive file targets
// ===================================================================

import { MyJobRunnerService as JobRunnerService } from '../JobRunnerService';
import { CapturingLogger } from '../internal/CapturingLogger';
import { JobDefinitionRegistry } from '../JobDefinitionRegistry';

// Mock GoogleApiWrapper services
jest.mock('@GoogleApiWrapper', () => ({
  PropertiesService: jest.fn(),
  TriggerService: jest.fn(),
  LockService: jest.fn(() => ({
    getScriptLock: jest.fn(() => ({
      tryLock: jest.fn(() => true),
      releaseLock: jest.fn()
    }))
  }))
}));

describe('JobRunnerService - Logging Features', () => {
  let service: JobRunnerService;
  let logger: ReturnType<typeof createLogger>;
  let utils: ReturnType<typeof createUtils>;
  let registry: JobDefinitionRegistry;
  let mockQueue: ReturnType<typeof createMockQueue>;
  let mockUiService: ReturnType<typeof createMockUiService>;
  let mockDriveService: ReturnType<typeof createMockDriveService>;
  let mockFolderForLogs: ReturnType<typeof createMockFolderForLogs>;

  beforeEach(() => {
    logger = createLogger();

    utils = createUtils();

    registry = new JobDefinitionRegistry(logger);

    service = new JobRunnerService(logger, utils, registry);

    // Mock _createQueue to return a mock queue
    mockQueue = createMockQueue();

    Object.assign(service, { _createQueue: jest.fn(() => mockQueue) });

    // Mock UI service with persistent sidebar builder
    const mockSidebarBuilder = createMockSidebarBuilder();

    mockUiService = createMockUiService(mockSidebarBuilder);

    // Mock global DriveApp (reached via DriveService.getStandardApp())
    mockFolderForLogs = createMockFolderForLogs();
    Object.assign(global, {
      DriveApp: {
        createFile: jest.fn(() => ({ getId: jest.fn(() => 'file123') })),
        getFolderById: jest.fn(() => mockFolderForLogs)
      }
    });

    // Drive I/O is routed through the wrapped DriveService (L2). The capturer
    // calls driveService.getStandardApp(), which yields the native DriveApp.
    mockDriveService = createMockDriveService();

    // Mock global Utilities
    Object.assign(global, {
      Utilities: {
        newBlob: jest.fn((content, type, name) => ({ content, type, name }))
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ===================================================================
  // LOGGING CONFIGURATION VALIDATION
  // ===================================================================

  describe('_validateLoggingConfig()', () => {
    it('should throw error if target is missing', () => {
      const config = {};

      expect(() => {
        // @ts-expect-error Deliberately incomplete or invalid config exercises the existing target guard.
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.target is required');
    });

    it('should throw error if target is invalid', () => {
      const config = { target: 'invalid' };

      expect(() => {
        // @ts-expect-error Deliberately incomplete or invalid config exercises the existing target guard.
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.target must be one of: sidebar, driveFile');
    });

    it('should throw error if sidebar target missing uiService', () => {
      const config = { target: 'sidebar' } satisfies LoggingConfig;

      expect(() => {
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.uiService is required for sidebar target');
    });

    it('should throw error if driveFile target missing driveService', () => {
      const config = { target: 'driveFile' } satisfies LoggingConfig;

      expect(() => {
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.driveService is required for driveFile target');
    });

    it('should pass validation for sidebar target with uiService', () => {
      const config = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      // Sibling negative case above ('should throw error if sidebar target
      // missing uiService') already covers the failure path for this target;
      // here we pin the real (undefined) return value of a passing call.
      expect(service._validateLoggingConfig(config)).toBeUndefined();
    });

    it('should pass validation for driveFile target with driveService', () => {
      const config = {
        target: 'driveFile',
        driveService: mockDriveService
      } satisfies LoggingConfig;

      // Sibling negative case above ('should throw error if driveFile target
      // missing driveService') already covers the failure path for this target.
      expect(service._validateLoggingConfig(config)).toBeUndefined();
    });
  });

  // ===================================================================
  // LOGGING CAPTURE INTEGRATION
  // ===================================================================

  describe('run() with logging', () => {
    const jobHandlerCallback = (queue: JobQueue) => {
      queue.registerJobHandler('testJob', function* () {
        yield { percentage: 100 };
        return { success: true };
      });
    };

    it('should create CapturingLogger when logging config provided', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      // The job handler should receive a capturing logger in services
      const capturedQueue = (service._createQueue as MockedFunction<typeof service._createQueue>)
        .mock.results[0].value;
      expect(capturedQueue).toBe(mockQueue);
      expect(logger.logJobStart).toHaveBeenCalledWith('job1', 'testJob');
      expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
      const [[loggedJobName, loggedSuccess, loggedDetails]] = logger.logJobEnd.mock.calls as [
        unknown,
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(loggedJobName).toBe('job1');
      expect(loggedSuccess).toBe(true);
      expect(Object.keys(loggedDetails)).toEqual(['durationMs']);
      expect(Number.isFinite(loggedDetails.durationMs)).toBe(true);
      expect(loggedDetails.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should use normal logger when no logging config provided', () => {
      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000);

      // Should not create capturing logger
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should display logs on successful completion', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(mockUiService.createSidebar).toHaveBeenCalled();
    });

    it('should display logs on error', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      mockQueue.execute = jest.fn(() => {
        throw new Error('Job failed');
      });

      expect(() => {
        service.run(
          'job1',
          'testJob',
          {},
          jobHandlerCallback,
          false,
          25 * 60 * 1000,
          loggingConfig
        );
      }).toThrow('Job failed');

      expect(mockUiService.createSidebar).toHaveBeenCalled();
      expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
      const [[loggedJobName, loggedSuccess, loggedDetails]] = logger.logJobEnd.mock.calls as [
        unknown,
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(loggedJobName).toBe('job1');
      expect(loggedSuccess).toBe(false);
      const { durationMs, ...restDetails } = loggedDetails;
      expect(restDetails).toEqual({ reason: 'Job failed' });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should NOT display logs when job is suspended (not completed)', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      mockQueue.execute = jest.fn(() => null); // Suspended
      mockQueue.getStatus.mockReturnValue({ state: 'to_resume', percentage: 40 });

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(mockUiService.createSidebar).not.toHaveBeenCalled();
      expect(logger.logJobSuspended).toHaveBeenCalledTimes(1);
      const [[suspendedJobName, suspendedDetails]] = logger.logJobSuspended.mock.calls as [
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(suspendedJobName).toBe('job1');
      const { durationMs, ...restSuspendedDetails } = suspendedDetails;
      expect(restSuspendedDetails).toEqual({
        reason: 'state saved; automatic resume scheduled'
      });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
      expect(logger.logJobEnd).not.toHaveBeenCalledWith('job1', true, expect.anything());
    });

    it('emits one suspension event per repeated suspended execution and never success', () => {
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state: 'to_resume', percentage: 40 });

      service.run('job1', 'testJob', {}, jobHandlerCallback);
      service.run('job1', 'testJob', {}, jobHandlerCallback);

      expect(logger.logJobSuspended).toHaveBeenCalledTimes(2);
      expect(logger.logJobEnd).not.toHaveBeenCalledWith('job1', true, expect.anything());
    });

    it('should handle log display errors gracefully', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      mockUiService.createSidebar = jest.fn(() => {
        throw new Error('UI error');
      });

      // Should not throw, just log error
      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error displaying logs'));
    });

    it('emits cancelled terminal status instead of suspension', () => {
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state: 'cancelled', percentage: 40 });

      service.run('job1', 'testJob', {}, jobHandlerCallback);

      expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
      const [[loggedJobName, loggedSuccess, loggedDetails]] = logger.logJobEnd.mock.calls as [
        unknown,
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(loggedJobName).toBe('job1');
      expect(loggedSuccess).toBe(false);
      const { durationMs, ...restDetails } = loggedDetails;
      expect(restDetails).toEqual({ reason: 'cancelled' });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
      expect(logger.logJobSuspended).not.toHaveBeenCalled();
    });

    it('emits failed terminal status returned by queue', () => {
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state: 'failed', percentage: 40 });

      service.run('job1', 'testJob', {}, jobHandlerCallback);

      expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
      const [[loggedJobName, loggedSuccess, loggedDetails]] = logger.logJobEnd.mock.calls as [
        unknown,
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(loggedJobName).toBe('job1');
      expect(loggedSuccess).toBe(false);
      const { durationMs, ...restDetails } = loggedDetails;
      expect(restDetails).toEqual({ reason: 'failed' });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
      expect(logger.logJobSuspended).not.toHaveBeenCalled();
    });
  });

  describe('resume() lifecycle', () => {
    const jobHandlerCallback = (queue: JobQueue) => {
      queue.registerJobHandler('testJob', function* () {
        return { success: true };
      });
    };

    it('emits resume checkpoint/progress and suspension without false completion', () => {
      Object.assign(service._executionController, {
        _propertiesService: {
          setProperty: jest.fn(),
          getProperty: jest.fn((key) => {
            if (key === 'type_job1') {
              return 'testJob';
            }
            if (key === 'state_job1') {
              return 'saved';
            }
            return null;
          }),
          getObjectProperty: jest.fn((key) => {
            if (key === 'state_job1') {
              return { nextIndex: 4 };
            }
            if (key === 'config_job1') {
              return {};
            }
            return null;
          })
        }
      });
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state: 'to_resume', percentage: 40 });

      service.resume('job1', jobHandlerCallback);

      expect(logger.logJobResume).toHaveBeenCalledWith(
        'job1',
        'testJob',
        expect.objectContaining({ checkpoint: 'nextIndex: 4', percentage: 40 })
      );
      expect(logger.logJobSuspended).toHaveBeenCalledTimes(1);
      const [[suspendedJobName, suspendedDetails]] = logger.logJobSuspended.mock.calls as [
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(suspendedJobName).toBe('job1');
      const { durationMs, ...restSuspendedDetails } = suspendedDetails;
      expect(restSuspendedDetails).toEqual({
        reason: 'state saved; automatic resume scheduled'
      });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
      expect(logger.logJobEnd).not.toHaveBeenCalledWith('job1', true, expect.anything());
    });
  });

  describe('optional definitions and terminal timing', () => {
    const jobHandlerCallback = (queue: JobQueue) => {
      queue.registerJobHandler('dynamic', function* () {
        return { success: true };
      });
    };

    it('runs a dynamic job without strict definition retrieval or error logging', () => {
      const getDefinitionSpy = jest.spyOn(registry, 'getDefinition');
      const jobExistsSpy = jest.spyOn(registry, 'jobExists');
      logger.error.mockClear();

      service.run('dynamic-name', 'dynamic', {}, jobHandlerCallback);

      expect(jobExistsSpy).toHaveBeenCalledWith('dynamic-name');
      expect(getDefinitionSpy).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('reports 275ms for successful completion', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValue(1275);

      service.run('dynamic-name', 'dynamic', {}, jobHandlerCallback);

      expect(logger.logJobEnd).toHaveBeenCalledWith('dynamic-name', true, {
        durationMs: 275
      });
    });

    it('reports 275ms for suspension', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValue(1275);
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state: 'to_resume', percentage: 40 });

      service.run('dynamic-name', 'dynamic', {}, jobHandlerCallback);

      expect(logger.logJobSuspended).toHaveBeenCalledWith('dynamic-name', {
        reason: 'state saved; automatic resume scheduled',
        durationMs: 275
      });
    });

    it.each(['cancelled', 'failed'])('reports 275ms for %s status', (state) => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValue(1275);
      mockQueue.execute.mockReturnValue(null);
      mockQueue.getStatus.mockReturnValue({ state, percentage: 40 });

      service.run('dynamic-name', 'dynamic', {}, jobHandlerCallback);

      expect(logger.logJobEnd).toHaveBeenCalledWith('dynamic-name', false, {
        reason: state,
        durationMs: 275
      });
    });

    it('reports 275ms when execution throws', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValue(1275);
      mockQueue.execute.mockImplementation(() => {
        throw new Error('exploded');
      });

      expect(() => service.run('dynamic-name', 'dynamic', {}, jobHandlerCallback)).toThrow(
        'exploded'
      );
      expect(logger.logJobEnd).toHaveBeenCalledWith('dynamic-name', false, {
        reason: 'exploded',
        durationMs: 275
      });
    });

    it('lets CapturingLogger preserve the scoped logger surface', () => {
      const capturingLogger = new CapturingLogger(logger);
      const position = { depth: 1, isLast: false, ancestorHasNext: [] };

      expect(capturingLogger.withPosition(position, () => 42)).toBe(42);

      // Capture the exact callback CapturingLogger forwarded and invoke it
      // directly, rather than type-checking the arg: it must be the same
      // scoped thunk that produces the real return value above.
      expect(logger.withPosition).toHaveBeenCalledTimes(1);
      const [[calledPosition, calledCallback]] = logger.withPosition.mock.calls;
      expect(calledPosition).toBe(position);
      expect(calledCallback()).toBe(42);
    });
  });

  // ===================================================================
  // SIDEBAR LOGGING TARGET
  // ===================================================================

  describe('_displayLogsInSidebar()', () => {
    let capturingLogger: CapturingLogger;

    beforeEach(() => {
      capturingLogger = new CapturingLogger(logger);
      capturingLogger.info('Test log 1');
      capturingLogger.warn('Test log 2');
      capturingLogger.error('Test log 3');
    });

    it('should create sidebar with logs', () => {
      service._displayLogsInSidebar(capturingLogger, mockUiService, 'testJob', null);

      expect(mockUiService.createSidebar).toHaveBeenCalled();
      const sidebarBuilder = mockUiService.createSidebar();
      expect(sidebarBuilder.setTitle).toHaveBeenCalledWith('Job Log: testJob');
      expect(sidebarBuilder.setContent).toHaveBeenCalled();
      expect(sidebarBuilder.setWidth).toHaveBeenCalledWith(500);
      expect(sidebarBuilder.show).toHaveBeenCalled();
    });

    it('should use green header for success', () => {
      service._displayLogsInSidebar(capturingLogger, mockUiService, 'testJob', null);

      const sidebarBuilder = mockUiService.createSidebar();
      const contentArg = sidebarBuilder.setContent.mock.calls[0][0];

      expect(contentArg).toContain('#28a745'); // Success green
      expect(contentArg).toContain('COMPLETED');
    });

    it('should use red header for error', () => {
      const error = new Error('Job failed');

      service._displayLogsInSidebar(capturingLogger, mockUiService, 'testJob', error);

      const sidebarBuilder = mockUiService.createSidebar();
      const contentArg = sidebarBuilder.setContent.mock.calls[0][0];

      expect(contentArg).toContain('#cc0000'); // Error red
      expect(contentArg).toContain('FAILED');
      expect(contentArg).toContain('Job failed');
    });

    it('should escape HTML in job name', () => {
      service._displayLogsInSidebar(
        capturingLogger,
        mockUiService,
        '<script>alert("XSS")</script>',
        null
      );

      const sidebarBuilder = mockUiService.createSidebar();
      const contentArg = sidebarBuilder.setContent.mock.calls[0][0];

      expect(contentArg).toContain('&lt;script&gt;');
      expect(contentArg).not.toContain('<script>alert');
    });

    it('should include logs as HTML', () => {
      service._displayLogsInSidebar(capturingLogger, mockUiService, 'testJob', null);

      const sidebarBuilder = mockUiService.createSidebar();
      const contentArg = sidebarBuilder.setContent.mock.calls[0][0];

      expect(contentArg).toContain('Test log 1');
      expect(contentArg).toContain('Test log 2');
      expect(contentArg).toContain('Test log 3');
    });

    it('should log success message', () => {
      service._displayLogsInSidebar(capturingLogger, mockUiService, 'testJob', null);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Job logs displayed in sidebar')
      );
    });
  });

  // ===================================================================
  // DRIVE FILE LOGGING TARGET
  // ===================================================================

  describe('_displayLogsInDriveFile()', () => {
    let capturingLogger: CapturingLogger;

    beforeEach(() => {
      capturingLogger = new CapturingLogger(logger);
      capturingLogger.info('Test log 1');
      capturingLogger.warn('Test log 2');
    });

    it('should create file in Drive root when no folder specified', () => {
      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);

      expect(mockDriveService.getStandardApp).toHaveBeenCalled();
      expect(global.DriveApp.createFile).toHaveBeenCalled();
    });

    it('should create file in specified folder', () => {
      service._displayLogsInDriveFile(
        capturingLogger,
        mockDriveService,
        'folder123',
        'testJob',
        null
      );

      expect(global.DriveApp.getFolderById).toHaveBeenCalledWith('folder123');
      expect(mockFolderForLogs.createFile).toHaveBeenCalled();
    });

    it('should include status in filename (COMPLETED)', () => {
      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);

      const createCall = global.DriveApp.createFile.mock.calls[0];
      const filename = createCall[0];

      expect(filename).toContain('testJob');
      expect(filename).toContain('COMPLETED');
      expect(filename).toMatch(/\.txt$/);
    });

    it('should include status in filename (FAILED)', () => {
      const error = new Error('Job failed');

      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', error);

      const createCall = global.DriveApp.createFile.mock.calls[0];
      const filename = createCall[0];

      expect(filename).toContain('FAILED');
    });

    it('should include header in file content', () => {
      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);

      const createCall = global.DriveApp.createFile.mock.calls[0];
      const content = createCall[1];

      expect(content).toContain('Job Execution Log');
      expect(content).toContain('Job Name: testJob');
      expect(content).toContain('Status: COMPLETED');
      expect(content).toContain('Log Entries: 2');
    });

    it('should include error in header when failed', () => {
      const error = new Error('Job failed');

      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', error);

      const createCall = global.DriveApp.createFile.mock.calls[0];
      const content = createCall[1];

      expect(content).toContain('Error: Job failed');
    });

    it('should include logs in file content', () => {
      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);

      const createCall = global.DriveApp.createFile.mock.calls[0];
      const content = createCall[1];

      expect(content).toContain('Test log 1');
      expect(content).toContain('Test log 2');
    });

    it('should log file URL', () => {
      global.DriveApp.createFile.mockReturnValueOnce({ getId: () => 'file789' });

      service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('https://drive.google.com/file/d/file789/view')
      );
    });

    it('should handle Drive errors', () => {
      global.DriveApp.createFile.mockImplementationOnce(() => {
        throw new Error('Drive error');
      });

      expect(() => {
        service._displayLogsInDriveFile(capturingLogger, mockDriveService, null, 'testJob', null);
      }).toThrow('Drive error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error saving logs to Drive')
      );
    });
  });

  // ===================================================================
  // _displayLogs() ORCHESTRATION
  // ===================================================================

  describe('_displayLogs()', () => {
    let capturingLogger: CapturingLogger;

    beforeEach(() => {
      capturingLogger = new CapturingLogger(logger);
      capturingLogger.info('Test log');
    });

    it('should call _displayLogsInSidebar for sidebar target', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;

      jest.spyOn(service._logCapturer, '_displayLogsInSidebar').mockImplementation(() => {});

      service._displayLogs(capturingLogger, loggingConfig, 'testJob', null);

      expect(service._logCapturer._displayLogsInSidebar).toHaveBeenCalledWith(
        capturingLogger,
        mockUiService,
        'testJob',
        null
      );
    });

    it('should call _displayLogsInDriveFile for driveFile target', () => {
      const loggingConfig = {
        target: 'driveFile',
        driveService: mockDriveService,
        driveFolderId: 'folder123'
      } satisfies LoggingConfig;

      jest.spyOn(service._logCapturer, '_displayLogsInDriveFile').mockImplementation(() => {});

      service._displayLogs(capturingLogger, loggingConfig, 'testJob', null);

      expect(service._logCapturer._displayLogsInDriveFile).toHaveBeenCalledWith(
        capturingLogger,
        mockDriveService,
        'folder123',
        'testJob',
        null
      );
    });

    it('should not display if no logs captured', () => {
      const emptyLogger = new CapturingLogger(logger);

      jest.spyOn(service, '_displayLogsInSidebar');
      jest.spyOn(service, '_displayLogsInDriveFile');

      const loggingConfig = { target: 'sidebar', uiService: mockUiService } satisfies LoggingConfig;
      service._displayLogs(emptyLogger, loggingConfig, 'testJob', null);

      expect(service._displayLogsInSidebar).not.toHaveBeenCalled();
      expect(service._displayLogsInDriveFile).not.toHaveBeenCalled();
    });
  });

  // HTML escaping is now delegated to the shared CoreUtilsLib
  // HtmlSanitizer.escapeHtml (see CoreUtilsLib/src/__tests__/HtmlSanitizer.test.js);
  // JobRunnerLogCapturer no longer exposes a private _escapeHtml of its own.
});

function createLogger() {
  return {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logJobStart: jest.fn(),
    logJobResume: jest.fn(),
    logJobEnd: jest.fn(),
    logJobSuspended: jest.fn(),
    withPosition: jest.fn((_position: unknown, callback: () => unknown) =>
      callback()
    ) as MockedFunction<NonNullable<JobLogger['withPosition']>>
  };
}

function createUtils() {
  return {
    sleep: jest.fn()
  };
}

function createMockQueue() {
  return {
    setMaxDuration: jest.fn(),
    applyConfiguration: jest.fn(),
    execute: jest.fn<(...args: unknown[]) => unknown>(() => ({ result: 'success' })),
    getStatus: jest.fn(() => ({ state: 'completed', percentage: 100 })),
    registerJobHandler: jest.fn()
  };
}

function createMockSidebarBuilder() {
  return {
    setTitle: jest.fn<LogSidebar['setTitle']>().mockReturnThis(),
    setContent: jest.fn<LogSidebar['setContent']>().mockReturnThis(),
    setWidth: jest.fn<LogSidebar['setWidth']>().mockReturnThis(),
    show: jest.fn()
  };
}

function createMockUiService(mockSidebarBuilder: ReturnType<typeof createMockSidebarBuilder>) {
  return {
    createSidebar: jest.fn(() => mockSidebarBuilder)
  };
}

function createMockFolderForLogs() {
  return {
    createFile: jest.fn(() => ({ getId: jest.fn(() => 'file456') }))
  };
}

function createMockDriveService() {
  return {
    getStandardApp: jest.fn(() => global.DriveApp)
  };
}
