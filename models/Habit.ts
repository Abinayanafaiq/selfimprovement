import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the habit'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  streak: {
    type: Number,
    default: 0,
  },
  completedDates: [{
    type: Date,
  }],
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dailyProgress: {
    date: { type: Date },
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  chat: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Force recompilation in dev to catch schema changes
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Habit;
}

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
