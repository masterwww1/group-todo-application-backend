const defaultDb = require("../config/database");
const defaultLogger = require("../config/logger");

const { NotFoundError } = require("../utils/errors");

class ProjectService {
  constructor(db = defaultDb, logger = defaultLogger) {
    this.db = db;
    this.logger = logger;
  }

  async getAllProjects(organizationId) {
    if (!organizationId) {
      throw new Error("organization ID is required");
    }

    try {
      const projects = await this.db("projects")
        .where({ organization_id: organizationId })
        .select("*");
      return projects;
    } catch (error) {
      this.logger.error("Get projects error:", error);
      throw error;
    }
  }

  async getProjectById(projectId, organizationId) {
    if (!projectId || !organizationId) {
      throw new Error("Project ID and organization ID is required");
    }
    try {
      const project = await this.db("projects")
        .where({ id: projectId, organization_id: organizationId })
        .first();

      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return project;
    } catch (error) {
      this.logger.error("Error fetching project by ID:", error);
      throw error;
    }
  }

  async createProject(projectData, organizationId) {
    if (!projectData || !organizationId) {
      throw new Error("Project data and organization id are needed");
    }

    try {
      const [project] = await this.db("projects")
        .insert({
          ...projectData,
          organization_id: organizationId,
        })
        .returning("*");

      return project;
    } catch (error) {
      this.logger.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(projectId, projectData, organizationId) {
    if (!projectId || !projectData || !organizationId) {
      throw new Error("Project ID, data and organization ID are needed");
    }

    try {
      const [project] = await this.db("projects")
        .where({ id: projectId, organization_id: organizationId })
        .update({ ...projectData, updated_at: this.db.fn.now() })
        .returning("*");

      if (!project) {
        throw new NotFoundError("Project not found");
      }

      this.logger.info("Project updated successfully:", projectId);

      return project;
    } catch (error) {
      this.logger.error("Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(projectId, organizationId) {
    if (!projectId || !organizationId) {
      throw new Error("Project ID and organization ID are needed");
    }

    try {
      const count = await this.db("projects")
        .where({ id: projectId, organization_id: organizationId })
        .delete()

      if (!count) {
        throw new NotFoundError("Project not found");
      }

      this.logger.info("Project deleted successfully:", projectId);

      return project;
    } catch (error) {
      this.logger.error("Error deleting project:", error);
      throw error;
    }
  }
}

module.exports = new ProjectService();