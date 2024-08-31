// controllers/teacherController.js
const Class = require("../models/Class.model");
const Student = require("../models/Student.model");
const Attendance = require("../models/Attendance.model");
const Grade = require("../models/Grade.model");
const Course = require("../models/Course.model");
const User = require("../models/User")

// Get all students in a class
exports.getClassStudents = async (req, res) => {
  const { classId } = req.params;

  try {
    const students = await Student.find({ class: classId })
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching Students", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark attendance for a class
exports.markAttendance = async (req, res) => {
  const { studentName, status, date } = req.body;

  try {
    const studentDetail = await Student.findOne({ name: studentName });
    if(!studentDetail) {
      return res.status(404).json({message: "Student Not Found"})
    }
    const studentId = studentDetail._id;

    const attendance = new Attendance({
      student: studentId,
      status,
      date,
      class: req.params.classId,
    });
    await attendance.save();
    res
      .status(201)
      .json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message || error});
  }
};

exports.getClassAttendance = async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate } = req.query; // Optional date range filter

  try {
    let query = { class: classId };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendanceRecords = await Attendance.find(query).populate("student", 'name');

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching attendance records", error });
  }
};

// Add a grade for a specific term
exports.addGrade = async (req, res) => {
    const { studentName, courseName, term, grade, remarks } = req.body;
  
    try {
     // Find the student associated with this user
     const student = await Student.findOne({ name: studentName });
 
     if (!student) {
       return res.status(400).json({ message: "Student not found" });
     }
 
      const course = await Course.findOne({ name: courseName });
  
      if (!course) {
        return res.status(400).json({ message: "course not found" });
      }

      let studentGrade = await Grade.findOne({
        student: student._id,
        course: course._id,
      });
  
      if (studentGrade) {
        // Check if the term grade already exists
        const termExists = studentGrade.termGrades.some(
          (termGrade) => termGrade.term === term
        );
  
        if (termExists) {
          return res
            .status(400)
            .json({ message: "Grade for this term already exists" });
        }
  
        // Add the new term grade
        studentGrade.termGrades.push({ term, grade, remarks });
        await studentGrade.save();
  
        res.status(201).json({ message: "Grade added successfully", studentGrade });
      } else {
        // Create a new grade document if none exists
        studentGrade = new Grade({
          student: student._id,
          course: course._id,
          termGrades: [{ term, grade, remarks }],
        });
  
        await studentGrade.save();
        res.status(201).json({ message: "Grade added successfully", studentGrade });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding grade", error });
    }
  };
  

  exports.getStudentGrade = async (req,res) => {
    const {studentId} = req.params
    try {
        const studentGrades = await Grade.find({student: studentId}).populate('student', 'name')
          .populate('course', 'name');
    

    if (!studentGrades.length ) {
        return res.status(404).json({ message: "Grade not found for the student" });
      }

      const response = studentGrades.map((grade) => ({
        _id: grade._id,
        studentName: grade.student.name,
        courseName: grade.course.name,
        termGrades: grade.termGrades,
        createdAt: grade.createdAt,
        updatedAt: grade.updatedAt,
      }));
        
      res.status(200).json({ message: "Grades retrieved successfully", grades: response });
        
    } catch (error) {
        res.status(500).json({ message: "Error retrieving student grade", error });
    }
  }

// Update grade for a specific term
exports.updateGrade = async (req, res) => {
  const { studentId, courseId, term, grade, remarks } = req.body;

  try {
    let studentGrade = await Grade.findOne({
      student: studentId,
      course: courseId,
    });

    if (!studentGrade) {
      return res
        .status(404)
        .json({ message: "Grade not found for this course" });
    }

    // Find the term grade to update
    const termGrade = studentGrade.termGrades.find(
      (termGrade) => termGrade.term === term
    );

    if (!termGrade) {
      return res.status(404).json({ message: "Term grade not found" });
    }

    // Update the term grade
    termGrade.grade = grade;
    termGrade.remarks = remarks;

    await studentGrade.save();

    res
      .status(200)
      .json({ message: "Grade updated successfully", studentGrade });
  } catch (error) {
    res.status(500).json({ message: "Error updating grade", error });
  }
};

// Other Teacher(Admin)-specific actions can be added here...
