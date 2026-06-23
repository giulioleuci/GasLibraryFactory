/**
 * @file PipelineFramework/src/postprocessor/__tests__/ValueSource.test.js
 * @description Unit tests for ValueSource class
 */

import { ValueSource, ValueSourceType, isValidValueSourceType } from '../ValueSource';

describe('ValueSourceType', () => {
  it('should have all required types', () => {
    expect(ValueSourceType.LITERAL).toBe('LITERAL');
    expect(ValueSourceType.CONTEXT).toBe('CONTEXT');
    expect(ValueSourceType.STEP_OUTPUT).toBe('STEP_OUTPUT');
    expect(ValueSourceType.EXPRESSION).toBe('EXPRESSION');
    expect(ValueSourceType.TIMESTAMP).toBe('TIMESTAMP');
  });

  it('should be frozen', () => {
    expect(Object.isFrozen(ValueSourceType)).toBe(true);
  });
});

describe('isValidValueSourceType', () => {
  it('should return true for valid types', () => {
    expect(isValidValueSourceType('LITERAL')).toBe(true);
    expect(isValidValueSourceType('CONTEXT')).toBe(true);
    expect(isValidValueSourceType('STEP_OUTPUT')).toBe(true);
    expect(isValidValueSourceType('EXPRESSION')).toBe(true);
    expect(isValidValueSourceType('TIMESTAMP')).toBe(true);
  });

  it('should return false for invalid types', () => {
    expect(isValidValueSourceType('INVALID')).toBe(false);
    expect(isValidValueSourceType('')).toBe(false);
    expect(isValidValueSourceType(null)).toBe(false);
  });
});

describe('ValueSource', () => {
  describe('Static Factory Methods', () => {
    describe('literal', () => {
      it('should create literal value source', () => {
        const source = ValueSource.literal('test');
        expect(source.type).toBe(ValueSourceType.LITERAL);
        expect(source.literal).toBe('test');
      });

      it('should handle various literal types', () => {
        expect(ValueSource.literal(123).literal).toBe(123);
        expect(ValueSource.literal(true).literal).toBe(true);
        expect(ValueSource.literal(null).literal).toBe(null);
        expect(ValueSource.literal({ key: 'value' }).literal).toEqual({ key: 'value' });
      });
    });

    describe('context', () => {
      it('should create context value source', () => {
        const source = ValueSource.context('user.email');
        expect(source.type).toBe(ValueSourceType.CONTEXT);
        expect(source.contextPath).toBe('user.email');
      });

      it('should throw for invalid path', () => {
        expect(() => ValueSource.context('')).toThrow();
        expect(() => ValueSource.context(null)).toThrow();
        expect(() => ValueSource.context(123)).toThrow();
      });
    });

    describe('stepOutput', () => {
      it('should create step output value source', () => {
        const source = ValueSource.stepOutput('documentUrl');
        expect(source.type).toBe(ValueSourceType.STEP_OUTPUT);
        expect(source.outputKey).toBe('documentUrl');
      });

      it('should throw for invalid key', () => {
        expect(() => ValueSource.stepOutput('')).toThrow();
        expect(() => ValueSource.stepOutput(null)).toThrow();
      });
    });

    describe('expression', () => {
      it('should create expression value source', () => {
        const source = ValueSource.expression('{{count}} + 1');
        expect(source.type).toBe(ValueSourceType.EXPRESSION);
        expect(source.expression).toBe('{{count}} + 1');
      });

      it('should throw for invalid expression', () => {
        expect(() => ValueSource.expression('')).toThrow();
        expect(() => ValueSource.expression(null)).toThrow();
      });
    });

    describe('timestamp', () => {
      it('should create timestamp value source without format', () => {
        const source = ValueSource.timestamp();
        expect(source.type).toBe(ValueSourceType.TIMESTAMP);
        expect(source.format).toBeNull();
      });

      it('should create timestamp value source with format', () => {
        const source = ValueSource.timestamp('yyyy-MM-dd');
        expect(source.type).toBe(ValueSourceType.TIMESTAMP);
        expect(source.format).toBe('yyyy-MM-dd');
      });
    });
  });

  describe('fromConfig', () => {
    it('should create from LITERAL config', () => {
      const source = ValueSource.fromConfig({ type: 'LITERAL', literal: 'value' });
      expect(source.type).toBe(ValueSourceType.LITERAL);
      expect(source.literal).toBe('value');
    });

    it('should create from CONTEXT config', () => {
      const source = ValueSource.fromConfig({ type: 'CONTEXT', contextPath: 'user.id' });
      expect(source.type).toBe(ValueSourceType.CONTEXT);
      expect(source.contextPath).toBe('user.id');
    });

    it('should create from STEP_OUTPUT config', () => {
      const source = ValueSource.fromConfig({ type: 'STEP_OUTPUT', outputKey: 'result' });
      expect(source.type).toBe(ValueSourceType.STEP_OUTPUT);
      expect(source.outputKey).toBe('result');
    });

    it('should create from EXPRESSION config', () => {
      const source = ValueSource.fromConfig({ type: 'EXPRESSION', expression: '1 + 1' });
      expect(source.type).toBe(ValueSourceType.EXPRESSION);
      expect(source.expression).toBe('1 + 1');
    });

    it('should create from TIMESTAMP config', () => {
      const source = ValueSource.fromConfig({ type: 'TIMESTAMP', format: 'ISO' });
      expect(source.type).toBe(ValueSourceType.TIMESTAMP);
      expect(source.format).toBe('ISO');
    });

    it('should throw for invalid config', () => {
      expect(() => ValueSource.fromConfig(null)).toThrow();
      expect(() => ValueSource.fromConfig({})).toThrow();
      expect(() => ValueSource.fromConfig({ type: 'INVALID' })).toThrow();
    });
  });

  describe('toObject', () => {
    it('should convert LITERAL to object', () => {
      const source = ValueSource.literal('test');
      expect(source.toObject()).toEqual({
        type: 'LITERAL',
        literal: 'test'
      });
    });

    it('should convert CONTEXT to object', () => {
      const source = ValueSource.context('user.email');
      expect(source.toObject()).toEqual({
        type: 'CONTEXT',
        contextPath: 'user.email'
      });
    });

    it('should convert STEP_OUTPUT to object', () => {
      const source = ValueSource.stepOutput('documentId');
      expect(source.toObject()).toEqual({
        type: 'STEP_OUTPUT',
        outputKey: 'documentId'
      });
    });

    it('should convert EXPRESSION to object', () => {
      const source = ValueSource.expression('{{x}} + {{y}}');
      expect(source.toObject()).toEqual({
        type: 'EXPRESSION',
        expression: '{{x}} + {{y}}'
      });
    });

    it('should convert TIMESTAMP to object', () => {
      const source = ValueSource.timestamp('yyyy-MM-dd');
      expect(source.toObject()).toEqual({
        type: 'TIMESTAMP',
        format: 'yyyy-MM-dd'
      });
    });

    it('should omit format for TIMESTAMP without format', () => {
      const source = ValueSource.timestamp();
      expect(source.toObject()).toEqual({
        type: 'TIMESTAMP'
      });
    });
  });
});
