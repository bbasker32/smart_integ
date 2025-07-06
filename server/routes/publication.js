// routes/publication.js
const express = require("express");
const {
  generateClassic,
  generatePlatformPreview,
  exportDescription,
  getJobOffer,
  triggerLinkedInPost,
} = require("../controllers/publicationController");
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} = require("../middlewares/auth");


const router = express.Router();

router.use(authenticateToken);

router.post("/classic", generateClassic);
router.post("/preview", generatePlatformPreview);
// POST /api/publication/export
router.post("/export", exportDescription);
// POST /api/publication/publish
router.post("/linkedin-post", triggerLinkedInPost);

router.get("/:profileId", getJobOffer);

module.exports = router;
