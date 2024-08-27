// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            default: 'Present',
        },
    },
    {
        timestamps: true,
    }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
