// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Teacher'],
            default: 'Teacher',
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
