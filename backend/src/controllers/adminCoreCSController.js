import mongoose from 'mongoose';
import CoreCSQuestion from '../models/CoreCSQuestion.js';
import { CORE_CS_SUBJECTS, CORE_CS_DIFFICULTIES } from '../data/coreCSCatalog.js';

/**
 * Validates question payload for Admin create/update operations
 */
export const validateAdminQuestionPayload = (data) => {
  const errors = [];

  if (!data.question || typeof data.question !== 'string' || data.question.trim().length < 5) {
    errors.push('Question text must be at least 5 characters long.');
  }

  if (!Array.isArray(data.options) || data.options.length !== 4) {
    errors.push('Exactly 4 options are required.');
  } else {
    const trimmed = data.options.map((opt) => String(opt || '').trim());
    if (trimmed.some((opt) => opt.length === 0)) {
      errors.push('All 4 options must be non-empty.');
    }
    if (new Set(trimmed).size !== 4) {
      errors.push('All 4 options must be distinct.');
    }

    if (
      !data.correctAnswer ||
      typeof data.correctAnswer !== 'string' ||
      !trimmed.includes(data.correctAnswer.trim())
    ) {
      errors.push('Correct answer must match one of the 4 provided options.');
    }
  }

  if (!data.explanation || typeof data.explanation !== 'string' || data.explanation.trim().length === 0) {
    errors.push('Explanation is required.');
  }

  if (!data.subject || !CORE_CS_SUBJECTS.includes(data.subject)) {
    errors.push(`Subject must be one of: ${CORE_CS_SUBJECTS.join(', ')}.`);
  }

  if (!data.topic || typeof data.topic !== 'string' || data.topic.trim().length === 0) {
    errors.push('Topic is required.');
  }

  if (!data.difficulty || !CORE_CS_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Difficulty must be one of: ${CORE_CS_DIFFICULTIES.join(', ')}.`);
  }

  return errors;
};

/**
 * GET /api/admin/core-cs/questions
 * List questions with admin filtering (subject, topic, difficulty, published status, search)
 */
export const getAdminQuestions = async (req, res) => {
  const { subject, topic, difficulty, isPublished, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (isPublished !== undefined && isPublished !== '') {
    filter.isPublished = isPublished === 'true';
  }

  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await CoreCSQuestion.countDocuments(filter);
  const questions = await CoreCSQuestion.find(filter)
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
 * POST /api/admin/core-cs/questions
 * Create a new Core CS question
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
    options,
    correctAnswer,
    explanation,
    subject,
    topic,
    difficulty,
    source = '',
    isPublished = false,
  } = req.body;

  const newQuestion = new CoreCSQuestion({
    question: question.trim(),
    options: options.map((opt) => String(opt).trim()),
    correctAnswer: correctAnswer.trim(),
    explanation: explanation.trim(),
    subject,
    topic: topic.trim(),
    difficulty,
    source: source.trim(),
    isPublished: Boolean(isPublished),
  });

  await newQuestion.save();

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    question: newQuestion,
  });
};

/**
 * PUT /api/admin/core-cs/questions/:id
 * Update an existing Core CS question
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

  const question = await CoreCSQuestion.findById(id);
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  const {
    question: qText,
    options,
    correctAnswer,
    explanation,
    subject,
    topic,
    difficulty,
    source = '',
    isPublished,
  } = req.body;

  question.question = qText.trim();
  question.options = options.map((opt) => String(opt).trim());
  question.correctAnswer = correctAnswer.trim();
  question.explanation = explanation.trim();
  question.subject = subject;
  question.topic = topic.trim();
  question.difficulty = difficulty;
  question.source = source.trim();
  if (isPublished !== undefined) {
    question.isPublished = Boolean(isPublished);
  }

  await question.save();

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    question,
  });
};

/**
 * DELETE /api/admin/core-cs/questions/:id
 * Delete a Core CS question
 */
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const question = await CoreCSQuestion.findByIdAndDelete(id);
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
  });
};

/**
 * PATCH /api/admin/core-cs/questions/:id/publish
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

  const question = await CoreCSQuestion.findById(id);
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
 * PATCH /api/admin/core-cs/questions/:id/unpublish
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

  const question = await CoreCSQuestion.findById(id);
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
