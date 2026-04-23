import rateLimit from 'express-rate-limit';

export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const generalRateLimiter = createRateLimiter(15 * 60 * 1000, 100);