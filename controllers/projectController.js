const projectService = require('../services/projectService');
const { createProjectSchema, updateProjectSchema, assignManagerSchema } = require('../validations/projectValidation');

const createProject = async (req, res, next) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const project = await projectService.createProject(value);
    res.status(201).json({ message: 'Project created successfully.', project });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const { page, limit, name, status, managerId } = req.query;
    const filters = { name, status, managerId };
    const { projects, totalItems, currentPage, totalPages } = await projectService.getAllProjects(
      parseInt(page),
      parseInt(limit),
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      projects,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const project = await projectService.updateProject(req.params.id, value);
    res.status(200).json({ message: 'Project updated successfully.', project });
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const { error, value } = assignManagerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const project = await projectService.assignManagerToProject(req.params.id, value.managerId);
    res.status(200).json({ message: 'Manager assigned to project successfully.', project });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjectById, getAllProjects, updateProject, assignManager };
