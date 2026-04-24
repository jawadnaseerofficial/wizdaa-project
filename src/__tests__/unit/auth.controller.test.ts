import { AuthController } from '../../auth/auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@wizdaa.com', role: 'EMPLOYEE' }),
    login: jest.fn().mockResolvedValue({ accessToken: 'token', user: { id: 'user-1', email: 'test@wizdaa.com' } }),
  };

  beforeEach(() => {
    controller = new AuthController(authService as any);
  });

  it('calls register with the provided DTO', async () => {
    await controller.register({ email: 'test@wizdaa.com', password: 'pass', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE' } as any);
    expect(authService.register).toHaveBeenCalled();
  });

  it('calls login with the provided DTO', async () => {
    await controller.login({ email: 'test@wizdaa.com', password: 'pass' } as any);
    expect(authService.login).toHaveBeenCalled();
  });

  it('returns the authenticated user profile', () => {
    const profile = controller.getProfile({ user: { id: 'user-1', email: 'test@wizdaa.com' } } as any);
    expect(profile).toEqual({ id: 'user-1', email: 'test@wizdaa.com' });
  });
});
