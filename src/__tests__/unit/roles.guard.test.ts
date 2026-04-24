import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../auth/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'EMPLOYEE' } }),
      }),
    } as any;
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles metadata is defined', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when the user is missing', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    context = {
      ...context,
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as any;
    expect(guard.canActivate(context)).toBe(false);
  });

  it('allows access when the user role matches required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['EMPLOYEE']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when the user role does not match required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    expect(guard.canActivate(context)).toBe(false);
  });
});
