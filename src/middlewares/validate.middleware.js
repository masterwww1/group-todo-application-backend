const logger = require("../config/logger");

const validateMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false,
        skripUnknown: true,
      });
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi) {
        logger.warn("validation error:", error.details);
        return res.status(400).json({
          error: "validation error",
          details: error.details.map((detail) => ({
            field: detail.context.key,
            message: detail.message,
          })),
        });
      }

      logger.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = validateMiddleware;
