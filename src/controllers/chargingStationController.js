const ChargingStation = require("../models/chargingStationModel");
const asyncHandler = require('express-async-handler');
const AppError = require("../utils/AppError");

exports.createChargingStation = asyncHandler(async (req, res, next) => {
  const {
    name,
    chargingType,
    pricePerKwh,
    latitude,
    longitude,
    city,
    address,
  } = req.body;

  
  if (!latitude || !longitude) {
    return next(
      new AppError("Latitude and longitude are required", 400)
    );
  }

  const station = await ChargingStation.create({
    name,
    chargingType,
    pricePerKwh,
    city,
    address,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      station,
    },
  });
});

exports.getNearbyChargingStations = async (req, res) => {
  const { latitude, longitude, distance = 5000 } = req.query;

  const stations = await ChargingStation.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: distance,
      },
    },
    isAvailable: true,
  });

  res.status(200).json({
    status: "success",
    results: stations.length,
    data: stations,
  });
};