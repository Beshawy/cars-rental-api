const Joi = require('joi');

const validateEmergency = (data) => {
  const schema = Joi.object({
    car: Joi.string().required(),

    type: Joi.string()
      .valid('accident', 'battery', 'breakdown', 'theft', 'medical')
      .required(),

    latitude: Joi.number().required(),
    longitude: Joi.number().required(),

    description: Joi.string().allow('')
  });

  return schema.validate(data);
};

module.exports = validateEmergency;