import mongoose from 'mongoose';

/**
 * PasswordResetOtp Schema
 *
 * Stores hashed 6-digit OTPs with expiration and attempt counters.
 * Uses a TTL index so expired records are automatically cleaned up.
 * NEVER stores plaintext OTPs.
 */
const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // SHA-256 hash of the 6-digit OTP
    otpHash: {
      type: String,
      required: true,
    },
    // Brute-force protection counter (max 5)
    attempts: {
      type: Number,
      default: 0,
    },
    // Expired timestamp with MongoDB TTL index for automatic deletion
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    // Track cooldown for resending OTP (60s)
    lastRequestedAt: {
      type: Date,
      default: Date.now,
    },
    // Single-use flag
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PasswordResetOtp = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);

export default PasswordResetOtp;
