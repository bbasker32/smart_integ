require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * Liste les fichiers dans le bucket S3 sous le préfixe donné (par défaut cvs/)
 * @param {string} [prefix='cvs/'] - Le dossier à lister (ex: 'cvs/Projet/Profil/local/')
 * @returns {Promise<string[]>} - Liste des clés de fichiers
 *
 * Exemple pour lister un sous-dossier spécifique :
 *   listCVFiles('cvs/MonProjet/MonProfil/local/')
 */
async function listCVFiles(prefix = 'cvs/') {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Prefix: prefix,
  };
  let files = [];
  let ContinuationToken;
  do {
    const command = new ListObjectsV2Command({ ...params, ContinuationToken });
    const data = await s3.send(command);
    if (data.Contents) {
      files = files.concat(data.Contents.map(obj => obj.Key));
    }
    ContinuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return files;
}

module.exports = { listCVFiles }; 