const mongoose = require('mongoose');

const AppContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true  // e.g., 'faq_question_1', 'welcome_message'
  },
  category: {
    type: String,
    required: true,
    enum: ['FAQ', 'Impressum', 'Datenschutz', 'Welcome', 'General'],
    default: 'General'
  },
  translations: {
    de: {
      type: String,
      required: true
    },
    en: {
      type: String,
      default: ''
    }
  },
  description: {
    type: String,
    default: ''  // Optional admin description
  }
}, { timestamps: true });

const AppContent = mongoose.model('AppContent', AppContentSchema);

module.exports = AppContent;