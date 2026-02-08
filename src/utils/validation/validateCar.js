const Joi = require('joi');

const validateCar = (data) => {
  const schema = Joi.object({
    brand: Joi.string().trim().required(),

    model: Joi.string().trim().required(),

    year: Joi.number().min(1990).required(),

    plateNumber: Joi.string().trim().required(),

    vinNumber: Joi.string().trim().required(),

    batteryCapacity: Joi.number().positive().required(),

    rangePerCharge: Joi.number().positive().required(),

    chargingType: Joi.string().valid('fast', 'normal'),

    seats: Joi.number().min(1),

    transmission: Joi.string().valid('automatic'),

    features: Joi.array().items(Joi.string()),

    pricePerHour: Joi.number().positive().required(),

    pricePerDay: Joi.number().positive().required(),

    lateFeePerHour: Joi.number().min(0),

    depositAmount: Joi.number().min(0),

    location: Joi.object({
      city: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      parkingSpot: Joi.string().allow(''),
    }).required(),
  });

  return schema.validate(data);
};

module.exports = validateCar;