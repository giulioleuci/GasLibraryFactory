/**
 * @file SheetDBLib/src/multi/PartitionRouter.js
 * @description Router for directing queries to appropriate partitions.
 * @version 1.0.0
 */

import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
 * @class PartitionRouter
 * @description Decision engine for directing database operations to specific partitions based on configurable strategies.
 * Supports explicit ID mapping, tag filtering, round-robin load balancing, priority weighting, and custom resolution logic.
 *
 * @example
 * const router = new PartitionRouter(config, { logger });
 * const targets = router.route({ tags: ['active'], strategy: 'TAG_BASED' });
 */
export class PartitionRouter {
  /**
   * @param {PartitionConfiguration} configuration - Active multi-db topology.
   * @param {Object} [options={}] - Router operational parameters.
   * @param {Object} [options.logger=console] - Logger for routing trace.
   * @param {Function} [options.customRouter=null] - Optional logic for context-aware resolution.
   */
  constructor(configuration, options = {}) {
    if (!configuration) {
      throw new Error('PartitionConfiguration is required');
    }

    /**
     * Partition configuration.
     * @type {PartitionConfiguration}
     * @private
     */
    this._configuration = configuration;

    /**
     * Logger instance.
     * @type {Object}
     * @private
     */
    this._logger = options.logger || console;

    /**
     * Custom routing function.
     * @type {Function|null}
     * @private
     */
    this._customRouter = options.customRouter || null;

    /**
     * Round-robin counter for load balancing.
     * @type {number}
     * @private
     */
    this._roundRobinCounter = 0;
  }

  /**
   * @description Resolves one or more target partitions based on the provided context and active strategy.
   * @param {Object} [context={}] - Routing criteria.
   * @param {string} [context.partitionId] - Direct ID for EXPLICIT strategy.
   * @param {string} [context.strategy] - Temporary strategy override.
   * @param {string} [context.tag] - Metadata tag for TAG_BASED strategy.
   * @param {string[]} [context.tags] - Collection of tags for TAG_BASED strategy.
   * @param {'ALL'|'ANY'} [context.tagMatchMode='ALL'] - Tag matching logic.
   * @returns {DatabasePartition[]} Collection of partitions meeting the criteria.
   * @throws {Error} If strategy is unknown or no partitions satisfy the context.
   */
  route(context = {}) {
    const strategy = context.strategy || this._configuration.routingStrategy;

    this._logger.debug?.(`PartitionRouter: Routing with strategy ${strategy}`, context);

    let partitions;

    switch (strategy) {
      case RoutingStrategy.EXPLICIT:
        partitions = this._routeExplicit(context);
        break;

      case RoutingStrategy.TAG_BASED:
        partitions = this._routeByTag(context);
        break;

      case RoutingStrategy.ROUND_ROBIN:
        partitions = this._routeRoundRobin(context);
        break;

      case RoutingStrategy.PRIORITY:
        partitions = this._routeByPriority(context);
        break;

      case RoutingStrategy.CUSTOM:
        partitions = this._routeCustom(context);
        break;

      default:
        throw new Error(`Unknown routing strategy: ${strategy}`);
    }

    if (!partitions || partitions.length === 0) {
      throw new Error(`No partitions found for routing context: ${JSON.stringify(context)}`);
    }

    return partitions;
  }

  /**
   * @description Resolves exactly one target partition (the first match).
   * @param {Object} [context={}] - Routing criteria.
   * @returns {DatabasePartition} The primary matching partition.
   * @throws {Error} If no partitions satisfy the context.
   */
  routeSingle(context = {}) {
    const partitions = this.route(context);
    return partitions[0];
  }

  /**
   * @description Internal logic for mapping explicit partition identifiers or falling back to default.
   * @param {Object} context - Routing context.
   * @returns {DatabasePartition[]} Array containing the explicit target or default.
   * @private
   */
  _routeExplicit(context) {
    if (!context.partitionId) {
      // Return default partition if no explicit ID
      const defaultPartition = this._configuration.getDefaultPartition();
      return defaultPartition ? [defaultPartition] : [];
    }

    const partition = this._configuration.getPartition(context.partitionId);
    return partition ? [partition] : [];
  }

  /**
   * @description Internal logic for filtering partitions by metadata tags.
   * @param {Object} context - Routing context containing tags and matchMode.
   * @returns {DatabasePartition[]} Collection of partitions matching tag criteria.
   * @private
   */
  _routeByTag(context) {
    if (context.tag) {
      return this._configuration.getPartitionsByTag(context.tag);
    }

    if (context.tags && context.tags.length > 0) {
      const matchMode = context.tagMatchMode || 'ALL';
      return this._configuration.getPartitionsByTags(context.tags, matchMode);
    }

    // No tags specified, return all partitions
    return this._configuration.getAllPartitions();
  }

  /**
   * @description Internal logic for cyclic load balancing across candidate partitions.
   * @param {Object} context - Optional filtering context (tags) for candidates.
   * @returns {DatabasePartition[]} Array containing the next partition in the cycle.
   * @private
   */
  _routeRoundRobin(context) {
    let candidates = this._configuration.getAllPartitions();

    // Filter by tags if provided
    if (context.tag) {
      candidates = candidates.filter((p) => p.hasTag(context.tag));
    } else if (context.tags && context.tags.length > 0) {
      const matchMode = context.tagMatchMode || 'ALL';
      candidates =
        matchMode === 'ALL'
          ? candidates.filter((p) => p.hasAllTags(context.tags))
          : candidates.filter((p) => p.hasAnyTag(context.tags));
    }

    if (candidates.length === 0) {
      return [];
    }

    const index = this._roundRobinCounter % candidates.length;
    this._roundRobinCounter++;

    return [candidates[index]];
  }

  /**
   * @description Internal logic for selecting the highest priority partition among candidates.
   * @param {Object} context - Optional filtering context (tags) for candidates.
   * @returns {DatabasePartition[]} Array containing the highest priority partition.
   * @private
   */
  _routeByPriority(context) {
    let candidates = this._configuration.getAllPartitions();

    // Filter by tags if provided
    if (context.tag) {
      candidates = candidates.filter((p) => p.hasTag(context.tag));
    } else if (context.tags && context.tags.length > 0) {
      const matchMode = context.tagMatchMode || 'ALL';
      candidates =
        matchMode === 'ALL'
          ? candidates.filter((p) => p.hasAllTags(context.tags))
          : candidates.filter((p) => p.hasAnyTag(context.tags));
    }

    if (candidates.length === 0) {
      return [];
    }

    // Sort by priority descending and return highest
    candidates.sort((a, b) => b.priority - a.priority);
    return [candidates[0]];
  }

  /**
   * @description Delegates routing decision to a user-provided function.
   * @param {Object} context - Routing context.
   * @returns {DatabasePartition[]} Resolved partitions from the custom function.
   * @throws {Error} If no custom routing function is configured.
   * @private
   */
  _routeCustom(context) {
    if (!this._customRouter) {
      throw new Error('Custom routing strategy requires a customRouter function');
    }

    const result = this._customRouter(context, this._configuration);

    // Handle various return types
    if (Array.isArray(result)) {
      return result;
    }
    if (result) {
      return [result];
    }
    return [];
  }

  /**
   * @description Configures an external routing algorithm.
   * @param {Function} routerFn - Custom implementation: (context, config) => DatabasePartition[].
   * @returns {PartitionRouter} Current instance for method chaining.
   * @throws {Error} If routerFn is not a function.
   */
  setCustomRouter(routerFn) {
    if (typeof routerFn !== 'function') {
      throw new Error('Custom router must be a function');
    }
    this._customRouter = routerFn;
    return this;
  }

  /**
   * @description Resets the cyclic load balancing state.
   * @returns {PartitionRouter} Current instance for method chaining.
   */
  resetRoundRobin() {
    this._roundRobinCounter = 0;
    return this;
  }

  /**
   * @description Returns the current state of the round-robin sequencer.
   * @returns {number} Sequence index.
   */
  getRoundRobinCounter() {
    return this._roundRobinCounter;
  }
}
