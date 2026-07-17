/**
 * 🧪 Properties & Cache Services Comprehensive Tests
 */
function initGoogleApiWrapperTests_Services(NS) {
  runner.register(`${NS}/PropertiesService/BasicOperations`, () => {
    const deps = createGoogleApiWrapperDeps();
    const propsService = new PropertiesService(deps.logger);

    // Script properties
    const testKey = 'TEST_KEY_' + deps.utils.generateUuid().substring(0, 8);
    const testVal = 'TEST_VAL_' + deps.utils.generateUuid().substring(0, 8);

    propsService.setProperty(testKey, testVal);
    SmartAssert.equals(propsService.getProperty(testKey), testVal, 'Should get script property');

    // Cleanup
    propsService.deleteProperty(testKey);
  });

  runner.register(`${NS}/PropertiesService/UserAndDocument`, () => {
    const deps = createGoogleApiWrapperDeps();
    const propsService = new PropertiesService(deps.logger);

    const key = 'USER_KEY_' + deps.utils.generateUuid().substring(0, 8);
    const val = 'USER_VAL';

    // User properties
    propsService.setUserProperty(key, val);
    SmartAssert.equals(propsService.getUserProperty(key), val, 'Should get user property');
    propsService.deleteUserProperty(key);

    // Document properties (if bound)
    try {
      propsService.setDocumentProperty(key, val);
      SmartAssert.equals(
        propsService.getDocumentProperty(key),
        val,
        'Should get document property'
      );
      propsService.deleteDocumentProperty(key);
    } catch (e) {
      // Might fail if not bound to a document, which is expected in some test environments
      deps.logger.warn('Document properties not available: ' + e.message);
    }
  });

  runner.register(`${NS}/CacheService/AdvancedOperations`, () => {
    const deps = createGoogleApiWrapperDeps();
    const cacheService = new CacheService(deps.logger, deps.exceptionService);
    const scriptCache = cacheService.getScriptCache();

    const prefix = 'PREFIX_' + deps.utils.generateUuid().substring(0, 4);
    const key1 = prefix + '_1';
    const key2 = prefix + '_2';
    const otherKey = 'OTHER_' + deps.utils.generateUuid().substring(0, 4);

    // 1. Enable key tracking
    scriptCache.enableKeyTracking();

    // 2. Put values
    scriptCache.put(key1, 'VAL1', 300);
    scriptCache.put(key2, 'VAL2', 300);
    scriptCache.put(otherKey, 'VAL_OTHER', 300);

    SmartAssert.equals(scriptCache.get(key1), 'VAL1', 'Key1 should be cached');
    SmartAssert.equals(scriptCache.get(key2), 'VAL2', 'Key2 should be cached');

    // 3. Remove by prefix (uses tracking)
    const removedCount = scriptCache.removeByPrefix(prefix);
    SmartAssert.equals(removedCount, 2, 'Should have removed 2 tracked keys by prefix');

    SmartAssert.isNull(scriptCache.get(key1), 'Key1 should be removed');
    SmartAssert.isNull(scriptCache.get(key2), 'Key2 should be removed');
    SmartAssert.equals(scriptCache.get(otherKey), 'VAL_OTHER', 'OtherKey should still be there');

    // 4. PutAll and GetAll
    const values = {};
    values[key1] = 'NEW1';
    values[key2] = 'NEW2';
    scriptCache.putAll(values, 300);

    const retrieved = scriptCache.getAll([key1, key2]);
    SmartAssert.equals(retrieved[key1], 'NEW1', 'Key1 should be updated');
    SmartAssert.equals(retrieved[key2], 'NEW2', 'Key2 should be updated');

    // Cleanup
    scriptCache.removeAll([key1, key2, otherKey]);
  });

  runner.register(`${NS}/CacheService/UserCache`, () => {
    const deps = createGoogleApiWrapperDeps();
    const cacheService = new CacheService(deps.logger, deps.exceptionService);
    const userCache = cacheService.getUserCache();

    const key = 'USER_CACHE_' + deps.utils.generateUuid().substring(0, 8);
    userCache.put(key, 'USER_VAL', 300);

    SmartAssert.equals(userCache.get(key), 'USER_VAL', 'User cache should store value');
    userCache.remove(key);
  });

  runner.register(`${NS}/UtilitiesService/EncodingAndUuid`, () => {
    const deps = createGoogleApiWrapperDeps();
    const utilsService = new UtilitiesService(deps.logger);

    // UUID check
    const uuid = utilsService.getUuid();
    SmartAssert.notNull(uuid, 'Should generate UUID');
    SmartAssert.equals(uuid.length, 36, 'UUID should have 36 chars');

    // Date formatting
    const date = new Date(Date.UTC(2026, 2, 16, 12, 0, 0)); // 16 March 2026 12:00:00 UTC
    const formatted = utilsService.formatDate(date, 'GMT', 'yyyy-MM-dd');
    SmartAssert.equals(formatted, '2026-03-16', 'Should format date correctly');

    // String formatting
    const msg = utilsService.formatString('Hello %s, today is %s', 'User', 'Monday');
    SmartAssert.isTrue(msg.includes('Hello User'), 'Should format string');
  });

  runner.register(`${NS}/TriggerService/Lifecycle`, () => {
    const deps = createGoogleApiWrapperDeps();
    const triggerService = new TriggerService(deps.logger);

    const functionName = 'dummyFunction';

    // 1. Create timed trigger (60s)
    const triggerId = triggerService.createTimedTrigger(functionName, 60000);
    SmartAssert.notNull(triggerId, 'Should create timed trigger');

    // 2. Check existence
    SmartAssert.isTrue(
      triggerService.triggerExistsForFunction(functionName),
      'Trigger should exist'
    );

    // 3. Delete by ID
    triggerService.deleteTriggerById(triggerId);
    SmartAssert.isFalse(
      triggerService.triggerExistsForFunction(functionName),
      'Trigger should be deleted'
    );

    // 4. Create daily trigger
    triggerService.createDailyTrigger(functionName, 9);
    SmartAssert.isTrue(
      triggerService.triggerExistsForFunction(functionName),
      'Daily trigger should exist'
    );

    // 5. Delete all triggers for function
    triggerService.deleteTriggersByFunction(functionName);
    SmartAssert.isFalse(
      triggerService.triggerExistsForFunction(functionName),
      'All triggers for function should be deleted'
    );
  });

  runner.register(`${NS}/LockService/ScriptLock`, () => {
    const deps = createGoogleApiWrapperDeps();
    const lockService = new LockService(deps.logger);

    const lock = lockService.getScriptLock();
    SmartAssert.notNull(lock, 'Should get script lock');

    const hasLock = lock.tryLock(1000);
    if (hasLock) {
      lock.releaseLock();
    }
    SmartAssert.isTrue(hasLock, 'Should acquire script lock');
  });

  runner.register(`${NS}/PropertiesService/DataTypes`, () => {
    const deps = createGoogleApiWrapperDeps();
    const propsService = new PropertiesService(deps.logger);

    const key = 'JSON_KEY_' + deps.utils.generateUuid().substring(0, 8);
    const complexData = {
      id: 1,
      name: 'Test',
      meta: {
        active: true,
        tags: ['a', 'b']
      }
    };

    propsService.setProperty(key, JSON.stringify(complexData));
    const retrieved = JSON.parse(propsService.getProperty(key));

    SmartAssert.equals(retrieved.id, 1, 'JSON data should be persisted');
    SmartAssert.equals(retrieved.meta.tags.length, 2, 'Nested JSON should be persisted');

    // Cleanup
    propsService.deleteProperty(key);
  });

  runner.register(`${NS}/CacheService/LimitsAndExpiration`, () => {
    const deps = createGoogleApiWrapperDeps();
    const cacheService = new CacheService(deps.logger, deps.exceptionService);
    const scriptCache = cacheService.getScriptCache();

    const uniqueTag = deps.utils.generateUuid().substring(0, 8);

    // 1. Large data storage (near 100KB limit if possible)
    const largeData = 'A'.repeat(50000); // 50KB
    const largeKey = 'LARGE_' + uniqueTag;
    scriptCache.put(largeKey, largeData, 300);

    const retrieved = scriptCache.get(largeKey);
    SmartAssert.equals(retrieved.length, 50000, 'Should store and retrieve 50KB string');

    // 2. Expiration (Short TTL)
    const expireKey = 'EXPIRE_' + uniqueTag;
    scriptCache.put(expireKey, 'Will Expire', 1); // 1 second

    SmartAssert.equals(scriptCache.get(expireKey), 'Will Expire', 'Should exist initially');

    // Wait for expiration
    Utilities.sleep(2000);
    SmartAssert.isNull(scriptCache.get(expireKey), 'Should expire after TTL');

    // Cleanup
    scriptCache.remove(largeKey);
  });
}
