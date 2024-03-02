import mongoose from 'mongoose';
import config from '../config';

export const connectDB = async () => {
    const mongoUri = config.db.mongoUri;
    try {
        await mongoose.connect(mongoUri, { connectTimeoutMS: 3000 });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        process.exit(1); // Optionally exit process on failure
    }
};

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});
