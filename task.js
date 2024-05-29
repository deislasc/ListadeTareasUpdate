// task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: String,
  completed: Boolean,
  startDate: Date,
  endDate: Date
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
