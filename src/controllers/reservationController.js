const asyncHandler = require('express-async-handler');
const Car = require('../models/carModel');
const Reservation = require('../models/reservationModel');
const AppError = require('../utils/AppError');


exports.createReservation = asyncHandler(async (req, res, next) => {
    const { carId, duration, durationType } = req.body;
    const userId = req.user._id; 

    const car = await Car.findById(carId);
    if (!car) {
        throw new AppError('العربية غير موجودة', 404);
    }
    if (car.status !== 'available') {
        throw new AppError('العربية محجوزة حاليًا', 400);
    }

    const now = new Date();
    const endTime = new Date(now);
    if (durationType === 'hours') {
        endTime.setHours(now.getHours() + duration);
    } else if (durationType === 'days') {
        endTime.setDate(now.getDate() + duration);
    } else {
        throw new AppError('نوع المدة غير صالح', 400);
    }

    const reservation = await Reservation.create({
        car: car._id,
        user: userId,
        duration,
        durationType,
        endTime
    });

    car.status = 'reserved';
    await car.save();

    res.status(201).json({
        status: 'success',
        message: 'تم الحجز بنجاح',
        reservation: {
            carId: car._id,
            status: car.status,
            reservedFor: `${duration} ${durationType}`,
            paymentStatus: 'pending',
            endTime
        }
    });
});

// Optional: جلب كل الحجزات الخاصة بالمستخدم
exports.getUserReservations = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    const reservations = await Reservation.find({ user: userId }).populate('car');

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});



//  Admin فقط: جلب كل الحجوزات
exports.getAllReservations = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new AppError('غير مصرح لك', 403);
    }

    const reservations = await Reservation.find()
        .populate('car', 'brand model plateNumber status')
        .populate('user', 'name email');

    res.status(200).json({
        status: 'success',
        results: reservations.length,
        data: reservations
    });
});

//  حذف حجز: يقدر يحدفه الادمن أو صاحب الحجز
exports.deleteReservation = asyncHandler(async (req, res, next) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        throw new AppError('الحجز غير موجود', 404);
    }

    // تحقق من الصلاحيات
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
        throw new AppError('غير مصرح لك بحذف هذا الحجز', 403);
    }

    // قبل الحذف: رجّع حالة العربية متاحة
    const car = await Car.findById(reservation.car);
    if (car) {
        car.status = 'available';
        await car.save();
    }

    await reservation.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'تم حذف الحجز بنجاح'
    });
});