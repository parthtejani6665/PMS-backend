const reportService = require('../services/reportService');

const getProjectCostReport = async (req, res, next) => {
  try {
    const pageNum = parseInt(req.query.page, 10);
    const limitNum = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageNum) ? pageNum : 1;
    const limit = Number.isFinite(limitNum) ? limitNum : 10;
    const { startDate, endDate } = req.query;
    const filters = { startDate, endDate };
    const { reports, totalItems, currentPage, totalPages } = await reportService.getProjectCostReport(
      page,
      limit,
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      reports,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeWorkHourReport = async (req, res, next) => {
  try {
    const pageNum = parseInt(req.query.page, 10);
    const limitNum = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageNum) ? pageNum : 1;
    const limit = Number.isFinite(limitNum) ? limitNum : 10;
    const { startDate, endDate, employeeId } = req.query;
    const filters = { startDate, endDate, employeeId };
    const { reports, totalItems, currentPage, totalPages } = await reportService.getEmployeeWorkHourReport(
      page,
      limit,
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      reports,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskCompletionReport = async (req, res, next) => {
  try {
    const pageNum = parseInt(req.query.page, 10);
    const limitNum = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageNum) ? pageNum : 1;
    const limit = Number.isFinite(limitNum) ? limitNum : 10;
    const { status, projectId, assignedTo, startDate, endDate } = req.query;
    const filters = { status, projectId, assignedTo, startDate, endDate };
    const { reports, totalItems, currentPage, totalPages } = await reportService.getTaskCompletionReport(
      page,
      limit,
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      reports,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySummaryReport = async (req, res, next) => {
  try {
    const pageNum = parseInt(req.query.page, 10);
    const limitNum = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageNum) ? pageNum : 1;
    const limit = Number.isFinite(limitNum) ? limitNum : 10;
    const yearNum = parseInt(req.query.year, 10);
    const monthNum = parseInt(req.query.month, 10);
    const filters = { year: yearNum, month: monthNum };
    const { reports, totalItems, currentPage, totalPages } = await reportService.getMonthlySummaryReport(
      page,
      limit,
      filters,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      reports,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectCostReport,
  getEmployeeWorkHourReport,
  getTaskCompletionReport,
  getMonthlySummaryReport,
};
