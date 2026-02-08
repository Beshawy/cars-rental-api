const Joi = require('joi');

exports.createPaymentSchema = Joi.object({
  reservationId: Joi.string().required(),
});

exports.capturePaymentSchema = Joi.object({
  orderID: Joi.string().required(),
  reservationId: Joi.string().required(),
  userId: Joi.string().required(),
});