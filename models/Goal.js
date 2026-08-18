import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    deadline: { type: String, required: true },
    dailyHours: { type: String, default: '1' },
    studyMode: { type: String, default: 'Individual' },
    priority: { type: String, default: 'Medium' },
    // User IDs are MongoDB ObjectId strings. Keeping this as a string also
    // supports the existing seeded numeric IDs after Mongoose casts them.
    userId: { type: String, default: '1' },
  },
  { timestamps: true }
);

// Virtual field to map _id to id for frontend compatibility
goalSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model('Goal', goalSchema);
