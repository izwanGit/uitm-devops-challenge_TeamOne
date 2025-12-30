const rateLimit = require('express-rate-limit');

// Global rate limiter for API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (increased for dev)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
  // Trust proxy is handled by app.set('trust proxy', n) in express app
});

// Stricter limiter for authentication routes (login, register, reset password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many authentication attempts, please try again after 15 minutes',
  },
});

module.exports = { globalLimiter, authLimiter };
