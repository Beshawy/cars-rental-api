const Joi = require('joi');

const createAdminValidation = Joi.object({
    userId: Joi.string().required().messages({
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required'
    }),
    role: Joi.string().valid('admin', 'manager').default('admin').required().messages({
        'any.only': 'Role must be either admin or manager',
        'any.required': 'Role is required'
    })
});

module.exports = { createAdminValidation };