const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').default('EMPLOYEE'),
  hourlyRate: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
