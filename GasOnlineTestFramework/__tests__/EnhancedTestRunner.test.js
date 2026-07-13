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

  it('records a passing test', () => {
    const runner = new EnhancedTestRunner();
    runner.register('Suite/Pass', () => {});
    const result = runner.run();
    expect(result.passed).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it('captures the message and stack of a thrown Error', () => {
    const runner = new EnhancedTestRunner();
    runner.register('Suite/Fail', () => {
      throw new Error('boom');
    });
    const result = runner.run();
    expect(result.failed).toBe(1);
    expect(result.errors[0].message).toBe('boom');
    expect(result.errors[0].stack).toEqual(expect.stringContaining('boom'));
  });

  it('normalizes a non-Error throw (e.g. a bare string) into a usable message instead of losing it', () => {
    const runner = new EnhancedTestRunner();
    runner.register('Suite/Fail', () => {
      // eslint-disable-next-line no-throw-literal
      throw 'stringa';
    });
    const result = runner.run();
    expect(result.failed).toBe(1);
    expect(result.errors[0].message).toBe('stringa');
    expect(result.errors[0].stack).toBeDefined();
  });

  it('skips a test registered with { skip: true }', () => {
    const runner = new EnhancedTestRunner();
    const fn = jest.fn();
    runner.register('Suite/Skipped', fn, { skip: true });
    const result = runner.run();
    expect(result.skipped).toBe(1);
    expect(fn).not.toHaveBeenCalled();
  });
});
