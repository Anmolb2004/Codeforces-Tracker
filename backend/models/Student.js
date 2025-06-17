const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cfHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: 'unrated'
  },
  lastSubmissionTime: {
    type: Date,
    default: null
  },
  totalSolved: {
    type: Number,
    default: 0
  },
  emailRemindersEnabled: {
    type: Boolean,
    default: true
  },
  lastDataSync: {
    type: Date,
    default: Date.now
  },
   phoneNumber: {
    type: String,
    trim: true,
    default: ""
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);