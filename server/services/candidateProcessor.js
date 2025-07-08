const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function getS3FileBuffer(s3Key) {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: s3Key,
  });
  const data = await s3.send(command);
  // Lire tout le flux dans un buffer
  return await streamToBuffer(data.Body);
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function processCandidate(candidate, authToken, skipSensitiveInfo = true) {
  try {
    const fileBuffer = await getS3FileBuffer(candidate.cv_s3_path);
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: path.basename(candidate.cv_s3_path),
      contentType: 'application/pdf'
    });
    form.append('skip_sensitive_information', skipSensitiveInfo.toString());

    const pythonApiUrl = 'http://127.0.0.1:5001/candidate/received/download_cv_and_return_info';
    
    try {
      const response = await axios.post(
        pythonApiUrl,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': authToken
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000 // 120 secondes
        }
      );

      // Vérifier que la réponse contient les données attendues
      if (!response.data) {
        throw new Error('Réponse vide du service Python');
      }

      // Extraire directement les données du candidat de la réponse
      const candidateData = {
        name: response.data.name || null,
        email: response.data.email || null,
        phone: response.data.phone || null,
        location: response.data.location || null,
        education: response.data.education || null,
        years_of_experience: response.data.years_of_experience || 0,
        technical_skills: response.data.technical_skills || null,
        soft_skills: response.data.soft_skills || null,
        languages: response.data.languages || null,
        hobbies: response.data.hobbies || null,
        certifications: response.data.certifications || null,
        current_position: response.data.current_position || null,
        score_value: response.data.score_value || 0,
        score_description: response.data.score_description || null,
        summary: response.data.summary || null,
        status: 'traited'
      };

      logger.debug('Données extraites du CV:', candidateData);
      return candidateData;
    } catch (axiosError) {
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error(`Timeout lors du traitement du CV (120s dépassés)`);
      }
      if (axiosError.response) {
        throw new Error(`Erreur du service Python: ${axiosError.response.data.message || axiosError.message}`);
      }
      throw new Error(`Erreur de communication avec le service Python: ${axiosError.message}`);
    }
  } catch (error) {
    logger.error('Erreur lors du traitement du candidat:', {
      candidateId: candidate.id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Fonction utilitaire pour valider l'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  processCandidate
}; 