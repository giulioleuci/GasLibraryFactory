import { z } from 'zod';

export class MockSchemaValidator {
  constructor() {
    this.validate = jest.fn((schema, data) => data);
    this.safeValidate = jest.fn((schema, data) => ({ success: true, data }));
  }
}

export const createMockSchema = () =>
  z.object({
    id: z.string().optional(),
    name: z.string()
  });
