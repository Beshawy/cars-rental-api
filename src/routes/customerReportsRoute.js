const express = require('express');
const router = express.Router();
const { getCustomerReports } = require('../controllers/customerReportsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/customer-reports:
 *   get:
 *     summary: Get detailed customer aggregation reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of customer data and reservation history
 */
router.get('/', protect, getCustomerReports);

module.exports = router;  