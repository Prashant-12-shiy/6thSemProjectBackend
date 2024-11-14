// controllers/teacherController.js
const Class = require("../models/Class.model");
const Student = require("../models/Student.model");
const Attendance = require("../models/Attendance.model");
const Grade = require("../models/Grade.model");
const Course = require("../models/Course.model");
const Task = require("../models/Task.model")
const User = require("../models/User")
const Event = require("../models/Event.model");

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

exports.addTask = async (req,res) => {
  const {taskContent, assignedTo, status} = req.body;

  try {
    const assignedDoc = await Class.findOne({name: assignedTo}); 

    const task = new Task({
      taskContent: taskContent,
      status,
      assignedTo: assignedDoc._id,
      teacher: req.user._id
    })

    await task.save();
    res.status(201).json({message: "Task Added Successfully", task});


  } catch (error) {
    res.status(500).json({message: "Error Adding Task", error: error.message || error})
  }
} 

exports.assignedTask = async (req,res) => {
  try {
    const task = await Task.find({teacher: req.user._id}).populate('assignedTo', 'name');

    res.status(201).json({message: "Task Fetch Successfully", task});
  } catch (error) {
    res.status(500).json({message: "Error Fetching Task", error: error.message || error})
  }
}

exports.updateTask = async (req,res) => {
  const {taskId} = req.params
  const {taskContent, assignedTo, status} = req.body;
  try {

    const assignedDoc = await Class.findOne({name: assignedTo}); 


    const task = await Task.findById(taskId);

    if(taskContent) task.taskContent = taskContent;
    if(assignedTo) task.assignedTo = assignedDoc._id;
    if(status) task.status = status;

    await task.save();
    res
      .status(200)
      .json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({message: "Error Updating Task", error: error.message || error})
  }
}


exports.getEvent = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Find only upcoming events (date is in the future)
    const upcomingEvents = await Event.find({ date: { $gt: currentDate } }).sort({ date: 1 });

    return res.status(200).json(upcomingEvents);
  } catch (error) {
    console.error("Error getting events:", error); // Log for debugging
    return res.status(500).json({ message: "Error getting events", error: error.message });
  }
};

// Other Teacher(Admin)-specific actions can be added here...
