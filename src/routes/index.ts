import { Router } from 'express';
import authRoutes from './auth.routes';
import timeOffRoutes from './timeOff.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/time-off', timeOffRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;