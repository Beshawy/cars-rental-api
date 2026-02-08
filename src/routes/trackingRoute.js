const express = require('express');
const router = express.Router();

const trackingController = require('../controllers/trackingController');
const { protect , restrictTo } = require('../middleware/authMiddleware');

// User فقط
router.post(
    '/update',
    protect,
    restrictTo('user'),
    trackingController.updateCarLocation
);

// Admin فقط
router.get(
    '/:id',
    protect,
    restrictTo('admin'),
    trackingController.getCarLocation
);

module.exports = router;