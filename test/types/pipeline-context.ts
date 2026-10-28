import type { LoggerService } from '@CoreUtilsLib';
import { Pipeline, PipelineContext, Step } from '@PipelineFramework';
import { DataProvider, ProviderRegistry } from '@ContextEngine';

interface Payload {
  count: number;
  doubled?: number;
}
declare const logger: Pick<LoggerService, 'debug' | 'info' | 'warn' | 'error'>;

class DoubleStep extends Step<Payload> {
  _executeLogic(context: PipelineContext<Payload>) {
    const count = context.get('count', 0) ?? 0;
    this.setResult(context, 'doubled', count * 2);
  }
}

const context = new PipelineContext<Payload>({ count: 2 });
const result: PipelineContext<Payload> = new Pipeline<Payload>(logger)
  .addStep(new DoubleStep('double', logger))
  .execute(context.getData());
const count: number | null | undefined = result.get('count');
// @ts-expect-error Known pipeline payload fields retain their declared value type.
context.set('count', '2');
new DoubleStep('wrong condition', logger, {
  // @ts-expect-error A condition must receive this pipeline's payload context.
  shouldExecuteCondition: (_context: PipelineContext<{ count: string }>) => true
});

class CountProvider extends DataProvider<{ id: string }, { count: number }> {
  _fetchData(parameters: { id: string }) {
    return { count: parameters.id.length };
  }
}
const provider = new CountProvider(logger);
const provided: { count: number } = provider.provide('count', { id: 'item' });
// @ts-expect-error Provider parameters preserve the custom provider contract.
provider.provide('count', { id: 1 });
const registry = new ProviderRegistry<CountProvider>(logger).registerSingleton('count', provider);
const fromRegistry: { count: number } = registry.get('count').provide('count', { id: 'item' });
void [count, provided, fromRegistry];
