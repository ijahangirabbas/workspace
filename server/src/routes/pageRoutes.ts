import { Router } from "express";
import {
  createPage,
  deletePage,
  getPages,
  updatePage,
} from "../controllers/pageController.js";

export const pageRoutes = Router();

pageRoutes.get("/", getPages);
pageRoutes.post("/", createPage);
pageRoutes.patch("/:id", updatePage);
pageRoutes.delete("/:id", deletePage);
