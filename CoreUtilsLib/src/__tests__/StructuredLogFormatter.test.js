import { StructuredLogFormatter } from '../internal/StructuredLogFormatter.js';

describe('StructuredLogFormatter', () => {
  const safeStringify = (value) => {
    const seen = new WeakSet();
    return JSON.stringify(value, (_key, item) => {
      if (item && typeof item === 'object') {
        if (seen.has(item)) {
          return '[Circular reference]';
        }
        seen.add(item);
      }
      return item;
    });
  };
  let formatter;

  beforeEach(() => {
    formatter = new StructuredLogFormatter(safeStringify);
  });

  it('renders exact tree branches with ancestor continuations', () => {
    expect(formatter.treePrefix({ depth: 2, isLast: false, ancestorHasNext: [true] })).toBe(
      '  │    ├─ '
    );
    expect(formatter.treePrefix({ depth: 2, isLast: true, ancestorHasNext: [true] })).toBe(
      '  │    └─ '
    );
  });

  it.each([
    [{ depth: 0, isLast: false }, ''],
    [{ depth: -2, isLast: true }, ''],
    [{ depth: 2, isLast: false, ancestorHasNext: [] }, '       ├─ '],
    [{ depth: 2, isLast: true, ancestorHasNext: [false] }, '       └─ ']
  ])('normalizes invalid depth and missing ancestors', (position, expected) => {
    expect(formatter.treePrefix(position)).toBe(expected);
  });

  it('renders exact 70-character job start borders', () => {
    expect(formatter.jobStart('mail_E2E', 'INVIO_EMAIL_BATCH')).toEqual([
      '======================================================================',
      '🚀 [INIT] AVVIO JOB: mail_E2E (Tipo: INVIO_EMAIL_BATCH)',
      '======================================================================'
    ]);
    expect(formatter.jobStart('x', 'y')[0]).toHaveLength(70);
  });

  it('renders resume details without losing checkpoint or progress', () => {
    expect(
      formatter.jobResume('mail_E2E', 'INVIO_EMAIL_BATCH', {
        checkpoint: 'batch:4',
        percentage: 40
      })
    ).toEqual([
      '======================================================================',
      '🔄 [RESUME] RIPRESA JOB: mail_E2E (Tipo: INVIO_EMAIL_BATCH)',
      'Checkpoint: batch:4; Progress: 40%',
      '======================================================================'
    ]);
  });

  it('renders success, failure, and suspension terminal blocks', () => {
    expect(formatter.jobEnd('job-1', true)).toEqual([
      '======================================================================',
      "🏁 [COMPLETED] Job 'job-1' completed successfully",
      '======================================================================'
    ]);
    expect(formatter.jobEnd('job-1', false, 'boom')).toEqual([
      '======================================================================',
      "❌ [FAILED] Job 'job-1' failed (boom)",
      '======================================================================'
    ]);
    expect(formatter.jobSuspended('job-1', 'state saved')).toEqual([
      '======================================================================',
      "⏸️ [SUSPENDED] Job 'job-1' suspended (state saved)",
      '======================================================================'
    ]);
  });

  it('renders content-first timed job terminal envelopes', () => {
    expect(formatter.jobEnd('dynamic-name', true, { durationMs: 275 })).toEqual([
      '======================================================================',
      "🏁 [COMPLETED] Job 'dynamic-name' completed successfully (COMPLETED in 275ms)",
      '======================================================================'
    ]);
    expect(
      formatter.jobEnd('dynamic-name', false, { reason: 'cancelled', durationMs: 275 })
    ).toEqual([
      '======================================================================',
      "❌ [FAILED] Job 'dynamic-name' failed: cancelled (FAILED in 275ms)",
      '======================================================================'
    ]);
    expect(
      formatter.jobSuspended('dynamic-name', {
        reason: 'state saved; automatic resume scheduled',
        durationMs: 275
      })
    ).toEqual([
      '======================================================================',
      "⏸️ [SUSPENDED] Job 'dynamic-name' suspended: state saved; automatic resume scheduled (SUSPENDED after 275ms)",
      '======================================================================'
    ]);
  });

  it.each([
    [1, undefined, '📑 [PROCESSING BATCH] (1 Item in queue)'],
    [3, undefined, '📑 [PROCESSING BATCH] (3 Items in queue)'],
    [2, 'Messages', '📑 [PROCESSING BATCH] (2 Messages in queue)']
  ])('renders section border, blank line, and pluralized batch label', (count, label, line) => {
    expect(formatter.batchStart(count, label)).toEqual([
      '----------------------------------------------------------------------',
      '',
      line
    ]);
    expect(formatter.batchStart(count, label)[0]).toHaveLength(70);
  });

  it.each([
    ['DOCUMENT', '📄'],
    ['EMAIL', '✉️'],
    ['IMPORT', '📥'],
    ['RETRY', '🔁'],
    ['GENERIC', '📦'],
    ['UNKNOWN', '📦']
  ])('renders item icon for %s', (kind, icon) => {
    expect(formatter.itemStart(1, 3, 'Target', 'A', kind)).toEqual([
      '',
      `${icon} [${kind === 'UNKNOWN' ? 'GENERIC' : kind} 1/3] Target: A`
    ]);
  });

  it('renders content-first pipeline steps with timing after the status', () => {
    expect(
      formatter.pipelineStep(
        'GenerateName',
        'EXECUTED',
        { content: 'PDP_DSA_Rossi_Mario_2026', durationMs: 4 },
        { depth: 2, isLast: false, ancestorHasNext: [true] }
      )
    ).toEqual(['  │    ├─ ✅ [GenerateName] PDP_DSA_Rossi_Mario_2026 (EXECUTED in 4ms)']);

    expect(
      formatter.pipelineStep(
        'AnalyzeContext',
        'EXECUTED',
        { durationMs: 0 },
        { depth: 2, isLast: false, ancestorHasNext: [true] }
      )
    ).toEqual(['  │    ├─ ✅ [AnalyzeContext] EXECUTED in 0ms']);

    expect(
      formatter.pipelineStep(
        'ApplyPermissions',
        'EXECUTED',
        {
          content: { Editors: ['docente@example.edu'], Viewers: [] },
          durationMs: 2
        },
        { depth: 2, isLast: false, ancestorHasNext: [true] }
      )
    ).toEqual([
      '  │    ├─ ✅ [ApplyPermissions] Editors: docente@example.edu; Viewers: [] (EXECUTED in 2ms)'
    ]);
  });

  it('renders exact skipped and failed pipeline reasons from the detail envelope', () => {
    expect(
      formatter.pipelineStep(
        'ComposeEmail',
        'SKIPPED',
        { reason: 'condition not met' },
        {
          depth: 2,
          isLast: true,
          ancestorHasNext: [true]
        }
      )
    ).toEqual(['  │    └─ ⚠️ [ComposeEmail] condition not met (SKIPPED)']);

    expect(
      formatter.pipelineStep(
        'SendEmail',
        'ERROR',
        { reason: 'network', durationMs: 9 },
        { depth: 1, isLast: false, ancestorHasNext: [] }
      )
    ).toEqual(['  ├─ ❌ [SendEmail] network (FAILED in 9ms)']);
  });

  it('preserves legacy scalar, array, object, empty, and unknown pipeline details', () => {
    const position = { depth: 1, isLast: false, ancestorHasNext: [] };
    expect(formatter.pipelineStep('Load', 'EXECUTED', 'completed in 12ms', position)).toEqual([
      '  ├─ ✅ [Load] completed in 12ms (EXECUTED)'
    ]);
    expect(formatter.pipelineStep('Validate', 'SKIPPED', ['missing', 2], position)).toEqual([
      '  ├─ ⚠️ [Validate] missing',
      '     2 (SKIPPED)'
    ]);
    expect(formatter.pipelineStep('Send', 'ERROR', { code: 503 }, position)).toEqual([
      '  ├─ ❌ [Send] {"code":503} (FAILED)'
    ]);
    expect(formatter.pipelineStep('Other', 'UNKNOWN', undefined, position)).toEqual([
      '  ├─ 📦 [Other] UNKNOWN'
    ]);
    expect(formatter.pipelineStep('Empty', 'EXECUTED', {}, position)).toEqual([
      '  ├─ ✅ [Empty] EXECUTED'
    ]);
  });

  it('repeats tree indentation for multiline details', () => {
    expect(
      formatter.pipelineStep(
        'Validate',
        'ERROR',
        { reason: 'first\nsecond' },
        {
          depth: 2,
          isLast: false,
          ancestorHasNext: [true]
        }
      )
    ).toEqual(['  │    ├─ ❌ [Validate] first', '  │       second (FAILED)']);
  });

  it('safely renders circular object details', () => {
    const details = { name: 'root' };
    details.self = details;
    expect(formatter.summary('Done', 5, details)).toEqual([
      'Done: {"name":"root","self":"[Circular reference]"} (COMPLETED in 5ms)'
    ]);
  });

  it('degrades malformed details to safe text without throwing', () => {
    const broken = {};
    Object.defineProperty(broken, 'value', {
      enumerable: true,
      get() {
        throw new Error('no access');
      }
    });
    expect(() => formatter.jobEnd('job-1', false, broken)).not.toThrow();
    expect(formatter.jobEnd('job-1', false, broken)[1]).toContain('[Unrenderable details]');
  });

  it('renders pipeline start, generic step, and content-first summary positions', () => {
    expect(
      formatter.pipelineStart('NotificaPipeline', 3, {
        depth: 1,
        isLast: false,
        ancestorHasNext: []
      })
    ).toEqual(['  ├─ 🛠️ [NotificaPipeline] Processing (3 steps)']);
    expect(formatter.step('saved', { depth: 1, isLast: false, ancestorHasNext: [] })).toEqual([
      '  ├─ saved'
    ]);
    expect(
      formatter.summary('Document generated', 8572, 'PDP_DSA_Rossi_Mario_2026', {
        depth: 1,
        isLast: true,
        ancestorHasNext: []
      })
    ).toEqual(['  └─ Document generated: PDP_DSA_Rossi_Mario_2026 (COMPLETED in 8572ms)']);
    expect(formatter.summary('Done', 0, undefined)).toEqual(['Done: COMPLETED in 0ms']);
  });
});
