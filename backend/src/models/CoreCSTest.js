import mongoose from 'mongoose';

/**
 * CoreCSTest Model
 *
 * Stores test sessions and completed evaluation results for Core CS tests.
 */
const testAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoreCSQuestion',
      required: true,
    },
    questionText: String,
    options: [String],
    selectedAnswer: {
      type: String,
      default: null,
    },
    correctAnswer: String,
    explanation: String,
    isCorrect: {
      type: Boolean,
      default: false,
    },
    subject: String,
    topic: String,
    difficulty: String,
  },
  { _id: false }
);

const coreCSTestSchema = new mongoose.Schema(
  {
    // Reference to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Subject scope (e.g., 'DBMS' or 'Mixed')
    subject: {
      type: String,
      default: 'Mixed',
    },

    // Difficulty scope (e.g., 'Easy', 'Medium', 'Hard', 'Mixed')
    difficulty: {
      type: String,
      default: 'Mixed',
    },

    // Questions included in this test
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoreCSQuestion',
      },
    ],

    // Detailed user answers submitted for grading
    answers: [testAnswerSchema],

    totalQuestions: {
      type: Number,
      required: true,
    },

    correct: {
      type: Number,
      default: 0,
    },

    wrong: {
      type: Number,
      default: 0,
    },

    unattempted: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    // Time in seconds
    duration: {
      type: Number,
      default: 0,
    },

    // Subject-wise performance summary
    subjectStats: {
      type: Map,
      of: {
        total: Number,
        correct: Number,
        wrong: Number,
        unattempted: Number,
        accuracy: Number,
      },
      default: {},
    },

    // Topic-wise performance summary
    topicStats: {
      type: Map,
      of: {
        total: Number,
        correct: Number,
        wrong: Number,
        unattempted: Number,
        accuracy: Number,
      },
      default: {},
    },

    status: {
      type: String,
      enum: ['generated', 'in_progress', 'completed'],
      default: 'generated',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
coreCSTestSchema.index({ user: 1, createdAt: -1 });

const CoreCSTest = mongoose.model('CoreCSTest', coreCSTestSchema);

export default CoreCSTest;
