const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const nodemailer = require("nodemailer");
const { Profile, Project, User } = require("../models/init-models");
require("dotenv").config();

const router = express.Router();

// Stockage temporaire local
const upload = multer({ dest: "uploads/" });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post("/upload-cv", upload.single("cv"), async (req, res) => {
  console.log("Route /upload-cv appelée");
  try {
    const { profileId, profileTitle, projectName } = req.body;
    console.log("Infos reçues:", profileId, profileTitle, projectName);

    const file = req.file;
    if (!file) {
      console.log("Aucun fichier reçu");
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }
    console.log("Fichier reçu:", file.originalname);

    // 1. Récupérer le profil, le projet et l'utilisateur (recruteur)
    const profile = await Profile.findByPk(profileId, {
      include: {
        model: Project,
        as: "Project",
        include: {
          model: User,
          as: "User",
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }
    if (!profile.Project) {
      return res.status(404).json({ message: "Projet associé introuvable." });
    }
    if (!profile.Project.User) {
      return res
        .status(404)
        .json({ message: "Recruteur associé introuvable." });
    }
    if (!profile.Project.User.email) {
      return res.status(400).json({ message: "Email du recruteur manquant." });
    }

    const recruiterEmail = profile.Project.User.email;

    // Nettoyage des noms pour les dossiers et fichiers
    const cleanedProjectName = (projectName || "Projet_Default")
      .replace(/[^a-zA-Z0-9À-ÿ _-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    const cleanedProfileName = (profileTitle || "Profil_Default")
      .replace(/[^a-zA-Z0-9À-ÿ _-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    // Timestamp pour éviter les conflits de noms
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);

    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const s3Key = `cvs/${cleanedProjectName}/${cleanedProfileName}/platforme/${timestamp}_${baseName}_${profileId}${ext}`;

    // Upload sur S3
    const putCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
      Body: fs.readFileSync(file.path),
      ContentType: file.mimetype,
    });
    await s3.send(putCommand);

    // Supprime le fichier temporaire
    fs.unlinkSync(file.path);

    // Télécharge aussi le fichier depuis S3 en local avec la nouvelle structure
    const localDir = path.join(
      __dirname,
      "../downloads",
      cleanedProjectName,
      cleanedProfileName,
      "platforme"
    );
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localFilename = `${timestamp}_${baseName}_${profileId}${ext}`;
    const localPath = path.join(localDir, localFilename);
    downloadFromS3ToLocal(s3Key, localPath);

    // Génère un lien presigné (valable 24h)
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
    });
    const url = await getSignedUrl(s3, getCommand, { expiresIn: 24 * 3600 });

    // Envoi de l'email avec le lien et les infos du profil
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SmartHire CV Upload" <${process.env.GMAIL_USER}>`,
      to: recruiterEmail,
      subject: `Nouveau CV reçu - ${profileTitle} (Projet: ${projectName}, ID: ${profileId})`,
      text: `Bonjour,\n\nUn candidat a soumis son CV pour le profil "${profileTitle}" du projet "${projectName}" (Ref: ${profileId}).\nDate de soumission : ${timestamp}\n\nLien de téléchargement du CV (valable 24h) : ${url}\n\nCordialement,\nSmartHire`,
    };

    console.log("Tentative d'envoi de l'email à", mailOptions.to);
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès");

    res.status(200).json({ success: true, url, s3Key });
  } catch (err) {
    console.error("Erreur dans la route /upload-cv:", err);
    console.error("Erreur lors de l'envoi de l'email:", err);
    res
      .status(500)
      .json({ success: false, message: "Erreur upload S3 ou envoi email" });
  }
});

// Fonction utilitaire pour télécharger un fichier S3 en local
async function downloadFromS3ToLocal(s3Key, localPath) {
  try {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
    });
    const data = await s3.send(getCommand);
    // Crée le dossier si besoin
    const dir = require("path").dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const writeStream = fs.createWriteStream(localPath);
    await new Promise((resolve, reject) => {
      data.Body.pipe(writeStream).on("finish", resolve).on("error", reject);
    });
    console.log("Fichier téléchargé avec succès :", localPath);
  } catch (err) {
    console.error("Erreur lors du téléchargement S3 :", err);
  }
}

// Route pour télécharger un fichier depuis S3
router.get("/download-cv", async (req, res) => {
  const { key } = req.query; // clé S3 à télécharger, ex: 'cvs/projet/profil/timestamp_fichier.pdf'
  if (!key) return res.status(400).send("Clé S3 manquante");

  try {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });
    const data = await s3.send(getCommand);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(key)}"`
    );
    data.Body.pipe(res);

    // Enregistre aussi le fichier localement dans ./downloads avec la même structure
    const localPath = path.join(
      __dirname,
      "../downloads",
      key.replace("cvs/", "")
    );
    downloadFromS3ToLocal(key, localPath);
  } catch (err) {
    console.error("Erreur lors du téléchargement S3:", err);
    res.status(500).send("Erreur lors du téléchargement");
  }
});

module.exports = router;
