
const express = require('express');
const router = express.Router();

// Import the homeworkController
const homeworkController = require('../controllers/HomeworkController');

// Define the endpoint for homework
router.get('/all', homeworkController.getAllHomework);
router.post('/create', homeworkController.createHomework);
router.post('/:id', homeworkController.getHomeworkById);
router.patch('/:id', homeworkController.updateHomework);
router.delete('/:id', homeworkController.deleteHomework);

module.exports = router;
