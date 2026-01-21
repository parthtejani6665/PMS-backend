const db = require('../models');
const { Op } = require('sequelize');

const createProject = async (projectData) => {
  const project = await db.Project.create(projectData);
  return project;
};

const getProjectById = async (id) => {
  const project = await db.Project.findByPk(id, {
    include: [{
      model: db.User,
      as: 'manager',
      attributes: ['id', 'name', 'email'],
    }],
  });
  if (!project) {
    throw new Error('Project not found.');
  }
  return project;
};

const getAllProjects = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { name, status, managerId } = filters;

  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (status) where.status = status;
  if (managerId) where.managerId = managerId;

  // Role-based filtering
  if (userRole === 'MANAGER') {
    where.managerId = userId;
  } else if (userRole === 'EMPLOYEE') {
    // Employees can only view tasks assigned to them, not projects directly
    // This will be handled in task listing, or if an employee is also a manager of some projects
    // For now, employees cannot list all projects directly unless they are managers.
    // Or perhaps they can see projects they are assigned tasks to. This requires joining with Task model.
    // For simplicity, for now, if an employee is not a manager, they can't list projects through this endpoint
    if (!where.managerId) {
      return { projects: [], totalItems: 0, currentPage: page, totalPages: 0 };
    }
  }

  const { count, rows: projects } = await db.Project.findAndCountAll({
    where,
    limit,
    offset,
    include: [{
      model: db.User,
      as: 'manager',
      attributes: ['id', 'name', 'email'],
    }],
    order: [['createdAt', 'DESC']],
  });

  return {
    projects,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const updateProject = async (id, updateData) => {
  const project = await db.Project.findByPk(id);
  if (!project) {
    throw new Error('Project not found.');
  }
  await project.update(updateData);
  return project;
};

const assignManagerToProject = async (projectId, managerId) => {
  const project = await db.Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found.');
  }
  const manager = await db.User.findByPk(managerId);
  if (!manager || manager.role !== 'MANAGER') {
    throw new Error('Manager not found or user is not a manager.');
  }

  await project.update({ managerId });
  return project;
};

module.exports = { createProject, getProjectById, getAllProjects, updateProject, assignManagerToProject };
