const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { createTimesheet, getTimesheetById, getAllTimesheets, updateTimesheet, deleteTimesheet } = require('../controllers/timesheetController');

const router = express.Router();

// Employee, Manager, Admin can create their own timesheets for assigned tasks
router.post('/', auth, authorize(['EMPLOYEE', 'MANAGER', 'ADMIN']), createTimesheet);

// Employee can view their own timesheets
// Manager can view timesheets for projects they manage
// Admin can view all timesheets
router.get('/', auth, authorize(['EMPLOYEE', 'MANAGER', 'ADMIN']), getAllTimesheets);
router.get('/:id', auth, authorize(['EMPLOYEE', 'MANAGER', 'ADMIN']), getTimesheetById);

// Employee can update their own timesheets
// Admin can update any timesheet
router.put('/:id', auth, authorize(['EMPLOYEE', 'ADMIN']), updateTimesheet);

// Employee can delete their own timesheets
// Admin can delete any timesheet
router.delete('/:id', auth, authorize(['EMPLOYEE', 'ADMIN']), deleteTimesheet);

module.exports = router;
