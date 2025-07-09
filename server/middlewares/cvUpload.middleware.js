require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const db = require('../models');
const fs = require('fs');
const logger = require('../utils/logger');

// Configuration du client S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Configuration du stockage S3
const storage = multerS3({
  s3: s3,
  bucket: process.env.BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: async function (req, file, cb) {
    try {
      logger.info('cvUpload.middleware.js: Début key()');
      logger.info('cvUpload.middleware.js: req.body.fk_profile =', req.body.fk_profile);
      // Récupérer les informations du profil
      const profile = await db.profile.findByPk(req.body.fk_profile, {
        include: [{
          model: db.project,
          as: 'Project'
        }]
      });

      logger.info('cvUpload.middleware.js: Résultat db.profile.findByPk =', profile);

      if (!profile) {
        logger.error('cvUpload.middleware.js: Profil non trouvé pour fk_profile =', req.body.fk_profile);
        return cb(new Error('Profil non trouvé'));
      }

      if (!profile.Project) {
        logger.error('cvUpload.middleware.js: Project (profil lié) est undefined pour le profil', profile.id);
        return cb(new Error('Le projet associé au profil est introuvable.'));
      }

      // Garder le nom d'origine mais remplacer les espaces par des underscores
      const projectName = profile.Project.title.replace(/\s+/g, '_');
      const profileName = profile.title.replace(/\s+/g, '_');
      const profileId = profile.id;
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');

      // Nouvelle structure S3: cvs/ProjectName/ProfileName/platforme/timestamp_baseName_profileId.ext
      const s3Key = `cvs/${projectName}/${profileName}/local/${timestamp}_${baseName}_${profileId}${ext}`;
      logger.info('cvUpload.middleware.js: s3Key généré =', s3Key);
      cb(null, s3Key);
    } catch (error) {
      logger.error('cvUpload.middleware.js: Erreur dans key()', error);
      cb(error);
    }
  }
});

// Filtre pour accepter uniquement les fichiers PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, DOC et DOCX sont autorisés'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo max
});

module.exports = upload; 