import { jest } from '@jest/globals';
import { BlockDataContext } from '../BlockDataContext.js';

describe('BlockDataContext', () => {
  it('overlays local data, merges additions, and restores the serialized context', () => {
    const localData = { shared: 'local', user: { name: 'Ada' } };
    const globalContext = { shared: 'global', locale: 'it', user: { timezone: 'Europe/Rome' } };
    const context = new BlockDataContext(localData, globalContext);

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
    expect(localData).toEqual({ shared: 'local', user: { name: 'Ada' } });
    expect(globalContext).toEqual({
      shared: 'global',
      locale: 'it',
      user: { timezone: 'Europe/Rome' }
    });
  });
});
