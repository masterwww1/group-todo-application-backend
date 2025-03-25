const morgan = require('morgan');
const logger = require('../config/logger');

morgan.token("user-id", (req) => req.user?.id || "anonymous");

const loggerMiddleware = morgan(
    ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] "referrer" ":user-agent"',
    {
        stream: {
            write: (message) => logger.info(message.trim())
        },
        skip: (req, res) => {
            return req.path === "/health" && res.statusCode === 200;
        }
    }
);

module.exports = loggerMiddleware;