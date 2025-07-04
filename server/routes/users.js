const express = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignProjectToUser,
  unassignProjectFromUser,
  getUserProjects,
  updateUserStatus,
  uploadAvatar,
  changePassword,
} = require("../controllers/userController");
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} = require("../middlewares/auth");
const router = express.Router();
const upload = require("../middlewares/upload");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Route pour récupérer les infos de l'utilisateur connecté (doit être AVANT les routes avec :id)
router.get("/me", (req, res) => {
  res.json({
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status,
    avatar: req.user.avatar,
  });
});

router.get("/", getAllUsers);
// Admin-only routes
router.post("/", requireAdmin, createUser);
router.delete("/:id", requireAdmin, deleteUser);
router.patch("/:id/status", requireAdmin, updateUserStatus);
router.post("/:id/assign-project", requireAdmin, assignProjectToUser);
router.delete(
  "/:id/unassign-project/:projectId",
  requireAdmin,
  unassignProjectFromUser
);

// Routes that require ownership or admin access
router.get("/:id", requireOwnershipOrAdmin, getUser);
router.put("/:id", requireOwnershipOrAdmin, updateUser);
router.get("/:id/projects", requireOwnershipOrAdmin, getUserProjects);
router.post("/:id/change-password", requireOwnershipOrAdmin, changePassword);
router.post(
  "/:id/avatar",
  requireOwnershipOrAdmin,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;
