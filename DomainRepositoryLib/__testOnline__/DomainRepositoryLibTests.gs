/**
 * 🧪 DomainRepositoryLib Online Tests
 */

function initDomainRepositoryLibTests() {
  const NS = 'DomainRepositoryLib';

  // --- Test Domain Classes ---
  class Customer extends Entity {
    constructor(data = {}) {
      super(data);
      this.name = data.name || null;
      this.email = data.email || null;
      this.status = data.status || 'active';
    }
    toData() { return { id: this.id, name: this.name, email: this.email, status: this.status }; }
    static fromData(data) { return new Customer(data); }
  }

  class CustomerRepository extends Repository {
    constructor(database) { super(database, 'Customers', Customer); }
  }

  runner.register(`${NS}/Repository/CRUD_Integration`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Customers');
    sheet.appendRow(['id', 'name', 'email', 'status']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const repo = new CustomerRepository(db);

    // Save
    const customer = new Customer({ name: 'Alice', email: 'alice@example.com' });
    const saved = repo.save(customer);
    SmartAssert.notNull(saved.id, 'Saved entity should have ID');

    // Find
    const found = repo.findById(saved.id);
    SmartAssert.equals(found.name, 'Alice', 'Should find saved entity');

    // Update
    found.name = 'Alice Updated';
    repo.save(found);
    const updated = repo.findById(saved.id);
    SmartAssert.equals(updated.name, 'Alice Updated', 'Should update entity');

    // Delete
    repo.delete(saved);
    const deleted = repo.findById(saved.id);
    SmartAssert.isNull(deleted, 'Should delete entity');
  });

  runner.register(`${NS}/Mapping/Dynamic_Fields`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Dynamic');
    sheet.appendRow(['id', 'name', 'META_color', 'META_size']);
    SpreadsheetApp.flush();

    class DynamicEntity extends Entity {
      constructor(data) { super(data); this.name = data.name; this.meta = data.meta || {}; }
      toData() { return { id: this.id, name: this.name, meta: this.meta }; }
      static fromData(data) { return new DynamicEntity(data); }
    }

    class DynamicRepository extends Repository {
      constructor(database) {
        super(database, 'Dynamic', DynamicEntity);
        this.entityMapper.configureDynamicField({
          propertyName: 'meta',
          schemaProvider: () => ['color', 'size'],
          columnPattern: (key) => 'META_' + key,
          aggregate: (row, key, col) => row[col],
          expand: (val, key, col) => ({ [col]: val })
        });
      }
    }

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const repo = new DynamicRepository(db);

    const metaMap = new Map();
    metaMap.set('color', 'red');
    metaMap.set('size', 'large');
    const entity = new DynamicEntity({ name: 'Item', meta: metaMap });
    const saved = repo.save(entity);
    
    const found = repo.findById(saved.id);
    SmartAssert.equals(found.meta.get('color'), 'red', 'Should hydrate dynamic field');
    SmartAssert.equals(found.meta.get('size'), 'large', 'Should hydrate dynamic field');
  });
}
