//controller/profileController.js
const { profile, project, JobOffer, JobPosting } = require("../models");
const logger = require('../utils/logger');

// Helper function to process skills arrays
const processProfileData = (data) => ({
  ...data,
  technicalSkills: data.technicalSkills.join(", "),
  softSkills: data.softSkills.join(", "),
  languages: data.languages.join(", "),
});

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  logger.info("[GET] /profiles - Récupération de tous les profils");
  try {
    const profiles = await profile.findAll({
      order: [["createdAt", "DESC"]],
    });
    logger.info("Profils récupérés", { count: profiles.length });
    res.json(profiles);
  } catch (error) {
    logger.error("Erreur lors de la récupération des profils", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// profileController.js

exports.getProfile = async (req, res) => {
  logger.info("[GET] /profiles/:id - Récupération d'un profil", { id: req.params.id });
  try {
    const Profile = await profile.findByPk(req.params.id, {
      include: [
        {
          model: project,
          as: "Project",
          attributes: ["id", "title", "description"],
        },
      ],
    });

    if (!Profile) {
      logger.warn("Profil non trouvé", { id: req.params.id });
      return res.status(404).json({ error: "Profile not found" });
    }

    // Convert string fields to arrays
    const responseData = {
      ...Profile.toJSON(),
      technicalSkills: Profile.technicalSkills
        ? Profile.technicalSkills.split(", ")
        : [],
      softSkills: Profile.softSkills ? Profile.softSkills.split(", ") : [],
      languages: Profile.languages ? Profile.languages.split(", ") : [],
    };

    logger.info("Profil récupéré avec succès", { id: req.params.id });
    res.json(responseData);
  } catch (error) {
    logger.error("Erreur lors de la récupération du profil", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Create profile
exports.createProfile = async (req, res) => {
  logger.info("[POST] /profiles - Création d'un profil", { body: req.body });
  try {
    // Vérifier si le projet parent est archivé
    const projectId = req.body.fk_project;
    if (projectId) {
      const Project = await project.findByPk(projectId);
      if (Project && Project.is_archived) {
        logger.warn("Tentative d'ajout d'un profil à un projet archivé", { projectId });
        return res.status(403).json({
          error: "Impossible d'ajouter un profil à un projet archivé.",
        });
      }
    }
    // Initialize with empty data if req.body is undefined
    const baseData = req.body || {};
    let processedData = {
      ...baseData,
      title: baseData.title || "New Profile",
      description: baseData.description || "",
      location: baseData.location || "",
      yearsOfExperience: baseData.yearsOfExperience || "0", // Default to "0" for integer field
      typeContract: baseData.typeContract || "",
      mainMissions: baseData.mainMissions || "",
      education: baseData.education || "",
      startDate: baseData.startDate ? new Date(baseData.startDate) : null, // Handle date properly
      // Convert arrays to comma-separated strings, handle undefined arrays
      technicalSkills: Array.isArray(baseData.technicalSkills)
        ? baseData.technicalSkills.join(", ")
        : "",
      softSkills: Array.isArray(baseData.softSkills)
        ? baseData.softSkills.join(", ")
        : "",
      languages: Array.isArray(baseData.languages)
        ? baseData.languages.join(", ")
        : "",
      status: baseData.status || "profile", // Default to 'profile' if not provided
    }; // Create the profile with the processed data
    const Profile = await profile.create(processedData); // processedData already has fk_project from baseData
    logger.info("Profil créé avec succès", { id: Profile.id });
    res.status(201).json({
      ...Profile.toJSON(),
      technicalSkills: processedData.technicalSkills
        ? processedData.technicalSkills.split(", ").filter(Boolean)
        : [],
      softSkills: processedData.softSkills
        ? processedData.softSkills.split(", ").filter(Boolean)
        : [],
      languages: processedData.languages
        ? processedData.languages.split(", ").filter(Boolean)
        : [],
    });
  } catch (error) {
    logger.error("Erreur lors de la création du profil", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  logger.info("[PUT] /profiles/:id - Mise à jour d'un profil", { id: req.params.id, body: req.body });
  try {
    const Profile = await profile.findByPk(req.params.id);

    if (!Profile) {
      logger.warn("Profil non trouvé pour mise à jour", { id: req.params.id });
      return res.status(404).json({ error: "Profile not found" });
    }

    // Vérifier si le projet parent est archivé
    const Project = await project.findByPk(Profile.fk_project);
    if (Project && Project.is_archived) {
      logger.warn("Tentative de modification d'un profil d'un projet archivé", { projectId: Project.id });
      return res.status(403).json({
        error: "Impossible de modifier un profil d'un projet archivé.",
      });
    }

    const processedData = processProfileData(req.body);
    // Allow status update if provided
    if (typeof req.body.status !== "undefined") {
      processedData.status = req.body.status;
    }
    await Profile.update(processedData);
    logger.info("Profil mis à jour avec succès", { id: Profile.id });
    res.json({
      ...Profile.toJSON(),
      technicalSkills: req.body.technicalSkills,
      softSkills: req.body.softSkills,
      languages: req.body.languages,
      status: processedData.status || Profile.status,
    });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du profil", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Set profile status only
exports.setProfileStatus = async (req, res) => {
  logger.info("[PATCH] /profiles/:id/status - Mise à jour du statut d'un profil", { id: req.params.id, status: req.body.status });
  try {
    const Profile = await profile.findByPk(req.params.id);
    if (!Profile) {
      logger.warn("Profil non trouvé pour mise à jour du statut", { id: req.params.id });
      return res.status(404).json({ error: "Profile not found" });
    }
    // Only update status
    await Profile.update({ status: req.body.status });
    logger.info("Statut du profil mis à jour", { id: req.params.id, status: req.body.status });
    res.json({ status: req.body.status });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du statut du profil", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  logger.info("[DELETE] /profiles/:id - Suppression d'un profil", { id: req.params.id });
  try {
    const Profile = await profile.findByPk(req.params.id);
    if (!Profile) {
      logger.warn("Profil non trouvé pour suppression", { id: req.params.id });
      return res.status(404).json({ error: "Profile not found" });
    }

    // Vérifier si le projet parent est archivé
    const Project = await project.findByPk(Profile.fk_project);
    if (Project && Project.is_archived) {
      logger.warn("Tentative de suppression d'un profil d'un projet archivé", { projectId: Project.id });
      return res.status(403).json({
        error: "Impossible de supprimer un profil d'un projet archivé.",
      });
    }

    // Vérifier si le profil a des publications publiées

    // Trouver le JobOffer du profil
    const jobOffer = await JobOffer.findOne({
      where: { fk_profile: req.params.id },
    });

    if (jobOffer) {
      // Vérifier s'il y a des JobPosting publiés pour ce JobOffer
      const publishedPostings = await JobPosting.findAll({
        where: {
          fk_JobOffer: jobOffer.id,
          Status: "published",
        },
      });

      if (publishedPostings.length > 0) {
        logger.warn("Suppression refusée : profils avec offres publiées", { id: req.params.id });
        return res.status(403).json({
          error:
            "Ce profil ne peut pas être supprimé car il contient des offres d'emploi actuellement publiées. Veuillez d'abord retirer ces publications avant de procéder à la suppression.",
        });
      }
    }

    await Profile.destroy();
    logger.info("Profil supprimé avec succès", { id: req.params.id });
    res.status(204).end();
  } catch (error) {
    logger.error("Erreur lors de la suppression du profil", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Database error" });
  }
};
