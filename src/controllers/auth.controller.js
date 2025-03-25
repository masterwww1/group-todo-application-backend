const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const { addToken } = require("../utils/fakeRedisBlacklistedToken");
const { authService } = require("../services");

const authController = {
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await authService.register(userData);
      logger.info(`User ${user.email} registered successfully`);
      res.status(201).json(user);
    } catch (error) {
      logger.error(error.message);
      res.status(error.statusCode).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      logger.info(`User ${user.email} logged in successfully`);
      res.status(200).json({ user, token });
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async me(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token not provided" });
      }

      const user = await authService.getCurrentUser(token);
      res.json(user);
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async logout(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        addToken(token);
      }
      res.status(204).send();
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = authController;