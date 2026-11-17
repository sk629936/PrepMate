import mongoose from 'mongoose';
import {
  MOCK_QUESTION_DIFFICULTIES,
  ALL_INTERVIEW_TOPICS,
} from '../data/mockInterviewCatalog.js';

/**
 * MockInterviewQuestion Model
 *
 * Stores question repository for Mock Interviews (Technical & HR).
 * Includes expected answers, evaluation criteria/points, and keywords.
 */
const mockInterviewQuestionSchema = new mongoose.Schema(
  {
    // The main question prompt
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [5, 'Question must be at least 5 characters long'],
    },

    // Type: 'technical' or 'hr'
    type: {
      type: String,
      required: [true, 'Question type is required'],
      enum: {
        values: ['technical', 'hr'],
        message: '{VALUE} is not a valid question type (expected "technical" or "hr")',
      },
      lowercase: true,
      index: true,
    },

    // Topic (e.g., DBMS, Operating Systems, Introduction, Teamwork)
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true,
    },

    // Subtopic (e.g., 'Deadlocks', 'STAR Method', 'Indexing', 'REST APIs')
    subtopic: {
      type: String,
      trim: true,
      default: '',
    },

    // Difficulty level
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: MOCK_QUESTION_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'Medium',
      index: true,
    },

    // Model/expected answer for reference and evaluation benchmark
    expectedAnswer: {
      type: String,
      required: [true, 'Expected answer is required'],
      trim: true,
    },

    // Conceptual explanation or interviewer insight
    explanation: {
      type: String,
      trim: true,
      default: '',
    },

    // Key evaluation points / rubric items that a strong answer should address
    evaluationPoints: {
      type: [String],
      default: [],
    },

    // Key technical or behavioral terms for deterministic evaluation & future AI grounding
    keywords: {
      type: [String],
      default: [],
    },

    // Optional metadata (e.g. source company pattern, origin)
    source: {
      type: String,
      trim: true,
      default: '',
    },

    // Order index for sorting if needed
    order: {
      type: Number,
      default: 0,
    },

    // Visibility flag for student mock interviews
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Soft deletion flag to preserve historical interview records
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast generation queries and filtering
mockInterviewQuestionSchema.index({ isDeleted: 1, isPublished: 1, type: 1, difficulty: 1 });
mockInterviewQuestionSchema.index({ isDeleted: 1, isPublished: 1, topic: 1 });
mockInterviewQuestionSchema.index({ isDeleted: 1, isPublished: 1, type: 1, topic: 1 });

const MockInterviewQuestion = mongoose.model('MockInterviewQuestion', mockInterviewQuestionSchema);

export default MockInterviewQuestion;
