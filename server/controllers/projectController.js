// controllers/projectController.js
const { project, users, profile } = require("../models");

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
    console.error("Error fetching participant names:", error);
    return [];
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
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
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Get single project
exports.getProject = async (req, res) => {
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

    if (!Project) return res.status(404).json({ error: "Project not found" });

    // Add participant information
    const projectData = Project.toJSON();
    projectData.participantNames = await getParticipantNames(
      Project.participants
    );

    res.json(projectData);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Create project
exports.createProject = async (req, res) => {
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
    res.status(201).json(Project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const Project = await project.findByPk(req.params.id);
    if (!Project) return res.status(404).json({ error: "Project not found" });
    if (Project.is_archived) {
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
    res.json(Project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const Project = await project.findByPk(req.params.id, {
      include: [{ model: profile, as: "Profiles" }],
    });
    if (!Project) return res.status(404).json({ error: "Project not found" });

    // Si le projet a des profils, on archive
    if (Project.Profiles && Project.Profiles.length > 0) {
      await Project.update({ is_archived: true });
      return res.status(200).json({
        message: "Projet archivé (non supprimé car il contient des profils)",
      });
    }

    // Sinon, suppression normale
    await Project.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting/archiving project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Get all profiles for a project
exports.getProjectProfiles = async (req, res) => {
  try {
    const profiles = await profile.findAll({
      where: { fk_project: req.params.projectId },
      attributes: ["id", "title"],
      order: [["id", "ASC"]],
    });
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Database error" });
  }
};
