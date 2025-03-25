const logger = require("../config/logger");

const errorMiddleware = {
    notFound(req, res, next) {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        res.status(404).json({ message: "Not Found" });
        next(error);
    },
    
    errorHandler(error, req, res, next) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

        logger.error("Error:", {
            message: error.message,
            stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
            path: req.path,
            method: req.method
        });

        res.status(statusCode).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
        });
    },
}

module.exports = errorMiddleware;