// models/Grade.js
const mongoose = require("mongoose");

const termGradeSchema = mongoose.Schema(
  {
    term: {
      type: String,
      enum: ["First", "Second", "Third", "Final"],
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    mark: {
      type: Number,
      required: true
    },
    remarks: {
      type: String,
    },
  },
  {
    _id: false, // This prevents Mongoose from creating an `_id` for each term object
  }
);

const gradeSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    termGrades: [termGradeSchema],
  },
  {
    timestamps: true,
  }
);

const Grade = mongoose.model("Grade", gradeSchema);

module.exports = Grade;
