const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/webHookController');

// Webhook stripe
router.post('/', stripeWebhook); // لا تضيف protect middleware هنا

module.exports = router;