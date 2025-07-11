"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("profiles", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "profile",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("profiles", "status");
  },
};
