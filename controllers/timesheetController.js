const timesheetService = require('../services/timesheetService');
const { createTimesheetSchema, updateTimesheetSchema } = require('../validations/timesheetValidation');

const createTimesheet = async (req, res, next) => {
  try {
    const { error, value } = createTimesheetSchema.validate({ ...req.body, userId: req.user.id });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const timesheet = await timesheetService.createTimesheet(value, req.user.id);
    res.status(201).json({ message: 'Timesheet created successfully.', timesheet });
  } catch (error) {
    next(error);
  }
};

const getTimesheetById = async (req, res, next) => {
  try {
    const timesheet = await timesheetService.getTimesheetById(req.params.id);

    // Role-based access control for viewing a single timesheet
    if (req.user.role === 'EMPLOYEE' && timesheet.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own timesheets.' });
    }
    if (req.user.role === 'MANAGER') {
      const project = await db.Project.findByPk(timesheet.task.projectId);
      if (!project || project.managerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only view timesheets for projects you manage.' });
      }
    }
    res.status(200).json(timesheet);
  } catch (error) {
    next(error);
  }
};

const getAllTimesheets = async (req, res, next) => {
  try {
    const { page, limit, workDate, taskId, projectId, employeeId } = req.query;
    const filters = { workDate, taskId, projectId, employeeId };

    const { timesheets, totalItems, currentPage, totalPages } = await timesheetService.getAllTimesheets(
      parseInt(page),
      parseInt(limit),
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      timesheets,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const updateTimesheet = async (req, res, next) => {
  try {
    const { error, value } = updateTimesheetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const timesheet = await timesheetService.updateTimesheet(req.params.id, value, req.user);
    res.status(200).json({ message: 'Timesheet updated successfully.', timesheet });
  } catch (error) {
    next(error);
  }
};

const deleteTimesheet = async (req, res, next) => {
  try {
    const result = await timesheetService.deleteTimesheet(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTimesheet, getTimesheetById, getAllTimesheets, updateTimesheet, deleteTimesheet };
