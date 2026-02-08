const asyncHandler = require('express-async-handler');
const Reservation = require('../models/reservationModel');
const Payment = require('../models/paymentModel');
const AppError = require('../utils/AppError');

// GET Customer Reports
exports.getCustomerReports = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    if (!userId) {
        return next(new AppError('User not authenticated', 401));
    }


    const reservations = await Reservation.find({ user: userId })
        .populate('car', 'brand model plateNumber')
        .populate('payment', 'amount currency status paymentMethod transactionId')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});