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

  if (!question || !options || options.length !== 4 || correctAnswerIndex === undefined || !explanation || !category || !chapter) {
    return res.status(400).json({
      success: false,
      message: 'All mandatory fields (question, 4 options, correctAnswerIndex 0-3, explanation, category, chapter) are required.',
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
    topic: topic.trim(),
    difficulty,
    patternTags: Array.isArray(patternTags) ? patternTags : [],
    companyPatternReferences: Array.isArray(companyPatternReferences) ? companyPatternReferences : [],
    isPublished: Boolean(isPublished),
    needsReview: false,
    sourceType: 'manual',
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

  if (updates.question) {
    updates.question = updates.question.trim();
  }
  if (updates.options && Array.isArray(updates.options)) {
    if (updates.options.length !== 4) {
      return res.status(400).json({ success: false, message: 'Exactly 4 options are required.' });
    }
    updates.options = updates.options.map((o) => String(o).trim());
  }

  // When admin reviews/edits a question, mark needsReview false
  updates.needsReview = false;

  const updated = await AptitudeQuestion.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

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

  question.isPublished = isPublished !== undefined ? Boolean(isPublished) : !question.isPublished;
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
      message: `Extracted ${result.totalExtracted} questions from PDF. Please review before publishing.`,
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
 * POST /api/admin/aptitude/batch-publish
 * Save and publish candidate review items after admin editing
 */
export const batchSaveQuestions = async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'No questions provided for saving.' });
  }

  const created = [];
  for (const q of questions) {
    const createdItem = await AptitudeQuestion.create({
      question: q.question.trim(),
      options: q.options.map((o) => String(o).trim()),
      correctAnswerIndex: Number(q.correctAnswerIndex || 0),
      explanation: q.explanation || 'Verified during admin PDF review.',
      category: q.category || 'Quantitative Aptitude',
      chapter: q.chapter || 'General Aptitude',
      topic: q.topic || '',
      difficulty: q.difficulty || 'Medium',
      patternTags: q.patternTags || ['pdf-import'],
      companyPatternReferences: q.companyPatternReferences || [],
      isPublished: q.isPublished !== undefined ? Boolean(q.isPublished) : false,
      needsReview: false,
      sourceType: 'pdf-import',
    });
    created.push(createdItem);
  }

  res.status(201).json({
    success: true,
    message: `Successfully saved ${created.length} questions.`,
    questions: created,
  });
};
