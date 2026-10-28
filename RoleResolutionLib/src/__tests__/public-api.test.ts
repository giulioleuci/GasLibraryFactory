import {
  AssignmentSource,
  EffectiveAssignmentSource,
  InMemoryAssignmentSource,
  RoleResolver,
  WideRowAssignmentSource
} from '../../index.js';

describe('RoleResolutionLib assignment source public APIs', () => {
  it('keeps RoleResolver paired with its compatible legacy assignment contract', () => {
    const source = new InMemoryAssignmentSource();

    expect(typeof RoleResolver).toBe('function');
    expect(source).toBeInstanceOf(AssignmentSource);
    expect(typeof AssignmentSource.prototype.getAssignmentsForRole).toBe('function');
    expect(typeof AssignmentSource.prototype.getActorById).toBe('function');
  });

  it('publishes the effective assignment source under a distinct contract name', () => {
    const source = new WideRowAssignmentSource();

    expect(source).toBeInstanceOf(EffectiveAssignmentSource);
    expect(source).not.toBeInstanceOf(AssignmentSource);
    expect(typeof EffectiveAssignmentSource.prototype.getAssignments).toBe('function');
  });
});
