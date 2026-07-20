/**
 * @file SheetDBLib/src/dynamic/SchemaResolver.js
 * @description SchemaResolver resolves SchemaTemplates to concrete schemas with expanded columns.
 * @version 1.0.0
 */

import { ColumnFamily, MemberSourceType } from './ColumnFamily.js';
import { SchemaTemplate } from './SchemaTemplate.js';
import { cloneDeep } from '@CoreUtilsLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';

const resolverOptionsSchema = z.object({
  familyRegistry: z.union([z.instanceof(Map), z.record(z.string(), z.unknown())]).optional(),
  memberLoader: z.union([z.null(), z.object({}).passthrough()]).optional(),
  logger: z.object({}).passthrough().optional()
});

const resolveOptionsSchema = z.object({
  useCache: z.boolean().optional(),
  context: z.object({}).passthrough().optional()
});

function parseResolverOptions(options) {
  const result = resolverOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

function parseResolveOptions(options) {
  const result = resolveOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

/**
 * ResolvedColumn - Represents a fully resolved column definition.
 *
 * @typedef {Object} ResolvedColumn
 * @property {string} name - Column name
 * @property {string} type - Column data type
 * @property {boolean} [primaryKey] - Whether this is the primary key
 * @property {boolean} [nullable] - Whether the column can be null
 * @property {*} [defaultValue] - Default value for the column
 * @property {string} [familyId] - ID of the column family (for dynamic columns)
 * @property {string} [memberKey] - Member key within the family (for dynamic columns)
 */

/**
 * ResolvedSchema - Represents a fully resolved schema with all columns expanded.
 *
 * @typedef {Object} ResolvedSchema
 * @property {string} tableId - Table identifier
 * @property {ResolvedColumn[]} columns - All resolved columns (fixed + dynamic)
 * @property {string} primaryKeyColumn - Name of the primary key column
 * @property {Object} metadata - Additional metadata
 * @property {Date} resolvedAt - When the schema was resolved
 */

/**
 * MemberSourceLoader - Interface for loading column family members from external sources.
 *
 * @interface MemberSourceLoader
 */

/**
 * @class SchemaResolver
 * @description Processes SchemaTemplates to produce ResolvedSchema instances with fully expanded dynamic columns.
 * Manages ColumnFamily registration and coordinates external member loading for dynamic schemas.
 *
 * @example
 * const resolver = new SchemaResolver({ familyRegistry: registry, memberLoader: loader });
 * const schema = resolver.resolve(template);
 */
export class SchemaResolver {
  /**
   * @param {Object} [options={}] - Resolver configuration.
   * @param {Map<string, ColumnFamily>|Object} [options.familyRegistry=new Map()] - Pre-registered ColumnFamily map.
   * @param {Object} [options.memberLoader=null] - Strategy for loading external family members (config/query based).
   * @param {Object} [options.logger=console] - Logger instance for operational feedback.
   */
  constructor(options = {}) {
    options = parseResolverOptions(options);
    const { familyRegistry = new Map(), memberLoader = null, logger = console } = options;

    /**
     * Registry of column families.
     * @type {Map<string, ColumnFamily>}
     * @private
     */
    this._familyRegistry =
      familyRegistry instanceof Map ? familyRegistry : new Map(Object.entries(familyRegistry));

    /**
     * Loader for external member sources.
     * @type {Object|null}
     * @private
     */
    this._memberLoader = memberLoader;

    /**
     * Logger instance.
     * @type {Object}
     * @private
     */
    this._logger = logger;

    /**
     * Cache of resolved schemas.
     * @type {Map<string, ResolvedSchema>}
     * @private
     */
    this._schemaCache = new Map();
  }

  /**
   * @description Registers a ColumnFamily and invalidates internal schema cache.
   * @param {ColumnFamily} family - ColumnFamily instance to register.
   * @returns {SchemaResolver} Current instance for method chaining.
   * @throws {Error} If family is not an instance of ColumnFamily.
   */
  registerFamily(family) {
    if (!(family instanceof ColumnFamily)) {
      throw new Error('Family must be a ColumnFamily instance');
    }
    this._familyRegistry.set(family.id, family);
    this._invalidateCache();
    return this;
  }

  /**
   * @description Batch registers multiple ColumnFamily instances.
   * @param {ColumnFamily[]} families - Collection of ColumnFamilies.
   * @returns {SchemaResolver} Current instance for method chaining.
   * @throws {Error} If any element is not a ColumnFamily.
   */
  registerFamilies(families) {
    families.forEach((f) => this.registerFamily(f));
    return this;
  }

  /**
   * @description Retrieves a registered ColumnFamily by ID.
   * @param {string} familyId - The family unique identifier.
   * @returns {ColumnFamily|null} The family instance or null if not registered.
   */
  getFamily(familyId) {
    return this._familyRegistry.get(familyId) || null;
  }

  /**
   * @description Returns IDs of all currently registered ColumnFamilies.
   * @returns {string[]} Collection of family identifiers.
   */
  getFamilyIds() {
    return Array.from(this._familyRegistry.keys());
  }

  /**
   * @description Configures the external member loading strategy and clears internal cache.
   * @param {Object} loader - Implementation of MemberSourceLoader.
   * @returns {SchemaResolver} Current instance for method chaining.
   */
  setMemberLoader(loader) {
    this._memberLoader = loader;
    this._invalidateCache();
    return this;
  }

  /**
   * @description Resolves a SchemaTemplate to a concrete ResolvedSchema with expanded columns.
   * @param {SchemaTemplate} template - The template definition to expand.
   * @param {Object} [options={}] - Resolution configuration.
   * @param {boolean} [options.useCache=true] - If false, forces a fresh resolution bypassing internal cache.
   * @param {Object} [options.context={}] - Contextual data passed to external member loaders.
   * @returns {ResolvedSchema} Fully concrete schema with all fixed and dynamic columns.
   * @throws {Error} If template is not a SchemaTemplate, or a required ColumnFamily is missing.
   */
  resolve(template, options = {}) {
    options = parseResolveOptions(options);
    const { useCache = true, context = {} } = options;

    if (!(template instanceof SchemaTemplate)) {
      throw new Error('Template must be a SchemaTemplate instance');
    }

    // Check cache
    const cacheKey = this._getCacheKey(template, context);
    if (useCache && this._schemaCache.has(cacheKey)) {
      this._logger.debug?.(`SchemaResolver: Using cached schema for ${template.tableId}`);
      return this._schemaCache.get(cacheKey);
    }

    this._logger.debug?.(`SchemaResolver: Resolving schema for ${template.tableId}`);

    // Start with fixed columns
    const columns = template.fixedColumns.map((col) => ({
      ...cloneDeep(col),
      familyId: null,
      memberKey: null
    }));

    // Resolve dynamic columns
    for (const dynamicConfig of template.dynamicColumns) {
      const familyId = dynamicConfig.familyId;
      const family = this._familyRegistry.get(familyId);

      if (!family) {
        throw new Error(`Column family not found: ${familyId}`);
      }

      // Get members (may need to load from external source)
      const members = this._resolveMembers(family, dynamicConfig, context);

      // Generate columns for each member
      for (const memberKey of members) {
        const columnName = family.generateColumnName(memberKey);

        // Apply any prefix override from config
        const finalName = dynamicConfig.prefix
          ? `${dynamicConfig.prefix}${columnName}`
          : columnName;

        columns.push({
          name: finalName,
          type: family.type,
          nullable: family.nullable,
          defaultValue: family.defaultValue,
          familyId: familyId,
          memberKey: memberKey
        });
      }
    }

    // Check for duplicate column names
    const columnNames = columns.map((c) => c.name);
    const uniqueNames = new Set(columnNames);
    if (uniqueNames.size !== columnNames.length) {
      const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
      throw new Error(`Duplicate column names in resolved schema: ${duplicates.join(', ')}`);
    }

    // Build resolved schema
    const resolvedSchema = {
      tableId: template.tableId,
      columns: columns,
      primaryKeyColumn: template.getPrimaryKeyColumn(),
      metadata: cloneDeep(template.metadata),
      resolvedAt: new Date()
    };

    // Cache the result
    if (useCache) {
      this._schemaCache.set(cacheKey, resolvedSchema);
    }

    this._logger.info?.(
      `SchemaResolver: Resolved ${template.tableId} with ${columns.length} columns`
    );
    return resolvedSchema;
  }

  /**
   * @description Internal dispatcher for member key resolution.
   * @param {ColumnFamily} family - ColumnFamily definition.
   * @param {Object} dynamicConfig - Dynamic column configuration from template.
   * @param {Object} context - Optional data for resolution.
   * @returns {string[]} Collection of unique member keys.
   * @private
   */
  _resolveMembers(family, dynamicConfig, context) {
    // If family has static members, use those
    if (family.isStatic() && family.members.length > 0) {
      return family.members;
    }

    // If dynamic config specifies members, use those
    if (dynamicConfig.members && dynamicConfig.members.length > 0) {
      return dynamicConfig.members;
    }

    // Load from external source
    if (family.memberSource) {
      return this._loadExternalMembers(family.memberSource, context);
    }

    // No members found
    this._logger.warn?.(`SchemaResolver: No members found for family ${family.id}`);
    return [];
  }

  /**
   * @description Coordinates with MemberSourceLoader to fetch keys from external providers.
   * @param {Object} memberSource - External source configuration.
   * @param {Object} context - Contextual parameters for loading.
   * @returns {string[]} Collection of keys from the provider.
   * @throws {Error} If loader is missing or lacks the required interface.
   * @private
   */
  _loadExternalMembers(memberSource, context) {
    if (!this._memberLoader) {
      throw new Error('Member loader required for external member sources');
    }

    const sourceType = memberSource.type;

    switch (sourceType) {
      case MemberSourceType.CONFIG:
        if (!this._memberLoader.loadFromConfig) {
          throw new Error('Member loader does not support config loading');
        }
        return this._memberLoader.loadFromConfig(memberSource.configPath, context);

      case MemberSourceType.QUERY:
        if (!this._memberLoader.loadFromQuery) {
          throw new Error('Member loader does not support query loading');
        }
        return this._memberLoader.loadFromQuery(memberSource.query, context);

      default:
        throw new Error(`Unknown member source type: ${sourceType}`);
    }
  }

  /**
   * @description Generates a deterministic cache key for a specific template/context combination.
   * @param {SchemaTemplate} template - The template being resolved.
   * @param {Object} context - Resolution context.
   * @returns {string} Stringified cache key.
   * @private
   */
  _getCacheKey(template, context) {
    const contextKey = JSON.stringify(context);
    return `${template.tableId}:${contextKey}`;
  }

  /**
   * @description Selective or total invalidation of internal schema cache.
   * @param {string} [tableId=null] - Optional table ID for targeted invalidation.
   * @private
   */
  _invalidateCache(tableId = null) {
    if (tableId) {
      for (const key of this._schemaCache.keys()) {
        if (key.startsWith(`${tableId}:`)) {
          this._schemaCache.delete(key);
        }
      }
    } else {
      this._schemaCache.clear();
    }
  }

  /**
   * @description Wipes the entire internal schema resolution cache.
   * @returns {SchemaResolver} Current instance for method chaining.
   */
  clearCache() {
    this._schemaCache.clear();
    return this;
  }

  /**
   * @description Filters dynamic columns (those linked to a ColumnFamily) from a schema.
   * @param {ResolvedSchema} schema - The resolved schema definition.
   * @returns {ResolvedColumn[]} Collection of dynamic columns.
   * @static
   */
  static getDynamicColumns(schema) {
    return schema.columns.filter((col) => col.familyId !== null);
  }

  /**
   * @description Filters fixed columns (those NOT linked to a ColumnFamily) from a schema.
   * @param {ResolvedSchema} schema - The resolved schema definition.
   * @returns {ResolvedColumn[]} Collection of fixed columns.
   * @static
   */
  static getFixedColumns(schema) {
    return schema.columns.filter((col) => col.familyId === null);
  }

  /**
   * @description Retrieves columns belonging to a specific family within a resolved schema.
   * @param {ResolvedSchema} schema - The resolved schema definition.
   * @param {string} familyId - The ID of the family to filter by.
   * @returns {ResolvedColumn[]} Collection of matching columns.
   * @static
   */
  static getColumnsByFamily(schema, familyId) {
    return schema.columns.filter((col) => col.familyId === familyId);
  }

  /**
   * @description Produces a name-indexed map of all columns in a resolved schema.
   * @param {ResolvedSchema} schema - The resolved schema definition.
   * @returns {Map<string, ResolvedColumn>} Map of column names to definitions.
   * @static
   */
  static createColumnMap(schema) {
    return new Map(schema.columns.map((col) => [col.name, col]));
  }
}
