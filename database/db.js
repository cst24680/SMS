import mongoose from 'mongoose';

export async function connectDB() {
  try {
    // Local MongoDB URI (or replace with your MongoDB Atlas URI)
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studybuddy';
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  }
}