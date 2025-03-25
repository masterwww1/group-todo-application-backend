const passport = require("passport");
const logger = require("../config/logger");
const { authService, projectService } = require("../services");

const authMiddleware = {
  authenticate: passport.authenticate("jwt", { session: false }),

  async checkOrganizationAccess(req, res, next) {
    try {
      const organizationId =
        req.params.organizationId || req.body.organization_id;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      const user = await authService.getUserById(req.user.id);
      if (!user || user.organization_id !== organizationId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      next();
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async checkProjectAccess(req, res, next) {
    try {
      const projectId = req.params.projectId || req.body.project_id;
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const project = await projectService.getProjectById(
        projectId,
        req.user.organization_id
      );

      req.project = project;
      next();
    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.status(404).json({ message: error.message });
      }
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = authMiddleware;