const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submissionId: {
    type: Number,
    required: true,
    unique: true
  },
  contestId: {
    type: Number,
    required: true
  },
  problemIndex: {
    type: String,
    required: true
  },
  problemName: {
    type: String,
    required: true
  },
  problemRating: {
    type: Number,
    default: null
  },
  cfHandle: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true
  },
  programmingLanguage: {
    type: String,
    required: true
  },
  submissionTimeSeconds: {
    type: Number,
    required: true
  },
  ratingChange: {
    type: Number,
    default: null
  },
  rank: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

submissionSchema.index({ cfHandle: 1, submissionTimeSeconds: -1 });

module.exports = mongoose.model('Submission', submissionSchema);