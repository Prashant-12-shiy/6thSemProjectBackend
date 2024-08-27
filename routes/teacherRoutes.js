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
} = require("../controllers/teacher.controller");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Apply middleware to protect routes and restrict access to Teacher/Admin roles
router.use(protect);
router.use(authorize("Admin", "Teacher"));

// Teacher(Admin) specific routes
router.get("/class/:classId/students", getClassStudents);
router.post("/class/:classId/attendance", markAttendance);
router.get("/attendance/class/:classId", getClassAttendance);
router.post("/addGrade", addGrade);
router.post("/updateGrade", updateGrade);
router.get('/getStudentGrade/:studentId', getStudentGrade)

// Additional Teacher(Admin) routes can be added here...

module.exports = router;
