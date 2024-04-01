import mongoose from 'mongoose';
import config from '../config';
import Logger from '../utils/logger';

export const connectDB = async () => {
    const mongoUri = config.db.mongoUri;
    try {
        await mongoose.connect(mongoUri, { connectTimeoutMS: 3000 });
        Logger.info(`MongoDB connected do DB ${config.db.mongoDb}`);
    } catch (err) {
        Logger.error(`Could not connect to MongoDB ${err}`);
        process.exit(1); // Optionally exit process on failure
    }
};

mongoose.connection.on('error', err => {
    Logger.error(`MongoDB connection error: ${err}`);
});
