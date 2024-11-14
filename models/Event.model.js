const mongoose = require('mongoose');

const EventSchema  = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    venue: {
        type: String,
        default: " School Auditorium",
    },
    description: {
        type: String,
        required: true,
    }
})

const  Event =  mongoose.model("Event", EventSchema);

module.exports = Event;