import { StructuredLogFormatter } from '../internal/StructuredLogFormatter.js';

describe('StructuredLogFormatter', () => {
  const safeStringify = (value) => {
    const seen = new WeakSet();
    return JSON.stringify(value, (_key, item) => {
      if (item && typeof item === 'object') {
        if (seen.has(item)) return '[Circular reference]';
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
    expect(formatter.jobResume('mail_E2E', 'INVIO_EMAIL_BATCH', {
      checkpoint: 'batch:4',
      percentage: 40
    })).toEqual([
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

  it('renders exact skipped pipeline step', () => {
    expect(
      formatter.pipelineStep('ComposeEmail', 'SKIPPED', 'condition not met', {
        depth: 2,
        isLast: true,
        ancestorHasNext: [true]
      })
    ).toEqual(['  │    └─ ⚠️ [ComposeEmail]: SKIPPED (condition not met)']);
  });

  it('renders every pipeline status and normalizes unknown status', () => {
    const position = { depth: 1, isLast: false, ancestorHasNext: [] };
    expect(formatter.pipelineStep('Load', 'EXECUTED', 'completed in 12ms', position)).toEqual([
      '  ├─ ✅ [Load]: EXECUTED in 12ms'
    ]);
    expect(formatter.pipelineStep('Send', 'ERROR', 'network', position)).toEqual([
      '  ├─ ❌ [Send]: ERROR (network)'
    ]);
    expect(formatter.pipelineStep('Other', 'UNKNOWN', undefined, position)).toEqual([
      '  ├─ 📦 [Other]: UNKNOWN'
    ]);
  });

  it('repeats tree indentation for multiline details', () => {
    expect(
      formatter.pipelineStep('Validate', 'ERROR', 'first\nsecond', {
        depth: 2,
        isLast: false,
        ancestorHasNext: [true]
      })
    ).toEqual([
      '  │    ├─ ❌ [Validate]: ERROR (first',
      '  │       second)'
    ]);
  });

  it('safely renders circular object details', () => {
    const details = { name: 'root' };
    details.self = details;
    expect(formatter.summary('Done', 5, details)).toEqual([
      'Done in 5ms ({"name":"root","self":"[Circular reference]"})'
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

  it('renders pipeline start, generic step, and summary positions', () => {
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
      formatter.summary('⏹️ Pipeline completed', 2599, 'No email sent', {
        depth: 1,
        isLast: true,
        ancestorHasNext: []
      })
    ).toEqual(['  └─ ⏹️ Pipeline completed in 2599ms (No email sent)']);
  });
});
