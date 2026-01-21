const Joi = require('joi');

const createTimesheetSchema = Joi.object({
  workDate: Joi.date().iso().max('now').required(), // Timesheet date cannot be in the future
  hours: Joi.number().min(0.1).max(24).required(), // Hours must be > 0 and reasonable daily limit (max 24)
  remarks: Joi.string().allow('').optional(),
  taskId: Joi.number().integer().min(1).required(),
  userId: Joi.number().integer().min(1).required(),
});

const updateTimesheetSchema = Joi.object({
  workDate: Joi.date().iso().max('now').optional(),
  hours: Joi.number().min(0.1).max(24).optional(),
  remarks: Joi.string().allow('').optional(),
  taskId: Joi.number().integer().min(1).optional(),
  userId: Joi.number().integer().min(1).optional(),
}).min(1);

module.exports = { createTimesheetSchema, updateTimesheetSchema };
