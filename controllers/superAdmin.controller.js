// controllers/superAdminController.js
const User = require("../models/User");
const Teacher = require("../models/Teacher.model");
const Student = require("../models/Student.model");
const Course = require("../models/Course.model");
const Class = require("../models/Class.model");

// Create a new user (Admin, Teacher, Student)
exports.createStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    rollNumber,
    className,
    guardianName,
    guardianContact,
  } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // const newUser = new User({ name, email, password, role });
    // await newUser.save();

    // if (role === "Teacher") {
    //   const teacher = new Teacher({ user: newUser._id, course });
    //   await teacher.save();
    // } else if (role === "Student") {
    //   const classDoc = await Class.findOne({ name: className });

    //   if (!classDoc) {
    //     return res.status(404).json({ message: "Class not found" });
    //   }

    const classDoc = await Class.findOne({ name: className });

    if (!classDoc) {
      return res.status(404).json({ message: "Class Not Found" });
    }

    const student = new Student({
      name: name,
      email: email,
      password: password,
      role: role,
      class: classDoc._id,
      rollNumber,
      guardianName,
      guardianContact,
    });
    await student.save();

    classDoc.students.push(student._id);
    await classDoc.save();
    // }

    res.status(201).json({ message: `Student created successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error creating Student", error });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, password, role, course, classInCharge } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const classDoc = await Class.findOne({ name: classInCharge });

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const courseDoc = await Course.findOne({ name: course });

    if (!courseDoc) {
      return res.status(404).json({ message: "Couse not found" });
    }


    const teacher = new Teacher({
      name: name,
      email: email,
      password: password,
      role: role,
      course: courseDoc._id,
      classInCharge: classDoc._id,
    });
    await teacher.save();

    classDoc.teacherInCharge.push(teacher._id);
    await classDoc.save();

    courseDoc.teacher.push(teacher._id);
    await courseDoc.save();

    res.status(201).json({ message: `Teacher created successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error creating Teacher", error });
  }
};

// Get all users
exports.getAllStudent = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await Student.find({}).populate("class", "name");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.getAllTeacher = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const teachers = await Teacher.find({})
      .populate("course", "name code")
      .populate("classInCharge", "name");

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Make sure to hash the password before saving

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

exports.updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const {
    name,
    email,
    password,
    rollNumber,
    className,
    guardianName,
    guardianContact,
  } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // console.log(student);

    let classDoc;
    if (className) {
      classDoc = await Class.findOne({ name: className });

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (password) student.password = password;
    if (rollNumber) student.rollNumber = rollNumber;
    if (classDoc) student.class = classDoc._id;
    if (guardianName) student.guardianName = guardianName;
    if (guardianContact) student.guardianContact = guardianContact;

    await student.save();

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    // console.error("Error updating student:", error);
    res
      .status(500)
      .json({
        message: "Error updating student",
        error: error.message || error,
      });
  }
};

exports.updateTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { name, email, password, courseName, classInCharge } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let classDoc;
    if (classInCharge) {
      classDoc = await Class.findOne({ name: classInCharge });

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    let course;
    if (courseName) {
      course = await Course.findOne({ name: courseName });

      if (!course) {
        return res.status(404).json({ message: "Couse not found" });
      }
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (password) teacher.password = password;
    if (classDoc) (teacher.classInCharge = classDoc), _id;
    if (course) teacher.course = course._id;

    await teacher.save();

    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    res
    .status(500)
    .json({
      message: "Error updating student",
      error: error.message || error,
    });
  }
};

exports.createCourses = async (req, res) => {
  const { courses } = req.body; // Expecting an array of course objects

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const createdCourses = [];

    for (const courseData of courses) {
      const { name, code, description, teacherName, credits, className } =
        courseData;

      // Find the teacher by name
      const user = await User.findOne({ name: teacherName });
      if (!user) {
        return res
          .status(404)
          .json({ message: `User with name ${teacherName} not found` });
      }

      const teacher = await Teacher.findOne({ user: user._id });
      if (!teacher) {
        return res
          .status(404)
          .json({ message: `Teacher ${teacherName} not found` });
      }

      // Find the class by name
      const classDetail = await Class.findOne({ name: className });
      if (!classDetail) {
        return res
          .status(404)
          .json({ message: `Class with name ${className} not found` });
      }

      // Check if the course already exists for the class
      const existingCourse = await Course.findOne({
        name,
        classes: classDetail._id,
      });
      if (existingCourse) {
        return res.status(400).json({
          message: `Course ${name} already exists in class ${className}`,
        });
      }

      // Create the course
      const course = new Course({
        name,
        code,
        description,
        teacher: teacher._id,
        credits,
        classes: classDetail._id, // Associate course with the provided class ID
      });

      await course.save();

      // Update the teacher with the new course
      await Teacher.findByIdAndUpdate(teacher._id, {
        $addToSet: { courses: course._id },
      });

      createdCourses.push(course);
    }

    res.status(201).json({
      message: "Courses created successfully",
      courses: createdCourses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating courses", error: error.message });
  }
};

exports.getAllCourse = async (req, res) => {
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const courses = await Course.find({}).populate({
      path: "teacher",
      populate: {
        path: "user",
        select: "name",
      },
    });
    res.status(200).json(courses);
  } catch (error) {}
};

exports.createClass = async (req, res) => {
  const { name, section, students, teacherName } = req.body;

  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const teacherInCharge = await Teacher.find({ name: teacherName });
    const classes = new Class({ name, section, students, teacherInCharge });
    await classes.save();

    await Teacher.findByIdAndUpdate(teacherInCharge._id, {
      classInCharge: classes._id,
    });
    res.status(201).json({ message: "Class created successfully", name });
  } catch (error) {
    res.status(500).json({ message: "Error creating class", error });
  }
};
// Other SuperAdmin-specific actions can be added here...
