import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { asyncHandler } from '../utils';
import { AuthRequest } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await this.authService.register(req.body);

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'User registered successfully',
    });
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await this.authService.login(req.body);

    res.status(200).json({
      success: true,
      data: { user, token },
      message: 'Login successful',
    });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const user = await this.authService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const result = await this.authService.refreshToken(token);

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}