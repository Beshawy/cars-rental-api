const asyncHandler = require('express-async-handler');
const Reservation = require('../models/reservationModel');
const Payment = require('../models/paymentModel');
const Car = require('../models/carModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');


exports.getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'available' });
    const activeReservations = await Reservation.countDocuments({ status: 'active' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyRevenue = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            metrics: {
                totalUsers,
                totalCars,
                availableCars,
                parkingOccupancy: totalCars - availableCars,
                activeReservations
            },
            dailyRevenue: dailyRevenue[0]?.total || 0
        }
    });
});


exports.getAllReservations = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reservations = await Reservation.find()
        .populate('user', 'name email')
        .populate('car', 'brand model plateNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Reservation.countDocuments();

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        total,
        page,
        data: reservations
    });
});


exports.getAllPayments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find()
        .populate('user', 'name email')
        .populate('reservation', 'status duration durationType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Payment.countDocuments();

    res.status(200).json({
        status: 'success',
        results: payments.length,
        total,
        page,
        data: payments
    });
});


exports.getCustomerReports = asyncHandler(async (req, res) => {
    const reports = await Reservation.aggregate([
        {
            $group: {
                _id: '$user',
                totalReservations: { $sum: 1 },
                completedReservations: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $project: {
                _id: 1,
                name: '$userDetails.name',
                email: '$userDetails.email',
                totalReservations: 1,
                completedReservations: 1
            }
        },
        { $sort: { totalReservations: -1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: reports
    });
});


exports.getManagementReports = asyncHandler(async (req, res) => {
    const revenueStats = await Payment.aggregate([
        { $match: { status: 'paid' } },
        {
            $group: {
                _id: '$paymentMethod',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    const popularCars = await Reservation.aggregate([
        { $group: { _id: '$car', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'cars',
                localField: '_id',
                foreignField: '_id',
                as: 'carDetails'
            }
        },
        { $unwind: '$carDetails' },
        {
            $project: {
                brand: '$carDetails.brand',
                model: '$carDetails.model',
                count: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            revenueStats,
            popularCars
        }
    });
});


exports.getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: { $ne: 'admin' } }) // استثناء المحررين للامان
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments({ role: { $ne: 'admin' } });

    res.status(200).json({
        status: 'success',
        results: users.length,
        total,
        page,
        data: users
    });
});


exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email, status } = req.body;


    if (req.body.password) {
        return next(new AppError('لا يمكن تغيير كلمة المرور من هذا الاندبوينت', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, status },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return next(new AppError('المستخدم غير موجود', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
});


exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body; // active or suspended

    if (!['active', 'suspended'].includes(status)) {
        return next(new AppError('حالة غير صالحة. اختر active أو suspended', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    ).select('-password');

    if (!user) {
        return next(new AppError('المستخدم غير موجود', 404));
    }

    res.status(200).json({
        status: 'success',
        message: status === 'suspended' ? 'تم حظر المستخدم بنجاح' : 'تم فك حظر المستخدم بنجاح',
        data: user
    });
});


exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError('المستخدم غير موجود', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
