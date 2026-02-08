const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/webHookController');

// Webhook stripe
/**
 * @swagger
 * /api/v1/webhook:
 *   post:
 *     summary: Stripe Webhook handler
 *     tags: [Webhooks]
 *     description: Handles Stripe events like checkout.session.completed. Should not be protected by auth middleware.
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/', stripeWebhook);

module.exports = router;