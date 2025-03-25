const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const validateMiddleware = require("../middlewares/validate.middleware");
const { authSchema } = require("../validations");

router.post(
  "/register",
  validateMiddleware(authSchema.register),
  authController.register
);

router.post(
  "/login",
  validateMiddleware(authSchema.login),
  passport.authenticate("local", { session: false }),
  authController.login
);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  authController.me
);

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  authController.logout
);

module.exports = router;