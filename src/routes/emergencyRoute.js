const express = require('express');
const router = express.Router();

const emergencyController = require('../controllers/emergencyController');
const { protect , restrictTo  } = require('../middleware/authMiddleware');

// User
router.post(
  '/',
  protect,
  restrictTo('user', 'admin'),
  emergencyController.createEmergency
);

// Admin
router.get(
  '/',
  protect,
  restrictTo('admin'),
  emergencyController.getAllEmergencies
);

//فيما بعد
//فيما بعد
//فيما بعد

router.patch(
  '/:id/status',
  protect,
  restrictTo('admin'),
  emergencyController.updateEmergencyStatus
);

module.exports = router;