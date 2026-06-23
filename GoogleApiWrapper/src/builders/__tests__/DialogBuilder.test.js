// ===================================================================
// FILE: GoogleApiWrapper/src/utils/__tests__/DialogBuilder.test.js
// ===================================================================
// Comprehensive test suite for DialogBuilder
// Coverage: Fluent API dialog construction
// ===================================================================

import { DialogBuilder } from '../DialogBuilder';

describe('DialogBuilder - Comprehensive Test Suite', () => {
  let mockUi;
  let mockHtmlOutput;
  let logger;
  let builder;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockHtmlOutput = {
      setTitle: jest.fn().mockReturnThis(),
      setWidth: jest.fn().mockReturnThis(),
      setHeight: jest.fn().mockReturnThis()
    };

    mockUi = {
      showModalDialog: jest.fn()
    };

    // Mock HtmlService
    global.HtmlService = {
      createHtmlOutput: jest.fn(() => mockHtmlOutput)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with all parameters', () => {
      builder = new DialogBuilder(mockUi, logger);

      expect(builder._ui).toBe(mockUi);
      expect(builder._logger).toBe(logger);
      expect(builder._htmlOutput).toBeNull();
      expect(builder._title).toBe('Dialog');
      expect(builder._width).toBeNull();
      expect(builder._height).toBeNull();
    });

    it('should log debug message', () => {
      builder = new DialogBuilder(mockUi, logger);

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Instance created');
    });

    it('should throw error if ui is null', () => {
      expect(() => {
        new DialogBuilder(null, logger);
      }).toThrow('DialogBuilder: ui is required');
    });

    it('should throw error if logger is null', () => {
      expect(() => {
        new DialogBuilder(mockUi, null);
      }).toThrow('DialogBuilder: logger is required');
    });
  });

  // ===================================================================
  // setTitle() METHOD
  // ===================================================================

  describe('setTitle()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should set title', () => {
      const result = builder.setTitle('My Dialog');

      expect(builder._title).toBe('My Dialog');
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setTitle('Test Dialog');

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Set title to "Test Dialog"');
    });

    it('should support method chaining', () => {
      const result = builder.setTitle('Title').setWidth(400);

      expect(result).toBe(builder);
    });

    it('should throw error if title is null', () => {
      expect(() => {
        builder.setTitle(null);
      }).toThrow('DialogBuilder.setTitle: title must be a non-empty string');
    });

    it('should throw error if title is empty', () => {
      expect(() => {
        builder.setTitle('');
      }).toThrow('DialogBuilder.setTitle: title must be a non-empty string');
    });

    it('should throw error if title is not a string', () => {
      expect(() => {
        builder.setTitle(123);
      }).toThrow('DialogBuilder.setTitle: title must be a non-empty string');
    });
  });

  // ===================================================================
  // setContent() METHOD
  // ===================================================================

  describe('setContent()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should set content from HTML string', () => {
      const result = builder.setContent('<h1>Hello</h1>');

      expect(global.HtmlService.createHtmlOutput).toHaveBeenCalledWith('<h1>Hello</h1>');
      expect(builder._htmlOutput).toBe(mockHtmlOutput);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setContent('<p>Test</p>');

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Set content from HTML string');
    });

    it('should support method chaining', () => {
      const result = builder.setContent('<div>Content</div>').setTitle('Title');

      expect(result).toBe(builder);
    });

    it('should throw error if html is not a string', () => {
      expect(() => {
        builder.setContent(123);
      }).toThrow('DialogBuilder.setContent: html must be a string');
    });

    it('should accept empty string', () => {
      const result = builder.setContent('');

      expect(global.HtmlService.createHtmlOutput).toHaveBeenCalledWith('');
      expect(result).toBe(builder);
    });
  });

  // ===================================================================
  // setContentFromTemplate() METHOD
  // ===================================================================

  describe('setContentFromTemplate()', () => {
    let mockTemplate;

    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);

      mockTemplate = {
        evaluate: jest.fn(() => mockHtmlOutput)
      };
    });

    it('should set content from template', () => {
      const result = builder.setContentFromTemplate(mockTemplate);

      expect(mockTemplate.evaluate).toHaveBeenCalled();
      expect(builder._htmlOutput).toBe(mockHtmlOutput);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setContentFromTemplate(mockTemplate);

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Set content from HtmlTemplate');
    });

    it('should support method chaining', () => {
      const result = builder.setContentFromTemplate(mockTemplate).setWidth(400);

      expect(result).toBe(builder);
    });

    it('should throw error if template is null', () => {
      expect(() => {
        builder.setContentFromTemplate(null);
      }).toThrow('DialogBuilder.setContentFromTemplate: template must be an HtmlTemplate object');
    });

    it('should throw error if template has no evaluate method', () => {
      expect(() => {
        builder.setContentFromTemplate({ some: 'object' });
      }).toThrow('DialogBuilder.setContentFromTemplate: template must be an HtmlTemplate object');
    });
  });

  // ===================================================================
  // setWidth() METHOD
  // ===================================================================

  describe('setWidth()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should set width', () => {
      const result = builder.setWidth(400);

      expect(builder._width).toBe(400);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setWidth(500);

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Set width to 500px');
    });

    it('should support method chaining', () => {
      const result = builder.setWidth(350).setHeight(250);

      expect(result).toBe(builder);
    });

    it('should throw error if pixels is not a number', () => {
      expect(() => {
        builder.setWidth('400');
      }).toThrow('DialogBuilder.setWidth: pixels must be a positive number');
    });

    it('should throw error if pixels is zero', () => {
      expect(() => {
        builder.setWidth(0);
      }).toThrow('DialogBuilder.setWidth: pixels must be a positive number');
    });

    it('should throw error if pixels is negative', () => {
      expect(() => {
        builder.setWidth(-100);
      }).toThrow('DialogBuilder.setWidth: pixels must be a positive number');
    });
  });

  // ===================================================================
  // setHeight() METHOD
  // ===================================================================

  describe('setHeight()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should set height', () => {
      const result = builder.setHeight(300);

      expect(builder._height).toBe(300);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setHeight(400);

      expect(logger.debug).toHaveBeenCalledWith('DialogBuilder: Set height to 400px');
    });

    it('should support method chaining', () => {
      const result = builder.setHeight(250).setWidth(350);

      expect(result).toBe(builder);
    });

    it('should throw error if pixels is not a number', () => {
      expect(() => {
        builder.setHeight('300');
      }).toThrow('DialogBuilder.setHeight: pixels must be a positive number');
    });

    it('should throw error if pixels is zero', () => {
      expect(() => {
        builder.setHeight(0);
      }).toThrow('DialogBuilder.setHeight: pixels must be a positive number');
    });

    it('should throw error if pixels is negative', () => {
      expect(() => {
        builder.setHeight(-50);
      }).toThrow('DialogBuilder.setHeight: pixels must be a positive number');
    });
  });

  // ===================================================================
  // show() METHOD
  // ===================================================================

  describe('show()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should show dialog with all settings', () => {
      builder
        .setTitle('Test Dialog')
        .setContent('<h1>Content</h1>')
        .setWidth(450)
        .setHeight(300)
        .show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Test Dialog');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(450);
      expect(mockHtmlOutput.setHeight).toHaveBeenCalledWith(300);
      expect(mockUi.showModalDialog).toHaveBeenCalledWith(mockHtmlOutput, 'Test Dialog');
    });

    it('should skip width if not set', () => {
      builder.setContent('<p>Content</p>').setHeight(200).show();

      expect(mockHtmlOutput.setWidth).not.toHaveBeenCalled();
      expect(mockHtmlOutput.setHeight).toHaveBeenCalledWith(200);
    });

    it('should skip height if not set', () => {
      builder.setContent('<p>Content</p>').setWidth(400).show();

      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(400);
      expect(mockHtmlOutput.setHeight).not.toHaveBeenCalled();
    });

    it('should use default title if not set', () => {
      builder.setContent('<p>Content</p>').show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Dialog');
      expect(mockUi.showModalDialog).toHaveBeenCalledWith(mockHtmlOutput, 'Dialog');
    });

    it('should log debug message', () => {
      builder
        .setTitle('My Dialog')
        .setContent('<div>Test</div>')
        .setWidth(400)
        .setHeight(300)
        .show();

      expect(logger.debug).toHaveBeenCalledWith(
        'DialogBuilder: Showed dialog "My Dialog" (400x300px)'
      );
    });

    it('should log with null dimensions if not set', () => {
      builder.setTitle('Simple Dialog').setContent('<p>Content</p>').show();

      expect(logger.debug).toHaveBeenCalledWith(
        'DialogBuilder: Showed dialog "Simple Dialog" (nullxnullpx)'
      );
    });

    it('should throw error if content not set', () => {
      expect(() => {
        builder.show();
      }).toThrow('DialogBuilder.show: Must set content before showing dialog');
    });

    it('should not return builder (breaks chain)', () => {
      builder.setContent('<p>Test</p>');
      const result = builder.show();

      expect(result).toBeUndefined();
    });
  });

  // ===================================================================
  // getHtmlOutput() METHOD
  // ===================================================================

  describe('getHtmlOutput()', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should return null before content is set', () => {
      const htmlOutput = builder.getHtmlOutput();

      expect(htmlOutput).toBeNull();
    });

    it('should return HtmlOutput after content is set', () => {
      builder.setContent('<p>Content</p>');
      const htmlOutput = builder.getHtmlOutput();

      expect(htmlOutput).toBe(mockHtmlOutput);
    });
  });

  // ===================================================================
  // FLUENT API INTEGRATION TEST
  // ===================================================================

  describe('Fluent API Integration', () => {
    beforeEach(() => {
      builder = new DialogBuilder(mockUi, logger);
    });

    it('should support full dialog construction', () => {
      builder
        .setTitle('Confirmation')
        .setContent('<h1>Are you sure?</h1><p>This action cannot be undone.</p>')
        .setWidth(500)
        .setHeight(250)
        .show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Confirmation');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(500);
      expect(mockHtmlOutput.setHeight).toHaveBeenCalledWith(250);
      expect(mockUi.showModalDialog).toHaveBeenCalledWith(mockHtmlOutput, 'Confirmation');
      expect(global.HtmlService.createHtmlOutput).toHaveBeenCalledWith(
        '<h1>Are you sure?</h1><p>This action cannot be undone.</p>'
      );
    });

    it('should support template-based construction', () => {
      const mockTemplate = {
        evaluate: jest.fn(() => mockHtmlOutput)
      };

      builder
        .setTitle('Template Dialog')
        .setContentFromTemplate(mockTemplate)
        .setWidth(600)
        .setHeight(400)
        .show();

      expect(mockTemplate.evaluate).toHaveBeenCalled();
      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Template Dialog');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(600);
      expect(mockHtmlOutput.setHeight).toHaveBeenCalledWith(400);
      expect(mockUi.showModalDialog).toHaveBeenCalledWith(mockHtmlOutput, 'Template Dialog');
    });

    it('should support minimal configuration', () => {
      builder.setContent('<p>Simple message</p>').show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Dialog');
      expect(mockHtmlOutput.setWidth).not.toHaveBeenCalled();
      expect(mockHtmlOutput.setHeight).not.toHaveBeenCalled();
      expect(mockUi.showModalDialog).toHaveBeenCalledWith(mockHtmlOutput, 'Dialog');
    });
  });
});
