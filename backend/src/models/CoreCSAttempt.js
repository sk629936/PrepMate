import mongoose from 'mongoose';

/**
 * CoreCSAttempt Model
 *
 * Records user attempts for Core CS practice questions.
 * Used for actual progress calculation and subject/topic analytics.
 */
const coreCSAttemptSchema = new mongoose.Schema(
  {
    // Reference to the authenticated User (req.user.userId)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Reference to the CoreCSQuestion
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoreCSQuestion',
      required: true,
      index: true,
    },

    // The answer selected by user
    selectedAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    // Whether the answer is correct (computed on the backend)
    isCorrect: {
      type: Boolean,
      required: true,
    },

    // Denormalized metadata for fast analytical queries
    subject: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user statistics
coreCSAttemptSchema.index({ user: 1, question: 1 });
coreCSAttemptSchema.index({ user: 1, subject: 1 });
coreCSAttemptSchema.index({ user: 1, createdAt: -1 });

const CoreCSAttempt = mongoose.model('CoreCSAttempt', coreCSAttemptSchema);

export default CoreCSAttempt;
