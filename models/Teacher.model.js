// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        classInCharge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
    },
    {
        timestamps: true,
    }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
