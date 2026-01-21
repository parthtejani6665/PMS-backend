const db = require('../models');
const { Op } = require('sequelize');

const createTimesheet = async (timesheetData, userId) => {
  const { workDate, hours, taskId } = timesheetData;

  // Rule: Only active users can create timesheets (checked by auth middleware)

  // Rule: User can log time only for tasks assigned to them
  const task = await db.Task.findByPk(taskId, {
    include: [{
      model: db.Project,
      as: 'project',
      attributes: ['id', 'status'],
    }],
  });

  if (!task) {
    throw new Error('Task not found.');
  }
  if (task.assignedTo !== userId) {
    throw new Error('Forbidden: You can only log time for tasks assigned to you.');
  }

  // Rule: Task must belong to an active project
  if (!task.project || task.project.status !== 'ONGOING') {
    throw new Error('Cannot log time for a task in an inactive or non-existent project.');
  }

  // Rule: Prevent duplicate entry for same task + same date
  const existingTimesheet = await db.Timesheet.findOne({
    where: {
      userId,
      taskId,
      workDate,
    },
  });
  if (existingTimesheet) {
    throw new Error('Duplicate entry: Timesheet already exists for this task and date.');
  }

  const timesheet = await db.Timesheet.create({ ...timesheetData, userId });
  return timesheet;
};

const getTimesheetById = async (id) => {
  const timesheet = await db.Timesheet.findByPk(id, {
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: db.Task,
        as: 'task',
        attributes: ['id', 'title'],
        include: [{
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name'],
        }],
      },
    ],
  });
  if (!timesheet) {
    throw new Error('Timesheet not found.');
  }
  return timesheet;
};

const getAllTimesheets = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { workDate } = filters;
  const taskId = Number.isFinite(Number(filters.taskId)) ? Number(filters.taskId) : undefined;
  const projectId = Number.isFinite(Number(filters.projectId)) ? Number(filters.projectId) : undefined;
  const employeeId = Number.isFinite(Number(filters.employeeId)) ? Number(filters.employeeId) : undefined;

  const where = {};
  if (workDate) where.workDate = workDate;
  if (Number.isInteger(taskId)) where.taskId = taskId;
  if (Number.isInteger(employeeId)) where.userId = employeeId;

  const include = [
    {
      model: db.User,
      as: 'user',
      attributes: ['id', 'name', 'email', 'role'],
    },
    {
      model: db.Task,
      as: 'task',
      attributes: ['id', 'title'],
      include: [{
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name', 'managerId'],
      }],
    },
  ];

  // Role-based filtering
  if (userRole === 'EMPLOYEE') {
    where.userId = userId;
  } else if (userRole === 'MANAGER') {
    const managedProjects = await db.Project.findAll({ where: { managerId: userId }, attributes: ['id'] });
    const managedProjectIds = managedProjects.map((p) => p.id);
    if (managedProjectIds.length === 0) {
      return { timesheets: [], totalItems: 0, currentPage: page, totalPages: 0 };
    }
    // Filter by tasks belonging to managed projects
    include[1].where = { projectId: { [Op.in]: managedProjectIds } };
  }

  // If projectId filter is provided, ensure it's respected along with RBAC
  if (Number.isInteger(projectId)) {
    if (include[1].where) {
      include[1].where.projectId = projectId;
    } else {
      include[1].where = { projectId };
    }
  }

  const { count, rows: timesheets } = await db.Timesheet.findAndCountAll({
    where,
    limit,
    offset,
    include,
    order: [['workDate', 'DESC']],
  });

  return {
    timesheets,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const updateTimesheet = async (id, updateData, currentUser) => {
  const timesheet = await db.Timesheet.findByPk(id);
  if (!timesheet) {
    throw new Error('Timesheet not found.');
  }

  // Permission check: Only the owner or an Admin can update
  if (timesheet.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    throw new Error('Forbidden: You do not have permission to update this timesheet.');
  }

  // Rule: Timesheet date cannot be in the future (checked by validation)
  // Rule: Hours must be > 0 (checked by validation)

  await timesheet.update(updateData);
  return timesheet;
};

const deleteTimesheet = async (id, currentUser) => {
  const timesheet = await db.Timesheet.findByPk(id);
  if (!timesheet) {
    throw new Error('Timesheet not found.');
  }

  // Permission check: Only the owner or an Admin can delete
  if (timesheet.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    throw new Error('Forbidden: You do not have permission to delete this timesheet.');
  }

  await timesheet.destroy();
  return { message: 'Timesheet deleted successfully.' };
};

module.exports = { createTimesheet, getTimesheetById, getAllTimesheets, updateTimesheet, deleteTimesheet };
