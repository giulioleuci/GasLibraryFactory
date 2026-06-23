/**
 * @file JobRunnerLib/src/JobDefinitionRegistry.js
 * @description Service for dynamic management of job definition registry.
 * @version 2.0
 */

import { Registry } from '@CoreUtilsLib';

/**
 * Centralized registry for dynamic job definition management.
 * Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
 * all job-specific validation, logging, and messages remain here.
 *
 * @class
 */
export class JobDefinitionRegistry {
  /**
   * @param {Object} logger Logger instance (must implement debug, warn, error).
   * @throws {Error} If logger is null or missing required methods.
   */
  constructor(logger) {
    if (logger === null || logger === undefined) {
      throw new Error('JobDefinitionRegistry: logger is required and cannot be null or undefined');
    }
    if (typeof logger !== 'object') {
      throw new Error('JobDefinitionRegistry: logger must be of type object');
    }
    for (const method of ['debug', 'warn', 'error']) {
      if (typeof logger[method] !== 'function') {
        throw new Error(`JobDefinitionRegistry: logger must have method: ${method}`);
      }
    }

    this.logger = logger;
    this.definitions = new Registry({ entityName: 'job' });
    this.logger.debug('JobDefinitionRegistry: Instance created with empty registry');
  }

  /**
   * Registers a job definition.
   */
  register(jobNameOrDefinition, jobDefinition) {
    let jobName = jobNameOrDefinition;
    let definition = jobDefinition;

    if (typeof jobName !== 'string' || jobName.length === 0) {
      throw new Error('JobDefinitionRegistry.register: Job name must be a non-empty string');
    }
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      throw new Error('JobDefinitionRegistry.register: Job definition must be a valid object');
    }

    this._validateJobDefinition(jobName, definition);

    if (definition.description === undefined || definition.description === null) {
      definition.description = '';
    }

    if (this.definitions.has(jobName)) {
      this.logger.warn(`JobDefinitionRegistry.register: Overwriting existing definition for job '${jobName}'`);
    }

    this.definitions.set(jobName, definition);
    this.logger.debug(`JobDefinitionRegistry.register: Job '${jobName}' registered successfully`);
  }

  /**
   * Retrieves a registered definition.
   */
  getDefinition(jobName) {
    if (typeof jobName !== 'string' || jobName.length === 0) {
      this.logger.error('JobDefinitionRegistry.getDefinition: Job name must be a non-empty string');
      return null;
    }
    if (!this.definitions.has(jobName)) {
      this.logger.error(`JobDefinitionRegistry.getDefinition: Job '${jobName}' not found in registry`);
      return null;
    }
    this.logger.debug(`JobDefinitionRegistry.getDefinition: Job '${jobName}' retrieved successfully`);
    return this.definitions.get(jobName);
  }

  /**
   * Alias for getDefinition.
   */
  get(jobName) {
    return this.getDefinition(jobName);
  }

  /**
   * Lists all registered job identifiers.
   */
  listRegisteredJobs() {
    const jobs = Array.from(this.definitions.keys());
    this.logger.debug(`JobDefinitionRegistry.listRegisteredJobs: ${jobs.length} jobs registered`);
    return jobs;
  }

  /**
   * Alias for listRegisteredJobs.
   */
  listAll() {
    return this.listRegisteredJobs();
  }

  /**
   * Verifies job existence.
   */
  jobExists(jobName) {
    if (typeof jobName !== 'string' || jobName.length === 0) {
      return false;
    }
    return this.definitions.has(jobName);
  }

  /**
   * Removes a job definition.
   */
  removeJob(jobName) {
    if (typeof jobName !== 'string' || jobName.length === 0) {
      this.logger.error('JobDefinitionRegistry.removeJob: Job name must be a non-empty string');
      return false;
    }
    if (!this.definitions.has(jobName)) {
      this.logger.warn(`JobDefinitionRegistry.removeJob: Job '${jobName}' did not exist in registry`);
      return false;
    }
    this.definitions.unregister(jobName);
    this.logger.debug(`JobDefinitionRegistry.removeJob: Job '${jobName}' removed from registry`);
    return true;
  }

  /**
   * Registry telemetry.
   */
  getStatistics() {
    const stats = {
      totalJobs: this.definitions.size,
      jobsByCategory: this._calculateJobsByCategory(),
      jobsWithParameters: this._countJobsWithParameters()
    };
    this.logger.debug(`JobDefinitionRegistry.getStatistics: ${stats.totalJobs} total jobs in registry`);
    return stats;
  }

  /**
   * @private
   */
  _validateJobDefinition(jobName, jobDefinition) {
    if (jobDefinition.name === undefined || jobDefinition.name === null) {
      throw new Error(`JobDefinitionRegistry.register: Required field 'name' missing for job '${jobName}'`);
    }
    if (jobDefinition.action === undefined || jobDefinition.action === null) {
      throw new Error(`JobDefinitionRegistry.register: Required field 'action' missing for job '${jobName}'`);
    }
    if (typeof jobDefinition.action !== 'function') {
      throw new Error(`JobDefinitionRegistry.register: Field 'action' must be a function for job '${jobName}'`);
    }
    if (jobDefinition.requiredParameters !== undefined && !Array.isArray(jobDefinition.requiredParameters)) {
      throw new Error(`JobDefinitionRegistry.register: Field 'requiredParameters' must be an array for job '${jobName}'`);
    }
    if (jobDefinition.iterationLevels !== undefined && !Array.isArray(jobDefinition.iterationLevels)) {
      throw new Error(`JobDefinitionRegistry.register: Field 'iterationLevels' must be an array for job '${jobName}'`);
    }
    if (jobDefinition.finalAction !== undefined && typeof jobDefinition.finalAction !== 'function') {
      throw new Error(`JobDefinitionRegistry.register: Field 'finalAction' must be a function for job '${jobName}'`);
    }
  }

  /**
   * @private
   */
  _calculateJobsByCategory() {
    const categories = {};
    for (const def of this.definitions.values()) {
      const description = String(def.description || '').toLowerCase();
      const name = String(def.name || '').toLowerCase();
      const text = `${name} ${description}`;
      let category;
      if (/generat/.test(text)) {
        category = 'Generation';
      } else if (/email|mail/.test(text)) {
        category = 'Email';
      } else if (/import/.test(text)) {
        category = 'Import';
      } else if (/structur|folder|infrastructure/.test(text)) {
        category = 'Infrastructure';
      } else {
        category = 'Other';
      }
      categories[category] = (categories[category] || 0) + 1;
    }
    return categories;
  }

  /**
   * @private
   */
  _countJobsWithParameters() {
    let count = 0;
    for (const def of this.definitions.values()) {
      if (Array.isArray(def.requiredParameters) && def.requiredParameters.length > 0) {
        count++;
      }
    }
    return count;
  }
}
