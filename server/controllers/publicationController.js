// controllers/publicationController.js
const { profile, JobOffer, JobPosting } = require("../models");
const axios = require("axios");
const { spawn } = require("child_process");
const path = require("path");

exports.exportDescription = async (req, res) => {
  const { profileId, description } = req.body;

  try {
    // Validate input
    if (!profileId || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find associated profile
    const Profile = await profile.findByPk(profileId);
    if (!Profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Convert profileId to number
    const numericProfileId = parseInt(profileId, 10);
    if (isNaN(numericProfileId)) {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    const [jobOffer, created] = await JobOffer.upsert(
      {
        fk_profile: numericProfileId,
        description,
        creationDate: new Date(),
      },
      {
        returning: true,
        conflictFields: ["fk_profile"], // PostgreSQL specific conflict resolution
      }
    );

    res.status(200).json({
      message: created ? "Description exported" : "Description updated",
      jobOfferId: jobOffer.id,
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export description" });
  }
};

exports.getJobOffer = async (req, res) => {
  try {
    const { profileId } = req.params;

    const jobOffer = await JobOffer.findOne({
      where: { fk_profile: profileId },
    });

    if (!jobOffer) {
      return res.status(404).json({ error: "Job offer not found" });
    }

    res.json(jobOffer);
  } catch (error) {
    console.error("Error fetching job offer:", error);
    res.status(500).json({ error: "Failed to fetch job offer" });
  }
};

exports.generateClassic = async (req, res) => {
  try {
    const Profile = await profile.findByPk(req.body.profileId);
    const outputLangue = req.body.outputLangue;

    if (!Profile) return res.status(404).json({ error: "Profile not found" });

    const enrichedProfile = {
      ...Profile.toJSON(),
      outputLangue, // 🔥 ça doit être présent !
    };

    const aiResponse = await axios.post(
      "http://localhost:5001/generate-classic",
      enrichedProfile
    );

    res.json({ preview: aiResponse.data.preview });
  } catch (error) {
    console.error("Classic generation error:", error);
    res.status(500).json({ error: "Classic generation failed" });
  }
};

exports.generatePlatformPreview = async (req, res) => {
  try {
    const { plateform, profileId, options } = req.body;
    const Profile = await profile.findByPk(profileId);
    if (!Profile) return res.status(404).json({ error: "Profile not found" });

    // 1. Get saved JobOffer from database
    const jobOffer = await JobOffer.findOne({
      where: { fk_profile: profileId },
    });

    if (!jobOffer) {
      return res.status(404).json({ error: "Export main description first!" });
    }

    const enrichedProfile = {
      ...Profile.toJSON(),
      description: jobOffer.description,
      options,
    };

    // 2. Send saved description to AI service
    const aiResponse = await axios.post(
      `http://localhost:5001/generate-${plateform.toLowerCase()}`,
      enrichedProfile
    );

    res.json({ preview: aiResponse.data.preview });
  } catch (error) {
    console.error("Platform preview error:", error);
    res.status(500).json({ error: `${plateform} preview failed` });
  }
};

exports.triggerLinkedInPost = async (req, res) => {
  const { description, url: companyUrl, profileId } = req.body;

  try {
    const jobOffer = await JobOffer.findOne({
      where: { fk_profile: profileId },
    });

    if (!jobOffer) {
      return res.status(404).json({ error: "JobOffer not found" });
    }

    let posting = await JobPosting.findOne({
      where: {
        fk_JobOffer: jobOffer.id,
        plateform: "linkedin",
      },
    });

    if (!posting) {
      posting = await JobPosting.create({
        fk_JobOffer: jobOffer.id,
        plateform: "linkedin",
        description,
        Status: "published",
        URL: companyUrl,
      });
      console.log("✅ Nouveau JobPosting créé avec URL.");
    } else {
      posting.URL = companyUrl;
      posting.Status = "published";
      await posting.save();
      console.log("✅ URL mise à jour dans JobPosting existant.");
    }

    // ✅ Exécution du script Python
    const scriptPath = path.resolve(
      __dirname,
      "../../service-ai/linkedin_post_helper.py"
    );

    const child = spawn("python", [scriptPath], {
      cwd: path.dirname(scriptPath),
      env: {
        ...process.env,
        JOB_DESCRIPTION: description,
        COMPANY_URL: companyUrl,
      },
      stdio: "inherit", // 🟢 permet de voir les logs Python
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Script Python terminé avec succès.");
      } else {
        console.error(`❌ Le script Python a échoué (code ${code})`);
      }
    });

    // ✅ Réponse immédiate (le script continue en arrière-plan)
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur lors de la publication :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
