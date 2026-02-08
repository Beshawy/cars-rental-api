const express = require('express');
const router = express.Router();

const emergencyController = require('../controllers/emergencyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/emergency:
 *   post:
 *     summary: Report an emergency
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [car, description, location]
 *             properties:
 *               car: { type: string }
 *               description: { type: string }
 *               location: { type: object }
 *     responses:
 *       201:
 *         description: Emergency reported successfully
 */
router.post(
  '/',
  protect,
  restrictTo('user', 'admin'),
  emergencyController.createEmergency
);

/**
 * @swagger
 * /api/v1/emergency:
 *   get:
 *     summary: Get all emergencies (Admin only)
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all emergencies
 */
router.get(
  '/',
  protect,
  restrictTo('admin'),
  emergencyController.getAllEmergencies
);

/**
 * @swagger
 * /api/v1/emergency/{id}/status:
 *   patch:
 *     summary: Update emergency status (Admin only)
 *     tags: [Emergencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, in-progress, resolved] }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  protect,
  restrictTo('admin'),
  emergencyController.updateEmergencyStatus
);

module.exports = router;