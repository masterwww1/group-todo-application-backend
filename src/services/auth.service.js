const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const logger = require("../config/logger");
const {
  UnauthorizedError,
  RegistrationError,
  UserNotFoundError,
  InvalidCredentialsError,
} = require("../utils/errors");

class AuthService {
  async getCurrentUser(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await db("users").where("id", decoded.id).first();

      if (!user) {
        throw new UserNotFoundError("User not found");
      }

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      // Log the error and throw custom unauthorized error
      logger.error("Get current user error:", error);

      if (error instanceof UserNotFoundError) {
        throw error;
      } else {
        throw new UnauthorizedError();
      }
    }
  }

  async getUserById(userId) {
    try {
      const user = await db("users").where("id", userId).first();

      if (!user) {
        throw new UserNotFoundError("User not found");
      }

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      // Log the error and throw custom unauthorized error
      logger.error("Get current user error:", error);

      if (error instanceof UserNotFoundError) {
        throw error;
      } else {
        throw new UnauthorizedError();
      }
    }
  }

  async register(userData) {
    try {
      const { email, password, name, organization_id } = userData;

      // Check if user exists
      const existingUser = await db("users").where({ email }).first();

      if (existingUser) {
        throw new RegistrationError("Email already registered");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const [user] = await db("users")
        .insert({
          email,
          password_hash,
          name,
          organization_id,
        })
        .returning(["id", "email", "name", "organization_id"]);

      logger.info(`User registered successfully: ${email}`);
      return user;
    } catch (error) {
      logger.error("Registration error:", error);
      // If the error isn't already a custom error, wrap it in one
      if (!(error instanceof RegistrationError)) {
        throw new RegistrationError(error.message);
      }
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await db("users").where({ email }).first();

      if (!user) {
        throw new InvalidCredentialsError();
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        throw new InvalidCredentialsError();
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const { password_hash, ...userWithoutPassword } = user;

      logger.info(`User logged in successfully: ${email}`);
      return { token, user: userWithoutPassword };
    } catch (error) {
      logger.error("Login error:", error);
      // If the error isn't a custom error, wrap it in one
      if (!(error instanceof InvalidCredentialsError)) {
        throw new InvalidCredentialsError(error.message);
      }
      throw error;
    }
  }
}

module.exports = new AuthService();
