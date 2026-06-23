// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/UiService.test.js
// ===================================================================
// Comprehensive test suite for UiService
// Coverage: UI facade operations, menu/sidebar/dialog builders
// ===================================================================

import { UiService } from '../UiService';
import { MenuBuilder } from '../../builders/MenuBuilder';
import { SidebarBuilder } from '../../builders/SidebarBuilder';
import { DialogBuilder } from '../../builders/DialogBuilder';

describe('UiService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let cache;
  let utils;
  let exceptionService;
  let mockUi;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    cache = {
      get: jest.fn(() => null),
      put: jest.fn(),
      remove: jest.fn()
    };

    utils = {
      sleep: jest.fn()
    };

    exceptionService = {
      executeWithRetry: jest.fn((fn) => fn())
    };

    mockUi = {
      alert: jest.fn(() => 'OK'),
      prompt: jest.fn(() => ({
        getSelectedButton: jest.fn(() => 'OK'),
        getResponseText: jest.fn(() => 'test response')
      })),
      createMenu: jest.fn(() => ({
        addItem: jest.fn().mockReturnThis(),
        addSeparator: jest.fn().mockReturnThis(),
        addSubMenu: jest.fn().mockReturnThis(),
        addToUi: jest.fn()
      })),
      showSidebar: jest.fn(),
      showModalDialog: jest.fn(),
      Button: {
        OK: 'OK',
        CANCEL: 'CANCEL',
        YES: 'YES',
        NO: 'NO',
        CLOSE: 'CLOSE'
      },
      ButtonSet: {
        OK: 'OK',
        OK_CANCEL: 'OK_CANCEL',
        YES_NO: 'YES_NO',
        YES_NO_CANCEL: 'YES_NO_CANCEL'
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with all dependencies and provided UI', () => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);

      expect(service._logger).toBe(logger);
      expect(service._cache).toBe(cache);
      expect(service._utils).toBe(utils);
      expect(service._exceptionService).toBe(exceptionService);
      expect(service._ui).toBe(mockUi);
    });

    it('should throw error if UI cannot be detected and none provided', () => {
      // Mock all UI detection methods to fail
      global.SpreadsheetApp = undefined;
      global.DocumentApp = undefined;
      global.FormApp = undefined;
      global.SlidesApp = undefined;

      expect(() => {
        new UiService(logger, cache, utils, exceptionService);
      }).toThrow('UiService: Unable to detect UI object');
    });

    it('should auto-detect SpreadsheetApp UI when available', () => {
      global.SpreadsheetApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(service._ui).toBe(mockUi);
      expect(global.SpreadsheetApp.getUi).toHaveBeenCalled();
    });

    it('should auto-detect DocumentApp UI when SpreadsheetApp not available', () => {
      global.SpreadsheetApp = undefined;
      global.DocumentApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(service._ui).toBe(mockUi);
      expect(global.DocumentApp.getUi).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // MENU OPERATIONS
  // ===================================================================

  describe('createMenu()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should create MenuBuilder with correct caption', () => {
      const menuBuilder = service.createMenu('My Menu');

      expect(menuBuilder).toBeInstanceOf(MenuBuilder);
      expect(menuBuilder._caption).toBe('My Menu');
      expect(menuBuilder._ui).toBe(mockUi);
    });

    it('should pass logger to MenuBuilder', () => {
      const menuBuilder = service.createMenu('Test Menu');

      expect(menuBuilder._logger).toBe(logger);
    });
  });

  // ===================================================================
  // DIALOG OPERATIONS
  // ===================================================================

  describe('alert()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should show alert with title and message', () => {
      const result = service.alert('Title', 'Message');

      expect(mockUi.alert).toHaveBeenCalledWith('Title', 'Message', undefined);
      expect(result).toBe('OK');
    });

    it('should show alert with custom button set', () => {
      service.alert('Title', 'Message', mockUi.ButtonSet.YES_NO);

      expect(mockUi.alert).toHaveBeenCalledWith('Title', 'Message', mockUi.ButtonSet.YES_NO);
    });

    it('should use executeWithRetry', () => {
      service.alert('Title', 'Message');

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      service.alert('Title', 'Message');

      expect(logger.debug).toHaveBeenCalledWith('UiService.alert: Showing alert "Title"');
    });
  });

  describe('prompt()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should show prompt with title and message', () => {
      const result = service.prompt('Title', 'Message');

      expect(mockUi.prompt).toHaveBeenCalledWith('Title', 'Message', undefined);
      expect(result.getSelectedButton).toBeDefined();
      expect(result.getResponseText).toBeDefined();
    });

    it('should show prompt with custom button set', () => {
      service.prompt('Title', 'Message', mockUi.ButtonSet.YES_NO);

      expect(mockUi.prompt).toHaveBeenCalledWith('Title', 'Message', mockUi.ButtonSet.YES_NO);
    });

    it('should use executeWithRetry', () => {
      service.prompt('Title', 'Message');

      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      service.prompt('Title', 'Message');

      expect(logger.debug).toHaveBeenCalledWith('UiService.prompt: Showing prompt "Title"');
    });
  });

  // ===================================================================
  // HTML SIDEBAR / DIALOG OPERATIONS
  // ===================================================================

  describe('createSidebar()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should create SidebarBuilder', () => {
      const sidebarBuilder = service.createSidebar();

      expect(sidebarBuilder).toBeInstanceOf(SidebarBuilder);
      expect(sidebarBuilder._ui).toBe(mockUi);
      expect(sidebarBuilder._logger).toBe(logger);
    });
  });

  describe('createDialog()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should create DialogBuilder', () => {
      const dialogBuilder = service.createDialog();

      expect(dialogBuilder).toBeInstanceOf(DialogBuilder);
      expect(dialogBuilder._ui).toBe(mockUi);
      expect(dialogBuilder._logger).toBe(logger);
    });
  });

  // ===================================================================
  // NATIVE UI ACCESS
  // ===================================================================

  describe('getNativeUi()', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should return the native UI object', () => {
      const nativeUi = service.getNativeUi();

      expect(nativeUi).toBe(mockUi);
    });
  });

  describe('Button getter', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should return Button constants', () => {
      const buttons = service.Button;

      expect(buttons).toBe(mockUi.Button);
      expect(buttons.OK).toBe('OK');
      expect(buttons.CANCEL).toBe('CANCEL');
    });
  });

  describe('ButtonSet getter', () => {
    beforeEach(() => {
      service = new UiService(logger, cache, utils, exceptionService, mockUi);
    });

    it('should return ButtonSet constants', () => {
      const buttonSets = service.ButtonSet;

      expect(buttonSets).toBe(mockUi.ButtonSet);
      expect(buttonSets.OK).toBe('OK');
      expect(buttonSets.YES_NO).toBe('YES_NO');
    });
  });

  // ===================================================================
  // HOST DETECTION
  // ===================================================================

  describe('_detectUiObject()', () => {
    it('should detect Google Sheets UI first', () => {
      global.SpreadsheetApp = {
        getUi: jest.fn(() => mockUi)
      };
      global.DocumentApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(global.SpreadsheetApp.getUi).toHaveBeenCalled();
      expect(global.DocumentApp.getUi).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('UiService: Detected Google Sheets UI');
    });

    it('should detect Google Docs UI when Sheets unavailable', () => {
      global.SpreadsheetApp = undefined;
      global.DocumentApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(global.DocumentApp.getUi).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('UiService: Detected Google Docs UI');
    });

    it('should detect Google Forms UI when Sheets and Docs unavailable', () => {
      global.SpreadsheetApp = undefined;
      global.DocumentApp = undefined;
      global.FormApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(global.FormApp.getUi).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('UiService: Detected Google Forms UI');
    });

    it('should detect Google Slides UI when others unavailable', () => {
      global.SpreadsheetApp = undefined;
      global.DocumentApp = undefined;
      global.FormApp = undefined;
      global.SlidesApp = {
        getUi: jest.fn(() => mockUi)
      };

      service = new UiService(logger, cache, utils, exceptionService);

      expect(global.SlidesApp.getUi).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('UiService: Detected Google Slides UI');
    });

    it('should return null when no UI available', () => {
      global.SpreadsheetApp = undefined;
      global.DocumentApp = undefined;
      global.FormApp = undefined;
      global.SlidesApp = undefined;

      expect(() => {
        new UiService(logger, cache, utils, exceptionService);
      }).toThrow('UiService: Unable to detect UI object');
    });
  });
});
