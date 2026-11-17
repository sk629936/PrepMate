import mongoose from 'mongoose';
import MockInterviewQuestion from '../models/MockInterviewQuestion.js';
import MockInterviewSession from '../models/MockInterviewSession.js';
import {
  INTERVIEW_TYPES,
  MOCK_INTERVIEW_DIFFICULTIES,
  MOCK_QUESTION_COUNTS,
} from '../data/mockInterviewCatalog.js';
import { seedMockInterviewQuestions } from '../data/seedMockInterviewQuestions.js';
import { compileSessionEvaluation } from '../services/mockInterviewEvaluator.js';

/**
 * Ensures seed mock interview questions exist in the database upon first use
 */
export const ensureMockInterviewSeedQuestions = async () => {
  const count = await MockInterviewQuestion.countDocuments({ isDeleted: false });
  if (count === 0) {
    await MockInterviewQuestion.insertMany(seedMockInterviewQuestions, { ordered: false });
  }
};

/**
 * POST /api/mock-interviews/generate
 * Generate a new Mock Interview session with selected interview type, difficulty, and question count.
 * Returns safe questions without exposing expected answers or rubric criteria.
 */
export const generateMockInterview = async (req, res) => {
  await ensureMockInterviewSeedQuestions();

  const { interviewType = 'mixed', difficulty = 'Mixed', questionCount = 5 } = req.body;

  // 1. Validate interviewType
  const normalizedType = String(interviewType).toLowerCase();
  if (!INTERVIEW_TYPES.includes(normalizedType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid interview type. Must be one of: ${INTERVIEW_TYPES.join(', ')}`,
    });
  }

  // 2. Validate difficulty
  if (!MOCK_INTERVIEW_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({
      success: false,
      error: `Invalid difficulty level. Must be one of: ${MOCK_INTERVIEW_DIFFICULTIES.join(', ')}`,
    });
  }

  // 3. Validate questionCount
  const countNum = Number(questionCount);
  if (!MOCK_QUESTION_COUNTS.includes(countNum)) {
    return res.status(400).json({
      success: false,
      error: `Question count must be one of: ${MOCK_QUESTION_COUNTS.join(', ')}`,
    });
  }

  // Build query filter
  const baseMatch = { isPublished: true, isDeleted: false };
  if (difficulty !== 'Mixed') {
    baseMatch.difficulty = difficulty;
  }

  let selectedQuestions = [];

  if (normalizedType === 'technical') {
    selectedQuestions = await MockInterviewQuestion.aggregate([
      { $match: { ...baseMatch, type: 'technical' } },
      { $sample: { size: countNum } },
    ]);
  } else if (normalizedType === 'hr') {
    selectedQuestions = await MockInterviewQuestion.aggregate([
      { $match: { ...baseMatch, type: 'hr' } },
      { $sample: { size: countNum } },
    ]);
  } else {
    // Mixed: Balanced distribution between technical and HR
    const techCount = Math.ceil(countNum / 2);
    const hrCount = Math.floor(countNum / 2);

    const techQuestions = await MockInterviewQuestion.aggregate([
      { $match: { ...baseMatch, type: 'technical' } },
      { $sample: { size: techCount } },
    ]);

    const hrQuestions = await MockInterviewQuestion.aggregate([
      { $match: { ...baseMatch, type: 'hr' } },
      { $sample: { size: hrCount } },
    ]);

    // Combine and shuffle to interleave naturally
    selectedQuestions = [...techQuestions, ...hrQuestions].sort(() => Math.random() - 0.5);
  }

  if (!selectedQuestions || selectedQuestions.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No published questions found matching the requested criteria.',
    });
  }

  // Build answer records preserving question references and criteria for later backend grading
  const initialAnswers = selectedQuestions.map((q) => ({
    question: q._id,
    questionText: q.question,
    type: q.type,
    topic: q.topic,
    subtopic: q.subtopic || '',
    difficulty: q.difficulty,
    expectedAnswer: q.expectedAnswer,
    explanation: q.explanation || '',
    evaluationPoints: q.evaluationPoints || [],
    userAnswer: '',
    isAnswered: false,
    score: 0,
  }));

  const session = new MockInterviewSession({
    user: req.user.userId,
    interviewType: normalizedType,
    difficulty,
    questionCount: selectedQuestions.length,
    questions: selectedQuestions.map((q) => q._id),
    answers: initialAnswers,
    totalQuestions: selectedQuestions.length,
    answeredQuestions: 0,
    unansweredQuestions: selectedQuestions.length,
    status: 'generated',
    maxScore: selectedQuestions.length * 100,
  });

  await session.save();

  // Return safe questions payload (NO expectedAnswer, explanation, evaluationPoints, or keywords)
  const safeQuestions = selectedQuestions.map((q) => ({
    _id: q._id,
    id: q._id,
    question: q.question,
    type: q.type,
    topic: q.topic,
    subtopic: q.subtopic,
    difficulty: q.difficulty,
    source: q.source || '',
  }));

  res.status(201).json({
    success: true,
    message: 'Mock interview session created successfully',
    session: {
      _id: session._id,
      id: session._id,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      totalQuestions: session.totalQuestions,
      status: session.status,
      createdAt: session.createdAt,
      questions: safeQuestions,
    },
  });
};

/**
 * POST /api/mock-interviews/:id/start
 * Marks the interview session as in_progress and records startedAt timestamp.
 */
export const startMockInterview = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid interview session ID format',
    });
  }

  const session = await MockInterviewSession.findById(id);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Interview session not found',
    });
  }

  // Security check: Session ownership
  if (session.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this interview session.',
    });
  }

  if (session.status === 'completed') {
    return res.status(400).json({
      success: false,
      error: 'This interview session has already been completed.',
    });
  }

  if (session.status === 'abandoned') {
    return res.status(400).json({
      success: false,
      error: 'This interview session was abandoned.',
    });
  }

  if (session.status === 'generated') {
    session.status = 'in_progress';
    session.startedAt = session.startedAt || new Date();
    await session.save();
  }

  // Safe questions
  const safeQuestions = session.answers.map((a) => ({
    _id: a.question,
    id: a.question,
    question: a.questionText,
    type: a.type,
    topic: a.topic,
    subtopic: a.subtopic,
    difficulty: a.difficulty,
    userAnswer: a.userAnswer || '',
    isAnswered: a.isAnswered || false,
  }));

  res.status(200).json({
    success: true,
    message: 'Mock interview started',
    session: {
      _id: session._id,
      id: session._id,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      status: session.status,
      startedAt: session.startedAt,
      totalQuestions: session.totalQuestions,
      answeredQuestions: session.answeredQuestions,
      questions: safeQuestions,
    },
  });
};

/**
 * POST /api/mock-interviews/:id/answer
 * Saves or updates a student's answer for a specific question while in progress.
 */
export const saveAnswer = async (req, res) => {
  const { id } = req.params;
  const { questionId, userAnswer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid interview session ID format',
    });
  }

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({
      success: false,
      error: 'Valid question ID is required',
    });
  }

  const session = await MockInterviewSession.findById(id);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Interview session not found',
    });
  }

  // Security check: Session ownership
  if (session.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this interview session.',
    });
  }

  if (session.status === 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update answers for a completed interview.',
    });
  }

  // Auto-advance generated sessions to in_progress
  if (session.status === 'generated') {
    session.status = 'in_progress';
    session.startedAt = new Date();
  }

  const answerEntry = session.answers.find(
    (a) => a.question.toString() === questionId.toString()
  );

  if (!answerEntry) {
    return res.status(404).json({
      success: false,
      error: 'Question is not part of this interview session.',
    });
  }

  const trimmedAnswer = typeof userAnswer === 'string' ? userAnswer.trim() : '';
  answerEntry.userAnswer = trimmedAnswer;
  answerEntry.isAnswered = trimmedAnswer.length > 0;
  answerEntry.answeredAt = new Date();

  session.answeredQuestions = session.answers.filter((a) => a.isAnswered).length;
  session.unansweredQuestions = session.totalQuestions - session.answeredQuestions;

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Answer saved successfully',
    answeredQuestions: session.answeredQuestions,
    unansweredQuestions: session.unansweredQuestions,
  });
};

/**
 * POST /api/mock-interviews/:id/submit
 * Submits the mock interview, executes deterministic rubric evaluation on backend,
 * computes all analytics, and marks the session as completed.
 */
export const submitMockInterview = async (req, res) => {
  const { id } = req.params;
  const { answers = [], duration = 0 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid interview session ID format',
    });
  }

  const session = await MockInterviewSession.findById(id);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Interview session not found',
    });
  }

  // Security check: Session ownership
  if (session.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this interview session.',
    });
  }

  // Prevent duplicate submissions
  if (session.status === 'completed') {
    return res.status(200).json({
      success: true,
      message: 'Interview has already been submitted',
      result: formatSessionResult(session),
    });
  }

  // If client provided a batch of answers on submit, merge them with stored answers
  if (Array.isArray(answers) && answers.length > 0) {
    const answerMap = new Map();
    for (const ans of answers) {
      const qId = ans.questionId || ans.question || ans._id;
      if (qId) {
        answerMap.set(qId.toString(), typeof ans.userAnswer === 'string' ? ans.userAnswer.trim() : '');
      }
    }

    for (const item of session.answers) {
      if (answerMap.has(item.question.toString())) {
        const text = answerMap.get(item.question.toString());
        item.userAnswer = text;
        item.isAnswered = text.length > 0;
        if (text.length > 0) item.answeredAt = new Date();
      }
    }
  }

  // Calculate actual duration in seconds
  const startedTime = session.startedAt ? new Date(session.startedAt).getTime() : new Date(session.createdAt).getTime();
  const calculatedDuration = Number(duration) > 0
    ? Number(duration)
    : Math.max(Math.round((Date.now() - startedTime) / 1000), 1);

  // Execute full rubric evaluation on the backend
  const evalReport = compileSessionEvaluation(session.answers);

  session.answers = evalReport.evaluatedAnswers;
  session.totalQuestions = evalReport.totalQuestions;
  session.answeredQuestions = evalReport.answeredQuestions;
  session.unansweredQuestions = evalReport.unansweredQuestions;
  session.score = evalReport.score;
  session.maxScore = evalReport.maxScore;
  session.percentage = evalReport.percentage;
  session.technicalScore = evalReport.technicalScore;
  session.hrScore = evalReport.hrScore;
  session.difficultyStats = evalReport.difficultyStats;
  session.topicStats = evalReport.topicStats;
  session.strongTopics = evalReport.strongTopics;
  session.weakTopics = evalReport.weakTopics;

  session.duration = calculatedDuration;
  session.status = 'completed';
  session.submittedAt = new Date();

  await session.save();

  res.status(200).json({
    success: true,
    message: 'Mock interview evaluated and submitted successfully',
    result: formatSessionResult(session),
  });
};

/**
 * GET /api/mock-interviews/:id/result
 * Retrieves full evaluation and analytics for a completed interview. Accessible ONLY by the owner.
 */
export const getMockInterviewResult = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid interview session ID format',
    });
  }

  const session = await MockInterviewSession.findById(id).lean();
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Interview session not found',
    });
  }

  // Security check: Session ownership
  if (session.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this interview result.',
    });
  }

  if (session.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Interview has not been completed yet.',
    });
  }

  res.status(200).json({
    success: true,
    result: formatSessionResult(session),
  });
};

/**
 * GET /api/mock-interviews/history
 * Lists all mock interview sessions attempted by the authenticated student.
 */
export const getMockInterviewHistory = async (req, res) => {
  const userId = req.user.userId;

  const sessions = await MockInterviewSession.find({ user: userId })
    .select('interviewType difficulty questionCount totalQuestions answeredQuestions score maxScore percentage technicalScore hrScore status duration startedAt submittedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    total: sessions.length,
    sessions,
  });
};

/**
 * GET /api/mock-interviews/progress
 * Aggregates overall mock interview preparation statistics and progress metrics for the authenticated student.
 */
export const getMockInterviewProgress = async (req, res) => {
  const userId = req.user.userId;

  const allSessions = await MockInterviewSession.find({ user: userId }).lean();
  const completedSessions = allSessions.filter((s) => s.status === 'completed');

  const totalInterviews = allSessions.length;
  const completedCount = completedSessions.length;

  let totalScoreSum = 0;
  let totalMaxScoreSum = 0;
  let totalAnsweredQuestions = 0;
  let totalQuestionsCount = 0;

  let techScoreSum = 0;
  let techMaxScoreSum = 0;
  let hrScoreSum = 0;
  let hrMaxScoreSum = 0;

  const topicAggregateMap = {};

  for (const s of completedSessions) {
    totalScoreSum += s.score || 0;
    totalMaxScoreSum += s.maxScore || 0;
    totalAnsweredQuestions += s.answeredQuestions || 0;
    totalQuestionsCount += s.totalQuestions || 0;

    if (s.technicalScore) {
      techScoreSum += s.technicalScore.score || 0;
      techMaxScoreSum += s.technicalScore.maxScore || 0;
    }
    if (s.hrScore) {
      hrScoreSum += s.hrScore.score || 0;
      hrMaxScoreSum += s.hrScore.maxScore || 0;
    }

    if (s.topicStats) {
      const statsObj = s.topicStats instanceof Map ? Object.fromEntries(s.topicStats) : s.topicStats;
      for (const [top, stats] of Object.entries(statsObj)) {
        if (!topicAggregateMap[top]) {
          topicAggregateMap[top] = { total: 0, answered: 0, score: 0, maxScore: 0 };
        }
        topicAggregateMap[top].total += stats.total || 0;
        topicAggregateMap[top].answered += stats.answered || 0;
        topicAggregateMap[top].score += stats.score || 0;
        topicAggregateMap[top].maxScore += stats.maxScore || 0;
      }
    }
  }

  const overallAverageScore = totalMaxScoreSum > 0 ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) : 0;
  const technicalAveragePercentage = techMaxScoreSum > 0 ? Math.round((techScoreSum / techMaxScoreSum) * 100) : 0;
  const hrAveragePercentage = hrMaxScoreSum > 0 ? Math.round((hrScoreSum / hrMaxScoreSum) * 100) : 0;

  const strongTopics = [];
  const weakTopics = [];

  for (const [topicName, data] of Object.entries(topicAggregateMap)) {
    const topicPct = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
    data.percentage = topicPct;
    if (topicPct >= 70) {
      strongTopics.push(topicName);
    } else {
      weakTopics.push(topicName);
    }
  }

  // Recent 5 completed interviews
  const recentInterviews = completedSessions.slice(0, 5).map((s) => ({
    id: s._id,
    _id: s._id,
    interviewType: s.interviewType,
    difficulty: s.difficulty,
    percentage: s.percentage,
    totalQuestions: s.totalQuestions,
    answeredQuestions: s.answeredQuestions,
    submittedAt: s.submittedAt,
    createdAt: s.createdAt,
  }));

  res.status(200).json({
    success: true,
    progress: {
      totalInterviews,
      completedInterviews: completedCount,
      overallAveragePercentage: overallAverageScore,
      totalAnsweredQuestions,
      totalQuestionsCount,
      technicalPerformance: {
        score: techScoreSum,
        maxScore: techMaxScoreSum,
        percentage: technicalAveragePercentage,
      },
      hrPerformance: {
        score: hrScoreSum,
        maxScore: hrMaxScoreSum,
        percentage: hrAveragePercentage,
      },
      topicBreakdown: topicAggregateMap,
      strongTopics,
      weakTopics,
      recentInterviews,
    },
  });
};

/**
 * Formats a clean, comprehensive session result payload for response
 */
const formatSessionResult = (session) => {
  return {
    id: session._id,
    _id: session._id,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    status: session.status,
    startedAt: session.startedAt,
    submittedAt: session.submittedAt,
    duration: session.duration,
    totalQuestions: session.totalQuestions,
    answeredQuestions: session.answeredQuestions,
    unansweredQuestions: session.unansweredQuestions,
    score: session.score,
    maxScore: session.maxScore,
    percentage: session.percentage,
    technicalScore: session.technicalScore,
    hrScore: session.hrScore,
    difficultyStats: session.difficultyStats,
    topicStats: session.topicStats,
    strongTopics: session.strongTopics,
    weakTopics: session.weakTopics,
    answers: session.answers,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
};
