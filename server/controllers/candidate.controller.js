const db = require('../models');
const Sequelize = require('sequelize');
const logger = require('../utils/logger');
const { AppError } = require('../middlewares/errorHandler');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { processCandidate } = require('../services/candidateProcessor');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { listCVFiles } = require('../utils/s3ListFiles');

const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.createCandidate = catchAsync(async (req, res) => {
  logger.debug('Tentative de création d\'un candidat:', {
    body: req.body,
    profileId: req.body.fk_profile,
    ip: req.ip,
    file: req.file
  });

  // Vérifier la présence du fichier CV
  if (!req.file) {
    throw new AppError(400, 'Le fichier CV est requis');
  }

  // Récupérer les informations du profil pour construire le chemin
  const profile = await db.profile.findByPk(req.body.fk_profile, {
    include: [{
      model: db.project,
      as: 'project'
    }]
  });

  if (!profile) {
    throw new AppError(404, 'Profil non trouvé');
  }

  // Construire le chemin S3 réel à stocker
  const cvPath = req.file.key;

  // Vérifier si un candidat existe déjà avec ce chemin
  const existingCandidate = await db.Candidate.findOne({ where: { cv_s3_path: cvPath } });
  if (existingCandidate) {
    throw new AppError(409, 'Un candidat avec ce CV existe déjà');
  }

  // Extraire le type d'importation du chemin S3
  let typeImportation = 'local'; // valeur par défaut
  const match = cvPath.match(/\/(platforme|local)\//);
  if (match) {
    typeImportation = match[1];
  }

  // Créer le candidat avec le chemin du CV S3
  const candidate = await db.Candidate.create({
    ...req.body,
    cv_s3_path: cvPath,
    type_importation: typeImportation
  });
  
  logger.info('Candidat créé avec succès:', {
    candidateId: candidate.id,
    name: candidate.name,
    profileId: candidate.fk_profile,
    cv_s3_path: candidate.cv_s3_path
  });

  // Charger les informations du profil associé
  const candidateWithProfile = await db.Candidate.findByPk(candidate.id, {
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }]
  });

  res.status(201).json({
    status: 'success',
    data: { candidate: candidateWithProfile }
  });
});

exports.getAllCandidates = catchAsync(async (req, res) => {
  logger.debug('Récupération de tous les candidats', {
    query: req.query,
    ip: req.ip
  });

  const candidates = await db.Candidate.findAll({
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }]
  });
  
  // logger.info('Candidats récupérés avec succès:', {
  //   count: candidates.length,
  //   query: req.query
  // });

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: { candidates }
  });
});

exports.getCandidateById = catchAsync(async (req, res) => {
  logger.debug('Recherche d\'un candidat par ID:', {
    candidateId: req.params.id,
    ip: req.ip
  });

  const candidate = await db.Candidate.findByPk(req.params.id, {
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }]
  });
  
  if (!candidate) {
    logger.warn('Tentative d\'accès à un candidat inexistant:', {
      candidateId: req.params.id,
      ip: req.ip
    });
    throw new AppError(404, 'Candidat non trouvé');
  }

  logger.info('Candidat trouvé:', {
    candidateId: candidate.id,
    name: candidate.name
  });

  res.status(200).json({
    status: 'success',
    data: { candidate }
  });
});

exports.updateCandidate = catchAsync(async (req, res) => {
  logger.debug('Tentative de mise à jour d\'un candidat:', {
    candidateId: req.params.id,
    body: req.body,
    ip: req.ip
  });

  const candidate = await db.Candidate.findByPk(req.params.id);
  
  if (!candidate) {
    logger.warn('Tentative de mise à jour d\'un candidat inexistant:', {
      candidateId: req.params.id,
      ip: req.ip
    });
    throw new AppError(404, 'Candidat non trouvé');
  }

  await candidate.update(req.body);
  
  logger.info('Candidat mis à jour avec succès:', {
    candidateId: candidate.id,
    name: candidate.name
  });

  // Recharger le candidat avec les informations du profil
  const updatedCandidate = await db.Candidate.findByPk(candidate.id, {
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }]
  });

  res.status(200).json({
    status: 'success',
    data: { candidate: updatedCandidate }
  });
});

exports.deleteCandidate = catchAsync(async (req, res) => {
  logger.debug('Tentative de suppression d\'un candidat:', {
    candidateId: req.params.id,
    ip: req.ip
  });

  const candidate = await db.Candidate.findByPk(req.params.id);
  
  if (!candidate) {
    logger.warn('Tentative de suppression d\'un candidat inexistant:', {
      candidateId: req.params.id,
      ip: req.ip
    });
    throw new AppError(404, 'Candidat non trouvé');
  }

  await candidate.destroy();
  
  logger.info('Candidat supprimé avec succès:', {
    candidateId: req.params.id
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getCandidatesByProfile = catchAsync(async (req, res) => {
  const profileId = req.params.profileId;
  
  logger.debug('Recherche des candidats par profil:', {
    profileId,
    ip: req.ip
  });

  const candidates = await db.Candidate.findAll({
    where: { fk_profile: profileId },
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }]
  });

  logger.info('Candidats trouvés pour le profil:', {
    profileId,
    count: candidates.length
  });

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: { candidates }
  });
});

exports.getCandidateCV = catchAsync(async (req, res) => {
  logger.debug("Vérification et récupération du CV du candidat:", {
    candidateId: req.params.id,
    ip: req.ip
  });

  const candidate = await db.Candidate.findByPk(req.params.id, {
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id']
    }]
  });

  if (!candidate) {
    logger.warn("Candidat inexistant lors de la récupération du CV:", {
      candidateId: req.params.id,
      ip: req.ip
    });
    throw new AppError(404, 'Candidat non trouvé');
  }

  if (!candidate.cv_s3_path || candidate.cv_s3_path.trim() === "") {
    throw new AppError(400, 'Le chemin du CV est manquant ou invalide');
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: candidate.cv_s3_path,
  });

  try {
    const data = await s3.send(command);
    res.setHeader('Content-Disposition', `attachment; filename=\"cv_candidate_${candidate.id}.pdf\"`);
    data.Body.pipe(res);
  } catch (err) {
    logger.error('Erreur lors du téléchargement du CV depuis S3:', { err });
    res.status(500).json({ status: 'error', message: 'Erreur lors du téléchargement du fichier depuis S3.' });
  }
});

exports.getAllReceivedCandidatesWithCV = catchAsync(async (req, res) => {
  logger.debug("Recherche de tous les candidats 'received' avec un CV valide", {
    ip: req.ip
  });

  const candidates = await db.Candidate.findAll({
    where: {
      status: 'received',
      cv_s3_path: { [Sequelize.Op.ne]: null }
    },
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id']
    }]
  });

  // Filtrer ceux qui ont un chemin non vide
  const filtered = candidates.filter(c => c.cv_s3_path && c.cv_s3_path.trim() !== '');

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    data: filtered
  });
});

exports.getCandidatesByStatus = catchAsync(async (req, res) => {
  const status = req.params.status;
  logger.debug(`Recherche des candidats avec le statut '${status}' et un CV valide`, {
    ip: req.ip
  });

  const allowedStatuses = ['received', 'selected', 'validated', 'Declined', 'traited', 'discarded'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Statut invalide' });
  }

  const candidates = await db.Candidate.findAll({
    where: {
      status: status,
      cv_s3_path: { [Sequelize.Op.ne]: null }
    },
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id']
    }]
  });

  // Filtrer ceux qui ont un chemin non vide
  const filtered = candidates.filter(c => c.cv_s3_path && c.cv_s3_path.trim() !== '');

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    data: filtered
  });
});

exports.getTraitedCandidatesByProfile = catchAsync(async (req, res) => {
  const profileId = req.params.profileId;
  
  // Vérifier d'abord si le service Python est disponible
  try {
    await axios.get('http://127.0.0.1:5001', { timeout: 5000 });
    logger.debug('Service Python accessible');
  } catch (error) {
    logger.error('Service Python non disponible:', error.message);
    return res.status(503).json({
      status: 'error',
      message: 'Service Python non disponible. Veuillez vérifier que le service Python est en cours d\'exécution sur le port 5001.',
      details: error.message
    });
  }

  // 1. Chercher les candidats 'received' pour ce profil
  const receivedCandidates = await db.Candidate.findAll({
    where: {
      fk_profile: profileId,
      status: 'received',
      cv_s3_path: { [Sequelize.Op.ne]: null }
    }
  });

  logger.info(`Nombre de candidats 'received' trouvés: ${receivedCandidates.length}`);

  // 2. Traiter les candidats
  const processedCandidates = [];
  const errors = [];
  const failedCandidates = [];

  for (const candidate of receivedCandidates) {
    try {
      const extractedData = await processCandidate(candidate, req.headers.authorization);
      logger.debug(`Données extraites pour le candidat ${candidate.id}:`, extractedData);
      
      // Vérifier si les données extraites sont valides
      if (!extractedData || Object.keys(extractedData).length === 0) {
        throw new Error('Aucune donnée extraite du CV');
      }

      // Mettre à jour le candidat avec les données extraites
      await candidate.update({
        ...extractedData,
        status: 'traited'
      });
      logger.info(`Candidat ${candidate.id} mis à jour avec succès`);

      processedCandidates.push(candidate);
    } catch (error) {
      const errorMessage = `Erreur lors du traitement du candidat ${candidate.id}: ${error.message}`;
      logger.error(errorMessage, {
        candidateId: candidate.id,
        error: error.message,
        stack: error.stack
      });
      errors.push(errorMessage);
      failedCandidates.push({
        id: candidate.id,
        error: error.message,
        cv_path: candidate.cv_s3_path
      });
      
      // Marquer le candidat commnt échoué mae ayais garder son statut 'received'
      await candidate.update({
        status: 'received',
        score_description: `Échec du traitement: ${error.message}`
      });
      
      // Continuer avec le prochain candidat
      continue;
    }
  }

  // 3.  Retournerla liste des candidats traited triés
  const candidates = await db.Candidate.findAll({
    where: {
      fk_profile: profileId,
      status: { [Sequelize.Op.in]: ['traited', 'validated', 'discarded'] },
      cv_s3_path: { [Sequelize.Op.ne]: null }
    },
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }],
    order: [
      // D'abord trier par manual_rank si présent
      [Sequelize.literal('CASE WHEN manual_rank IS NOT NULL THEN 0 ELSE 1 END'), 'ASC'],
      [Sequelize.literal('CASE WHEN manual_rank IS NOT NULL THEN manual_rank ELSE NULL END'), 'ASC'],
      // Ensuite trier par score_value en ordre décroissant
      ['score_value', 'DESC']
    ]
  });

  const filtered = candidates.filter(c => c.cv_s3_path && c.cv_s3_path.trim() !== '');

  logger.info(`Nombre de candidats traités avec succès: ${filtered.length}`);

  res.status(200).json({
    status: 'success',
    results: filtered.length,
    data: filtered,
    processed: processedCandidates.length,
    failed: failedCandidates,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      total_candidates: receivedCandidates.length,
      processed_successfully: processedCandidates.length,
      failed: failedCandidates.length,
      remaining_received: receivedCandidates.length - processedCandidates.length - failedCandidates.length
    }
  });
});

exports.extractCandidateInfo = catchAsync(async (req, res) => {
  const candidateId = req.params.id;
  const candidate = await db.Candidate.findByPk(candidateId);

  if (!candidate || candidate.status !== 'received') {
    return res.status(404).json({ error: 'Candidat non trouvé ou statut incorrect' });
  }

  // Chemin absolu du fichier CV
  const filePath = path.resolve(candidate.cv_s3_path);

  // Prépare le form-data
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const pythonApiUrl = 'http://127.0.0.1:5001/candidate/received/download_cv_and_return_info';
    const response = await axios.post(
      pythonApiUrl,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': req.headers.authorization
        }
      }
    );

    const extracted = response.data;

    await candidate.update({
      ...extracted.candidate,
      status: 'traited'
    });

    res.status(200).json({
      status: 'success',
      data: { candidate }
    });
  } catch (error) {
    console.error('Erreur extraction CV:', error);
    if (error.response) {
      console.error('Réponse de l\'API Python:', error.response.data);
    }
    logger.error('Erreur lors de l\'extraction du CV:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data,
      code: error.code,
      config: error.config
    });
    res.status(500).json({ status: 'error', message: error.message, details: error.response?.data });
  }
});

exports.getSortedCandidates = catchAsync(async (req, res) => {
  const {
    profileId,
    sortBy = 'score_value', // Par défaut, trier par score
    order = 'DESC', // Par défaut, ordre décroissant
    status = 'traited', // Par défaut, seulement les candidats traités
    minScore = 0,
    maxScore = 100,
    limit = 50,
    offset = 0
  } = req.query;

  logger.debug('Récupération des candidats triés:', {
    profileId,
    sortBy,
    order,
    status,
    minScore,
    maxScore,
    limit,
    offset
  });

  // Construire la requête de base
  const whereClause = {
    status: status,
    cv_s3_path: { [Sequelize.Op.ne]: null }
  };

  // Ajouter le filtre par profil si spécifié
  if (profileId) {
    whereClause.fk_profile = profileId;
  }

  // Ajouter le filtre par score si spécifié
  if (sortBy === 'score_value') {
    whereClause.score_value = {
      [Sequelize.Op.between]: [minScore, maxScore]
    };
  }

  // Vérifier que le champ de tri est valide
  const allowedSortFields = [
    'score_value',
    'name',
    'years_of_experience',
    'creation_date',
    'current_position',
    'manual_rank'
  ];

  if (!allowedSortFields.includes(sortBy)) {
    throw new AppError(400, `Champ de tri invalide. Champs autorisés: ${allowedSortFields.join(', ')}`);
  }

  // Vérifier que l'ordre est valide
  const allowedOrders = ['ASC', 'DESC'];
  if (!allowedOrders.includes(order.toUpperCase())) {
    throw new AppError(400, "L'ordre doit être 'ASC' ou 'DESC'");
  }

  // Exécuter la requête avec tri personnalisé
  const candidates = await db.Candidate.findAll({
    where: whereClause,
    include: [{
      model: db.profile,
      as: 'profile',
      attributes: ['id', 'title', 'description', 'typeContract']
    }],
    order: [
      // D'abord trier par manual_rank si présent
      [Sequelize.literal('CASE WHEN manual_rank IS NOT NULL THEN 0 ELSE 1 END'), 'ASC'],
      [Sequelize.literal('CASE WHEN manual_rank IS NOT NULL THEN manual_rank ELSE NULL END'), 'ASC'],
      // Ensuite trier par le champ spécifié
      [sortBy, order.toUpperCase()]
    ],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Obtenir le nombre total de candidats pour la pagination
  const total = await db.Candidate.count({ where: whereClause });

  logger.info(`Nombre de candidats trouvés: ${candidates.length} sur ${total}`);

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    total,
    data: {
      candidates,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      },
      sort: {
        by: sortBy,
        order: order.toUpperCase()
      },
      filters: {
        status,
        minScore,
        maxScore,
        profileId: profileId || 'all'
      }
    }
  });
});

exports.updateCandidateRank = catchAsync(async (req, res) => {
  const { candidateId } = req.params;
  const { manual_rank } = req.body;

  logger.debug('Mise à jour du rang manuel du candidat:', {
    candidateId,
    manual_rank,
    ip: req.ip
  });

  const candidate = await db.Candidate.findByPk(candidateId);
  
  if (!candidate) {
    logger.warn('Tentative de mise à jour du rang d\'un candidat inexistant:', {
      candidateId,
      ip: req.ip
    });
    throw new AppError(404, 'Candidat non trouvé');
  }

  // Mettre à jour le rang manuel
  await candidate.update({ manual_rank });

  logger.info('Rang manuel mis à jour avec succès:', {
    candidateId,
    manual_rank
  });

  res.status(200).json({
    status: 'success',
    data: { candidate }
  });
});

exports.deleteAllCandidates = catchAsync(async (req, res) => {
  logger.debug('Tentative de suppression de tous les candidats', {
    ip: req.ip
  });

  // Supprimer tous les candidats
  const deletedCount = await db.Candidate.destroy({
    where: {},
    force: true // Force la suppression même si des contraintes existent
  });

  logger.info(`Suppression de ${deletedCount} candidats effectuée avec succès`);

  res.status(200).json({
    status: 'success',
    message: `${deletedCount} candidats ont été supprimés avec succès`,
    data: {
      deletedCount
    }
  });
});

// Trigger pour créer automatiquement des candidats à partir des CVs platform non assignés
exports.triggerPlatformCVs = catchAsync(async (req, res) => {
  // 1. Lister tous les fichiers S3 sous cvs/ qui contiennent /platform/
  const allFiles = await listCVFiles('cvs/');
  const platformFiles = allFiles.filter(key => /\/platforme\//.test(key));

  // 2. Pour chaque fichier, extraire le profileId et vérifier s'il existe déjà un candidat
  const createdCandidates = [];
  const skippedFiles = [];
  const errors = [];
  const treatedProfiles = new Set();

  for (const key of platformFiles) {
    // Nouvelle regex plus robuste
    const match = key.match(/cvs\/[^/]+\/[^/]+\/platforme\/\d+_.+_(\d+)\.[a-z0-9]+$/i);
    if (!match) {
      skippedFiles.push({ key, reason: 'Impossible d\'extraire le profileId' });
      continue;
    }
    const profileId = parseInt(match[1], 10);
    if (!profileId) {
      skippedFiles.push({ key, reason: 'profileId non valide' });
      continue;
    }
    // Vérifier si un candidat existe déjà
    const exists = await db.Candidate.findOne({ where: { cv_s3_path: key } });
    if (exists) {
      skippedFiles.push({ key, reason: 'Déjà assigné à un candidat' });
      continue;
    }
    // Créer le candidat
    try {
      const candidate = await db.Candidate.create({
        fk_profile: profileId,
        cv_s3_path: key,
        type_importation: 'platforme',
        status: 'received',
      });
      createdCandidates.push(candidate);
      treatedProfiles.add(profileId);
    } catch (err) {
      errors.push({ key, error: err.message });
    }
  }

  // 3. Appeler getTraitedCandidatesByProfile pour chaque profil concerné
  const traitedResults = [];
  for (const profileId of treatedProfiles) {
    try {
      // Appel direct de la logique, pas via HTTP
      req.params.profileId = profileId;
      // On attend la promesse pour chaque profil
      await exports.getTraitedCandidatesByProfile(req, res);
      traitedResults.push({ profileId, status: 'traited' });
    } catch (err) {
      traitedResults.push({ profileId, status: 'error', error: err.message });
    }
  }

  // 4. Résumé
  res.status(200).json({
    status: 'success',
    created: createdCandidates.length,
    skipped: skippedFiles,
    errors,
    traitedResults
  });
});

exports.deleteAllCVsFromS3 = catchAsync(async (req, res) => {
  const files = await listCVFiles('cvs/');
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  let deleted = 0;
  let errors = [];
  for (const key of files) {
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key
      }));
      deleted++;
    } catch (err) {
      errors.push({ key, error: err.message });
    }
  }

  res.status(200).json({
    status: 'success',
    deleted,
    errors
  });
}); 