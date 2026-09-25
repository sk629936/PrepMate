import User from '../models/User.js';
import { topics, problems, getProblemById, getSafeProblemData } from '../data/dsaProblems.js';

// Scoring weights: Easy = 1, Medium = 2, Hard = 3
const DIFFICULTY_WEIGHTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/**
 * Calculate max possible score across all active problems
 */

export const calculateMaxScore = () => {
  return problems.reduce((acc, p) => acc + (DIFFICULTY_WEIGHTS[p.difficulty] || 1), 0);
};

/**
 * Calculate user score based on solved problem IDs
 */
export const calculateUserScore = (solvedProblemIds = []) => {
  return solvedProblemIds.reduce((acc, id) => {
    const problem = getProblemById(id);
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

    // Safe problem dataset for frontend
    const safeProblems = problems.map(getSafeProblemData);

    // Compute topic progress from actual problem data
    const topicsWithCounts = topics.map(t => {
      const topicProblems = problems.filter(p => p.topic === t.id);
      const solvedCount = topicProblems.filter(p => solvedProblemIds.includes(p.id)).length;
      return {
        ...t,
        totalProblems: topicProblems.length,
        solvedProblemsCount: solvedCount,
      };
    });

    // Compute difficulty stats
    const difficultyStats = {
      Easy: {
        total: problems.filter(p => p.difficulty === 'Easy').length,
        solved: problems.filter(p => p.difficulty === 'Easy' && solvedProblemIds.includes(p.id)).length,
      },
      Medium: {
        total: problems.filter(p => p.difficulty === 'Medium').length,
        solved: problems.filter(p => p.difficulty === 'Medium' && solvedProblemIds.includes(p.id)).length,
      },
      Hard: {
        total: problems.filter(p => p.difficulty === 'Hard').length,
        solved: problems.filter(p => p.difficulty === 'Hard' && solvedProblemIds.includes(p.id)).length,
      },
    };

    // Calculate score
    const maxScore = calculateMaxScore();
    const userScore = calculateUserScore(solvedProblemIds);

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
    const problem = getProblemById(problemId);

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

    const problem = getProblemById(problemId);
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
      
      // Update overall progress percentage
      const totalProblems = problems.length;
      user.progress.overall = totalProblems > 0 ? Math.round((user.progress.dsa.solved / totalProblems) * 100) : 0;
      
      await user.save();
    }

    const solvedProblemIds = user.progress.dsa.solvedProblems;
    const maxScore = calculateMaxScore();
    const userScore = calculateUserScore(solvedProblemIds);
    const progressPercent = Math.round((solvedProblemIds.length / problems.length) * 100);

    res.status(200).json({
      success: true,
      message: 'Problem marked as solved',
      progress: {
        solved: solvedProblemIds.length,
        total: problems.length,
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

    const problem = getProblemById(problemId);
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
      
      const totalProblems = problems.length;
      user.progress.overall = totalProblems > 0 ? Math.round((user.progress.dsa.solved / totalProblems) * 100) : 0;

      await user.save();
    }

    const solvedProblemIds = user.progress.dsa.solvedProblems || [];
    const maxScore = calculateMaxScore();
    const userScore = calculateUserScore(solvedProblemIds);
    const progressPercent = Math.round((solvedProblemIds.length / problems.length) * 100);

    res.status(200).json({
      success: true,
      message: 'Problem marked as unsolved',
      progress: {
        solved: solvedProblemIds.length,
        total: problems.length,
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
