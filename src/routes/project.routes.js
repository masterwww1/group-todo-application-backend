const express = require("express");
const router = express.Router();
const passport = require("passport");
const projectController = require("../controllers/project.controller");
const { authMiddleware, validateMiddleware } = require("../middlewares");
const { projectSchema } = require("../validations");

router.use(authMiddleware.authenticate);

router.get("/", projectController.getAll);

router.get("/:id", authMiddleware.checkProjectAccess, projectController.getOne);

router.post(
  "/",
  validateMiddleware(projectSchema.create),
  projectController.create
);

router.put(
  "/:id",
  authMiddleware.checkProjectAccess,
  validateMiddleware(projectSchema.update),
  projectController.update
);

router.delete(
  "/:id",
  authMiddleware.checkProjectAccess,
  projectController.delete
);

module.exports = router;
