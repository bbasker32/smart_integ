"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "user_project",
      [
        {
          fk_user: 3,
          fk_project: 1,
        },
        {
          fk_user: 4,
          fk_project: 1,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.bulkDelete("user_project", null, {});
  },
};
