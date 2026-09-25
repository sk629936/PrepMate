import User from '../models/User.js';
import { problems } from '../data/dsaProblems.js';
import AptitudeAttempt from '../models/AptitudeAttempt.js';
import AptitudeTestResult from '../models/AptitudeTestResult.js';

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // DSA progress (UNTOUCHED & PRESERVED)
    const totalDSAProblems = problems.length;
    const dsaSolved = user.progress?.dsa?.solved || (user.progress?.dsa?.solvedProblems?.length) || 0;
    const dsaPercent = totalDSAProblems > 0 ? Math.round((dsaSolved / totalDSAProblems) * 100) : 0;

    // Real Aptitude progress calculation for req.user.userId
    const userId = user._id;
    const aptitudeAttemptsCount = await AptitudeAttempt.countDocuments({ userId });
    const aptitudeCorrectCount = await AptitudeAttempt.countDocuments({ userId, isCorrect: true });
    const aptitudeAccuracy = aptitudeAttemptsCount > 0 ? Math.round((aptitudeCorrectCount / aptitudeAttemptsCount) * 100) : 0;

    const aptitudeTestsCompleted = await AptitudeTestResult.countDocuments({ userId });
    const recentAptitudeTests = await AptitudeTestResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title score accuracy totalQuestions createdAt')
      .lean();

    // Combined overall progress calculation
    const overallScore = Math.round((dsaPercent + (aptitudeAttemptsCount > 0 ? aptitudeAccuracy : 0)) / 2);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || 'user',
      },
      progress: {
        overall: overallScore,
        dsa: {
          solved: dsaSolved,
          total: totalDSAProblems,
          percent: dsaPercent,
          solvedProblems: user.progress?.dsa?.solvedProblems || [],
        },
        aptitude: {
          attempted: aptitudeAttemptsCount,
          correct: aptitudeCorrectCount,
          accuracy: aptitudeAccuracy,
          testsCompleted: aptitudeTestsCompleted,
          recentActivity: recentAptitudeTests,
        },
        coreCS: user.progress?.coreCS || { completed: 0 },
        interview: user.progress?.interview || { completed: 0 },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard data' });
  }
};
