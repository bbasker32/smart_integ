const jwt = require("jsonwebtoken");
const { users } = require("../models");
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');


// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    logger.debug(`Requête reçue sur ${req.originalUrl}`, { ip: req.ip, headers: req.headers });
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      logger.warn("Aucun token fourni", { ip: req.ip });
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug("Token JWT décodé", { userId: decoded.userId, ip: req.ip });

    // Get user from database to ensure they still exist and are active
    const user = await users.findByPk(decoded.userId);

    if (!user) {
      logger.warn("Utilisateur non trouvé pour le token", { userId: decoded.userId, ip: req.ip });
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      logger.warn("Utilisateur inactif", { userId: user.id, status: user.status, ip: req.ip });
      return res.status(403).json({ message: "User account is not active" });
    }

    // Attach user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    };
    logger.info("Authentification réussie", { userId: user.id, email: user.email, role: user.role, ip: req.ip });

    logger.debug('Authorization header', { auth: req.headers.authorization });

    next();
  } catch (error) {
    logger.error("Erreur d'authentification", { error: error.message, stack: error.stack, ip: req.ip });
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    logger.warn("Tentative d'accès admin sans authentification", { ip: req.ip });
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    logger.warn("Accès admin refusé à un utilisateur non admin", { userId: req.user.id, role: req.user.role, ip: req.ip });
    return res.status(403).json({ message: "Admin access required" });
  }

  logger.info("Accès admin autorisé", { userId: req.user.id, ip: req.ip });
  next();
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn("Tentative d'accès à une ressource protégée sans authentification", { ip: req.ip });
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn("Accès refusé pour rôle insuffisant", { userId: req.user.id, role: req.user.role, requiredRoles: roles, ip: req.ip });
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    logger.info("Accès autorisé pour rôle", { userId: req.user.id, role: req.user.role, ip: req.ip });
    next();
  };
};

// Middleware to check if user can access their own data or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    logger.warn("Tentative d'accès à une ressource sans authentification", { ip: req.ip });
    return res.status(401).json({ message: "Authentication required" });
  }

  const resourceUserId = parseInt(req.params.id || req.params.userId);

  if (req.user.role === "admin" || req.user.id === resourceUserId) {
    logger.info("Accès autorisé à la ressource (admin ou propriétaire)", { userId: req.user.id, resourceUserId, ip: req.ip });
    next();
  } else {
    logger.warn("Accès refusé à la ressource (ni admin ni propriétaire)", { userId: req.user.id, resourceUserId, ip: req.ip });
    return res.status(403).json({ message: "Access denied" });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  requireOwnershipOrAdmin,
};
