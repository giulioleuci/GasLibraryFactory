import type { JobProperties, JobServices, IterationLevel } from '../types.js';
/**
 * @file JobRunnerLib/src/QueueProgressTracker.js
 * @description Tracks job progress and calculates exact total actions from iteration levels.
 * Extracted from JobStateManager and JobExecutor for improved separation of concerns.
 */

export class QueueProgressTracker {
  declare jobName: string;
  declare _propertiesService: JobProperties;

  constructor(jobName: string, propertiesService: JobProperties) {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error('QueueProgressTracker: jobName is required and must be a non-empty string');
    }
    if (!propertiesService || typeof propertiesService !== 'object') {
      throw new Error('QueueProgressTracker: propertiesService is required and must be an object');
    }
    this.jobName = jobName;
    this._propertiesService = propertiesService;
  }

  _key(suffix: string) {
    return `${suffix}_${this.jobName}`;
  }

  saveProgress(progress: unknown) {
    this._propertiesService.setObjectProperty(this._key('progress'), progress);
  }

  reset() {
    this._propertiesService.deleteProperty(this._key('progress'));
  }

  _calculateExactTotal(levels: IterationLevel[], services: JobServices) {
    function calculateRecursively(levelIndex: number, currentContext: Record<string, unknown>) {
      if (levelIndex >= levels.length) {
        return 1;
      }

      const level = levels[levelIndex];

      if (levelIndex === levels.length - 1) {
        if (typeof level.countGenerator !== 'function') {
          throw new Error(`countGenerator not defined for level '${level.name}'`);
        }
        return level.countGenerator(currentContext, services);
      }

      if (typeof level.elementsGenerator !== 'function') {
        throw new Error(`elementsGenerator not defined for level '${level.name}'`);
      }
      const elements = level.elementsGenerator(currentContext, services);
      const filteredElements = level.filter
        ? elements.filter((el) => level.filter!(el, services))
        : elements;

      let subTotal = 0;
      for (const element of filteredElements) {
        const childContext = {
          ...currentContext,
          [level.name]: element
        };
        subTotal += calculateRecursively(levelIndex + 1, childContext);
      }
      return subTotal;
    }

    if (!levels || levels.length === 0) {
      return 1;
    }

    return calculateRecursively(0, {});
  }
}
