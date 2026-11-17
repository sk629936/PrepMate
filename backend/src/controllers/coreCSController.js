import mongoose from 'mongoose';
import CoreCSQuestion from '../models/CoreCSQuestion.js';
import CoreCSAttempt from '../models/CoreCSAttempt.js';
import CoreCSTest from '../models/CoreCSTest.js';
import { CORE_CS_SUBJECTS, CORE_CS_DIFFICULTIES, TEST_QUESTION_COUNTS } from '../data/coreCSCatalog.js';
import { seedCoreCSQuestions } from '../data/seedCoreCSQuestions.js';

/**
 * Ensures seed Core CS questions exist in DB upon first query.
 */
export const ensureCoreCSSeedQuestions = async () => {
  const count = await CoreCSQuestion.countDocuments();
  if (count === 0) {
    await CoreCSQuestion.insertMany(seedCoreCSQuestions, { ordered: false });
  }
};

/**
 * GET /api/core-cs/questions
 * List published questions with filters (Subject, Topic, Difficulty, Pagination)
 * Do NOT return correctAnswer or explanation.
 */
export const getQuestions = async (req, res) => {
  await ensureCoreCSSeedQuestions();

  const { subject, topic, difficulty, limit = 20, page = 1 } = req.query;

  const filter = { isPublished: true };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await CoreCSQuestion.countDocuments(filter);
  const questions = await CoreCSQuestion.find(filter)
    .select('-correctAnswer -explanation')
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
 * GET /api/core-cs/questions/:id
 * Retrieve a single published question by ID without exposing correctAnswer or explanation.
 */
export const getQuestionById = async (req, res) => {
  await ensureCoreCSSeedQuestions();

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid question ID format',
    });
  }

  const question = await CoreCSQuestion.findOne({ _id: id, isPublished: true })
    .select('-correctAnswer -explanation')
    .lean();

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found',
    });
  }

  res.status(200).json({
    success: true,
    question,
  });
};

/**
 * POST /api/core-cs/practice/submit
 * Submit an answer for a practice question.
 * Evaluates correctness on backend, records attempt, returns full feedback.
 */
export const submitPracticeAnswer = async (req, res) => {
  const { questionId, question: qIdBody, id: altId, selectedAnswer } = req.body;
  const targetId = questionId || qIdBody || altId;

  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({
      success: false,
      error: 'Valid question ID is required',
    });
  }

  if (selectedAnswer === undefined || selectedAnswer === null || String(selectedAnswer).trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Selected answer is required',
    });
  }

  const question = await CoreCSQuestion.findOne({ _id: targetId, isPublished: true });
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found or is unpublished',
    });
  }

  // Calculate correctness on the backend
  const trimmedSelected = String(selectedAnswer).trim();
  const isCorrect = trimmedSelected === String(question.correctAnswer).trim();

  // Save attempt record for the authenticated user
  const attempt = new CoreCSAttempt({
    user: req.user.userId,
    question: question._id,
    selectedAnswer: trimmedSelected,
    isCorrect,
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
  });
  await attempt.save();

  res.status(200).json({
    success: true,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    question: {
      _id: question._id,
      question: question.question,
      options: question.options,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      source: question.source,
    },
  });
};

/**
 * GET /api/core-cs/progress
 * Get user progress calculated from real CoreCSAttempt records.
 */
export const getUserProgress = async (req, res) => {
  const userId = req.user.userId;

  const totalAttempts = await CoreCSAttempt.countDocuments({ user: userId });
  const totalCorrect = await CoreCSAttempt.countDocuments({ user: userId, isCorrect: true });
  const totalWrong = totalAttempts - totalCorrect;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const uniqueAttemptedQuestions = await CoreCSAttempt.distinct('question', { user: userId });
  const uniqueSolvedQuestions = await CoreCSAttempt.distinct('question', { user: userId, isCorrect: true });

  // Calculate per-subject statistics
  const subjectStats = {};
  for (const subject of CORE_CS_SUBJECTS) {
    const attempts = await CoreCSAttempt.countDocuments({ user: userId, subject });
    const correct = await CoreCSAttempt.countDocuments({ user: userId, subject, isCorrect: true });
    const uniqueSolved = (await CoreCSAttempt.distinct('question', { user: userId, subject, isCorrect: true })).length;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    subjectStats[subject] = {
      attempted: attempts,
      correct,
      wrong: attempts - correct,
      uniqueSolved,
      accuracy,
    };
  }

  // Fetch recent attempts
  const recentAttempts = await CoreCSAttempt.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('question', 'question subject topic difficulty')
    .lean();

  res.status(200).json({
    success: true,
    progress: {
      overall: {
        totalAttempts,
        totalCorrect,
        totalWrong,
        accuracy: overallAccuracy,
        uniqueAttempted: uniqueAttemptedQuestions.length,
        uniqueSolved: uniqueSolvedQuestions.length,
      },
      subjectStats,
      recentAttempts,
    },
  });
};

/**
 * POST /api/core-cs/tests/generate
 * Generate a randomized full/sectional Core CS timed test.
 * Supports: 10, 20, 30, 50 questions.
 * Difficulty: Easy, Medium, Hard, Mixed.
 * Subject: Specific subject or Mixed.
 */
export const generateTest = async (req, res) => {
  await ensureCoreCSSeedQuestions();

  const { questionCount = 10, difficulty = 'Mixed', subject = 'Mixed' } = req.body;

  const countNum = Number(questionCount);
  if (!TEST_QUESTION_COUNTS.includes(countNum)) {
    return res.status(400).json({
      success: false,
      error: `Question count must be one of: ${TEST_QUESTION_COUNTS.join(', ')}`,
    });
  }

  const matchFilter = { isPublished: true };

  if (subject && subject !== 'Mixed' && subject !== 'All') {
    if (!CORE_CS_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        error: `Subject must be one of: ${CORE_CS_SUBJECTS.join(', ')} or Mixed`,
      });
    }
    matchFilter.subject = subject;
  }

  if (difficulty && difficulty !== 'Mixed') {
    if (!CORE_CS_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: `Difficulty must be one of: ${CORE_CS_DIFFICULTIES.join(', ')} or Mixed`,
      });
    }
    matchFilter.difficulty = difficulty;
  }

  // Select published questions using $sample
  const selectedQuestions = await CoreCSQuestion.aggregate([
    { $match: matchFilter },
    { $sample: { size: countNum } },
  ]);

  if (selectedQuestions.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No published questions found matching the requested criteria',
    });
  }

  const test = new CoreCSTest({
    user: req.user.userId,
    subject: subject || 'Mixed',
    difficulty: difficulty || 'Mixed',
    questions: selectedQuestions.map((q) => q._id),
    totalQuestions: selectedQuestions.length,
    duration: selectedQuestions.length * 60, // 60 seconds per question
    status: 'generated',
  });

  await test.save();

  // Return clean questions without exposing correctAnswer and explanation
  const safeQuestions = selectedQuestions.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
  }));

  res.status(201).json({
    success: true,
    test: {
      id: test._id,
      _id: test._id,
      totalQuestions: test.totalQuestions,
      subject: test.subject,
      difficulty: test.difficulty,
      duration: test.duration,
      questions: safeQuestions,
      createdAt: test.createdAt,
    },
  });
};

/**
 * POST /api/core-cs/tests/:id/submit
 * Submit test responses and calculate scores on backend.
 */
export const submitTest = async (req, res) => {
  const { id } = req.params;
  const { answers = [], duration = 0 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid test ID format',
    });
  }

  const test = await CoreCSTest.findById(id);
  if (!test) {
    return res.status(404).json({
      success: false,
      error: 'Test session not found',
    });
  }

  // Verify test belongs to authenticated user
  if (test.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this test session.',
    });
  }

  // Load all test questions with correct answers and explanations
  const questions = await CoreCSQuestion.find({ _id: { $in: test.questions } }).lean();
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  // Normalize submitted answers into a lookup Map
  const userAnswersMap = new Map();
  if (Array.isArray(answers)) {
    for (const ans of answers) {
      const qId = ans.questionId || ans.question || ans._id;
      if (qId) {
        userAnswersMap.set(qId.toString(), ans.selectedAnswer);
      }
    }
  } else if (typeof answers === 'object' && answers !== null) {
    for (const [qId, selectedAns] of Object.entries(answers)) {
      userAnswersMap.set(qId.toString(), selectedAns);
    }
  }

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  const subjectStatsObj = {};
  const topicStatsObj = {};
  const evaluatedAnswers = [];

  for (const qId of test.questions) {
    const question = questionMap.get(qId.toString());
    if (!question) continue;

    const selectedAnswer = userAnswersMap.get(qId.toString());
    const isUnattempted = selectedAnswer === undefined || selectedAnswer === null || String(selectedAnswer).trim() === '';
    const trimmedSelected = isUnattempted ? null : String(selectedAnswer).trim();
    const isCorrect = !isUnattempted && trimmedSelected === String(question.correctAnswer).trim();

    if (isUnattempted) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }

    // Init subject stats
    if (!subjectStatsObj[question.subject]) {
      subjectStatsObj[question.subject] = { total: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 };
    }
    subjectStatsObj[question.subject].total++;
    if (isUnattempted) subjectStatsObj[question.subject].unattempted++;
    else if (isCorrect) subjectStatsObj[question.subject].correct++;
    else subjectStatsObj[question.subject].wrong++;

    // Init topic stats
    const topicKey = `${question.subject} - ${question.topic}`;
    if (!topicStatsObj[topicKey]) {
      topicStatsObj[topicKey] = { total: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 };
    }
    topicStatsObj[topicKey].total++;
    if (isUnattempted) topicStatsObj[topicKey].unattempted++;
    else if (isCorrect) topicStatsObj[topicKey].correct++;
    else topicStatsObj[topicKey].wrong++;

    evaluatedAnswers.push({
      question: question._id,
      questionText: question.question,
      options: question.options,
      selectedAnswer: trimmedSelected,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
    });

    // Record individual attempt in CoreCSAttempt if attempted
    if (!isUnattempted) {
      try {
        await CoreCSAttempt.create({
          user: req.user.userId,
          question: question._id,
          selectedAnswer: trimmedSelected,
          isCorrect,
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
        });
      } catch (err) {
        console.error('Error saving attempt from test submit:', err);
      }
    }
  }

  // Calculate percentage accuracies
  for (const s of Object.keys(subjectStatsObj)) {
    const sStat = subjectStatsObj[s];
    const attempted = sStat.total - sStat.unattempted;
    sStat.accuracy = attempted > 0 ? Math.round((sStat.correct / attempted) * 100) : 0;
  }
  for (const t of Object.keys(topicStatsObj)) {
    const tStat = topicStatsObj[t];
    const attempted = tStat.total - tStat.unattempted;
    tStat.accuracy = attempted > 0 ? Math.round((tStat.correct / attempted) * 100) : 0;
  }

  const score = correctCount; // 1 mark per question

  test.answers = evaluatedAnswers;
  test.correct = correctCount;
  test.wrong = wrongCount;
  test.unattempted = unattemptedCount;
  test.score = score;
  test.duration = Number(duration) || test.duration;
  test.subjectStats = subjectStatsObj;
  test.topicStats = topicStatsObj;
  test.status = 'completed';

  await test.save();

  res.status(200).json({
    success: true,
    result: {
      id: test._id,
      _id: test._id,
      totalQuestions: test.totalQuestions,
      correct: test.correct,
      wrong: test.wrong,
      unattempted: test.unattempted,
      score: test.score,
      duration: test.duration,
      subjectStats: test.subjectStats,
      topicStats: test.topicStats,
      answers: test.answers,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    },
  });
};

/**
 * GET /api/core-cs/tests/:id/result
 * Retrieve completed test result. Accessible ONLY by test owner.
 */
export const getTestResult = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid test ID format',
    });
  }

  const test = await CoreCSTest.findById(id).lean();
  if (!test) {
    return res.status(404).json({
      success: false,
      error: 'Test result not found',
    });
  }

  if (test.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. You do not own this test result.',
    });
  }

  res.status(200).json({
    success: true,
    result: {
      id: test._id,
      _id: test._id,
      subject: test.subject,
      difficulty: test.difficulty,
      totalQuestions: test.totalQuestions,
      correct: test.correct,
      wrong: test.wrong,
      unattempted: test.unattempted,
      score: test.score,
      duration: test.duration,
      subjectStats: test.subjectStats,
      topicStats: test.topicStats,
      answers: test.answers,
      status: test.status,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    },
  });
};
