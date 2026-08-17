import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  try {
    // Set connection timeout to 3 seconds for faster feedback
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("Connected to MongoDB successfully.");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false;
  }
}

