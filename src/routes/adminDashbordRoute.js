const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashbordController');
const { protect, restrictTo } = require('../middleware/authMiddleware');


router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin-dashboard/dashboard:
 *   get:
 *     summary: Get high-level dashboard metrics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics like total users, cars, revenue, etc.
 */
router.get('/dashboard', adminDashboardController.getDashboardStats);

/**
 * @swagger
 * /api/v1/admin-dashboard/reservations:
 *   get:
 *     summary: List all reservations (Admin)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of reservations
 */
router.get('/reservations', adminDashboardController.getAllReservations);

/**
 * @swagger
 * /api/v1/admin-dashboard/payments:
 *   get:
 *     summary: List all payments (Admin)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of payments
 */
router.get('/payments', adminDashboardController.getAllPayments);

/**
 * @swagger
 * /api/v1/admin-dashboard/reports/customers:
 *   get:
 *     summary: Get customer detailed reports
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated customer reports
 */
router.get('/reports/customers', adminDashboardController.getCustomerReports);

/**
 * @swagger
 * /api/v1/admin-dashboard/reports/management:
 *   get:
 *     summary: Get management revenue reports
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue by method and popular cars
 */
router.get('/reports/management', adminDashboardController.getManagementReports);

/**
 * @swagger
 * /api/v1/admin-dashboard/users:
 *   get:
 *     summary: List all users for management
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of platform users
 */
router.get('/users', adminDashboardController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin-dashboard/users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               status: { type: string, enum: [active, inactive, suspended] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete a user account (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: User deleted
 */
router.route('/users/:id')
    .patch(adminDashboardController.updateUser)
    .delete(adminDashboardController.deleteUser);

/**
 * @swagger
 * /api/v1/admin-dashboard/users/{id}/toggle-status:
 *   patch:
 *     summary: Block or unblock a user
 *     tags: [Admin Dashboard]
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
 *               status: { type: string, enum: [active, suspended] }
 *     responses:
 *       200:
 *         description: User status toggled
 */
router.patch('/users/:id/toggle-status', adminDashboardController.toggleUserStatus);

module.exports = router;
