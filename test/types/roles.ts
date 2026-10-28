import type { ActorSource } from '@RoleResolutionLib';
import {
  Actor,
  ActorType,
  AssignmentCandidate,
  AssignmentSlot,
  EffectiveAssignmentResolver,
  EffectiveAssignmentSource,
  WideRowAssignmentSource
} from '@RoleResolutionLib';

interface DepartmentContext {
  department: string;
}
interface StaffRow {
  rowId: string;
  department: string;
  managerId: string;
}
class StaffActor extends Actor {
  get department(): string {
    return this.getMetadata('department') as string;
  }
}

class DepartmentAssignments extends EffectiveAssignmentSource<DepartmentContext> {
  getAssignments(context: DepartmentContext, _asOfDate: Date): AssignmentCandidate[] {
    return [
      new AssignmentCandidate({
        id: 'manager-slot',
        actorId: 'manager',
        slot: new AssignmentSlot({ dimensions: { department: context.department } })
      })
    ];
  }
}

const mapped = new WideRowAssignmentSource<StaffRow, DepartmentContext>({
  rows: (context: DepartmentContext) => [
    { rowId: 'row-1', department: context.department, managerId: 'manager' }
  ],
  rowIdentityPath: 'rowId',
  columns: [{ name: 'managerId', slotDimensions: { department: { from: 'department' } } }]
});
const candidates: AssignmentCandidate[] = mapped.getAssignments(
  { department: 'engineering' },
  new Date()
);

const actors: ActorSource<StaffActor> = {
  getActor: (actorId: string) =>
    new StaffActor(actorId, ActorType.PERSON, 'manager@example.test', 'Manager', {
      department: 'engineering'
    })
};
const resolver = new EffectiveAssignmentResolver<DepartmentContext, StaffActor>({
  actorSource: actors,
  assignmentSource: new DepartmentAssignments(),
  overrideSource: { getOverrides: () => [] },
  delegationSource: { getDelegations: () => [] }
});
const resolvedActor: StaffActor | null = resolver.resolve({
  context: { department: 'engineering' },
  asOfDate: new Date()
})[0].effectiveActor;

new WideRowAssignmentSource<StaffRow, DepartmentContext>({
  // @ts-expect-error Row providers receive the same DepartmentContext as resolution.
  rows: (_context: number) => []
});
new WideRowAssignmentSource<StaffRow, DepartmentContext>({
  // @ts-expect-error Row providers must return StaffRow values synchronously.
  rows: (_context: DepartmentContext) => [{ unrelated: true }]
});

void [candidates, resolvedActor];
