/**
 * @file PipelineFramework/src/examples/GenerateDocumentStep.js
 * @description Example ConsumerStep implementation - Generates document from template ID
 * @version 1.0.0
 */

import { ConsumerStep } from '../ConsumerStep';

/**
 * Example ConsumerStep implementation that generates documents from templates.
 * Demonstrates the Consumer pattern by reading a decision (template ID) from context
 * and performing the technical operation (document creation) via DriveService.
 *
 * @class GenerateDocumentStep
 * @extends ConsumerStep
 *
 * @example
 * const step = new GenerateDocumentStep(logger, driveService, {
 *   inputKey: 'selected_template_id',
 *   outputKey: 'generated_document',
 *   templateMapping: { 'PASS': 'file_id_1' }
 * });
 */
export class GenerateDocumentStep extends ConsumerStep {
  /**
   * @param {LoggerService} logger - Foundation logging service.
   * @param {DriveService} driveService - Infrastructure service for document operations.
   * @param {Object} [options={}] - Step configuration.
   * @param {string} options.inputKey - Required: Context key containing the template ID to process.
   * @param {string} [options.outputKey] - Context key for persisting document metadata.
   * @param {Object} [options.templateMapping] - Map of logical template names to Drive file IDs.
   * @param {string} [options.targetFolderId] - Destination folder ID for generated files.
   * @throws {Error} If driveService is missing or invalid.
   */
  constructor(logger, driveService, options = {}) {
    super('GenerateDocument', logger, options);

    // Validate driveService
    if (!driveService || typeof driveService !== 'object') {
      throw new Error('GenerateDocumentStep: driveService is required and must be an object');
    }

    /**
     * Drive service for creating documents.
     * @private
     * @type {Object}
     */
    this._driveService = driveService;

    /**
     * Template ID to file ID mapping.
     * Maps logical template names to actual Google Drive file IDs.
     * @private
     * @type {Object}
     */
    this._templateMapping = options.templateMapping || {
      TEMPLATE_PASS: 'MOCK_TEMPLATE_PASS_ID',
      TEMPLATE_FAIL: 'MOCK_TEMPLATE_FAIL_ID',
      TEMPLATE_TOO_MANY_ABSENCES: 'MOCK_TEMPLATE_ABSENCES_ID',
      TEMPLATE_DEFAULT: 'MOCK_TEMPLATE_DEFAULT_ID'
    };

    /**
     * Target folder ID for created documents.
     * @private
     * @type {string|null}
     */
    this._targetFolderId = options.targetFolderId || null;
  }

  /**
   * Executes the technical operation of document creation.
   *
   * @param {string} templateId - Resolved template identifier from context.
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {Object} Metadata for the generated document (id, url, name, etc).
   * @throws {Error} If templateId is not found in the mapping.
   * @protected
   */
  performAction(templateId, context) {
    this._logger.info(`[${this._name}] Creating document from template: ${templateId}`);

    // Resolve template ID to file ID
    const templateFileId = this._templateMapping[templateId];

    if (!templateFileId) {
      throw new Error(
        `GenerateDocumentStep: Unknown template ID '${templateId}'. ` +
          `Available templates: ${Object.keys(this._templateMapping).join(', ')}`
      );
    }

    this._logger.debug(
      `[${this._name}] Resolved template '${templateId}' to file ID: ${templateFileId}`
    );

    // Get additional context data for document name
    const studentName = context.get('student_name', 'Unknown Student');
    const documentName = `${studentName} - ${templateId.replace('TEMPLATE_', '')} Report`;

    // Create document (mock implementation - real implementation would use DriveService)
    this._logger.debug(
      `[${this._name}] Creating document: "${documentName}" from template ${templateFileId}`
    );

    // In real implementation:
    // const file = this._driveService.copyFile(templateFileId, documentName, this._targetFolderId);
    // const documentId = file.getId();
    // const documentUrl = file.getUrl();

    // Mock implementation for testing
    const documentId = `GENERATED_DOC_${Date.now()}`;
    const documentUrl = `https://docs.google.com/document/d/${documentId}`;

    this._logger.info(
      `[${this._name}] Document created successfully: ${documentName} (${documentId})`
    );

    return {
      id: documentId,
      url: documentUrl,
      name: documentName,
      templateId: templateId,
      templateFileId: templateFileId,
      createdAt: new Date().toISOString()
    };
  }
}
