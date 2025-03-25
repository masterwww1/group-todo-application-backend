const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const logger = require("./config/logger");
const { errorMiddleware, rateLimiterMiddleware } = require("./middlewares");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
  })
);
app.use(helmet());
app.use(rateLimiterMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

require("./config/passport");
app.use(passport.initialize());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamps: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.use(errorMiddleware.notFound);
app.use(errorMiddleware.errorHandler);

const gracefulShutdown = () => {
  logger.info("Shutting down gracefully");

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled rejection at ${promise}, reason: ${reason.message}`);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

module.exports = { app, server };
