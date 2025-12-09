const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: null  // null = unlimited
  },
  category: {
    type: String,
    default: 'General'
  }
}, { timestamps: true });

const Reward = mongoose.model('Reward', RewardSchema);

module.exports = Reward;