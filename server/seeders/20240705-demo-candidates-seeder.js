"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "candidate",
      [
        {
          fk_profile: 4,
          cv_s3_path: "cvs/local/1_alice_smith_1.pdf",
          type_importation: "local",
          summary: "Développeuse fullstack expérimentée.",
          creation_date: new Date(),
          name: "Alice Smith",
          email: "alice.smith@example.com",
          phone: "0601020304",
          location: "Paris",
          education: "Master Informatique",
          years_of_experience: 5,
          technical_skills: "JavaScript, Node.js, React",
          soft_skills: "Travail d'équipe, Communication",
          languages: "Français, Anglais",
          hobbies: "Lecture, Musique",
          certifications: "AWS Certified Developer",
          current_position: "Développeuse Fullstack",
          status: "received",
          score_value: 85,
          score_description: "Très bon profil technique.",
          manual_rank: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          fk_profile: 4,
          cv_s3_path: "cvs/local/2_bob_johnson_2.pdf",
          type_importation: "local",
          summary: "Ingénieur DevOps junior.",
          creation_date: new Date(),
          name: "Bob Johnson",
          email: "bob.johnson@example.com",
          phone: "0605060708",
          location: "Lyon",
          education: "Licence Informatique",
          years_of_experience: 2,
          technical_skills: "Docker, AWS, Linux",
          soft_skills: "Adaptabilité, Curiosité",
          languages: "Français, Anglais",
          hobbies: "Escalade, Jeux vidéo",
          certifications: "",
          current_position: "DevOps Junior",
          status: "received",
          score_value: 70,
          score_description: "Bon potentiel, à suivre.",
          manual_rank: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("candidate", null, {});
  },
}; 