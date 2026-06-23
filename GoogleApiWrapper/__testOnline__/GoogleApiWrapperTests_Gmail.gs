/**
 * 🧪 MailService Comprehensive Tests
 */
function initGoogleApiWrapperTests_Gmail(NS) {
  
  runner.register(`${NS}/MailService/EmailDrafts`, () => {
    const deps = createGoogleApiWrapperDeps();
    const mailService = new MailService(deps.logger, deps.mailUtils, deps.exceptionService);
    
    const recipient = Session.getEffectiveUser().getEmail();
    const subject = 'Draft Test ' + Utilities.getUuid().substring(0, 8);
    const body = 'This is a draft content';
    
    // 1. Create draft
    const result = mailService.createDraft({
      to: recipient,
      subject: subject,
      body: body,
      cc: recipient,
      bcc: recipient
    });
    SmartAssert.isTrue(result.success, 'Draft creation should succeed');
    
    // 2. Find and verify draft via GmailApp
    const drafts = GmailApp.getDrafts();
    const draft = drafts.find(d => d.getMessage().getSubject() === subject);
    SmartAssert.notNull(draft, 'Draft should be found in Gmail');
    SmartAssert.equals(draft.getMessage().getTo(), recipient, 'Recipient should match');
    
    // Cleanup draft
    if (draft) draft.deleteDraft();
  });

  runner.register(`${NS}/MailService/EmailSending`, () => {
    const deps = createGoogleApiWrapperDeps();
    const mailService = new MailService(deps.logger, deps.mailUtils, deps.exceptionService);
    
    const recipient = Session.getEffectiveUser().getEmail();
    const subject = 'Test Send ' + Utilities.getUuid().substring(0, 8);
    
    // Send email with attachment
    const blob = Utilities.newBlob('Attachment content', 'text/plain', 'test.txt');
    const result = mailService.send({
      to: recipient,
      subject: subject,
      body: 'See attached',
      htmlBody: '<b>See attached</b>',
      attachments: [blob]
    });
    
    SmartAssert.isTrue(result.success, 'Email sending should succeed');
  });

  runner.register(`${NS}/MailService/QuotaManagement`, () => {
    const deps = createGoogleApiWrapperDeps();
    const mailService = new MailService(deps.logger, deps.mailUtils, deps.exceptionService);
    
    const quota = mailService.getQuotaUsage();
    SmartAssert.isNumber(quota, 'Should retrieve remaining daily quota as number');
    SmartAssert.isTrue(quota >= 0, 'Daily limit should be 0 or more');
  });
}
