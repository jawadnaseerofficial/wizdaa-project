import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../../auth/jwt.strategy';

describe('JwtStrategy', () => {
  it('returns validated user payload when the user exists', async () => {
    const authService = {
      getUserById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@wizdaa.com',
        role: 'EMPLOYEE',
        firstName: 'John',
        lastName: 'Doe',
      }),
    };
    const configService = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(authService as any, configService);

    const result = await strategy.validate({ sub: 'user-1' });

    expect(result).toEqual({
      sub: 'user-1',
      email: 'test@wizdaa.com',
      role: 'EMPLOYEE',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(authService.getUserById).toHaveBeenCalledWith('user-1');
  });

  it('throws UnauthorizedException when the user is not found', async () => {
    const authService = { getUserById: jest.fn().mockResolvedValue(null) };
    const configService = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(authService as any, configService);

    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(UnauthorizedException);
  });
});
