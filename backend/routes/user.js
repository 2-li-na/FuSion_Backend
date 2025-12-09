const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, email, department, gender } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User registration failed: User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate required fields
    if (!username || !password || !email || !department || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      department,
      gender,
    });

    await newUser.save();
    console.log('User registered successfully:', newUser.username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the request is using username or email
    const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
    if (!user) {
      console.log('Login failed: Invalid username or email');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use environment variable for JWT secret
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful:', { username: user.username, email: user.email });

    res.json({ token, username: user.username, email: user.email });
  } catch (error) {
    console.log('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const { username } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Get profile Picture
router.get('/profile-picture/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({ profilePicture: user.profilePicture || '' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department statistics
router.get('/department-stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const departmentMap = {
      'Angewandte Informatik': 'AI',
      'Elektrotechnik und Informationstechnik': 'ET', 
      'Gesundheitswissenschaften': 'GW',
      'Lebensmitteltechnologie': 'LT',
      'Oecotrophologie': 'OE',
      'Sozial- und Kulturwissenschaften': 'SK',
      'Sozialwesen': 'SW',
      'Wirtschaft': 'W',
      'Verwaltung': 'V'
    };

    const result = {};
    
    // Initialize all departments with 0
    Object.values(departmentMap).forEach(abbrev => {
      result[abbrev] = 0;
    });

    // Fill in actual counts
    stats.forEach(stat => {
      const abbrev = departmentMap[stat._id];
      if (abbrev) {
        result[abbrev] = stat.count;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Send Reset Email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Use environment variables for email credentials
    const transporter = nodemailer.createTransporter({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: 'password-reset@example.com',
      subject: 'Password Reset Request',
      text: `You requested to reset your password. Please click the following link to reset your password: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error sending email' });
      }

      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Altes Passwort ist falsch' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user._id;

    // Delete all user-related data
    await Promise.all([
      User.deleteOne({ _id: userId }),
      StepData.deleteMany({ userId: userId }),
      UserPoints.deleteMany({ userId: userId }),
      // Add RewardRedemption if model exists
      // RewardRedemption.deleteMany({ userId: userId }),
    ]);

    res.status(200).json({ message: 'Account erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;