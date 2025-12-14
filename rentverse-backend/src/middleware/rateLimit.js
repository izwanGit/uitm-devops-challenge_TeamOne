const rateLimit = require('express-rate-limit');

// Global rate limiter for API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
  // Trust proxy is handled by app.set('trust proxy', n) in express app
});

module.exports = { globalLimiter };
