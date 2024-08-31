const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
  taskContent: { type: String, required: true },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  status: {
    type: String,
    enum: ["Completed", "In Progress"],
    default: "In Progress",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
