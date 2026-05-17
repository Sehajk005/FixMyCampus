const rateLimit = require('express-rate-limit');

const makeLimiter = (windowMinutes, maxRequests) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests', errorCode: 'RATE_LIMIT' });
  },
});

module.exports = {
  authLimiter: makeLimiter(1, 10),     // 10 requests per minute
  ticketLimiter: makeLimiter(1, 100),  // 100 requests per minute
  globalLimiter: makeLimiter(1, 200),  // 200 requests per minute
};
