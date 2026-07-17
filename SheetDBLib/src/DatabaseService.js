/**
 * @file SheetDBLib/src/DatabaseService.js
 * @description Main database service for managing Google Spreadsheet-based databases.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { SpreadsheetService } from '@GoogleApiWrapper';
import { TableService } from './TableService.js';
import { AdvancedQueryBuilder } from './query/AdvancedQueryBuilder.js';
import { DatabaseConnectionManager } from './internal/database-managers/DatabaseConnectionManager.js';
import { DatabaseSchemaExplorer } from './internal/database-managers/DatabaseSchemaExplorer.js';
import { DatabaseTableRegistry } from './internal/database-managers/DatabaseTableRegistry.js';
import { DatabaseMetaDataHandler } from './internal/database-managers/DatabaseMetaDataHandler.js';

export class MyDatabaseService {
  constructor(spreadsheetId, logger, utils, cache, exceptionService = null, options = {}) {
    this._spreadsheetId = spreadsheetId;
    this._logger = logger;
    this._utils = utils;
    this._cache = cache;
    this._exceptionService = exceptionService;

    const effectiveExceptionService = exceptionService || {
      executeWithRetry: (fn) => fn(),
      executeWithBypass: (fn) => fn()
    };
    this._spreadsheetService = new SpreadsheetService(
      logger,
      cache,
      utils,
      effectiveExceptionService
    );

    this.tables = {};
    this._loaded = false;
    this._transaction = null;
    this._inTransaction = false;
    this._dryRun = options.dryRun || false;
    this._schemaValidator = options.schemaValidator || null;

    // Initialize managers
    this._connectionManager = new DatabaseConnectionManager(this);
    this._schemaExplorer = new DatabaseSchemaExplorer(this);
    this._tableRegistry = new DatabaseTableRegistry(this);
    this._metaDataHandler = new DatabaseMetaDataHandler(this);

    // Delegate methods
    this._delegate([
      {
        manager: this._connectionManager,
        methods: [
          'save',
          'beginTransaction',
          'commit',
          'rollback',
          '_performRollback',
          'inTransaction'
        ]
      },
      {
        manager: this._schemaExplorer,
        methods: ['_initialize']
      },
      {
        manager: this._tableRegistry,
        methods: ['getTable', 'hasTable', 'listTables']
      },
      {
        manager: this._metaDataHandler,
        methods: ['_isDryRun', 'getMetadata']
      }
    ]);

    if (this._dryRun) {
      this._logger.info('[DRY-RUN] DatabaseService initialized in dry-run mode.');
    }

    this._initialize();
  }

  _delegate(delegations) {
    delegations.forEach(({ manager, methods }) => {
      methods.forEach((method) => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
  }

  select(fields = ['*']) {
    return new AdvancedQueryBuilder(this, fields);
  }
}

export { MyDatabaseService as DatabaseService };
