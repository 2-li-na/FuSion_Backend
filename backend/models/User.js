const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profilePicture: {  
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Angewandte Informatik',
      'Elektrotechnik und Informationstechnik',
      'Gesundheitswissenschaften',
      'Lebensmitteltechnologie',
      'Oecotrophologie',
      'Sozial- und Kulturwissenschaften',
      'Sozialwesen',
      'Wirtschaft',
      'Verwaltung'
    ]
  },
  gender: {
    type: String,
    required: true,
    enum: ['Männlich', 'Weiblich', 'Divers']
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;