/**
 * @file PipelineFramework/src/postprocessor/__tests__/PostProcessorChain.test.js
 * @description Unit tests for PostProcessorChain class
 */

import { PostProcessorChain } from '../PostProcessorChain';
import { PostProcessorContext } from '../PostProcessorContext';
import { PostProcessorResult } from '../PostProcessorResult';
import { WhenCondition } from '../WhenCondition';
import { MockFactory } from '../../../../test/fakes';

// Mock processor factory
function createMockProcessor(id, shouldSucceed = true, shouldRun = true) {
  return {
    getId: () => id,
    getName: () => `Mock${id}`,
    execute: jest.fn((_context) => {
      if (!shouldRun) {
        return PostProcessorResult.skipped(id, 'Processor decided to skip');
      }
      if (shouldSucceed) {
        return PostProcessorResult.success(id, [], 10);
      }
      return PostProcessorResult.failure(id, new Error('Test failure'), 10);
    })
  };
}

describe('PostProcessorChain', () => {
  let mocks;
  let successContext;
  let failureContext;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    successContext = new PostProcessorContext({
      step: { getName: () => 'TestStep' },
      stepResult: { success: true, skipped: false, durationMs: 100 },
      pipelineContext: { getData: () => ({ userId: 'user-1' }) }
    });

    failureContext = new PostProcessorContext({
      step: { getName: () => 'TestStep' },
      stepResult: {
        success: false,
        skipped: false,
        durationMs: 100,
        error: new Error('Step failed')
      },
      pipelineContext: { getData: () => ({ userId: 'user-1' }) }
    });
  });

  describe('Constructor', () => {
    it('should create empty chain', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      expect(chain.length).toBe(0);
      expect(chain.isEmpty()).toBe(true);
    });
  });

  describe('add', () => {
    it('should add processor to chain', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      const processor = createMockProcessor('p1');

      chain.add(processor);

      expect(chain.length).toBe(1);
      expect(chain.isEmpty()).toBe(false);
    });

    it('should support method chaining', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      const p1 = createMockProcessor('p1');
      const p2 = createMockProcessor('p2');

      const result = chain.add(p1).add(p2);

      expect(result).toBe(chain);
      expect(chain.length).toBe(2);
    });

    it('should add with configuration', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      const processor = createMockProcessor('p1');

      chain.add(processor, {
        when: WhenCondition.ON_SUCCESS,
        continueOnError: false
      });

      expect(chain.length).toBe(1);
    });

    it('should throw for invalid processor', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });

      expect(() => chain.add(null)).toThrow();
      expect(() => chain.add({})).toThrow('must have an execute method');
    });

    it('should throw for invalid when condition', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      const processor = createMockProcessor('p1');

      expect(() => chain.add(processor, { when: 'INVALID' })).toThrow('invalid when condition');
    });
  });

  describe('remove', () => {
    it('should remove processor by id', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      chain.add(createMockProcessor('p1'));
      chain.add(createMockProcessor('p2'));

      const removed = chain.remove('p1');

      expect(removed).toBe(true);
      expect(chain.length).toBe(1);
    });

    it('should return false if processor not found', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      chain.add(createMockProcessor('p1'));

      const removed = chain.remove('nonexistent');

      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all processors', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      chain.add(createMockProcessor('p1'));
      chain.add(createMockProcessor('p2'));

      chain.clear();

      expect(chain.length).toBe(0);
      expect(chain.isEmpty()).toBe(true);
    });
  });

  describe('execute', () => {
    it('should execute all processors', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      const p1 = createMockProcessor('p1');
      const p2 = createMockProcessor('p2');

      chain.add(p1).add(p2);
      const result = chain.execute(successContext);

      expect(result.success).toBe(true);
      expect(result.executed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(p1.execute).toHaveBeenCalled();
      expect(p2.execute).toHaveBeenCalled();
    });

    it('should throw for invalid context', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      expect(() => chain.execute({})).toThrow('must be a PostProcessorContext');
    });

    describe('WhenCondition: ALWAYS', () => {
      it('should execute regardless of step outcome', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const processor = createMockProcessor('p1');

        chain.add(processor, { when: WhenCondition.ALWAYS });

        // Success context
        chain.execute(successContext);
        expect(processor.execute).toHaveBeenCalledTimes(1);

        // Failure context
        chain.execute(failureContext);
        expect(processor.execute).toHaveBeenCalledTimes(2);
      });
    });

    describe('WhenCondition: ON_SUCCESS', () => {
      it('should execute only on success', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const processor = createMockProcessor('p1');

        chain.add(processor, { when: WhenCondition.ON_SUCCESS });

        // Success context - should execute
        chain.execute(successContext);
        expect(processor.execute).toHaveBeenCalledTimes(1);

        // Failure context - should skip
        const result = chain.execute(failureContext);
        expect(processor.execute).toHaveBeenCalledTimes(1);
        expect(result.skipped).toBe(1);
      });
    });

    describe('WhenCondition: ON_ERROR', () => {
      it('should execute only on error', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const processor = createMockProcessor('p1');

        chain.add(processor, { when: WhenCondition.ON_ERROR });

        // Success context - should skip
        let result = chain.execute(successContext);
        expect(result.skipped).toBe(1);
        expect(processor.execute).not.toHaveBeenCalled();

        // Failure context - should execute
        result = chain.execute(failureContext);
        expect(processor.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('WhenCondition: CUSTOM', () => {
      it('should skip if no expression engine', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const processor = createMockProcessor('p1');

        chain.add(processor, {
          when: WhenCondition.CUSTOM,
          customCondition: '{{step.success}} == true'
        });

        const result = chain.execute(successContext);
        expect(result.skipped).toBe(1);
        expect(mocks.logger.warn).toHaveBeenCalled();
      });

      it('should use expression engine if provided', () => {
        const mockExprEngine = {
          evaluate: jest.fn().mockReturnValue(true)
        };

        const chain = new PostProcessorChain({
          logger: mocks.logger,
          expressionEngine: mockExprEngine
        });
        const processor = createMockProcessor('p1');

        chain.add(processor, {
          when: WhenCondition.CUSTOM,
          customCondition: '{{step.success}} == true'
        });

        chain.execute(successContext);
        expect(mockExprEngine.evaluate).toHaveBeenCalled();
        expect(processor.execute).toHaveBeenCalled();
      });
    });

    describe('Error handling', () => {
      it('should continue on error by default', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const p1 = createMockProcessor('p1', false); // fails
        const p2 = createMockProcessor('p2', true); // succeeds

        chain.add(p1).add(p2);
        const result = chain.execute(successContext);

        expect(result.executed).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.chainStopped).toBe(false);
        expect(p2.execute).toHaveBeenCalled();
      });

      it('should stop chain if continueOnError is false', () => {
        const chain = new PostProcessorChain({ logger: mocks.logger });
        const p1 = createMockProcessor('p1', false); // fails
        const p2 = createMockProcessor('p2', true); // succeeds

        chain.add(p1, { continueOnError: false }).add(p2);

        const result = chain.execute(successContext);

        expect(result.executed).toBe(1);
        expect(result.failed).toBe(1);
        expect(result.chainStopped).toBe(true);
        expect(result.skipped).toBe(1); // p2 was skipped
        expect(p2.execute).not.toHaveBeenCalled();
      });
    });
  });

  describe('createContext', () => {
    it('should create context from step data', () => {
      const step = { getName: () => 'TestStep' };
      const stepResult = { success: true, skipped: false, durationMs: 100 };
      const pipelineContext = { getData: () => ({ data: 'value' }) };

      const context = PostProcessorChain.createContext(step, stepResult, pipelineContext);

      expect(context).toBeInstanceOf(PostProcessorContext);
      expect(context.step).toBe(step);
      expect(context.stepResult).toBe(stepResult);
    });

    it('should include metadata', () => {
      const step = { getName: () => 'TestStep' };
      const stepResult = { success: true, skipped: false, durationMs: 100 };
      const pipelineContext = { getData: () => ({}) };

      const context = PostProcessorChain.createContext(step, stepResult, pipelineContext, {
        custom: 'metadata'
      });

      expect(context.metadata).toEqual({ custom: 'metadata' });
    });
  });

  describe('getSummary', () => {
    it('should return chain summary', () => {
      const chain = new PostProcessorChain({ logger: mocks.logger });
      chain.add(createMockProcessor('p1'), { when: WhenCondition.ON_SUCCESS });
      chain.add(createMockProcessor('p2'), { when: WhenCondition.ALWAYS, continueOnError: false });

      const summary = chain.getSummary();

      expect(summary).toHaveLength(2);
      expect(summary[0]).toEqual({
        id: 'p1',
        name: 'Mockp1',
        when: WhenCondition.ON_SUCCESS,
        continueOnError: true
      });
      expect(summary[1].continueOnError).toBe(false);
    });
  });
});
