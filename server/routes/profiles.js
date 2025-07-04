// routes/profiles.js
const express = require("express");
const {
  getAllProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  setProfileStatus,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/", getAllProfiles);
router.get("/:id", getProfile);
router.post("/:projectId", createProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);
router.patch("/:id/status", setProfileStatus);

module.exports = router;
