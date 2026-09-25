import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using the MONGODB_URI environment variable.
 * Exits the process if the URI is missing or the connection fails.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    // Log message only — never log the full URI or credentials
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  // Log disconnection events without exposing credentials
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });
};

export default connectDB;

