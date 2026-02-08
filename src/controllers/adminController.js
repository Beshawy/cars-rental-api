const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { createAdminValidation } = require('../utils/validation/adminVlidation.js');
const AppError = require('../utils/AppError');

//  Promote User to Admin
exports.createAdmin = asyncHandler(async (req, res) => {
    const { error } = createAdminValidation.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const { userId, role } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check if user is already an admin or manager
    if (user.role === 'admin' || user.role === 'manager' || user.role === 'superAdmin') {
        throw new AppError(`User is already a ${user.role}`, 400);
    }

    // Update user role
    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'User promoted to admin successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
});

//  Delete Admin
exports.deleteAdmin = asyncHandler(async (req, res) => {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);

    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "manager") {
        return res.status(403).json({ message: "Cannot delete manager" });
    }

    await admin.deleteOne();

    res.json({ message: "Admin deleted successfully" });
});