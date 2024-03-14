const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/ReminderController');

router.post('/:id/create', reminderController.createReminder);
router.get('/:id/get', reminderController.getAllReminders);
// router.put('/update/:id', reminderController.updateReminder);
router.delete('/:id/delete', reminderController.deleteReminder);

module.exports = router;