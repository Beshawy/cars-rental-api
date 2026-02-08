const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/payment/create:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reservationId]
 *             properties:
 *               reservationId: { type: string }
 *     responses:
 *       200:
 *         description: Stripe client secret returned
 */
router.post(
  '/create',
  protect,
  paymentController.createPayment
);

/**
 * @swagger
 * /api/v1/payment/paypal/create:
 *   post:
 *     summary: Create PayPal order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reservationId]
 *             properties:
 *               reservationId: { type: string }
 *     responses:
 *       200:
 *         description: PayPal order ID and approval link returned
 */
router.post(
  '/paypal/create',
  protect,
  paymentController.createPayPalOrder
);

module.exports = router;