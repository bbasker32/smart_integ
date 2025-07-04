// controllers/authenticationController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users } = require("../models");

exports.login = async (req, res) => {
  try {
    const user = await users.findOne({
      where: { email: req.body.email },
    });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Check user status
    if (user.status === "inactive") {
      return res.status(403).json({
        message:
          "Votre compte est inactif. Veuillez contacter l'administration pour l'activer.",
        status: "inactive",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message:
          "Votre compte n'est pas accessible. Veuillez contacter l'administration.",
        status: user.status,
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({
      userId: user.id,
      token,
      user: user.firstName + " " + user.lastName,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      must_change_password: user.must_change_password,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Valider le token
exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findByPk(decoded.userId);

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ message: "Token invalide ou utilisateur inactif" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ message: "Token invalide" });
  }
};
