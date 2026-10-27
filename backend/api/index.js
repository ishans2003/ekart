import app from "../server.js";
import connectDB from "../database/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch {
    return res.status(503).json({
      success: false,
      message: "Server is running, but the database is not connected. Configure a reachable MongoDB URI in Vercel.",
      database: "disconnected",
    });
  }
}
