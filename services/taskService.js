const db = require('../models');
const { Op } = require('sequelize');

const createTask = async (taskData) => {
  const project = await db.Project.findByPk(taskData.projectId);
  if (!project) {
    throw new Error('Project not found.');
  }

  const task = await db.Task.create(taskData);
  return task;
};

const getTaskById = async (id) => {
  const task = await db.Task.findByPk(id, {
    include: [
      {
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name', 'status'],
      },
      {
        model: db.User,
        as: 'assignedUser',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });
  if (!task) {
    throw new Error('Task not found.');
  }
  return task;
};

const getAllTasks = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { title, status, projectId, assignedTo } = filters;

  const where = {};
  if (title) where.title = { [Op.iLike]: `%${title}%` };
  if (status) where.status = status;
  if (projectId) where.projectId = projectId;
  if (assignedTo) where.assignedTo = assignedTo;

  // Role-based filtering
  if (userRole === 'EMPLOYEE') {
    where.assignedTo = userId;
  } else if (userRole === 'MANAGER') {
    // Managers can view tasks for projects they manage
    const managedProjects = await db.Project.findAll({ where: { managerId: userId }, attributes: ['id'] });
    const managedProjectIds = managedProjects.map((p) => p.id);
    if (managedProjectIds.length === 0) {
      return { tasks: [], totalItems: 0, currentPage: page, totalPages: 0 };
    }
    where.projectId = { [Op.in]: managedProjectIds };
  }

  const { count, rows: tasks } = await db.Task.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name', 'status'],
      },
      {
        model: db.User,
        as: 'assignedUser',
        attributes: ['id', 'name', 'email'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return {
    tasks,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const updateTask = async (id, updateData, currentUser) => {
  const task = await db.Task.findByPk(id);
  if (!task) {
    throw new Error('Task not found.');
  }

  // Status transition control
  if (updateData.status) {
    const validTransitions = {
      TODO: ['IN_PROGRESS', 'DONE'],
      IN_PROGRESS: ['DONE', 'TODO'],
      DONE: [], // Cannot transition from DONE, unless perhaps a re-open by admin
    };

    if (!validTransitions[task.status] || !validTransitions[task.status].includes(updateData.status)) {
      throw new Error(`Invalid status transition from ${task.status} to ${updateData.status}.`);
    }
  }

  // Check for employee updating their own task status
  if (currentUser.role === 'EMPLOYEE') {
    if (task.assignedTo === currentUser.id) {
      // Allow only status update for assigned employee
      if (updateData.status && Object.keys(updateData).length === 1) {
        // Status transition control is already handled above (lines 92-101)
        await task.update({ status: updateData.status });
        return task; // Return immediately after successful employee update
      } else {
        throw new Error('Forbidden: Employees can only update the status of their assigned tasks.');
      }
    } else {
      throw new Error('Forbidden: You can only update tasks assigned to you.');
    }
  } else { // This block handles Admin and Manager roles
    const project = await db.Project.findByPk(task.projectId);
    if (!project) {
      throw new Error('Project not found for this task.');
    }

    // Managers can only update tasks for projects they manage
    if (currentUser.role === 'MANAGER' && project.managerId !== currentUser.id) {
      throw new Error('Forbidden: You can only update tasks for projects you manage.');
    }
    // Admins have full access. Managers have access to their projects' tasks.
    // Proceed with update for Admin and authorized Manager
  }


  await task.update(updateData);
  return task;
};

const assignTaskToEmployee = async (taskId, employeeId, managerId, userRole) => {
  const task = await db.Task.findByPk(taskId);
  if (!task) {
    throw new Error('Task not found.');
  }

  const project = await db.Project.findByPk(task.projectId);
  if (!project) {
    throw new Error('Project not found for this task.');
  }

  if (userRole === 'MANAGER' && project.managerId !== managerId) {
    throw new Error('Forbidden: You can only assign tasks for projects you manage.');
  }

  const employee = await db.User.findByPk(employeeId);
  if (!employee || employee.role !== 'EMPLOYEE') {
    throw new Error('Employee not found or user is not an employee.');
  }

  await task.update({ assignedTo: employeeId });
  return task;
};

module.exports = { createTask, getTaskById, getAllTasks, updateTask, assignTaskToEmployee };
