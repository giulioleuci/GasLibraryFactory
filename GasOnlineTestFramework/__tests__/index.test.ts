/**
 * Unit tests for GasOnlineTestFramework entry point
 */

import { EnhancedTestRunner, SmartAssert, TestContext } from '../index.js';

describe('GasOnlineTestFramework exports', () => {
  it('should export EnhancedTestRunner', () => {
    expect(EnhancedTestRunner).toBeDefined();
    expect(typeof EnhancedTestRunner).toBe('function');
  });

  it('should export SmartAssert', () => {
    expect(SmartAssert).toBeDefined();
    expect(typeof SmartAssert).toBe('function');
  });

  it('should be able to create EnhancedTestRunner instance', () => {
    const framework = new EnhancedTestRunner('Test');
    expect(framework).toBeInstanceOf(EnhancedTestRunner);
  });

  it('should be able to use SmartAssert methods', () => {
    expect(() => SmartAssert.isTrue(true)).not.toThrow();
    expect(() => SmartAssert.equals(1, 1)).not.toThrow();
  });
});
