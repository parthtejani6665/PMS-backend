const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('').optional(),
  budget: Joi.number().min(0).optional(),
  status: Joi.string().valid('ONGOING', 'COMPLETED').default('ONGOING'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow(null),
  managerId: Joi.number().integer().min(1).required(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().allow('').optional(),
  budget: Joi.number().min(0).optional(),
  status: Joi.string().valid('ONGOING', 'COMPLETED').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow(null),
  managerId: Joi.number().integer().min(1).optional(),
}).min(1);

const assignManagerSchema = Joi.object({
  managerId: Joi.number().integer().min(1).required(),
});

module.exports = { createProjectSchema, updateProjectSchema, assignManagerSchema };
