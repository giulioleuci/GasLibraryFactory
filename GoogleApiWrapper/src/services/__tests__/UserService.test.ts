import { UserService } from '../UserService.js';

describe('UserService', () => {
  let mockLogger: { debug: jest.Mock<void, unknown[]>; error: jest.Mock<void, unknown[]> };

  beforeEach(() => {
    mockLogger = { debug: jest.fn(), error: jest.fn() };
  });

  test('getActiveUserEmail returns the email from the native Session global', () => {
    Object.assign(global, {
      Session: {
        getActiveUser: jest.fn(() => ({ getEmail: () => 'docente@scuola.it' }))
      }
    });
    const service = new UserService(mockLogger);
    expect(service.getActiveUserEmail()).toBe('docente@scuola.it');
    expect(global.Session.getActiveUser).toHaveBeenCalled();
  });

  test('getActiveUserEmail logs and rethrows on native failure', () => {
    Object.assign(global, {
      Session: {
        getActiveUser: jest.fn(() => {
          throw new Error('no active user');
        })
      }
    });
    const service = new UserService(mockLogger);
    expect(() => service.getActiveUserEmail()).toThrow('no active user');
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
