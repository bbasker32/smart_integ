const express = require("express");
const {
  login,
  validateToken,
} = require("../controllers/authenticationController");

const router = express.Router();

router.post("/login", login);
router.get("/validate", validateToken);

module.exports = router;
