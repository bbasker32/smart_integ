"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword1 = await bcrypt.hash("test1234", 10);
    const hashedPassword2 = await bcrypt.hash("test1234", 10);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          firstName: "Alice",
          lastName: "Smith",
          email: "alice.smith@example.com",
          role: "admin",
          password: hashedPassword1,
          status: "active",
          joinDate: new Date("2023-01-15"),
          must_change_password: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: "Bob",
          lastName: "Johnson",
          email: "bob.johnson@example.com",
          role: "user",
          password: hashedPassword2,
          status: "active",
          joinDate: new Date("2023-02-20"),
          must_change_password: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
}; 