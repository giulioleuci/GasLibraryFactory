/**
 * 🧪 GasExpressionEngineLib Online Tests (Integrated with SpreadsheetApp)
 */

function initGasExpressionEngineLibTests() {
  const NS = 'GasExpressionEngineLib';

  runner.register(`${NS}/RealScenario/LoanApproval`, () => {
    const logger = new LoggerService();
    const engine = new ExpressionEngineService({ logger });

    const rules = {
      basicEligibility: '{{age}} >= 18 && {{age}} <= 70',
      incomeRequirement: '{{annualIncome}} >= 30000',
      creditScoreGood: '{{creditScore}} >= 650'
    };

    const applicant = {
      name: 'Alice Johnson',
      age: 35,
      annualIncome: 85000,
      creditScore: 780
    };

    const isEligible = engine.evaluate(rules.basicEligibility, applicant);
    const meetsIncome = engine.evaluate(rules.incomeRequirement, applicant);
    const isCreditGood = engine.evaluate(rules.creditScoreGood, applicant);

    SmartAssert.isTrue(isEligible, 'Should be basic eligible');
    SmartAssert.isTrue(meetsIncome, 'Should meet income requirement');
    SmartAssert.isTrue(isCreditGood, 'Should have good credit');

    // Verify interaction with SpreadsheetApp
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.appendRow(['Applicant', 'Eligible', 'Income', 'Credit']);
    sheet.appendRow([applicant.name, isEligible, meetsIncome, isCreditGood]);
    SpreadsheetApp.flush();

    const data = sheet.getDataRange().getValues();
    SmartAssert.equals(data[1][0], applicant.name, 'Spreadsheet should persist evaluation result');
  });

  runner.register(`${NS}/RealScenario/PricingRules`, () => {
    const logger = new LoggerService();
    const engine = new ExpressionEngineService({ logger });

    const rule = '{{quantity}} >= 100 && {{customerTier}} == "gold"';
    const order = { quantity: 150, customerTier: 'gold' };

    const applyDiscount = engine.evaluate(rule, order);
    SmartAssert.isTrue(applyDiscount, 'Should apply discount for gold customer with large quantity');

    const ss = testContext.getSpreadsheet();
    const sheet = ss.insertSheet('Pricing_' + new Date().getTime());
    sheet.appendRow(['Qty', 'Tier', 'Discount']);
    sheet.appendRow([order.quantity, order.customerTier, applyDiscount]);
    SpreadsheetApp.flush();

    const val = sheet.getRange(2, 3).getValue();
    SmartAssert.isTrue(val === true || val === 'TRUE', 'Spreadsheet should record discount decision');
  });
}
