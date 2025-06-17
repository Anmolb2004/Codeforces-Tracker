const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  cfHandle: {
    type: String,
    required: true
  },
  emailType: {
    type: String,
    enum: ['inactivity_reminder'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);
