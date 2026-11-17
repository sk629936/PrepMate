import mongoose from 'mongoose';
import MockInterviewQuestion from '../models/MockInterviewQuestion.js';
import MockInterviewSession from '../models/MockInterviewSession.js';
import {
  MOCK_QUESTION_DIFFICULTIES,
} from '../data/mockInterviewCatalog.js';

/**
 * Validates payload for Admin Create/Update Mock Interview Question
 */
export const validateAdminQuestionPayload = (data) => {
  const errors = [];

  if (!data.question || typeof data.question !== 'string' || data.question.trim().length < 5) {
    errors.push('Question text must be at least 5 characters long.');
  }

  const normalizedType = String(data.type || '').toLowerCase();
  if (!['technical', 'hr'].includes(normalizedType)) {
    errors.push('Question type must be either "technical" or "hr".');
  }

  if (!data.topic || typeof data.topic !== 'string' || data.topic.trim().length === 0) {
    errors.push('Topic is required.');
  }

  if (!data.difficulty || !MOCK_QUESTION_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Difficulty must be one of: ${MOCK_QUESTION_DIFFICULTIES.join(', ')}.`);
  }

  if (!data.expectedAnswer || typeof data.expectedAnswer !== 'string' || data.expectedAnswer.trim().length === 0) {
    errors.push('Expected answer is required.');
  }

  if (data.evaluationPoints !== undefined && !Array.isArray(data.evaluationPoints)) {
    errors.push('Evaluation points must be an array of strings.');
  }

  if (data.keywords !== undefined && !Array.isArray(data.keywords)) {
    errors.push('Keywords must be an array of strings.');
  }

  return errors;
};

/**
 * GET /api/admin/mock-interviews/questions
 * List all questions with administrative filters (type, topic, difficulty, isPublished, search, pagination).
 */
export const getAdminQuestions = async (req, res) => {
  const { type, topic, difficulty, isPublished, search, page = 1, limit = 20 } = req.query;

  const filter = { isDeleted: false };

  if (type) {
    filter.type = String(type).toLowerCase();
  }
  if (topic) {
    filter.topic = topic;
  }
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  if (isPublished !== undefined && isPublished !== '') {
    filter.isPublished = isPublished === 'true';
  }

  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { subtopic: { $regex: search, $options: 'i' } },
      { expectedAnswer: { $regex: search, $options: 'i' } },
    ];
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await MockInterviewQuestion.countDocuments(filter);
  const questions = await MockInterviewQuestion.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  res.status(200).json({
    success: true,
    total,
    page: parsedPage,
    totalPages: Math.ceil(total / parsedLimit) || 1,
    questions,
  });
};

/**
 * POST /api/admin/mock-interviews/questions
 * Create a new Mock Interview question.
 */
export const createQuestion = async (req, res) => {
  const errors = validateAdminQuestionPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(' '),
      errors,
    });
  }

  const {
    question,
    type,
    topic,
    subtopic = '',
    difficulty,
    expectedAnswer,
    explanation = '',
    evaluationPoints = [],
    keywords = [],
    source = '',
    order = 0,
    isPublished = true,
  } = req.body;

  const cleanEvaluationPoints = Array.isArray(evaluationPoints)
    ? evaluationPoints.map((p) => String(p).trim()).filter(Boolean)
    : [];

  const cleanKeywords = Array.isArray(keywords)
    ? keywords.map((k) => String(k).trim()).filter(Boolean)
    : [];

  const newQuestion = new MockInterviewQuestion({
    question: question.trim(),
    type: String(type).toLowerCase(),
    topic: topic.trim(),
    subtopic: String(subtopic || '').trim(),
    difficulty,
    expectedAnswer: expectedAnswer.trim(),
    explanation: String(explanation || '').trim(),
    evaluationPoints: cleanEvaluationPoints,
    keywords: cleanKeywords,
    source: String(source || '').trim(),
    order: Number(order) || 0,
    isPublished: Boolean(isPublished),
    isDeleted: false,
  });

  await newQuestion.save();

  res.status(201).json({
    success: true,
    message: 'Mock interview question created successfully',
    question: newQuestion,
  });
};

/**
 * PUT /api/admin/mock-interviews/questions/:id
 * Update an existing Mock Interview question.
 */
export const updateQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const errors = validateAdminQuestionPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(' '),
      errors,
    });
  }

  const question = await MockInterviewQuestion.findOne({ _id: id, isDeleted: false });
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  const {
    question: qText,
    type,
    topic,
    subtopic,
    difficulty,
    expectedAnswer,
    explanation,
    evaluationPoints,
    keywords,
    source,
    order,
    isPublished,
  } = req.body;

  question.question = qText.trim();
  question.type = String(type).toLowerCase();
  question.topic = topic.trim();
  if (subtopic !== undefined) question.subtopic = String(subtopic).trim();
  question.difficulty = difficulty;
  question.expectedAnswer = expectedAnswer.trim();
  if (explanation !== undefined) question.explanation = String(explanation).trim();
  if (Array.isArray(evaluationPoints)) {
    question.evaluationPoints = evaluationPoints.map((p) => String(p).trim()).filter(Boolean);
  }
  if (Array.isArray(keywords)) {
    question.keywords = keywords.map((k) => String(k).trim()).filter(Boolean);
  }
  if (source !== undefined) question.source = String(source).trim();
  if (order !== undefined) question.order = Number(order) || 0;
  if (isPublished !== undefined) question.isPublished = Boolean(isPublished);

  await question.save();

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    question,
  });
};

/**
 * DELETE /api/admin/mock-interviews/questions/:id
 * Safe deletion:
 * If the question is referenced in historical MockInterviewSessions, soft-delete it (isDeleted: true, isPublished: false)
 * to maintain historical session integrity. If never referenced, hard-delete it.
 */
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const question = await MockInterviewQuestion.findById(id);
  if (!question || question.isDeleted) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  // Check if historical interview attempts reference this question
  const isReferenced = await MockInterviewSession.exists({
    $or: [
      { questions: id },
      { 'answers.question': id },
    ],
  });

  if (isReferenced) {
    // Soft delete to protect historical interview records & analytics
    question.isDeleted = true;
    question.isPublished = false;
    await question.save();

    return res.status(200).json({
      success: true,
      message: 'Question soft-deleted successfully (preserved for historical session integrity)',
      isSoftDeleted: true,
    });
  }

  // Not referenced anywhere — safe to hard delete
  await MockInterviewQuestion.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Question permanently deleted successfully',
    isSoftDeleted: false,
  });
};

/**
 * PATCH /api/admin/mock-interviews/questions/:id/publish
 * Publish a question
 */
export const publishQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const question = await MockInterviewQuestion.findOne({ _id: id, isDeleted: false });
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  question.isPublished = true;
  await question.save();

  res.status(200).json({
    success: true,
    message: 'Question published successfully',
    question,
  });
};

/**
 * PATCH /api/admin/mock-interviews/questions/:id/unpublish
 * Unpublish a question
 */
export const unpublishQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const question = await MockInterviewQuestion.findOne({ _id: id, isDeleted: false });
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  question.isPublished = false;
  await question.save();

  res.status(200).json({
    success: true,
    message: 'Question unpublished successfully',
    question,
  });
};
