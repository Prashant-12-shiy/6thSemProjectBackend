const mongoose = require('mongoose');

const NoticeSchema  = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
})

const  Notice =  mongoose.model("Notice", NoticeSchema);

module.exports = Notice;