import cron from 'node-cron';
import mongoose from 'mongoose';
import { Member } from './member.model.js'

mongoose.connect('mongodb+srv://muhammadjunaid3164:ink5pbLYEkajG8Ut@cluster0.tpiroy5.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const candidates = await Member.find({
      role: 'full',
      createdAt: { $lte: oneMinuteAgo },
    });

    console.log(`🕵️ Found ${candidates.length} members eligible for deletion:`);
    candidates.forEach((m) => {
      console.log(` - ${m.fullName} (${m.email}) - Created at: ${m.createdAt}`);
    });

    const deleted = await Member.deleteMany({
      role: 'full',
      createdAt: { $lte: oneMinuteAgo },
    });

    console.log(`🧹 Deleted ${deleted.deletedCount} members`);
  } catch (err) {
    console.error('❌ Error in cron:', err);
  }
});

