const mongoose = require('mongoose');

const RewardRedemptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemTitle: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  },
  bemerkungen: {
    type: String,
    default: ''
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  redeemedBy: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  adminUsername: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Index for efficient querying
RewardRedemptionSchema.index({ userId: 1, redeemedAt: -1 });

const RewardRedemption = mongoose.model('RewardRedemption', RewardRedemptionSchema);

module.exports = RewardRedemption;