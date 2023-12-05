
const express = require('express');
const router = express.Router();

// Import the levelController
const levelController = require('../controllers/LevelController');

// Define the endpoint for level
router.get('/all', levelController.getAllLevel);
router.post('/create', levelController.createLevel);
router.get('/:id/subject/all', levelController.getLevelById);
router.post('/:id/subject/create', levelController.uploadImage,levelController.updateLevelById);
router.delete('/:id', levelController.deleteLevelById);

module.exports = router;
