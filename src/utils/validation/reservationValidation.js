// validations/reservation.validation.js
const Joi = require("joi");

exports.createReservationSchema = Joi.object({
  carId: Joi.string().required(),
  duration: Joi.number().positive().required(),
  durationType: Joi.string().valid("hours", "days").required()
});