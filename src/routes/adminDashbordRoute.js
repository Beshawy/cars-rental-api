const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashbordController');
const { protect, restrictTo } = require('../middleware/authMiddleware');


router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminDashboardController.getDashboardStats);
router.get('/reservations', adminDashboardController.getAllReservations);
router.get('/payments', adminDashboardController.getAllPayments);
router.get('/reports/customers', adminDashboardController.getCustomerReports);
router.get('/reports/management', adminDashboardController.getManagementReports);

// إدارة المستخدمين
router.get('/users', adminDashboardController.getAllUsers);
router.route('/users/:id')
    .patch(adminDashboardController.updateUser)
    .delete(adminDashboardController.deleteUser);
router.patch('/users/:id/toggle-status', adminDashboardController.toggleUserStatus);

module.exports = router; 
  