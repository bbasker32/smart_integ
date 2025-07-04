const express = require("express");
const {
  createPosting,
  getPostings,
  updatePosting,
} = require("../controllers/jobPostingController");

const router = express.Router();

router.post("/", createPosting);
router.get("/", getPostings);
router.put("/:id", updatePosting);

module.exports = router;
