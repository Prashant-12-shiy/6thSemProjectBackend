// models/Timetable.js
const mongoose = require('mongoose');

const timetableSchema = mongoose.Schema(
    {
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        day: {
            type: String,
            required: true,
        },
        period: {
            type: String,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
