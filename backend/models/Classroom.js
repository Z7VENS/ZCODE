const mongoose = require('mongoose');

const subGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  grades: [{ student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, grade: Number }],
  observations: [{ student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, observation: String }],
});

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subGroups: [subGroupSchema],
  code: { type: String, default: '' },
});

module.exports = mongoose.model('Classroom', classroomSchema);