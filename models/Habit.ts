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
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
