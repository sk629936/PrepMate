import User from '../models/User.js';
import DSAProblem from '../models/DSAProblem.js';
import { topics, problems as staticProblems, getProblemById as getStaticProblemById, getSafeProblemData } from '../data/dsaProblems.js';
import { seedDSAProblemsIfEmpty } from '../data/seedDSAProblems.js';

// Scoring weights: Easy = 1, Medium = 2, Hard = 3
const DIFFICULTY_WEIGHTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/**
 * Fetch all active and published problems from MongoDB, fallback to static if needed
 */
async function getActivePublishedProblems() {
  try {
    await seedDSAProblemsIfEmpty();
    const dbProblems = await DSAProblem.find({ isPublished: true, isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    if (dbProblems && dbProblems.length > 0) {
      return dbProblems;
    }
  } catch (err) {
    console.warn('Database query for DSA problems failed, using static catalog fallback:', err.message);
  }
  return staticProblems;
}

/**
 * Fetch a single problem by ID from MongoDB, fallback to static
 */
async function findProblemById(problemId) {
  try {
    const p = await DSAProblem.findOne({ id: problemId, isPublished: true, isActive: true }).lean();
    if (p) return p;
  } catch {
    // fallback
  }
  return getStaticProblemById(problemId);
}

/**
 * Calculate max possible score across all active problems
 */
export const calculateMaxScore = (problemList = staticProblems) => {
  return problemList.reduce((acc, p) => acc + (DIFFICULTY_WEIGHTS[p.difficulty] || 1), 0);
};

/**
 * Calculate user score based on solved problem IDs
 */
export const calculateUserScore = (solvedProblemIds = [], problemList = staticProblems) => {
  const problemMap = new Map(problemList.map((p) => [p.id, p]));
  return solvedProblemIds.reduce((acc, id) => {
    const problem = problemMap.get(id) || getStaticProblemById(id);
    if (problem) {
      return acc + (DIFFICULTY_WEIGHTS[problem.difficulty] || 1);
    }
    return acc;
  }, 0);
};

/**
 * GET /api/dsa/data
 * Returns all topics, problems, user progress, topic breakdown, difficulty breakdown, and DSA score.
 */
export const getDSAData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('progress.dsa');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const dsaProgress = user.progress?.dsa || { solved: 0, solvedProblems: [] };
    const solvedProblemIds = dsaProgress.solvedProblems || [];

    const problems = await getActivePublishedProblems();

    // Safe problem dataset for frontend
    const safeProblems = problems.map(getSafeProblemData);

    // Compute topic progress from actual problem data
    const topicsWithCounts = topics.map((t) => {
      const topicProblems = problems.filter((p) => p.topic === t.id);
      const solvedCount = topicProblems.filter((p) => solvedProblemIds.includes(p.id)).length;
      return {
        ...t,
        totalProblems: topicProblems.length,
        solvedProblemsCount: solvedCount,
      };
    });

    // Compute difficulty stats
    const difficultyStats = {
      Easy: {
        total: problems.filter((p) => p.difficulty === 'Easy').length,
        solved: problems.filter((p) => p.difficulty === 'Easy' && solvedProblemIds.includes(p.id)).length,
      },
      Medium: {
        total: problems.filter((p) => p.difficulty === 'Medium').length,
        solved: problems.filter((p) => p.difficulty === 'Medium' && solvedProblemIds.includes(p.id)).length,
      },
      Hard: {
        total: problems.filter((p) => p.difficulty === 'Hard').length,
        solved: problems.filter((p) => p.difficulty === 'Hard' && solvedProblemIds.includes(p.id)).length,
      },
    };

    // Calculate score
    const maxScore = calculateMaxScore(problems);
    const userScore = calculateUserScore(solvedProblemIds, problems);

    const totalProblems = problems.length;
    const solvedCount = solvedProblemIds.length;
    const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    res.status(200).json({
      success: true,
      topics: topicsWithCounts,
      problems: safeProblems,
      progress: {
        solved: solvedCount,
        total: totalProblems,
        progressPercent,
        solvedProblems: solvedProblemIds,
        difficultyStats,
        score: {
          userScore,
          maxScore,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching DSA data:', error);
    res.status(500).json({ success: false, error: 'Failed to load DSA data' });
  }
};

/**
 * GET /api/dsa/problems/:problemId
 * Returns a single problem with safe data + user solved status.
 */
export const getProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const problem = await findProblemById(problemId);

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const user = await User.findById(req.user.userId).select('progress.dsa.solvedProblems');
    const isSolved = user?.progress?.dsa?.solvedProblems?.includes(problemId) || false;

    const safeProblem = getSafeProblemData(problem);

    res.status(200).json({
      success: true,
      problem: safeProblem,
      isSolved,
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ success: false, error: 'Failed to load problem' });
  }
};

/**
 * POST /api/dsa/solve
 * Authenticated request to mark a problem as solved for req.user.userId.
 */
export const markProblemSolved = async (req, res) => {
  try {
    const { problemId } = req.body;
    if (!problemId) {
      return res.status(400).json({ success: false, error: 'Problem ID is required' });
    }

    const problem = await findProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Invalid problem ID' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.progress) user.progress = {};
    if (!user.progress.dsa) user.progress.dsa = { solved: 0, solvedProblems: [] };
    if (!user.progress.dsa.solvedProblems) user.progress.dsa.solvedProblems = [];

    if (!user.progress.dsa.solvedProblems.includes(problemId)) {
      user.progress.dsa.solvedProblems.push(problemId);
      user.progress.dsa.solved = user.progress.dsa.solvedProblems.length;

      const activeProblems = await getActivePublishedProblems();
      const totalProblems = activeProblems.length;
      user.progress.overall = totalProblems > 0 ? Math.round((user.progress.dsa.solved / totalProblems) * 100) : 0;

      await user.save();
    }

    const activeProblems = await getActivePublishedProblems();
    const solvedProblemIds = user.progress.dsa.solvedProblems;
    const maxScore = calculateMaxScore(activeProblems);
    const userScore = calculateUserScore(solvedProblemIds, activeProblems);
    const progressPercent = activeProblems.length > 0 ? Math.round((solvedProblemIds.length / activeProblems.length) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'Problem marked as solved',
      progress: {
        solved: solvedProblemIds.length,
        total: activeProblems.length,
        progressPercent,
        solvedProblems: solvedProblemIds,
        score: {
          userScore,
          maxScore,
        },
      },
    });
  } catch (error) {
    console.error('Error marking problem solved:', error);
    res.status(500).json({ success: false, error: 'Failed to mark problem as solved' });
  }
};

/**
 * POST /api/dsa/unsolve
 * Authenticated request to mark a problem as unsolved for req.user.userId.
 */
export const markProblemUnsolved = async (req, res) => {
  try {
    const { problemId } = req.body;
    if (!problemId) {
      return res.status(400).json({ success: false, error: 'Problem ID is required' });
    }

    const problem = await findProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Invalid problem ID' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.progress || !user.progress.dsa || !user.progress.dsa.solvedProblems) {
      return res.status(200).json({ success: true, message: 'Problem already unsolved' });
    }

    const index = user.progress.dsa.solvedProblems.indexOf(problemId);
    if (index > -1) {
      user.progress.dsa.solvedProblems.splice(index, 1);
      user.progress.dsa.solved = user.progress.dsa.solvedProblems.length;

      const activeProblems = await getActivePublishedProblems();
      const totalProblems = activeProblems.length;
      user.progress.overall = totalProblems > 0 ? Math.round((user.progress.dsa.solved / totalProblems) * 100) : 0;

      await user.save();
    }

    const activeProblems = await getActivePublishedProblems();
    const solvedProblemIds = user.progress.dsa.solvedProblems || [];
    const maxScore = calculateMaxScore(activeProblems);
    const userScore = calculateUserScore(solvedProblemIds, activeProblems);
    const progressPercent = activeProblems.length > 0 ? Math.round((solvedProblemIds.length / activeProblems.length) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'Problem marked as unsolved',
      progress: {
        solved: solvedProblemIds.length,
        total: activeProblems.length,
        progressPercent,
        solvedProblems: solvedProblemIds,
        score: {
          userScore,
          maxScore,
        },
      },
    });
  } catch (error) {
    console.error('Error marking problem unsolved:', error);
    res.status(500).json({ success: false, error: 'Failed to mark problem as unsolved' });
  }
};
