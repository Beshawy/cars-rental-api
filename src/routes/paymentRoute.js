const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/create',
  protect,
  paymentController.createPayment
);


router.post(
  '/paypal/create',
  protect,
  paymentController.createPayPalOrder
);

module.exports = router;