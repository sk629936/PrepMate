import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 *
 * Verifies JWT token from Authorization header (Bearer <token>).
 * Attaches decoded user payload ({ userId }) to req.user.
 * Rejects requests with missing or invalid token with HTTP 401.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Access token is missing or invalid.',
    });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
    });
  }
};

export default authenticate;
