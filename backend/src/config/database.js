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
    await mongoose.connect(mongoURI, {
      dbName: 'test',
    });
    console.log('MongoDB Atlas connected successfully to database: test');
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error.message);
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

