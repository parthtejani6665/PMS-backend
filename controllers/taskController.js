const db = require('../models');
const taskService = require('../services/taskService');
const { createTaskSchema, updateTaskSchema } = require('../validations/taskValidation');

const createTask = async (req, res, next) => {
  try {
    // Managers can only create tasks for projects they manage
    if (req.user.role === 'MANAGER') {
      const project = await db.Project.findByPk(req.body.projectId);
      if (!project || project.managerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only create tasks for projects you manage.' });
      }
    }

    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const task = await taskService.createTask(value);
    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    // Role-based access control for viewing a single task
    if (req.user.role === 'EMPLOYEE' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view tasks assigned to you.' });
    }

    if (req.user.role === 'MANAGER') {
      const project = await db.Project.findByPk(task.projectId);
      if (!project || project.managerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only view tasks for projects you manage.' });
      }
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { page, limit, title, status, projectId, assignedTo } = req.query;
    const filters = { title, status, projectId, assignedTo };

    const { tasks, totalItems, currentPage, totalPages } = await taskService.getAllTasks(
      parseInt(page),
      parseInt(limit),
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      tasks,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const task = await taskService.updateTask(req.params.id, value, req.user);
    res.status(200).json({ message: 'Task updated successfully.', task });
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const task = await taskService.assignTaskToEmployee(req.params.id, employeeId, req.user.id, req.user.role);
    res.status(200).json({ message: 'Task assigned successfully.', task });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTaskById, getAllTasks, updateTask, assignTask };
