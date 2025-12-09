const mongoose = require('mongoose');

const UserPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  averageSteps: {
    type: Number,
    required: true,
    default: 0
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 0
  },
  remainingPoints: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Index for efficient querying
UserPointsSchema.index({ userId: 1, weekStartDate: 1 });

const UserPoints = mongoose.model('UserPoints', UserPointsSchema);

module.exports = UserPoints;