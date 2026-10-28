import type { GoogleLogger, GoogleRetryExecutor } from '../internal/core/GoogleService.js';
type MailLogger = Pick<GoogleLogger, 'error' | 'debug'>;
export type EmailRecipient = string | string[];
export interface EmailOptions extends Omit<
  GoogleAppsScript.Gmail.GmailAdvancedOptions,
  'cc' | 'bcc'
> {
  to: EmailRecipient;
  subject: string;
  body?: string;
  cc?: EmailRecipient;
  bcc?: EmailRecipient;
}
export type SendResult = { success: true } | { success: false; error: string };

/**
 * @file GoogleApiWrapper/src/services/MailService.js
 * @description Simplified service for sending emails via GmailApp/MailApp.
 * Provides quota-aware operations and batch processing.
 */

import { HtmlSanitizer } from '@CoreUtilsLib';

/**
 * @class MailService
 * @description Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.
 *
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {UtilsService} _utils Foundational utilities (requires sleep).
 * @property {ExceptionService} _exceptionService Resiliency provider.
 * @property {number} _rateLimitMs Throttling delay between sequential operations.
 */
// shortcut: GAS Console types omit legacy debug, revisit the existing console fallback separately.
export class MailService {
  declare _logger: MailLogger;
  declare _utils: { sleep(milliseconds: number): unknown };
  declare _exceptionService: GoogleRetryExecutor | null;
  declare _rateLimitMs: number;
  /**
   * @description Initializes MailService with mandatory utilities and optional resiliency.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {UtilsService} utils Foundational utilities (must provide sleep()).
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   * @param {Object} [options={}] Configuration overrides.
   * @param {number} [options.rateLimitMs=100] Sequential send delay.
   * @throws {Error} If utils.sleep is missing.
   */
  constructor(
    logger: MailLogger | null | undefined,
    utils: { sleep(milliseconds: number): unknown },
    exceptionService: GoogleRetryExecutor | null = null,
    options: { rateLimitMs?: number } = {}
  ) {
    this._logger = logger || (console as Console & MailLogger);
    if (!utils || typeof utils.sleep !== 'function') {
      throw new Error('MailService requires a valid UtilitiesService with sleep() method');
    }
    this._utils = utils;
    this._exceptionService = exceptionService;
    this._rateLimitMs = options.rateLimitMs || 100;
  }

  /**
   * @description Returns the remaining daily email quota for the current user.
   * @returns {number} Remaining email count.
   */
  getQuotaUsage() {
    return MailApp.getRemainingDailyQuota();
  }

  /**
   * @description Searches the user's mailbox with Gmail search syntax and flattens the matching threads to message summaries.
   * @param {string} query Gmail search query (e.g. 'from:mailer-daemon newer_than:2d').
   * @param {number} [maxResults=50] Maximum messages returned.
   * @returns {Array<{id: string, threadId: string, subject: string, from: string, date: Date, plainBody: string}>} Never throws; [] on error.
   */
  searchMessages(query: string, maxResults: number = 50) {
    try {
      const out = [];
      for (const thread of GmailApp.search(query, 0, maxResults)) {
        for (const m of thread.getMessages()) {
          if (out.length >= maxResults) {
            return out;
          }
          out.push({
            id: m.getId(),
            threadId: thread.getId(),
            subject: m.getSubject(),
            from: m.getFrom(),
            date: m.getDate(),
            plainBody: m.getPlainBody()
          });
        }
      }
      return out;
    } catch (error) {
      this._logger.error(`Error searching messages: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * @description Sends a single email with resilient retry logic. Normalizes recipient arrays to comma-separated strings.
   * @param {Object} emailOptions Transmission parameters.
   * @param {string|string[]} emailOptions.to Primary recipient(s).
   * @param {string} emailOptions.subject Message subject.
   * @param {string} [emailOptions.body] Plain text content.
   * @param {string} [emailOptions.htmlBody] HTML content.
   * @param {BlobSource[]} [emailOptions.attachments] File attachments.
   * @returns {Object} Transmission result {success, error}.
   */
  send(emailOptions: EmailOptions): SendResult {
    try {
      const { to, subject, body, htmlBody, ...rest } = emailOptions;
      const recipient = Array.isArray(to) ? to.join(',') : to;

      const options = {
        htmlBody: htmlBody,
        cc: Array.isArray(rest.cc) ? rest.cc.join(',') : rest.cc,
        bcc: Array.isArray(rest.bcc) ? rest.bcc.join(',') : rest.bcc,
        replyTo: rest.replyTo,
        name: rest.name,
        noReply: rest.noReply,
        attachments: rest.attachments
      };

      const sendFn = () => {
        GmailApp.sendEmail(recipient, subject, body || '', options);
        return { success: true };
      };

      if (this._exceptionService) {
        this._exceptionService.executeWithRetry(sendFn, {}, 3);
      } else {
        sendFn();
      }

      this._logger.debug(`Email sent successfully to ${recipient}`);
      return { success: true };
    } catch (error) {
      this._logger.error(`Error sending email: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * @description Sequentially transmits a collection of emails with inter-operation sleep.
   * @param {Object[]} emails Array of transmission parameters.
   * @returns {Object} Result summary {successful: Object[], failed: Array<{email, error}>}.
   */
  sendBatch<Email extends EmailOptions>(emails: Email[]) {
    const results: { successful: Email[]; failed: Array<{ email: Email; error: string }> } = {
      successful: [],
      failed: []
    };
    for (let i = 0; i < emails.length; i++) {
      const result = this.send(emails[i]);
      if (result.success) {
        results.successful.push(emails[i]);
      } else {
        results.failed.push({ email: emails[i], error: result.error });
      }
      if (i < emails.length - 1) {
        this._utils.sleep(this._rateLimitMs);
      }
    }
    return results;
  }

  /**
   * @description Creates a Gmail draft without transmission.
   * @param {Object} emailOptions Drafting parameters.
   * @returns {Object} Result {success, draftId, error}.
   */
  createDraft(emailOptions: EmailOptions) {
    try {
      const { to, subject, body, htmlBody, ...rest } = emailOptions;
      const recipient = Array.isArray(to) ? to.join(',') : to;
      const options = {
        htmlBody: htmlBody,
        cc: Array.isArray(rest.cc) ? rest.cc.join(',') : rest.cc,
        bcc: Array.isArray(rest.bcc) ? rest.bcc.join(',') : rest.bcc,
        replyTo: rest.replyTo,
        attachments: rest.attachments
      };

      const draft = GmailApp.createDraft(recipient, subject, body || '', options);
      return { success: true, draftId: draft.getId() };
    } catch (error) {
      this._logger.error(`Error creating draft: ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * @description Transmits personalized emails generated via callback for each recipient.
   * @param {Object[]} recipientData Contextual data for body generation.
   * @param {Function} bodyGenerator Factory function: (recipient) => bodyContent.
   * @param {string} subject Uniform subject line.
   * @param {boolean} [isHtml=true] Toggle between HTML and plain text generation.
   * @returns {Object} Transmission summary {sent, failed, details}.
   */
  sendBulk<Recipient extends { email: EmailRecipient }>(
    recipientData: Recipient[],
    bodyGenerator: (recipient: Recipient) => string,
    subject: string,
    isHtml: boolean = true
  ) {
    const results: {
      sent: number;
      failed: number;
      details: {
        successful: EmailRecipient[];
        failed: Array<{ email: EmailRecipient; error: string }>;
      };
    } = { sent: 0, failed: 0, details: { successful: [], failed: [] } };
    recipientData.forEach((recipient, i) => {
      const body = bodyGenerator(recipient);
      const emailOptions: EmailOptions = { to: recipient.email, subject };
      if (isHtml) {
        emailOptions.htmlBody = body;
      } else {
        emailOptions.body = body;
      }

      const result = this.send(emailOptions);
      if (result.success) {
        results.sent++;
        results.details.successful.push(recipient.email);
      } else {
        results.failed++;
        results.details.failed.push({ email: recipient.email, error: result.error });
      }
      if (i < recipientData.length - 1) {
        this._utils.sleep(this._rateLimitMs);
      }
    });
    return results;
  }

  /**
   * @description Transmits a standard HTML notification template.
   * @param {string|string[]} emails Target recipient(s).
   * @param {string} title Notification header.
   * @param {string} message Primary notification content.
   * @returns {Object} Transmission result.
   */
  sendNotification(emails: string | string[], title: string, message: string) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">${HtmlSanitizer.escapeHtml(title)}</h2>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          ${HtmlSanitizer.escapeHtml(message).replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px;">Automated notification, do not reply.</p>
      </div>
    `;
    return this.send({ to: emails, subject: title, htmlBody });
  }
}
