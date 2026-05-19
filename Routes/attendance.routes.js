const express = require('express');
const router = express.Router();
const AttendanceController = require('../Controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize, authorizeSelfOrRoles } = require('../middleware/authorize.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All endpoints require authentication
router.use(authMiddleware);

// Employee actions: Punch (Toggle In/Out)
// Anyone logged in can punch. Logic inside controller figures out In vs Out.
router.post('/punch', AttendanceController.punch); 
  
// Get Report
// RBAC: An employee can view their own report (authorizeSelfOrRoles)
// Admin, HR, Manager can view anyone's report
router.get('/report/:userId', validationMiddleware.validateReportParams, authorizeSelfOrRoles(['Admin', 'HR', 'Manager'], 'userId'), AttendanceController.getReport);
  
// Company Daily Attendance
// RBAC: Only Admin, HR, Manager can see all employees attendance
// GET /api/attendance/company?date=2026-04-22  (date optional, default = today)
router.get('/company', authorize(['Admin', 'HR', 'Manager']), AttendanceController.getCompanyAttendance);
   
module.exports = router;
