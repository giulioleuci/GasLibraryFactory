/**
 * @file JobRunnerLib/src/managers/JobRunnerLogCapturer.js
 * @description Manager for log capturing, formatting, and display.
 */

export class JobRunnerLogCapturer {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  _validateLoggingConfig(loggingConfig) {
    if (!loggingConfig.target) {
      throw new Error('MyJobRunnerService: loggingConfig.target is required');
    }
    const validTargets = ['sidebar', 'driveFile'];
    if (!validTargets.includes(loggingConfig.target)) {
      throw new Error(
        `MyJobRunnerService: loggingConfig.target must be one of: ${validTargets.join(', ')}`
      );
    }
    if (loggingConfig.target === 'sidebar' && !loggingConfig.uiService) {
      throw new Error('MyJobRunnerService: loggingConfig.uiService is required for sidebar target');
    }
    if (loggingConfig.target === 'driveFile' && !loggingConfig.driveService) {
      throw new Error(
        'MyJobRunnerService: loggingConfig.driveService is required for driveFile target'
      );
    }
  }

  _displayLogs(capturingLogger, loggingConfig, jobName, error) {
    const logCount = capturingLogger.getLogCount();
    if (logCount === 0) {
      this._logger.debug('MyJobRunnerService._displayLogs: No logs to display');
      return;
    }
    this._logger.debug(
      `MyJobRunnerService._displayLogs: Displaying ${logCount} log entries via ${loggingConfig.target}`
    );
    if (loggingConfig.target === 'sidebar') {
      this._displayLogsInSidebar(capturingLogger, loggingConfig.uiService, jobName, error);
    } else if (loggingConfig.target === 'driveFile') {
      this._displayLogsInDriveFile(
        capturingLogger,
        loggingConfig.driveService,
        loggingConfig.driveFolderId,
        jobName,
        error
      );
    }
  }

  _displayLogsInSidebar(capturingLogger, uiService, jobName, error) {
    const statusColor = error ? '#cc0000' : '#28a745';
    const statusText = error ? 'FAILED' : 'COMPLETED';
    const logsHtml = capturingLogger.getLogsAsHtml();
    const html = `
      <style>body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .header { background: ${statusColor}; color: white; padding: 15px; margin-bottom: 10px; }
      .header h2 { margin: 0 0 5px 0; font-size: 16px; }
      .header .status { font-size: 14px; font-weight: bold; }
      .logs-container { padding: 10px; max-height: calc(100vh - 150px); overflow-y: auto; }
      .footer { padding: 10px; text-align: center; border-top: 1px solid #ccc; background: #f5f5f5; }
      .footer button { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
      .footer button:hover { background: #0056b3; }</style>
      <div class="header"><h2>Job Execution Log</h2><div>Job: <strong>${this._escapeHtml(jobName)}</strong></div>
      <div class="status">Status: ${statusText}</div>
      ${error ? `<div style="margin-top: 5px; font-size: 12px;">Error: ${this._escapeHtml(error.message)}</div>` : ''}</div>
      <div class="logs-container">${logsHtml}</div><div class="footer"><button onclick="google.script.host.close()">Close</button></div>`;
    uiService.createSidebar().setTitle(`Job Log: ${jobName}`).setContent(html).setWidth(500).show();
    this._logger.info(
      `MyJobRunnerService: Job logs displayed in sidebar (${capturingLogger.getLogCount()} entries)`
    );
  }

  _displayLogsInDriveFile(capturingLogger, driveService, folderId, jobName, error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const statusText = error ? 'FAILED' : 'COMPLETED';
    const fileName = `JobLog_${jobName}_${statusText}_${timestamp}.txt`;
    const header = [
      `Job Execution Log`,
      `==================`,
      `Job Name: ${jobName}`,
      `Status: ${statusText}`,
      `Timestamp: ${new Date().toISOString()}`,
      error ? `Error: ${error.message}` : '',
      `Log Entries: ${capturingLogger.getLogCount()}`,
      ``,
      `Logs:`,
      `------`,
      ``
    ]
      .filter((line) => line !== null)
      .join('\n');
    const logsText = capturingLogger.getLogsAsText();
    const fullContent = header + logsText;
    try {
      // Route Drive I/O through the wrapped DriveService (L2) instead of the
      // native DriveApp/Utilities globals, preserving the L3->L2 layering.
      const driveApp = driveService.getStandardApp();
      let fileId;
      if (folderId) {
        const folder = driveApp.getFolderById(folderId);
        const file = folder.createFile(fileName, fullContent, 'text/plain');
        fileId = file.getId();
      } else {
        const file = driveApp.createFile(fileName, fullContent, 'text/plain');
        fileId = file.getId();
      }
      const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      this._logger.info(`MyJobRunnerService: Job logs saved to Drive file: ${fileUrl}`);
    } catch (driveError) {
      this._logger.error(`MyJobRunnerService: Error saving logs to Drive: ${driveError.message}`);
      throw driveError;
    }
  }

  _escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
}
