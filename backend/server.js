require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');  

const app = express();  
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());  
app.use(bodyParser.json());  
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fusion2024', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Routes
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

const feedbackRoute = require('./routes/feedback');
app.use('/api', feedbackRoute);

const redeemRoute = require('./routes/redeem');
app.use('/api', redeemRoute);

const stepRoutes = require('./routes/step_routes');
app.use('/api', stepRoutes);

const adminRoutes = require('./routes/admin_routes');
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});