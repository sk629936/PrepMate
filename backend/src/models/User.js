import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },

    progress: {
      overall: { type: Number, default: 0 },
      dsa: {
        solved: { type: Number, default: 0 },
        solvedProblems: [{ type: String }]
      },
      aptitude: {
        testsCompleted: { type: Number, default: 0 }
      },
      coreCS: {
        completed: { type: Number, default: 0 }
      },
      interview: {
        completed: { type: Number, default: 0 }
      }
    },

    // Stored as a hashed string — hashing is implemented in the Signup API sub-module.
    // NEVER store or accept plaintext passwords here.
    password: {
      type: String,
      required: [true, 'Password is required'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    // Automatically manages createdAt and updatedAt timestamps
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
