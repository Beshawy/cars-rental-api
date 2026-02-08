// routes/adminRoutes.js
const express = require('express');
const { createAdmin, deleteAdmin } = require('../controllers/adminController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const { restrictTo } = require('../middleware/authMiddleware.js');
const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/create:
 *   post:
 *     summary: Create a new admin account
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Admin created
 */
router.post(
    "/create",
    authMiddleware.protect,
    restrictTo("admin"),
    createAdmin
);

/**
 * @swagger
 * /api/v1/admin/{adminId}:
 *   delete:
 *     summary: Remove an admin account
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Admin deleted
 */
router.delete(
    "/:adminId",
    authMiddleware.protect,
    restrictTo("admin"),
    deleteAdmin
);

module.exports = router;