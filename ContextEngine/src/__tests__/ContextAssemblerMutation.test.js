/**
 * @file ContextEngine/src/__tests__/ContextAssemblerMutation.test.js
 * @description Tests for ContextAssembler's mutation-mode `assembleInto()`, and a
 * flat-mode parity regression proving `assemble()`'s existing behavior is
 * provably unchanged by the `assembleInto` addition (Task A1).
 */

import { ContextAssembler } from '../ContextAssembler';
import { ProviderRegistry } from '../ProviderRegistry';
import { InterceptorRegistry } from '../interceptors/InterceptorRegistry';
import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { MockFactory } from '../../../test/fakes';

describe('ContextAssembler - assembleInto (mutation mode)', () => {
  let mocks;
  let providerRegistry;
  let assembler;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    providerRegistry = new ProviderRegistry(mocks.logger);
    assembler = new ContextAssembler(mocks.logger, providerRegistry);
  });

  it('mutates the shared target across providers, later provider overwriting an earlier nested write (student -> piani / isBes)', () => {
    const studentProvider = {
      provide: (cdu) => {
        cdu.focus = cdu.focus || {};
        cdu.focus.alunno = { status: { isBes: false } };
      }
    };
    const pianiProvider = {
      provide: (cdu) => {
        if (cdu.focus.alunno.status.isBes === false) {
          cdu.focus.alunno.status.isBes = true;
        }
      }
    };
    providerRegistry.registerSingleton('student', studentProvider);
    providerRegistry.registerSingleton('piani', pianiProvider);

    const recipe = {
      providers: [
        { name: 'student', type: 'student' },
        { name: 'piani', type: 'piani' }
      ]
    };

    const cdu = {};
    const result = assembler.assembleInto(cdu, recipe, {});

    expect(result).toBe(cdu);
    expect(cdu.focus.alunno.status.isBes).toBe(true);
  });

  it('ignores provider return values entirely in mutation mode', () => {
    const provider = {
      provide: (cdu) => {
        cdu.written = true;
        return { would: 'be merged in flat mode' };
      }
    };
    providerRegistry.registerSingleton('p', provider);

    const recipe = { providers: [{ name: 'p1', type: 'p' }] };
    const cdu = {};
    const result = assembler.assembleInto(cdu, recipe, {});

    expect(result).toEqual({ written: true });
    expect(result.p1).toBeUndefined();
  });

  it('skips a provider whose condition evaluates false, without mutating the shared target', () => {
    const expressionEngine = { evaluate: jest.fn().mockReturnValue(false) };
    assembler = new ContextAssembler(mocks.logger, providerRegistry, expressionEngine);

    const provider = { provide: jest.fn() };
    providerRegistry.registerSingleton('p', provider);

    const recipe = { providers: [{ name: 'p1', type: 'p', condition: 'always false' }] };
    const cdu = { unchanged: true };
    const result = assembler.assembleInto(cdu, recipe, {});

    expect(provider.provide).not.toHaveBeenCalled();
    expect(result).toEqual({ unchanged: true });
  });

  it('invokes registered interceptors after each provider step with (name, sharedTarget, sharedTarget, options)', () => {
    class RecordingInterceptor extends ContextInterceptor {
      constructor(logger) {
        super(logger);
        this.calls = [];
      }
      _performIntercept(name, data, context, options) {
        this.calls.push({ name, data, context, options });
        return data;
      }
    }

    const interceptorRegistry = new InterceptorRegistry(mocks.logger);
    const interceptor = new RecordingInterceptor(mocks.logger);
    interceptorRegistry.registerSingleton('RecordingInterceptor', interceptor);

    assembler = new ContextAssembler(
      mocks.logger,
      providerRegistry,
      null,
      null,
      interceptorRegistry
    );

    const provider = {
      provide: (cdu) => {
        cdu.marker = 'set';
      }
    };
    providerRegistry.registerSingleton('p', provider);

    const recipe = { providers: [{ name: 'p1', type: 'p' }] };
    const cdu = {};
    const opts = { someOption: true };
    assembler.assembleInto(cdu, recipe, {}, opts);

    expect(interceptor.calls).toHaveLength(1);
    expect(interceptor.calls[0].name).toBe('p1');
    expect(interceptor.calls[0].data).toBe(cdu);
    expect(interceptor.calls[0].context).toBe(cdu);
    expect(interceptor.calls[0].options).toBe(opts);
  });

  it('throws Error on invalid sharedTarget', () => {
    const recipe = { providers: [{ name: 'p1', type: 'p' }] };
    expect(() => assembler.assembleInto(null, recipe)).toThrow(
      'ContextAssembler.assembleInto: sharedTarget is required and must be an object'
    );
  });
});

describe('ContextAssembler - flat mode parity regression (assemble() unchanged by assembleInto addition)', () => {
  // This mirrors ContextAssembler.test.js's own DataProvider-based fixtures and
  // MockFactory conventions to prove flat-mode assemble() is not affected by
  // the assembleInto addition. See ContextAssembler.test.js for the full
  // pre-existing flat-mode suite, which must also stay green unmodified.
  it('assemble() still returns a flat, provider-name-keyed map (not mutation-mode behavior)', () => {
    const mocks = MockFactory.createAllJest();
    const providerRegistry = new ProviderRegistry(mocks.logger);

    const provider = {
      provide: (name, parameters) => ({ id: parameters.userId, name: `User ${parameters.userId}` })
    };
    providerRegistry.registerSingleton('UserDataProvider', provider);

    const assembler = new ContextAssembler(mocks.logger, providerRegistry);

    const recipe = {
      providers: [{ name: 'userData', type: 'UserDataProvider', parameters: { userId: '@userId' } }]
    };

    const context = assembler.assemble(recipe, { userId: 123 });

    expect(context).toEqual({ userData: { id: 123, name: 'User 123' } });
    // Flat mode result is a fresh object, never the initialParams/sharedTarget.
    expect(context).not.toBe(recipe);
  });
});
