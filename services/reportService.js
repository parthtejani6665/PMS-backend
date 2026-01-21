const db = require('../models');
const { Op } = require('sequelize');

const getTotalHoursWorkedByEmployee = async (employeeId, startDate, endDate) => {
  const where = { userId: employeeId };
  if (startDate && endDate) {
    where.workDate = { [Op.between]: [startDate, endDate] };
  }

  const totalHoursResult = await db.Timesheet.sum('hours', { where });
  return totalHoursResult || 0;
};

const getTotalHoursSpentOnTask = async (taskId, startDate, endDate) => {
  const where = { taskId: taskId };
  if (startDate && endDate) {
    where.workDate = { [Op.between]: [startDate, endDate] };
  }

  const totalHoursResult = await db.Timesheet.sum('hours', { where });
  return totalHoursResult || 0;
};

const getTotalProjectEffort = async (projectId, startDate, endDate) => {
  const where = {};
  if (startDate && endDate) {
    where.workDate = { [Op.between]: [startDate, endDate] };
  }

  const totalHoursResult = await db.Timesheet.sum('hours', {
    where,
    include: [{
      model: db.Task,
      as: 'task',
      where: { projectId: projectId },
      attributes: [],
    }],
  });
  return totalHoursResult || 0;
};

const getProjectCost = async (projectId, startDate, endDate) => {
  const where = {};
  if (startDate && endDate) {
    where.workDate = { [Op.between]: [startDate, endDate] };
  }

  const projectCostResult = await db.Timesheet.findAll({
    where,
    attributes: [
      [db.sequelize.fn('SUM', db.sequelize.literal('"Timesheet"."hours" * "user"."hourlyRate"')), 'totalCost'],
    ],
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: [],
      },
      {
        model: db.Task,
        as: 'task',
        where: { projectId: projectId },
        attributes: [],
      },
    ],
    raw: true,
  });

  return parseFloat(projectCostResult[0].totalCost) || 0;
};

const getBudgetUsageTracking = async (projectId, startDate, endDate) => {
  const project = await db.Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found.');
  }

  const totalCost = await getProjectCost(projectId, startDate, endDate);
  const budget = parseFloat(project.budget);
  const budgetRemaining = budget - totalCost;
  const budgetPercentageUsed = (totalCost / budget) * 100;

  return {
    projectId: project.id,
    projectName: project.name,
    budget: budget,
    totalCost: totalCost,
    budgetRemaining: budgetRemaining,
    budgetPercentageUsed: isNaN(budgetPercentageUsed) ? 0 : budgetPercentageUsed,
  };
};

const getProjectProfitLoss = async (projectId, revenue, startDate, endDate) => {
  const projectCost = await getProjectCost(projectId, startDate, endDate);
  const profitLoss = revenue - projectCost;

  return {
    projectId,
    revenue,
    projectCost,
    profitLoss,
  };
};

const getProjectCostReport = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { startDate, endDate } = filters;

  const projectWhere = {};
  if (userRole === 'MANAGER') {
    projectWhere.managerId = userId;
  }

  const { count, rows: projects } = await db.Project.findAndCountAll({
    where: projectWhere,
    attributes: ['id', 'name', 'budget'],
    limit,
    offset,
  });

  const reportData = [];
  for (const project of projects) {
    const totalCost = await getProjectCost(project.id, startDate, endDate);
    reportData.push({
      projectId: project.id,
      projectName: project.name,
      budget: parseFloat(project.budget),
      totalCost: totalCost,
      profitOrLoss: parseFloat(project.budget) - totalCost,
    });
  }

  return {
    reports: reportData,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const getEmployeeWorkHourReport = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { startDate, endDate, employeeId } = filters;

  const userWhere = {};
  if (employeeId) userWhere.id = employeeId;
  if (userRole === 'EMPLOYEE') {
    userWhere.id = userId;
  }

  const { count, rows: employees } = await db.User.findAndCountAll({
    where: userWhere,
    attributes: ['id', 'name', 'email', 'hourlyRate'],
    limit,
    offset,
  });

  const reportData = [];
  for (const employee of employees) {
    const totalHours = await getTotalHoursWorkedByEmployee(employee.id, startDate, endDate);
    reportData.push({
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      totalHoursWorked: totalHours,
      costToCompany: totalHours * parseFloat(employee.hourlyRate),
    });
  }

  return {
    reports: reportData,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const getTaskCompletionReport = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { status, projectId, assignedTo, startDate, endDate } = filters;
  const projectIdNum = Number.isFinite(Number(projectId)) ? Number(projectId) : undefined;
  const assignedToNum = Number.isFinite(Number(assignedTo)) ? Number(assignedTo) : undefined;

  const taskWhere = {};
  if (status) taskWhere.status = status;
  if (Number.isInteger(projectIdNum)) taskWhere.projectId = projectIdNum;
  if (Number.isInteger(assignedToNum)) taskWhere.assignedTo = assignedToNum;

  if (userRole === 'EMPLOYEE') {
    taskWhere.assignedTo = userId;
  } else if (userRole === 'MANAGER') {
    const managedProjects = await db.Project.findAll({ where: { managerId: userId }, attributes: ['id'] });
    const managedProjectIds = managedProjects.map((p) => p.id);
    if (managedProjectIds.length === 0) {
      return { reports: [], totalItems: 0, currentPage: page, totalPages: 0 };
    }
    taskWhere.projectId = { [Op.in]: managedProjectIds };
  }

  const { count, rows: tasks } = await db.Task.findAndCountAll({
    where: taskWhere,
    attributes: ['id', 'title', 'status', 'estimatedHours'],
    include: [
      {
        model: db.Project,
        as: 'project',
        attributes: ['id', 'name'],
      },
      {
        model: db.User,
        as: 'assignedUser',
        attributes: ['id', 'name'],
      },
    ],
    limit,
    offset,
  });

  const reportData = [];
  for (const task of tasks) {
    const totalHoursSpent = await getTotalHoursSpentOnTask(task.id, startDate, endDate);
    reportData.push({
      taskId: task.id,
      taskTitle: task.title,
      project: task.project ? task.project.name : 'N/A',
      assignedTo: task.assignedUser ? task.assignedUser.name : 'N/A',
      status: task.status,
      estimatedHours: parseFloat(task.estimatedHours),
      actualHoursSpent: totalHoursSpent,
      completionPercentage: task.estimatedHours > 0 ? (totalHoursSpent / parseFloat(task.estimatedHours)) * 100 : 0,
    });
  }

  return {
    reports: reportData,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const getMonthlySummaryReport = async (page = 1, limit = 10, filters = {}, userId, userRole) => {
  const offset = (page - 1) * limit;
  const { year, month } = filters; // month is 1-indexed

  if (!year || !month) {
    throw new Error('Year and month are required for the monthly summary report.');
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const timesheetWhere = {
    workDate: { [Op.between]: [startOfMonth, endOfMonth] },
  };

  if (userRole === 'EMPLOYEE') {
    timesheetWhere.userId = userId;
  } else if (userRole === 'MANAGER') {
    const managedProjects = await db.Project.findAll({ where: { managerId: userId }, attributes: ['id'] });
    const managedProjectIds = managedProjects.map((p) => p.id);
    if (managedProjectIds.length === 0) {
      return { reports: [], totalItems: 0, currentPage: page, totalPages: 0 };
    }
    // This will filter timesheets based on tasks belonging to managed projects
    timesheetWhere['$Task.projectId$'] = { [Op.in]: managedProjectIds };
  }

  const { count, rows: monthlySummaries } = await db.Timesheet.findAndCountAll({
    where: timesheetWhere,
    attributes: [
      'userId',
      [db.sequelize.fn('SUM', db.sequelize.col('hours')), 'totalHours'],
    ],
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['name', 'email', 'hourlyRate'],
      },
      {
        model: db.Task,
        as: 'task',
        attributes: ['id', 'title'],
        required: true, // INNER JOIN to filter by task conditions
      },
    ],
    group: ['userId', 'user.id', 'user.name', 'user.email', 'user.hourlyRate'],
    raw: true,
    limit,
    offset,
  });

  const reportData = monthlySummaries.map(summary => ({
    employeeId: summary.userId,
    employeeName: summary['user.name'],
    employeeEmail: summary['user.email'],
    totalHoursWorked: parseFloat(summary.totalHours),
    costToCompany: parseFloat(summary.totalHours) * parseFloat(summary['user.hourlyRate']),
    month: `${year}-${month.toString().padStart(2, '0')}`,
  }));

  return {
    reports: reportData,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

module.exports = {
  getTotalHoursWorkedByEmployee,
  getTotalHoursSpentOnTask,
  getTotalProjectEffort,
  getProjectCost,
  getBudgetUsageTracking,
  getProjectProfitLoss,
  getProjectCostReport,
  getEmployeeWorkHourReport,
  getTaskCompletionReport,
  getMonthlySummaryReport,
};
