const express = require('express');
const router = express.Router();
const studentGoalsController = require('../controllers/StudentGoalsController');

router.post('/:id/assign', studentGoalsController.assignGoals);
router.get('/:id/get', studentGoalsController.getGoals);
router.put('/mark/:id', studentGoalsController.updateGoal);

module.exports = router;