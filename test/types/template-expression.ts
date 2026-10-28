import { FilterStrategy, Mustache } from '@WorkspaceTemplateEngine';
import { ExpressionParserService, ExpressionEvaluatorService } from '@GasExpressionEngineLib';
import type { LoggerService } from '@CoreUtilsLib';
import type jsep from 'jsep';

declare const logger: Pick<LoggerService, 'debug' | 'info' | 'warn' | 'error'>;
class LabelFilter extends FilterStrategy<number, string, [prefix: string]> {
  getName() {
    return 'label';
  }
  execute(value: number, prefix: string) {
    return `${prefix}:${value}`;
  }
}
const label: string = new LabelFilter().execute(42, 'item');
void label;
const mustache = new Mustache({ logger });
mustache.registerFilter<number, string, []>('numericLabel', (value: number) => String(value));
// @ts-expect-error A numeric-input filter cannot require a string-input callback.
mustache.registerFilter<number, string, []>('wrongCallback', (value: string) => value);
const parser = new ExpressionParserService(logger);
const ast: jsep.Expression = parser.parse('42');
const evaluator = new ExpressionEvaluatorService(logger, parser, {
  resolve: (template: string) => template,
  processString: (template: string) => template
});
const literal = { type: 'Literal' as const, value: 42, raw: '42' };
const upstreamLiteral: jsep.Literal = literal;
const result: boolean = evaluator.evaluateAst(literal, {});
void ast;
void upstreamLiteral;
void result;
