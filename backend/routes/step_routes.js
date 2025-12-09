const express = require('express');
const router = express.Router();
const StepData = require('../models/StepData');
const UserPoints = require('../models/UserPoints');
const User = require('../models/User');
const Reward = require('../models/Reward');

// Add step data with UTC timezone handling
router.post('/steps', async (req, res) => {
  try {
    const { username, steps, date, source } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse the incoming date and normalize to UTC midnight
    const stepDate = new Date(date);
    const year = stepDate.getUTCFullYear();
    const month = stepDate.getUTCMonth();
    const day = stepDate.getUTCDate();
    
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));

    console.log(`Upserting steps for ${username} on ${startOfDay.toISOString()}`);

    const updatedStepData = await StepData.findOneAndUpdate(
      { 
        userId: user._id, 
        date: { $gte: startOfDay, $lt: endOfDay } 
      },
      { 
        $set: { 
          userId: user._id,
          steps: steps,
          date: startOfDay,
          source: source || 'MANUAL'
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'Steps saved successfully',
      data: updatedStepData
    });
  } catch (error) {
    console.error('Error saving steps:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get total steps for a user
router.get('/steps/total/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stepData = await StepData.find({ userId: user._id });
    let totalSteps = 0;
    stepData.forEach(data => {
      totalSteps += data.steps;
    });

    res.status(200).json({ username, totalSteps });
  } catch (error) {
    console.error('Error fetching total steps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly step data
router.get('/steps/weekly/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDaysAgo = new Date(todayUTC);
    sevenDaysAgo.setUTCDate(todayUTC.getUTCDate() - 7);

    const stepData = await StepData.find({
      userId: user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    if (stepData.length === 0) {
      return res.status(200).json({ username, averageSteps: 0, daysTracked: 0 });
    }

    const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);
    const averageSteps = Math.round(totalSteps / stepData.length);

    res.status(200).json({
      username,
      averageSteps,
      daysTracked: stepData.length,
      totalSteps
    });
  } catch (error) {
    console.error('Error fetching weekly step data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get last 7 days (Monday-Sunday current week)
router.get('/steps/last-7-days/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const dayOfWeek = todayUTC.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const mondayUTC = new Date(todayUTC);
    mondayUTC.setUTCDate(todayUTC.getUTCDate() - daysFromMonday);

    console.log(`Week range (UTC): ${mondayUTC.toISOString()} to ${todayUTC.toISOString()}`);

    const stepData = await StepData.find({
      userId: user._id,
      date: { $gte: mondayUTC, $lte: todayUTC }
    }).sort({ date: 1 });

    const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    const stepMap = {};
    stepData.forEach(data => {
      const dateKey = data.date.toISOString().split('T')[0];
      stepMap[dateKey] = data.steps;
    });

    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayUTC);
      date.setUTCDate(mondayUTC.getUTCDate() + i);
      
      const dateKey = date.toISOString().split('T')[0];
      const isFutureDay = date > todayUTC;
      const steps = isFutureDay ? 0 : (stepMap[dateKey] || 0);
      
      result.push({
        dayName: dayNames[i],
        date: `${date.getUTCDate().toString().padStart(2, '0')}.${(date.getUTCMonth() + 1).toString().padStart(2, '0')}.${date.getUTCFullYear()}`,
        steps: steps,
        isFuture: isFutureDay
      });
    }

    res.status(200).json({ username, days: result });
  } catch (error) {
    console.error('Error fetching last 7 days:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly step data
router.get('/steps/monthly/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const firstDayOfMonth = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1));
    const lastDayOfMonth = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() + 1, 0));
    const daysInMonth = lastDayOfMonth.getUTCDate();

    const stepData = await StepData.find({
      userId: user._id,
      date: { $gte: firstDayOfMonth, $lte: todayUTC }
    }).sort({ date: 1 });

    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const stepMap = {};
    stepData.forEach(data => {
      const dateKey = data.date.toISOString().split('T')[0];
      stepMap[dateKey] = data.steps;
    });

    const result = [];
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const date = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), dayNum));
      const dateKey = date.toISOString().split('T')[0];
      const isFutureDay = date > todayUTC;
      const dayOfWeek = date.getUTCDay();
      const steps = isFutureDay ? 0 : (stepMap[dateKey] || 0);
      
      result.push({
        dayNumber: dayNum,
        dayName: dayNames[dayOfWeek],
        monthName: monthNames[todayUTC.getUTCMonth()],
        date: `${dayNum.toString().padStart(2, '0')}.${(todayUTC.getUTCMonth() + 1).toString().padStart(2, '0')}.${todayUTC.getUTCFullYear()}`,
        steps: steps,
        isFuture: isFutureDay
      });
    }

    res.status(200).json({ 
      username, 
      monthName: monthNames[todayUTC.getUTCMonth()],
      year: todayUTC.getUTCFullYear(),
      days: result 
    });
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate weekly points
router.post('/points/calculate', async (req, res) => {
  try {
    const { username, weekStartDate } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let weekStart;
    if (weekStartDate) {
      weekStart = new Date(weekStartDate);
    } else {
      weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    }
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const stepData = await StepData.find({
      userId: user._id,
      date: { $gte: weekStart, $lt: weekEnd }
    });

    const dailySteps = {};
    stepData.forEach(data => {
      const day = data.date.toISOString().split('T')[0];
      dailySteps[day] = (dailySteps[day] || 0) + data.steps;
    });

    const totalSteps = Object.values(dailySteps).reduce((sum, steps) => sum + steps, 0);
    const daysCount = Object.keys(dailySteps).length;
    const averageSteps = daysCount > 0 ? Math.round(totalSteps / daysCount) : 0;

    let pointsEarned = 0;
    if (averageSteps >= 2000 && averageSteps < 3500) pointsEarned = 1;
    else if (averageSteps >= 3500 && averageSteps < 5000) pointsEarned = 2;
    else if (averageSteps >= 5000 && averageSteps < 6500) pointsEarned = 3;
    else if (averageSteps >= 6500 && averageSteps < 8000) pointsEarned = 4;
    else if (averageSteps >= 8000 && averageSteps < 10000) pointsEarned = 5;
    else if (averageSteps >= 10000 && averageSteps < 11500) pointsEarned = 6;
    else if (averageSteps >= 11500) pointsEarned = 7;

    let userPoints = await UserPoints.findOne({
      userId: user._id,
      weekStartDate: weekStart
    });

    if (!userPoints) {
      userPoints = new UserPoints({
        userId: user._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        averageSteps,
        pointsEarned,
        remainingPoints: pointsEarned
      });
    } else {
      userPoints.averageSteps = averageSteps;
      userPoints.pointsEarned = pointsEarned;
    }

    await userPoints.save();
    
    res.status(200).json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      averageSteps,
      pointsEarned,
      remainingPoints: userPoints.remainingPoints
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total points
router.get('/points/total/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pointsRecords = await UserPoints.find({ userId: user._id });
    const totalPoints = pointsRecords.reduce((sum, record) => sum + record.remainingPoints, 0);

    res.status(200).json({ username, totalPoints });
  } catch (error) {
    console.error('Error fetching total points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reward history
router.get('/rewards/history/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const RewardRedemption = require('../models/RewardRedemption');
    const redemptions = await RewardRedemption.find({ userId: user._id }).sort({ redeemedAt: -1 });

    res.status(200).json(redemptions);
  } catch (error) {
    console.error('Error fetching reward history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active rewards
router.get('/rewards/active', async (req, res) => {
  try {
    // Fetch only active rewards, sorted by points
    const rewards = await Reward.find({ isActive: true }).sort({ points: 1 });

    console.log(`Fetched ${rewards.length} active rewards for mobile app`);

    res.status(200).json({
      success: true,
      total: rewards.length,
      rewards: rewards.map(reward => ({
        _id: reward._id,
        title: reward.title,
        points: reward.points,
        description: reward.description || '',
        category: reward.category || 'General'
      }))
    });

  } catch (error) {
    console.error('Error fetching active rewards:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      rewards: []
    });
  }
});

// Redeem points
router.post('/points/redeem', async (req, res) => {
  try {
    const { username, pointsToRedeem } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pointsRecords = await UserPoints.find({ 
      userId: user._id,
      remainingPoints: { $gt: 0 }
    }).sort({ weekStartDate: 1 });
    
    const totalAvailablePoints = pointsRecords.reduce((sum, record) => sum + record.remainingPoints, 0);

    if (totalAvailablePoints < pointsToRedeem) {
      return res.status(400).json({ 
        message: 'Not enough points',
        availablePoints: totalAvailablePoints
      });
    }

    let pointsRemaining = pointsToRedeem;
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

    res.status(200).json({ 
      message: 'Points redeemed successfully',
      redeemedPoints: pointsToRedeem,
      remainingPoints: totalAvailablePoints - pointsToRedeem
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get yearly step data (current year, all 12 months)
router.get('/steps/yearly/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = January, 11 = December

    // Start of year (January 1st)
    const yearStart = new Date(currentYear, 0, 1);
    
    // End of year (December 31st)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    console.log(`Year range: ${yearStart.toISOString()} to ${yearEnd.toISOString()}`);

    // Fetch all step data for the current year up to today
    const stepData = await StepData.find({
      userId: user._id,
      date: { $gte: yearStart, $lte: today }
    }).sort({ date: 1 });

    // month names
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    // Create a map of months to total steps
    const monthStepMap = {};
    
    stepData.forEach(data => {
      const date = new Date(data.date);
      const monthIndex = date.getMonth();
      
      if (!monthStepMap[monthIndex]) {
        monthStepMap[monthIndex] = 0;
      }
      monthStepMap[monthIndex] += data.steps;
    });

    // Build result array for all 12 months
    const result = [];
    
    for (let i = 0; i < 12; i++) {
      const isFutureMonth = i > currentMonth;
      const steps = isFutureMonth ? 0 : (monthStepMap[i] || 0);
      
      result.push({
        monthName: monthNames[i],
        monthNumber: i + 1,
        steps: steps,
        isFuture: isFutureMonth
      });
    }

    console.log(`Returning ${result.length} months of data`);
    
    res.status(200).json({ 
      username,
      year: currentYear,
      months: result 
    });

  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;