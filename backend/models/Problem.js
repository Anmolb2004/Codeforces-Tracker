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
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  solvedCount: {
    type: Number,
    default: 0
  },
  solvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
problemSchema.index({ contestId: 1, index: 1 }, { unique: true });

module.exports = mongoose.model('Problem', problemSchema);