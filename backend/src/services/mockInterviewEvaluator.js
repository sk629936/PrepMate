/**
 * Mock Interview Evaluator Service (Phase 1 Backend)
 *
 * Deterministic, rubric-based evaluation engine.
 * Calculates objective scoring based on:
 * 1. Evaluation point coverage (rubric criteria)
 * 2. Keyword and terminology matches
 * 3. Answer depth and substance
 *
 * Designed to be modular so a future AI evaluator can seamlessly integrate.
 */

/**
 * Normalizes text for term comparison
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a phrase or key words from an evaluation point exist in the user's answer
 */
const checkPointCoverage = (point, normalizedUserAnswer, userWordsSet) => {
  const normalizedPoint = normalizeText(point);
  const pointWords = normalizedPoint
    .split(' ')
    .filter((w) => w.length > 3 && !['with', 'that', 'this', 'from', 'have', 'your', 'when', 'what', 'which', 'about', 'their'].includes(w));

  if (pointWords.length === 0) return true;

  // Direct substring match
  if (normalizedUserAnswer.includes(normalizedPoint)) {
    return true;
  }

  // Count how many significant keywords from the rubric point are present
  let matchedWordsCount = 0;
  for (const word of pointWords) {
    if (userWordsSet.has(word) || normalizedUserAnswer.includes(word)) {
      matchedWordsCount++;
    }
  }

  // If at least 50% of the key terms in this evaluation point are present, consider it covered
  const coverageRatio = matchedWordsCount / pointWords.length;
  return coverageRatio >= 0.5;
};

/**
 * Evaluates a single question answer
 * @param {Object} question - The MockInterviewQuestion document or populated question object
 * @param {String} rawUserAnswer - The text answer submitted by the user
 * @returns {Object} Evaluation detail with score, feedback, pointsCovered, pointsMissed
 */
export const evaluateSingleAnswer = (question, rawUserAnswer) => {
  const userAnswer = typeof rawUserAnswer === 'string' ? rawUserAnswer.trim() : '';
  const isAnswered = userAnswer.length > 0;

  const evaluationPoints = Array.isArray(question.evaluationPoints) ? question.evaluationPoints : [];
  const keywords = Array.isArray(question.keywords) ? question.keywords : [];

  if (!isAnswered) {
    return {
      isAnswered: false,
      score: 0,
      evaluationResult: {
        score: 0,
        feedback: 'No response was provided for this question.',
        pointsCovered: [],
        pointsMissed: evaluationPoints,
        keywordMatchRate: 0,
        evaluatedAt: new Date(),
      },
    };
  }

  const normalizedUserAnswer = normalizeText(userAnswer);
  const userWords = normalizedUserAnswer.split(' ').filter(Boolean);
  const userWordsSet = new Set(userWords);

  // 1. Evaluate rubric points coverage
  const pointsCovered = [];
  const pointsMissed = [];

  for (const point of evaluationPoints) {
    if (checkPointCoverage(point, normalizedUserAnswer, userWordsSet)) {
      pointsCovered.push(point);
    } else {
      pointsMissed.push(point);
    }
  }

  const pointCoverageRatio =
    evaluationPoints.length > 0 ? pointsCovered.length / evaluationPoints.length : 1.0;

  // 2. Evaluate keywords presence
  let matchedKeywordsCount = 0;
  for (const kw of keywords) {
    const normKw = normalizeText(kw);
    if (normKw && (normalizedUserAnswer.includes(normKw) || userWordsSet.has(normKw))) {
      matchedKeywordsCount++;
    }
  }

  const keywordMatchRate =
    keywords.length > 0 ? matchedKeywordsCount / keywords.length : 1.0;

  // 3. Length & depth metric (encourages well-structured, comprehensive answers)
  let depthFactor = 0.5;
  if (userWords.length >= 60) depthFactor = 1.0;
  else if (userWords.length >= 35) depthFactor = 0.85;
  else if (userWords.length >= 15) depthFactor = 0.7;
  else depthFactor = 0.4;

  // 4. Calculate score (0 to 100)
  // Weighted: 55% rubric points coverage + 30% keywords matching + 15% depth
  let rawScore = (pointCoverageRatio * 55) + (keywordMatchRate * 30) + (depthFactor * 15);
  const finalScore = Math.min(Math.max(Math.round(rawScore), 0), 100);

  // 5. Generate structured deterministic feedback
  let feedback = '';
  if (finalScore >= 85) {
    feedback = 'Excellent answer! You covered the key principles thoroughly with strong technical/behavioral terminology.';
  } else if (finalScore >= 70) {
    feedback = 'Good response. You addressed the core requirements, but adding more depth or missing points would make it exceptional.';
  } else if (finalScore >= 50) {
    feedback = 'Decent attempt. You identified basic concepts, but several key evaluation criteria were missed.';
  } else {
    feedback = 'Needs improvement. The response lacked essential key concepts and depth expected for this topic.';
  }

  if (pointsMissed.length > 0 && pointsMissed.length <= 3) {
    feedback += ` Focus on including: "${pointsMissed.join('; ')}".`;
  }

  return {
    isAnswered: true,
    score: finalScore,
    evaluationResult: {
      score: finalScore,
      feedback,
      pointsCovered,
      pointsMissed,
      keywordMatchRate: Math.round(keywordMatchRate * 100),
      evaluatedAt: new Date(),
    },
  };
};

/**
 * Evaluates all answers in a mock interview session and compiles full statistics
 * @param {Array} sessionAnswers - Array of answer items
 * @returns {Object} Complete evaluation report and statistics
 */
export const compileSessionEvaluation = (sessionAnswers) => {
  let totalScore = 0;
  let answeredCount = 0;
  let unansweredCount = 0;

  const techStats = { total: 0, answered: 0, score: 0, maxScore: 0, percentage: 0 };
  const hrStats = { total: 0, answered: 0, score: 0, maxScore: 0, percentage: 0 };

  const topicStatsMap = {};
  const difficultyStatsMap = {};

  const evaluatedAnswers = sessionAnswers.map((item) => {
    const evaluation = evaluateSingleAnswer(item, item.userAnswer);

    const isAns = evaluation.isAnswered;
    const itemScore = evaluation.score;

    if (isAns) answeredCount++;
    else unansweredCount++;

    totalScore += itemScore;

    // Track technical vs HR stats
    const track = item.type === 'technical' ? techStats : hrStats;
    track.total++;
    track.maxScore += 100;
    track.score += itemScore;
    if (isAns) track.answered++;

    // Track topic stats
    const topic = item.topic || 'General';
    if (!topicStatsMap[topic]) {
      topicStatsMap[topic] = { total: 0, answered: 0, score: 0, maxScore: 0, percentage: 0 };
    }
    topicStatsMap[topic].total++;
    topicStatsMap[topic].maxScore += 100;
    topicStatsMap[topic].score += itemScore;
    if (isAns) topicStatsMap[topic].answered++;

    // Track difficulty stats
    const diff = item.difficulty || 'Medium';
    if (!difficultyStatsMap[diff]) {
      difficultyStatsMap[diff] = { total: 0, answered: 0, score: 0, maxScore: 0, percentage: 0 };
    }
    difficultyStatsMap[diff].total++;
    difficultyStatsMap[diff].maxScore += 100;
    difficultyStatsMap[diff].score += itemScore;
    if (isAns) difficultyStatsMap[diff].answered++;

    return {
      question: item.question,
      questionText: item.questionText,
      type: item.type,
      topic: item.topic,
      subtopic: item.subtopic,
      difficulty: item.difficulty,
      expectedAnswer: item.expectedAnswer,
      explanation: item.explanation,
      evaluationPoints: item.evaluationPoints,
      userAnswer: item.userAnswer || '',
      isAnswered: isAns,
      evaluationResult: evaluation.evaluationResult,
      score: itemScore,
      answeredAt: item.answeredAt || (isAns ? new Date() : null),
    };
  });

  const totalQuestions = evaluatedAnswers.length;
  const maxScore = totalQuestions * 100;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Finalize tech and HR percentages
  techStats.percentage = techStats.maxScore > 0 ? Math.round((techStats.score / techStats.maxScore) * 100) : 0;
  hrStats.percentage = hrStats.maxScore > 0 ? Math.round((hrStats.score / hrStats.maxScore) * 100) : 0;

  // Finalize topic percentages & identify strong/weak topics
  const strongTopics = [];
  const weakTopics = [];

  for (const [top, stats] of Object.entries(topicStatsMap)) {
    stats.percentage = stats.maxScore > 0 ? Math.round((stats.score / stats.maxScore) * 100) : 0;
    if (stats.percentage >= 70) {
      strongTopics.push(top);
    } else {
      weakTopics.push(top);
    }
  }

  // Finalize difficulty percentages
  for (const stats of Object.values(difficultyStatsMap)) {
    stats.percentage = stats.maxScore > 0 ? Math.round((stats.score / stats.maxScore) * 100) : 0;
  }

  return {
    evaluatedAnswers,
    totalQuestions,
    answeredQuestions: answeredCount,
    unansweredQuestions: unansweredCount,
    score: totalScore,
    maxScore,
    percentage,
    technicalScore: techStats,
    hrScore: hrStats,
    difficultyStats: difficultyStatsMap,
    topicStats: topicStatsMap,
    strongTopics,
    weakTopics,
  };
};
