const express = require('express');
const User = require('../models/User');
const UserPoints = require('../models/UserPoints');
const RewardRedemption = require('../models/RewardRedemption');
const mailjet = require('node-mailjet').apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const router = express.Router();

// Route to handle reward redemption from mobile app
router.post('/redeem-reward', async (req, res) => {
  try {
    const { username, itemTitle, pointsRequired } = req.body;

    if (!username || !itemTitle || !pointsRequired) {
      return res.status(400).json({ message: 'Username, item title, and points required are missing' });
    }

    const pointsCost = parseInt(pointsRequired);
    if (isNaN(pointsCost) || pointsCost <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    // Find user by username
    const user = await User.findOne({ username: username });
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
        message: 'Not enough points',
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

    // Save the redemption record to database
    const redemption = new RewardRedemption({
      userId: user._id,
      itemTitle: itemTitle,
      itemName: itemTitle, 
      pointsRequired: pointsCost,
      cost: pointsCost, 
      notes: '',
      bemerkungen: '',
      redeemedAt: new Date(),
      redeemedBy: 'user'
    });

    await redemption.save();

    console.log(`User ${username} redeemed reward: ${itemTitle} (${pointsCost} points)`);

    // Send email notification
    const request = mailjet.post("send", { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "tulina.maharjan@informatik.hs-fulda.de",
            Name: "FuSion",
          },
          To: [
            {
              Email: "fusion2024hsp@gmail.com",
              Name: "FuSion Prämie Einlösen",
            },
          ],
          Subject: "FuSion Reward Redemption Request",
          TextPart: `User: ${username}\nItem: ${itemTitle}\nPoints Required: ${pointsCost}\n\nUser has requested to redeem their points.`,
        },
      ],
    });

    try {
      await request;
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(200).json({
      message: 'Reward redeemed successfully',
      username: username,
      itemTitle: itemTitle,
      pointsDeducted: pointsCost,
      remainingPoints: totalAvailable - pointsCost
    });

  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ message: 'Failed to redeem reward. Please try again.' });
  }
});

module.exports = router;