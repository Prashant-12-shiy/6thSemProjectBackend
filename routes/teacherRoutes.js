// routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const {
  getClassStudents,
  markAttendance,
  getClassAttendance,
  addGrade,
  updateGrade,
  getStudentGrade,
  addTask,
  assignedTask,
  updateTask,
  getEvent
} = require("../controllers/teacher.controller");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Apply middleware to protect routes and restrict access to Teacher/Admin roles
router.use(protect);
router.use(authorize("Teacher"));

// Teacher(Admin) specific routes
router.get("/class/:classId/students", getClassStudents);
router.post("/class/:classId/attendance", markAttendance);
router.get("/attendance/class/:classId", getClassAttendance);
router.post("/addGrade", addGrade);
router.post("/updateGrade", updateGrade);
router.get('/getStudentGrade/:studentId', getStudentGrade);
router.post('/addTask', addTask);
router.get('/assignedTask', assignedTask)
router.post('/updateTask/:taskId', updateTask)
router.get('/getEvent', getEvent)
// Additional Teacher(Admin) routes can be added here...

module.exports = router;
