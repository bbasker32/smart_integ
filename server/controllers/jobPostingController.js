const { JobPosting, JobOffer } = require("../models");

exports.createPosting = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { jobOfferId, plateform, description } = req.body;

    // Validate input
    if (!jobOfferId || !plateform || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if JobOffer exists
    const jobOffer = await JobOffer.findByPk(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ error: "Job offer not found" });
    }

    // Check for existing JobPosting for the same platform and JobOffer
    const existingPosting = await JobPosting.findOne({
      where: {
        fk_JobOffer: jobOfferId,
        plateform: plateform,
      },
    });

    if (existingPosting) {
      // Update existing one
      existingPosting.description = description;
      existingPosting.Status = "draft";
      await existingPosting.save();
      return res.status(200).json({
        message: "Job posting updated",
        posting: existingPosting,
      });
    } else {
      // Create new
      const newPosting = await JobPosting.create({
        fk_JobOffer: jobOfferId,
        plateform,
        description,
        Status: "draft",
      });
      return res.status(201).json({
        message: "Job posting created",
        posting: newPosting,
      });
    }
  } catch (error) {
    console.error("Error saving posting:", error);
    res
      .status(500)
      .json({ error: "Failed to save job posting", details: error.message });
  }
};

exports.getPostings = async (req, res) => {
  try {
    const postings = await JobPosting.findAll({
      include: [
        {
          model: JobOffer,
          as: "JobOffer",
        },
      ],
    });
    res.json(postings);
  } catch (error) {
    console.error("Error fetching postings:", error);
    res.status(500).json({ error: "Failed to fetch postings" });
  }
};

exports.updatePosting = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, url } = req.body;

    const posting = await JobPosting.findByPk(id);
    if (!posting) {
      return res.status(404).json({ error: "Posting not found" });
    }

    if (status) posting.Status = status;
    if (url) posting.URL = url;

    await posting.save();
    res.json(posting);
  } catch (error) {
    console.error("Error updating posting:", error);
    res.status(500).json({ error: "Failed to update posting" });
  }
};
