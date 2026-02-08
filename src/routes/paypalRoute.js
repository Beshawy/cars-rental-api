const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/capture', protect, paypalController.capturePayment);

module.exports = router;   