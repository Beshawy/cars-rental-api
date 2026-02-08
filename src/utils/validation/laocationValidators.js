const Joi = require('joi');

const updateLocationValidation = Joi.object({
    type: Joi.string()
        .valid('car', 'charging_station', 'user', 'emergency')
        .required()
        .messages({
            'any.only': 'Type must be one of: car, charging_station, user, emergency',
            'any.required': 'Location type is required'
        }),

    coordinates: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required()
        .messages({
            'array.base': 'Coordinates must be an array',
            'array.length': 'Coordinates must contain exactly [longitude, latitude]',
            'any.required': 'Coordinates are required'
        }),

    reference: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.hex': 'Reference ID must be a valid hex string',
            'string.length': 'Reference ID must be 24 characters long',
            'any.required': 'Reference ID is required'
        }),

    address: Joi.string().optional(),
    city: Joi.string().optional(),
    isStatic: Joi.boolean().default(false)
});

const getNearbyValidation = Joi.object({
    type: Joi.string()
        .valid('car', 'charging_station', 'user', 'emergency')
        .required(),

    longitude: Joi.number().required(),
    latitude: Joi.number().required(),

    distance: Joi.number().default(5000) 
});

module.exports = {
    updateLocationValidation,
    getNearbyValidation
};
