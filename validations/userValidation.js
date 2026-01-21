const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').default('EMPLOYEE'),
  hourlyRate: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').optional(),
  hourlyRate: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1); // At least one field is required for update

const activateDeactivateUserSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = { createUserSchema, updateUserSchema, activateDeactivateUserSchema };
