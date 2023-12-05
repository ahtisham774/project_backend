
const express = require('express');
const router = express.Router();

// Import the activitiesController
const activitiesController = require('../controllers/ActivitiesController');

// Define the endpoint for level
router.get('/:id/activity/all', activitiesController.getAllActivities);
router.post('/:id/activity/create',activitiesController.uploadImage, activitiesController.createActivities);
router.post('/:id/lesson/all', activitiesController.getActivitiesContentById);
router.post('/:id/material/all', activitiesController.getMaterialByLesson);
router.post('/:id/lesson/create', activitiesController.uploadImage, activitiesController.addLesson);
router.post('/:id/material/add', activitiesController.uploadImage, activitiesController.addMaterial);
router.post('/:id/material/remove',  activitiesController.removeMaterial);
// router.get('/:id/subject/all', activitiesController.getLevelById);
// router.post('/:id/subject/create', activitiesController.uploadImage,activitiesController.updateLevelById);
// router.delete('/:id', activitiesController.deleteLevelById);

module.exports = router;
