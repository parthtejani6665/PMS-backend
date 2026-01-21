const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('').optional(),
  estimatedHours: Joi.number().min(0).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default('TODO'),
  projectId: Joi.number().integer().min(1).required(),
  assignedTo: Joi.number().integer().min(1).optional().allow(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().allow('').optional(),
  estimatedHours: Joi.number().min(0).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
  projectId: Joi.number().integer().min(1).optional(),
  assignedTo: Joi.number().integer().min(1).optional().allow(null),
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
