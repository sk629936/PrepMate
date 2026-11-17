import AptitudeQuestion from '../models/AptitudeQuestion.js';
import { parsePdfContent } from '../services/pdfExtractionService.js';

/**
 * GET /api/admin/aptitude/questions
 * List all questions with full admin details, filters, and review status
 */
export const getAdminQuestions = async (req, res) => {
  const { category, chapter, topic, difficulty, search, isPublished, needsReview, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (chapter) filter.chapter = chapter;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (isPublished !== undefined && isPublished !== '') filter.isPublished = isPublished === 'true';
  if (needsReview !== undefined && needsReview !== '') filter.needsReview = needsReview === 'true';

  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { chapter: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await AptitudeQuestion.countDocuments(filter);
  const questions = await AptitudeQuestion.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
    questions,
  });
};

/**
 * Question Validator before publication or persistence
 */
const validateQuestionPayload = (data, isPublishing = false) => {
  const errors = [];
  if (!data.question || typeof data.question !== 'string' || data.question.trim().length < 10) {
    errors.push('Question text must be at least 10 characters long.');
  }

  if (!Array.isArray(data.options) || data.options.length !== 4) {
    errors.push('Exactly 4 options are required.');
  } else {
    const trimmed = data.options.map((o) => String(o || '').trim());
    if (trimmed.some((o) => o.length === 0)) {
      errors.push('All 4 options must be non-empty.');
    }
    if (new Set(trimmed).size !== 4) {
      errors.push('All 4 options must be distinct (no duplicate options).');
    }
  }

  const ansIdx = Number(data.correctAnswerIndex);
  if (data.correctAnswerIndex === undefined || data.correctAnswerIndex === null || isNaN(ansIdx) || ansIdx < 0 || ansIdx > 3) {
    errors.push('A valid correct answer (Option A, B, C, or D) is required.');
  }

  const allowedCategories = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
  if (!data.category || !allowedCategories.includes(data.category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(', ')}.`);
  }

  if (!data.chapter || typeof data.chapter !== 'string' || data.chapter.trim().length === 0) {
    errors.push('Chapter is required.');
  }

  const allowedDifficulties = ['Easy', 'Medium', 'Hard'];
  if (!data.difficulty || !allowedDifficulties.includes(data.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard.');
  }

  if (isPublishing && (!data.explanation || typeof data.explanation !== 'string' || data.explanation.trim().length === 0)) {
    errors.push('A verified step-by-step explanation is required before publishing.');
  }

  return errors;
};

/**
 * POST /api/admin/aptitude/questions
 * Create a new question
 */
export const createQuestion = async (req, res) => {
  const {
    question,
    options,
    correctAnswerIndex,
    explanation,
    category,
    chapter,
    topic = '',
    difficulty = 'Medium',
    patternTags = [],
    companyPatternReferences = [],
    isPublished = true,
  } = req.body;

  const validationErrors = validateQuestionPayload(
    { question, options, correctAnswerIndex, explanation, category, chapter, difficulty },
    Boolean(isPublished)
  );

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors.join(' '),
      errors: validationErrors,
    });
  }

  // Duplicate check
  const norm = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const duplicate = await AptitudeQuestion.findOne({ normalizedQuestion: norm });

  const newQuestion = await AptitudeQuestion.create({
    question: question.trim(),
    options: options.map((o) => String(o).trim()),
    correctAnswerIndex: Number(correctAnswerIndex),
    explanation: explanation.trim(),
    category,
    chapter: chapter.trim(),
    topic: (topic || '').trim(),
    difficulty,
    patternTags: Array.isArray(patternTags) ? patternTags : [],
    companyPatternReferences: Array.isArray(companyPatternReferences) ? companyPatternReferences : [],
    isPublished: Boolean(isPublished),
    needsReview: false,
    sourceType: 'manual',
    normalizedQuestion: norm,
  });

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    question: newQuestion,
    isPossibleDuplicate: Boolean(duplicate),
    duplicateMatchId: duplicate?._id,
  });
};

/**
 * PUT /api/admin/aptitude/questions/:id
 * Update an existing question
 */
export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const existing = await AptitudeQuestion.findById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  const merged = {
    question: updates.question !== undefined ? updates.question : existing.question,
    options: updates.options !== undefined ? updates.options : existing.options,
    correctAnswerIndex: updates.correctAnswerIndex !== undefined ? updates.correctAnswerIndex : existing.correctAnswerIndex,
    explanation: updates.explanation !== undefined ? updates.explanation : existing.explanation,
    category: updates.category !== undefined ? updates.category : existing.category,
    chapter: updates.chapter !== undefined ? updates.chapter : existing.chapter,
    difficulty: updates.difficulty !== undefined ? updates.difficulty : existing.difficulty,
  };

  const isPublishing = updates.isPublished !== undefined ? Boolean(updates.isPublished) : existing.isPublished;
  const validationErrors = validateQuestionPayload(merged, isPublishing);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors.join(' '),
      errors: validationErrors,
    });
  }

  if (updates.question) {
    updates.question = updates.question.trim();
    updates.normalizedQuestion = updates.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (updates.options && Array.isArray(updates.options)) {
    updates.options = updates.options.map((o) => String(o).trim());
  }

  // When admin edits/saves a question, mark review done
  updates.needsReview = false;

  const updated = await AptitudeQuestion.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    question: updated,
  });
};

/**
 * DELETE /api/admin/aptitude/questions/:id
 */
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const deleted = await AptitudeQuestion.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
  });
};

/**
 * PATCH /api/admin/aptitude/questions/:id/publish
 */
export const togglePublishQuestion = async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  const question = await AptitudeQuestion.findById(id);
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  const targetPublishState = isPublished !== undefined ? Boolean(isPublished) : !question.isPublished;

  // Validate before publishing
  if (targetPublishState) {
    const validationErrors = validateQuestionPayload(question, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish question: ${validationErrors.join(' ')}`,
        errors: validationErrors,
      });
    }
  }

  question.isPublished = targetPublishState;
  question.needsReview = false;
  await question.save();

  res.status(200).json({
    success: true,
    message: `Question ${question.isPublished ? 'published' : 'unpublished'} successfully`,
    question,
  });
};

/**
 * POST /api/admin/aptitude/pdf-upload
 * Upload PDF, extract candidate questions, return for Admin Review
 */
export const handlePdfUpload = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: 'PDF file is required.' });
  }

  try {
    const result = await parsePdfContent(req.file.buffer);

    res.status(200).json({
      success: true,
      message: `Extracted ${result.totalExtracted} candidate questions from PDF. Please review and verify correct answers before publishing.`,
      extractedQuestions: result.questions,
    });
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract text from PDF.',
    });
  }
};

/**
 * POST /api/admin/aptitude/batch-save
 * Save candidate review items after admin editing
 */
export const batchSaveQuestions = async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'No questions provided for saving.' });
  }

  const created = [];
  const errors = [];

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const willPublish = Boolean(q.isPublished);
    const itemErrors = validateQuestionPayload(q, willPublish);

    if (itemErrors.length > 0 && willPublish) {
      errors.push(`Item #${idx + 1}: ${itemErrors.join(' ')}`);
      continue;
    }

    const norm = q.question
      ? q.question.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
      : '';

    const createdItem = await AptitudeQuestion.create({
      question: (q.question || '').trim(),
      options: (q.options || []).map((o) => String(o).trim()),
      correctAnswerIndex: Number(q.correctAnswerIndex ?? 0),
      explanation: (q.explanation || 'Imported via PDF. Verified during admin review.').trim(),
      category: q.category || 'Quantitative Aptitude',
      chapter: (q.chapter || 'General Aptitude').trim(),
      topic: (q.topic || '').trim(),
      difficulty: q.difficulty || 'Medium',
      patternTags: Array.isArray(q.patternTags) ? q.patternTags : ['pdf-import'],
      companyPatternReferences: Array.isArray(q.companyPatternReferences) ? q.companyPatternReferences : [],
      isPublished: willPublish && itemErrors.length === 0,
      needsReview: false,
      sourceType: 'pdf-import',
      normalizedQuestion: norm,
    });
    created.push(createdItem);
  }

  res.status(201).json({
    success: true,
    message: `Successfully saved ${created.length} questions.${errors.length > 0 ? ` (${errors.length} items failed validation and were skipped).` : ''}`,
    questions: created,
    skippedCount: errors.length,
    validationErrors: errors,
  });
};
