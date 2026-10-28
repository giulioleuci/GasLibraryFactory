export interface TreePosition {
  depth?: number;
  isLast?: boolean;
  ancestorHasNext?: boolean[];
}

export interface JobReport {
  jobType?: string;
  runCount?: number;
  totalDurationMs?: number;
  totale?: number;
  falliti?: number;
  dettagliFalliti?: string[];
  saltati?: number;
  dettagliSaltati?: string[];
}

interface DetailEnvelope {
  reason?: unknown;
  content?: unknown;
  durationMs?: unknown;
}

const MAJOR_BORDER = '='.repeat(70);
const SECTION_BORDER = '-'.repeat(70);

const ITEM_ICONS = {
  DOCUMENT: '📄',
  EMAIL: '✉️',
  IMPORT: '📥',
  RETRY: '🔁',
  GENERIC: '📦'
};

const STEP_ICONS = {
  EXECUTED: '▪️',
  SKIPPED: '▫️',
  ERROR: '🔺'
};

/** Pure formatter for deterministic hierarchical console lines. */
export class StructuredLogFormatter {
  declare _safeStringify: (value: unknown) => string;
  /**
   * @param {Function} safeStringify Safe object serialization function.
   */
  constructor(safeStringify: (value: unknown) => string) {
    this._safeStringify = safeStringify;
  }

  /**
   * @param {TreePosition} [position]
   * @returns {string}
   */
  treePrefix(position: TreePosition = {}) {
    const depth = Math.max(0, Number.isFinite(position.depth) ? position.depth! : 0);
    if (depth === 0) {
      return '';
    }
    const ancestors = Array.isArray(position.ancestorHasNext) ? position.ancestorHasNext : [];
    let prefix = '  ';
    for (let index = 0; index < depth - 1; index++) {
      prefix += ancestors[index] ? '│    ' : '     ';
    }
    return prefix + (position.isLast ? '└─ ' : '├─ ');
  }

  /** @returns {string[]} */
  jobStart(jobName: unknown, jobType: unknown) {
    return [
      MAJOR_BORDER,
      `🚀 [INIT] AVVIO JOB: ${this._text(jobName)} (Tipo: ${this._text(jobType)})`,
      MAJOR_BORDER
    ];
  }

  /** @returns {string[]} */
  jobResume(jobName: unknown, jobType: unknown, details?: unknown) {
    const lines = [
      MAJOR_BORDER,
      `🔄 [RESUME] RIPRESA JOB: ${this._text(jobName)} (Tipo: ${this._text(jobType)})`
    ];
    const detailText = this._resumeDetails(details);
    if (detailText) {
      lines.push(detailText);
    }
    lines.push(MAJOR_BORDER);
    return lines;
  }

  /** @returns {string[]} */
  jobEnd(jobName: unknown, isSuccess: boolean, details?: unknown) {
    const status = isSuccess ? '🏁 [COMPLETED]' : '❌ [FAILED]';
    let message = isSuccess
      ? `${status} Job '${this._text(jobName)}' completed successfully`
      : `${status} Job '${this._text(jobName)}' failed`;
    if (this._isDetailEnvelope(details)) {
      const content = this._detailsText(
        details.reason !== undefined ? details.reason : details.content
      );
      const duration = this._duration(details.durationMs);
      if (content) {
        message += `: ${content}`;
      }
      const terminalStatus = isSuccess ? 'COMPLETED' : 'FAILED';
      if (duration !== null) {
        message += ` (${terminalStatus} in ${duration}ms)`;
      } else if (content) {
        message += ` (${terminalStatus})`;
      }
      return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
    }
    const detailText = this._detailsText(details);
    if (detailText) {
      message += ` (${detailText})`;
    }
    return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
  }

  /** @returns {string[]} */
  jobSuspended(jobName: unknown, details?: unknown) {
    let message = `⏸️ [SUSPENDED] Job '${this._text(jobName)}' suspended`;
    if (this._isDetailEnvelope(details)) {
      const content = this._detailsText(
        details.reason !== undefined ? details.reason : details.content
      );
      const duration = this._duration(details.durationMs);
      if (content) {
        message += `: ${content}`;
      }
      if (duration !== null) {
        message += ` (SUSPENDED after ${duration}ms)`;
      } else if (content) {
        message += ' (SUSPENDED)';
      }
      return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
    }
    const detailText = this._detailsText(details);
    if (detailText) {
      message += ` (${detailText})`;
    }
    return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
  }

  /** @returns {string[]} */
  batchStart(totalItems: unknown, label?: unknown) {
    const count = this._count(totalItems);
    const itemLabel = label ? this._text(label) : count === 1 ? 'Item' : 'Items';
    return [SECTION_BORDER, '', `📑 [PROCESSING BATCH] (${count} ${itemLabel} in queue)`];
  }

  /** @returns {string[]} */
  itemStart(
    itemIndex: unknown,
    totalItems: unknown,
    itemLabel: unknown,
    identifier: unknown,
    kind = 'GENERIC'
  ) {
    const normalizedKind = Object.prototype.hasOwnProperty.call(ITEM_ICONS, kind)
      ? (kind as keyof typeof ITEM_ICONS)
      : 'GENERIC';
    return [
      '',
      `${ITEM_ICONS[normalizedKind]} [${normalizedKind} ${this._count(itemIndex)}/${this._count(totalItems)}] ${this._text(itemLabel)}: ${this._text(identifier)}`
    ];
  }

  /** @returns {string[]} */
  step(message: unknown, position?: TreePosition) {
    return this._treeLines(this._text(message), position);
  }

  /** @returns {string[]} */
  pipelineStart(pipelineName: unknown, totalSteps: unknown, position?: TreePosition) {
    const count = this._count(totalSteps);
    const unit = count === 1 ? 'step' : 'steps';
    return this._treeLines(
      `🛠️ [${this._text(pipelineName)}] Processing (${count} ${unit})`,
      position
    );
  }

  /** @returns {string[]} */
  pipelineStep(stepName: unknown, status: string, details?: unknown, position?: TreePosition) {
    const normalizedStatus = Object.prototype.hasOwnProperty.call(STEP_ICONS, status)
      ? status
      : this._text(status || 'UNKNOWN');
    const icon = STEP_ICONS[normalizedStatus as keyof typeof STEP_ICONS] || ITEM_ICONS.GENERIC;
    const envelope = this._isDetailEnvelope(details) ? details : null;
    const detailText = envelope
      ? envelope.reason !== undefined
        ? this._detailsText(envelope.reason)
        : this._contentText(envelope.content)
      : this._detailsText(details);
    const duration = envelope ? this._duration(envelope.durationMs) : null;
    const displayStatus = normalizedStatus === 'ERROR' ? 'FAILED' : normalizedStatus;
    const timedStatus = duration === null ? displayStatus : `${displayStatus} in ${duration}ms`;
    let message = `${icon} [${this._text(stepName)}]`;
    if (detailText) {
      message += ` ${detailText} (${timedStatus})`;
    } else {
      message += ` ${timedStatus}`;
    }
    return this._treeLines(message, position);
  }

  /** @returns {string[]} */
  summary(label: unknown, durationMs: unknown, itemDetails?: unknown, position?: TreePosition) {
    let message = `${this._text(label)}:`;
    const details = this._detailsText(itemDetails);
    if (details) {
      message += ` ${details} (COMPLETED in ${this._count(durationMs)}ms)`;
    } else {
      message += ` COMPLETED in ${this._count(durationMs)}ms`;
    }
    return this._treeLines(message, position);
  }

  /** @returns {string[]} Multi-line end-of-job report (job type, run count, cumulative real duration, task totals, skip and failure detail). */
  jobReport(details?: JobReport | null) {
    const d = details || {};
    const totale = this._count(d.totale);
    const falliti = this._count(d.falliti);
    const saltati = this._count(d.saltati);
    const riusciti = Math.max(0, totale - falliti - saltati);
    const icon = falliti > 0 ? '📊❌' : '📊✅';
    const lines = [
      MAJOR_BORDER,
      `${icon} [RIEPILOGO JOB] ${this._text(d.jobType)}`,
      `  Esecuzioni (run): ${d.runCount === undefined ? 1 : this._count(d.runCount)}`,
      `  Tempo totale esecuzione: ${this._count(d.totalDurationMs)}ms`,
      `  Task totali: ${totale}`,
      `  Eseguiti con successo: ${riusciti}`
    ];
    // Omitted when the caller does not track skips, so existing reports stay unchanged.
    if (d.saltati !== undefined) {
      lines.push(`  Saltati: ${saltati}`);
    }
    lines.push(`  Falliti: ${falliti}`);
    if (saltati > 0 && Array.isArray(d.dettagliSaltati) && d.dettagliSaltati.length > 0) {
      lines.push('  Dettaglio saltati:');
      for (const item of d.dettagliSaltati) {
        lines.push(`    - ${this._text(item)}`);
      }
    }
    if (falliti > 0 && Array.isArray(d.dettagliFalliti) && d.dettagliFalliti.length > 0) {
      lines.push('  Dettaglio fallimenti:');
      for (const item of d.dettagliFalliti) {
        lines.push(`    - ${this._text(item)}`);
      }
    }
    lines.push(MAJOR_BORDER);
    return lines;
  }

  _isDetailEnvelope(details: unknown): details is DetailEnvelope {
    return Boolean(
      details &&
      typeof details === 'object' &&
      !Array.isArray(details) &&
      (Object.prototype.hasOwnProperty.call(details, 'content') ||
        Object.prototype.hasOwnProperty.call(details, 'durationMs') ||
        Object.prototype.hasOwnProperty.call(details, 'reason'))
    );
  }

  _duration(value: unknown): number | null {
    return Number.isFinite(value) && (value as number) >= 0 ? (value as number) : null;
  }

  _resumeDetails(details: unknown): string {
    if (!details || typeof details !== 'object' || Array.isArray(details)) {
      return this._detailsText(details);
    }
    const values = [];
    if ((details as { checkpoint?: unknown }).checkpoint !== undefined) {
      values.push(`Checkpoint: ${this._text((details as { checkpoint?: unknown }).checkpoint)}`);
    }
    if ((details as { percentage?: unknown }).percentage !== undefined) {
      values.push(`Progress: ${this._text((details as { percentage?: unknown }).percentage)}%`);
    }
    return values.join('; ');
  }

  _contentText(content: unknown): string {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return this._detailsText(content);
    }
    try {
      return Object.keys(content)
        .map((key) => {
          const value = (content as Record<string, unknown>)[key];
          const rendered = Array.isArray(value)
            ? value.length === 0
              ? '[]'
              : value.map((item) => this._text(item)).join(', ')
            : this._text(value);
          return `${key}: ${rendered}`;
        })
        .join('; ');
    } catch (_error) {
      return '[Unrenderable details]';
    }
  }

  _detailsText(details: unknown): string {
    if (details === undefined || details === null || details === '') {
      return '';
    }
    try {
      if (Array.isArray(details)) {
        if (details.length === 0) {
          return '';
        }
        return details.map((item) => this._text(item)).join('\n');
      }
      if (typeof details === 'object') {
        if (Object.keys(details).length === 0) {
          return '';
        }
        return this._safeStringify(details);
      }
      return String(details);
    } catch (_error) {
      return '[Unrenderable details]';
    }
  }

  _text(value: unknown): string {
    try {
      if (value === undefined) {
        return 'undefined';
      }
      if (value === null) {
        return 'null';
      }
      if (typeof value === 'object') {
        return this._safeStringify(value);
      }
      return String(value);
    } catch (_error) {
      return '[Unrenderable details]';
    }
  }

  _count(value: unknown): number {
    return Number.isFinite(value) ? Math.max(0, value as number) : 0;
  }

  _splitPlain(message: unknown): string[] {
    return String(message).split(/\r?\n/);
  }

  _treeLines(message: unknown, position: TreePosition = {}): string[] {
    const lines = this._splitPlain(message);
    const firstPrefix = this.treePrefix(position);
    if (!firstPrefix) {
      return lines;
    }
    const continuation = firstPrefix.replace(/[├└]─ $/, '   ');
    return lines.map((line, index) => `${index === 0 ? firstPrefix : continuation}${line}`);
  }
}

export { ITEM_ICONS, MAJOR_BORDER, SECTION_BORDER };
