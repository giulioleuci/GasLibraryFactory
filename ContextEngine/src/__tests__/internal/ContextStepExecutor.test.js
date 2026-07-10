import { ContextStepExecutor } from '../../internal/ContextStepExecutor';
import { ContextEngineError } from '../../internal/errors/ContextEngineError';

describe('ContextStepExecutor', () => {
  let facade;
  let executor;

  beforeEach(() => {
    // Mock logger
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock provider registry
    const providerRegistry = {
      get: jest.fn()
    };

    // Mock dependency resolver
    const dependencyResolver = {
      resolveAll: jest.fn()
    };

    // Mock recipe parser
    const recipeParser = {
      parse: jest.fn()
    };

    // Setup facade mock
    facade = {
      _logger: logger,
      _providerRegistry: providerRegistry,
      _dependencyResolver: dependencyResolver,
      _recipeParser: recipeParser,
      // Optional components that can be overridden in tests
      _expressionEngine: undefined,
      _exceptionService: undefined,
      _postProcessor: undefined,
      _interceptorRegistry: undefined,
      _maxRetries: 3
    };

    executor = new ContextStepExecutor(facade);
  });

  describe('_evaluateCondition', () => {
    it('should return true if no condition is provided', () => {
      const result = executor._evaluateCondition(null, {}, {});
      expect(result).toBe(true);
    });

    it('should return true and log warning if condition exists but no expression engine', () => {
      const condition = 'x > 5';
      const result = executor._evaluateCondition(condition, {}, {});

      expect(result).toBe(true);
      expect(facade._logger.warn).toHaveBeenCalledWith(
        'Condition specified but no expression engine provided - defaulting to true'
      );
    });

    it('should evaluate condition using expression engine', () => {
      const condition = 'x > 5';
      const initialParams = { x: 10 };
      const providerResults = { y: 20 };

      facade._expressionEngine = {
        evaluate: jest.fn().mockReturnValue(true)
      };

      const result = executor._evaluateCondition(condition, initialParams, providerResults);

      expect(result).toBe(true);
      expect(facade._expressionEngine.evaluate).toHaveBeenCalledWith(condition, {
        ...initialParams,
        ...providerResults
      });
      expect(facade._logger.debug).toHaveBeenCalledWith(
        `Condition '${condition}' evaluated to: true`
      );
    });

    it('should evaluate condition to false', () => {
      const condition = 'x > 5';

      facade._expressionEngine = {
        evaluate: jest.fn().mockReturnValue(false)
      };

      const result = executor._evaluateCondition(condition, {}, {});

      expect(result).toBe(false);
      expect(facade._logger.debug).toHaveBeenCalledWith(
        `Condition '${condition}' evaluated to: false`
      );
    });

    it('should throw ContextEngineError on evaluation failure', () => {
      const condition = 'invalid condition';
      const evalError = new Error('Syntax error');

      facade._expressionEngine = {
        evaluate: jest.fn().mockImplementation(() => {
          throw evalError;
        })
      };

      expect(() => {
        executor._evaluateCondition(condition, {}, {});
      }).toThrow(ContextEngineError);

      expect(facade._logger.error).toHaveBeenCalledWith(
        `Failed to evaluate condition '${condition}': ${evalError.message}`
      );
    });
  });

  describe('_executeProvider', () => {
    let providerConfig;
    let mockProvider;

    beforeEach(() => {
      providerConfig = {
        name: 'testProvider',
        type: 'TestType',
        parameters: { param1: 'value1' }
      };

      mockProvider = {
        provide: jest.fn().mockReturnValue('providerResult')
      };

      facade._providerRegistry.get.mockReturnValue(mockProvider);
      facade._dependencyResolver.resolveAll.mockReturnValue({ resolvedParam1: 'resolvedValue1' });
    });

    it('should execute provider normally', () => {
      const initialParams = { a: 1 };
      const providerResults = { b: 2 };

      const result = executor._executeProvider(providerConfig, initialParams, providerResults);

      expect(result).toBe('providerResult');

      expect(facade._providerRegistry.get).toHaveBeenCalledWith('TestType');
      expect(facade._dependencyResolver.resolveAll).toHaveBeenCalledWith(
        providerConfig.parameters,
        initialParams,
        providerResults,
        'testProvider'
      );
      expect(mockProvider.provide).toHaveBeenCalledWith('testProvider', {
        resolvedParam1: 'resolvedValue1'
      });
      expect(facade._logger.info).toHaveBeenCalledWith(
        '[testProvider] Provider execution completed'
      );
    });

    it('should execute provider with retry if exceptionService is configured', () => {
      facade._exceptionService = {
        executeWithRetry: jest.fn().mockImplementation((fn) => fn())
      };

      const result = executor._executeProvider(providerConfig, {}, {});

      expect(result).toBe('providerResult');
      expect(facade._exceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        facade._maxRetries
      );
    });

    it('should apply post-processing if configured', () => {
      providerConfig.postProcess = [{ type: 'uppercase' }];

      facade._postProcessor = {
        process: jest.fn().mockReturnValue('PROVIDERRESULT')
      };

      const result = executor._executeProvider(providerConfig, {}, {});

      expect(result).toBe('PROVIDERRESULT');
      expect(facade._postProcessor.process).toHaveBeenCalledWith(
        providerConfig.postProcess,
        'providerResult',
        'testProvider'
      );
      expect(facade._logger.debug).toHaveBeenCalledWith(
        '[testProvider] Applying 1 post-processor(s)'
      );
    });

    it('should apply interceptors if configured', () => {
      const mockInterceptor1 = {
        intercept: jest.fn().mockImplementation((name, data) => data + ' intercepted1')
      };
      const mockInterceptor2 = {
        intercept: jest.fn().mockImplementation((name, data) => data + ' intercepted2')
      };

      facade._interceptorRegistry = {
        getAll: jest.fn().mockReturnValue([mockInterceptor1, mockInterceptor2])
      };

      const options = { someOption: true };
      const providerResults = { existing: 'data' };

      const result = executor._executeProvider(providerConfig, {}, providerResults, options);

      expect(result).toBe('providerResult intercepted1 intercepted2');
      expect(mockInterceptor1.intercept).toHaveBeenCalledWith(
        'testProvider',
        'providerResult',
        providerResults,
        options
      );
      expect(mockInterceptor2.intercept).toHaveBeenCalledWith(
        'testProvider',
        'providerResult intercepted1',
        providerResults,
        options
      );
    });

    it('should not apply interceptors if registry returns empty array', () => {
      facade._interceptorRegistry = {
        getAll: jest.fn().mockReturnValue([])
      };

      const result = executor._executeProvider(providerConfig, {}, {});

      expect(result).toBe('providerResult');
      expect(facade._logger.debug).not.toHaveBeenCalledWith(
        expect.stringContaining('Applying 0 interceptor(s)')
      );
    });
  });

  describe('assemble', () => {
    it('should throw Error on missing or invalid recipe', () => {
      expect(() => executor.assemble(null)).toThrow(
        'ContextAssembler.assemble: recipe is required and must be an object'
      );
      expect(() => executor.assemble('invalid')).toThrow(
        'ContextAssembler.assemble: recipe is required and must be an object'
      );
    });

    it('should throw Error on invalid initialParams', () => {
      expect(() => executor.assemble({}, 'invalid')).toThrow(
        'ContextAssembler.assemble: initialParams must be an object or null'
      );
    });

    it('should throw Error on invalid options', () => {
      expect(() => executor.assemble({}, {}, 'invalid')).toThrow(
        'ContextAssembler.assemble: options must be an object or null'
      );
    });

    it('should successfully parse recipe and execute providers', () => {
      const recipe = {
        providers: [
          { name: 'p1', type: 't1' },
          { name: 'p2', type: 't2' }
        ]
      };

      facade._recipeParser.parse.mockReturnValue(recipe);

      // Spy on internal methods
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(true);
      jest
        .spyOn(executor, '_executeProvider')
        .mockReturnValueOnce('result1')
        .mockReturnValueOnce('result2');

      const initialParams = { initial: true };
      const options = { opt: true };

      const result = executor.assemble(recipe, initialParams, options);

      expect(result).toEqual({ p1: 'result1', p2: 'result2' });
      expect(facade._recipeParser.parse).toHaveBeenCalledWith(recipe);

      // Verify evaluateCondition was called correctly
      expect(executor._evaluateCondition).toHaveBeenCalledTimes(2);
      // We check array matchers for context because the context object is mutated during execution
      expect(executor._evaluateCondition.mock.calls[0][0]).toBeUndefined();
      expect(executor._evaluateCondition.mock.calls[0][1]).toEqual(initialParams);

      expect(executor._evaluateCondition.mock.calls[1][0]).toBeUndefined();
      expect(executor._evaluateCondition.mock.calls[1][1]).toEqual(initialParams);

      // Verify executeProvider was called correctly
      expect(executor._executeProvider).toHaveBeenCalledTimes(2);
      expect(executor._executeProvider.mock.calls[0][0]).toEqual(recipe.providers[0]);
      expect(executor._executeProvider.mock.calls[0][1]).toEqual(initialParams);
      expect(executor._executeProvider.mock.calls[0][3]).toEqual(options);

      expect(executor._executeProvider.mock.calls[1][0]).toEqual(recipe.providers[1]);
      expect(executor._executeProvider.mock.calls[1][1]).toEqual(initialParams);
      expect(executor._executeProvider.mock.calls[1][3]).toEqual(options);
    });

    it('should skip providers when condition evaluates to false', () => {
      const recipe = {
        providers: [
          { name: 'p1', type: 't1' },
          { name: 'p2', type: 't2', condition: 'false' },
          { name: 'p3', type: 't3' }
        ]
      };

      facade._recipeParser.parse.mockReturnValue(recipe);

      jest
        .spyOn(executor, '_evaluateCondition')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      jest
        .spyOn(executor, '_executeProvider')
        .mockReturnValueOnce('result1')
        .mockReturnValueOnce('result3');

      const result = executor.assemble(recipe);

      expect(result).toEqual({ p1: 'result1', p3: 'result3' });
      expect(executor._executeProvider).toHaveBeenCalledTimes(2);
      expect(facade._logger.info).toHaveBeenCalledWith('[p2] Skipped (condition not met)');
    });

    it('should handle errors during execution and map to ContextEngineError', () => {
      const recipe = {
        providers: [{ name: 'p1', type: 't1' }]
      };

      facade._recipeParser.parse.mockReturnValue(recipe);
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(true);

      const execError = new Error('Provider failed');
      jest.spyOn(executor, '_executeProvider').mockImplementation(() => {
        throw execError;
      });

      expect(() => executor.assemble(recipe)).toThrow(ContextEngineError);
      expect(facade._logger.error).toHaveBeenCalledWith(
        '[p1] Provider execution failed: Provider failed'
      );
    });

    it('should rethrow ContextEngineError if one is caught during assembly', () => {
      const recipe = { providers: [] };
      const ceError = new ContextEngineError('Parse failed');

      facade._recipeParser.parse.mockImplementation(() => {
        throw ceError;
      });

      expect(() => executor.assemble(recipe)).toThrow(ceError);
    });

    it('should wrap unknown errors in ContextEngineError if caught during assembly', () => {
      const recipe = { providers: [] };
      const err = new Error('Parse failed');

      facade._recipeParser.parse.mockImplementation(() => {
        throw err;
      });

      expect(() => executor.assemble(recipe)).toThrow(ContextEngineError);
      expect(() => executor.assemble(recipe)).toThrow('Context assembly failed: Parse failed');
    });
  });

  describe('assembleAsync', () => {
    it('should call assemble with the same arguments', () => {
      jest.spyOn(executor, 'assemble').mockReturnValue({ result: true });

      const recipe = { p: 1 };
      const params = { a: 1 };
      const options = { b: 2 };

      const result = executor.assembleAsync(recipe, params, options);

      expect(result).toEqual({ result: true });
      expect(executor.assemble).toHaveBeenCalledWith(recipe, params, options);
    });
  });

  describe('_executeMutatingProvider', () => {
    let providerConfig;
    let mockProvider;

    beforeEach(() => {
      providerConfig = { name: 'testProvider', type: 'TestType' };
      mockProvider = { provide: jest.fn().mockReturnValue('ignored return value') };
      facade._providerRegistry.get.mockReturnValue(mockProvider);
    });

    it('should call provider.provide(sharedTarget, initialParams, options) and not use dependencyResolver/postProcessor', () => {
      const sharedTarget = { focus: {} };
      const initialParams = { a: 1 };
      const options = { opt: true };

      executor._executeMutatingProvider(providerConfig, sharedTarget, initialParams, options);

      expect(mockProvider.provide).toHaveBeenCalledWith(sharedTarget, initialParams, options);
      expect(facade._dependencyResolver.resolveAll).not.toHaveBeenCalled();
      expect(facade._logger.info).toHaveBeenCalledWith(
        '[testProvider] Provider execution completed (mutate mode)'
      );
    });

    it('should use exceptionService for retry when configured', () => {
      facade._exceptionService = {
        executeWithRetry: jest.fn().mockImplementation((fn) => fn())
      };

      executor._executeMutatingProvider(providerConfig, {}, {}, {});

      expect(facade._exceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        facade._maxRetries
      );
    });

    it('should invoke registered interceptors with (name, sharedTarget, sharedTarget, options) and ignore their return value', () => {
      const sharedTarget = { focus: {} };
      const mockInterceptor = {
        intercept: jest.fn().mockReturnValue('some unrelated return value')
      };
      facade._interceptorRegistry = { getAll: jest.fn().mockReturnValue([mockInterceptor]) };

      const options = { someOption: true };

      executor._executeMutatingProvider(providerConfig, sharedTarget, {}, options);

      expect(mockInterceptor.intercept).toHaveBeenCalledWith(
        'testProvider',
        sharedTarget,
        sharedTarget,
        options
      );
    });
  });

  describe('assembleInto', () => {
    it('should throw Error on missing or invalid sharedTarget', () => {
      expect(() => executor.assembleInto(null, {})).toThrow(
        'ContextAssembler.assembleInto: sharedTarget is required and must be an object'
      );
      expect(() => executor.assembleInto('invalid', {})).toThrow(
        'ContextAssembler.assembleInto: sharedTarget is required and must be an object'
      );
    });

    it('should throw Error on missing or invalid recipe', () => {
      expect(() => executor.assembleInto({}, null)).toThrow(
        'ContextAssembler.assembleInto: recipe is required and must be an object'
      );
    });

    it('should throw Error on invalid initialParams', () => {
      expect(() => executor.assembleInto({}, {}, 'invalid')).toThrow(
        'ContextAssembler.assembleInto: initialParams must be an object or null'
      );
    });

    it('should throw Error on invalid options', () => {
      expect(() => executor.assembleInto({}, {}, {}, 'invalid')).toThrow(
        'ContextAssembler.assembleInto: options must be an object or null'
      );
    });

    it('runs providers in declared recipe order, later provider overwriting a nested path an earlier provider already wrote (mirrors student -> piani / isBes)', () => {
      const recipe = {
        providers: [
          { name: 'student', type: 'StudentType' },
          { name: 'piani', type: 'PianiType' }
        ]
      };
      facade._recipeParser.parse.mockReturnValue(recipe);
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(true);

      const studentProvider = {
        provide: jest.fn((sharedTarget) => {
          sharedTarget.focus = sharedTarget.focus || {};
          sharedTarget.focus.alunno = { status: { isBes: false } };
          return 'IGNORED';
        })
      };
      const pianiProvider = {
        provide: jest.fn((sharedTarget) => {
          // Reads what student already wrote, then conditionally overwrites it.
          if (sharedTarget.focus.alunno.status.isBes === false) {
            sharedTarget.focus.alunno.status.isBes = true;
          }
          return 'IGNORED_TOO';
        })
      };

      facade._providerRegistry.get.mockImplementation((type) => {
        if (type === 'StudentType') {
          return studentProvider;
        }
        if (type === 'PianiType') {
          return pianiProvider;
        }
        throw new Error('unexpected type ' + type);
      });

      const sharedTarget = {};
      const result = executor.assembleInto(sharedTarget, recipe, {}, {});

      expect(result).toBe(sharedTarget);
      expect(sharedTarget.focus.alunno.status.isBes).toBe(true);
      expect(studentProvider.provide).toHaveBeenCalled();
      expect(pianiProvider.provide).toHaveBeenCalled();
    });

    it('ignores provider return values entirely', () => {
      const recipe = { providers: [{ name: 'p1', type: 't1' }] };
      facade._recipeParser.parse.mockReturnValue(recipe);
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(true);

      const provider = { provide: jest.fn().mockReturnValue({ some: 'value' }) };
      facade._providerRegistry.get.mockReturnValue(provider);

      const sharedTarget = { untouched: true };
      const result = executor.assembleInto(sharedTarget, recipe, {}, {});

      expect(result).toEqual({ untouched: true });
      expect(result.p1).toBeUndefined();
    });

    it('should skip a provider whose condition evaluates false without mutating the shared target', () => {
      const recipe = {
        providers: [{ name: 'p1', type: 't1', condition: 'false' }]
      };
      facade._recipeParser.parse.mockReturnValue(recipe);
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(false);

      const provider = { provide: jest.fn() };
      facade._providerRegistry.get.mockReturnValue(provider);

      const sharedTarget = { untouched: true };
      const result = executor.assembleInto(sharedTarget, recipe, {}, {});

      expect(provider.provide).not.toHaveBeenCalled();
      expect(result).toEqual({ untouched: true });
      expect(facade._logger.info).toHaveBeenCalledWith('[p1] Skipped (condition not met)');
    });

    it('should wrap provider errors in ContextEngineError', () => {
      const recipe = { providers: [{ name: 'p1', type: 't1' }] };
      facade._recipeParser.parse.mockReturnValue(recipe);
      jest.spyOn(executor, '_evaluateCondition').mockReturnValue(true);

      const provider = {
        provide: jest.fn(() => {
          throw new Error('boom');
        })
      };
      facade._providerRegistry.get.mockReturnValue(provider);

      expect(() => executor.assembleInto({}, recipe, {}, {})).toThrow(ContextEngineError);
    });
  });
});
