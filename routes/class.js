
const express = require('express');
const router = express.Router();

// Import the classController
const classController = require('../controllers/ClassController');

// Define the endpoint for class

router.post('/new', classController.createClass);
router.post('/:id/item', classController.getClassItems);
router.get('/all', classController.getClasses);
router.put('/:id/update', classController.updateClassInfo);
router.post('/:id/tracking/add', classController.createTracking);
router.post('/:id/tracking/bulk', classController.createTrackingBulk);
router.put('/update/:id', classController.updateTracking);

module.exports = router;
