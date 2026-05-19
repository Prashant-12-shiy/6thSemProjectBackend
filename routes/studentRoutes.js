// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {getMyDetails, getGrades, getAttendance, getCourses,getTask } = require('../controllers/student.controller');
const {
  getMyFeeSummary,
  initiateEsewaPayment,
  confirmEsewaPayment,
  markEsewaPaymentFailed,
} = require('../controllers/fee.controller');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply middleware to protect routes and restrict access to Students only
router.use(protect);
router.use(authorize('Student'));

// Student specific routes
router.get("/getMyDetails", getMyDetails)
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/courses', getCourses);
router.get('/getTask', getTask)
router.get('/fees', getMyFeeSummary);
router.post('/fees/esewa/initiate', initiateEsewaPayment);
router.post('/fees/esewa/confirm', confirmEsewaPayment);
router.post('/fees/esewa/failure', markEsewaPaymentFailed);
// Additional Student routes can be added here...

module.exports = router;
