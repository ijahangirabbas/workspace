import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { folderRoutes } from "./routes/folderRoutes.js";
import { pageRoutes } from "./routes/pageRoutes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/folders", folderRoutes);
app.use("/pages", pageRoutes);
app.use(errorHandler);
