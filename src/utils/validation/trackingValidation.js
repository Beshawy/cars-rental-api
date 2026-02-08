const Joi = require('joi');

exports.updateTrackingSchema = Joi.object({
    carId: Joi.string().hex().length(24).required(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required(),

    speed: Joi.number().min(0).optional()
});