import express from "express";
import mongoose from "mongoose";
import connectDB from "./database/db.js";
import cors from "cors";
import userRoute from "./routes/userRoute.js"
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(cors({
  origin: (origin, callback) => {
    const configuredOrigin = process.env.FRONTEND_URL;
    if (!origin || origin === configuredOrigin) return callback(null, true);
    try {
      const url = new URL(origin);
      const localFrontend = url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      return callback(null, localFrontend);
    } catch {
      return callback(null, false);
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());

app.get("/", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "Server is running and connected to the database."
      : "Server is running, but the database is not connected.",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.use('/api/v1/user',userRoute)

//http://localhost:8000/api/v1/user/register
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch {
    console.error("Server startup stopped because MongoDB is unavailable.");
    process.exit(1);
  }
};

startServer();
