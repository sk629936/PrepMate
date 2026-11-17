import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PasswordResetOtp from '../models/PasswordResetOtp.js';
import { sendOtpEmail } from '../services/emailService.js';

// Salt rounds — 12 is OWASP-recommended for general web applications.
// Higher = slower hashing (better security). 12 balances security and UX.
const SALT_ROUNDS = 12;

/**
 * POST /api/auth/signup
 *
 * Validates input, checks for duplicate email, hashes the password,
 * creates the user in MongoDB Atlas, and returns a safe success response.
 *
 * NEVER returns or logs the plaintext password or the password hash.
 */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  // ── 1. Input validation (backend-independent of frontend) ──────────────────

  const validationErrors = [];

  // fullName: required, string, trim, min 2, max 100
  if (typeof fullName !== 'string' || fullName.trim().length < 2) {
    validationErrors.push('Full name must be at least 2 characters.');
  } else if (fullName.trim().length > 100) {
    validationErrors.push('Full name must not exceed 100 characters.');
  }

  // email: required, string, trim, lowercase, valid format
  if (typeof email !== 'string' || !email.trim()) {
    validationErrors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    validationErrors.push('Please provide a valid email address.');
  }

  // password: required, string, min 8 characters
  if (typeof password !== 'string' || !password) {
    validationErrors.push('Password is required.');
  } else if (password.length < 8) {
    validationErrors.push('Password must be at least 8 characters.');
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: validationErrors[0],
    });
  }

  // Normalise email and fullName after validation passes
  const normalisedEmail = email.trim().toLowerCase();
  const normalisedName = fullName.trim();

  // ── 2. Duplicate email check ───────────────────────────────────────────────

  const existingUser = await User.findOne({ email: normalisedEmail }).lean();

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  // ── 3. Hash the password ───────────────────────────────────────────────────
  // The plaintext password is used ONLY here and is never stored, logged,
  // returned in a response, or referenced after this line.

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ── 4. Create the user document ───────────────────────────────────────────
  // _id, createdAt, and updatedAt are managed automatically by Mongoose.

  const newUser = await User.create({
    fullName: normalisedName,
    email: normalisedEmail,
    password: hashedPassword,
  });

  // ── 5. Return a safe success response ─────────────────────────────────────
  // Only non-sensitive fields are returned. The password hash is NEVER included.

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
    },
  });
};

/**
 * POST /api/auth/login
 *
 * Validates credentials, verifies bcrypt password hash,
 * issues JWT token, and returns safe user information.
 *
 * Generic 401 on failure without revealing whether email exists.
 * NEVER returns password or password hash.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // ── 1. Input validation ───────────────────────────────────────────────────
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (typeof password !== 'string' || !password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required.',
    });
  }

  const normalisedEmail = email.trim().toLowerCase();

  // ── 2. Find user in MongoDB Atlas ─────────────────────────────────────────
  const user = await User.findOne({ email: normalisedEmail });

  if (!user) {
    // Generic error to prevent email enumeration
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // ── 3. Verify password with bcrypt ────────────────────────────────────────
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    // Generic error to prevent password guessing hints
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // ── 4. Generate JWT ───────────────────────────────────────────────────────
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }

  // Payload contains minimal identity information only
  const token = jwt.sign(
    { userId: user._id },
    jwtSecret,
    { expiresIn: '7d' }
  );

  // ── 5. Safe Success Response ──────────────────────────────────────────────
  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};

/**
 * GET /api/auth/me
 *
 * Returns safe information for the currently authenticated user.
 * Protected by authenticate middleware (req.user = { userId }).
 *
 * NEVER returns password or password hash.
 */
export const getMe = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. User ID not found in token payload.',
    });
  }

  const user = await User.findById(userId).select('-password').lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found.',
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};

/**
 * Helper: Computes SHA-256 hash of plaintext string
 */
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * POST /api/auth/forgot-password
 *
 * Generates a crypto-secure 6-digit OTP, stores its SHA-256 hash in MongoDB,
 * sends an email via Nodemailer, and returns a generic response to prevent user enumeration.
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  const normalisedEmail = email.trim().toLowerCase();

  // Generic success message to prevent email enumeration
  const genericSuccessResponse = {
    success: true,
    message: 'If an account exists for this email, a verification code has been sent.',
  };

  // Find user in MongoDB Atlas
  const user = await User.findOne({ email: normalisedEmail });

  if (!user) {
    // Return identical response even if user doesn't exist
    return res.status(200).json(genericSuccessResponse);
  }

  // Check resend cooldown (60 seconds)
  const existingOtp = await PasswordResetOtp.findOne({ email: normalisedEmail });
  if (existingOtp) {
    const elapsedSeconds = (Date.now() - new Date(existingOtp.lastRequestedAt).getTime()) / 1000;
    if (elapsedSeconds < 60) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code.',
      });
    }
  }

  // 1. Generate crypto-secure 6-digit OTP (100000 - 999999)
  const otpCode = crypto.randomInt(100000, 1000000).toString();

  // 2. Hash OTP using SHA-256
  const otpHash = hashString(otpCode);

  // 3. Expiration duration (default 10 mins)
  const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  // 4. Invalidate previous OTPs & save new hashed record
  await PasswordResetOtp.deleteMany({ email: normalisedEmail });

  await PasswordResetOtp.create({
    email: normalisedEmail,
    otpHash,
    attempts: 0,
    expiresAt,
    lastRequestedAt: new Date(),
    verified: false,
  });

  // 5. Send OTP email asynchronously
  await sendOtpEmail(normalisedEmail, otpCode, expiresMinutes);

  return res.status(200).json(genericSuccessResponse);
};

/**
 * POST /api/auth/verify-otp
 *
 * Verifies submitted 6-digit OTP against stored SHA-256 hash.
 * Enforces 10-min expiration and 5-attempt brute-force limit.
 * Issues a short-lived resetToken for Sub-Module 11 password reset.
 */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid 6-digit verification code.',
    });
  }

  const normalisedEmail = email.trim().toLowerCase();
  const submittedOtp = otp.trim();

  // Find latest active OTP record
  const otpRecord = await PasswordResetOtp.findOne({ email: normalisedEmail });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code. Please request a new one.',
    });
  }

  // Check if expired
  if (new Date() > new Date(otpRecord.expiresAt)) {
    await PasswordResetOtp.deleteOne({ _id: otpRecord._id });
    return res.status(400).json({
      success: false,
      message: 'This verification code has expired. Please request a new code.',
    });
  }

  // Check attempt count
  if (otpRecord.attempts >= 5) {
    await PasswordResetOtp.deleteOne({ _id: otpRecord._id });
    return res.status(429).json({
      success: false,
      message: 'Too many attempts. Please request a new code.',
    });
  }

  // Hash submitted OTP and compare
  const submittedHash = hashString(submittedOtp);

  if (submittedHash !== otpRecord.otpHash) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    const remaining = 5 - otpRecord.attempts;
    return res.status(400).json({
      success: false,
      message: remaining > 0 
        ? `Invalid verification code. ${remaining} attempt(s) remaining.` 
        : 'Too many attempts. Please request a new code.',
    });
  }

  // Valid OTP: mark as consumed
  otpRecord.verified = true;
  await PasswordResetOtp.deleteOne({ _id: otpRecord._id });

  // Generate short-lived reset authorization token (15 mins)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }

  const resetToken = jwt.sign(
    { email: normalisedEmail, purpose: 'password_reset' },
    jwtSecret,
    { expiresIn: '15m' }
  );

  return res.status(200).json({
    success: true,
    message: 'Verification code verified successfully.',
    resetToken,
  });
};

/**
 * POST /api/auth/resend-otp
 *
 * Resends a new crypto-secure 6-digit OTP with 60-second cooldown protection.
 */
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  const normalisedEmail = email.trim().toLowerCase();

  const genericResponse = {
    success: true,
    message: 'If an account exists for this email, a new verification code has been sent.',
  };

  const user = await User.findOne({ email: normalisedEmail });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Check 60-second cooldown
  const existingOtp = await PasswordResetOtp.findOne({ email: normalisedEmail });
  if (existingOtp) {
    const elapsedSeconds = (Date.now() - new Date(existingOtp.lastRequestedAt).getTime()) / 1000;
    if (elapsedSeconds < 60) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code.',
      });
    }
  }

  // Generate new OTP
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = hashString(otpCode);
  const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  await PasswordResetOtp.deleteMany({ email: normalisedEmail });

  await PasswordResetOtp.create({
    email: normalisedEmail,
    otpHash,
    attempts: 0,
    expiresAt,
    lastRequestedAt: new Date(),
    verified: false,
  });

  await sendOtpEmail(normalisedEmail, otpCode, expiresMinutes);

  return res.status(200).json(genericResponse);
};

/**
 * POST /api/auth/reset-password
 *
 * Verifies the short-lived resetToken (issued by verifyOtp).
 * Validates the new password, bcrypt-hashes it, and updates the
 * User document in MongoDB Atlas.
 *
 * The resetToken must have purpose === 'password_reset'.
 * It is NOT a login JWT and MUST NOT authenticate the user.
 * NEVER stores or returns the plaintext password or hash.
 */
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // ── 1. Validate inputs ────────────────────────────────────────────────────

  if (!resetToken || typeof resetToken !== 'string' || !resetToken.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required.',
    });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'New password is required.',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters.',
    });
  }

  // ── 2. Verify JWT reset token ─────────────────────────────────────────────

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken.trim(), jwtSecret);
  } catch (error) {
    // Handles: expired token, invalid signature, malformed token
    return res.status(401).json({
      success: false,
      message: 'Your password reset session has expired. Please request a new OTP.',
    });
  }

  // ── 3. Verify token purpose ───────────────────────────────────────────────
  // This token must NOT be a login JWT or any other kind of token.

  if (decoded.purpose !== 'password_reset') {
    return res.status(401).json({
      success: false,
      message: 'Your password reset session has expired. Please request a new OTP.',
    });
  }

  const normalisedEmail = decoded.email?.trim().toLowerCase();
  if (!normalisedEmail) {
    return res.status(401).json({
      success: false,
      message: 'Your password reset session has expired. Please request a new OTP.',
    });
  }

  // ── 4. Find user in MongoDB Atlas ─────────────────────────────────────────

  const user = await User.findOne({ email: normalisedEmail });

  if (!user) {
    // User may have been deleted after token was issued
    return res.status(404).json({
      success: false,
      message: 'Your password reset session has expired. Please request a new OTP.',
    });
  }

  // ── 5. Hash new password ──────────────────────────────────────────────────
  // Plaintext password used ONLY here; never stored, logged, or returned.

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // ── 6. Update user's password in MongoDB Atlas ────────────────────────────
  // Mongoose will automatically update updatedAt via the timestamps option.

  user.password = hashedPassword;
  await user.save();

  // ── 7. Safe success response ──────────────────────────────────────────────
  return res.status(200).json({
    success: true,
    message: 'Password reset successfully.',
  });
};
