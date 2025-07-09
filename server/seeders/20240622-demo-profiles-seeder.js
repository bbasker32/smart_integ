"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "profiles",
      [
        {
          fk_project: 1,
          title: "Full Stack Developer",
          description: "Experienced in building scalable web applications.",
          location: "Paris",
          yearsOfExperience: 5,
          typeContract: "CDI",
          mainMissions: "Develop and maintain web applications.",
          education: "Master Informatique",
          startDate: new Date("2022-09-01"),
          technicalSkills: "JavaScript, Node.js, React, SQL",
          softSkills: "Teamwork, Communication, Problem-solving",
          languages: "French, English",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("profiles", null, {});
  },
};
