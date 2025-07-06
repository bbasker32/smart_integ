const { JobPosting, JobOffer } = require("../models");
const logger = require('../utils/logger');

exports.createPosting = async (req, res) => {
  logger.info("[POST] /job-postings - Création/MAJ d'un job posting", { body: req.body });
  try {
    const { jobOfferId, plateform, description } = req.body;
    if (!jobOfferId || !plateform || !description) {
      logger.warn("Champs requis manquants", { jobOfferId, plateform, description });
      return res.status(400).json({ error: "Missing required fields" });
    }
    const jobOffer = await JobOffer.findByPk(jobOfferId);
    if (!jobOffer) {
      logger.warn("JobOffer non trouvé", { jobOfferId });
      return res.status(404).json({ error: "Job offer not found" });
    }
    const existingPosting = await JobPosting.findOne({
      where: {
        fk_JobOffer: jobOfferId,
        plateform: plateform,
      },
    });
    if (existingPosting) {
      existingPosting.description = description;
      existingPosting.Status = "draft";
      await existingPosting.save();
      logger.info("Job posting mis à jour", { id: existingPosting.id });
      return res.status(200).json({
        message: "Job posting updated",
        posting: existingPosting,
      });
    } else {
      const newPosting = await JobPosting.create({
        fk_JobOffer: jobOfferId,
        plateform,
        description,
        Status: "draft",
      });
      logger.info("Nouveau job posting créé", { id: newPosting.id });
      return res.status(201).json({
        message: "Job posting created",
        posting: newPosting,
      });
    }
  } catch (error) {
    logger.error("Erreur lors de la sauvegarde du job posting", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to save job posting", details: error.message });
  }
};

exports.getPostings = async (req, res) => {
  logger.info("[GET] /job-postings - Récupération de tous les job postings");
  try {
    const postings = await JobPosting.findAll({
      include: [
        {
          model: JobOffer,
          as: "JobOffer",
        },
      ],
    });
    logger.info("Job postings récupérés", { count: postings.length });
    res.json(postings);
  } catch (error) {
    logger.error("Erreur lors de la récupération des job postings", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch postings" });
  }
};

exports.updatePosting = async (req, res) => {
  logger.info("[PATCH] /job-postings/:id - Mise à jour d'un job posting", { id: req.params.id, body: req.body });
  try {
    const { id } = req.params;
    const { status, url } = req.body;
    const posting = await JobPosting.findByPk(id);
    if (!posting) {
      logger.warn("Job posting non trouvé", { id });
      return res.status(404).json({ error: "Posting not found" });
    }
    if (status) posting.Status = status;
    if (url) posting.URL = url;
    await posting.save();
    logger.info("Job posting mis à jour avec succès", { id: posting.id });
    res.json(posting);
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du job posting", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to update posting" });
  }
};
