const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Atlaswstion  Error:', error.message);
    console.log('🔄 Trying local MongoDB...');

    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/student_management');
      console.log('✅ Connected to Local MongoDB');
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.error('💡 Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Go to MongoDB Atlas → Network Access → Add your IP');
      console.error('   3. Verify username/password in .env file');
      console.error('   4. Check if Atlas cluster is paused (free tier auto-pauses)');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
