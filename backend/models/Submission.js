const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submissionId: {
    type: Number,
    required: true,
    unique: true
  },
  contestId: {
    type: Number,
    required: true,
    index: true
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
    index: true
  },
  problemTags: [{
    type: String
  }],
  cfHandle: {
    type: String,
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  verdict: {
    type: String,
    required: true,
    index: true
  },
  programmingLanguage: {
    type: String,
    required: true
  },
  submissionTimeSeconds: {
    type: Number,
    required: true,
    index: true
  },
  ratingChange: {
    type: Number
  },
  rank: {
    type: Number
  },
  totalProblems: {
    type: Number,
    default: null
  },
  contestName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

submissionSchema.index({ cfHandle: 1, submissionTimeSeconds: -1 });
submissionSchema.index({ cfHandle: 1, verdict: 1 });

module.exports = mongoose.model('Submission', submissionSchema);