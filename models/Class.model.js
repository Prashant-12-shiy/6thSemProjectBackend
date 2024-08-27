// models/Class.js
const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        section: {
            type: String,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
            },
        ],
        teacherInCharge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
        },
    },
    {
        timestamps: true,
    }
);

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
