import mongoose from 'mongoose';

/**
 * AptitudeQuestion Model
 *
 * Centralized placement-oriented aptitude question bank.
 * Questions are NOT organized by company — they are organized by:
 *   category → chapter → topic → difficulty
 *
 * Company names may appear ONLY as optional metadata for admin/research purposes.
 * They are NEVER the primary user-facing organization structure.
 */

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    // The question text
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [10, 'Question must be at least 10 characters'],
    },

    // Multiple choice options — exactly 4
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: 'Exactly 4 options are required',
      },
    },

    // The index (0–3) of the correct option in options[]
    correctAnswerIndex: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: [0, 'Index must be 0–3'],
      max: [3, 'Index must be 0–3'],
    },

    // Explanation shown after answer submission
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
    },

    // Primary category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
    },

    // Chapter within the category (e.g. "Percentages", "Coding-Decoding")
    chapter: {
      type: String,
      required: [true, 'Chapter is required'],
      trim: true,
    },

    // Optional sub-topic within the chapter
    topic: {
      type: String,
      trim: true,
      default: '',
    },

    // Difficulty level
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
    },

    // Tags describing the pattern/concept
    patternTags: {
      type: [String],
      default: [],
    },

    // How this question was created
    sourceType: {
      type: String,
      enum: ['manual', 'pdf-import', 'seed'],
      default: 'manual',
    },

    /**
     * OPTIONAL admin/research metadata only.
     * NEVER shown to users as the reason to practice a question.
     * NEVER implies the question is from an official company paper.
     * Used only for admin filtering and question pattern research.
     */
    companyPatternReferences: {
      type: [String],
      default: [],
    },

    // Whether this question is visible to users
    isPublished: {
      type: Boolean,
      default: false,
    },

    // If imported from PDF, marks pending admin review
    needsReview: {
      type: Boolean,
      default: false,
    },

    // Normalized question text for duplicate detection (lowercase, no punctuation, collapsed spaces)
    normalizedQuestion: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: auto-compute normalizedQuestion for duplicate detection
aptitudeQuestionSchema.pre('save', function (next) {
  if (this.isModified('question')) {
    this.normalizedQuestion = this.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  next();
});

// Indexes for fast filtering
aptitudeQuestionSchema.index({ category: 1, chapter: 1, difficulty: 1 });
aptitudeQuestionSchema.index({ isPublished: 1, category: 1 });
aptitudeQuestionSchema.index({ needsReview: 1 });

const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);

export default AptitudeQuestion;
