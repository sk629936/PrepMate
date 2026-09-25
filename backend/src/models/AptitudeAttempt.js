import mongoose from 'mongoose';

/**
 * AptitudeAttempt Model
 *
 * Records each individual question attempt by a user in practice mode.
 * Used for progress tracking, weak topic detection, and accuracy reporting.
 */

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    // Reference to the authenticated user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Reference to the attempted question
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AptitudeQuestion',
      required: true,
    },

    // Denormalized fields for fast analytics (avoids expensive joins)
    category: {
      type: String,
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },

    // The index submitted by the user (0–3)
    selectedAnswerIndex: {
      type: Number,
      min: 0,
      max: 3,
      required: true,
    },

    // Whether the submitted answer was correct
    isCorrect: {
      type: Boolean,
      required: true,
    },

    // Time taken in seconds (optional, recorded by frontend)
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user analytics
aptitudeAttemptSchema.index({ userId: 1, questionId: 1 });
aptitudeAttemptSchema.index({ userId: 1, category: 1 });
aptitudeAttemptSchema.index({ userId: 1, chapter: 1 });
aptitudeAttemptSchema.index({ userId: 1, createdAt: -1 });

const AptitudeAttempt = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);

export default AptitudeAttempt;
