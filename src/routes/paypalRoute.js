const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/paypal/capture:
 *   post:
 *     summary: Capture PayPal payment
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderID, reservationId]
 *             properties:
 *               orderID: { type: string }
 *               reservationId: { type: string }
 *     responses:
 *       200:
 *         description: Payment captured successfully
 */
router.post('/capture', protect, paypalController.capturePayment);

module.exports = router;   