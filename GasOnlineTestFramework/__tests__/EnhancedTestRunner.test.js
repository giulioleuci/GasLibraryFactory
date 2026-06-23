import { EnhancedTestRunner } from '../src/EnhancedTestRunner.js';

describe('EnhancedTestRunner', () => {
  it('should register tests', () => {
    const runner = new EnhancedTestRunner();
    runner.register('Suite/Test1', jest.fn());
    expect(runner.registry.length).toBe(1);
    expect(runner.registry[0].path).toBe('Suite/Test1');
  });

  it('should have runTests method', () => {
    const runner = new EnhancedTestRunner();
    expect(typeof runner.run).toBe('function');
  });
});
