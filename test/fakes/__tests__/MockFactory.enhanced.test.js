// ===================================================================
// FILE: test/fakes/__tests__/MockFactory.enhanced.test.js
// ===================================================================
// Tests for enhanced MockFactory methods
// ===================================================================

import { MockFactory } from '../MockFactory.js';

describe('MockFactory - Enhanced Methods', () => {
  describe('createJestExceptionService', () => {
    it('should create exception service mock with executeWithRetry', () => {
      const exceptionService = MockFactory.createJestExceptionService();

      expect(exceptionService.executeWithRetry).toBeDefined();
      expect(exceptionService.classify).toBeDefined();
      expect(exceptionService.report).toBeDefined();

      const result = exceptionService.executeWithRetry(() => 'result');
      expect(result).toBe('result');
      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });
  });

  describe('createJestDatabase', () => {
    it('should create database mock with fluent API', () => {
      const database = MockFactory.createJestDatabase();

      const query = database.select(['name', 'email']);
      query.from('Users')
        .where('age', '>', 18)
        .orderBy('name')
        .limit(10);

      expect(database.select).toHaveBeenCalledWith(['name', 'email']);
      expect(query.from).toHaveBeenCalledWith('Users');
      expect(query.where).toHaveBeenCalledWith('age', '>', 18);
    });

    it('should accept custom tables', () => {
      const usersTable = MockFactory.createJestTable('Users');
      const database = MockFactory.createJestDatabase({
        tables: { Users: usersTable }
      });

      expect(database.getTable('Users')).toBe(usersTable);
      expect(database.getTable('Users').name).toBe('Users');
    });
  });

  describe('createJestTable', () => {
    it('should create table mock with CRUD operations', () => {
      const table = MockFactory.createJestTable('Users');

      expect(table.name).toBe('Users');
      expect(table.insertRow).toBeDefined();
      expect(table.updateRow).toBeDefined();
      expect(table.deleteRow).toBeDefined();
      expect(table.findById).toBeDefined();
      expect(table.findAll).toBeDefined();

      const row = table.insertRow({ name: 'Alice' });
      expect(row.name).toBe('Alice');
      expect(row.id).toMatch(/^mock-id-/);
    });
  });

  describe('createJestStep', () => {
    it('should create step mock with default behavior', () => {
      const step = MockFactory.createJestStep('TestStep');

      expect(step.getName()).toBe('TestStep');
      expect(step.execute).toBeDefined();
      expect(step.beforeStep).toBeDefined();
      expect(step.afterStep).toBeDefined();
      expect(step.onError).toBeDefined();
    });

    it('should accept custom execute function', () => {
      const executeFn = jest.fn((context) => {
        context.set('processed', true);
        return { success: true };
      });

      const step = MockFactory.createJestStep('CustomStep', executeFn);
      const context = MockFactory.createJestPipelineContext({});

      step.execute(context);

      expect(executeFn).toHaveBeenCalledWith(context);
      expect(context.set).toHaveBeenCalledWith('processed', true);
    });
  });

  describe('createJestPipelineContext', () => {
    it('should create context with get/set methods', () => {
      const context = MockFactory.createJestPipelineContext({
        input: 'data',
        count: 5
      });

      expect(context.get('input')).toBe('data');
      expect(context.get('count')).toBe(5);
      expect(context.has('input')).toBe(true);
      expect(context.has('missing')).toBe(false);

      context.set('newKey', 'newValue');
      expect(context.get('newKey')).toBe('newValue');
    });

    it('should return all data with getAll', () => {
      const context = MockFactory.createJestPipelineContext({
        a: 1,
        b: 2
      });

      const allData = context.getAll();
      expect(allData).toEqual({ a: 1, b: 2 });
    });
  });

  describe('createJestDataProvider', () => {
    it('should create data provider mock', () => {
      const data = { users: [{ id: 1, name: 'Alice' }] };
      const provider = MockFactory.createJestDataProvider(data);

      expect(provider.provide()).toEqual(data);
      expect(provider._fetchData()).toEqual(data);
    });
  });

  describe('createJestProviderRegistry', () => {
    it('should create registry with get/has methods', () => {
      const provider1 = MockFactory.createJestDataProvider({ data: 1 });
      const provider2 = MockFactory.createJestDataProvider({ data: 2 });

      const registry = MockFactory.createJestProviderRegistry({
        Provider1: provider1,
        Provider2: provider2
      });

      expect(registry.get('Provider1')).toBe(provider1);
      expect(registry.get('Provider2')).toBe(provider2);
      expect(registry.has('Provider1')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('Provider1');
      expect(registry.getRegisteredTypes()).toContain('Provider2');
    });
  });

  describe('createJestMonitor', () => {
    it('should create monitor mock with all methods', () => {
      const monitor = MockFactory.createJestMonitor();

      expect(monitor.logJobStart).toBeDefined();
      expect(monitor.logJobComplete).toBeDefined();
      expect(monitor.logJobError).toBeDefined();
      expect(monitor.logStepStart).toBeDefined();
      expect(monitor.logStepComplete).toBeDefined();
      expect(monitor.logStepError).toBeDefined();
      expect(monitor.updateProgress).toBeDefined();

      monitor.logJobStart('job-1', 'Test Job');
      expect(monitor.logJobStart).toHaveBeenCalledWith('job-1', 'Test Job');
    });
  });

  describe('createJestSpreadsheetService', () => {
    it('should create spreadsheet service mock', () => {
      const service = MockFactory.createJestSpreadsheetService();

      const spreadsheet = service.openById('SHEET-ID');
      expect(spreadsheet.getId()).toBe('SHEET-ID');

      expect(service.getSheetData()).toEqual([]);
    });
  });

  describe('createJestDocumentService', () => {
    it('should create document service mock', () => {
      const service = MockFactory.createJestDocumentService();

      expect(service.getDocument).toBeDefined();
      expect(service.createDocument).toBeDefined();
      expect(service.updateDocument).toBeDefined();
      expect(service.replaceAllText).toBeDefined();

      expect(service.createDocument('test').getId()).toBe('new-doc-id');
    });
  });

  describe('createJestDriveService', () => {
    it('should create drive service mock', () => {
      const service = MockFactory.createJestDriveService();

      expect(service.getFile).toBeDefined();
      expect(service.createFile).toBeDefined();
      expect(service.copyFile).toBeDefined();
      expect(service.moveFile).toBeDefined();
      expect(service.deleteFile).toBeDefined();
      expect(service.listFiles).toBeDefined();

      expect(service.createFile('test').getId()).toBe('new-file-id');
      expect(service.copyFile('id', 'name').getId()).toBe('copy-file-id');
      expect(service.listFiles()).toEqual([]);
    });
  });

  describe('createJestMailService', () => {
    it('should create mail service mock', () => {
      const service = MockFactory.createJestMailService();

      expect(service.send).toBeDefined();
      expect(service.createDraft).toBeDefined();
      expect(service.sendBatch).toBeDefined();

      expect(service.send().success).toBe(true);
      expect(service.createDraft().id).toBe('draft-id');
      expect(service.sendBatch([]).sent).toBe(0);
    });
  });

  describe('createAllJest', () => {
    it('should create all common Jest mocks', () => {
      const mocks = MockFactory.createAllJest();

      expect(mocks.logger).toBeDefined();
      expect(mocks.cache).toBeDefined();
      expect(mocks.utils).toBeDefined();
      expect(mocks.exceptionService).toBeDefined();
      expect(mocks.database).toBeDefined();
      expect(mocks.spreadsheetService).toBeDefined();
      expect(mocks.documentService).toBeDefined();
      expect(mocks.driveService).toBeDefined();
      expect(mocks.mailService).toBeDefined();
      expect(mocks.monitor).toBeDefined();

      // Verify they work
      mocks.logger.info('test');
      expect(mocks.logger.info).toHaveBeenCalledWith('test');

      mocks.cache.put('key', 'value');
      expect(mocks.cache.get('key')).toBe('value');
    });
  });

  describe('Integration - Real World Usage', () => {
    it('should support Pipeline testing pattern', () => {
      const mocks = MockFactory.createAllJest();

      const step1 = MockFactory.createJestStep('LoadData', (context) => {
        context.set('data', [1, 2, 3]);
        return { success: true };
      });

      const step2 = MockFactory.createJestStep('ProcessData', (context) => {
        const data = context.get('data');
        context.set('result', data.length);
        return { success: true };
      });

      const context = MockFactory.createJestPipelineContext({});

      step1.execute(context);
      step2.execute(context);

      expect(context.get('data')).toEqual([1, 2, 3]);
      expect(context.get('result')).toBe(3);
    });

    it('should support ContextEngine testing pattern', () => {
      const userProvider = MockFactory.createJestDataProvider({
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      });

      const orderProvider = MockFactory.createJestDataProvider({
        orders: [{ id: 100, total: 50.00 }]
      });

      const registry = MockFactory.createJestProviderRegistry({
        UserProvider: userProvider,
        OrderProvider: orderProvider
      });

      expect(registry.get('UserProvider').provide()).toEqual({
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      });
    });

    it('should support Database testing pattern', () => {
      const usersTable = MockFactory.createJestTable('Users');
      usersTable.findAll.mockReturnValue([
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 }
      ]);

      const database = MockFactory.createJestDatabase({
        tables: { Users: usersTable }
      });

      expect(database.getTable('Users').findAll()).toHaveLength(2);
    });
  });
});
