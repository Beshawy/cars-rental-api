const Joi = require('joi');

exports.getReportsSchema = Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
    status: Joi.string(),
    paymentMethod: Joi.string().valid('card', 'paypal')
});
