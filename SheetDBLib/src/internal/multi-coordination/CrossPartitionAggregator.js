/**
 * @file SheetDBLib/src/multi/internal/CrossPartitionAggregator.js
 * @description Internal module managing query aggregation.
 * @version 1.0.0
 */

export class CrossPartitionAggregator {
  /**
   * Saves all pending changes across all connected partitions.
   *
   * @param {PartitionCoordinator} coordinator
   * @param {Object} [options={}] - Save options
   * @param {boolean} [options.dryRun=false] - If true, don't persist changes
   * @returns {Object} Save results by partition
   */
  static saveAll(coordinator, options = {}) {
    // Note: Since 'coordinator' is an instance of PartitionCoordinator,
    // we use it to iterate over connected partitions and configuration.
    const results = {};
    const config = coordinator._configuration;

    for (const [partitionId, db] of coordinator.getConnectionsEntries()) {
      const partition = config.getPartition(partitionId);

      if (partition?.isReadOnly && !options.dryRun) {
        results[partitionId] = {
          success: false,
          error: 'Partition is read-only',
          skipped: true
        };
        continue;
      }

      try {
        db.save(options);
        results[partitionId] = { success: true };
      } catch (error) {
        results[partitionId] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }
}
