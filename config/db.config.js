import mongoose from 'mongoose';
import logError from '../Utils/errorLogger.js';

const connectToDB = async () => {
  try {
    const DB_NAME = process.env.DB_NAME || 'auth-system';
    const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

    // Connect to DB
    await mongoose.connect(MONGODB_URL, { dbName: DB_NAME });
    console.log('Successfully connected to Database!');
  } catch (err) {
    logError(err);
  }
};

export { connectToDB };
