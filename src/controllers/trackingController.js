const Location = require('../models/locationModel');
const Car = require('../models/carModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const { updateTrackingSchema } = require('../utils/validation/trackingValidation');

exports.updateCarLocation = asyncHandler(async (req, res, next) => {

    // 1️⃣ Validation
    const { error } = updateTrackingSchema.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const { carId, latitude, longitude, speed } = req.body;

    // 2️⃣ التأكد إن العربية موجودة
    const car = await Car.findById(carId);
    if (!car) {
        throw new AppError('Car not found', 404);
    }

    // 3️⃣ (اختياري) لو العربية مقفولة
    if (car.isLocked) {
        throw new AppError('Car is locked, cannot update location', 403);
    }

    // 4️⃣ دور على Location بتاعة العربية
    let location = await Location.findOne({
        type: 'car',
        reference: carId
    });

    // 5️⃣ لو موجودة → Update
    if (location) {
        location.location.coordinates = [longitude, latitude];
        location.lastUpdated = Date.now();
        location.isStatic = false;

        if (speed !== undefined) {
            location.speed = speed;
        }

        await location.save();
    } 
    // 6️⃣ لو مش موجودة → Create
    else {
        location = await Location.create({
            type: 'car',
            reference: carId,
            onModel: 'Car',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            isStatic: false,
            lastUpdated: Date.now(),
            speed
        });
    }

    // 7️⃣ Response
    res.status(200).json({
        status: 'success',
        message: 'Car location updated successfully',
        data: {
            carId,
            coordinates: {
                latitude,
                longitude
            }
        }
    });
});


exports.getCarLocation = asyncHandler(async (req, res) => {
    const location = await Location.findOne({
        type: 'car',
        reference: req.params.id
    });

    if (!location) {
        throw new AppError('Location not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: {
            location
        }
    });
});