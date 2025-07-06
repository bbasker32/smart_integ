// controllers/projectController.js
const { project, users, profile } = require("../models");
const logger = require('../utils/logger');

// Helper function to get participant names
const getParticipantNames = async (participantsString) => {
  if (!participantsString) return [];

  const participantIds = participantsString
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id);
  if (participantIds.length === 0) return [];

  try {
    const Users = await users.findAll({
      where: { id: participantIds },
      attributes: ["id", "firstName", "lastName"],
    });

    return Users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
    }));
  } catch (error) {
    logger.error("Erreur lors de la récupération des noms des participants", { error: error.message, stack: error.stack });
    return [];
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  logger.info("[GET] /projects - Récupération de tous les projets", { query: req.query });
  try {
    const { userId, userRole } = req.query; // Get userId and userRole from query params
    const where = {};

    // Add status filter if provided
    if (req.query.status) {
      where.status = req.query.status;
    }

    // Add is_archived filter if provided
    if (req.query.is_archived) {
      where.is_archived = req.query.is_archived === "true";
    }

    // Add creation date filter if provided
    if (req.query.creationDate) {
      const date = new Date(req.query.creationDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.createdAt = {
        [require("sequelize").Op.gte]: date,
        [require("sequelize").Op.lt]: nextDay,
      };
    }

    // Only allow all projects for admin
    if (userRole !== "admin") {
      if (!userId) {
        logger.warn("Accès refusé : userId manquant pour un non-admin");
        return res
          .status(403)
          .json({ error: "Access denied: userId required for non-admins" });
      }
      where[require("sequelize").Op.or] = [
        { fk_user: userId }, // User is the creator/responsible
        require("sequelize").literal(`participants LIKE '%${userId}%'`), // User is a participant
      ];
    }

    const projects = await project.findAll({
      where,
      include: [
        {
          model: profile,
          as: "Profiles",
          attributes: ["id", "title"],
        },
        {
          model: users,
          as: "User",
          attributes: ["firstName", "lastName"],
        },
      ],
    });
    logger.info("Projets récupérés", { count: projects.length });
    res.json(projects);
  } catch (error) {
    logger.error("Erreur lors de la récupération des projets", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  logger.info("[GET] /projects/:id - Récupération d'un projet", { id: req.params.id });
  try {
    const Project = await project.findByPk(req.params.id, {
      include: [
        {
          model: profile,
          as: "Profiles",
          attributes: ["id", "title"],
        },
        {
          model: users,
          as: "User",
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    if (!Project) {
      logger.warn("Projet non trouvé", { id: req.params.id });
      return res.status(404).json({ error: "Project not found" });
    }

    // Add participant information
    const projectData = Project.toJSON();
    projectData.participantNames = await getParticipantNames(
      Project.participants
    );

    logger.info("Projet récupéré avec succès", { id: req.params.id });
    res.json(projectData);
  } catch (error) {
    logger.error("Erreur lors de la récupération du projet", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Create project
exports.createProject = async (req, res) => {
  logger.info("[POST] /projects - Création d'un projet", { body: req.body });
  try {
    const body = { ...req.body };
    // Map 'resp' to 'fk_user'
    if (body.resp) {
      body.fk_user = body.resp;
      delete body.resp;
    }

    // Ensure participants is stored as comma-separated string
    if (body.participants && Array.isArray(body.participants)) {
      body.participants = body.participants.join(",");
    }
    const Project = await project.create(body);
    logger.info("Projet créé avec succès", { id: Project.id });
    res.status(201).json(Project);
  } catch (error) {
    logger.error("Erreur lors de la création du projet", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  logger.info("[PUT] /projects/:id - Mise à jour d'un projet", { id: req.params.id, body: req.body });
  try {
    const Project = await project.findByPk(req.params.id);
    if (!Project) {
      logger.warn("Projet non trouvé pour mise à jour", { id: req.params.id });
      return res.status(404).json({ error: "Project not found" });
    }
    if (Project.is_archived) {
      logger.warn("Tentative de modification d'un projet archivé", { id: req.params.id });
      return res
        .status(403)
        .json({ error: "Impossible de modifier un projet archivé." });
    }
    const body = { ...req.body };
    console.log(body);
    // Map 'resp' to 'fk_user'
    if (body.resp) {
      body.fk_user = body.resp;
      delete body.resp;
    }
    // Ensure participants is stored as comma-separated string
    if (body.participants && Array.isArray(body.participants)) {
      body.participants = body.participants.join(",");
    }
    await Project.update(body);
    logger.info("Projet mis à jour avec succès", { id: Project.id });
    res.json(Project);
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du projet", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  logger.info("[DELETE] /projects/:id - Suppression d'un projet", { id: req.params.id });
  try {
    const Project = await project.findByPk(req.params.id, {
      include: [{ model: profile, as: "Profiles" }],
    });
    if (!Project) {
      logger.warn("Projet non trouvé pour suppression", { id: req.params.id });
      return res.status(404).json({ error: "Project not found" });
    }

    // Si le projet a des profils, on archive
    if (Project.Profiles && Project.Profiles.length > 0) {
      await Project.update({ is_archived: true });
      logger.info("Projet archivé (non supprimé car il contient des profils)", { id: req.params.id });
      return res.status(200).json({
        message: "Projet archivé (non supprimé car il contient des profils)",
      });
    }

    // Sinon, suppression normale
    await Project.destroy();
    logger.info("Projet supprimé avec succès", { id: req.params.id });
    res.status(204).end();
  } catch (error) {
    logger.error("Erreur lors de la suppression/archivage du projet", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Get all profiles for a project
exports.getProjectProfiles = async (req, res) => {
  logger.info("[GET] /projects/:projectId/profiles - Récupération des profils d'un projet", { projectId: req.params.projectId });
  try {
    const profiles = await profile.findAll({
      where: { fk_project: req.params.projectId },
      attributes: ["id", "title"],
      order: [["id", "ASC"]],
    });
    logger.info("Profils du projet récupérés", { projectId: req.params.projectId, count: profiles.length });
    res.json(profiles);
  } catch (error) {
    logger.error("Erreur lors de la récupération des profils du projet", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};
