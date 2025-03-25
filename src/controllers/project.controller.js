const db = require("../config/database");
const logger = require("../config/logger");

const projectController = {
  async getAll(req, res) {
    try {
      const projects = await db("projects")
        .where({ organization_id: req.user.organization_id })
        .select("*");

      res.json(projects);
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getOne(req, res) {
    try {
      const project = await db("projects")
        .where({
          id: req.params.id,
          organization_id: req.user.organization_id,
        })
        .first();

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body;

      const [project] = await db("projects")
        .insert({
          name,
          description,
          organization_id: req.user.organization_id,
        })
        .returning("*");

      logger.info(`Project ${project.name} created successfully`);
      res.status(201).json(project);
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { name, description } = req.body;

      const [prject] = await db("projects")
        .where({
          id: req.params.id,
          organization_id: req.user.organization_id,
        })
        .update({
          name,
          description,
          updated_at: db.fn.now(),
        })
        .returning("*");

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      logger.info(`Project ${project.name} updated successfully`);
      res.json(project);
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const count = await db("projects")
        .where({
          id: req.params.id,
          organization_id: req.user.organization_id,
        })
        .delete();

      if (!count) {
        return res.status(404).json({ error: "Project not found" });
      }

      logger.info(`Project ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = projectController;
