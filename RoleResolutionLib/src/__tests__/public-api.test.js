import { AssignmentSource, WideRowAssignmentSource } from '../../index.js';

describe('RoleResolutionLib effective-assignment public API', () => {
  it('exports the effective assignment source contract used by mapped sources', () => {
    const source = new WideRowAssignmentSource();

    expect(source).toBeInstanceOf(AssignmentSource);
    expect(typeof AssignmentSource.prototype.getAssignments).toBe('function');
    expect(AssignmentSource.prototype.getAssignmentsForRole).toBeUndefined();
  });
});
