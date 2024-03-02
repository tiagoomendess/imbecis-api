import { MongoClient } from 'mongodb';
import config from '../config';

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || config.db.mongoUri;
const MONGO_DB = process.env.MONGO_DB || config.db.mongoDb;

// MongoDB client
const client = new MongoClient(MONGO_URI);

// MongoDB connection
client.connect().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.log("Error connecting to mongodb: ", err));

// Set Database
const db = client.db(MONGO_DB);

// Export db
export default db;
