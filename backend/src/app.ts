import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { folderRoutes } from "./routes/folderRoutes.js";
import { pageRoutes } from "./routes/pageRoutes.js";

import { connectDatabase } from "./config/database.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// Middleware to check database connection status
app.use((request, response, next) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected && request.path !== "/health") {
    return response.status(503).json({
      message: "Database connection is offline. Please start your local MongoDB service."
    });
  }
  next();
});

app.get("/health", async (_request, response) => {
  let isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    await connectDatabase();
    isConnected = mongoose.connection.readyState === 1;
  }
  response.json({
    ok: isConnected,
    databaseConnected: isConnected,
    mongoUri: env.mongoUri,
  });
});

app.use("/folders", folderRoutes);
app.use("/pages", pageRoutes);
app.use(errorHandler);
