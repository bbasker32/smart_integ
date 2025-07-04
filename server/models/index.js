"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/database.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.slice(-3) === ".js" || file.slice(-3) === ".ts")
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add associations
// Project <-> Profile
if (db.project && db.profile) {
  db.project.hasMany(db.profile, { as: "Profiles", foreignKey: "fk_project" });
  db.profile.belongsTo(db.project, { as: "Project", foreignKey: "fk_project" });
}
// Project <-> Users (responsible user)
if (db.project && db.users) {
  db.project.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.users.hasMany(db.project, { as: "Projects", foreignKey: "fk_user" });
}
// User <-> Project (many-to-many via user_project)
if (db.users && db.project && db.user_project) {
  db.users.belongsToMany(db.project, {
    through: db.user_project,
    foreignKey: "userId",
    otherKey: "projectId",
    as: "UserProjects",
  });
  db.project.belongsToMany(db.users, {
    through: db.user_project,
    foreignKey: "projectId",
    otherKey: "userId",
    as: "ProjectUsers",
  });
}
// Profile <-> JobOffer
if (db.profile && db.JobOffer) {
  db.profile.hasOne(db.JobOffer, { as: "JobOffer", foreignKey: "fk_profile" });
  db.JobOffer.belongsTo(db.profile, {
    as: "Profile",
    foreignKey: "fk_profile",
  });
}
// JobOffer <-> JobPosting
if (db.JobOffer && db.JobPosting) {
  db.JobOffer.hasMany(db.JobPosting, {
    as: "JobPostings",
    foreignKey: "fk_JobOffer",
  });
  db.JobPosting.belongsTo(db.JobOffer, {
    as: "JobOffer",
    foreignKey: "fk_JobOffer",
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
