import mongoose from 'mongoose';

/**
 * DSAProblem Model
 *
 * Centralized LeetCode-based DSA Problem Dataset.
 * Stores metadata and official LeetCode URLs.
 * Does NOT store problem statements, test cases, or judge solutions.
 */
const dsaProblemSchema = new mongoose.Schema(
  {
    // Unique problem identifier (e.g. 'arr-1', 'dp-3', 'dsa-1790...')
    id: {
      type: String,
      required: [true, 'Problem ID is required'],
      unique: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      minlength: [2, 'Problem title must be at least 2 characters'],
      maxlength: [200, 'Problem title must not exceed 200 characters'],
    },

    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true,
    },

    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      index: true,
    },

    leetcodeUrl: {
      type: String,
      required: [true, 'Official LeetCode URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/(www\.)?leetcode\.com\/problems\/[a-z0-9-]+\/?.*$/i.test(v);
        },
        message: 'Must be a valid LeetCode problem URL (e.g. https://leetcode.com/problems/two-sum/)',
      },
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    statement: {
      type: String,
      default: '',
    },

    examples: {
      type: [
        {
          input: { type: String, default: '' },
          output: { type: String, default: '' },
          explanation: { type: String, default: '' },
        },
      ],
      default: [],
    },

    constraints: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);

export default DSAProblem;
