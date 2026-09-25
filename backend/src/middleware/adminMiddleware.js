import User from '../models/User.js';

/**
 * Admin Middleware
 *
 * Verifies that the authenticated user has 'admin' role in MongoDB.
 * Rejects requests from non-admin users with 403 Forbidden.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Access token missing or invalid.',
      });
    }

    const user = await User.findById(req.user.userId).select('role email');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization.',
    });
  }
};

export default requireAdmin;
