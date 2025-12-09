const mongoose = require('mongoose');

const StepDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  steps: {
    type: Number,
    required: true,
    default: 0
  },
  source: {
    type: String,
    enum: ['GOOGLE_FIT', 'MANUAL_ENTRY', 'HEALTHKIT', 'HEALTH_CONNECT'],
    required: true
  }
}, { timestamps: true });

// Index for efficient querying
StepDataSchema.index({ userId: 1, date: 1 });

const StepData = mongoose.model('StepData', StepDataSchema);

module.exports = StepData;