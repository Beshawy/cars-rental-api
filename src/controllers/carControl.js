const Car = require('../models/carModel');
const { uploadToCloudinary } = require('../utils/uploadImage');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const validateCar = require('../utils/validation/validateCar');


exports.uploadCarImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('Please upload an image', 400);
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
        throw new AppError('Car not found', 404);
    }

    // رفع الصورة
    const result = await uploadToCloudinary(req.file, 'cars');

    // تحديث العربية
    car.images.push(result.secure_url);
    await car.save();

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


exports.createCar = asyncHandler(async (req, res, next) => {
    const { error } = validateCar(req.body);

    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const car = await Car.create(req.body);

    res.status(201).json({
        status: 'success',
        data: car
    });
});

exports.updateCar = asyncHandler(async (req, res, next) => {
    const { error } = validateCar(req.body);

    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const car = await Car.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!car) {
        throw new AppError('Car not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: car
    });
});


exports.deleteCar = asyncHandler(async (req, res, next) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        throw new AppError('Car not found', 404);
    }

    await car.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Car deleted successfully'
    });
});


exports.getAllCars = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.city) {
    filter['location.city'] = req.query.city;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.pricePerDay = {};

    if (req.query.minPrice) {
      filter.pricePerDay.$gte = Number(req.query.minPrice);
    }

    if (req.query.maxPrice) {
      filter.pricePerDay.$lte = Number(req.query.maxPrice);
    }
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let sortBy = '-createdAt';
  if (req.query.sort) {
    sortBy = req.query.sort;
  }

  const cars = await Car.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    page,
    results: cars.length,
    data: cars,
  });
});


exports.getCarById = asyncHandler(async (req, res, next) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        throw new AppError('Car not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: car
    });
});


exports.getCarByName = asyncHandler(async (req, res, next) => {
   const {brand , model} = req.query; 

   if(!brand || !model){
    throw new AppError('Please provide brand and model', 400);
   }

    if (!car) {
        throw new AppError('Car not found', 404);
    }

    const car = await Car.findOne({
        brand  :new RegExp(`^${brand}$`, 'i'),
        model : new RegExp(`^${model}$`, 'i')
    })

    if (!car) {
        throw new AppError('Car not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: car
    });
});


exports.searchCars = asyncHandler(async (req, res, next) => {
    const { keyword } = req.query;

    if (!keyword) {
        throw new AppError('Search keyword is required', 400);
    }

    const cars = await Car.find({
        status: 'available',
        $or: [
            { brand: new RegExp(keyword, 'i') },
            { model: new RegExp(keyword, 'i') },
            { 'location.city': new RegExp(keyword, 'i') }
        ]
    });

    res.status(200).json({
        status: 'success',
        results: cars.length,
        data: {
            cars
        }
    });
});
