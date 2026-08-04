/**
 * @typedef {Object} TreePosition
 * @property {number} depth
 * @property {boolean} isLast
 * @property {boolean[]} [ancestorHasNext]
 */

/**
 * @typedef {string|string[]|Object<string, string|number|boolean|null|undefined>} LogDetails
 */

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
  EXECUTED: '✅',
  SKIPPED: '⚠️',
  ERROR: '❌'
};

/** Pure formatter for deterministic hierarchical console lines. */
export class StructuredLogFormatter {
  /**
   * @param {Function} safeStringify Safe object serialization function.
   */
  constructor(safeStringify) {
    this._safeStringify = safeStringify;
  }

  /**
   * @param {TreePosition} [position]
   * @returns {string}
   */
  treePrefix(position = {}) {
    const depth = Math.max(0, Number.isFinite(position.depth) ? position.depth : 0);
    if (depth === 0) return '';
    const ancestors = Array.isArray(position.ancestorHasNext)
      ? position.ancestorHasNext
      : [];
    let prefix = '  ';
    for (let index = 0; index < depth - 1; index++) {
      prefix += ancestors[index] ? '│    ' : '     ';
    }
    return prefix + (position.isLast ? '└─ ' : '├─ ');
  }

  /** @returns {string[]} */
  jobStart(jobName, jobType) {
    return [
      MAJOR_BORDER,
      `🚀 [INIT] AVVIO JOB: ${this._text(jobName)} (Tipo: ${this._text(jobType)})`,
      MAJOR_BORDER
    ];
  }

  /** @returns {string[]} */
  jobResume(jobName, jobType, details) {
    const lines = [
      MAJOR_BORDER,
      `🔄 [RESUME] RIPRESA JOB: ${this._text(jobName)} (Tipo: ${this._text(jobType)})`
    ];
    const detailText = this._resumeDetails(details);
    if (detailText) lines.push(detailText);
    lines.push(MAJOR_BORDER);
    return lines;
  }

  /** @returns {string[]} */
  jobEnd(jobName, isSuccess, details) {
    const status = isSuccess ? '🏁 [COMPLETED]' : '❌ [FAILED]';
    let message = isSuccess
      ? `${status} Job '${this._text(jobName)}' completed successfully`
      : `${status} Job '${this._text(jobName)}' failed`;
    const detailText = this._detailsText(details);
    if (detailText) message += ` (${detailText})`;
    return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
  }

  /** @returns {string[]} */
  jobSuspended(jobName, details) {
    let message = `⏸️ [SUSPENDED] Job '${this._text(jobName)}' suspended`;
    const detailText = this._detailsText(details);
    if (detailText) message += ` (${detailText})`;
    return [MAJOR_BORDER, ...this._splitPlain(message), MAJOR_BORDER];
  }

  /** @returns {string[]} */
  batchStart(totalItems, label) {
    const count = this._count(totalItems);
    const itemLabel = label ? this._text(label) : count === 1 ? 'Item' : 'Items';
    return [SECTION_BORDER, '', `📑 [PROCESSING BATCH] (${count} ${itemLabel} in queue)`];
  }

  /** @returns {string[]} */
  itemStart(itemIndex, totalItems, itemLabel, identifier, kind = 'GENERIC') {
    const normalizedKind = Object.prototype.hasOwnProperty.call(ITEM_ICONS, kind)
      ? kind
      : 'GENERIC';
    return [
      '',
      `${ITEM_ICONS[normalizedKind]} [${normalizedKind} ${this._count(itemIndex)}/${this._count(totalItems)}] ${this._text(itemLabel)}: ${this._text(identifier)}`
    ];
  }

  /** @returns {string[]} */
  step(message, position) {
    return this._treeLines(this._text(message), position);
  }

  /** @returns {string[]} */
  pipelineStart(pipelineName, totalSteps, position) {
    const count = this._count(totalSteps);
    const unit = count === 1 ? 'step' : 'steps';
    return this._treeLines(
      `🛠️ [${this._text(pipelineName)}] Processing (${count} ${unit})`,
      position
    );
  }

  /** @returns {string[]} */
  pipelineStep(stepName, status, details, position) {
    const normalizedStatus = Object.prototype.hasOwnProperty.call(STEP_ICONS, status)
      ? status
      : this._text(status || 'UNKNOWN');
    const icon = STEP_ICONS[normalizedStatus] || ITEM_ICONS.GENERIC;
    const detailText = this._detailsText(details);
    let message = `${icon} [${this._text(stepName)}]: ${normalizedStatus}`;
    if (detailText) {
      message +=
        normalizedStatus === 'EXECUTED' && detailText.indexOf('completed in ') === 0
          ? ` ${detailText.substring('completed '.length)}`
          : ` (${detailText})`;
    }
    return this._treeLines(message, position);
  }

  /** @returns {string[]} */
  summary(label, durationMs, itemDetails, position) {
    let message = `${this._text(label)} in ${this._count(durationMs)}ms`;
    const details = this._detailsText(itemDetails);
    if (details) message += ` (${details})`;
    return this._treeLines(message, position);
  }

  _resumeDetails(details) {
    if (!details || typeof details !== 'object' || Array.isArray(details)) {
      return this._detailsText(details);
    }
    const values = [];
    if (details.checkpoint !== undefined) {
      values.push(`Checkpoint: ${this._text(details.checkpoint)}`);
    }
    if (details.percentage !== undefined) {
      values.push(`Progress: ${this._text(details.percentage)}%`);
    }
    return values.join('; ');
  }

  _detailsText(details) {
    if (details === undefined || details === null || details === '') return '';
    try {
      if (Array.isArray(details)) return details.map((item) => this._text(item)).join('\n');
      if (typeof details === 'object') return this._safeStringify(details);
      return String(details);
    } catch (_error) {
      return '[Unrenderable details]';
    }
  }

  _text(value) {
    try {
      if (value === undefined) return 'undefined';
      if (value === null) return 'null';
      if (typeof value === 'object') return this._safeStringify(value);
      return String(value);
    } catch (_error) {
      return '[Unrenderable details]';
    }
  }

  _count(value) {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  _splitPlain(message) {
    return String(message).split(/\r?\n/);
  }

  _treeLines(message, position = {}) {
    const lines = this._splitPlain(message);
    const firstPrefix = this.treePrefix(position);
    if (!firstPrefix) return lines;
    const continuation = firstPrefix.replace(/[├└]─ $/, '   ');
    return lines.map((line, index) => `${index === 0 ? firstPrefix : continuation}${line}`);
  }
}

export { ITEM_ICONS, MAJOR_BORDER, SECTION_BORDER };
