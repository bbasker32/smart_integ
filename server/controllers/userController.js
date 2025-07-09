//controller/userController.js
const bcrypt = require("bcrypt");
const { users, project, user_project } = require("../models");
const {
  sendAccountApprovedEmail,
  sendAccountCreatedEmail,
} = require("../utils/mailer");
const crypto = require("crypto");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, status, password } = req.body;

    // Check if user already exists
    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(6).toString("base64"); // 8 chars

    // Hash the password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const newUser = await users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      status: status || "inactive",
      must_change_password: true,
    });

    // Send welcome email with credentials
    try {
      await sendAccountCreatedEmail(
        email,
        `${firstName} ${lastName}`,
        email,
        tempPassword, // send the temporary password
        role
      );
    } catch (emailError) {
      console.error("Error sending account creation email:", emailError);
      // Don't fail the request if email fails
    }

    // Return the user data without sensitive information
    const userData = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
    };

    res.status(201).json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Get all users with their projects
exports.getAllUsers = async (req, res) => {
  try {
    const Users = await users.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "status",
        "createdAt",
      ],
      include: [{ model: project, as: "Projects" }],
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
      ],
    });

    const usersWithJoinDate = Users.map((user) => {
      const userObj = user.toJSON();
      userObj.joinDate = userObj.createdAt;
      return userObj;
    });
    res.json(usersWithJoinDate);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await users.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userObj = user.toJSON();
    userObj.joinDate = userObj.createdAt;
    res.json(userObj);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await users.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updateData = { ...req.body };
    const previousStatus = user.status;

    // Only hash password if it's provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Remove password from update if not provided
      delete updateData.password;
    }

    await user.update(updateData);

    // Check if status changed from inactive to active
    if (previousStatus === "inactive" && updateData.status === "active") {
      try {
        await sendAccountApprovedEmail(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      } catch (emailError) {
        console.error("Error sending activation email:", emailError);
        // Don't return here, we still want to send the user update response
      }
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await users.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Admin: Assign a project to a user
exports.assignProjectToUser = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    await user_project.findOrCreate({ where: { userId, projectId } });
    res.json({ message: "Project assigned to user." });
  } catch (error) {
    console.error("Error assigning project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Admin: Unassign a project from a user
exports.unassignProjectFromUser = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    await user_project.destroy({ where: { userId, projectId } });
    res.json({ message: "Project unassigned from user." });
  } catch (error) {
    console.error("Error unassigning project:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Get all projects assigned to a user (for sidebar filtering)
exports.getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await users.findByPk(userId, {
      include: [{ model: project, as: "Projects" }],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.Projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Update only user status
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await users.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { status } = req.body;
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const previousStatus = user.status;
    user.status = status;
    await user.save();

    // Send email if status changed from inactive to active
    if (previousStatus === "inactive" && status === "active") {
      try {
        await sendAccountApprovedEmail(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      } catch (emailError) {
        console.error("Error sending activation email:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Database error" });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Create the file URL
    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar in database
    const user = await users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ avatar: fileUrl });

    res.json({
      message: "Avatar uploaded successfully",
      avatar: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Error uploading avatar" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const user = await users.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.must_change_password = false;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};
