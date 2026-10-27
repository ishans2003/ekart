import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
  connectionPromise = mongoose.connect(mongoUri, {
    dbName: "ekart",
    serverSelectionTimeoutMS: 5000,
  }).then(() => {
    console.log(`MongoDB connected successfully (database: ${mongoose.connection.name})`);
    return mongoose.connection;
  }).catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }).finally(() => {
    connectionPromise = undefined;
  });

  return connectionPromise;
};

export default connectDB
