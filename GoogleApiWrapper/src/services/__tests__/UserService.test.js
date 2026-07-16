import { UserService } from '../UserService';

describe('UserService', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = { debug: jest.fn(), error: jest.fn() };
  });

  test('getActiveUserEmail returns the email from the native Session global', () => {
    global.Session = {
      getActiveUser: jest.fn(() => ({ getEmail: () => 'docente@scuola.it' }))
    };
    const service = new UserService(mockLogger);
    expect(service.getActiveUserEmail()).toBe('docente@scuola.it');
    expect(global.Session.getActiveUser).toHaveBeenCalled();
  });

  test('getActiveUserEmail logs and rethrows on native failure', () => {
    global.Session = {
      getActiveUser: jest.fn(() => {
        throw new Error('no active user');
      })
    };
    const service = new UserService(mockLogger);
    expect(() => service.getActiveUserEmail()).toThrow('no active user');
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
