require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('../models/Reward');

async function seedRewards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fusion2024', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if rewards already exist
    const existingRewards = await Reward.countDocuments();
    
    if (existingRewards > 0) {
      console.log(`${existingRewards} rewards already exist. Skipping seed.`);
      process.exit(0);
    }

    // Existing rewards from praemie.dart
    const rewards = [
      { title: 'Liegestuhl', points: 130, category: 'Outdoor' },
      { title: 'Frisbee', points: 30, category: 'Sports' },
      { title: 'Gutschein 10€', points: 25, category: 'Voucher' },
      { title: 'Kühltasche', points: 20, category: 'Accessories' },
      { title: 'Sattelschoner', points: 15, category: 'Cycling' },
      { title: 'Fahrrad-Klingel', points: 10, category: 'Cycling' },
      { title: 'Massagestern', points: 7, category: 'Wellness' }
    ];

    for (const rewardData of rewards) {
      const reward = new Reward({
        ...rewardData,
        description: '',
        imageUrl: '',
        isActive: true,
        stockQuantity: null
      });
      
      await reward.save();
      console.log(`✅ Created reward: ${rewardData.title} (${rewardData.points} points)`);
    }

    console.log('\n✅ All rewards seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding rewards:', error);
    process.exit(1);
  }
}

seedRewards();