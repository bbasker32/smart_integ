//controller/profileController.js
const { profile, project, JobOffer, JobPosting } = require("../models");

// Helper function to process skills arrays
const processProfileData = (data) => ({
  ...data,
  technicalSkills: data.technicalSkills.join(", "),
  softSkills: data.softSkills.join(", "),
  languages: data.languages.join(", "),
});

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await profile.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// profileController.js

exports.getProfile = async (req, res) => {
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

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Create profile
exports.createProfile = async (req, res) => {
  try {
    // Vérifier si le projet parent est archivé
    const projectId = req.body.fk_project;
    if (projectId) {
      const Project = await project.findByPk(projectId);
      if (Project && Project.is_archived) {
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
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const Profile = await profile.findByPk(req.params.id);

    if (!Profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Vérifier si le projet parent est archivé
    const Project = await project.findByPk(Profile.fk_project);
    if (Project && Project.is_archived) {
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

    res.json({
      ...Profile.toJSON(),
      technicalSkills: req.body.technicalSkills,
      softSkills: req.body.softSkills,
      languages: req.body.languages,
      status: processedData.status || Profile.status,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Set profile status only
exports.setProfileStatus = async (req, res) => {
  try {
    const Profile = await profile.findByPk(req.params.id);
    if (!Profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    // Only update status
    await Profile.update({ status: req.body.status });
    res.json({ status: req.body.status });
  } catch (error) {
    console.error("Error updating profile status:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const Profile = await profile.findByPk(req.params.id);
    if (!Profile) return res.status(404).json({ error: "Profile not found" });

    // Vérifier si le projet parent est archivé
    const Project = await project.findByPk(Profile.fk_project);
    if (Project && Project.is_archived) {
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
        return res.status(403).json({
          error:
            "Ce profil ne peut pas être supprimé car il contient des offres d'emploi actuellement publiées. Veuillez d'abord retirer ces publications avant de procéder à la suppression.",
        });
      }
    }

    await Profile.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Database error" });
  }
};
