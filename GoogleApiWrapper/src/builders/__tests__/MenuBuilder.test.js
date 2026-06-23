// ===================================================================
// FILE: GoogleApiWrapper/src/utils/__tests__/MenuBuilder.test.js
// ===================================================================
// Comprehensive test suite for MenuBuilder
// Coverage: Fluent API menu construction
// ===================================================================

import { MenuBuilder } from '../MenuBuilder';

describe('MenuBuilder - Comprehensive Test Suite', () => {
  let mockUi;
  let mockMenu;
  let logger;
  let builder;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockMenu = {
      addItem: jest.fn().mockReturnThis(),
      addSeparator: jest.fn().mockReturnThis(),
      addSubMenu: jest.fn().mockReturnThis(),
      addToUi: jest.fn()
    };

    mockUi = {
      createMenu: jest.fn(() => mockMenu)
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
      builder = new MenuBuilder(mockUi, 'My Menu', logger);

      expect(builder._ui).toBe(mockUi);
      expect(builder._caption).toBe('My Menu');
      expect(builder._logger).toBe(logger);
      expect(builder._menu).toBe(mockMenu);
    });

    it('should create menu via UI', () => {
      builder = new MenuBuilder(mockUi, 'Test Menu', logger);

      expect(mockUi.createMenu).toHaveBeenCalledWith('Test Menu');
    });

    it('should log debug message', () => {
      builder = new MenuBuilder(mockUi, 'Debug Menu', logger);

      expect(logger.debug).toHaveBeenCalledWith('MenuBuilder: Created menu "Debug Menu"');
    });

    it('should throw error if ui is null', () => {
      expect(() => {
        new MenuBuilder(null, 'Menu', logger);
      }).toThrow('MenuBuilder: ui is required');
    });

    it('should throw error if caption is null', () => {
      expect(() => {
        new MenuBuilder(mockUi, null, logger);
      }).toThrow('MenuBuilder: caption must be a non-empty string');
    });

    it('should throw error if caption is empty', () => {
      expect(() => {
        new MenuBuilder(mockUi, '', logger);
      }).toThrow('MenuBuilder: caption must be a non-empty string');
    });

    it('should throw error if caption is not a string', () => {
      expect(() => {
        new MenuBuilder(mockUi, 123, logger);
      }).toThrow('MenuBuilder: caption must be a non-empty string');
    });

    it('should throw error if logger is null', () => {
      expect(() => {
        new MenuBuilder(mockUi, 'Menu', null);
      }).toThrow('MenuBuilder: logger is required');
    });
  });

  // ===================================================================
  // addItem() METHOD
  // ===================================================================

  describe('addItem()', () => {
    beforeEach(() => {
      builder = new MenuBuilder(mockUi, 'Menu', logger);
    });

    it('should add menu item with caption and function name', () => {
      const result = builder.addItem('Action 1', 'function1');

      expect(mockMenu.addItem).toHaveBeenCalledWith('Action 1', 'function1');
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.addItem('Action 1', 'function1');

      expect(logger.debug).toHaveBeenCalledWith('MenuBuilder: Added item "Action 1" → function1');
    });

    it('should support method chaining', () => {
      const result = builder.addItem('Item 1', 'func1').addItem('Item 2', 'func2');

      expect(result).toBe(builder);
      expect(mockMenu.addItem).toHaveBeenCalledTimes(2);
    });

    it('should throw error if caption is null', () => {
      expect(() => {
        builder.addItem(null, 'function1');
      }).toThrow('MenuBuilder.addItem: caption must be a non-empty string');
    });

    it('should throw error if caption is empty', () => {
      expect(() => {
        builder.addItem('', 'function1');
      }).toThrow('MenuBuilder.addItem: caption must be a non-empty string');
    });

    it('should throw error if caption is not a string', () => {
      expect(() => {
        builder.addItem(123, 'function1');
      }).toThrow('MenuBuilder.addItem: caption must be a non-empty string');
    });

    it('should throw error if functionName is null', () => {
      expect(() => {
        builder.addItem('Action', null);
      }).toThrow('MenuBuilder.addItem: functionName must be a non-empty string');
    });

    it('should throw error if functionName is empty', () => {
      expect(() => {
        builder.addItem('Action', '');
      }).toThrow('MenuBuilder.addItem: functionName must be a non-empty string');
    });

    it('should throw error if functionName is not a string', () => {
      expect(() => {
        builder.addItem('Action', 123);
      }).toThrow('MenuBuilder.addItem: functionName must be a non-empty string');
    });
  });

  // ===================================================================
  // addSeparator() METHOD
  // ===================================================================

  describe('addSeparator()', () => {
    beforeEach(() => {
      builder = new MenuBuilder(mockUi, 'Menu', logger);
    });

    it('should add separator', () => {
      const result = builder.addSeparator();

      expect(mockMenu.addSeparator).toHaveBeenCalled();
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.addSeparator();

      expect(logger.debug).toHaveBeenCalledWith('MenuBuilder: Added separator');
    });

    it('should support method chaining', () => {
      const result = builder.addItem('Item 1', 'func1').addSeparator().addItem('Item 2', 'func2');

      expect(result).toBe(builder);
      expect(mockMenu.addSeparator).toHaveBeenCalledTimes(1);
    });
  });

  // ===================================================================
  // addSubMenu() METHOD
  // ===================================================================

  describe('addSubMenu()', () => {
    let subMenuBuilder;
    let subMockMenu;

    beforeEach(() => {
      builder = new MenuBuilder(mockUi, 'Main Menu', logger);

      subMockMenu = {
        addItem: jest.fn().mockReturnThis(),
        addSeparator: jest.fn().mockReturnThis(),
        addSubMenu: jest.fn().mockReturnThis(),
        addToUi: jest.fn()
      };

      const subMockUi = {
        createMenu: jest.fn(() => subMockMenu)
      };

      subMenuBuilder = new MenuBuilder(subMockUi, 'Sub Menu', logger);
    });

    it('should add submenu', () => {
      const result = builder.addSubMenu(subMenuBuilder);

      expect(mockMenu.addSubMenu).toHaveBeenCalledWith(subMockMenu);
      expect(result).toBe(builder); // Method chaining
    });

    it('should log debug message', () => {
      builder.addSubMenu(subMenuBuilder);

      expect(logger.debug).toHaveBeenCalledWith('MenuBuilder: Added submenu "Sub Menu"');
    });

    it('should support method chaining', () => {
      const result = builder
        .addItem('Item 1', 'func1')
        .addSubMenu(subMenuBuilder)
        .addItem('Item 2', 'func2');

      expect(result).toBe(builder);
      expect(mockMenu.addSubMenu).toHaveBeenCalledTimes(1);
    });

    it('should throw error if subMenuBuilder is null', () => {
      expect(() => {
        builder.addSubMenu(null);
      }).toThrow('MenuBuilder.addSubMenu: subMenuBuilder must be a MenuBuilder instance');
    });

    it('should throw error if subMenuBuilder is not a MenuBuilder', () => {
      expect(() => {
        builder.addSubMenu({ some: 'object' });
      }).toThrow('MenuBuilder.addSubMenu: subMenuBuilder must be a MenuBuilder instance');
    });
  });

  // ===================================================================
  // addToUi() METHOD
  // ===================================================================

  describe('addToUi()', () => {
    beforeEach(() => {
      builder = new MenuBuilder(mockUi, 'Final Menu', logger);
    });

    it('should add menu to UI', () => {
      builder.addToUi();

      expect(mockMenu.addToUi).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      builder.addToUi();

      expect(logger.debug).toHaveBeenCalledWith('MenuBuilder: Added menu "Final Menu" to UI');
    });

    it('should not return builder (breaks chain)', () => {
      const result = builder.addToUi();

      expect(result).toBeUndefined();
    });
  });

  // ===================================================================
  // getNativeMenu() METHOD
  // ===================================================================

  describe('getNativeMenu()', () => {
    beforeEach(() => {
      builder = new MenuBuilder(mockUi, 'Menu', logger);
    });

    it('should return native menu object', () => {
      const nativeMenu = builder.getNativeMenu();

      expect(nativeMenu).toBe(mockMenu);
    });
  });

  // ===================================================================
  // FLUENT API INTEGRATION TEST
  // ===================================================================

  describe('Fluent API Integration', () => {
    it('should support complex menu construction', () => {
      const subMenuBuilder = new MenuBuilder(
        { createMenu: jest.fn(() => mockMenu) },
        'Sub Menu',
        logger
      );

      builder = new MenuBuilder(mockUi, 'Complex Menu', logger);

      builder
        .addItem('New', 'createNew')
        .addItem('Open', 'openFile')
        .addSeparator()
        .addSubMenu(subMenuBuilder)
        .addSeparator()
        .addItem('Exit', 'exitApp')
        .addToUi();

      expect(mockMenu.addItem).toHaveBeenCalledTimes(3);
      expect(mockMenu.addSeparator).toHaveBeenCalledTimes(2);
      expect(mockMenu.addSubMenu).toHaveBeenCalledTimes(1);
      expect(mockMenu.addToUi).toHaveBeenCalled();
    });
  });
});
