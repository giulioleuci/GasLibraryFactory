// ===================================================================
// FILE: GoogleApiWrapper/src/utils/__tests__/SidebarBuilder.test.js
// ===================================================================
// Comprehensive test suite for SidebarBuilder
// Coverage: Fluent API sidebar construction
// ===================================================================

import { SidebarBuilder } from '../SidebarBuilder';

describe('SidebarBuilder - Comprehensive Test Suite', () => {
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
      showSidebar: jest.fn()
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
      builder = new SidebarBuilder(mockUi, logger);

      expect(builder._ui).toBe(mockUi);
      expect(builder._logger).toBe(logger);
      expect(builder._htmlOutput).toBeNull();
      expect(builder._title).toBe('Sidebar');
      expect(builder._width).toBe(300);
    });

    it('should log debug message', () => {
      builder = new SidebarBuilder(mockUi, logger);

      expect(logger.debug).toHaveBeenCalledWith('SidebarBuilder: Instance created');
    });

    it('should throw error if ui is null', () => {
      expect(() => {
        new SidebarBuilder(null, logger);
      }).toThrow('SidebarBuilder: ui is required');
    });

    it('should throw error if logger is null', () => {
      expect(() => {
        new SidebarBuilder(mockUi, null);
      }).toThrow('SidebarBuilder: logger is required');
    });
  });

  // ===================================================================
  // setTitle() METHOD
  // ===================================================================

  describe('setTitle()', () => {
    beforeEach(() => {
      builder = new SidebarBuilder(mockUi, logger);
    });

    it('should set title', () => {
      const result = builder.setTitle('My Sidebar');

      expect(builder._title).toBe('My Sidebar');
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setTitle('Test Sidebar');

      expect(logger.debug).toHaveBeenCalledWith('SidebarBuilder: Set title to "Test Sidebar"');
    });

    it('should support method chaining', () => {
      const result = builder.setTitle('Title').setWidth(400);

      expect(result).toBe(builder);
    });

    it('should throw error if title is null', () => {
      expect(() => {
        builder.setTitle(null);
      }).toThrow('SidebarBuilder.setTitle: title must be a non-empty string');
    });

    it('should throw error if title is empty', () => {
      expect(() => {
        builder.setTitle('');
      }).toThrow('SidebarBuilder.setTitle: title must be a non-empty string');
    });

    it('should throw error if title is not a string', () => {
      expect(() => {
        builder.setTitle(123);
      }).toThrow('SidebarBuilder.setTitle: title must be a non-empty string');
    });
  });

  // ===================================================================
  // setContent() METHOD
  // ===================================================================

  describe('setContent()', () => {
    beforeEach(() => {
      builder = new SidebarBuilder(mockUi, logger);
    });

    it('should set content from HTML string', () => {
      const result = builder.setContent('<h1>Hello</h1>');

      expect(global.HtmlService.createHtmlOutput).toHaveBeenCalledWith('<h1>Hello</h1>');
      expect(builder._htmlOutput).toBe(mockHtmlOutput);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setContent('<p>Test</p>');

      expect(logger.debug).toHaveBeenCalledWith('SidebarBuilder: Set content from HTML string');
    });

    it('should support method chaining', () => {
      const result = builder.setContent('<div>Content</div>').setTitle('Title');

      expect(result).toBe(builder);
    });

    it('should throw error if html is not a string', () => {
      expect(() => {
        builder.setContent(123);
      }).toThrow('SidebarBuilder.setContent: html must be a string');
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
      builder = new SidebarBuilder(mockUi, logger);

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

      expect(logger.debug).toHaveBeenCalledWith('SidebarBuilder: Set content from HtmlTemplate');
    });

    it('should support method chaining', () => {
      const result = builder.setContentFromTemplate(mockTemplate).setWidth(400);

      expect(result).toBe(builder);
    });

    it('should throw error if template is null', () => {
      expect(() => {
        builder.setContentFromTemplate(null);
      }).toThrow('SidebarBuilder.setContentFromTemplate: template must be an HtmlTemplate object');
    });

    it('should throw error if template has no evaluate method', () => {
      expect(() => {
        builder.setContentFromTemplate({ some: 'object' });
      }).toThrow('SidebarBuilder.setContentFromTemplate: template must be an HtmlTemplate object');
    });
  });

  // ===================================================================
  // setWidth() METHOD
  // ===================================================================

  describe('setWidth()', () => {
    beforeEach(() => {
      builder = new SidebarBuilder(mockUi, logger);
    });

    it('should set width', () => {
      const result = builder.setWidth(400);

      expect(builder._width).toBe(400);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.setWidth(500);

      expect(logger.debug).toHaveBeenCalledWith('SidebarBuilder: Set width to 500px');
    });

    it('should support method chaining', () => {
      const result = builder.setWidth(350).setTitle('Title');

      expect(result).toBe(builder);
    });

    it('should throw error if pixels is not a number', () => {
      expect(() => {
        builder.setWidth('400');
      }).toThrow('SidebarBuilder.setWidth: pixels must be a positive number');
    });

    it('should throw error if pixels is zero', () => {
      expect(() => {
        builder.setWidth(0);
      }).toThrow('SidebarBuilder.setWidth: pixels must be a positive number');
    });

    it('should throw error if pixels is negative', () => {
      expect(() => {
        builder.setWidth(-100);
      }).toThrow('SidebarBuilder.setWidth: pixels must be a positive number');
    });
  });

  // ===================================================================
  // show() METHOD
  // ===================================================================

  describe('show()', () => {
    beforeEach(() => {
      builder = new SidebarBuilder(mockUi, logger);
    });

    it('should show sidebar with all settings', () => {
      builder.setTitle('Test Sidebar').setContent('<h1>Content</h1>').setWidth(450).show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Test Sidebar');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(450);
      expect(mockUi.showSidebar).toHaveBeenCalledWith(mockHtmlOutput);
    });

    it('should use default width if not set', () => {
      builder.setContent('<p>Content</p>').show();

      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(300);
    });

    it('should use default title if not set', () => {
      builder.setContent('<p>Content</p>').show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Sidebar');
    });

    it('should log debug message', () => {
      builder.setTitle('My Sidebar').setContent('<div>Test</div>').setWidth(400).show();

      expect(logger.debug).toHaveBeenCalledWith(
        'SidebarBuilder: Showed sidebar "My Sidebar" (width: 400px)'
      );
    });

    it('should throw error if content not set', () => {
      expect(() => {
        builder.show();
      }).toThrow('SidebarBuilder.show: Must set content before showing sidebar');
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
      builder = new SidebarBuilder(mockUi, logger);
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
      builder = new SidebarBuilder(mockUi, logger);
    });

    it('should support full sidebar construction', () => {
      builder
        .setTitle('Data Inspector')
        .setContent('<h1>Hello World</h1><p>Content here</p>')
        .setWidth(500)
        .show();

      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Data Inspector');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(500);
      expect(mockUi.showSidebar).toHaveBeenCalledWith(mockHtmlOutput);
      expect(global.HtmlService.createHtmlOutput).toHaveBeenCalledWith(
        '<h1>Hello World</h1><p>Content here</p>'
      );
    });

    it('should support template-based construction', () => {
      const mockTemplate = {
        evaluate: jest.fn(() => mockHtmlOutput)
      };

      builder
        .setTitle('Template Sidebar')
        .setContentFromTemplate(mockTemplate)
        .setWidth(350)
        .show();

      expect(mockTemplate.evaluate).toHaveBeenCalled();
      expect(mockHtmlOutput.setTitle).toHaveBeenCalledWith('Template Sidebar');
      expect(mockHtmlOutput.setWidth).toHaveBeenCalledWith(350);
      expect(mockUi.showSidebar).toHaveBeenCalledWith(mockHtmlOutput);
    });
  });
});
