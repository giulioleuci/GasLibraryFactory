/**
 * @file GasProcessMonitorLib/src/__tests__/DashboardUi.test.js
 * @description Unit tests for DashboardUi
 */

import { DashboardUi } from '../DashboardUi.js';

describe('DashboardUi', () => {
  let dashboardUi;
  let mockUiService;
  let mockLogger;
  let mockSidebarBuilder;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockSidebarBuilder = {
      setTitle: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
      show: jest.fn()
    };

    mockUiService = {
      createSidebar: jest.fn(() => mockSidebarBuilder)
    };

    dashboardUi = new DashboardUi(mockUiService, mockLogger);
  });

  describe('constructor', () => {
    it('should create instance with valid dependencies', () => {
      expect(dashboardUi).toBeInstanceOf(DashboardUi);
    });

    it('should throw error if uiService is missing', () => {
      expect(() => new DashboardUi(null, mockLogger)).toThrow('uiService is required');
    });

    it('should throw error if logger is missing', () => {
      expect(() => new DashboardUi(mockUiService, null)).toThrow('logger is required');
    });
  });

  describe('createSidebar', () => {
    it('should create sidebar with default options', () => {
      dashboardUi.createSidebar('test-job');

      expect(mockUiService.createSidebar).toHaveBeenCalled();
      expect(mockSidebarBuilder.setTitle).toHaveBeenCalledWith('Process Monitor');
      expect(mockSidebarBuilder.setWidth).toHaveBeenCalledWith(300);
    });

    it('should use custom title', () => {
      dashboardUi.createSidebar('test-job', 'My Custom Title');

      expect(mockSidebarBuilder.setTitle).toHaveBeenCalledWith('My Custom Title');
    });

    it('should use custom polling interval', () => {
      dashboardUi.createSidebar('test-job', 'Title', { pollingInterval: 2000 });

      const contentCall = mockSidebarBuilder.setContent.mock.calls[0][0];
      expect(contentCall).toContain('const POLLING_INTERVAL = 2000');
    });

    it('should use custom width', () => {
      dashboardUi.createSidebar('test-job', 'Title', { width: 400 });

      expect(mockSidebarBuilder.setWidth).toHaveBeenCalledWith(400);
    });

    it('should throw error if jobId is empty', () => {
      expect(() => dashboardUi.createSidebar('')).toThrow('jobId must be a non-empty string');
      expect(() => dashboardUi.createSidebar(null)).toThrow('jobId must be a non-empty string');
    });

    it('should return SidebarBuilder for chaining', () => {
      const result = dashboardUi.createSidebar('test-job');
      expect(result).toBe(mockSidebarBuilder);
    });

    it('should embed job ID in generated HTML', () => {
      dashboardUi.createSidebar('my-special-job-123');

      const contentCall = mockSidebarBuilder.setContent.mock.calls[0][0];
      expect(contentCall).toContain("const JOB_ID = 'my-special-job-123'");
    });
  });

  describe('CSS styling', () => {
    let generatedHtml;

    beforeEach(() => {
      dashboardUi.createSidebar('test-job');
      generatedHtml = mockSidebarBuilder.setContent.mock.calls[0][0];
    });

    it('should include status color classes', () => {
      expect(generatedHtml).toContain('.status-pending');
      expect(generatedHtml).toContain('.status-running');
      expect(generatedHtml).toContain('.status-completed');
      expect(generatedHtml).toContain('.status-failed');
    });

    it('should include step status classes', () => {
      expect(generatedHtml).toContain('.step-pending');
      expect(generatedHtml).toContain('.step-running');
      expect(generatedHtml).toContain('.step-completed');
      expect(generatedHtml).toContain('.step-failed');
      expect(generatedHtml).toContain('.step-skipped');
    });

    it('should include pulse animation for running state', () => {
      expect(generatedHtml).toContain('@keyframes pulse');
    });

    it('should use Google-like font stack', () => {
      expect(generatedHtml).toContain("'Google Sans'");
      expect(generatedHtml).toContain("'Roboto'");
    });
  });

  describe('static constants', () => {
    it('should have correct default values', () => {
      expect(DashboardUi.DEFAULT_POLLING_INTERVAL).toBe(1500);
      expect(DashboardUi.DEFAULT_WIDTH).toBe(300);
    });
  });
});
