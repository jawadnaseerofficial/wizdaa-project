import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticate, validate, authRateLimiter } from '../middleware';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);

export default router;