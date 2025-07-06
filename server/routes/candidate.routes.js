const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const cvUpload = require('../middlewares/cvUpload.middleware');
// const authMiddleware = require('../middlewares/auth.middleware');
const { listCVFiles } = require('../utils/s3ListFiles');
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} = require("../middlewares/auth");

// Routes protégées
router.use(authenticateToken);

// router.use(authMiddleware.authenticate);
router.delete('/delete-all', candidateController.deleteAllCandidates);
// Routes pour les candidats
router.post('/', cvUpload.single('cv'), candidateController.createCandidate);
router.get('/', candidateController.getAllCandidates);
router.get('/received/cv', candidateController.getAllReceivedCandidatesWithCV);
router.get('/profile/:profileId', candidateController.getCandidatesByProfile);
router.get('/profile/:profileId/traited', candidateController.getTraitedCandidatesByProfile);
router.get('/:id/cv', candidateController.getCandidateCV);
router.get('/:id', candidateController.getCandidateById);
router.put('/:id', candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);
router.get('/status/:status/cv', candidateController.getCandidatesByStatus);
router.post('/:id/extract', candidateController.extractCandidateInfo);

// Route pour obtenir les candidats triés
router.get('/sorted', candidateController.getSortedCandidates);

// Route pour mettre à jour le rang manuel d'un candidat
router.patch('/:candidateId/rank', candidateController.updateCandidateRank);

// Route pour supprimer tous les candidats

// Nouvelle route pour lister les fichiers CV dans S3
router.get('/cvs/list', async (req, res) => {
  try {
    const files = await listCVFiles();
    res.status(200).json({ status: 'success', files });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Nouvelle route pour trigger la création automatique de candidats à partir des CVs platform
router.get('/trigger/platform-cvs', candidateController.triggerPlatformCVs);

// Nouvelle route pour supprimer tous les fichiers CV depuis S3
router.delete('/cvs/s3/delete-all', candidateController.deleteAllCVsFromS3);

module.exports = router;