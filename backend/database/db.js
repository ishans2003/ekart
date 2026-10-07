import mongoose from "mongoose";

const connectDB = async()=>{
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    await mongoose.connect(mongoUri, { dbName: "ekart" })
    console.log(`MongoDB connected successfully (database: ${mongoose.connection.name})`)
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    throw error
  }
}

export default connectDB
