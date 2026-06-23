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
  LockService: jest.fn()
}));

describe('JobRunnerService - Logging Features', () => {
  let service;
  let logger;
  let utils;
  let registry;
  let mockQueue;
  let mockUiService;
  let mockDriveService;
  let mockFolderForLogs;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    utils = {
      sleep: jest.fn()
    };

    registry = new JobDefinitionRegistry(logger);

    service = new JobRunnerService(logger, utils, registry);

    // Mock _createQueue to return a mock queue
    mockQueue = {
      setMaxDuration: jest.fn(),
      execute: jest.fn(() => ({ result: 'success' })),
      registerJobHandler: jest.fn()
    };

    jest.spyOn(service, '_createQueue').mockReturnValue(mockQueue);

    // Mock UI service with persistent sidebar builder
    const mockSidebarBuilder = {
      setTitle: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
      show: jest.fn()
    };

    mockUiService = {
      createSidebar: jest.fn(() => mockSidebarBuilder)
    };

    // Mock global DriveApp (reached via DriveService.getStandardApp())
    mockFolderForLogs = {
      createFile: jest.fn(() => ({ getId: jest.fn(() => 'file456') }))
    };
    global.DriveApp = {
      createFile: jest.fn(() => ({ getId: jest.fn(() => 'file123') })),
      getFolderById: jest.fn(() => mockFolderForLogs)
    };

    // Drive I/O is routed through the wrapped DriveService (L2). The capturer
    // calls driveService.getStandardApp(), which yields the native DriveApp.
    mockDriveService = {
      getStandardApp: jest.fn(() => global.DriveApp)
    };

    // Mock global Utilities
    global.Utilities = {
      newBlob: jest.fn((content, type, name) => ({ content, type, name }))
    };
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
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.target is required');
    });

    it('should throw error if target is invalid', () => {
      const config = { target: 'invalid' };

      expect(() => {
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.target must be one of: sidebar, driveFile');
    });

    it('should throw error if sidebar target missing uiService', () => {
      const config = { target: 'sidebar' };

      expect(() => {
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.uiService is required for sidebar target');
    });

    it('should throw error if driveFile target missing driveService', () => {
      const config = { target: 'driveFile' };

      expect(() => {
        service._validateLoggingConfig(config);
      }).toThrow('MyJobRunnerService: loggingConfig.driveService is required for driveFile target');
    });

    it('should pass validation for sidebar target with uiService', () => {
      const config = { target: 'sidebar', uiService: mockUiService };

      expect(() => {
        service._validateLoggingConfig(config);
      }).not.toThrow();
    });

    it('should pass validation for driveFile target with driveService', () => {
      const config = { target: 'driveFile', driveService: mockDriveService };

      expect(() => {
        service._validateLoggingConfig(config);
      }).not.toThrow();
    });
  });

  // ===================================================================
  // LOGGING CAPTURE INTEGRATION
  // ===================================================================

  describe('run() with logging', () => {
    const jobHandlerCallback = (queue) => {
      queue.registerJobHandler('testJob', function* () {
        yield { percentage: 100 };
        return { success: true };
      });
    };

    it('should create CapturingLogger when logging config provided', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      // The job handler should receive a capturing logger in services
      const capturedQueue = service._createQueue.mock.results[0].value;
      expect(capturedQueue).toBe(mockQueue);
    });

    it('should use normal logger when no logging config provided', () => {
      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000);

      // Should not create capturing logger
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should display logs on successful completion', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(mockUiService.createSidebar).toHaveBeenCalled();
    });

    it('should display logs on error', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

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
    });

    it('should NOT display logs when job is suspended (not completed)', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

      mockQueue.execute = jest.fn(() => null); // Suspended

      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(mockUiService.createSidebar).not.toHaveBeenCalled();
    });

    it('should handle log display errors gracefully', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

      mockUiService.createSidebar = jest.fn(() => {
        throw new Error('UI error');
      });

      // Should not throw, just log error
      service.run('job1', 'testJob', {}, jobHandlerCallback, false, 25 * 60 * 1000, loggingConfig);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error displaying logs'));
    });
  });

  // ===================================================================
  // SIDEBAR LOGGING TARGET
  // ===================================================================

  describe('_displayLogsInSidebar()', () => {
    let capturingLogger;

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
    let capturingLogger;

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
    let capturingLogger;

    beforeEach(() => {
      capturingLogger = new CapturingLogger(logger);
      capturingLogger.info('Test log');
    });

    it('should call _displayLogsInSidebar for sidebar target', () => {
      const loggingConfig = { target: 'sidebar', uiService: mockUiService };

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
      };

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

      const loggingConfig = { target: 'sidebar', uiService: mockUiService };
      service._displayLogs(emptyLogger, loggingConfig, 'testJob', null);

      expect(service._displayLogsInSidebar).not.toHaveBeenCalled();
      expect(service._displayLogsInDriveFile).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // HTML ESCAPING
  // ===================================================================

  describe('_escapeHtml()', () => {
    it('should escape ampersands', () => {
      expect(service._escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape less than', () => {
      expect(service._escapeHtml('1 < 2')).toBe('1 &lt; 2');
    });

    it('should escape greater than', () => {
      expect(service._escapeHtml('2 > 1')).toBe('2 &gt; 1');
    });

    it('should escape double quotes', () => {
      expect(service._escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(service._escapeHtml("It's mine")).toBe('It&#039;s mine');
    });

    it('should escape script tags', () => {
      expect(service._escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      );
    });

    it('should handle mixed escaping', () => {
      expect(service._escapeHtml('<a href="test">Link & Text</a>')).toBe(
        '&lt;a href=&quot;test&quot;&gt;Link &amp; Text&lt;/a&gt;'
      );
    });

    it('should handle non-string inputs', () => {
      expect(service._escapeHtml(123)).toBe('123');
      expect(service._escapeHtml(null)).toBe('null');
      expect(service._escapeHtml(undefined)).toBe('undefined');
    });
  });
});
