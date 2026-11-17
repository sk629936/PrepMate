import mongoose from 'mongoose';
import {
  INTERVIEW_TYPES,
  MOCK_INTERVIEW_DIFFICULTIES,
  MOCK_SESSION_STATUSES,
} from '../data/mockInterviewCatalog.js';

/**
 * Sub-schema for individual answers within a Mock Interview Session
 */
const mockInterviewAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterviewQuestion',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['technical', 'hr'],
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    subtopic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      required: true,
    },
    // Expected answer and rubric populated upon evaluation / result
    expectedAnswer: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    evaluationPoints: {
      type: [String],
      default: [],
    },
    // User's submitted text answer
    userAnswer: {
      type: String,
      default: '',
      trim: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    // Structured evaluation results (Deterministic rubric evaluation for Phase 1, AI-ready)
    evaluationResult: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      feedback: {
        type: String,
        default: '',
      },
      pointsCovered: {
        type: [String],
        default: [],
      },
      pointsMissed: {
        type: [String],
        default: [],
      },
      keywordMatchRate: {
        type: Number,
        default: 0,
      },
      evaluatedAt: {
        type: Date,
      },
    },
    // Question score (0 - 100 scale)
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    answeredAt: {
      type: Date,
    },
  },
  { _id: false }
);

/**
 * MockInterviewSession Model
 *
 * Tracks the complete lifecycle of a student's mock interview attempt:
 * generation -> in_progress -> completed / abandoned
 */
const mockInterviewSessionSchema = new mongoose.Schema(
  {
    // Authenticated user reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Interview Type: 'technical', 'hr', or 'mixed'
    interviewType: {
      type: String,
      enum: INTERVIEW_TYPES,
      required: true,
    },

    // Difficulty: 'Easy', 'Medium', 'Hard', 'Mixed'
    difficulty: {
      type: String,
      enum: MOCK_INTERVIEW_DIFFICULTIES,
      required: true,
    },

    // Number of questions requested (5, 10, 15, 20)
    questionCount: {
      type: Number,
      required: true,
    },

    // Question references in sequence
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockInterviewQuestion',
      },
    ],

    // Answers and evaluations for each question
    answers: [mockInterviewAnswerSchema],

    // Session Status
    status: {
      type: String,
      enum: MOCK_SESSION_STATUSES,
      default: 'generated',
      index: true,
    },

    // Timing metrics
    startedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    // Duration in seconds
    duration: {
      type: Number,
      default: 0,
    },

    // Summary counts
    totalQuestions: {
      type: Number,
      default: 0,
    },
    answeredQuestions: {
      type: Number,
      default: 0,
    },
    unansweredQuestions: {
      type: Number,
      default: 0,
    },

    // Overall Score & Percentage (0 - 100)
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },

    // Technical Breakdown
    technicalScore: {
      total: { type: Number, default: 0 },
      answered: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      maxScore: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },

    // HR / Behavioral Breakdown
    hrScore: {
      total: { type: Number, default: 0 },
      answered: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      maxScore: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },

    // Difficulty-wise performance breakdown
    difficultyStats: {
      type: Map,
      of: {
        total: Number,
        answered: Number,
        score: Number,
        maxScore: Number,
        percentage: Number,
      },
      default: {},
    },

    // Topic-wise performance breakdown
    topicStats: {
      type: Map,
      of: {
        total: Number,
        answered: Number,
        score: Number,
        maxScore: Number,
        percentage: Number,
      },
      default: {},
    },

    // Topic strengths & improvement areas
    weakTopics: {
      type: [String],
      default: [],
    },
    strongTopics: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast history, analytics, and session lookups
mockInterviewSessionSchema.index({ user: 1, createdAt: -1 });
mockInterviewSessionSchema.index({ user: 1, status: 1, createdAt: -1 });
mockInterviewSessionSchema.index({ user: 1, interviewType: 1 });

const MockInterviewSession = mongoose.model('MockInterviewSession', mockInterviewSessionSchema);

export default MockInterviewSession;
