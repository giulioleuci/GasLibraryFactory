// ===================================================================
// FILE: PipelineFramework/src/__tests__/integration/ProducerConsumerPipeline.test.js
// ===================================================================
// Integration test for Producer-Consumer pattern
// Tests: Full pipeline with ProducerStep -> ConsumerStep workflow
// ===================================================================

import { Pipeline } from '../../Pipeline';
import { PipelineContext } from '../../PipelineContext';
import { ProducerStep } from '../../ProducerStep';
import { ConsumerStep } from '../../ConsumerStep';
import { TemplateSelectorStep } from '../../examples/TemplateSelectorStep';
import { GenerateDocumentStep } from '../../examples/GenerateDocumentStep';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { LoggerService } from '@CoreUtilsLib';

describe('Producer-Consumer Pipeline - Integration Tests', () => {
  let logger;
  let expressionEngine;
  let mockDriveService;

  beforeEach(() => {
    logger = new LoggerService();
    expressionEngine = new ExpressionEngineService({ logger });

    mockDriveService = {
      copyFile: jest.fn(),
      createDocument: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // FULL PIPELINE: DECISION -> ACTION
  // ===================================================================

  describe('Full Pipeline: Decision -> Action', () => {
    it('should execute complete Producer-Consumer workflow for passing grade', () => {
      // Setup pipeline
      const pipeline = new Pipeline(logger);

      // Add Producer Step (Decision)
      const templateSelector = new TemplateSelectorStep(logger, expressionEngine, {
        outputKey: 'selected_template_id'
      });

      // Add Consumer Step (Action)
      const documentGenerator = new GenerateDocumentStep(logger, mockDriveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      pipeline.addStep(templateSelector).addStep(documentGenerator);

      // Execute with passing grade data
      const initialData = {
        grade: 8,
        absences: 2,
        student_name: 'John Doe'
      };

      const finalContext = pipeline.execute(initialData);

      // Verify execution
      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(finalContext.get('generated_document')).toBeDefined();
      expect(finalContext.get('generated_document').name).toBe('John Doe - PASS Report');

      // Verify pipeline completed successfully
      const summary = finalContext.getSummary();
      expect(summary.totalSteps).toBe(2);
      expect(summary.completedSteps).toBe(2);
      expect(summary.failedSteps).toBe(0);
    });

    it('should execute complete Producer-Consumer workflow for failing grade', () => {
      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      const initialData = {
        grade: 4,
        absences: 2,
        student_name: 'Jane Smith'
      };

      const finalContext = pipeline.execute(initialData);

      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_FAIL');
      expect(finalContext.get('generated_document').name).toBe('Jane Smith - FAIL Report');
      expect(finalContext.get('generated_document').templateId).toBe('TEMPLATE_FAIL');
    });

    it('should execute complete Producer-Consumer workflow for too many absences', () => {
      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      const initialData = {
        grade: 7,
        absences: 6,
        student_name: 'Bob Jones'
      };

      const finalContext = pipeline.execute(initialData);

      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_TOO_MANY_ABSENCES');
      expect(finalContext.get('generated_document').name).toBe(
        'Bob Jones - TOO_MANY_ABSENCES Report'
      );
    });
  });

  // ===================================================================
  // DECOUPLING VERIFICATION
  // ===================================================================

  describe('Decoupling Verification', () => {
    it('should demonstrate strict separation: ConsumerStep does not know WHY template was chosen', () => {
      // Create a simple ProducerStep that uses different logic
      class AlternateProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('AlternateProducer', logger, expressionEngine, options);
        }
        evaluateRules(context) {
          // Different logic: based on student ID parity
          const studentId = context.get('student_id');
          return studentId % 2 === 0 ? 'TEMPLATE_PASS' : 'TEMPLATE_FAIL';
        }
      }

      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new AlternateProducer(logger, expressionEngine, {
            outputKey: 'selected_template_id',
            requiredKeys: ['student_id']
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      // The ConsumerStep doesn't care that the logic is different
      const finalContext = pipeline.execute({
        student_id: 42,
        student_name: 'Test Student'
      });

      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(finalContext.get('generated_document')).toBeDefined();
    });

    it('should allow swapping ProducerStep without changing ConsumerStep', () => {
      // Create two different ProducerSteps
      class SimpleProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('SimpleProducer', logger, expressionEngine, options);
        }
        evaluateRules() {
          return 'TEMPLATE_PASS';
        }
      }

      class ComplexProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('ComplexProducer', logger, expressionEngine, options);
        }
        evaluateRules(context) {
          const score = context.get('score', 0);
          return score > 80 ? 'TEMPLATE_PASS' : 'TEMPLATE_FAIL';
        }
      }

      // Same ConsumerStep for both
      const consumerStep = new GenerateDocumentStep(logger, mockDriveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      // Pipeline 1: Simple Producer
      const pipeline1 = new Pipeline(logger);
      pipeline1
        .addStep(
          new SimpleProducer(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(consumerStep);

      const context1 = pipeline1.execute({ student_name: 'Student 1' });
      expect(context1.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(context1.get('generated_document')).toBeDefined();

      // Pipeline 2: Complex Producer
      const pipeline2 = new Pipeline(logger);
      pipeline2
        .addStep(
          new ComplexProducer(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      const context2 = pipeline2.execute({ score: 90, student_name: 'Student 2' });
      expect(context2.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(context2.get('generated_document')).toBeDefined();
    });

    it('should verify ConsumerStep has zero dependencies on ExpressionEngine', () => {
      // Create ConsumerStep without any expression engine
      const consumerStep = new GenerateDocumentStep(logger, mockDriveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      // Manually inject value into context (simulating ProducerStep output)
      const context = new PipelineContext({
        selected_template_id: 'TEMPLATE_PASS',
        student_name: 'Manual Test'
      });

      // ConsumerStep should work without any ProducerStep
      const result = consumerStep.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('generated_document')).toBeDefined();
      expect(context.get('generated_document').name).toBe('Manual Test - PASS Report');
    });
  });

  // ===================================================================
  // MULTIPLE PRODUCER-CONSUMER PAIRS
  // ===================================================================

  describe('Multiple Producer-Consumer Pairs', () => {
    it('should support multiple decision points in one pipeline', () => {
      // Step 1: Decide template
      // Step 2: Generate document
      // Step 3: Decide email subject
      // Step 4: Send email (mock)

      class EmailSubjectProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('EmailSubjectProducer', logger, expressionEngine, options);
        }
        evaluateRules(context) {
          const templateId = context.get('selected_template_id');
          if (templateId === 'TEMPLATE_PASS') {
            return 'Congratulations on Passing!';
          }
          return 'We Need to Talk';
        }
      }

      class EmailSenderConsumer extends ConsumerStep {
        constructor(logger, options = {}) {
          super('EmailSenderConsumer', logger, options);
        }
        performAction(subject, context) {
          const doc = context.get('generated_document');
          return {
            to: 'student@example.com',
            subject: subject,
            body: `Please see your report: ${doc.url}`,
            sent: true
          };
        }
      }

      const pipeline = new Pipeline(logger);

      pipeline
        // Producer-Consumer Pair 1: Template Selection
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        )
        // Producer-Consumer Pair 2: Email
        .addStep(
          new EmailSubjectProducer(logger, expressionEngine, {
            outputKey: 'email_subject',
            requiredKeys: ['selected_template_id']
          })
        )
        .addStep(
          new EmailSenderConsumer(logger, {
            inputKey: 'email_subject',
            outputKey: 'email_result',
            requiredKeys: ['generated_document']
          })
        );

      const finalContext = pipeline.execute({
        grade: 8,
        absences: 2,
        student_name: 'John Doe'
      });

      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(finalContext.get('generated_document')).toBeDefined();
      expect(finalContext.get('email_subject')).toBe('Congratulations on Passing!');
      expect(finalContext.get('email_result')).toEqual({
        to: 'student@example.com',
        subject: 'Congratulations on Passing!',
        body: expect.stringContaining('Please see your report'),
        sent: true
      });
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should fail gracefully when ProducerStep returns invalid scalar', () => {
      class BadProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('BadProducer', logger, expressionEngine, options);
        }
        evaluateRules() {
          return { invalid: 'object' }; // Not a scalar
        }
      }

      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new BadProducer(logger, expressionEngine, {
            outputKey: 'result'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'result',
            outputKey: 'document'
          })
        );

      // Pipeline stops on error and returns context with failure info
      const result = pipeline.execute({ student_name: 'Test' });
      const summary = result.getSummary();
      expect(summary.failedSteps).toBe(1);
    });

    it('should fail gracefully when ConsumerStep input is missing', () => {
      const pipeline = new Pipeline(logger);

      // Producer writes to different key than Consumer expects
      class MismatchProducer extends ProducerStep {
        constructor(logger, expressionEngine, options = {}) {
          super('MismatchProducer', logger, expressionEngine, options);
        }
        evaluateRules() {
          return 'VALUE';
        }
      }

      pipeline
        .addStep(
          new MismatchProducer(logger, expressionEngine, {
            outputKey: 'wrong_key' // ConsumerStep expects 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'document'
          })
        );

      // Pipeline stops on error and returns context with failure info
      const result = pipeline.execute({ student_name: 'Test' });
      const summary = result.getSummary();
      expect(summary.failedSteps).toBe(1);
    });
  });

  // ===================================================================
  // PIPELINE LIFECYCLE HOOKS
  // ===================================================================

  describe('Pipeline Lifecycle Hooks', () => {
    it('should track Producer and Consumer steps separately in lifecycle hooks', () => {
      const executedSteps = [];

      const pipeline = new Pipeline(logger);

      pipeline
        .beforeStep((step, context) => {
          executedSteps.push({
            name: step.getName(),
            type:
              step instanceof ProducerStep
                ? 'Producer'
                : step instanceof ConsumerStep
                  ? 'Consumer'
                  : 'Unknown'
          });
        })
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      pipeline.execute({
        grade: 8,
        absences: 2,
        student_name: 'John Doe'
      });

      expect(executedSteps).toEqual([
        { name: 'TemplateSelector', type: 'Producer' },
        { name: 'GenerateDocument', type: 'Consumer' }
      ]);
    });
  });

  // ===================================================================
  // CONTEXT DATA FLOW
  // ===================================================================

  describe('Context Data Flow', () => {
    it('should preserve all context data throughout pipeline', () => {
      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new GenerateDocumentStep(logger, mockDriveService, {
            inputKey: 'selected_template_id',
            outputKey: 'generated_document'
          })
        );

      const initialData = {
        grade: 8,
        absences: 2,
        student_name: 'John Doe',
        student_id: 12345,
        course: 'Mathematics',
        semester: 'Fall 2024'
      };

      const finalContext = pipeline.execute(initialData);

      // All initial data should still be present
      expect(finalContext.get('grade')).toBe(8);
      expect(finalContext.get('absences')).toBe(2);
      expect(finalContext.get('student_name')).toBe('John Doe');
      expect(finalContext.get('student_id')).toBe(12345);
      expect(finalContext.get('course')).toBe('Mathematics');
      expect(finalContext.get('semester')).toBe('Fall 2024');

      // Plus new data from steps
      expect(finalContext.get('selected_template_id')).toBe('TEMPLATE_PASS');
      expect(finalContext.get('generated_document')).toBeDefined();
    });

    it('should allow steps to read data from previous steps', () => {
      class EnrichmentConsumer extends ConsumerStep {
        constructor(logger, options) {
          super('EnrichmentConsumer', logger, options);
        }

        performAction(templateId, context) {
          // Can read all context data
          const grade = context.get('grade');
          const studentName = context.get('student_name');

          return {
            templateId,
            enrichedData: {
              message: `${studentName} received ${grade} points and gets ${templateId}`
            }
          };
        }
      }

      const pipeline = new Pipeline(logger);

      pipeline
        .addStep(
          new TemplateSelectorStep(logger, expressionEngine, {
            outputKey: 'selected_template_id'
          })
        )
        .addStep(
          new EnrichmentConsumer(logger, {
            inputKey: 'selected_template_id',
            outputKey: 'enriched_result'
          })
        );

      const finalContext = pipeline.execute({
        grade: 8,
        absences: 2,
        student_name: 'John Doe'
      });

      const enriched = finalContext.get('enriched_result');
      expect(enriched.enrichedData.message).toBe(
        'John Doe received 8 points and gets TEMPLATE_PASS'
      );
    });
  });
});
