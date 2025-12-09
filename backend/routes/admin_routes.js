const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StepData = require('../models/StepData');
const UserPoints = require('../models/UserPoints');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const AppContent = require('../models/AppContent');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Admin login 
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, isAdmin: true }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('Admin login successful:', user.username);

    res.json({
      token,
      admin: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify admin token (for dashboard initialization)
router.get('/verify', adminAuth, async (req, res) => {
  res.json({
    admin: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Search users by username (for autocomplete)
router.get('/users/search/:query', adminAuth, async (req, res) => {
  try {
    const searchQuery = req.params.query;
    
    if (!searchQuery || searchQuery.length < 1) {
      return res.json([]);
    }

    // Find users whose username starts with or contains the search query
    const users = await User.find({
      username: { $regex: `^${searchQuery}`, $options: 'i' }
    })
      .select('username email _id')
      .limit(10)
      .sort({ username: 1 });

    res.json(users);

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (protected)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      total: users.length,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user by ID
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { username, email, department, gender, isAdmin } = req.body;
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (department) user.department = department;
    if (gender) user.gender = gender;
    if (typeof isAdmin !== 'undefined') user.isAdmin = isAdmin;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        department: user.department,
        gender: user.gender,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change admin password
router.put('/change-password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    req.user.password = hashedPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Point Management Routes =========================//

// Get user points history
router.get('/users/:userId/points', adminAuth, async (req, res) => {
  try {
    const pointsHistory = await UserPoints.find({ userId: req.params.userId })
      .sort({ weekStartDate: -1 });

    const totalPoints = pointsHistory.reduce((sum, record) => sum + record.remainingPoints, 0);

    res.json({
      totalPoints,
      history: pointsHistory
    });

  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add points to user manually
router.post('/users/:userId/points/add', adminAuth, async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a manual points entry
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const manualPoints = new UserPoints({
      userId: user._id,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      averageSteps: 0,
      pointsEarned: points,
      remainingPoints: points
    });

    await manualPoints.save();

    console.log(`Admin ${req.user.username} added ${points} points to ${user.username}. Reason: ${reason || 'N/A'}`);

    res.json({
      message: 'Points added successfully',
      points: points,
      username: user.username
    });

  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove points from user manually
router.post('/users/:userId/points/remove', adminAuth, async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all points records with remaining points
    const pointsRecords = await UserPoints.find({
      userId: user._id,
      remainingPoints: { $gt: 0 }
    }).sort({ weekStartDate: 1 });

    const totalAvailable = pointsRecords.reduce((sum, record) => sum + record.remainingPoints, 0);

    if (totalAvailable < points) {
      return res.status(400).json({ 
        message: 'Not enough points to remove',
        availablePoints: totalAvailable
      });
    }

    // Deduct points from oldest first
    let pointsRemaining = points;
    for (const record of pointsRecords) {
      if (pointsRemaining <= 0) break;
      
      if (record.remainingPoints <= pointsRemaining) {
        pointsRemaining -= record.remainingPoints;
        record.remainingPoints = 0;
      } else {
        record.remainingPoints -= pointsRemaining;
        pointsRemaining = 0;
      }
      await record.save();
    }

    console.log(`Admin ${req.user.username} removed ${points} points from ${user.username}. Reason: ${reason || 'N/A'}`);

    res.json({
      message: 'Points removed successfully',
      pointsRemoved: points,
      username: user.username
    });

  } catch (error) {
    console.error('Error removing points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user step history
router.get('/users/:userId/steps', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = { userId: req.params.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const steps = await StepData.find(query)
      .sort({ date: -1 })
      .limit(limit ? parseInt(limit) : 30);

    const totalSteps = steps.reduce((sum, record) => sum + record.steps, 0);

    res.json({
      totalSteps,
      recordCount: steps.length,
      steps
    });

  } catch (error) {
    console.error('Error fetching steps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overall stats
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Total steps (all time)
    const stepStats = await StepData.aggregate([
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          avgDailySteps: { $avg: '$steps' }
        }
      }
    ]);

    // Total points distributed
    const pointsStats = await UserPoints.aggregate([
      {
        $group: {
          _id: null,
          totalPointsEarned: { $sum: '$pointsEarned' },
          totalPointsRemaining: { $sum: '$remainingPoints' }
        }
      }
    ]);

    // Active users (users with steps in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await StepData.distinct('userId', {
      date: { $gte: sevenDaysAgo }
    });

    res.json({
      totalUsers,
      activeUsers: activeUsers.length,
      totalSteps: stepStats[0]?.totalSteps || 0,
      avgDailySteps: Math.round(stepStats[0]?.avgDailySteps || 0),
      totalPointsEarned: pointsStats[0]?.totalPointsEarned || 0,
      totalPointsRemaining: pointsStats[0]?.totalPointsRemaining || 0,
      pointsRedeemed: (pointsStats[0]?.totalPointsEarned || 0) - (pointsStats[0]?.totalPointsRemaining || 0)
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user count by department
router.get('/stats/departments', adminAuth, async (req, res) => {
  try {
    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          userCount: { $sum: 1 }
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]);

    res.json(departmentStats);

  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Rewards Management Routes =========================//

// Get all rewards
router.get('/rewards', adminAuth, async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ points: 1 });

    res.json({
      total: rewards.length,
      rewards
    });

  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single reward by ID
router.get('/rewards/:rewardId', adminAuth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    res.json(reward);

  } catch (error) {
    console.error('Error fetching reward:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new reward
router.post('/rewards', adminAuth, async (req, res) => {
  try {
    const { title, description, points, imageUrl, stockQuantity, category } = req.body;

    if (!title || !points) {
      return res.status(400).json({ message: 'Title and points are required' });
    }

    const reward = new Reward({
      title,
      description: description || '',
      points,
      imageUrl: imageUrl || '',
      stockQuantity: stockQuantity || null,
      category: category || 'General',
      isActive: true
    });

    await reward.save();

    console.log(`Admin ${req.user.username} created reward: ${title}`);

    res.status(201).json({
      message: 'Reward created successfully',
      reward
    });

  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reward
router.put('/rewards/:rewardId', adminAuth, async (req, res) => {
  try {
    const { title, description, points, imageUrl, isActive, stockQuantity, category } = req.body;
    
    const reward = await Reward.findById(req.params.rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Update fields
    if (title) reward.title = title;
    if (description !== undefined) reward.description = description;
    if (points !== undefined) reward.points = points;
    if (imageUrl !== undefined) reward.imageUrl = imageUrl;
    if (typeof isActive !== 'undefined') reward.isActive = isActive;
    if (stockQuantity !== undefined) reward.stockQuantity = stockQuantity;
    if (category) reward.category = category;

    await reward.save();

    console.log(`Admin ${req.user.username} updated reward: ${reward.title}`);

    res.json({
      message: 'Reward updated successfully',
      reward
    });

  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reward
router.delete('/rewards/:rewardId', adminAuth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    await Reward.findByIdAndDelete(req.params.rewardId);

    console.log(`Admin ${req.user.username} deleted reward: ${reward.title}`);

    res.json({ message: 'Reward deleted successfully' });

  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle reward active status
router.patch('/rewards/:rewardId/toggle', adminAuth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    reward.isActive = !reward.isActive;
    await reward.save();

    res.json({
      message: `Reward ${reward.isActive ? 'activated' : 'deactivated'}`,
      reward
    });

  } catch (error) {
    console.error('Error toggling reward:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Purchase History Routes =========================//

// Get user purchase history
router.get('/users/:userId/purchases', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // FETCH FROM DATABASE
    const purchases = await RewardRedemption.find({ userId: user._id })
      .sort({ redeemedAt: -1 })
      .lean();

    console.log(`Admin ${req.user.username} viewed purchase history for ${user.username} (${purchases.length} purchases)`);

    res.json(purchases);

  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Update a purchase record
router.put('/purchases/:purchaseId', adminAuth, async (req, res) => {
  try {
    const { itemName, cost, notes, date } = req.body;

    // Placeholder - adjust based on your data model
    // const purchase = await RewardRedemption.findById(req.params.purchaseId);
    
    // Update logic here
    
    console.log(`Admin ${req.user.username} updated purchase ${req.params.purchaseId}`);

    res.json({ message: 'Purchase updated successfully' });

  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Delete a purchase record
// router.delete('/purchases/:purchaseId', adminAuth, async (req, res) => {
//   try {
//     // Placeholder - adjust based on your data model
//     // const purchase = await RewardRedemption.findById(req.params.purchaseId);
//     // await purchase.remove();
    
//     console.log(`Admin ${req.user.username} deleted purchase ${req.params.purchaseId}`);

//     res.json({ message: 'Purchase deleted successfully' });

//   } catch (error) {
//     console.error('Error deleting purchase:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//========================= Content Management Routes =========================//

// Get all app content
router.get('/content', adminAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const content = await AppContent.find(query).sort({ category: 1, key: 1 });

    res.json({
      total: content.length,
      content
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single content by key
router.get('/content/:key', adminAuth, async (req, res) => {
  try {
    const content = await AppContent.findOne({ key: req.params.key });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);

  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new content
router.post('/content', adminAuth, async (req, res) => {
  try {
    const { key, category, translations, description } = req.body;

    if (!key || !category || !translations?.de) {
      return res.status(400).json({ message: 'Key, category, and German translation are required' });
    }

    // Check if key already exists
    const existing = await AppContent.findOne({ key });
    if (existing) {
      return res.status(400).json({ message: 'Content with this key already exists' });
    }

    const content = new AppContent({
      key,
      category,
      translations: {
        de: translations.de,
        en: translations.en || ''
      },
      description: description || ''
    });

    await content.save();

    console.log(`Admin ${req.user.username} created content: ${key}`);

    res.status(201).json({
      message: 'Content created successfully',
      content
    });

  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content
router.put('/content/:key', adminAuth, async (req, res) => {
  try {
    const { category, translations, description } = req.body;
    
    const content = await AppContent.findOne({ key: req.params.key });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update fields
    if (category) content.category = category;
    if (translations?.de) content.translations.de = translations.de;
    if (translations?.en !== undefined) content.translations.en = translations.en;
    if (description !== undefined) content.description = description;

    await content.save();

    console.log(`Admin ${req.user.username} updated content: ${content.key}`);

    res.json({
      message: 'Content updated successfully',
      content
    });

  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content
router.delete('/content/:key', adminAuth, async (req, res) => {
  try {
    const content = await AppContent.findOne({ key: req.params.key });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await AppContent.findOneAndDelete({ key: req.params.key });

    console.log(`Admin ${req.user.username} deleted content: ${content.key}`);

    res.json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get distinct content categories
router.get('/content/categories/list', adminAuth, async (req, res) => {
  try {
    const categories = await AppContent.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Bonus Redemption Route =========================//

// Admin redeems bonus for user
router.post('/bonus/redeem', adminAuth, async (req, res) => {
  try {
    const { userId, itemName, cost, notes } = req.body;

    if (!userId || !itemName || !cost) {
      return res.status(400).json({ message: 'User ID, item name, and cost are required' });
    }

    const pointsCost = parseInt(cost);
    if (isNaN(pointsCost) || pointsCost <= 0) {
      return res.status(400).json({ message: 'Invalid cost amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all points records with remaining points
    const pointsRecords = await UserPoints.find({
      userId: user._id,
      remainingPoints: { $gt: 0 }
    }).sort({ weekStartDate: 1 });

    const totalAvailable = pointsRecords.reduce((sum, record) => sum + record.remainingPoints, 0);

    if (totalAvailable < pointsCost) {
      return res.status(400).json({ 
        message: 'User does not have enough points',
        availablePoints: totalAvailable,
        requiredPoints: pointsCost
      });
    }

    // Deduct points from oldest first (FIFO)
    let pointsRemaining = pointsCost;
    for (const record of pointsRecords) {
      if (pointsRemaining <= 0) break;
      
      if (record.remainingPoints <= pointsRemaining) {
        pointsRemaining -= record.remainingPoints;
        record.remainingPoints = 0;
      } else {
        record.remainingPoints -= pointsRemaining;
        pointsRemaining = 0;
      }
      await record.save();
    }

    // save the redemption record to database
    const redemption = new RewardRedemption({
      userId: user._id,
      itemTitle: itemName,
      itemName: itemName,
      pointsRequired: pointsCost,
      cost: pointsCost,
      notes: notes || '',
      bemerkungen: notes || '',
      redeemedAt: new Date(),
      redeemedBy: 'admin',
      adminUsername: req.user.username
    });

    await redemption.save();

    console.log(`Admin ${req.user.username} redeemed bonus for user ${user.username}: ${itemName} (${pointsCost} points)`);
    if (notes) {
      console.log(`Notes: ${notes}`);
    }

    res.json({
      message: 'Bonus redeemed successfully',
      username: user.username,
      itemName,
      pointsDeducted: pointsCost,
      remainingPoints: totalAvailable - pointsCost
    });

  } catch (error) {
    console.error('Error redeeming bonus:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Purchase History Route =========================//

// // Get user purchase history
// router.get('/users/:userId/purchases', adminAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // You'll need a RewardRedemption model for this
//     // For now, we'll create a simple structure
//     // This assumes you have a collection tracking redemptions
    
//     // Placeholder - you may need to adjust based on your actual data model
//     const purchases = []; // Will be populated from your database
    
//     console.log(`Admin ${req.user.username} viewed purchase history for ${user.username}`);

//     res.json(purchases);

//   } catch (error) {
//     console.error('Error fetching purchases:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update a purchase record
router.put('/purchases/:purchaseId', adminAuth, async (req, res) => {
  try {
    const { itemName, cost, notes, date } = req.body;

    // Placeholder - adjust based on your data model
    // const purchase = await RewardRedemption.findById(req.params.purchaseId);
    
    // STH related logic here
    
    console.log(`Admin ${req.user.username} updated purchase ${req.params.purchaseId}`);

    res.json({ message: 'Purchase updated successfully' });

  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Delete a purchase record
router.delete('/purchases/:purchaseId', adminAuth, async (req, res) => {
  try {
    const purchaseId = req.params.purchaseId;
    
    // Find and delete the redemption
    const redemption = await RewardRedemption.findById(purchaseId);
    
    if (!redemption) {
      return res.status(404).json({ message: 'Redemption not found' });
    }
    
    // Delete the redemption
    await RewardRedemption.findByIdAndDelete(purchaseId);
    
    console.log(`Admin deleted purchase ${purchaseId} (${redemption.itemName})`);

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//========================= Total Steps Route =========================//

// Get total steps for a user
router.get('/users/:userId/totalsteps', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Aggregate all steps for this user
    const stepData = await StepData.find({ userId: user._id });
    const totalSteps = stepData.reduce((sum, record) => sum + record.steps, 0);

    console.log(`Fetched total steps for ${user.username}: ${totalSteps}`);

    res.json({ totalSteps });

  } catch (error) {
    console.error('Error fetching total steps:', error);
    res.status(500).json({ message: 'Server error', totalSteps: 0 });
  }
});

// Export the router
module.exports = router;