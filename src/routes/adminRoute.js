// routes/adminRoutes.js
const express = require('express');
const { createAdmin, deleteAdmin } = require('../controllers/adminController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const { restrictTo } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post(
    "/create",
    authMiddleware.protect,
    restrictTo("admin"),
    createAdmin
);

router.delete(
    "/:adminId",
    authMiddleware.protect,
    restrictTo("admin"),
    deleteAdmin
);

module.exports = router;