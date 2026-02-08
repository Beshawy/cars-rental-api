const express = require('express');
const router = express.Router();

const trackingController = require('../controllers/trackingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/tracking/update:
 *   post:
 *     summary: Update car live location (System/User)
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [car, coordinates]
 *             properties:
 *               car: { type: string }
 *               coordinates: { type: array, items: { type: number }, example: [31.2, 30.0] }
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.post(
    '/update',
    protect,
    restrictTo('user'),
    trackingController.updateCarLocation
);

/**
 * @swagger
 * /api/v1/tracking/{id}:
 *   get:
 *     summary: Get real-time car location (Admin only)
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Car ID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Current tracking information
 */
router.get(
    '/:id',
    protect,
    restrictTo('admin'),
    trackingController.getCarLocation
);

module.exports = router;