import mongoose from 'mongoose';
import { CORE_CS_SUBJECTS, CORE_CS_DIFFICULTIES } from '../data/coreCSCatalog.js';

/**
 * CoreCSQuestion Model
 *
 * Question bank for Core CS Subjects:
 * - DBMS
 * - Operating Systems
 * - Computer Networks
 * - OOP
 * - Software Engineering
 * - SQL / Query Practice
 * - Computer Architecture & Organization
 * - Data Structures Fundamentals
 */
const coreCSQuestionSchema = new mongoose.Schema(
  {
    // The question text
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [5, 'Question must be at least 5 characters'],
    },

    // Multiple choice options — exactly 4
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 4 && v.every((opt) => typeof opt === 'string' && opt.trim().length > 0);
        },
        message: 'Exactly 4 non-empty options are required',
      },
    },

    // The correct answer string matching one of the options
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
    },

    // Explanation shown after answer submission
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
    },

    // Subject enum
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: {
        values: CORE_CS_SUBJECTS,
        message: '{VALUE} is not a valid Core CS subject',
      },
    },

    // Topic within the subject (e.g. "Indexing", "Deadlocks", "TCP/IP")
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },

    // Difficulty level
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: CORE_CS_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'Medium',
    },

    // Optional source/attribution
    source: {
      type: String,
      trim: true,
      default: '',
    },

    // Whether this question is visible to users
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast filtering and sampling
coreCSQuestionSchema.index({ subject: 1, topic: 1, difficulty: 1, isPublished: 1 });
coreCSQuestionSchema.index({ isPublished: 1, subject: 1 });
coreCSQuestionSchema.index({ subject: 1, difficulty: 1 });
coreCSQuestionSchema.index({ isPublished: 1, topic: 1 });

const CoreCSQuestion = mongoose.model('CoreCSQuestion', coreCSQuestionSchema);

export default CoreCSQuestion;
