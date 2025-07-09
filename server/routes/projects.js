const express = require("express");
const {
  getProject,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectProfiles,
} = require("../controllers/projectController");
const { searchProjects } = require("../controllers/searchController");
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllProjects);
router.post("/", createProject);
router.get("/search", searchProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:projectId/profiles", getProjectProfiles);

module.exports = router;
