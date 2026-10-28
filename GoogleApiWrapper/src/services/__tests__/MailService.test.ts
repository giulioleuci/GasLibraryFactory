// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/MailService.test.js
// ===================================================================
// Updated test suite for Simplified MailService
// ===================================================================

import { MailService } from '../MailService.js';
import type { GoogleRetryExecutor } from '../../internal/core/GoogleService.js';
import type { GoogleLogger } from '../../internal/core/GoogleService.js';

describe('MailService - Simplified Test Suite', () => {
  let gmailMock: {
    search: jest.Mock<
      Array<{
        getId(): string;
        getMessages(): Array<
          Pick<
            GoogleAppsScript.Gmail.GmailMessage,
            'getId' | 'getSubject' | 'getFrom' | 'getDate' | 'getPlainBody'
          >
        >;
      }>,
      unknown[]
    >;
    sendEmail: jest.Mock<void, unknown[]>;
    createDraft: jest.Mock<{ getId(): string }, unknown[]>;
  };
  let service: MailService;
  let logger: jest.Mocked<GoogleLogger>;
  let utils: { sleep: jest.Mock<void, [number]> };
  let exceptionService: {
    executeWithRetry: jest.MockedFunction<GoogleRetryExecutor['executeWithRetry']>;
  };

  beforeEach(() => {
    // Mock logger
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock utils
    utils = {
      sleep: jest.fn()
    };

    // Mock exception service
    exceptionService = {
      executeWithRetry: jest.fn(<T>(fn: () => T) => fn()) as jest.MockedFunction<
        GoogleRetryExecutor['executeWithRetry']
      >
    };

    // Mock GmailApp
    gmailMock = {
      search: jest.fn(() => []),
      sendEmail: jest.fn(),
      createDraft: jest.fn(() => ({
        getId: jest.fn(() => 'draft-123')
      }))
    };
    Object.assign(global, { GmailApp: gmailMock });

    // Mock MailApp
    Object.assign(global, {
      MailApp: {
        getRemainingDailyQuota: jest.fn(() => 1500)
      }
    });

    // Create service instance
    service = new MailService(logger, utils, exceptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with dependencies', () => {
      expect(service._logger).toBe(logger);
      expect(service._utils).toBe(utils);
      expect(service._exceptionService).toBe(exceptionService);
    });

    it('should throw error when utils is missing', () => {
      // @ts-expect-error Missing utilities is deliberately rejected by the constructor.
      expect(() => new MailService(logger)).toThrow();
    });
  });

  describe('getQuotaUsage()', () => {
    it('should return native quota', () => {
      expect(service.getQuotaUsage()).toBe(1500);
      expect(MailApp.getRemainingDailyQuota).toHaveBeenCalled();
    });
  });

  describe('send()', () => {
    const email = { to: 'a@b.com', subject: 'Hi', body: 'Hello' };

    it('should send email via GmailApp', () => {
      const result = service.send(email);
      expect(result.success).toBe(true);
      expect(GmailApp.sendEmail).toHaveBeenCalledWith('a@b.com', 'Hi', 'Hello', {
        htmlBody: undefined,
        cc: undefined,
        bcc: undefined,
        replyTo: undefined,
        name: undefined,
        noReply: undefined,
        attachments: undefined
      });
    });

    it('should handle array of recipients', () => {
      service.send({ ...email, to: ['a@b.com', 'c@d.com'] });
      expect(GmailApp.sendEmail).toHaveBeenCalledWith('a@b.com,c@d.com', 'Hi', 'Hello', {
        htmlBody: undefined,
        cc: undefined,
        bcc: undefined,
        replyTo: undefined,
        name: undefined,
        noReply: undefined,
        attachments: undefined
      });
    });

    it('should use exception service if provided', () => {
      service.send(email);
      expect(exceptionService.executeWithRetry).toHaveBeenCalled();
    });

    it('should catch and log errors', () => {
      gmailMock.sendEmail.mockImplementation(() => {
        throw new Error('Fail');
      });
      const result = service.send(email);
      expect(result.success).toBe(false);
      expect((result as Extract<typeof result, { success: false }>).error).toBe('Fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendBatch()', () => {
    it('should send multiple emails with sleep', () => {
      const emails = [
        { to: '1@b.com', subject: 'S1', body: 'B1' },
        { to: '2@b.com', subject: 'S2', body: 'B2' }
      ];
      const result = service.sendBatch(emails);
      expect(result.successful).toHaveLength(2);
      expect(utils.sleep).toHaveBeenCalled();
    });
  });

  describe('createDraft()', () => {
    it('should create draft and return ID', () => {
      const result = service.createDraft({ to: 'a@b.com', subject: 'S', body: 'B' });
      expect(result.success).toBe(true);
      expect(result.draftId).toBe('draft-123');
      expect(GmailApp.createDraft).toHaveBeenCalled();
    });
  });

  describe('sendBulk()', () => {
    it('should personalize and send emails', () => {
      const recipients = [{ email: 'a@b.com', name: 'Alice' }];
      const bodyGen = (r: { name: string }) => `Hi ${r.name}`;
      const result = service.sendBulk(recipients, bodyGen, 'Sub');
      expect(result.sent).toBe(1);
      expect(GmailApp.sendEmail).toHaveBeenCalledWith(
        'a@b.com',
        'Sub',
        '',
        expect.objectContaining({ htmlBody: 'Hi Alice' })
      );
    });
  });

  describe('sendNotification()', () => {
    it('should send formatted notification', () => {
      service.sendNotification('a@b.com', 'Title', 'Msg');
      expect(GmailApp.sendEmail).toHaveBeenCalledWith(
        'a@b.com',
        'Title',
        '',
        expect.objectContaining({ htmlBody: expect.stringContaining('Title') })
      );
    });
  });

  // _escapeHtml was removed in favour of the shared CoreUtilsLib
  // HtmlSanitizer.escapeHtml (see CoreUtilsLib/src/__tests__/HtmlSanitizer.test.js
  // for escaping coverage).

  describe('searchMessages()', () => {
    it('flattens threads to message summaries and honours maxResults', () => {
      const msg = (id: string) => ({
        getId: () => id,
        getSubject: () => 'Delivery Status Notification (Failure)',
        getFrom: () => 'Mail Delivery Subsystem <mailer-daemon@googlemail.com>',
        getDate: () => new Date('2026-10-05T08:00:00Z'),
        getPlainBody: () => 'body ' + id
      });
      gmailMock.search.mockReturnValue([
        { getId: () => 't1', getMessages: () => [msg('m1'), msg('m2')] },
        { getId: () => 't2', getMessages: () => [msg('m3')] }
      ]);
      const out = service.searchMessages('from:mailer-daemon', 2);
      expect(GmailApp.search).toHaveBeenCalledWith('from:mailer-daemon', 0, 2);
      expect(out.map((m) => m.id)).toEqual(['m1', 'm2']);
      expect(out[0]).toMatchObject({ threadId: 't1', plainBody: 'body m1' });
    });

    it('returns [] and logs when GmailApp throws', () => {
      gmailMock.search.mockImplementation(() => {
        throw new Error('quota');
      });
      expect(service.searchMessages('x')).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
