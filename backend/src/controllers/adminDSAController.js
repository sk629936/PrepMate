import DSAProblem from '../models/DSAProblem.js';
import User from '../models/User.js';
import { topics } from '../data/dsaProblems.js';
import { seedDSAProblemsIfEmpty } from '../data/seedDSAProblems.js';

const LEETCODE_URL_REGEX = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[a-z0-9-]+\/?.*$/i;

/**
 * Normalizes LeetCode URL to lowercase base path (without query params / trailing slashes) for comparison
 */
function normalizeLeetCodeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    return `${parsed.origin}${parsed.pathname.toLowerCase().replace(/\/+$/, '')}/`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * GET /api/admin/dsa/problems
 *
 * List all DSA problems for admin management with filters and aggregated statistics.
 */
export const getAdminDSAProblems = async (req, res) => {
  try {
    await seedDSAProblemsIfEmpty();

    const { search, topic, difficulty, isPublished, isActive, sort = 'order' } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { id: { $regex: search.trim(), $options: 'i' } },
        { leetcodeUrl: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (topic && topic !== 'All') {
      query.topic = topic;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (typeof isPublished !== 'undefined' && isPublished !== 'All') {
      query.isPublished = isPublished === 'true' || isPublished === true;
    }

    if (typeof isActive !== 'undefined' && isActive !== 'All') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    // Sort configuration
    let sortOptions = { order: 1, createdAt: 1 };
    if (sort === 'title') sortOptions = { title: 1 };
    if (sort === 'difficulty') sortOptions = { difficulty: 1 };
    if (sort === 'topic') sortOptions = { topic: 1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const problems = await DSAProblem.find(query).sort(sortOptions).lean();

    // Aggregated statistics across all problems in database
    const allProblems = await DSAProblem.find({}).select('topic difficulty isPublished isActive').lean();

    const stats = {
      total: allProblems.length,
      published: allProblems.filter((p) => p.isPublished).length,
      unpublished: allProblems.filter((p) => !p.isPublished).length,
      active: allProblems.filter((p) => p.isActive).length,
      inactive: allProblems.filter((p) => !p.isActive).length,
      byDifficulty: {
        Easy: allProblems.filter((p) => p.difficulty === 'Easy').length,
        Medium: allProblems.filter((p) => p.difficulty === 'Medium').length,
        Hard: allProblems.filter((p) => p.difficulty === 'Hard').length,
      },
    };

    res.status(200).json({
      success: true,
      problems,
      stats,
      topics,
    });
  } catch (error) {
    console.error('Error fetching admin DSA problems:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch DSA problems' });
  }
};

/**
 * POST /api/admin/dsa/problems
 *
 * Add a new DSA problem with LeetCode URL and metadata.
 */
export const createDSAProblem = async (req, res) => {
  try {
    await seedDSAProblemsIfEmpty();

    const { title, topic, difficulty, leetcodeUrl, order, isPublished = true, isActive = true, statement, examples, constraints } = req.body;

    // 1. Validation
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Problem title must be at least 2 characters.' });
    }

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required.' });
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Difficulty must be Easy, Medium, or Hard.' });
    }

    if (!leetcodeUrl || typeof leetcodeUrl !== 'string' || !LEETCODE_URL_REGEX.test(leetcodeUrl.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid official LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/).',
      });
    }

    const normalizedUrl = normalizeLeetCodeUrl(leetcodeUrl);

    // 2. Prevent duplicate LeetCode URLs
    const existingUrl = await DSAProblem.findOne({
      leetcodeUrl: { $regex: new RegExp(`^${normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
    });

    if (existingUrl) {
      return res.status(409).json({
        success: false,
        error: `A problem with this LeetCode URL already exists: "${existingUrl.title}" (${existingUrl.id}).`,
      });
    }

    // 3. Determine display order
    let finalOrder = Number(order);
    if (isNaN(finalOrder) || finalOrder < 1) {
      const maxOrderProblem = await DSAProblem.findOne({}).sort({ order: -1 }).select('order');
      finalOrder = (maxOrderProblem?.order || 0) + 1;
    }

    // 4. Generate clean problem ID
    const topicPrefix = topic.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'dsa';
    const uniqueSuffix = Date.now().toString(36).slice(-4);
    const generatedId = `${topicPrefix}-${uniqueSuffix}`;

    const newProblem = await DSAProblem.create({
      id: generatedId,
      title: title.trim(),
      topic: topic.trim().toLowerCase(),
      difficulty,
      leetcodeUrl: normalizedUrl,
      order: finalOrder,
      isPublished: Boolean(isPublished),
      isActive: Boolean(isActive),
      statement: statement?.trim() || '',
      examples: Array.isArray(examples) ? examples : [],
      constraints: Array.isArray(constraints) ? constraints : [],
    });

    res.status(201).json({
      success: true,
      message: 'DSA problem created successfully.',
      problem: newProblem,
    });
  } catch (error) {
    console.error('Error creating DSA problem:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create DSA problem.' });
  }
};

/**
 * PUT /api/admin/dsa/problems/:id
 *
 * Update an existing DSA problem's metadata.
 */
export const updateDSAProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, topic, difficulty, leetcodeUrl, order, isPublished, isActive, statement, examples, constraints } = req.body;

    const problem = await DSAProblem.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    // Validation
    if (title && (typeof title !== 'string' || title.trim().length < 2)) {
      return res.status(400).json({ success: false, error: 'Problem title must be at least 2 characters.' });
    }

    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Difficulty must be Easy, Medium, or Hard.' });
    }

    if (leetcodeUrl) {
      if (typeof leetcodeUrl !== 'string' || !LEETCODE_URL_REGEX.test(leetcodeUrl.trim())) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid official LeetCode problem URL.',
        });
      }

      const normalizedUrl = normalizeLeetCodeUrl(leetcodeUrl);
      const duplicateUrl = await DSAProblem.findOne({
        _id: { $ne: problem._id },
        leetcodeUrl: { $regex: new RegExp(`^${normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
      });

      if (duplicateUrl) {
        return res.status(409).json({
          success: false,
          error: `Another problem already uses this LeetCode URL: "${duplicateUrl.title}".`,
        });
      }

      problem.leetcodeUrl = normalizedUrl;
    }

    if (title) problem.title = title.trim();
    if (topic) problem.topic = topic.trim().toLowerCase();
    if (difficulty) problem.difficulty = difficulty;
    if (typeof order !== 'undefined' && !isNaN(Number(order))) problem.order = Number(order);
    if (typeof isPublished !== 'undefined') problem.isPublished = Boolean(isPublished);
    if (typeof isActive !== 'undefined') problem.isActive = Boolean(isActive);
    if (typeof statement === 'string') problem.statement = statement.trim();
    if (Array.isArray(examples)) problem.examples = examples;
    if (Array.isArray(constraints)) problem.constraints = constraints;

    await problem.save();

    res.status(200).json({
      success: true,
      message: 'DSA problem updated successfully.',
      problem,
    });
  } catch (error) {
    console.error('Error updating DSA problem:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update DSA problem.' });
  }
};

/**
 * PATCH /api/admin/dsa/problems/:id/publish
 *
 * Toggle published status of a problem.
 */
export const togglePublishDSAProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await DSAProblem.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    problem.isPublished = !problem.isPublished;
    await problem.save();

    res.status(200).json({
      success: true,
      message: `Problem "${problem.title}" is now ${problem.isPublished ? 'published' : 'unpublished'}.`,
      isPublished: problem.isPublished,
      problem,
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ success: false, error: 'Failed to update publish status.' });
  }
};

/**
 * PATCH /api/admin/dsa/problems/:id/active
 *
 * Toggle active status of a problem.
 */
export const toggleActiveDSAProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await DSAProblem.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    problem.isActive = !problem.isActive;
    await problem.save();

    res.status(200).json({
      success: true,
      message: `Problem "${problem.title}" is now ${problem.isActive ? 'active' : 'inactive'}.`,
      isActive: problem.isActive,
      problem,
    });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ success: false, error: 'Failed to update active status.' });
  }
};

/**
 * DELETE /api/admin/dsa/problems/:id
 *
 * Safely delete a problem. If historical user solved records reference this problem,
 * soft-deletes (sets isActive = false, isPublished = false) to prevent corrupting user progress.
 */
export const deleteDSAProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await DSAProblem.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    // Check if any user in MongoDB has solved this problem
    const usersWithSolvedRecord = await User.countDocuments({
      'progress.dsa.solvedProblems': problem.id,
    });

    if (usersWithSolvedRecord > 0) {
      // Soft-delete to preserve user progress history
      problem.isActive = false;
      problem.isPublished = false;
      await problem.save();

      return res.status(200).json({
        success: true,
        softDeleted: true,
        message: `Problem has ${usersWithSolvedRecord} user solved record(s). It has been marked inactive & unpublished to protect user progress history.`,
        problem,
      });
    }

    // No user has solved this problem -> safe for hard deletion
    await DSAProblem.deleteOne({ _id: problem._id });

    res.status(200).json({
      success: true,
      softDeleted: false,
      message: 'Problem deleted successfully.',
      deletedId: problem.id,
    });
  } catch (error) {
    console.error('Error deleting DSA problem:', error);
    res.status(500).json({ success: false, error: 'Failed to delete problem.' });
  }
};
