// models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  contestId: {
    type: Number,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'PROGRAMMING'
  },
  rating: {
    type: Number,
    default: null
  },
  tags: [{
    type: String
  }],
  solvedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
problemSchema.index({ contestId: 1, index: 1 }, { unique: true });
problemSchema.index({ rating: 1 });
problemSchema.index({ tags: 1 });

module.exports = mongoose.model('Problem', problemSchema);