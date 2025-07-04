// controllers/searchController.js
const { Project, User } = require("../models/init-models");
const Sequelize = require("sequelize");

exports.searchProjects = async (req, res) => {
  try {
    const where = {};
    const include = [
      {
        model: User,
        as: "User",
        attributes: ["firstName", "lastName"],
        required: false,
      },
    ];

    if (req.query.name) {
      where.title = { [Sequelize.Op.iLike]: `%${req.query.name}%` };
    }

    if (req.query.service) {
      where.department = req.query.service;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.responsibleName) {
      include[0].where = {
        [Sequelize.Op.or]: [
          {
            firstName: {
              [Sequelize.Op.iLike]: `%${req.query.responsibleName}%`,
            },
          },
          {
            lastName: {
              [Sequelize.Op.iLike]: `%${req.query.responsibleName}%`,
            },
          },
        ],
      };
      include[0].required = true;
    }

    const projects = await Project.findAll({
      where,
      include,
      attributes: [
        "id",
        "title",
        "description",
        "department",
        "status",
        "createdAt",
        [Sequelize.col("User.first_name"), "responsible_first_name"],
        [Sequelize.col("User.last_name"), "responsible_last_name"],
      ],
    });

    res.json(projects);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Database error" });
  }
};
