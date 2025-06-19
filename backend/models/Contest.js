const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  contestId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  phase: {
    type: String,
    required: true
  },
  startTimeSeconds: {
    type: Number,
    required: true
  },
  durationSeconds: {
    type: Number,
    required: true
  },
  totalProblems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contest', contestSchema);