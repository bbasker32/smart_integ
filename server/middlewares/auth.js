const jwt = require("jsonwebtoken");
const { users } = require("../models");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database to ensure they still exist and are active
    const user = await users.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "active") {
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

    next();
  } catch (error) {
    console.error("Authentication error:", error);
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
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

// Middleware to check if user can access their own data or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const resourceUserId = parseInt(req.params.id || req.params.userId);

  if (req.user.role === "admin" || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  requireOwnershipOrAdmin,
};
