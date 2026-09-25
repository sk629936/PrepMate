import AptitudeQuestion from '../models/AptitudeQuestion.js';
import AptitudeAttempt from '../models/AptitudeAttempt.js';
import AptitudeTestResult from '../models/AptitudeTestResult.js';
import User from '../models/User.js';
import { CATEGORIES, QUANTITATIVE_CHAPTERS, LOGICAL_CHAPTERS, VERBAL_CHAPTERS, DIFFICULTY_LEVELS } from '../data/aptitudeCatalog.js';
import { seedQuestions } from '../data/seedAptitudeQuestions.js';

/**
 * Ensures seed questions exist in DB. If DB has fewer questions than the seed bank,
 * inserts only the missing ones (based on exact question text matching).
 */
const ensureSeedQuestions = async () => {
  const count = await AptitudeQuestion.countDocuments();
  if (count < seedQuestions.length) {
    // Find which seed questions are not yet in DB
    const existingTexts = await AptitudeQuestion.distinct('question');
    const existingSet = new Set(existingTexts);
    const toInsert = seedQuestions.filter((q) => !existingSet.has(q.question));
    if (toInsert.length > 0) {
      await AptitudeQuestion.insertMany(toInsert, { ordered: false });
    }
  }
};

// --- USER FACING APIS ---

/**
 * GET /api/aptitude/categories
 */
export const getCategories = async (req, res) => {
  await ensureSeedQuestions();
  res.status(200).json({
    success: true,
    categories: CATEGORIES,
  });
};

/**
 * GET /api/aptitude/topics
 */
export const getTopics = async (req, res) => {
  await ensureSeedQuestions();
  const { category, chapter } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (chapter) filter.chapter = chapter;

  const topics = await AptitudeQuestion.distinct('topic', filter);
  res.status(200).json({
    success: true,
    topics: topics.filter(Boolean),
  });
};

/**
 * GET /api/aptitude/questions
 * Practice question list with filters
 */
export const getQuestions = async (req, res) => {
  await ensureSeedQuestions();
  const { category, chapter, topic, difficulty, limit = 20, page = 1 } = req.query;

  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (chapter) filter.chapter = chapter;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await AptitudeQuestion.countDocuments(filter);

  // Return questions without exposing correctAnswerIndex before submission in practice mode if desired,
  // or return safe question structure
  const questions = await AptitudeQuestion.find(filter)
    .select('-normalizedQuestion -companyPatternReferences')
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Strip correctAnswerIndex so user cannot cheat in browser dev tools before submit
  const safeQuestions = questions.map((q) => {
    const { correctAnswerIndex, explanation, ...safe } = q;
    return safe;
  });

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
    questions: safeQuestions,
  });
};

/**
 * GET /api/aptitude/questions/:id
 */
export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  const question = await AptitudeQuestion.findById(id).select('-normalizedQuestion').lean();

  if (!question || !question.isPublished) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  const { correctAnswerIndex, explanation, ...safe } = question;
  res.status(200).json({
    success: true,
    question: safe,
  });
};

/**
 * POST /api/aptitude/questions/:id/attempt
 * Practice mode answer submission
 */
export const attemptQuestion = async (req, res) => {
  const { id } = req.params;
  const { selectedAnswerIndex, timeTakenSeconds = 0 } = req.body;
  const userId = req.user.userId;

  if (selectedAnswerIndex === undefined || selectedAnswerIndex < 0 || selectedAnswerIndex > 3) {
    return res.status(400).json({ success: false, message: 'Valid selectedAnswerIndex (0-3) is required' });
  }

  const question = await AptitudeQuestion.findById(id);
  if (!question || !question.isPublished) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  const isCorrect = question.correctAnswerIndex === Number(selectedAnswerIndex);

  // Save practice attempt
  await AptitudeAttempt.create({
    userId,
    questionId: question._id,
    category: question.category,
    chapter: question.chapter,
    topic: question.topic || '',
    difficulty: question.difficulty,
    selectedAnswerIndex: Number(selectedAnswerIndex),
    isCorrect,
    timeTakenSeconds: Number(timeTakenSeconds),
  });

  res.status(200).json({
    success: true,
    isCorrect,
    correctAnswerIndex: question.correctAnswerIndex,
    explanation: question.explanation,
  });
};

/**
 * GET /api/aptitude/progress
 * Real user-specific progress analytics
 */
export const getUserProgress = async (req, res) => {
  const userId = req.user.userId;

  const attempts = await AptitudeAttempt.find({ userId }).lean();
  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const totalIncorrect = totalAttempted - totalCorrect;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Category breakdown
  const categoryStats = {
    'Quantitative Aptitude': { attempted: 0, correct: 0, accuracy: 0 },
    'Logical Reasoning': { attempted: 0, correct: 0, accuracy: 0 },
    'Verbal Ability': { attempted: 0, correct: 0, accuracy: 0 },
  };

  const topicMap = {};

  attempts.forEach((a) => {
    if (categoryStats[a.category]) {
      categoryStats[a.category].attempted += 1;
      if (a.isCorrect) categoryStats[a.category].correct += 1;
    }

    const tKey = a.chapter || 'General';
    if (!topicMap[tKey]) {
      topicMap[tKey] = { attempted: 0, correct: 0 };
    }
    topicMap[tKey].attempted += 1;
    if (a.isCorrect) topicMap[tKey].correct += 1;
  });

  Object.keys(categoryStats).forEach((cat) => {
    const st = categoryStats[cat];
    st.accuracy = st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0;
  });

  const weakTopics = [];
  const strongTopics = [];

  Object.keys(topicMap).forEach((top) => {
    const st = topicMap[top];
    const acc = st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0;
    if (st.attempted >= 2) {
      if (acc < 50) weakTopics.push(top);
      else if (acc >= 75) strongTopics.push(top);
    }
  });

  const testResults = await AptitudeTestResult.find({ userId }).sort({ createdAt: -1 }).lean();
  const testsCompleted = testResults.length;
  const bestTestScore = testResults.reduce((max, t) => Math.max(max, t.score), 0);

  res.status(200).json({
    success: true,
    progress: {
      totalAttempted,
      totalCorrect,
      totalIncorrect,
      accuracy,
      categoryStats,
      testsCompleted,
      bestTestScore,
      weakTopics,
      strongTopics,
      recentAttemptsCount: attempts.length,
      testAttempts: testResults.map((t) => ({
        id: t._id,
        title: t.title,
        testType: t.testType,
        score: t.score,
        accuracy: t.accuracy,
        totalQuestions: t.totalQuestions,
        createdAt: t.createdAt,
      })),
    },
  });
};

// --- FULL APTITUDE TEST APIS ---

/**
 * GET /api/aptitude/tests
 * Configs for Full Aptitude Tests
 */
export const getTestTypes = async (req, res) => {
  const testTypes = [
    {
      id: 'placement-test',
      title: 'Placement Aptitude Test',
      description: 'Comprehensive test combining Quant, Logical, and Verbal questions based on common placement test patterns.',
      category: 'All',
      availableQuestionCounts: [10, 20, 30, 50],
      availableDifficulties: ['Easy', 'Medium', 'Hard', 'Mixed'],
    },
    {
      id: 'quant-test',
      title: 'Quantitative Aptitude Test',
      description: 'Focused test on numerical ability, percentages, time & work, algebra, and data interpretation.',
      category: 'Quantitative Aptitude',
      availableQuestionCounts: [10, 20, 30],
      availableDifficulties: ['Easy', 'Medium', 'Hard', 'Mixed'],
    },
    {
      id: 'logical-test',
      title: 'Logical Reasoning Test',
      description: 'Focused test on series, coding-decoding, blood relations, syllogisms, and puzzles.',
      category: 'Logical Reasoning',
      availableQuestionCounts: [10, 20, 30],
      availableDifficulties: ['Easy', 'Medium', 'Hard', 'Mixed'],
    },
    {
      id: 'verbal-test',
      title: 'Verbal Ability Test',
      description: 'Focused test on reading comprehension, grammar rules, vocabulary, and para jumbles.',
      category: 'Verbal Ability',
      availableQuestionCounts: [10, 20, 30],
      availableDifficulties: ['Easy', 'Medium', 'Hard', 'Mixed'],
    },
    {
      id: 'mixed-test',
      title: 'Mixed Aptitude Practice Test',
      description: 'Quick balanced practice test across all categories.',
      category: 'Mixed',
      availableQuestionCounts: [10, 20, 30],
      availableDifficulties: ['Easy', 'Medium', 'Hard', 'Mixed'],
    },
  ];

  res.status(200).json({
    success: true,
    testTypes,
  });
};

/**
 * GET /api/aptitude/tests/:id
 * Generate a timed test session
 */
export const generateTestSession = async (req, res) => {
  await ensureSeedQuestions();
  const { id } = req.params;
  const { questionCount = 20, difficulty = 'Mixed', category = 'All' } = req.query;

  const filter = { isPublished: true };
  if (category && category !== 'All' && category !== 'Mixed') {
    filter.category = category;
  }
  if (difficulty && difficulty !== 'Mixed') {
    filter.difficulty = difficulty;
  }

  const limit = Math.min(Math.max(Number(questionCount), 5), 50);

  // Fetch candidate questions
  let candidateQuestions = await AptitudeQuestion.find(filter).lean();

  if (candidateQuestions.length < limit) {
    // Fallback if strict filter yields fewer questions
    candidateQuestions = await AptitudeQuestion.find({ isPublished: true }).lean();
  }

  // Shuffle candidate questions
  const shuffled = candidateQuestions.sort(() => 0.5 - Math.random()).slice(0, limit);

  // Strip answers
  const safeQuestions = shuffled.map((q) => {
    const { correctAnswerIndex, explanation, normalizedQuestion, ...safe } = q;
    return safe;
  });

  // Calculate timer duration: 1.5 minutes per question
  const durationSeconds = limit * 90;

  res.status(200).json({
    success: true,
    test: {
      testId: id,
      totalQuestions: safeQuestions.length,
      durationSeconds,
      questions: safeQuestions,
    },
  });
};

/**
 * POST /api/aptitude/tests/:id/submit
 * Submit test answers and persist result
 */
export const submitTestSession = async (req, res) => {
  const { id } = req.params;
  const { testType, title, answers = [], timeTakenSeconds = 0, totalDurationSeconds = 1800, difficultyConfig = 'Mixed' } = req.body;
  const userId = req.user.userId;

  const questionIds = answers.map((a) => a.questionId);
  const questionsInDb = await AptitudeQuestion.find({ _id: { $in: questionIds } }).lean();
  const qMap = new Map(questionsInDb.map((q) => [q._id.toString(), q]));

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const details = [];
  const catPerf = {};
  const topPerf = {};

  answers.forEach((ans) => {
    const q = qMap.get(ans.questionId.toString());
    if (!q) return;

    const sel = ans.selectedAnswerIndex !== undefined && ans.selectedAnswerIndex !== null ? Number(ans.selectedAnswerIndex) : null;
    const isAttempted = sel !== null && sel >= 0 && sel <= 3;
    const isCorrect = isAttempted && sel === q.correctAnswerIndex;

    if (!isAttempted) unattemptedCount++;
    else if (isCorrect) correctCount++;
    else incorrectCount++;

    details.push({
      questionId: q._id,
      category: q.category,
      chapter: q.chapter,
      topic: q.topic || '',
      difficulty: q.difficulty,
      selectedAnswerIndex: sel,
      correctAnswerIndex: q.correctAnswerIndex,
      isCorrect,
    });

    // Category perf
    if (!catPerf[q.category]) catPerf[q.category] = { total: 0, attempted: 0, correct: 0, accuracy: 0 };
    catPerf[q.category].total += 1;
    if (isAttempted) catPerf[q.category].attempted += 1;
    if (isCorrect) catPerf[q.category].correct += 1;

    // Topic perf
    const ch = q.chapter || 'General';
    if (!topPerf[ch]) topPerf[ch] = { total: 0, attempted: 0, correct: 0, accuracy: 0 };
    topPerf[ch].total += 1;
    if (isAttempted) topPerf[ch].attempted += 1;
    if (isCorrect) topPerf[ch].correct += 1;
  });

  Object.keys(catPerf).forEach((c) => {
    const p = catPerf[c];
    p.accuracy = p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0;
  });

  const weakTopics = [];
  const strongTopics = [];

  Object.keys(topPerf).forEach((t) => {
    const p = topPerf[t];
    p.accuracy = p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0;
    if (p.attempted >= 1) {
      if (p.accuracy < 50) weakTopics.push(t);
      else if (p.accuracy >= 75) strongTopics.push(t);
    }
  });

  const totalQuestions = answers.length;
  const attemptedCount = attemptedCountCalculation(answers);
  const score = correctCount; // 1 mark per correct
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const resultRecord = await AptitudeTestResult.create({
    userId,
    title: title || 'Aptitude Test',
    testType: testType || 'Placement Aptitude Test',
    category: req.body.category || 'Mixed',
    difficultyConfig,
    totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    score,
    accuracy,
    timeTakenSeconds: Number(timeTakenSeconds),
    totalDurationSeconds: Number(totalDurationSeconds),
    categoryPerformance: catPerf,
    topicPerformance: topPerf,
    weakTopics,
    strongTopics,
    details,
  });

  // Also sync user progress count in User model
  const user = await User.findById(userId);
  if (user) {
    if (!user.progress) user.progress = {};
    if (!user.progress.aptitude) user.progress.aptitude = { testsCompleted: 0 };
    const totalTests = await AptitudeTestResult.countDocuments({ userId });
    user.progress.aptitude.testsCompleted = totalTests;
    await user.save();
  }

  res.status(200).json({
    success: true,
    resultId: resultRecord._id,
    result: {
      id: resultRecord._id,
      title: resultRecord.title,
      testType: resultRecord.testType,
      totalQuestions,
      attemptedCount,
      correctCount,
      incorrectCount,
      unattemptedCount,
      score,
      accuracy,
      timeTakenSeconds: resultRecord.timeTakenSeconds,
      categoryPerformance: catPerf,
      topicPerformance: topPerf,
      weakTopics,
      strongTopics,
      questionsWithExplanations: questionsInDb.map((q) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        category: q.category,
        chapter: q.chapter,
      })),
    },
  });
};

function attemptedCountCalculation(answers) {
  return answers.filter((a) => a.selectedAnswerIndex !== undefined && a.selectedAnswerIndex !== null && a.selectedAnswerIndex >= 0).length;
}

/**
 * GET /api/aptitude/results
 * Test result history or single result detail
 */
export const getResults = async (req, res) => {
  const userId = req.user.userId;
  const { testId } = req.query;

  if (testId) {
    const result = await AptitudeTestResult.findOne({ _id: testId, userId }).lean();
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
    return res.status(200).json({ success: true, result });
  }

  const results = await AptitudeTestResult.find({ userId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    results,
  });
};
