import mongoose from 'mongoose';

/**
 * AptitudeTestResult Model
 *
 * Stores user performance results for full/sectional timed aptitude tests.
 */

const questionResultDetailSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AptitudeQuestion',
      required: true,
    },
    category: String,
    chapter: String,
    topic: String,
    difficulty: String,
    selectedAnswerIndex: {
      type: Number,
      default: null, // null if unattempted
    },
    correctAnswerIndex: Number,
    isCorrect: Boolean,
  },
  { _id: false }
);

const aptitudeTestResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    testType: {
      type: String,
      enum: [
        'Quantitative Test',
        'Quantitative Aptitude Test',
        'Logical Reasoning Test',
        'Verbal Ability Test',
        'Mixed Aptitude Test',
        'Mixed Practice Test',
        'Placement Aptitude Test',
      ],
      default: 'Placement Aptitude Test',
    },

    category: {
      type: String,
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Mixed', 'All'],
      default: 'Mixed',
    },

    difficultyConfig: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
      default: 'Mixed',
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    attemptedCount: {
      type: Number,
      required: true,
    },

    correctCount: {
      type: Number,
      required: true,
    },

    incorrectCount: {
      type: Number,
      required: true,
    },

    unattemptedCount: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      required: true,
    },

    timeTakenSeconds: {
      type: Number,
      required: true,
    },

    totalDurationSeconds: {
      type: Number,
      required: true,
    },

    categoryPerformance: {
      type: Map,
      of: {
        total: Number,
        attempted: Number,
        correct: Number,
        accuracy: Number,
      },
    },

    topicPerformance: {
      type: Map,
      of: {
        total: Number,
        attempted: Number,
        correct: Number,
        accuracy: Number,
      },
    },

    weakTopics: [String],
    strongTopics: [String],

    details: [questionResultDetailSchema],
  },
  {
    timestamps: true,
  }
);

aptitudeTestResultSchema.index({ userId: 1, createdAt: -1 });

const AptitudeTestResult = mongoose.model('AptitudeTestResult', aptitudeTestResultSchema);

export default AptitudeTestResult;
