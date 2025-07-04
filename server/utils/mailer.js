const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendAccountApprovedEmail(to, name) {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Votre compte a été activé !",
    text: `Bonjour ${name},\n\nVotre compte a été activé a²vec succès. Vous pouvez maintenant vous connecter à la plateforme.`,
    html: `<p>Bonjour <b>${name}</b>,<br><br>Votre compte a été <b>activé</b> avec succès. Vous pouvez maintenant vous connecter à la plateforme.</p>`,
  });
}

async function sendAccountCreatedEmail(to, name, email, password, role) {
  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Votre compte a été créé!",
    text: `Bonjour ${name},\n\nVotre compte a été créé avec succès.\n\nIdentifiants de connexion :\nEmail : ${email}\nMot de passe : ${password}\nRôle : ${role}\n\nMerci de vous connecter à la plateforme.`,
    html: `<p>Bonjour <b>${name}</b>,<br><br>Votre compte a été <b>créé</b> avec succès.<br><br><b>Identifiants de connexion :</b><br>Email : <b>${email}</b><br>Mot de passe : <b>${password}</b><br>Rôle : <b>${role}</b><br><br>Merci de vous connecter à la plateforme.</p>`,
  });
}

module.exports = { sendAccountApprovedEmail, sendAccountCreatedEmail };
