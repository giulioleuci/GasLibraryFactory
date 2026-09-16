import { BlockDataContext } from '../BlockDataContext.js';

describe('BlockDataContext', () => {
  it('overlays local data, merges additions, and restores the serialized context', () => {
    const context = new BlockDataContext(
      { shared: 'local', user: { name: 'Ada' } },
      { shared: 'global', locale: 'it' }
    );

    context.merge({ ticket: { id: 7 } });
    context.set('user.role', 'teacher');

    expect(context.getAll()).toEqual({
      shared: 'local',
      locale: 'it',
      user: { name: 'Ada', role: 'teacher' },
      ticket: { id: 7 }
    });
    expect(BlockDataContext.fromJSON(context.toJSON()).getAll()).toEqual({
      shared: 'local',
      locale: 'it',
      user: { name: 'Ada', role: 'teacher' },
      ticket: { id: 7 }
    });
  });
});
