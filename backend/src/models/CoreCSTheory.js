import mongoose from 'mongoose';
import { CORE_CS_SUBJECTS } from '../data/coreCSCatalog.js';

export const THEORY_TYPES = ['text', 'pdf', 'ppt'];

/**
 * CoreCSTheory Model
 *
 * Stores text/Markdown theory notes and study materials (PDF/PPT/PPTX)
 * for Core CS subjects and topics.
 */
const coreCSTheorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Theory title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },

    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: {
        values: CORE_CS_SUBJECTS,
        message: '{VALUE} is not a valid Core CS subject',
      },
      index: true,
    },

    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true,
    },

    type: {
      type: String,
      required: [true, 'Material type is required'],
      enum: {
        values: THEORY_TYPES,
        message: 'Material type must be one of: text, pdf, ppt',
      },
      index: true,
    },

    // Markdown / text educational notes (required for type="text")
    content: {
      type: String,
      default: '',
    },

    // Secure URL / path reference for uploaded study material
    fileUrl: {
      type: String,
      default: '',
    },

    // Original filename as uploaded by the user
    originalFileName: {
      type: String,
      default: '',
      trim: true,
    },

    // Sanitized stored filename on disk
    fileName: {
      type: String,
      default: '',
      trim: true,
    },

    // MIME type of the file
    fileMimeType: {
      type: String,
      default: '',
      trim: true,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      default: 0,
    },

    // Short summary / description
    summary: {
      type: String,
      default: '',
      trim: true,
    },

    // Display sort order
    order: {
      type: Number,
      default: 0,
    },

    // Whether this material is visible to students
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal querying
coreCSTheorySchema.index({ subject: 1, topic: 1 });
coreCSTheorySchema.index({ subject: 1, isPublished: 1, order: 1, title: 1 });
coreCSTheorySchema.index({ isPublished: 1, subject: 1, topic: 1 });

const CoreCSTheory = mongoose.model('CoreCSTheory', coreCSTheorySchema);

export default CoreCSTheory;
