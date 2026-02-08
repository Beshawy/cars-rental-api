const express = require('express');
const router = express.Router();
const { getCustomerReports } = require('../controllers/customerReportsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCustomerReports);

module.exports = router;  