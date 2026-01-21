const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { getProjectCostReport, getEmployeeWorkHourReport, getTaskCompletionReport, getMonthlySummaryReport } = require('../controllers/reportController');

const router = express.Router();

// Admin can view all reports
// Managers can view reports for projects they manage
// Employees can view reports related to their own work/tasks (handled by service logic)

router.get('/project-cost', auth, authorize(['ADMIN', 'MANAGER']), getProjectCostReport);
router.get('/employee-work-hour', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), getEmployeeWorkHourReport);
router.get('/task-completion', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), getTaskCompletionReport);
router.get('/monthly-summary', auth, authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), getMonthlySummaryReport);

module.exports = router;
