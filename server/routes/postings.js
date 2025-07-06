const express = require("express");
const {
  createPosting,
  getPostings,
  updatePosting,
} = require("../controllers/jobPostingController");
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createPosting);
router.get("/", getPostings);
router.put("/:id", updatePosting);

module.exports = router;
