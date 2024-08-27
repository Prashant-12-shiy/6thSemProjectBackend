// models/Exam.js
const mongoose = require('mongoose');

const examSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
