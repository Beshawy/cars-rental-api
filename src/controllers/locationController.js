const Location = require('../models/locationModel');
const ChargingStation = require('../models/chargingStationModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');

exports.updateLocation = asyncHandler(async (req, res, next) => {
    const { type, coordinates, reference, address, city, isStatic } = req.body;

    // Determine model name for dynamic ref
    const modelMap = {
        'car': 'Car',
        'charging_station': 'ChargingStation',
        'user': 'User',
        'emergency': 'Emergency'
    };

    const onModel = modelMap[type];

    // Find and update or create
    const updatedLocation = await Location.findOneAndUpdate(
        { reference, type },
        {
            location: {
                type: 'Point',
                coordinates: coordinates
            },
            onModel,
            address,
            city,
            isStatic,
            lastUpdated: Date.now()
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            location: updatedLocation
        }
    });
});

exports.getNearbyLocations = asyncHandler(async (req, res, next) => {
    const { type, longitude, latitude, distance } = req.query;

    if (!longitude || !latitude) {
        return next(new AppError('Please provide both longitude and latitude', 400));
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const maxDist = parseInt(distance) || 5000;

    // 1. Get primary nearby locations (e.g., cars)
    const locations = await Location.find({
        type,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDist
            }
        }
    }).populate('reference');

    // 2. Find the SINGLE nearest available charging station
    const nearestStation = await ChargingStation.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [lng, lat] },
                distanceField: "distanceInKm",
                distanceMultiplier: 0.001, // Convert meters to km
                maxDistance: 50000,
                query: { isAvailable: true },
                spherical: true
            }
        },
        { $limit: 1 },
        {
            $project: {
                name: 1,
                pricePerKwh: 1,
                address: 1,
                city: 1,
                location: 1,
                distanceInKm: 1,
                chargingType: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: locations.length,
        data: {
            locations,
            nearestChargingStation: nearestStation.length > 0 ? nearestStation[0] : null
        }
    });
});


exports.calculateDistance = asyncHandler(async (req, res, next) => {
    const { startLng, startLat, endLng, endLat } = req.query;

    if (!startLng || !startLat || !endLng || !endLat) {
        return next(new AppError('Please provide start and end coordinates', 400));
    }


    res.status(200).json({
        status: 'success',
        data: {
            message: 'Distance calculation logic can be implemented here or via MongoDB geoNear'
        }
    });
}); 
