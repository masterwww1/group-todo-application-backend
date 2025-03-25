const authMiddleware = require("./auth.middleware");
const errorMiddleware = require("./error.middleware");
const rateLimiterMiddleware = require("./rateLimiter.middleware");
const validateMiddleware = require("./validate.middleware");
const loggerMiddleware = require("./logger.middleware");

module.exports = {
    authMiddleware,
    errorMiddleware,
    rateLimiterMiddleware,
    validateMiddleware,
    loggerMiddleware
}