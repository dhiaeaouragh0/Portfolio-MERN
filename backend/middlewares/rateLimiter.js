const rateLimit = require('express-rate-limit');

// Create a rate limiter for registration route
const registrationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Trop de tentatives d\'enregistrement. Essayez à nouveau plus tard.',
});

// Create a rate limiter for login route
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts
    message: 'Trop de tentatives de connexion. Essayez à nouveau plus tard.',
});

// Export the rate limiter
module.exports = { registrationRateLimiter , loginRateLimiter};
