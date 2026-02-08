const Emergency = require('../models/emergencyModel');
const Car = require('../models/carModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const validateEmergency = require('../utils/validation/emergencyValidation');

// USER: create emergency
exports.createEmergency = asyncHandler(async (req, res) => {
  const { error } = validateEmergency(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { car, type, latitude, longitude, description } = req.body;

  const carExists = await Car.findById(car);
  if (!carExists) {
    throw new AppError('Car not found', 404);
  }

  const emergency = await Emergency.create({
    user: req.user._id,
    car,
    type,
    description,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  });

  res.status(201).json({
    status: 'success',
    data: emergency
  });
});

// ADMIN: get all emergencies
exports.getAllEmergencies = asyncHandler(async (req, res) => {
  const emergencies = await Emergency.find()
    .populate('user', 'name email')
    .populate('car', 'brand model plateNumber');

  res.status(200).json({
    status: 'success',
    results: emergencies.length,
    data: emergencies
  });
});

// ADMIN: update status
// يعنى تم استلام البلاغ والدعم فى الطريق  
exports.updateEmergencyStatus = asyncHandler(async (req, res) => {
  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  emergency.status = req.body.status || emergency.status;

  if (req.body.status === 'resolved') {
    emergency.resolvedAt = Date.now();
  }

  await emergency.save();

  res.status(200).json({
    status: 'success',
    data: emergency
  });
});