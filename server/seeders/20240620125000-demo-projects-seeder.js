"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "projects",
      [
        {
          title: "HR Digitalization",
          description: "Implementing a digital HR management system.",
          department: "HR",
          status: "En Cours",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-12-31"),
          fk_user: 1,
          participants: "2",
          is_archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("projects", null, {});
  },
};
