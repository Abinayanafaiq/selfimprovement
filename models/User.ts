import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    maxlength: [60, 'Username cannot be more than 60 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Daily Plan (Tasks)
  dailyPlan: [{
    text: String,
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  // For caching simple analytics
  totalHabits: { type: Number, default: 0 },
  wins: { type: Number, default: 0 }, // Total completions
}, { timestamps: true });

// Force model refresh in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
